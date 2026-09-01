"""Route blueprints exported by the Flask app."""

from .ai_routes import ai_bp
from .system_routes import system_bp
from .video_routes import video_bp

__all__ = ["ai_bp", "system_bp", "video_bp"]
