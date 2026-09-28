from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from app.services import video_artifact_service


class DeleteVideoArtifactsTests(unittest.TestCase):
    def test_deletes_only_files_belonging_to_selected_video(self):
        with TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            uploads = root / "uploads"
            analysis = uploads / "analysis"
            annotated = uploads / "annotated"
            transcriptions = uploads / "transcriptions"
            legacy_transcriptions = root / "backend" / "uploads" / "transcriptions"
            metadata = uploads / "metadata"
            directories = (
                analysis,
                annotated,
                transcriptions,
                legacy_transcriptions,
                metadata,
            )
            for directory in directories:
                directory.mkdir(parents=True)

            owned_paths = (
                uploads / "same_name.mp4",
                analysis / "video_7.json",
                analysis / "video_7__variant-a.json",
                annotated / "video_7.mp4",
                annotated / "video_7__variant-a.mp4",
                annotated / "video_7.processing.mp4",
                transcriptions / "video_7.json",
                transcriptions / "video_7_pt.json",
                transcriptions / "video_7_en.srt",
                legacy_transcriptions / "video_7_pt.srt",
                metadata / "video_7.json",
            )
            sibling_paths = (
                uploads / "same_name_123456789abc.mp4",
                analysis / "video_70.json",
                annotated / "video_70.mp4",
                transcriptions / "video_70_en.srt",
                metadata / "video_70.json",
            )
            for path in (*owned_paths, *sibling_paths):
                path.write_bytes(b"artifact")

            with (
                patch.object(video_artifact_service, "ANALYSIS_DIR", analysis),
                patch.object(video_artifact_service, "ANNOTATED_DIR", annotated),
                patch.object(video_artifact_service, "TRANSCRIPTIONS_DIR", transcriptions),
                patch.object(video_artifact_service, "BACKEND_ROOT", root / "backend"),
                patch.object(video_artifact_service, "METADATA_DIR", metadata),
                patch.object(
                    video_artifact_service,
                    "video_file_path",
                    lambda filename: uploads / filename,
                ),
            ):
                video_artifact_service.delete_video_artifacts(7, "same_name.mp4")

            self.assertTrue(all(not path.exists() for path in owned_paths))
            self.assertTrue(all(path.exists() for path in sibling_paths))


if __name__ == "__main__":
    unittest.main()
