import math
import tkinter as tk
from typing import Callable

class RoundedButton(tk.Canvas):
    def __init__(
        self,
        master: tk.Misc,
        text: str,
        command: Callable[[], None],
        palette: dict[str, str],
        kind: str = "secondary",
    ) -> None:
        super().__init__(
            master,
            height=38,
            bd=0,
            highlightthickness=0,
            background=palette.get("surface", "#ffffff"),
            cursor="hand2",
            takefocus=True,
        )
        self._text = text
        self._command = command
        self._palette = palette
        self._kind = kind
        self._enabled = True
        self._hovered = False
        self._focused = False
        self.bind("<Configure>", self._draw)
        self.bind("<Enter>", self._on_hover)
        self.bind("<Leave>", self._on_hover)
        self.bind("<Button-1>", self._on_click)
        self.bind("<KeyPress-space>", self._on_key)
        self.bind("<Return>", self._on_key)
        self.bind("<FocusIn>", self._on_focus_change)
        self.bind("<FocusOut>", self._on_focus_change)

    def set_palette(self, palette: dict[str, str]) -> None:
        self._palette = palette
        self.configure(background=palette["surface"])
        self._draw()

    def set_enabled(self, enabled: bool) -> None:
        self._enabled = enabled
        self.configure(cursor="hand2" if enabled else "arrow")
        self._draw()

    def _button_colors(self) -> tuple[str, str]:
        if not self._enabled:
            return self._palette["surface_alt"], self._palette["muted"]
        if self._kind == "primary":
            return self._palette["accent"], self._palette["accent_text"]
        if self._kind == "danger":
            return self._palette["surface_alt"], self._palette["error"]
        return self._palette["surface_alt"], self._palette["foreground"]

    def _draw(self, event: tk.Event | None = None) -> None:
        self.delete("all")
        width = event.width if event else self.winfo_width()
        height = event.height if event else self.winfo_height()
        if width < 2 or height < 2 or not self._palette:
            return

        fill, foreground = self._button_colors()
        if self._hovered and self._enabled:
            fill = (
                self._palette["border"]
                if self._kind != "primary"
                else self._palette["accent"]
            )
        inset = 2 if self._focused else 1
        left, top = inset, inset
        right, bottom = width - inset, height - inset
        radius = min(11, (bottom - top) / 2, (right - left) / 2)
        corners = (
            (left + radius, top + radius, 180, 270),
            (right - radius, top + radius, 270, 360),
            (right - radius, bottom - radius, 0, 90),
            (left + radius, bottom - radius, 90, 180),
        )
        points: list[float] = []
        for center_x, center_y, start, end in corners:
            for step in range(7):
                angle = math.radians(start + (end - start) * step / 6)
                points.extend(
                    (
                        center_x + radius * math.cos(angle),
                        center_y + radius * math.sin(angle),
                    )
                )
        outline = self._palette["accent"] if self._focused else fill
        self.create_polygon(
            points,
            fill=fill,
            outline=outline,
            width=2 if self._focused else 1,
        )
        self.create_text(
            width / 2,
            height / 2,
            text=self._text,
            fill=foreground,
            font=(
                "TkDefaultFont",
                9,
                "bold" if self._kind == "primary" else "normal",
            ),
        )

    def _on_hover(self, event: tk.Event) -> None:
        self._hovered = event.type == tk.EventType.Enter
        self._draw()

    def _on_click(self, event: tk.Event) -> str:
        if self.winfo_containing(event.x_root, event.y_root) is not self:
            return "break"
        self.focus_set()
        if self._enabled:
            self._command()
        return "break"

    def _on_key(self, event: tk.Event) -> str:
        if self._enabled and event.keysym in ("space", "Return"):
            self._command()
        return "break"

    def _on_focus_change(self, event: tk.Event) -> None:
        self._focused = event.type == tk.EventType.FocusIn
        self._draw()
