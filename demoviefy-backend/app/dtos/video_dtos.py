"""Typed request and response data structures used by video endpoints."""

"""Typed request data used by video endpoints."""

from dataclasses import dataclass

from app.config.paths import (
    analysis_file_path,
    annotated_video_path,
    to_repo_relative,
    transcription_file_path,
    video_file_path,
)
from app.services.frame_ai_service import has_annotated_video
from app.services.video_artifact_service import has_transcription


@dataclass(frozen=True)
class ClipSelection:
    clip_start_sec: float
    clip_end_sec: float | None


@dataclass(frozen=True)
class RuntimeSettings:
    frame_stride: int
    max_frames: int
    confidence_threshold: float


def build_storage_payload(video_id: int, filename: str) -> dict:
    """Build standardized dictionary representing video storage artifacts status and paths."""
    video_path = video_file_path(filename)
    analysis_path = analysis_file_path(video_id)
    annotated_path = annotated_video_path(video_id)
    transcription_path = transcription_file_path(video_id)

    return {
        "video_relative_path": to_repo_relative(video_path),
        "video_absolute_path": str(video_path),
        "video_exists": video_path.exists(),
        "analysis_relative_path": to_repo_relative(analysis_path),
        "analysis_absolute_path": str(analysis_path),
        "analysis_exists": analysis_path.exists(),
        "annotated_relative_path": to_repo_relative(annotated_path),
        "annotated_absolute_path": str(annotated_path),
        "annotated_exists": has_annotated_video(video_id),
        "transcription_relative_path": to_repo_relative(transcription_path),
        "transcription_absolute_path": str(transcription_path),
        "transcription_exists": has_transcription(video_id),
    }