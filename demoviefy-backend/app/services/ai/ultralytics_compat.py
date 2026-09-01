"""Compatibility shims for legacy Ultralytics checkpoints."""

from __future__ import annotations


def _ensure_ultralytics_compat() -> None:
    """Ensure legacy YOLO checkpoints remain loadable across Ultralytics versions."""
    from app.services.frame_ai_service import _ensure_ultralytics_compat as _legacy_impl

    return _legacy_impl()


def ensure_ultralytics_compat() -> None:
    """Public compatibility wrapper used by service code and tests."""
    return _ensure_ultralytics_compat()


def _get_model(model_path: str):
    """Load a YOLO model, applying compatibility shims before inference."""
    from app.services.frame_ai_service import _get_model as _legacy_impl

    return _legacy_impl(model_path)


def get_model(model_path: str):
    """Public model loader alias."""
    return _get_model(model_path)
