import secrets

from flask import Blueprint, current_app, g, jsonify, request, session
from app import db
from app.models.user import User
from app.models.video import Video
from app.repositories.video_repository import count_guest_videos

from app.controllers.video_controller import (
    cancel_video_processing_by_id,
    delete_video_analysis_by_id,
    delete_video_by_id,
    delete_video_transcription_by_id,
    generate_video_transcription_by_id,
    get_annotated_video_file,
    get_video_analysis,
    get_video_details,
    get_video_file,
    get_video_transcription,
    list_videos,
    reprocess_video_by_id,
    save_video_transcription_by_id,
    translate_video_transcription_by_id,
    update_video_ai_config,
    update_video_status,
    upload_video,
)

video_bp = Blueprint("video", __name__)
GUEST_VIDEO_LIMIT = 3


@video_bp.before_request
def require_video_access():
    if request.method == "OPTIONS":
        return

    session.permanent = True
    user_id = session.get("user_id")
    user = db.session.get(User, user_id) if user_id else None
    g.video_user = user
    g.video_is_admin = user is not None and user.id == current_app.config.get("ADMIN_USER_ID")
    if user is None:
        session.pop("user_id", None)
        guest_token = session.get("guest_token")
        if not guest_token:
            guest_token = secrets.token_urlsafe(32)
            session["guest_token"] = guest_token
        g.video_guest_token = guest_token
    else:
        g.video_guest_token = None

    video_id = (request.view_args or {}).get("video_id")
    if video_id is not None and not g.video_is_admin:
        owner_filter = (
            {"user_id": user.id}
            if user is not None
            else {"guest_token": g.video_guest_token}
        )
        owned_video = Video.query.filter_by(id=video_id, **owner_filter).first()
        if owned_video is None:
            return jsonify({"error": "Vídeo não encontrado."}), 404

    if request.method == "POST" and request.path == "/videos" and user is None:
        if count_guest_videos(g.video_guest_token) >= GUEST_VIDEO_LIMIT:
            return jsonify({
                "error": "Você atingiu o limite de 3 vídeos como convidado. Entre ou crie uma conta para continuar.",
                "code": "guest_video_limit_reached",
            }), 403


video_bp.add_url_rule("/videos", view_func=upload_video, methods=["POST"])
video_bp.add_url_rule("/videos", view_func=list_videos, methods=["GET"])
video_bp.add_url_rule("/videos/<int:video_id>", view_func=get_video_details, methods=["GET"])
video_bp.add_url_rule("/videos/<int:video_id>/file", view_func=get_video_file, methods=["GET"])
video_bp.add_url_rule("/videos/<int:video_id>/annotated-file", view_func=get_annotated_video_file, methods=["GET"])
video_bp.add_url_rule("/videos/<int:video_id>", view_func=update_video_status, methods=["PATCH"])
video_bp.add_url_rule("/videos/<int:video_id>", view_func=delete_video_by_id, methods=["DELETE"])
video_bp.add_url_rule("/videos/<int:video_id>/analysis", view_func=get_video_analysis, methods=["GET"])
video_bp.add_url_rule("/videos/<int:video_id>/analysis", view_func=delete_video_analysis_by_id, methods=["DELETE"])
video_bp.add_url_rule("/videos/<int:video_id>/transcription", view_func=get_video_transcription, methods=["GET"])
video_bp.add_url_rule("/videos/<int:video_id>/transcription", view_func=save_video_transcription_by_id, methods=["PUT"])
video_bp.add_url_rule("/videos/<int:video_id>/transcription/translate", view_func=translate_video_transcription_by_id, methods=["POST"])
video_bp.add_url_rule("/videos/<int:video_id>/transcription", view_func=delete_video_transcription_by_id, methods=["DELETE"])
video_bp.add_url_rule("/videos/<int:video_id>/transcription/generate", view_func=generate_video_transcription_by_id, methods=["POST"])
video_bp.add_url_rule("/videos/<int:video_id>/ai-config", view_func=update_video_ai_config, methods=["PUT"])
video_bp.add_url_rule("/videos/<int:video_id>/reprocess", view_func=reprocess_video_by_id, methods=["POST"])
video_bp.add_url_rule("/videos/<int:video_id>/cancel", view_func=cancel_video_processing_by_id, methods=["POST"])
