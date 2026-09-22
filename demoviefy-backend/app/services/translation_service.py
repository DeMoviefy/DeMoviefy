from datetime import timedelta
import srt
from deep_translator import GoogleTranslator


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
    subtitles = []

    for idx, seg in enumerate(segments, start=1):
        original_text = seg.get("text", "").strip()
        if not original_text:
            continue

        try:
            translated_text = translator.translate(original_text)
        except Exception:
            translated_text = original_text  # Fallback mantendo o texto original caso ocorra falha no trecho

        subtitles.append(
            srt.Subtitle(
                index=idx,
                start=timedelta(seconds=float(seg["start"])),
                end=timedelta(seconds=float(seg["end"])),
                content=translated_text,
            )
        )

    return srt.compose(subtitles)