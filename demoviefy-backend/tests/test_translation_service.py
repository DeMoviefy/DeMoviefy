import unittest
from unittest.mock import Mock, patch

from app.services.translation_service import translate_segments


class TranslationServiceTests(unittest.TestCase):
    @patch("app.services.translation_service.GoogleTranslator")
    def test_translates_segments_in_one_batch(self, translator_class):
        translator = translator_class.return_value
        translator.translate_batch.return_value = ["Olá", "Mundo"]

        result = translate_segments(
            [
                {"id": 1, "start": 0, "end": 1, "text": "Hello"},
                {"id": 2, "start": 1, "end": 2, "text": "World"},
            ],
            source_lang="en",
            target_lang="pt",
        )

        translator.translate_batch.assert_called_once_with(["Hello", "World"])
        self.assertEqual([segment["text"] for segment in result], ["Olá", "Mundo"])

    @patch("app.services.translation_service.GoogleTranslator")
    def test_splits_large_translations_into_batches(self, translator_class):
        translator = translator_class.return_value
        translator.translate_batch.side_effect = lambda batch: [f"translated:{text}" for text in batch]
        segments = [
            {"id": index, "start": index, "end": index + 1, "text": f"text-{index}"}
            for index in range(51)
        ]

        result = translate_segments(segments, source_lang="en", target_lang="pt")

        self.assertEqual(translator.translate_batch.call_count, 2)
        self.assertEqual(len(result), 51)
        self.assertEqual(result[-1]["text"], "translated:text-50")

    def test_rejects_equal_source_and_target_languages_without_translator_call(self):
        with patch("app.services.translation_service.GoogleTranslator") as translator_class:
            with self.assertRaises(ValueError):
                translate_segments(
                    [{"id": 1, "start": 0, "end": 1, "text": "Olá"}],
                    source_lang="pt",
                    target_lang="pt",
                )
            translator_class.assert_not_called()


if __name__ == "__main__":
    unittest.main()
