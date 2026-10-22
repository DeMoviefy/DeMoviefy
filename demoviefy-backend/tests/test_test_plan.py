"""Automated acceptance tests derived from the official DeMoviefy test plan.

Tips:
* Run all scenarios from the repository root with ``.\\demoviefy-backend\\test.ps1 -All``.
* Run one scenario with ``.\\demoviefy-backend\\test.ps1 -Test CT03``.
* These tests validate HTTP contracts and workflow states. They deliberately do
  not run Whisper or YOLO, which keeps the suite fast and deterministic.
* When adding a scenario, use the CT identifier in the test name so it appears
  in the PowerShell menu and can be selected with ``-Test``.
"""

from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from sqlalchemy.engine import URL

from app import create_app, db
from app.models.video import Video
from app.repositories.video_repository import create_video, update_status


# A stable catalog response is enough for controller tests; no real model file
# is required. Copy it with ``dict(AI_CONFIG)`` whenever it leaves the fixture
# so a test cannot accidentally mutate the shared baseline.
AI_CONFIG = {
    "task_type": "object_detection",
    "task_label": "Deteccao de objetos",
    "model_path": "tests/model.pt",
    "model_relative_path": "tests/model.pt",
    "model_name": "model.pt",
    "frame_stride": 8,
    "confidence_threshold": 0.35,
    "max_frames": 300,
    "clip_start_sec": 0.0,
    "clip_end_sec": None,
}


class FakeJobQueue:
    """Records queued work without creating worker threads in controller tests."""

    def __init__(self, queued_jobs):
        self.queued_jobs = queued_jobs

    def enqueue(self, video_id):
        job_id = f"job-{video_id}"
        self.queued_jobs.append((video_id, job_id))
        return job_id


class DeMoviefyTestPlan(unittest.TestCase):
    """Each test gets a clean SQLite database and a private temporary folder."""

    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        self.root = Path(self.temp_dir.name)
        self.queued_jobs = []

        def allocate_video_path(filename):
            source = Path(filename)
            candidate = self.root / filename
            suffix = 1
            while candidate.exists():
                candidate = self.root / f"{source.stem}_{suffix}{source.suffix}"
                suffix += 1
            return candidate

        # Patch dependencies where the controller *uses* them, rather than at
        # their original module. This is the reliable unittest.mock pattern for
        # names imported with ``from module import name``.
        #
        # The queue is replaced by an in-memory recorder, so controller tests
        # prove scheduling without starting real workers or AI jobs.
        self.patches = [
                patch("app.controllers.video_controller.video_file_path", lambda name: self.root / name),
                patch("app.controllers.video_controller.analysis_file_path", lambda video_id: self.root / f"analysis-{video_id}.json"),
                patch("app.controllers.video_controller.annotated_video_path", lambda video_id: self.root / f"annotated-{video_id}.mp4"),
                patch("app.controllers.video_controller.transcription_file_path", lambda video_id: self.root / f"transcription-{video_id}.json"),
                patch("app.controllers.video_controller.ensure_storage_dirs", lambda: self.root.mkdir(exist_ok=True)),
                patch("app.controllers.video_controller.to_repo_relative", lambda path: str(path)),
                patch("app.controllers.video_controller.unique_video_file_path", allocate_video_path),
                patch("app.controllers.video_controller.resolve_ai_config", return_value={
                    "task_type": "object_detection",
                    "task_label": "Detecção de Objetos",
                    "model_path": "models/yolo.pt",
                    "model_relative_path": "models/yolo.pt",
                    "model_name": "YOLO",
                }),
                patch("app.controllers.video_controller.save_ai_config", lambda *_args, **_kwargs: dict(AI_CONFIG)),
                patch("app.controllers.video_controller.save_processing_state", lambda *_args, **_kwargs: None),
                patch("app.controllers.video_controller.load_ai_config", lambda _video_id: dict(AI_CONFIG)),
                patch("app.controllers.video_controller.load_processing_state", lambda _video_id: {
                    "processing_progress": 1,
                    "processing_stage": "queued",
                    "processing_eta_seconds": None,
                    "processing_message": "Na fila.",
                }),
                patch("app.controllers.video_controller.has_analysis", lambda _video_id: False),
                patch("app.controllers.video_controller.has_annotated_video", lambda _video_id: False),
                patch("app.controllers.video_controller.has_transcription", lambda _video_id: False),
                patch("app.controllers.video_controller.list_analysis_variants", lambda _video_id: []),
                patch("app.controllers.video_controller.get_job_queue", return_value=FakeJobQueue(self.queued_jobs)),
            ]


        for active_patch in self.patches:
            active_patch.start()

        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite://",
            "ADMIN_USER_ID": None,
        })
        self.client = self.app.test_client()
        registration = self.client.post("/users", json={
            "nome": "Usuário de teste",
            "email": "owner@example.com",
            "senha": "senha-segura-123",
            "senha_confirmada": "senha-segura-123",
        })
        if registration.status_code != 201:
            raise AssertionError(f"Failed to create test user: {registration.get_json()}")
        self.user_id = registration.get_json()["id"]
        login = self.client.post("/users/login", json={
            "email": "owner@example.com",
            "senha": "senha-segura-123",
        })
        if login.status_code != 200:
            raise AssertionError(f"Failed to authenticate test user: {login.get_json()}")

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            # SQLite keeps a file handle open on Windows until the engine is
            # disposed. Without this, TemporaryDirectory cleanup can fail.
            db.engine.dispose()
        for active_patch in reversed(self.patches):
            active_patch.stop()
        self.temp_dir.cleanup()

    def create_video(self, status="PROCESSADO"):
        """Create a database record for tests that start after upload."""
        with self.app.app_context():
            video = create_video(filename="video_teste.mp4", user_id=self.user_id)
            update_status(video, status)
            return video.id

    def upload(self, filename="video_teste.mp4", **fields):
        """Send a minimal in-memory multipart file to the real upload route."""
        fields["file"] = (BytesIO(b"test video"), filename)
        return self.client.post(
            "/videos",
            data=fields,
            content_type="multipart/form-data",
        )

    def test_ct01_accepts_supported_video_and_queues_processing(self):
        # The file bytes assertion protects against a false success response:
        # it confirms the upload route actually saved the selected file.
        response = self.upload()

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["video"]["status"], "PROCESSANDO")
        self.assertEqual(self.queued_jobs, [(payload["video"]["id"], payload["video"]["job_id"])])
        self.assertEqual((self.root / "video_teste.mp4").read_bytes(), b"test video")

    def test_ct02_rejects_unsupported_file_before_saving_or_processing(self):
        response = self.upload("documento.txt")

        self.assertEqual(response.status_code, 400)
        self.assertIn("Formato", response.get_json()["error"])
        self.assertFalse((self.root / "documento.txt").exists())
        self.assertEqual(self.queued_jobs, [])

    def test_ct03_returns_ready_transcription_for_clean_audio(self):
        # The transcription artifact is mocked at the storage boundary. Keep
        # model-quality/accuracy checks in a separate dataset evaluation suite.
        video_id = self.create_video()
        transcription = {
            "content": "Esta e uma transcricao clara.", "source": "whisper", "language": "pt",
            "segments": [{"id": 1, "start": 0, "end": 2, "text": "Esta e uma transcricao clara."}],
            "model_name": "base", "status": "ready", "error": None,
        }
        with patch("app.controllers.video_controller.load_transcription", return_value=transcription):
            response = self.client.get(f"/videos/{video_id}/transcription")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["available"])
        self.assertEqual(response.get_json()["transcription"]["content"], transcription["content"])

    def test_ct04_keeps_flow_available_when_low_quality_audio_has_gaps(self):
        # A placeholder such as [inaudivel] is acceptable here; CT04 requires
        # the result screen to remain usable, not perfect speech recognition.
        video_id = self.create_video()
        low_quality_result = {
            "content": "[inaudivel] precisamos sair", "source": "whisper", "language": "pt",
            "segments": [], "model_name": "base", "status": "ready", "error": None,
        }
        with patch("app.controllers.video_controller.load_transcription", return_value=low_quality_result):
            response = self.client.get(f"/videos/{video_id}/transcription")

        self.assertEqual(response.status_code, 200)
        self.assertIn("[inaudivel]", response.get_json()["transcription"]["content"])

    def test_ct05_returns_sensitive_content_category_and_critical_detection(self):
        # The timestamp is important: the frontend uses detections to point the
        # user to the critical excerpt, not only to show a category label.
        video_id = self.create_video()
        analysis = {"label_counts": {"violence": 1}, "top_labels": ["violence"], "detections": [{"label": "violence", "time_sec": 12.4}]}
        with patch("app.controllers.video_controller.load_analysis", return_value=analysis):
            response = self.client.get(f"/videos/{video_id}/analysis")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["analysis"]["top_labels"], ["violence"])
        self.assertEqual(response.get_json()["analysis"]["detections"][0]["time_sec"], 12.4)

    def test_ct06_does_not_expose_partial_artifacts_while_processing(self):
        # 202 is the API contract for pending data. A client should poll again
        # instead of treating this normal processing state as an error.
        video_id = self.create_video(status="PROCESSANDO_IA")
        with patch("app.controllers.video_controller.load_analysis", return_value=None), patch(
            "app.controllers.video_controller.load_transcription", return_value=None
        ):
            analysis_response = self.client.get(f"/videos/{video_id}/analysis")
            transcription_response = self.client.get(f"/videos/{video_id}/transcription")

        self.assertEqual(analysis_response.status_code, 202)
        self.assertFalse(analysis_response.get_json()["available"])
        self.assertEqual(transcription_response.status_code, 202)
        self.assertFalse(transcription_response.get_json()["available"])

    def test_ct07_allows_manual_transcription_updates_but_not_analysis_updates(self):
        video_id = self.create_video()

        analysis_response = self.client.put(f"/videos/{video_id}/analysis", json={"top_labels": ["other"]})
        transcription_response = self.client.put(f"/videos/{video_id}/transcription", json={"content": "alterado"})

        self.assertEqual(analysis_response.status_code, 405)
        self.assertEqual(transcription_response.status_code, 200)
        self.assertEqual(
            transcription_response.get_json()["transcription"]["content"],
            "alterado",
        )

    def test_authenticated_session_cookie_allows_video_reprocessing_and_transcription_edits(self):
        upload_response = self.upload()
        self.assertEqual(upload_response.status_code, 200)
        video_id = upload_response.get_json()["video"]["id"]

        session_response = self.client.get("/users/session")
        with (
            patch("app.controllers.video_controller.whisper_available", return_value=True),
            patch(
                "app.controllers.video_controller.transcribe_video_with_timestamps",
                return_value={
                    "content": "Transcrição gerada",
                    "source": "whisper",
                    "language": "pt",
                    "segments": [{"id": 0, "start": 0, "end": 1, "text": "Transcrição gerada"}],
                    "model_name": "base",
                    "status": "ready",
                    "error": None,
                },
            ),
        ):
            transcription_generation_response = self.client.post(
                f"/videos/{video_id}/transcription/generate",
                json={"language": "pt", "model_name": "base"},
            )
        reprocess_response = self.client.post(
            f"/videos/{video_id}/reprocess",
            json=dict(AI_CONFIG),
        )
        transcription_response = self.client.put(
            f"/videos/{video_id}/transcription",
            json={
                "content": "Transcrição atualizada",
                "segments": [{"id": 0, "start": 0, "end": 1, "text": "Transcrição atualizada"}],
            },
        )
        with patch("app.controllers.video_controller.delete_video_artifacts"):
            delete_response = self.client.delete(f"/videos/{video_id}")

        self.assertEqual(session_response.status_code, 200)
        self.assertFalse(session_response.get_json()["is_guest"])
        self.assertEqual(transcription_generation_response.status_code, 200)
        self.assertEqual(reprocess_response.status_code, 200)
        self.assertEqual(transcription_response.status_code, 200)
        self.assertEqual(delete_response.status_code, 200)
        self.assertFalse(self.client.get("/users/session").get_json()["is_guest"])
        self.assertEqual(
            self.queued_jobs,
            [(video_id, f"job-{video_id}"), (video_id, f"job-{video_id}")],
        )

    def test_video_cors_preflight_does_not_require_the_owner_session_cookie(self):
        video_id = self.create_video()

        response = self.app.test_client().open(
            f"/videos/{video_id}/reprocess",
            method="OPTIONS",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get("Access-Control-Allow-Origin"),
            "http://localhost:5173",
        )
        self.assertIn(
            "POST",
            response.headers.get("Access-Control-Allow-Methods", ""),
        )
        self.assertEqual(response.headers.get("Access-Control-Allow-Credentials"), "true")

    def test_ct08_accepts_multiple_uploads_and_queues_each_request(self):
        # This covers application-level queue initiation. Use a separate load
        # test against Nginx + Flask for true concurrent traffic validation.
        responses = [self.upload(f"video_{index}.mp4") for index in range(3)]

        self.assertEqual([response.status_code for response in responses], [200, 200, 200])
        self.assertEqual(len(self.queued_jobs), 3)
        self.assertEqual(len({video_id for video_id, _ in self.queued_jobs}), 3)

    def test_ct09_keeps_duplicate_filenames_in_separate_files(self):
        first_response = self.upload("same_name.mp4")
        second_response = self.upload("same_name.mp4")

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 200)
        first_payload = first_response.get_json()
        second_payload = second_response.get_json()

        self.assertNotEqual(
            first_payload["video"]["filename"],
            second_payload["video"]["filename"],
        )
        self.assertEqual(
            (self.root / first_payload["video"]["filename"]).read_bytes(),
            b"test video",
        )
        self.assertEqual(
            (self.root / second_payload["video"]["filename"]).read_bytes(),
            b"test video",
        )

    def test_ct10_deletes_video_after_cleaning_its_artifacts(self):
        video_id = self.create_video()

        with patch("app.controllers.video_controller.delete_video_artifacts") as cleanup:
            response = self.client.delete(f"/videos/{video_id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["message"], "Vídeo removido com sucesso")
        cleanup.assert_called_once()
        self.assertEqual(cleanup.call_args.args, (video_id, "video_teste.mp4"))
        with self.app.app_context():
            self.assertIsNone(Video.query.filter_by(id=video_id).first())

    def test_ct11_keeps_video_record_when_artifact_cleanup_fails(self):
        video_id = self.create_video()

        with patch(
            "app.controllers.video_controller.delete_video_artifacts",
            side_effect=OSError("storage unavailable"),
        ):
            response = self.client.delete(f"/videos/{video_id}")

        self.assertEqual(response.status_code, 500)
        self.assertIn("arquivos relacionados", response.get_json()["error"])
        with self.app.app_context():
            self.assertIsNotNone(Video.query.filter_by(id=video_id).first())

    def test_ct12_limits_video_visibility_to_owner_and_admin(self):
        owned_video_id = self.create_video()

        second_client = self.app.test_client()
        registration = second_client.post("/users", json={
            "nome": "Outro usuário",
            "email": "other@example.com",
            "senha": "senha-segura-123",
            "senha_confirmada": "senha-segura-123",
        })
        self.assertEqual(registration.status_code, 201)
        other_user_id = registration.get_json()["id"]
        self.assertEqual(
            second_client.post("/users/login", json={
                "email": "other@example.com",
                "senha": "senha-segura-123",
            }).status_code,
            200,
        )

        with self.app.app_context():
            other_video = create_video(filename="video_outro.mp4", user_id=other_user_id)
            other_video_id = other_video.id

        owner_video_ids = {video["id"] for video in self.client.get("/videos").get_json()}
        self.assertEqual(owner_video_ids, {owned_video_id})
        self.assertEqual(second_client.get("/videos").get_json()[0]["id"], other_video_id)
        self.assertEqual(second_client.get(f"/videos/{owned_video_id}").status_code, 404)

        self.app.config["ADMIN_USER_ID"] = other_user_id
        admin_video_ids = {
            video["id"] for video in second_client.get("/videos").get_json()
        }
        self.assertEqual(admin_video_ids, {owned_video_id, other_video_id})
        self.assertEqual(second_client.get(f"/videos/{owned_video_id}").status_code, 200)

    def test_sec05_allows_private_guest_video_access_without_account(self):
        guest_client = self.app.test_client()

        self.assertEqual(guest_client.get("/videos").status_code, 200)
        upload_response = guest_client.post(
                "/videos",
                data={"file": (BytesIO(b"test video"), "video.mp4")},
                content_type="multipart/form-data",
            )
        self.assertEqual(upload_response.status_code, 200)
        video_id = upload_response.get_json()["video"]["id"]
        self.assertEqual(
            guest_client.get(f"/videos/{video_id}").status_code,
            200,
        )

    def test_ct13_limits_guest_uploads_and_isolates_guest_sessions(self):
        guest_client = self.app.test_client()
        session_status = guest_client.get("/users/session").get_json()
        self.assertTrue(session_status["is_guest"])
        self.assertEqual(session_status["guest_video_count"], 0)

        responses = [
            guest_client.post(
                "/videos",
                data={"file": (BytesIO(b"guest video"), f"guest_{index}.mp4")},
                content_type="multipart/form-data",
            )
            for index in range(3)
        ]
        self.assertEqual([response.status_code for response in responses], [200, 200, 200])
        guest_video_ids = {
            video["id"] for video in guest_client.get("/videos").get_json()
        }
        self.assertEqual(len(guest_video_ids), 3)

        limit_response = guest_client.post(
            "/videos",
            data={"file": (BytesIO(b"extra video"), "guest_extra.mp4")},
            content_type="multipart/form-data",
        )
        self.assertEqual(limit_response.status_code, 403)
        self.assertEqual(limit_response.get_json()["code"], "guest_video_limit_reached")

        another_guest = self.app.test_client()
        self.assertEqual(another_guest.get("/videos").get_json(), [])
        self.assertEqual(
            another_guest.get(f"/videos/{next(iter(guest_video_ids))}").status_code,
            404,
        )
        self.assertEqual(
            guest_client.get("/users/session").get_json()["guest_video_count"],
            3,
        )

    def test_ct14_purges_guest_videos_when_backend_restarts(self):
        database_url = URL.create(
            "sqlite",
            database=str(self.root / "startup-cleanup.db"),
        )
        first_app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": database_url,
            "ADMIN_USER_ID": None,
        })
        registration = first_app.test_client().post("/users", json={
            "nome": "Usuário persistente",
            "email": "persistent@example.com",
            "senha": "senha-segura-123",
            "senha_confirmada": "senha-segura-123",
        })
        self.assertEqual(registration.status_code, 201)

        with first_app.app_context():
            guest_video = create_video(
                filename="guest_restart.mp4",
                guest_token="guest-token-from-before-restart",
            )
            guest_video_id = guest_video.id
            owned_video = create_video(
                filename="account_video.mp4",
                user_id=registration.get_json()["id"],
            )
            owned_video_id = owned_video.id
            db.session.remove()
            db.engine.dispose()

        with patch(
            "app.services.video_artifact_service.delete_video_artifacts"
        ) as cleanup:
            restarted_app = create_app({
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": database_url,
                "ADMIN_USER_ID": None,
            })

        cleanup.assert_called_once_with(
            guest_video_id,
            "guest_restart.mp4",
            logger=restarted_app.logger,
        )
        with restarted_app.app_context():
            self.assertIsNone(db.session.get(Video, guest_video_id))
            self.assertIsNotNone(db.session.get(Video, owned_video_id))
            db.session.remove()
            db.engine.dispose()

    def test_missing_video_dependency_sets_actionable_processing_error(self):
        from app.services.frame_ai_service import ProcessingDependencyError
        from app.services.video_service import process_video

        video_id = self.create_video(status="PROCESSANDO")
        video_path = self.root / "video_teste.mp4"
        video_path.write_bytes(b"test video")
        dependency_error = ProcessingDependencyError(
            "A análise de vídeo exige OpenCV. Instale os pacotes de IA."
        )

        with (
            patch("app.services.video_service.video_file_path", return_value=video_path),
            patch("app.services.video_service.ensure_storage_dirs"),
            patch("app.services.video_service.load_ai_config", return_value=dict(AI_CONFIG)),
            patch("app.services.video_service.save_processing_state") as save_state,
            patch(
                "app.services.video_service.analyze_video_frames",
                side_effect=dependency_error,
            ),
        ):
            with self.assertRaises(ProcessingDependencyError):
                process_video(self.app, video_id)

        with self.app.app_context():
            video = db.session.get(Video, video_id)
            self.assertEqual(video.status, "ERRO_IA")

        self.assertEqual(
            save_state.call_args.kwargs["message"],
            str(dependency_error),
        )

    def test_missing_opencv_raises_typed_processing_dependency_error(self):
        import builtins

        from app.services.frame_ai_service import (
            ProcessingDependencyError,
            analyze_video_frames,
        )

        original_import = builtins.__import__

        def import_without_opencv(name, *args, **kwargs):
            if name == "cv2":
                raise ModuleNotFoundError("No module named 'cv2'")
            return original_import(name, *args, **kwargs)

        with patch("builtins.__import__", side_effect=import_without_opencv):
            with self.assertRaisesRegex(
                ProcessingDependencyError,
                "Instalar Pacotes de IA",
            ):
                analyze_video_frames(video_path="missing-dependency.mp4")

    def test_missing_video_dependency_does_not_retry_job(self):
        from app.services.frame_ai_service import ProcessingDependencyError
        from app.services.job_queue_service import JobQueueService, JobStatus, VideoJob

        job_queue = JobQueueService(self.app, worker_count=0)
        job = VideoJob(job_id="missing-dependency", video_id=123)
        dependency_error = ProcessingDependencyError(
            "A análise de vídeo exige OpenCV."
        )

        with (
            patch(
                "app.services.video_service.process_video",
                side_effect=dependency_error,
            ),
            patch("app.services.job_queue_service.threading.Timer") as timer,
        ):
            job_queue._execute(job)

        self.assertEqual(job.status, JobStatus.FAILED)
        self.assertEqual(job.attempt, 1)
        self.assertEqual(job.error, str(dependency_error))
        timer.assert_not_called()

    def test_sec01_sanitizes_traversal_filename(self):
        response = self.upload("../../outside.mp4")

        self.assertEqual(response.status_code, 200)
        stored_filename = response.get_json()["video"]["filename"]
        stored_path = self.root / stored_filename
        self.assertEqual(stored_path.parent, self.root)
        self.assertNotIn("..", Path(stored_filename).parts)
        self.assertTrue(stored_path.exists())
        self.assertFalse((self.root.parent / "outside.mp4").exists())

    def test_sec02_rejects_invalid_processing_parameters(self):
        invalid_requests = [
            ({"frame_stride": "0"}, "frame_stride precisa ser pelo menos 1."),
            ({"max_frames": "0"}, "max_frames precisa ser pelo menos 1."),
            ({"confidence_threshold": "2"}, "confidence_threshold precisa ficar entre 0 e 1."),
            ({"clip_start_sec": "-1"}, "O início do trecho não pode ser negativo."),
            ({"clip_start_sec": "10", "clip_end_sec": "5"}, "O fim do trecho precisa ser maior que o início."),
        ]

        for fields, expected_error in invalid_requests:
            with self.subTest(fields=fields):
                response = self.upload(**fields)
                self.assertEqual(response.status_code, 400)
                self.assertEqual(response.get_json()["error"], expected_error)
                self.assertEqual(self.queued_jobs, [])

    def test_sec03_rejects_unknown_status_without_changing_video(self):
        video_id = self.create_video(status="PROCESSADO")

        response = self.client.patch(
            f"/videos/{video_id}",
            json={"status": "ADMIN"},
        )

        self.assertEqual(response.status_code, 400)
        with self.app.app_context():
            video = db.session.get(Video, video_id)
            self.assertEqual(video.status, "PROCESSADO")

    def test_sec04_returns_not_found_for_unknown_video(self):
        for endpoint in (
            "/videos/999999",
            "/videos/999999/file",
            "/videos/999999/analysis",
            "/videos/999999/transcription",
        ):
            with self.subTest(endpoint=endpoint):
                self.assertEqual(self.client.get(endpoint).status_code, 404)
