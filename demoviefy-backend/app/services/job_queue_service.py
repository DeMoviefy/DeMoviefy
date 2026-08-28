"""In-process queue for bounded, asynchronous video processing."""

import threading
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from queue import Empty, Full, Queue


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    RETRYING = "retrying"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class VideoJob:
    job_id: str
    video_id: int
    attempt: int = 1
    max_attempts: int = 3
    status: JobStatus = JobStatus.PENDING
    error: str | None = None
    created_at: float = field(default_factory=time.time)

    def retry_delay_seconds(self) -> int:
        return min(2 ** (self.attempt - 1), 60)


class JobQueueService:
    """A bounded worker pool tied to one Flask application instance."""

    def __init__(self, app, *, worker_count: int = 3, max_queue_size: int = 100):
        self.app = app
        self.jobs: Queue[VideoJob] = Queue(maxsize=max_queue_size)
        self.worker_count = worker_count
        self._shutdown = threading.Event()
        self._lock = threading.Lock()
        self._workers: list[threading.Thread] = []
        self._jobs_by_video: dict[int, VideoJob] = {}
        self._video_locks: dict[int, threading.Lock] = {}

    def start(self) -> None:
        if self._workers:
            return
        for index in range(self.worker_count):
            worker = threading.Thread(target=self._worker_loop, name=f"video-worker-{index + 1}", daemon=True)
            worker.start()
            self._workers.append(worker)

    def enqueue(self, video_id: int, *, job_id: str | None = None) -> str:
        if self._shutdown.is_set():
            raise RuntimeError("A fila de processamento está sendo encerrada.")
        job = VideoJob(job_id=job_id or str(uuid.uuid4()), video_id=video_id)
        try:
            self.jobs.put_nowait(job)
        except Full as exc:
            raise RuntimeError("A fila de processamento está cheia.") from exc
        with self._lock:
            self._jobs_by_video[video_id] = job
        self.app.logger.info("job:enqueued id=%s video_id=%s", job.job_id, video_id)
        return job.job_id

    def status_for_video(self, video_id: int) -> dict | None:
        with self._lock:
            job = self._jobs_by_video.get(video_id)
            if job is None:
                return None
            return {"id": job.job_id, "status": job.status, "attempt": job.attempt, "max_attempts": job.max_attempts, "error": job.error}

    def stop(self, timeout: float = 5) -> None:
        self._shutdown.set()
        for worker in self._workers:
            worker.join(timeout=timeout)
        self._workers.clear()

    def _worker_loop(self) -> None:
        while not self._shutdown.is_set():
            try:
                job = self.jobs.get(timeout=0.5)
            except Empty:
                continue
            try:
                with self._lock:
                    lock = self._video_locks.setdefault(job.video_id, threading.Lock())
                with lock:
                    self._execute(job)
            finally:
                self.jobs.task_done()

    def _execute(self, job: VideoJob) -> None:
        job.status = JobStatus.RUNNING
        try:
            with self.app.app_context():
                from app.services.video_service import process_video
                process_video(self.app, job.video_id)
            job.status = JobStatus.COMPLETED
            job.error = None
            self.app.logger.info("job:completed id=%s video_id=%s", job.job_id, job.video_id)
            self._finish(job)
        except Exception as exc:
            job.error = str(exc)
            if job.attempt >= job.max_attempts or self._shutdown.is_set():
                job.status = JobStatus.FAILED
                self.app.logger.exception("job:failed id=%s video_id=%s", job.job_id, job.video_id)
                self._finish(job)
                return
            job.status = JobStatus.RETRYING
            delay = job.retry_delay_seconds()
            job.attempt += 1
            self.app.logger.warning("job:retrying id=%s video_id=%s next_attempt=%s delay=%ss", job.job_id, job.video_id, job.attempt, delay)
            threading.Timer(delay, self._requeue, args=(job,)).start()

    def _requeue(self, job: VideoJob) -> None:
        if self._shutdown.is_set():
            return
        try:
            self.jobs.put_nowait(job)
        except Full:
            job.status = JobStatus.FAILED
            job.error = "A fila estava cheia durante a repetição automática."
            self._finish(job)

    def _finish(self, job: VideoJob) -> None:
        with self._lock:
            if self._jobs_by_video.get(job.video_id) is job:
                self._jobs_by_video.pop(job.video_id, None)


def get_job_queue():
    """Return the queue owned by the current Flask application."""
    from flask import current_app

    queue = current_app.extensions.get("video_job_queue")
    if queue is None:
        queue = JobQueueService(current_app._get_current_object(), worker_count=current_app.config["VIDEO_PROCESSING_WORKERS"], max_queue_size=current_app.config["VIDEO_QUEUE_MAX_SIZE"])
        queue.start()
        current_app.extensions["video_job_queue"] = queue
    return queue
