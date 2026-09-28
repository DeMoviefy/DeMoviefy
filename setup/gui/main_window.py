import queue
import threading
import tkinter as tk
import traceback

from config import BACKEND_DIR, FRONTEND_DIR, LAUNCHER_VERSION, ROOT, TEST_APP
from core.process_manager import ProcessManager
from core.setup_manager import SetupManager
from .theme import Palette, apply_theme, create_palette, detect_system_appearance
from .view import LauncherActions, LauncherState, LauncherView
from utils.env_utils import venv_python
from utils.ffmpeg_utils import download_ffmpeg, ffmpeg_available, ffmpeg_executable_path


class LauncherForm(tk.Tk):
    """Application window and launcher action coordinator."""

    def __init__(self, proxy_url: str | None = None) -> None:
        super().__init__()
        self.title("DeMoviefy Launcher")
        self.geometry("980x700")
        self.minsize(820, 620)

        self.log_queue: queue.Queue[str] = queue.Queue()
        self._closing = False
        self._appearance = detect_system_appearance(self)
        self._palette = create_palette(self._appearance)

        self.state = LauncherState(
            video_path=tk.StringVar(value=""),
            backend_status=tk.StringVar(value="Stopped"),
            frontend_status=tk.StringVar(value="Stopped"),
            setup_status=tk.StringVar(value="Idle"),
            ffmpeg_status=tk.StringVar(value="Unknown"),
            setup_detail=tk.StringVar(value=""),
            install_ai_deps=tk.BooleanVar(value=False),
        )
        self._expose_state_variables()

        self.process_manager = ProcessManager(proxy_url, self._log)
        self.setup_manager = SetupManager(
            self.process_manager, self._log, self._set_setup_state
        )
        self.view = LauncherView(
            self,
            self.state,
            LauncherActions(
                setup=self.trigger_setup,
                install_ffmpeg=self.install_ffmpeg,
                start_backend=self.start_backend,
                start_frontend=self.start_frontend,
                start_all=self.start_all,
                stop_all=self.process_manager.stop_all,
                run_ai_test=self.run_test_ai,
                clear_log=self.clear_log,
                copy_log=self.copy_log,
            ),
            LAUNCHER_VERSION,
            self._palette,
        )
        self.view.pack(fill=tk.BOTH, expand=True)
        self._expose_view_widgets()
        self._apply_appearance()
        self._update_ffmpeg_status()
        self._log(f"[launcher] DeMoviefy Launcher v{LAUNCHER_VERSION}")
        self._log(f"[launcher] root={ROOT}")

        self.after(100, self._drain_log_queue)
        self.after(1500, self._refresh_system_appearance)
        self.protocol("WM_DELETE_WINDOW", self._on_close)

    def _expose_state_variables(self) -> None:
        self.video_path_var = self.state.video_path
        self.backend_status_var = self.state.backend_status
        self.frontend_status_var = self.state.frontend_status
        self.setup_status_var = self.state.setup_status
        self.ffmpeg_status_var = self.state.ffmpeg_status
        self.setup_detail_var = self.state.setup_detail
        self.install_ai_deps_var = self.state.install_ai_deps

    def _expose_view_widgets(self) -> None:
        self.setup_button = self.view.setup_button
        self.setup_progress = self.view.setup_progress
        self.log_text = self.view.log_text
        self.backend_status_label = self.view.backend_status_label
        self.frontend_status_label = self.view.frontend_status_label

    def report_callback_exception(self, exc, val, tb) -> None:  # type: ignore
        details = "".join(traceback.format_exception(exc, val, tb)).rstrip()
        self._log("[launcher] Tkinter callback exception detected:\n" + details)

    def _apply_appearance(self) -> None:
        self._palette = create_palette(self._appearance)
        apply_theme(self, self._palette)
        self.view.apply_palette(self._palette)

    def _refresh_system_appearance(self) -> None:
        if self._closing:
            return
        appearance = detect_system_appearance(self)
        if appearance != self._appearance:
            self._appearance = appearance
            self._apply_appearance()
        self.after(1500, self._refresh_system_appearance)

    def _log(self, message: str) -> None:
        self.log_queue.put(message)
        try:
            print(message, flush=True)
        except UnicodeEncodeError:
            safe_message = message.encode("utf-8", errors="replace").decode(
                "utf-8", errors="replace"
            )
            print(safe_message, flush=True)

    def clear_log(self) -> None:
        self.log_text.config(state=tk.NORMAL)
        self.log_text.delete("1.0", tk.END)
        self.log_text.config(state=tk.DISABLED)

    def copy_log(self) -> None:
        try:
            self.clipboard_clear()
            self.clipboard_append(self.log_text.get("1.0", tk.END))
            self._log("[launcher] log copied to clipboard")
        except tk.TclError as exc:
            self._log(f"[launcher] copy log failed: {exc}")

    def _drain_log_queue(self) -> None:
        if self._closing:
            return
        while True:
            try:
                line = self.log_queue.get_nowait()
            except queue.Empty:
                break
            self.log_text.config(state=tk.NORMAL)
            self.log_text.insert(tk.END, line + "\n")
            self.log_text.see(tk.END)
            self.log_text.config(state=tk.DISABLED)
        self._refresh_status()
        self.after(100, self._drain_log_queue)

    def _refresh_status(self) -> None:
        backend_running = self.process_manager.is_running("backend")
        frontend_running = self.process_manager.is_running("frontend")

        self.backend_status_var.set("Running" if backend_running else "Stopped")
        self.frontend_status_var.set("Running" if frontend_running else "Stopped")
        self.backend_status_label.configure(
            foreground=(
                self._palette["success"] if backend_running else self._palette["muted"]
            )
        )
        self.frontend_status_label.configure(
            foreground=(
                self._palette["success"] if frontend_running else self._palette["muted"]
            )
        )
        self.setup_detail_var.set(
            f"Backend: {'running' if backend_running else 'stopped'}; "
            f"Frontend: {'running' if frontend_running else 'stopped'}"
        )

    def _set_setup_state(self, running: bool, message: str) -> None:
        def apply() -> None:
            if self._closing:
                return
            self.setup_status_var.set(message)
            if running:
                self.setup_progress.start(10)
                self.setup_button.set_enabled(False)
            else:
                self.setup_progress.stop()
                self.setup_button.set_enabled(True)

        self.after(0, apply)

    def _update_ffmpeg_status(self) -> None:
        status = "Available" if ffmpeg_available() else "Missing"
        if status == "Available":
            status += f" ({ffmpeg_executable_path()})"
        self.ffmpeg_status_var.set(status)

    def install_ffmpeg(self) -> None:
        if ffmpeg_available():
            self._log("[setup] ffmpeg already present")
            return

        def worker() -> None:
            self._set_setup_state(True, "Installing FFmpeg...")
            success = download_ffmpeg()
            self._update_ffmpeg_status()
            self._set_setup_state(
                False, "FFmpeg ready" if success else "FFmpeg install failed"
            )

        threading.Thread(target=worker, daemon=True).start()

    def trigger_setup(self) -> None:
        self.setup_manager.run_setup(install_ai=self.install_ai_deps_var.get())

    def start_backend(self) -> None:
        self.process_manager.start_service(
            "backend", [str(venv_python()), "run.py"], BACKEND_DIR
        )

    def start_frontend(self) -> None:
        self.process_manager.start_service(
            "frontend", ["npm", "run", "dev"], FRONTEND_DIR
        )

    def start_all(self) -> None:
        self.start_backend()
        self.start_frontend()

    def run_test_ai(self) -> None:
        command = [str(venv_python()), str(TEST_APP)]
        if video_path := self.video_path_var.get().strip():
            command.append(video_path)
        self.process_manager.run_oneshot("ai_test", command, ROOT)

    def _on_close(self) -> None:
        self._closing = True
        self.process_manager.stop_all()
        self.destroy()
