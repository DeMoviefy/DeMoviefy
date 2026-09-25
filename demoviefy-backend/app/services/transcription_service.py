"""
Helpers para artefatos de transcrição do vídeo.

Este módulo reexporta os utilitários de persistência e provê
o fluxo de transcrição via Whisper (local ou por worker subprocess)
com suporte a segmentos com timestamps.
"""

import json
import os
import subprocess
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.config.paths import TRANSCRIPTION_ENV_DIR, TRANSCRIPTION_SCRIPT_PATH
from app.services.video_artifact_service import (
    delete_transcription,
    has_transcription,
    load_transcription,
    save_transcription,
)
from app.services.translation_service import translate_segments_to_srt


def _local_whisper_available() -> bool:
    try:
        import whisper  # noqa: F401
    except Exception:
        return False
    return True


def _transcription_python_candidates() -> list[Path]:
    candidates: list[Path] = []
    override = os.environ.get("DEMOVIEFY_TRANSCRIPTION_PYTHON")
    if override:
        candidates.append(Path(override))

    # Usa o interpretador Python atual do backend
    candidates.append(Path(sys.executable))
    
    # Mantém fallback para o ambiente isolado .venv-transcription
    if os.name == "nt":
        candidates.append(TRANSCRIPTION_ENV_DIR / "Scripts" / "python.exe")
    else:
        candidates.extend(
            [
                TRANSCRIPTION_ENV_DIR / "bin" / "python",
                TRANSCRIPTION_ENV_DIR / "bin" / "python3",
            ]
        )
    return candidates


def resolve_transcription_python() -> Path | None:
    for candidate in _transcription_python_candidates():
        if candidate.exists():
            return candidate
    return None


def whisper_available() -> bool:
    return resolve_transcription_python() is not None or _local_whisper_available()


@lru_cache(maxsize=4)
def _load_whisper_model(model_name: str):
    import whisper

    return whisper.load_model(model_name)


def _transcribe_with_local_whisper(
    *,
    video_path: str,
    model_name: str,
    language: str | None,
    logger: Any | None,
) -> dict[str, Any]:
    if logger:
        logger.info(
            "transcription:start mode=local video_path=%s model=%s language=%s",
            video_path,
            model_name,
            language or "auto",
        )

    model = _load_whisper_model(model_name)
    result = model.transcribe(video_path, verbose=False, language=language)
    
    segments = [
        {
            "id": int(segment.get("id", index)),
            "start": round(float(segment.get("start", 0.0)), 2),
            "end": round(float(segment.get("end", 0.0)), 2),
            "text": str(segment.get("text", "")).strip(),
        }
        for index, segment in enumerate(result.get("segments", []))
        if str(segment.get("text", "")).strip()
    ]
    
    payload = {
        "content": " ".join(segment["text"] for segment in segments).strip(),
        "source": "whisper",
        "language": result.get("language") or language,
        "segments": segments,
        "model_name": model_name,
        "status": "ready",
        "error": None,
    }

    if logger:
        logger.info(
            "transcription:done mode=local segments=%s language=%s",
            len(segments),
            payload["language"],
        )

    return payload


def _transcribe_with_worker(
    *,
    python_executable: Path,
    video_id: str,
    model_name: str,
    language: str | None,
    logger: Any | None,
) -> dict[str, Any]:
    # Ajustado para usar --video_id conforme a CLI do transcribe_with_whisper.py
    command = [
        str(python_executable),
        str(TRANSCRIPTION_SCRIPT_PATH),
        "--video_id",
        str(video_id),
        "--model",
        model_name,
    ]

    if logger:
        logger.info(
            "transcription:start mode=worker python=%s video_id=%s model=%s",
            python_executable,
            video_id,
            model_name,
        )

    completed = subprocess.run(
        command,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    
    if completed.returncode != 0:
        details = completed.stderr.strip() or completed.stdout.strip() or "worker sem detalhes de erro"
        raise RuntimeError(f"Falha no worker de transcrição: {details}")

    # O script grava em disco, mas você pode capturar a saída JSON se o script a imprimir
    try:
        # Se o script grava em arquivo e não imprime o JSON no stdout, 
        # tenta carregar o JSON direto do arquivo gravado
        transcription_path = Path("uploads/transcriptions") / f"video_{video_id}.json"
        if transcription_path.exists():
            with open(transcription_path, "r", encoding="utf-8") as f:
                payload = json.load(f)
        else:
            payload = json.loads(completed.stdout)
    except Exception as exc:
        raise RuntimeError("O worker de transcrição não gerou um resultado JSON válido.") from exc

    if logger:
        logger.info(
            "transcription:done mode=worker segments=%s",
            len(payload.get("segments", [])),
        )

    return payload


def generate_multilingual_srt(
    video_id: str,
    segments: list[dict],
    languages: list[str] = ["pt", "en"],
    proxy_url: str | None = None,
) -> list[str]:
    """Gera arquivos SRT para múltiplos idiomas com base nos segmentos da transcrição."""
    generated_files = []
    for lang in languages:
        try:
            srt_content = translate_segments_to_srt(
                segments=segments, target_lang=lang, proxy_url=proxy_url
            )
            # Define o caminho do arquivo: uploads/transcriptions/video_{id}_{lang}.srt
            file_path = Path("uploads/transcriptions") / f"video_{video_id}_{lang}.srt"
            file_path.parent.mkdir(parents=True, exist_ok=True)

            with open(file_path, "w", encoding="utf-8") as f:
                f.write(srt_content)

            generated_files.append(str(file_path))
        except Exception as e:
            # Logar erro mas continuar para o próximo idioma
            print(f"Erro ao gerar SRT para o idioma {lang}: {e}")

    return generated_files


def transcribe_video_with_timestamps(
    *,
    video_id: str,
    video_path: str | None = None,
    model_name: str = "base",
    language: str | None = None,
    logger: Any | None = None,
    proxy_url: str | None = None,
) -> dict[str, Any]:
    worker_python = resolve_transcription_python()
    worker_error: Exception | None = None

    if worker_python is not None and TRANSCRIPTION_SCRIPT_PATH.exists():
        try:
            payload = _transcribe_with_worker(
                python_executable=worker_python,
                video_id=video_id,
                model_name=model_name,
                language=language,
                logger=logger,
            )
            return payload
        except Exception as exc:
            worker_error = exc
            if logger:
                logger.warning("transcription:worker_failed reason=%s", exc)

    if _local_whisper_available() and video_path:
        payload = _transcribe_with_local_whisper(
            video_path=video_path,
            model_name=model_name,
            language=language,
            logger=logger,
        )
        return payload

    if worker_error is not None:
        raise RuntimeError(
            f"Transcrição automática indisponível no worker dedicado: {worker_error}"
        ) from worker_error

    raise RuntimeError(
        "Transcrição automática indisponível: instale openai-whisper no ambiente atual "
        "ou habilite a transcrição via setup e execute novamente."
    )


__all__ = [
    "delete_transcription",
    "has_transcription",
    "load_transcription",
    "resolve_transcription_python",
    "save_transcription",
    "transcribe_video_with_timestamps",
    "whisper_available",
]