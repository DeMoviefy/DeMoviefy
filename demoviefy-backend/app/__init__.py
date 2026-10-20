import os
import secrets
from dotenv import load_dotenv
from datetime import timedelta
from pathlib import Path
from time import sleep

from flask import Flask, current_app, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from app.config.ai_settings import load_frame_ai_settings
from app.config.paths import (
    ANALYSIS_DIR,
    ANNOTATED_DIR,
    TRANSCRIPTION_ENV_DIR,
    TRANSCRIPTIONS_DIR,
    UPLOADS_DIR,
    ensure_storage_dirs,
)
from app.config.versioning import API_CONTRACT_VERSION, BACKEND_APP_VERSION
from app.services.metadata_migration_service import migrate_metadata_files

load_dotenv()
db = SQLAlchemy()


def create_app(test_config: dict | None = None):
    """Create the Flask application, optionally with isolated test settings."""
    app = Flask(__name__)
    app.secret_key = os.environ.get("DEMOVIEFY_SECRET_KEY") or _load_session_secret_key(
        app.instance_path
    )
    ai_settings = load_frame_ai_settings()
    admin_user_id = os.environ.get("DEMOVIEFY_ADMIN_USER_ID")
    try:
        admin_user_id = int(admin_user_id) if admin_user_id else None
    except ValueError as exc:
        raise ValueError("DEMOVIEFY_ADMIN_USER_ID must be a positive integer.") from exc
    if admin_user_id is not None and admin_user_id < 1:
        raise ValueError("DEMOVIEFY_ADMIN_USER_ID must be a positive integer.")
    session_lifetime_minutes = _positive_int_environment_setting(
        "DEMOVIEFY_SESSION_LIFETIME_MINUTES",
        default=30,
    )
    session_cookie_secure = os.environ.get(
        "DEMOVIEFY_SESSION_COOKIE_SECURE",
        "false",
    ).strip().lower() in {"1", "true", "yes", "on"}

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///demoviefy.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["ADMIN_USER_ID"] = admin_user_id
    app.config["SESSION_COOKIE_NAME"] = "demoviefy_session"
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SECURE"] = session_cookie_secure
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(
        minutes=session_lifetime_minutes
    )
    app.config["SESSION_REFRESH_EACH_REQUEST"] = True
    app.config["UPLOADS_DIR"] = str(UPLOADS_DIR)
    app.config["ANALYSIS_DIR"] = str(ANALYSIS_DIR)
    app.config["ANNOTATED_DIR"] = str(ANNOTATED_DIR)
    app.config["TRANSCRIPTIONS_DIR"] = str(TRANSCRIPTIONS_DIR)
    app.config["FRAME_AI_FRAME_STRIDE"] = ai_settings.frame_stride
    app.config["FRAME_AI_CONFIDENCE"] = ai_settings.confidence
    app.config["FRAME_AI_MAX_FRAMES"] = ai_settings.max_frames
    app.config["AUTO_TRANSCRIPTION_ENABLED"] = os.environ.get("AUTO_TRANSCRIPTION_ENABLED", "true").lower() == "true"
    app.config["VIDEO_PROCESSING_WORKERS"] = int(os.environ.get("VIDEO_PROCESSING_WORKERS", "3"))
    app.config["VIDEO_QUEUE_MAX_SIZE"] = int(os.environ.get("VIDEO_QUEUE_MAX_SIZE", "100"))
    app.config["TRANSCRIPTION_MODEL"] = "base"
    app.config["TRANSCRIPTION_LANGUAGE"] = None
    app.config["TRANSCRIPTION_ENV_DIR"] = str(TRANSCRIPTION_ENV_DIR)
    app.config["TRANSCRIPTION_PYTHON"] = os.environ.get("DEMOVIEFY_TRANSCRIPTION_PYTHON")
    app.config["BACKEND_APP_VERSION"] = BACKEND_APP_VERSION
    app.config["API_CONTRACT_VERSION"] = API_CONTRACT_VERSION
    app.config["RECAPTCHA_ENABLED"] = os.environ.get(
        "DEMOVIEFY_RECAPTCHA_ENABLED", "true"
    ).strip().lower() not in {"0", "false", "no", "off"}

    if test_config:
        app.config.update(test_config)

    allowed_origins = [
        origin.strip()
        for origin in os.environ.get(
            "DEMOVIEFY_FRONTEND_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    CORS(app, origins=allowed_origins, supports_credentials=True)
    db.init_app(app)
    ensure_storage_dirs()

    from .routes.ai_routes import ai_bp
    from .routes.system_routes import system_bp
    from .routes.user_routes import user_bp
    from .routes.video_routes import video_bp

    app.register_blueprint(ai_bp)
    app.register_blueprint(system_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(video_bp)

    # Criar banco automaticamente
    with app.app_context():
        from app.models import user as _user
        from app.models.video import Video

        db.create_all()
        _purge_guest_videos()
        migrate_metadata_files(video_ids=[video.id for video in Video.query.all()], logger=app.logger)

    from flask import jsonify

    @app.errorhandler(ValueError)
    def handle_value_error(e):
        app.logger.warning("validation_failed path=%s error=%s", request.path, e)
        return jsonify({"error": str(e)}), 400

    @app.errorhandler(FileNotFoundError)
    def handle_not_found_error(e):
        app.logger.warning("file_not_found error=%s", e)
        return jsonify({"error": "Arquivo não encontrado"}), 404

    return app


def _load_session_secret_key(instance_path: str) -> str:
    """Reuse a local signing key across app workers when no key is configured."""
    secret_path = Path(instance_path) / "demoviefy-session-secret"
    secret_path.parent.mkdir(parents=True, exist_ok=True)

    for _ in range(100):
        try:
            descriptor = os.open(
                secret_path,
                os.O_CREAT | os.O_EXCL | os.O_WRONLY,
                0o600,
            )
        except FileExistsError:
            try:
                secret = secret_path.read_text(encoding="utf-8").strip()
            except FileNotFoundError:
                continue
            if secret:
                return secret
            sleep(0.01)
            continue

        secret = secrets.token_urlsafe(32)
        with os.fdopen(descriptor, "w", encoding="utf-8") as secret_file:
            secret_file.write(secret)
            secret_file.flush()
            os.fsync(secret_file.fileno())
        return secret

    raise RuntimeError(
        f"Could not initialize the Flask session secret at {secret_path}."
    )


def _positive_int_environment_setting(name: str, *, default: int) -> int:
    raw_value = os.environ.get(name)
    if raw_value is None or not raw_value.strip():
        return default
    try:
        value = int(raw_value)
    except ValueError as exc:
        raise ValueError(f"{name} must be a positive integer.") from exc
    if value <= 0:
        raise ValueError(f"{name} must be a positive integer.")
    return value


def _purge_guest_videos() -> None:
    """Remove temporary guest records and artifacts when the backend starts."""
    from app.models.video import Video
    from app.services.video_artifact_service import delete_video_artifacts

    guest_videos = Video.query.filter(Video.guest_token.isnot(None)).all()
    for video in guest_videos:
        delete_video_artifacts(video.id, video.filename, logger=current_app.logger)
        db.session.delete(video)
    if guest_videos:
        db.session.commit()
        current_app.logger.info("guest_videos:startup_cleanup count=%s", len(guest_videos))
