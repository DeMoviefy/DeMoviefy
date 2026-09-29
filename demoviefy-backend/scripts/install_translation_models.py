"""Install reusable local models for all six pt/en/es translation directions."""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.config.translation_settings import configure_argos

REQUIRED_PAIRS = (('en', 'pt'), ('pt', 'en'), ('en', 'es'), ('es', 'en'))


def install_models():
    configure_argos()
    from argostranslate import package, settings

    installed = {(p.from_code, p.to_code) for p in package.get_installed_packages()}
    missing = [pair for pair in REQUIRED_PAIRS if pair not in installed]
    if missing:
        package.update_package_index()
        available = package.get_available_packages()
        for source, target in missing:
            model = next((p for p in available if p.from_code == source and p.to_code == target), None)
            if model is None:
                raise RuntimeError(f'Model unavailable: {source} -> {target}')
            print(f'Installing Argos model: {source} -> {target}', flush=True)
            package.install_from_path(model.download())

    from minisbd import models
    models.cache_dir = str(settings.data_dir / 'minisbd')
    for code in ('pt', 'en', 'es'):
        models.get_model_file(code)

    # Warm up all directions during setup, including sentence-splitting models.
    from app.services.argos_translation_service import ArgosTranslator
    samples = {'en': 'Hello world.', 'pt': 'Olá mundo.', 'es': 'Hola mundo.'}
    for source, text in samples.items():
        for target in samples:
            if source != target:
                result = ArgosTranslator(source, target).translate(text)
                if not result or not result.strip():
                    raise RuntimeError(f'Empty translation: {source} -> {target}')
                print(f'Validated: {source} -> {target}', flush=True)
    print('Argos models ready for offline translation.', flush=True)


if __name__ == '__main__':
    install_models()
