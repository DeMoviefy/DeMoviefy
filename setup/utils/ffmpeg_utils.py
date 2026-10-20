import http.client
import os
import shutil
import tempfile
import time
import urllib.request
import urllib.error
import zipfile
import platform
import subprocess
from pathlib import Path

from config import FFMPEG_BIN_DIR, FFMPEG_DIR, FFMPEG_DOWNLOAD_URL_WIN


def _download_with_retries(url: str, destination: str, attempts: int = 4) -> None:
    for attempt in range(attempts):
        offset = os.path.getsize(destination) if os.path.exists(destination) else 0
        headers = {"Range": f"bytes={offset}-"} if offset else {}
        request = urllib.request.Request(url, headers=headers)

        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                status = response.getcode()
                if status == 206:
                    content_range = response.headers.get("Content-Range", "")
                    if not offset or not content_range.startswith(f"bytes {offset}-"):
                        raise urllib.error.URLError(
                            f"Unexpected Content-Range for download: {content_range}"
                        )
                    mode = "ab"
                elif status == 200:
                    mode = "wb"
                else:
                    raise urllib.error.URLError(f"Unexpected HTTP status: {status}")

                expected_size = response.headers.get("Content-Length")
                expected_size = int(expected_size) if expected_size is not None else None
                received = 0
                with open(destination, mode) as archive:
                    while True:
                        try:
                            chunk = response.read(1024 * 1024)
                        except http.client.IncompleteRead as exc:
                            if exc.partial:
                                archive.write(exc.partial)
                            raise
                        if not chunk:
                            break
                        archive.write(chunk)
                        received += len(chunk)

                if expected_size is not None and received != expected_size:
                    raise urllib.error.URLError(
                        f"Incomplete download: received {received} of {expected_size} bytes"
                    )
                return
        except (urllib.error.URLError, OSError, http.client.HTTPException) as exc:
            if attempt + 1 == attempts:
                raise
            print(
                f"[setup] ffmpeg download interrupted "
                f"(attempt {attempt + 1}/{attempts}): {exc}. Retrying..."
            )
            time.sleep(2 ** attempt)


def ffmpeg_executable_path() -> Path | None:
    for name in ("ffmpeg", "ffmpeg.exe"):
        if shutil.which(name):
            return Path(shutil.which(name))

    local = FFMPEG_BIN_DIR / ("ffmpeg.exe" if os.name == "nt" else "ffmpeg")
    if local.exists():
        return local
    return None

def ffmpeg_available() -> bool:
    return ffmpeg_executable_path() is not None

def download_ffmpeg() -> bool:
    if ffmpeg_available():
        return True

    system = platform.system()
    
    if system == "Windows":
        archive_path = None
        try:
            FFMPEG_DIR.mkdir(parents=True, exist_ok=True)
            archive_fd, archive_path = tempfile.mkstemp(suffix=".zip")
            os.close(archive_fd)
            print("[setup] Downloading ffmpeg zip for Windows...")
            _download_with_retries(FFMPEG_DOWNLOAD_URL_WIN, archive_path)
            with zipfile.ZipFile(archive_path, "r") as zf:
                members = [m for m in zf.namelist() if m.endswith("ffmpeg.exe") or m.endswith("ffprobe.exe")]
                if not members:
                    print("[setup] ffmpeg.exe not found in zip!")
                    return False
                for member in members:
                    dest_name = Path(member).name
                    target = FFMPEG_BIN_DIR / dest_name
                    FFMPEG_BIN_DIR.mkdir(parents=True, exist_ok=True)
                    with zf.open(member) as src, open(target, "wb") as out:
                        out.write(src.read())
                    target.chmod(0o755)
            return ffmpeg_available()
        except Exception as exc:
            print(f"[setup] Windows ffmpeg install failed: {exc}")
            return False
        finally:
            if archive_path and os.path.exists(archive_path):
                os.remove(archive_path)

    if system == "Linux":
        if shutil.which("apt"):
            try:
                print("[setup] Installing ffmpeg via apt...")
                rc = subprocess.call(["sudo", "apt", "update"])
                rc2 = subprocess.call(["sudo", "apt", "install", "-y", "ffmpeg"])
                if rc == 0 and rc2 == 0 and ffmpeg_available():
                    return True
            except Exception as exc:
                print(f"[setup] apt install failed: {exc}")
        if shutil.which("dnf"):
            try:
                print("[setup] Installing ffmpeg via dnf...")
                rc = subprocess.call(["sudo", "dnf", "install", "-y", "ffmpeg"])
                if rc == 0 and ffmpeg_available():
                    return True
            except Exception as exc:
                print(f"[setup] dnf install failed: {exc}")
        try:
            print("[setup] Downloading static ffmpeg tarball for Linux...")
            url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz"
            archive_fd, archive_path = tempfile.mkstemp(suffix=".tar.xz")
            os.close(archive_fd)
            urllib.request.urlretrieve(url, archive_path)
            import tarfile
            with tarfile.open(archive_path, "r:xz") as tf:
                members = [m for m in tf.getnames() if m.endswith("/bin/ffmpeg") or m.endswith("/bin/ffprobe")]
                if not members:
                    print("[setup] ffmpeg not found in tarball!")
                    return False
                for member in members:
                    dest_name = Path(member).name
                    target = FFMPEG_BIN_DIR / dest_name
                    FFMPEG_BIN_DIR.mkdir(parents=True, exist_ok=True)
                    with tf.extractfile(member) as src, open(target, "wb") as out:
                        out.write(src.read())
                    target.chmod(0o755)
            os.remove(archive_path)
            return ffmpeg_available()
        except Exception as exc:
            print(f"[setup] Linux tarball install failed: {exc}")
            return False

    if system == "Darwin":
        if shutil.which("brew"):
            try:
                print("[setup] Installing ffmpeg via brew...")
                rc = subprocess.call(["brew", "install", "ffmpeg"])
                if rc == 0 and ffmpeg_available():
                    return True
            except Exception as exc:
                print(f"[setup] brew install failed: {exc}")
        try:
            print("[setup] Please install ffmpeg manually using Homebrew: brew install ffmpeg")
            return False
        except Exception as exc:
            print(f"[setup] macOS static install failed: {exc}")
            return False

    print("[setup] Could not install ffmpeg automatically. Please install it manually.")
    return False