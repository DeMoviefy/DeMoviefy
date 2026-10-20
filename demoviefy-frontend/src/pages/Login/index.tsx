import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { UserService } from "src/core/services/userService";
import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setFeedback("");
    setIsSubmitting(true);
    try {
      const response = await UserService.login({
        email: String(formData.get("email")).trim(),
        senha: String(formData.get("password")),
      });
      useProcessingStore.getState().setSessionStatus({
        is_guest: false,
        user: response.user,
        guest_video_count: 0,
        guest_video_limit: 3,
      });
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error
        : undefined;
      setFeedback(message ?? t("loginError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-lg flex-col justify-center py-10 lg:py-16">
      <div className="mb-7 text-center">

        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
          {t("loginWelcome")}
        </h1>
        <p className="mt-2 text-base leading-7 text-neutral-500 dark:text-neutral-400">
          {t("loginDescription")}
        </p>
      </div>

      <form className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800/70 sm:p-8" onSubmit={handleSubmit}>
        <div className="mb-7">
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{t("login")}</h2>
        </div>

        <div className="space-y-5">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t("email")}
            <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500" />
          </label>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t("password")}
            <input autoComplete="current-password" name="password" placeholder={t("yourPassword")} required type="password" className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500" />
          </label>
        </div>

        <button disabled={isSubmitting} type="submit" className="mt-7 w-full cursor-pointer rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-800 dark:hover:bg-blue-700">
          {isSubmitting ? t("signingIn") : t("login")}
        </button>
        {feedback && <p aria-live="polite" className="mt-4 text-sm leading-6 text-red-700 dark:text-red-300" role="alert">{feedback}</p>}
        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {t("noAccount")} <Link className="font-semibold text-blue-700 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" to="/cadastro">{t("register")}</Link>
        </p>
      </form>
    </section>
  );
}
