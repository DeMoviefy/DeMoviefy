import { create } from "zustand";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "demoviefy-theme";

function readInitialTheme(): Theme {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
        return "light";
    }
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
}

const initialTheme = readInitialTheme();
applyTheme(initialTheme);

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: initialTheme,
    toggleTheme: () => {
        const theme = get().theme === "light" ? "dark" : "light";
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // A sessão ainda pode alternar o tema mesmo se o storage estiver indisponível.
        }
        applyTheme(theme);
        set({ theme });
    },
}));
