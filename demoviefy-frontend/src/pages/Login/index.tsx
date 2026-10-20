import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { UserService } from "src/core/services/userService";
import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { useTranslation } from "react-i18next";

import "./index.css";

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
      setFeedback(message ?? "Não foi possível entrar. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page signin-page">
      <div className="auth-panel signin-panel">
        <div className="auth-intro">
          <span className="auth-kicker">DeMoviefy</span>
          <h1>{t("loginWelcome")}</h1>
          <p>{t("loginDescription")}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-heading">
            <span className="auth-kicker">{t("accountAccess")}</span>
            <h2>{t("login")}</h2>
          </div>

          <label className="auth-field">
            <span>{t("email")}</span>
            <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
          </label>
          <label className="auth-field">
            <span>{t("password")}</span>
            <input autoComplete="current-password" name="password" placeholder={t("yourPassword")} required type="password" />
          </label>

          <button className="auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? t("signingIn") : t("login")}
          </button>
          {feedback && <p aria-live="polite" className="auth-feedback" role="alert">{feedback}</p>}
          <p className="auth-switch">{t("noAccount")} <Link to="/cadastro">{t("register")}</Link></p>
        </form>
      </div>
    </section>
  );
}
