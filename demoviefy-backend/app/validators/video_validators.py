"""Validation and parsing for video upload and processing requests."""

from collections.abc import Mapping
from pathlib import Path

from app.dtos.video_dtos import ClipSelection, RuntimeSettings


ALLOWED_VIDEO_EXTENSIONS = frozenset({".mp4", ".mov", ".avi", ".mkv", ".webm"})


def validate_filename(filename: str) -> None:
    if not filename or not filename.strip():
        raise ValueError("Nome de arquivo inválido.")
    if Path(filename).suffix.lower() not in ALLOWED_VIDEO_EXTENSIONS:
        raise ValueError("Formato de vídeo não suportado. Use mp4/mov/avi/mkv/webm.")


def parse_clip_selection(data: Mapping) -> ClipSelection:
    start = _parse_optional_float(data.get("clip_start_sec"), "clip_start_sec")
    end = _parse_optional_float(data.get("clip_end_sec"), "clip_end_sec")
    start = 0.0 if start is None else start
    if start < 0:
        raise ValueError("O início do trecho não pode ser negativo.")
    if end is not None and end <= start:
        raise ValueError("O fim do trecho precisa ser maior que o início.")
    return ClipSelection(round(start, 2), round(end, 2) if end is not None else None)


def parse_runtime_settings(data: Mapping, *, defaults: Mapping) -> RuntimeSettings:
    frame_stride = _parse_optional_int(data.get("frame_stride"), "frame_stride")
    max_frames = _parse_optional_int(data.get("max_frames"), "max_frames")
    confidence = _parse_optional_float(data.get("confidence_threshold"), "confidence_threshold")
    frame_stride = defaults["frame_stride"] if frame_stride is None else frame_stride
    max_frames = defaults["max_frames"] if max_frames is None else max_frames
    confidence = defaults["confidence"] if confidence is None else confidence
    if frame_stride < 1:
        raise ValueError("frame_stride precisa ser pelo menos 1.")
    if max_frames < 1:
        raise ValueError("max_frames precisa ser pelo menos 1.")
    if not 0 <= confidence <= 1:
        raise ValueError("confidence_threshold precisa ficar entre 0 e 1.")
    return RuntimeSettings(frame_stride, max_frames, round(confidence, 4))


def _parse_optional_float(value: object, field_name: str) -> float | None:
    if value in (None, "", "null"):
        return None
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Campo {field_name} precisa ser numérico.") from exc


def _parse_optional_int(value: object, field_name: str) -> int | None:
    if value in (None, "", "null"):
        return None
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Campo {field_name} precisa ser inteiro.") from exc
