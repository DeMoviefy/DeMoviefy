from flask import Blueprint

from app.controllers.video_controller import get_system_version, home

system_bp = Blueprint("system", __name__)
system_bp.add_url_rule("/system/version", view_func=get_system_version, methods=["GET"])
system_bp.add_url_rule("/", view_func=home, methods=["GET"])
