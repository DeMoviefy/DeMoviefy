from datetime import timedelta
import srt
from deep_translator import GoogleTranslator

TRANSLATION_BATCH_SIZE = 50


def _translate_texts_in_batches(
    translator: GoogleTranslator,
    texts: list[str],
) -> list[str]:
    translated: list[str] = []
    for offset in range(0, len(texts), TRANSLATION_BATCH_SIZE):
        batch = texts[offset : offset + TRANSLATION_BATCH_SIZE]
        try:
            translated.extend(translator.translate_batch(batch))
        except Exception as exc:
            raise RuntimeError(
                f"Falha ao traduzir o lote {offset // TRANSLATION_BATCH_SIZE + 1}. "
                "O provedor pode ter aplicado um limite temporário de requisições."
            ) from exc
    return translated


def translate_segments(
    segments: list[dict],
    source_lang: str,
    target_lang: str,
    proxy_url: str | None = None,
) -> list[dict]:
    if source_lang.lower() == target_lang.lower():
        raise ValueError("O idioma de origem e o idioma de destino são iguais.")

    proxy_config = {"http": proxy_url, "https": proxy_url} if proxy_url else None
    translator = GoogleTranslator(source=source_lang, target=target_lang, proxies=proxy_config)
    source_segments = []
    for segment in segments:
        text = str(segment.get("text", "")).strip()
        if not text:
            continue
        source_segments.append((segment, text))

    texts = [text for _, text in source_segments]
    translated_texts = _translate_texts_in_batches(translator, texts)
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
    proxy_url: str | None = None,
) -> str:
    """Recebe a lista de 'segments' retornada pelo Whisper e gera o conteúdo formatado em SRT.

    Cada item em 'segments' deve conter: 'start', 'end' e 'text'.
    """
    proxy_config = None
    if proxy_url:
        proxy_config = {"http": proxy_url, "https": proxy_url}

    translator = GoogleTranslator(source="auto", target=target_lang, proxies=proxy_config)
    source_segments = []
    for seg in segments:
        original_text = seg.get("text", "").strip()
        if not original_text:
            continue
        source_segments.append((seg, original_text))

    translated_texts = _translate_texts_in_batches(
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