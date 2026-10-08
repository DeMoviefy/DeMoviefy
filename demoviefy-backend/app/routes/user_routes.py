from flask import Blueprint
from app.controllers.user_controller import register_user, login_user, get_current_user

user_bp = Blueprint("user", __name__)
user_bp.add_url_rule("/users", view_func=register_user, methods=["POST"])
user_bp.add_url_rule("/users/login", view_func=login_user, methods=["POST"])
user_bp.add_url_rule("/users/me", view_func=get_current_user, methods=["GET"])