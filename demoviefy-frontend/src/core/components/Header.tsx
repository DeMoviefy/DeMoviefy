import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FaMoon, FaSignOutAlt, FaSun } from "react-icons/fa";
import { useThemeStore } from "src/core/stores/useThemeStore";
import { UserService } from "src/core/services/userService";
import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { useTranslation } from "react-i18next";

import demoviefyLight from "src/assets/DeMoviefy-Light.png";
import demoviefyDark from "src/assets/DeMoviefy-Dark.png";


export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isGuest = useProcessingStore((state) => state.isGuest);
  const currentUser = useProcessingStore((state) => state.currentUser);
  const setSessionStatus = useProcessingStore((state) => state.setSessionStatus);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await UserService.logout();
      setSessionStatus({
        is_guest: true,
        user: null,
        guest_video_count: 0,
        guest_video_limit: 3,
      });
      await useProcessingStore.getState().refresh();
      navigate("/", { replace: true });
      toast.success(t("signedOutToast"));
    } catch (error: unknown) {
      console.error("Não foi possível encerrar a sessão.", error);
      toast.error(t("signOutError"));
    } finally {
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    if (isGuest !== null) {
      return;
    }

    void UserService.getSessionStatus()
      .then((session) => {
        if (useProcessingStore.getState().isGuest === null) {
          setSessionStatus(session);
        }
      })
      .catch((error: unknown) => {
        console.error("Não foi possível verificar a sessão atual.", error);
      });
  }, [isGuest, setSessionStatus]);

  return (
    <header className="top-0 z-50 bg-white dark:bg-neutral-900">
      <div className="mx-auto flex h-20 w-full items-center justify-between px-4">
        <NavLink to="/">
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
            aria-label={theme === "light" ? t("darkTheme") : t("lightTheme")}
            title={theme === "light" ? t("darkTheme") : t("lightTheme")}
            className="mr-2 inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            {theme === "dark" ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
          </button>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `rounded-md px-4 py-2 text-base transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:px-6 ${isActive
                ? "text-neutral-900 dark:text-neutral-100"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`
              
            }
          >
            {t("dashboard")}
          </NavLink>
          <span
            aria-live="polite"
            className="mr-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300"
          >
            {isGuest === null
              ? t("checkingSession")
              : isGuest
                ? t("guestMode")
                : t("connected", { name: currentUser?.nome ?? "DeMoviefy" })}
          </span>
          {isGuest !== false && (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `rounded-md px-4 py-2 text-base font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:px-6 ${
                    isActive
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`
                }
              >
                {t("login")}
              </NavLink>
              <NavLink
                to="/cadastro"
                className="rounded-md bg-blue-600 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-blue-500 dark:bg-blue-800 dark:hover:bg-blue-700 lg:px-6"
              >
                {t("createAccount")}
              </NavLink>
            </>
          )}
          {isGuest === false && (
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="ml-2 inline-flex items-center gap-2 rounded-md px-4 py-2 text-base font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-wait disabled:opacity-60 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 lg:px-6"
            >
              <FaSignOutAlt aria-hidden="true" />
              {isLoggingOut ? t("loggingOut") : t("logout")}
            </button>
          )}
          <label className="sr-only" htmlFor="language-select">{t("language")}</label>
          <select
            id="language-select"
            value={i18n.language === "en" ? "en" : "pt-BR"}
            onChange={(event) => void i18n.changeLanguage(event.target.value)}
            className="ml-2 rounded-md border border-neutral-200 bg-white px-2 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="pt-BR">{t("portuguese")}</option>
            <option value="en">{t("english")}</option>
          </select>
        </nav>
      </div>
    </header>
  );
}
