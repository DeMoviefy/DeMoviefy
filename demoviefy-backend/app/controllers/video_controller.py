from fileinput import filename
import mimetypes
from pathlib import Path

from flask import current_app, jsonify, request, send_file
from werkzeug.utils import secure_filename

from app.config.ai_settings import load_frame_ai_settings
from app.config.paths import (
    analysis_file_path,
    annotated_video_path,
    annotated_video_temp_path,
    ensure_storage_dirs,
    TRANSCRIPTIONS_DIR,
    to_repo_relative,
    transcription_file_path,
    unique_video_file_path,
    video_file_path,
)
from app.config.versioning import build_version_payload
from app.repositories.video_repository import (
    VALID_VIDEO_STATUSES,
    create_video,
    delete_video,
    get_video,
    list_videos as list_videos_repo,
    update_job_id,
    update_status,
)
from app.services.ai_catalog_service import get_model_by_relative_path, list_available_models, resolve_ai_config
from app.services.frame_ai_service import (
    delete_analysis_artifacts,
    delete_analysis_variant,
    has_analysis,
    has_annotated_video,
    list_analysis_variants,
    load_analysis,
    resolve_annotated_video_for_web,
)
from app.services.job_queue_service import get_job_queue
from app.services.transcription_service import transcribe_video_with_timestamps, whisper_available
from app.services.translation_service import translate_segments
from app.services.video_artifact_service import (
    delete_analysis,
    delete_metadata,
    delete_transcription,
    has_transcription,
    load_ai_config,
    load_processing_state,
    load_transcription,
    save_ai_config,
    save_processing_state,
    save_transcription,
)
from app.validators.video_validators import (
    parse_clip_selection,
    parse_runtime_settings,
    validate_filename,
)

from app.dtos.video_dtos import build_storage_payload




def _requested_analysis_variant() -> str | None:
    raw_variant = request.args.get("variant")
    if raw_variant is None:
        return None
    return str(raw_variant).strip() or None


def _serialize_video(video) -> dict:
    item = video.to_dict()
    item["analysis_ready"] = has_analysis(video.id)
    item["transcription_ready"] = has_transcription(video.id)
    item["video_url"] = f"/videos/{video.id}/file"
    item["annotated_url"] = f"/videos/{video.id}/annotated-file"
    item["analysis_url"] = f"/videos/{video.id}/analysis"
    item["transcription_url"] = f"/videos/{video.id}/transcription"
    item["ai_config"] = load_ai_config(video.id)
    item["processing"] = load_processing_state(video.id)
    item["storage"] = build_storage_payload(video.id, video.filename)
    return item


def _empty_analysis_payload(video, ai_config: dict, storage: dict) -> dict:
    return {
        "video_id": video.id,
        "filename": video.filename,
        "status": video.status,
        "available": False,
        "message": "Análise ainda não disponível.",
        "ai_config": ai_config,
        "storage": storage,
        "analysis": {
            "video_path": storage["video_absolute_path"],
            "model_path": ai_config["model_path"],
            "task_type": ai_config["task_type"],
            "frame_stride": ai_config["frame_stride"],
            "confidence_threshold": ai_config["confidence_threshold"],
            "max_frames": ai_config["max_frames"],
            "clip_start_sec": ai_config["clip_start_sec"],
            "clip_end_sec": ai_config["clip_end_sec"],
            "video_duration_sec": None,
            "sampled_frames": 0,
            "processed_frames": 0,
            "total_detections": 0,
            "label_counts": {},
            "avg_confidence_by_label": {},
            "top_labels": [],
        },
    }


def _empty_transcription_payload(video, storage: dict, *, status: str, error: str | None = None) -> dict:
    return {
        "video_id": video.id,
        "filename": video.filename,
        "available": False,
        "storage": storage,
        "transcription": {
            "content": "",
            "source": "none",
            "language": None,
            "segments": [],
            "model_name": None,
            "status": status,
            "error": error,
        },
        "available_languages": ["pt", "en", "es"],
    }


def upload_video():
    if "file" not in request.files:
        current_app.logger.warning("upload_video:missing_file")
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    file = request.files["file"]
    filename = secure_filename(file.filename or "")

    validate_filename(filename)

    settings = load_frame_ai_settings()
    ai_config = resolve_ai_config(
        request.form.get("ai_task") or request.form.get("task_type"),
        request.form.get("model_path"),
    )
    clip_config = parse_clip_selection(request.form)
    runtime_config = parse_runtime_settings(
        request.form,
        defaults={
            "frame_stride": settings.frame_stride,
            "max_frames": settings.max_frames,
            "confidence": settings.confidence,
        },
    )

    ensure_storage_dirs()
    filepath = unique_video_file_path(filename)
    stored_filename = filepath.name
    file.save(filepath)
    current_app.logger.info(
        "upload_video:saved filename=%s stored_filename=%s path=%s",
        filename,
        stored_filename,
        filepath,
    )

    new_video = create_video(filename=stored_filename)
    save_ai_config(
        new_video.id,
        task_type=ai_config["task_type"],
        task_label=ai_config["task_label"],
        model_path=ai_config["model_path"],
        model_name=ai_config["model_name"],
        frame_stride=runtime_config.frame_stride,
        confidence_threshold=runtime_config.confidence_threshold,
        max_frames=runtime_config.max_frames,
        clip_start_sec=clip_config.clip_start_sec,
        clip_end_sec=clip_config.clip_end_sec,
    )
    save_processing_state(
        new_video.id,
        progress=1,
        stage="queued",
        eta_seconds=None,
        message="Upload concluído. Aguardando inicio do processamento.",
    )

    # Enqueue job instead of starting thread
    try:
        job_queue = get_job_queue()
        job_id = job_queue.enqueue(new_video.id)
        update_job_id(new_video, job_id)
        current_app.logger.info(
            "upload_video:job_enqueued video_id=%s job_id=%s",
            new_video.id,
            job_id,
        )
    except Exception as exc:
        current_app.logger.error(
            "upload_video:enqueue_failed video_id=%s error=%s",
            new_video.id,
            exc,
        )
        return jsonify({"error": "Falha ao enfileirar processamento"}), 500

    return jsonify(
        {
            "message": "Upload realizado com sucesso",
            "video": _serialize_video(new_video),
            "next_steps": {
                "video_saved_in": to_repo_relative(filepath),
                "analysis_will_be_saved_in": to_repo_relative(
                    analysis_file_path(new_video.id)
                ),
                "annotated_will_be_saved_in": to_repo_relative(
                    annotated_video_path(new_video.id)
                ),
                "transcription_will_be_saved_in": f"uploads/transcriptions/video_{new_video.id}.json",
                "analysis_status": "PROCESSANDO_IA",
                "clip_selection": {
                    "clip_start_sec": clip_config.clip_start_sec,
                    "clip_end_sec": clip_config.clip_end_sec,
                },
                "runtime_settings": {
                    "frame_stride": runtime_config.frame_stride,
                    "max_frames": runtime_config.max_frames,
                    "confidence_threshold": runtime_config.confidence_threshold,
                },
            },
        }
    )


def list_videos():
    videos = list_videos_repo()
    payload = [_serialize_video(video) for video in videos]
    return jsonify(payload)


def get_video_analysis(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    selected_variant = _requested_analysis_variant()
    ai_config = load_ai_config(video.id)
    storage = build_storage_payload(video.id, video.filename)
    analysis = load_analysis(video_id, selected_variant)
    variants = list_analysis_variants(video.id)
    if analysis is None:
        payload = _empty_analysis_payload(video, ai_config, storage)
        payload["available_variants"] = variants
        payload["selected_variant_id"] = selected_variant
        if video.status in {"PROCESSANDO", "PROCESSANDO_IA"}:
            payload["message"] = "Análise ainda em processamento."
            return jsonify(payload), 202
        payload["message"] = "Análise não disponível."
        return jsonify(payload), 404

    return jsonify(
        {
            "video_id": video.id,
            "filename": video.filename,
            "status": video.status,
            "available": True,
            "message": "Análise carregada com sucesso.",
            "analysis": analysis,
            "available_variants": variants,
            "selected_variant_id": analysis.get("analysis_variant_id"),
            "ai_config": ai_config,
            "storage": storage,
        }
    )


def delete_video_analysis_by_id(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    requested_variant = _requested_analysis_variant()
    if requested_variant:
        deleted = delete_analysis_variant(video_id, requested_variant)
        if not deleted:
            return jsonify({"error": "Versão de análise não encontrada"}), 404
        if not has_analysis(video_id):
            update_status(video, "SEM_ANALISE")
        return jsonify(
            {
                "message": "Versão selecionada removida com sucesso",
                "video": _serialize_video(video),
                "available_variants": list_analysis_variants(video.id),
            }
        )

    delete_analysis(video_id)
    delete_analysis_artifacts(video_id)
    update_status(video, "SEM_ANALISE")
    return jsonify({"message": "Análise removida com sucesso", "video": _serialize_video(video)})


def get_video_transcription(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    storage = build_storage_payload(video.id, video.filename)
    requested_variant = request.args.get("variant") or None
    transcriptions_dir = TRANSCRIPTIONS_DIR
    variant_ids = []
    if transcriptions_dir.exists():
        variant_ids = sorted(
            path.stem.replace(f"video_{video_id}_", "")
            for path in transcriptions_dir.glob(f"video_{video_id}_*.json")
        )

    if requested_variant is None:
        transcription = load_transcription(video_id)
        if transcription is None and variant_ids:
            requested_variant = variant_ids[0]
            transcription = load_transcription(video_id, requested_variant)
    else:
        transcription = load_transcription(video_id, requested_variant)

    variants = []
    default_transcription = load_transcription(video_id)
    if default_transcription is not None:
        variants.append({
            "id": "default",
            "label": "Transcrição principal",
            "language": default_transcription.get("language"),
            "model_name": default_transcription.get("model_name"),
        })
    for variant_id in variant_ids:
        variant_payload = load_transcription(video_id, variant_id) or {}
        variants.append({
            "id": variant_id,
            "label": f"{variant_payload.get('language') or 'auto'} · {variant_payload.get('model_name') or 'manual'}",
            "language": variant_payload.get("language"),
            "model_name": variant_payload.get("model_name"),
        })

    if transcription is None:
        if video.status in {"PROCESSANDO", "PROCESSANDO_IA"}:
            return jsonify(
                _empty_transcription_payload(
                    video,
                    storage,
                    status="pending",
                    error="A transcrição sera consultada novamente quando o processamento terminar.",
                )
            ), 202
        return jsonify(
            _empty_transcription_payload(
                video,
                storage,
                status="missing",
                error="Transcrição não disponível.",
            )
        ), 404

    return jsonify(
        {
            "video_id": video.id,
            "filename": video.filename,
            "available": True,
            "transcription": transcription,
            "selected_variant": requested_variant or "default",
            "variants": variants,
            "storage": storage,
        }
    )


def generate_video_transcription_by_id(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    if not current_app.config["AUTO_TRANSCRIPTION_ENABLED"]:
        return jsonify({"error": "Transcrição automática está desabilitada nesta instalação."}), 503

    filepath = video_file_path(video.filename)
    if not filepath.exists():
        return jsonify({"error": "Arquivo de vídeo não encontrado"}), 404

    if not whisper_available():
        return (
            jsonify(
                {
                    "error": "Transcrição automática indisponível. Instale openai-whisper no ambiente atual ou ative a opção de transcrição no setup.",
                }
            ),
            503,
        )

    payload = request.get_json(silent=True) or {}
    language = payload.get("language") or current_app.config.get("TRANSCRIPTION_LANGUAGE")
    model_name = str(payload.get("model_name") or current_app.config.get("TRANSCRIPTION_MODEL", "base"))
    variant = f"{language or 'auto'}-{model_name}"
    try:
        transcription = transcribe_video_with_timestamps(
            video_id=video_id,
            video_path=str(filepath),
            model_name=model_name,
            language=language,
            logger=current_app.logger,
        )
        saved = save_transcription(video_id, **transcription, variant=variant)
    except Exception as exc:
        current_app.logger.exception("transcription:failed video_id=%s", video_id)
        return jsonify({"error": str(exc)}), 500

    return jsonify(
        {
            "message": "Transcrição automática gerada com sucesso",
            "video": _serialize_video(video),
            "transcription": saved,
        }
    )


def save_video_transcription_by_id(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    payload = request.get_json(silent=True) or {}
    content = payload.get("content")
    if not isinstance(content, str):
        return jsonify({"error": "O campo content precisa ser um texto."}), 400

    variant = payload.get("variant") or None
    if variant == "default":
        variant = None
    existing = load_transcription(video_id, variant) or {}
    segments = payload.get("segments") or []
    if not isinstance(segments, list):
        return jsonify({"error": "O campo segments precisa ser uma lista."}), 400

    normalized_segments = []
    for index, segment in enumerate(segments):
        try:
            start = float(segment["start"])
            end = float(segment["end"])
            text = str(segment["text"]).strip()
        except (KeyError, TypeError, ValueError):
            return jsonify({"error": f"Segmento {index + 1} inválido."}), 400
        if start < 0 or end <= start or not text:
            return jsonify({"error": f"Segmento {index + 1} precisa ter tempos válidos e texto."}), 400
        normalized_segments.append({
            "id": int(segment.get("id", index)),
            "start": round(start, 2),
            "end": round(end, 2),
            "text": text,
        })

    saved = save_transcription(
        video_id,
        content=content,
        source="manual",
        language=payload.get("language") or existing.get("language"),
        segments=normalized_segments,
        model_name=existing.get("model_name"),
        variant=variant,
    )
    return jsonify(
        {
            "message": "Transcrição salva com sucesso",
            "video": _serialize_video(video),
            "transcription": saved,
        }
    )


def translate_video_transcription_by_id(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    payload = request.get_json(silent=True) or {}
    source_variant = payload.get("variant") or None
    source = load_transcription(video_id, source_variant)
    target_language = str(payload.get("target_language") or "").strip().lower()
    source_language = str((source or {}).get("language") or "").strip().lower()
    if source is None:
        return jsonify({"error": "A transcrição de origem não foi encontrada."}), 404
    if not target_language:
        return jsonify({"error": "Escolha o idioma de destino."}), 400
    if not source_language:
        return jsonify({"error": "A transcrição de origem não possui idioma definido."}), 400
    if source_language == target_language:
        return jsonify({"error": "A transcrição já está no idioma escolhido."}), 409

    try:
        segments = translate_segments(source.get("segments", []), source_language, target_language)
        translated = save_transcription(
            video_id,
            content=" ".join(segment["text"] for segment in segments),
            source="translation",
            language=target_language,
            segments=segments,
            model_name=source.get("model_name"),
            variant=f"{target_language}-from-{source_variant or 'default'}",
        )
    except RuntimeError as exc:
        current_app.logger.exception("transcription:translation_failed video_id=%s", video_id)
        return jsonify({"error": str(exc)}), 503
    except Exception as exc:
        current_app.logger.exception("transcription:translation_failed video_id=%s", video_id)
        return jsonify({"error": "Falha inesperada ao criar a tradução."}), 500

    return jsonify({"message": "Tradução gerada com sucesso.", "transcription": translated})


def delete_video_transcription_by_id(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    variant = request.args.get("variant") or None
    delete_transcription(video_id, None if variant == "default" else variant)
    return jsonify({"message": "Transcrição removida com sucesso", "video": _serialize_video(video)})


def get_video_details(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404
    return jsonify(_serialize_video(video))


def get_video_file(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    filepath = video_file_path(video.filename)
    if not filepath.exists():
        return jsonify({"error": "Arquivo de video não encontrado"}), 404

    mimetype, _ = mimetypes.guess_type(str(filepath))
    return send_file(
        filepath,
        mimetype=mimetype or "application/octet-stream",
        as_attachment=False,
        download_name=video.filename,
    )


def get_annotated_video_file(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    filepath = resolve_annotated_video_for_web(video.id, current_app.logger, _requested_analysis_variant())
    if filepath is None:
        filepath = annotated_video_path(video.id)
    if not filepath.exists():
        if video.status in {"PROCESSANDO", "PROCESSANDO_IA"}:
            return jsonify({"message": "Vídeo anotado ainda em processamento", "status": video.status}), 202
        return jsonify({"error": "Vídeo anotado não disponível", "status": video.status}), 404

    return send_file(
        filepath,
        mimetype="video/mp4",
        as_attachment=False,
        download_name=filepath.name,
    )


def update_video_status(video_id: int):
    payload = request.get_json(silent=True) or {}
    status = payload.get("status")
    if not status:
        return jsonify({"error": "Campo status obrigatório"}), 400

    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    status = str(status)
    if status not in VALID_VIDEO_STATUSES:
        return jsonify({"error": "Status de vídeo inválido"}), 400

    update_status(video, status)
    current_app.logger.info("action:update_status video_id=%s new_status=%s", video_id, status)
    return jsonify(_serialize_video(video))


def update_video_ai_config(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    payload = request.get_json(silent=True) or {}
    ai_config = resolve_ai_config(payload.get("task_type"), payload.get("model_path"))
    settings = load_frame_ai_settings()
    clip_config = parse_clip_selection(payload)
    runtime_config = parse_runtime_settings(payload, defaults={
        "frame_stride": settings.frame_stride, 
        "max_frames": settings.max_frames, 
        "confidence": settings.confidence})


    saved = save_ai_config(
        video.id,
        task_type=ai_config["task_type"],
        task_label=ai_config["task_label"],
        model_path=ai_config["model_path"],
        model_name=ai_config["model_name"],
        frame_stride=runtime_config.frame_stride,
        confidence_threshold=runtime_config.confidence_threshold,
        max_frames=runtime_config.max_frames,
        clip_start_sec=clip_config.clip_start_sec,
        clip_end_sec=clip_config.clip_end_sec,
    )
    return jsonify({"message": "Configuração de IA atualizada", "ai_config": saved, "video": _serialize_video(video)})


def reprocess_video_by_id(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    payload = request.get_json(silent=True) or {}
    if payload:

        ai_config = resolve_ai_config(payload.get("task_type"), payload.get("model_path"))
        settings = load_frame_ai_settings()
        clip_config = parse_clip_selection(payload)
        runtime_config = parse_runtime_settings(payload, defaults={
            "frame_stride": settings.frame_stride, 
            "max_frames": settings.max_frames, 
            "confidence": settings.confidence})

        save_ai_config(
            video.id,
            task_type=ai_config["task_type"],
            task_label=ai_config["task_label"],
            model_path=ai_config["model_path"],
            model_name=ai_config["model_name"],
            frame_stride=runtime_config.frame_stride,
            confidence_threshold=runtime_config.confidence_threshold,
            max_frames=runtime_config.max_frames,
            clip_start_sec=clip_config.clip_start_sec,
            clip_end_sec=clip_config.clip_end_sec,
        )

    # Enqueue reprocessing job
    try:
        job_queue = get_job_queue()
        job_id = job_queue.enqueue(video.id)
        update_job_id(video, job_id)
        current_app.logger.info(
            "reprocess:job_enqueued video_id=%s job_id=%s",
            video.id,
            job_id,
        )
    except Exception as exc:
        current_app.logger.error(
            "reprocess:enqueue_failed video_id=%s error=%s",
            video.id,
            exc,
        )
        return jsonify({"error": "Falha ao enfileirar reprocessamento"}), 500

    return jsonify({"message": "Reprocessamento iniciado", "video": _serialize_video(video)})


def cancel_video_processing_by_id(video_id: int):
    """Cancel queued or running work without deleting the video or artifacts."""
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    if video.status not in {"PROCESSANDO", "PROCESSANDO_IA"}:
        return jsonify({"error": "Este vídeo não está em processamento."}), 409

    if not get_job_queue().cancel(video.id, video.job_id):
        return jsonify({"error": "O job de processamento não está mais ativo."}), 409

    processing = load_processing_state(video.id)
    update_status(video, "CANCELADO")
    save_processing_state(
        video.id,
        progress=processing.get("processing_progress", 0),
        stage="cancelled",
        eta_seconds=None,
        message="Cancelamento solicitado. O vídeo e análises concluídas serão mantidos.",
    )
    current_app.logger.info("action:cancel_processing video_id=%s", video_id)
    return jsonify({"message": "Processamento cancelado", "video": _serialize_video(video)})


def delete_video_by_id(video_id: int):
    video = get_video(video_id)
    if not video:
        return jsonify({"error": "Vídeo não encontrado"}), 404

    filepath = video_file_path(video.filename)
    delete_video(video)
    for path in (filepath,):
        if path.exists():
            path.unlink()
    delete_analysis_artifacts(video.id)
    delete_transcription(video_id)
    delete_metadata(video_id)
    current_app.logger.info("action:delete_video video_id=%s filename=%s", video_id, video.filename)
    return jsonify({"message": "Vídeo removido com sucesso"})


def list_ai_models():
    models = list_available_models()
    tasks = sorted({(model["task_type"], model["task_label"]) for model in models})
    return jsonify(
        {
            "models": models,
            "tasks": [{"task_type": task_type, "task_label": task_label} for task_type, task_label in tasks],
        }
    )


def get_system_version():
    return jsonify(
        {
            **build_version_payload(),
            "backend_name": "DeMoviefy Backend",
        }
    )


def home():
    return """
    <h1>DeMoviefy Backend</h1>
    <p>Servidor rodando com sucesso.</p>
    """
