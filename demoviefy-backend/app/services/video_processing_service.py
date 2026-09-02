"""FFmpeg and video-preparation helpers used during frame analysis."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

from app.config.paths import ffprobe_path


def get_video_info(video_path: str | Path) -> dict:
    """
    Retorna informações técnicas do vídeo utilizando FFprobe.

    Args:
        video_path: Caminho do arquivo de vídeo.

    Returns:
        dict: Informações dos streams e do container.

    Raises:
        FileNotFoundError: Se o vídeo não existir.
        RuntimeError: Se o FFprobe não estiver disponível ou falhar.
    """
    video_path = Path(video_path)

    if not video_path.exists():
        raise FileNotFoundError(
            f"Vídeo não encontrado: {video_path}"
        )

    probe = ffprobe_path()

    if probe is None:
        raise RuntimeError(
            "FFprobe não foi encontrado."
        )

    command = [
        str(probe),
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_streams",
        "-show_format",
        str(video_path),
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=True,
    )

    return json.loads(result.stdout)

def get_video_duration(video_path: str | Path) -> float:
    """
    Retorna a duração do vídeo em segundos.
    """
    info = get_video_info(video_path)

    duration = info.get("format", {}).get("duration")

    if duration is None:
        raise RuntimeError(
            f"Não foi possível determinar a duração de: {video_path}"
        )

    return float(duration)

def has_audio_stream(video_path: str | Path) -> bool:
    """
    Verifica se o vídeo possui pelo menos um stream de áudio.
    """
    info = get_video_info(video_path)

    return any(
        stream.get("codec_type") == "audio"
        for stream in info.get("streams", [])
    )

def adicionar_audio_ao_clipe(
    *,
    video_original: str,
    video_processado: str,
    destino: str,
    clip_start_sec: float = 0.0,
    clip_end_sec: float | None = None,
) -> Path:

    # --------------------------------------------------
    # 1. Validar intervalo
    # --------------------------------------------------

    clip_start_sec, clip_end_sec = normalize_clip_range(
        video_original,
        clip_start_sec,
        clip_end_sec,
    )

    duracao = clip_end_sec - clip_start_sec

    # --------------------------------------------------
    # 2. Verificar áudio
    # --------------------------------------------------

    if not has_audio_stream(video_original):

        # Se não existe áudio, simplesmente recorta
        # o vídeo processado.
        (
            ffmpeg
            .input(
                video_processado,
                ss=clip_start_sec,
                t=duracao,
            )
            .output(
                destino,
                vcodec="copy",
            )
            .overwrite_output()
            .run()
        )

        return Path(destino)

    # --------------------------------------------------
    # 3. Abrir vídeo YOLO
    # --------------------------------------------------

    video = ffmpeg.input(
        video_processado,
        ss=clip_start_sec,
        t=duracao,
    )

    # --------------------------------------------------
    # 4. Abrir áudio ORIGINAL
    # --------------------------------------------------

    audio = ffmpeg.input(
        video_original,
        ss=clip_start_sec,
        t=duracao,
    )

    # --------------------------------------------------
    # 5. Combinar
    # --------------------------------------------------

    (
        ffmpeg
        .output(
            video.video,
            audio.audio,
            destino,

            # Não recodifica o vídeo
            vcodec="copy",

            # Recodifica o áudio para AAC
            acodec="aac",

            # Termina quando o menor stream terminar
            shortest=None,
        )
        .overwrite_output()
        .run()
    )

    return Path(destino)

def _normalize_annotated_mp4(source_path: Path, output_path: Path, logger: Any | None = None) -> bool:
    """Normalize an annotated MP4 into a browser-playable artifact."""
    from app.services.frame_ai_service import _normalize_annotated_mp4 as _legacy_impl

    return _legacy_impl(source_path, output_path, logger=logger)


def normalize_annotated_mp4(source_path: Path, output_path: Path, logger: Any | None = None) -> bool:
    """Public wrapper for annotated MP4 normalization."""
    return _normalize_annotated_mp4(source_path, output_path, logger=logger)


def _probe_video_stream(file_path: Path, logger: Any | None = None) -> dict[str, str] | None:
    """Inspect the container metadata of a source video."""
    from app.services.frame_ai_service import _probe_video_stream as _legacy_impl

    return _legacy_impl(file_path, logger=logger)


def probe_video_stream(file_path: Path, logger: Any | None = None) -> dict[str, str] | None:
    """Public wrapper for stream inspection."""
    return _probe_video_stream(file_path, logger=logger)


def _is_browser_playable_mp4(file_path: Path, logger: Any | None = None) -> bool:
    """Return whether the provided MP4 can be served directly in a browser."""
    from app.services.frame_ai_service import _is_browser_playable_mp4 as _legacy_impl

    return _legacy_impl(file_path, logger=logger)


def is_browser_playable_mp4(file_path: Path, logger: Any | None = None) -> bool:
    """Public browser-playability helper."""
    return _is_browser_playable_mp4(file_path, logger=logger)


def _variant_browser_path(source_path: Path) -> Path:
    """Return the browser-optimized filename for a variant artifact."""
    from app.services.frame_ai_service import _variant_browser_path as _legacy_impl

    return _legacy_impl(source_path)


def variant_browser_path(source_path: Path) -> Path:
    """Public variant-browser path helper."""
    return _variant_browser_path(source_path)


def _resolve_annotated_source_path(video_id: int, variant_id: str | None = None) -> Path:
    """Resolve the canonical annotated-video path for a processing variant."""
    from app.services.frame_ai_service import _resolve_annotated_source_path as _legacy_impl

    return _legacy_impl(video_id, variant_id)


def resolve_annotated_source_path(video_id: int, variant_id: str | None = None) -> Path:
    """Public alias for variant source path resolution."""
    return _resolve_annotated_source_path(video_id, variant_id)
