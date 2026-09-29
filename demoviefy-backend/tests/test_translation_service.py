import os
from pathlib import Path
from contextlib import closing
import sqlite3
import tempfile
import unittest
from unittest.mock import Mock, patch
from app.services.translation_control import TranslationControl, TranslationError
from app.services.translation_service import translate_segments, translate_segments_to_srt
from app.services.argos_translation_service import ArgosTranslator, normalize_language


class TranslationServiceTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.path = str(Path(directory.name) / 'cache.sqlite3')
        env = patch.dict(os.environ, {'TRANSLATION_CACHE_PATH': self.path})
        env.start()
        self.addCleanup(env.stop)
        self.translator = Mock(source='en', target='pt', cache_key='argos:test:1')
        self.translator.translate.side_effect = lambda text: 'trad:' + text
        factory = patch('app.services.translation_service.ArgosTranslator', return_value=self.translator)
        self.factory = factory.start()
        self.addCleanup(factory.stop)
        self.segments = [{'id': 1, 'start': 0, 'end': 1, 'text': 'Hello'}, {'id': 2, 'start': 1, 'end': 2, 'text': 'World'}]

    def test_preserves_timestamps_and_ignores_blank_segments(self):
        result = translate_segments(self.segments + [{'text': ' '}], 'en', 'pt')
        self.assertEqual(result[1], {'id': 2, 'start': 1, 'end': 2, 'text': 'trad:World'})
        self.assertEqual(len(result), 2)

    def test_cache_survives_failure_and_new_control_instance(self):
        self.translator.translate.side_effect = ['Hello translated', RuntimeError('model failed')]
        with self.assertRaises(TranslationError):
            translate_segments(self.segments, 'en', 'pt')
        self.translator.translate.reset_mock(side_effect=True)
        self.translator.translate.return_value = 'World translated'
        result = translate_segments(self.segments, 'en', 'pt')
        self.translator.translate.assert_called_once_with('World')
        self.assertEqual(result[0]['text'], 'Hello translated')

    def test_legacy_google_cache_is_not_used(self):
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute('CREATE TABLE translations (source TEXT, target TEXT, original TEXT, translated TEXT)')
            db.execute("INSERT INTO translations VALUES ('en', 'pt', 'Hello', 'Google result')")
        self.assertEqual(translate_segments(self.segments[:1], 'en', 'pt')[0]['text'], 'trad:Hello')

    def test_invalid_response_not_cached_or_retried(self):
        self.translator.translate.side_effect = None
        self.translator.translate.return_value = None
        with self.assertRaises(TranslationError) as failure:
            translate_segments(self.segments, 'en', 'pt')
        self.assertEqual(failure.exception.code, 'translation_invalid_result')
        self.translator.translate.assert_called_once()
        self.translator.translate.return_value = 'valid'
        self.assertEqual(translate_segments(self.segments[:1], 'en', 'pt')[0]['text'], 'valid')

    def test_cache_distinguishes_model_languages_and_text(self):
        control = TranslationControl()
        control.translate(self.translator, 'Hello')
        control.translate(self.translator, 'Hello')
        self.translator.cache_key = 'argos:test:2'
        control.translate(self.translator, 'Hello')
        self.translator.target = 'es'
        control.translate(self.translator, 'Hello')
        self.translator.source = 'pt'
        control.translate(self.translator, 'Hello')
        control.translate(self.translator, 'World')
        self.assertEqual(self.translator.translate.call_count, 5)

    def test_srt_requires_explicit_source_and_preserves_timestamps(self):
        first = translate_segments_to_srt(self.segments, target_lang='pt', source_lang='en')
        second = translate_segments_to_srt(self.segments, target_lang='pt', source_lang='en')
        self.assertEqual(first, second)
        self.assertIn('00:00:01,000 --> 00:00:02,000', first)
        self.factory.assert_called_with('en', 'pt')
        self.assertEqual(self.translator.translate.call_count, 2)

    def test_equal_language_aliases_rejected(self):
        with self.assertRaises(ValueError):
            translate_segments(self.segments, 'pt-BR', 'pt')
        self.factory.assert_not_called()

    def test_invalid_language(self):
        for language in ('auto', None, 'fr'):
            with self.assertRaises(TranslationError) as failure:
                normalize_language(language)
            self.assertEqual(failure.exception.status_code, 400)

    @patch('app.services.argos_translation_service.load_argos')
    def test_missing_models(self, load):
        package, translate = Mock(), Mock()
        translate.get_installed_languages.return_value = []
        load.return_value = package, translate
        with self.assertRaises(TranslationError) as failure:
            ArgosTranslator('pt', 'es')
        self.assertEqual(failure.exception.code, 'translation_models_missing')

    @patch('app.services.argos_translation_service.version', return_value='1.11.0')
    @patch('app.services.argos_translation_service.load_argos')
    def test_argos_uses_installed_route_and_model_versions(self, load, version):
        origin, target, model = Mock(code='pt'), Mock(code='es'), Mock()
        origin.get_translation.return_value = model
        package, translate = Mock(), Mock()
        package.get_installed_packages.return_value = [Mock(from_code='pt', to_code='en', package_version='1')]
        translate.get_installed_languages.return_value = [origin, target]
        load.return_value = package, translate
        first = ArgosTranslator('pt', 'es')
        first.translate('text')
        model.translate.assert_called_once_with('text')
        origin.get_translation.assert_called_once_with(target)
        package.get_installed_packages.return_value[0].package_version = '2'
        self.assertNotEqual(first.cache_key, ArgosTranslator('pt', 'es').cache_key)

if __name__ == '__main__':
    unittest.main()
