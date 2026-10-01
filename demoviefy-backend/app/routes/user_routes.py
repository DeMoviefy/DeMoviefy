from flask import Blueprint

from app.controllers.user_controller import register_user

user_bp = Blueprint("user", __name__)
user_bp.add_url_rule("/users", view_func=register_user, methods=["POST"])