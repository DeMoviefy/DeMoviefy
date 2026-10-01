import unittest

from werkzeug.security import check_password_hash

from app import create_app, db
from app.models.user import User


class UserRegistrationTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite://",
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
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["email"], "ana@example.com")
        self.assertNotIn("senha", response.get_json())
        with self.app.app_context():
            user = User.query.one()
            self.assertNotEqual(user.senha, "senha-segura-123")
            self.assertTrue(check_password_hash(user.senha, "senha-segura-123"))

    def test_rejects_duplicate_email(self):
        payload = {"nome": "Ana", "email": "ana@example.com", "senha": "senha-segura-123"}
        self.client.post("/users", json=payload)

        response = self.client.post("/users", json={**payload, "email": "ANA@example.com"})

        self.assertEqual(response.status_code, 409)

    def test_rejects_short_password(self):
        response = self.client.post("/users", json={
            "nome": "Ana",
            "email": "ana@example.com",
            "senha": "curta",
        })

        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()