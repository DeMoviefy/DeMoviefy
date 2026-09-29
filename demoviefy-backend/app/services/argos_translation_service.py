"""Local Argos adapter. Downloads belong to setup, never to a user request."""
import hashlib
from importlib.metadata import version
import json
from threading import RLock

from app.config.translation_settings import configure_argos
from app.services.translation_control import TranslationError

_MODEL_LOCK = RLock()
SUPPORTED_LANGUAGES = {'pt', 'en', 'es'}


def normalize_language(language):
    code = str(language or '').strip().lower().replace('_', '-').split('-')[0]
    if code not in SUPPORTED_LANGUAGES:
        raise TranslationError('Escolha um idioma de origem e destino entre português, inglês e espanhol.', 'translation_invalid_language', 400)
    return code


def load_argos():
    configure_argos()
    try:
        from argostranslate import package, settings
        if any(not (settings.data_dir / 'minisbd' / f'{code}.onnx').is_file() for code in SUPPORTED_LANGUAGES):
            raise TranslationError('Modelos auxiliares ausentes. Execute o setup para preparar a tradução offline.', 'translation_models_missing', 503)
        from argostranslate import translate
    except (ImportError, OSError) as exc:
        raise TranslationError('Argos Translate indisponível. Execute o setup para instalar as dependências e modelos.', 'translation_unavailable', 503) from exc
    return package, translate


class ArgosTranslator:
    def __init__(self, source, target):
        self.source = normalize_language(source)
        self.target = normalize_language(target)
        with _MODEL_LOCK:
            package, translate = load_argos()
            languages = {language.code: language for language in translate.get_installed_languages()}
            origin, destination = languages.get(self.source), languages.get(self.target)
            self.model = origin.get_translation(destination) if origin and destination else None
            if self.model is None:
                raise TranslationError('Modelos de tradução ausentes. Execute o setup para instalar português, inglês e espanhol.', 'translation_models_missing', 503)
            models = sorted((p.from_code, p.to_code, str(p.package_version)) for p in package.get_installed_packages())
            fingerprint = hashlib.sha256(json.dumps(models).encode()).hexdigest()
            self.cache_key = f'argos:{version("argostranslate")}:{fingerprint}'

    def translate(self, text):
        # Argos keeps mutable in-memory model caches; serialize local inference.
        with _MODEL_LOCK:
            return self.model.translate(text)
