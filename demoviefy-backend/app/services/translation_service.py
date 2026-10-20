from datetime import timedelta
import srt
from app.services.argos_translation_service import ArgosTranslator, normalize_language

from app.services.translation_control import TranslationControl


def _translate_texts(
    translator: ArgosTranslator,
    texts: list[str],
) -> list[str]:
    if not texts:
        return []
    control = TranslationControl()
    return [control.translate(translator, text) for text in texts]


def translate_segments(
    segments: list[dict],
    source_lang: str,
    target_lang: str,
) -> list[dict]:
    source_lang, target_lang = normalize_language(source_lang), normalize_language(target_lang)
    if source_lang == target_lang:
        raise ValueError("O idioma de origem e o idioma de destino são iguais.")

    translator = ArgosTranslator(source_lang, target_lang)
    source_segments = []
    for segment in segments:
        text = str(segment.get("text", "")).strip()
        if not text:
            continue
        source_segments.append((segment, text))

    texts = [text for _, text in source_segments]
    translated_texts = _translate_texts(translator, texts)
    if len(translated_texts) != len(source_segments):
        raise RuntimeError("O provedor retornou uma quantidade inesperada de traduções.")

    translated = []
    for (segment, _), translated_text in zip(source_segments, translated_texts):
        translated.append({
            "id": int(segment.get("id", len(translated))),
            "start": round(float(segment["start"]), 2),
            "end": round(float(segment["end"]), 2),
            "text": str(translated_text).strip(),
        })
    return translated


def translate_segments_to_srt(
    segments: list[dict],
    target_lang: str = "pt",
    source_lang: str | None = None,
) -> str:
    """Recebe a lista de 'segments' retornada pelo Whisper e gera o conteúdo formatado em SRT.

    Cada item em 'segments' deve conter: 'start', 'end' e 'text'.
    """
    # Argos requires the source language; Whisper already provides it.
    translator = ArgosTranslator(source_lang, target_lang)
    source_segments = []
    for seg in segments:
        original_text = seg.get("text", "").strip()
        if not original_text:
            continue
        source_segments.append((seg, original_text))

    translated_texts = _translate_texts(
        translator,
        [text for _, text in source_segments],
    )
    if len(translated_texts) != len(source_segments):
        raise RuntimeError("O provedor retornou uma quantidade inesperada de traduções.")

    subtitles = []
    for idx, ((seg, _), translated_text) in enumerate(zip(source_segments, translated_texts), start=1):
        subtitles.append(
            srt.Subtitle(
                index=idx,
                start=timedelta(seconds=float(seg["start"])),
                end=timedelta(seconds=float(seg["end"])),
                content=translated_text,
            )
        )

    return srt.compose(subtitles)
