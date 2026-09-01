import time
import shutil
from pathlib import Path
from typing import Any


def unlink_with_retries(path: Path, *, logger: Any | None = None, attempts: int = 20, delay_seconds: float = 0.5) -> None:
    last_error: Exception | None = None
    for attempt in range(attempts):
        if not path.exists():
            return
        try:
            path.unlink()
            return
        except PermissionError as exc:
            last_error = exc
            time.sleep(delay_seconds)
        except FileNotFoundError:
            return
    
    if last_error is not None:
        if logger:
            logger.warning("file_utils:unlink_retry_exhausted path=%s", path)
        raise last_error


def copy_with_retries(source_path: Path, destination_path: Path, *, logger: Any | None = None, attempts: int = 20, delay_seconds: float = 0.5) -> None:
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            shutil.copy2(source_path, destination_path)
            return
        except PermissionError as exc:
            last_error = exc
            time.sleep(delay_seconds)
            
    if last_error is not None:
        if logger:
            logger.warning(
                "file_utils:copy_retry_exhausted source=%s destination=%s",
                source_path,
                destination_path,
            )
        raise last_error