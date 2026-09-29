"""Persistent cache for local translation; legacy Google tables are left intact."""
from contextlib import closing
import os
from pathlib import Path
import sqlite3

from app.config.paths import UPLOADS_DIR


class TranslationError(RuntimeError):
    def __init__(self, message, code, status_code):
        super().__init__(message)
        self.code = code
        self.status_code = status_code


class TranslationControl:
    def __init__(self):
        self.path = Path(os.getenv('TRANSLATION_CACHE_PATH', str(UPLOADS_DIR / 'translation_cache.sqlite3')))
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with closing(self.connect()) as db, db:
            db.execute('CREATE TABLE IF NOT EXISTS local_translations (engine TEXT, source TEXT, target TEXT, original TEXT, translated TEXT NOT NULL, PRIMARY KEY(engine, source, target, original))')

    def connect(self):
        return sqlite3.connect(self.path, timeout=30)

    def translate(self, translator, text):
        key = (translator.cache_key, translator.source, translator.target, text)
        with closing(self.connect()) as db:
            row = db.execute('SELECT translated FROM local_translations WHERE engine=? AND source=? AND target=? AND original=?', key).fetchone()
        if row:
            return row[0]
        try:
            result = translator.translate(text)
        except TranslationError:
            raise
        except Exception as exc:
            raise TranslationError('Falha ao executar o modelo local de tradução. Os segmentos concluídos foram preservados.', 'translation_failed', 500) from exc
        if not isinstance(result, str) or not result.strip():
            raise TranslationError('O modelo local retornou uma tradução vazia ou inválida.', 'translation_invalid_result', 500)
        with closing(self.connect()) as db, db:
            db.execute('INSERT OR REPLACE INTO local_translations VALUES (?, ?, ?, ?, ?)', (*key, result.strip()))
        return result.strip()
