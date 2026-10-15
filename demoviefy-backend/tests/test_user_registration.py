from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from http.cookies import SimpleCookie
import os
import unittest
from unittest.mock import patch

from werkzeug.security import check_password_hash

from app import create_app, db
from app.models.user import User
from app.models.video import Video
from app.repositories.video_repository import create_video


class UserRegistrationTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite://",
            "ADMIN_USER_ID": None,
        })
        self.client = self.app.test_client()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            db.engine.dispose()

    def test_registers_user_with_hashed_password(self):
        response = self.client.post("/users", json={
            "nome": "Ana Silva",
            "email": "ANA@example.com",
            "senha": "senha-segura-123",
            "senha_confirmada": "senha-segura-123",
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["email"], "ana@example.com")
        self.assertNotIn("senha", response.get_json())
        with self.app.app_context():
            user = User.query.one()
            self.assertNotEqual(user.senha, "senha-segura-123")
            self.assertTrue(check_password_hash(user.senha, "senha-segura-123"))

    def test_rejects_duplicate_email(self):
        payload = {
            "nome": "Ana",
            "email": "ana@example.com",
            "senha": "senha-segura-123",
            "senha_confirmada": "senha-segura-123",
        }
        self.client.post("/users", json=payload)

        response = self.client.post("/users", json={**payload, "email": "ANA@example.com"})

        self.assertEqual(response.status_code, 409)

    def test_rejects_short_password(self):
        response = self.client.post("/users", json={
            "nome": "Ana",
            "email": "ana@example.com",
            "senha": "curta",
            "senha_confirmada": "curta",
        })

        self.assertEqual(response.status_code, 400)

    def test_login_creates_session_and_returns_user(self):
        self.client.post("/users", json={
            "nome": "Ana Silva",
            "email": "ana@example.com",
            "senha": "senha-segura-123",
            "senha_confirmada": "senha-segura-123",
        })

        response = self.client.post("/users/login", json={
            "email": "ANA@example.com",
            "senha": "senha-segura-123",
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"]["email"], "ana@example.com")
        self.assertNotIn("senha", response.get_json()["user"])
        current_user = self.client.get("/users/me")
        self.assertEqual(current_user.status_code, 200)
        self.assertEqual(current_user.get_json()["email"], "ana@example.com")

    def test_video_endpoints_create_a_guest_session_without_login(self):
        response = self.client.get("/videos")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), [])
        self.assertTrue(self.client.get("/users/session").get_json()["is_guest"])

        self.client.post("/users", json={
            "nome": "Ana Silva",
            "email": "ana@example.com",
            "senha": "senha-segura-123",
            "senha_confirmada": "senha-segura-123",
        })
        self.client.post("/users/login", json={
            "email": "ana@example.com",
            "senha": "senha-segura-123",
        })
        self.assertFalse(self.client.get("/users/session").get_json()["is_guest"])

    def test_guest_cookie_has_configured_thirty_minute_lifetime(self):
        now = datetime.now(timezone.utc)
        response = self.client.get("/users/session")

        self.assertEqual(
            self.app.config["PERMANENT_SESSION_LIFETIME"],
            timedelta(minutes=30),
        )
        cookie_headers = response.headers.getlist("Set-Cookie")
        session_cookie = next(
            header for header in cookie_headers
            if header.startswith("demoviefy_session=")
        )
        parsed_cookie = SimpleCookie()
        parsed_cookie.load(session_cookie)
        cookie = parsed_cookie["demoviefy_session"]
        self.assertTrue(cookie["httponly"])
        self.assertEqual(cookie["samesite"], "Lax")
        self.assertTrue(cookie["expires"])
        expires_at = parsedate_to_datetime(cookie["expires"])
        remaining_lifetime = expires_at - now
        self.assertGreaterEqual(remaining_lifetime, timedelta(minutes=29))
        self.assertLessEqual(remaining_lifetime, timedelta(minutes=30))
        self.assertFalse(cookie["secure"])

    def test_cookie_settings_can_be_configured_for_https_and_custom_lifetime(self):
        with patch.dict(os.environ, {
            "DEMOVIEFY_SESSION_LIFETIME_MINUTES": "5",
            "DEMOVIEFY_SESSION_COOKIE_SECURE": "true",
        }):
            app = create_app({
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": "sqlite://",
                "ADMIN_USER_ID": None,
            })

        try:
            self.assertEqual(
                app.config["PERMANENT_SESSION_LIFETIME"],
                timedelta(minutes=5),
            )
            response = app.test_client().get("/users/session")
            session_cookie = next(
                header for header in response.headers.getlist("Set-Cookie")
                if header.startswith("demoviefy_session=")
            )
            parsed_cookie = SimpleCookie()
            parsed_cookie.load(session_cookie)
            cookie = parsed_cookie["demoviefy_session"]
            self.assertTrue(cookie["secure"])
            self.assertTrue(cookie["httponly"])
            self.assertEqual(cookie["samesite"], "Lax")
        finally:
            with app.app_context():
                db.session.remove()
                db.drop_all()
                db.engine.dispose()

    def test_login_transfers_the_same_guest_session_videos_into_the_account(self):
        registration = self.client.post("/users", json={
            "nome": "Ana Silva",
            "email": "ana@example.com",
            "senha": "senha-segura-123",
            "senha_confirmada": "senha-segura-123",
        })
        user_id = registration.get_json()["id"]

        guest_client = self.app.test_client()
        self.assertTrue(guest_client.get("/users/session").get_json()["is_guest"])
        with guest_client.session_transaction() as browser_session:
            guest_token = browser_session["guest_token"]
        with self.app.app_context():
            guest_video = create_video(
                filename="guest_transfer.mp4",
                guest_token=guest_token,
            )
            guest_video_id = guest_video.id

        login = guest_client.post("/users/login", json={
            "email": "ana@example.com",
            "senha": "senha-segura-123",
        })

        self.assertEqual(login.status_code, 200)
        self.assertEqual(
            [video["id"] for video in guest_client.get("/videos").get_json()],
            [guest_video_id],
        )
        with self.app.app_context():
            video = db.session.get(Video, guest_video_id)
            self.assertEqual(video.user_id, user_id)
            self.assertIsNone(video.guest_token)

    def test_rejects_invalid_login_credentials(self):
        self.client.post("/users", json={
            "nome": "Ana Silva",
            "email": "ana@example.com",
            "senha": "senha-segura-123",
            "senha_confirmada": "senha-segura-123",
        })

        response = self.client.post("/users/login", json={
            "email": "ana@example.com",
            "senha": "senha-incorreta",
        })

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"], "E-mail ou senha incorretos.")
        self.assertEqual(self.client.get("/users/me").status_code, 401)


if __name__ == "__main__":
    unittest.main()