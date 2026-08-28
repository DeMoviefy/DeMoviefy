"""Typed request data used by video endpoints."""

from dataclasses import dataclass


@dataclass(frozen=True)
class ClipSelection:
    clip_start_sec: float
    clip_end_sec: float | None


@dataclass(frozen=True)
class RuntimeSettings:
    frame_stride: int
    max_frames: int
    confidence_threshold: float
