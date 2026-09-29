"""Configure Argos before importing it, using project-local model storage."""
import os
from app.config.paths import UPLOADS_DIR


def configure_argos():
    root = UPLOADS_DIR / 'argos'
    os.environ.setdefault('ARGOS_PACKAGES_DIR', str(root / 'packages'))
    os.environ.setdefault('XDG_DATA_HOME', str(root / 'data'))
    os.environ.setdefault('XDG_CACHE_HOME', str(root / 'cache'))
    os.environ.setdefault('XDG_CONFIG_HOME', str(root / 'config'))
    # Force the local engine, even if the host has an API provider configured.
    os.environ['ARGOS_MODEL_PROVIDER'] = 'OPENNMT'
    os.environ['ARGOS_CHUNK_TYPE'] = 'MINISBD'
