import { NavLink } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { useThemeStore } from "src/core/stores/useThemeStore";

import demoviefyLight from "src/assets/DeMoviefy-Light.png";
import demoviefyDark from "src/assets/DeMoviefy-Dark.png";


export default function Header() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <header className="top-0 z-50 bg-white dark:bg-neutral-900">
      <div className="mx-auto flex h-20 w-full items-center justify-between px-4">
        <NavLink to="/dashboard">
          <img
            src={theme === "dark" ? demoviefyLight : demoviefyDark}
            alt="DeMoviefy"
            className="h-14 w-auto"
          />
        </NavLink>

        <nav className="flex items-center">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
            title={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
            className="mr-2 inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            {theme === "dark" ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
