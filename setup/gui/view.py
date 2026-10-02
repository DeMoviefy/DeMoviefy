import tkinter as tk
from dataclasses import dataclass
from tkinter import ttk
from typing import Callable

from .theme import Palette
from .widgets import RoundedButton


@dataclass
class LauncherState:
    video_path: tk.StringVar
    backend_status: tk.StringVar
    frontend_status: tk.StringVar
    setup_status: tk.StringVar
    ffmpeg_status: tk.StringVar
    setup_detail: tk.StringVar
    install_ai_deps: tk.BooleanVar


@dataclass(frozen=True)
class LauncherActions:
    setup: Callable[[], None]
    install_ffmpeg: Callable[[], None]
    start_backend: Callable[[], None]
    start_frontend: Callable[[], None]
    start_all: Callable[[], None]
    stop_all: Callable[[], None]
    run_ai_test: Callable[[], None]
    clear_log: Callable[[], None]
    copy_log: Callable[[], None]


class LauncherView(ttk.Frame):
    def __init__(
        self,
        master: tk.Misc,
        state: LauncherState,
        actions: LauncherActions,
        version: str,
        palette: Palette,
    ) -> None:
        super().__init__(master, style="App.TFrame", padding=18)
        self.state = state
        self.actions = actions
        self.version = version
        self._palette = palette
        self.buttons: list[RoundedButton] = []

        self._build_header()
        self._build_status()
        self._build_actions()
        self._build_log()

    def _build_header(self) -> None:
        header = ttk.Frame(self, style="App.TFrame", padding=(2, 4, 2, 14))
        header.pack(fill=tk.X)
        self.title_label = tk.Label(
            header,
            text="DeMoviefy",
            font=("TkDefaultFont", 20, "bold"),
            anchor=tk.W,
        )
        self.title_label.pack(anchor=tk.W)
        self.subtitle_label = tk.Label(
            header,
            text=f"Launcher  •  Version {self.version}",
            font=("TkDefaultFont", 10),
            anchor=tk.W,
        )
        self.subtitle_label.pack(anchor=tk.W, pady=(2, 0))

    def _build_status(self) -> None:
        card = ttk.Frame(self, style="Card.TFrame", padding=14)
        card.pack(fill=tk.X, pady=(0, 12))
        ttk.Label(card, text="System status", style="CardTitle.TLabel").pack(
            anchor=tk.W, pady=(0, 10)
        )
        row = ttk.Frame(card)
        row.pack(fill=tk.X)

        setup = ttk.Frame(row)
        setup.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 12))
        ttk.Label(setup, text="SETUP", style="Muted.TLabel").pack(anchor=tk.W)
        ttk.Label(
            setup, textvariable=self.state.setup_status, style="Status.TLabel"
        ).pack(anchor=tk.W, pady=(2, 0))
        self.setup_progress = ttk.Progressbar(
            setup, mode="indeterminate", length=150
        )
        self.setup_progress.pack(fill=tk.X, pady=(6, 0))

        ffmpeg = ttk.Frame(row)
        ffmpeg.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 12))
        ttk.Label(ffmpeg, text="FFMPEG", style="Muted.TLabel").pack(anchor=tk.W)
        self.ffmpeg_status_label = ttk.Label(
            ffmpeg, textvariable=self.state.ffmpeg_status, style="Status.TLabel"
        )
        self.ffmpeg_status_label.configure(wraplength=210)
        self.ffmpeg_status_label.pack(anchor=tk.W, pady=(2, 0))

        self.backend_status_label = self._build_service_status(
            row, "BACKEND", self.state.backend_status, padx=(0, 12)
        )
        self.frontend_status_label = self._build_service_status(
            row, "FRONTEND", self.state.frontend_status
        )

    @staticmethod
    def _build_service_status(
        parent: ttk.Frame,
        title: str,
        value: tk.StringVar,
        padx: tuple[int, int] = (0, 0),
    ) -> tk.Label:
        frame = ttk.Frame(parent)
        frame.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=padx)
        ttk.Label(frame, text=title, style="Muted.TLabel").pack(anchor=tk.W)
        label = tk.Label(
            frame,
            textvariable=value,
            font=("TkDefaultFont", 10, "bold"),
            anchor=tk.W,
        )
        label.pack(anchor=tk.W, pady=(2, 0))
        return label

    def _build_actions(self) -> None:
        actions = ttk.Frame(self, style="App.TFrame")
        actions.pack(fill=tk.X, pady=(0, 12))
        for column in range(3):
            actions.columnconfigure(column, weight=1, uniform="actions")

        self._build_environment_card(actions)
        self._build_services_card(actions)
        self._build_tools_card(actions)

    def _build_environment_card(self, parent: ttk.Frame) -> None:
        card = self._card(parent, "Environment", 0)
        self.setup_button = self._button(
            card, "Setup Environment", self.actions.setup, kind="primary"
        )
        self.setup_button.pack(fill=tk.X, pady=(0, 5), ipady=1)
        ttk.Checkbutton(
            card,
            text="Instalar Pacotes de IA",
            variable=self.state.install_ai_deps,
        ).pack(anchor=tk.W, pady=3)
        self._button(card, "Install FFmpeg", self.actions.install_ffmpeg).pack(
            fill=tk.X, pady=(5, 0), ipady=1
        )

    def _build_services_card(self, parent: ttk.Frame) -> None:
        card = self._card(parent, "Services", 1)
        buttons = ttk.Frame(card, style="Card.TFrame")
        buttons.pack(fill=tk.X)
        buttons.columnconfigure(0, weight=1, uniform="service-buttons")
        buttons.columnconfigure(1, weight=1, uniform="service-buttons")
        self._button(buttons, "Start Backend", self.actions.start_backend).grid(
            row=0, column=0, sticky="ew", padx=(0, 4), ipady=1
        )
        self._button(
            buttons, "Start Frontend", self.actions.start_frontend
        ).grid(
            row=0, column=1, sticky="ew", padx=(4, 0), ipady=1
        )
        self._button(card, "Start All", self.actions.start_all, kind="primary").pack(
            fill=tk.X, pady=(8, 5), ipady=1
        )
        self._button(
            card, "Stop All", self.actions.stop_all, kind="danger"
        ).pack(fill=tk.X, ipady=1)

    def _build_tools_card(self, parent: ttk.Frame) -> None:
        card = self._card(parent, "Tools", 2)
        ttk.Label(card, text="Optional AI pipeline check").pack(
            anchor=tk.W, pady=(0, 5)
        )
        ttk.Entry(card, textvariable=self.state.video_path).pack(fill=tk.X)
        self._button(card, "Run AI Test", self.actions.run_ai_test, kind="primary").pack(
            fill=tk.X, pady=(6, 8), ipady=1
        )
        buttons = ttk.Frame(card, style="Card.TFrame")
        buttons.pack(fill=tk.X)
        buttons.columnconfigure(0, weight=1, uniform="tool-buttons")
        buttons.columnconfigure(1, weight=1, uniform="tool-buttons")
        self._button(buttons, "Clear Log", self.actions.clear_log).grid(
            row=0, column=0, sticky="ew", padx=(0, 4), ipady=1
        )
        self._button(buttons, "Copy Log", self.actions.copy_log).grid(
            row=0, column=1, sticky="ew", padx=(4, 0), ipady=1
        )

    def _card(self, parent: ttk.Frame, title: str, column: int) -> ttk.Frame:
        horizontal_padding = (0, 6) if column == 0 else (6, 0) if column == 2 else (6, 6)
        card = ttk.Frame(parent, style="Card.TFrame", padding=12)
        card.grid(row=0, column=column, sticky="nsew", padx=horizontal_padding)
        ttk.Label(card, text=title, style="CardTitle.TLabel").pack(
            anchor=tk.W, pady=(0, 8)
        )
        return card

    def _build_log(self) -> None:
        header = ttk.Frame(self, style="App.TFrame")
        header.pack(fill=tk.X, pady=(0, 5))
        ttk.Label(header, text="Activity log", style="Section.TLabel").pack(
            side=tk.LEFT
        )
        ttk.Label(
            header, textvariable=self.state.setup_detail, style="Muted.TLabel"
        ).pack(side=tk.RIGHT)

        frame = ttk.Frame(self, style="Card.TFrame", padding=1)
        frame.pack(fill=tk.BOTH, expand=True)
        self.log_text = tk.Text(frame, wrap=tk.NONE, height=18, state=tk.DISABLED)
        y_scroll = ttk.Scrollbar(frame, orient=tk.VERTICAL, command=self.log_text.yview)
        x_scroll = ttk.Scrollbar(
            frame, orient=tk.HORIZONTAL, command=self.log_text.xview
        )
        self.log_text.configure(yscrollcommand=y_scroll.set, xscrollcommand=x_scroll.set)
        self.log_text.grid(row=0, column=0, sticky="nsew")
        y_scroll.grid(row=0, column=1, sticky="ns")
        x_scroll.grid(row=1, column=0, sticky="ew")
        frame.rowconfigure(0, weight=1)
        frame.columnconfigure(0, weight=1)

    def _button(
        self,
        parent: tk.Misc,
        text: str,
        command: Callable[[], None],
        kind: str = "secondary",
    ) -> RoundedButton:
        button = RoundedButton(parent, text, command, self._palette, kind)
        self.buttons.append(button)
        return button

    def apply_palette(self, palette: Palette) -> None:
        self._palette = palette
        self.title_label.configure(
            background=palette["background"], foreground=palette["accent"]
        )
        self.subtitle_label.configure(
            background=palette["background"], foreground=palette["muted"]
        )
        self.log_text.configure(
            background=palette["input"],
            foreground=palette["foreground"],
            insertbackground=palette["foreground"],
            selectbackground=palette["accent"],
            selectforeground="#ffffff",
            highlightthickness=0,
            relief=tk.FLAT,
            padx=10,
            pady=8,
            font=("TkFixedFont", 9),
        )
        self.backend_status_label.configure(
            background=palette["surface"],
            foreground=palette["success"]
            if self.state.backend_status.get() == "Running"
            else palette["muted"],
        )
        self.frontend_status_label.configure(
            background=palette["surface"],
            foreground=palette["success"]
            if self.state.frontend_status.get() == "Running"
            else palette["muted"],
        )
        for button in self.buttons:
            button.set_palette(palette)
