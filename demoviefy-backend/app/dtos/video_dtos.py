"""Typed request and response data structures used by the video API."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

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
    """Selection window to restrict inference to a portion of a video."""

    clip_start_sec: float
    clip_end_sec: float | None = None


@dataclass(frozen=True)
class RuntimeSettings:
    """Detection runtime parameters that drive frame sampling and confidence."""

    frame_stride: int
    max_frames: int
    confidence_threshold: float


@dataclass(frozen=True)
class VideoResponseDTO:
    """Serializable response payload returned for a single video record."""

    id: int
    filename: str
    status: str
    job_id: str | None = None
    created_at: str | None = None
    analysis_ready: bool = False
    transcription_ready: bool = False
    video_url: str | None = None
    annotated_url: str | None = None
    analysis_url: str | None = None
    transcription_url: str | None = None
    ai_config: dict[str, Any] | None = None
    processing: dict[str, Any] | None = None
    storage: dict[str, Any] | None = None


@dataclass(frozen=True)
class AIConfigDTO:
    """Per-video AI configuration persisted alongside a processing run."""

    task_type: str
    task_label: str
    model_path: str
    model_relative_path: str
    model_name: str
    frame_stride: int
    confidence_threshold: float
    max_frames: int
    clip_start_sec: float = 0.0
    clip_end_sec: float | None = None


@dataclass(frozen=True)
class ProcessingStateDTO:
    """Progress metadata for the current processing lifecycle stage."""

    processing_progress: int = 0
    processing_stage: str = "idle"
    processing_eta_seconds: int | None = None
    processing_message: str = "Aguardando processamento."


@dataclass(frozen=True)
class TranscriptionResultDTO:
    """Serialized transcription payload returned to API consumers."""

    content: str = ""
    source: str = "none"
    language: str | None = None
    segments: list[dict[str, Any]] = field(default_factory=list)
    model_name: str | None = None
    status: str = "missing"
    error: str | None = None


@dataclass(frozen=True)
class AnalysisSummaryDTO:
    """Aggregated results from an AI frame-analysis run."""

    video_path: str | None = None
    model_path: str | None = None
    task_type: str | None = None
    frame_stride: int | None = None
    confidence_threshold: float | None = None
    max_frames: int | None = None
    clip_start_sec: float | None = None
    clip_end_sec: float | None = None
    video_duration_sec: float | None = None
    sampled_frames: int = 0
    processed_frames: int = 0
    total_detections: int = 0
    label_counts: dict[str, int] = field(default_factory=dict)
    avg_confidence_by_label: dict[str, float] = field(default_factory=dict)
    top_labels: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class StoragePayloadDTO:
    """File-system paths for the video, analysis, annotation, and transcription artifacts."""

    video_relative_path: str | None = None
    video_absolute_path: str | None = None
    video_exists: bool = False
    analysis_relative_path: str | None = None
    analysis_absolute_path: str | None = None
    analysis_exists: bool = False
    annotated_relative_path: str | None = None
    annotated_absolute_path: str | None = None
    annotated_exists: bool = False
    transcription_relative_path: str | None = None
    transcription_absolute_path: str | None = None
    transcription_exists: bool = False


def build_storage_payload(video_id: int, filename: str) -> dict:
    """Build standardized dictionary representing video storage artifact status and paths."""
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