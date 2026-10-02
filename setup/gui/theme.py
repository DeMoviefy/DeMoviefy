import tkinter as tk
from tkinter import ttk
from typing import TypeAlias


Palette: TypeAlias = dict[str, str]


def detect_system_appearance(root: tk.Tk) -> str:
    try:
        import darkdetect
    except ImportError:
        darkdetect = None
    if darkdetect is not None:
        detected_theme = darkdetect.theme()
        if detected_theme:
            return detected_theme.lower()

    style = ttk.Style(root)
    background = style.lookup("TFrame", "background") or root.cget("background")
    try:
        red, green, blue = root.winfo_rgb(background)
    except tk.TclError:
        return "light"
    brightness = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 65535
    return "dark" if brightness < 0.45 else "light"


def create_palette(appearance: str) -> Palette:
    if appearance == "dark":
        palette = {
            "background": "#191c22",
            "surface": "#22262e",
            "surface_alt": "#303641",
            "foreground": "#edf1f7",
            "muted": "#a4adbd",
            "border": "#394252",
            "input": "#1c2027",
            "success": "#56d39b",
            "error": "#ff7777",
            "accent": "#82aaff",
        }
    else:
        palette = {
            "background": "#f3f5f8",
            "surface": "#ffffff",
            "surface_alt": "#e9edf3",
            "foreground": "#202938",
            "muted": "#687386",
            "border": "#dce2ea",
            "input": "#ffffff",
            "success": "#168554",
            "error": "#c83c48",
            "accent": "#356eaa",
        }
    red, green, blue = (
        int(palette["accent"][start : start + 2], 16) for start in (1, 3, 5)
    )
    luminance = 0.299 * red + 0.587 * green + 0.114 * blue
    palette["accent_text"] = "#202938" if luminance > 160 else "#ffffff"
    return palette


def apply_theme(root: tk.Tk, palette: Palette) -> None:
    style = ttk.Style(root)
    if "clam" in style.theme_names():
        style.theme_use("clam")

    style.configure("TFrame", background=palette["surface"])
    style.configure("App.TFrame", background=palette["background"])
    style.configure("Card.TFrame", background=palette["surface"], relief=tk.FLAT)
    style.configure(
        "TLabel",
        background=palette["surface"],
        foreground=palette["foreground"],
        font=("TkDefaultFont", 9),
    )
    style.configure(
        "Muted.TLabel",
        background=palette["surface"],
        foreground=palette["muted"],
        font=("TkDefaultFont", 8, "bold"),
    )
    style.configure(
        "Status.TLabel",
        background=palette["surface"],
        foreground=palette["foreground"],
        font=("TkDefaultFont", 10, "bold"),
    )
    style.configure(
        "CardTitle.TLabel",
        background=palette["surface"],
        foreground=palette["foreground"],
        font=("TkDefaultFont", 10, "bold"),
    )
    style.configure(
        "Section.TLabel",
        background=palette["background"],
        foreground=palette["foreground"],
        font=("TkDefaultFont", 11, "bold"),
    )
    style.configure(
        "TCheckbutton",
        background=palette["surface"],
        foreground=palette["foreground"],
        font=("TkDefaultFont", 9),
    )
    style.map(
        "TCheckbutton",
        background=[("active", palette["surface"])],
        foreground=[("disabled", palette["muted"])],
    )
    style.configure(
        "TEntry",
        fieldbackground=palette["input"],
        foreground=palette["foreground"],
        insertcolor=palette["foreground"],
        bordercolor=palette["border"],
        relief=tk.FLAT,
        borderwidth=0,
        padding=8,
    )
    style.configure(
        "Horizontal.TProgressbar",
        background=palette["accent"],
        troughcolor=palette["surface_alt"],
        bordercolor=palette["border"],
    )
    root.configure(background=palette["background"])
