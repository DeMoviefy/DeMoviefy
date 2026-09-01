from flask import Blueprint

from app.controllers.video_controller import list_ai_models

ai_bp = Blueprint("ai", __name__)
ai_bp.add_url_rule("/ai/models", view_func=list_ai_models, methods=["GET"])
