import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import { UserService } from "src/core/services/userService";
import { useTranslation } from "react-i18next";

import "./index.css";

export default function Cadastro() {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setFeedback("");
    setIsSubmitting(true);

    try {
      // Verifica se o reCAPTCHA já foi carregado
      if (!executeRecaptcha) {
        setFeedback("O reCAPTCHA ainda não foi carregado. Tente novamente.");
        return;
      }

      // Gera o token do reCAPTCHA
      const recaptchaToken = await executeRecaptcha("cadastro");

      // Envia os dados para o backend
      await UserService.register({
        nome: String(formData.get("name")).trim(),
        email: String(formData.get("email")).trim(),
        senha: String(formData.get("password")),
        senha_confirmada: String(formData.get("confirm-password")),
        recaptcha_token: recaptchaToken,
      });

      setFeedback(t("accountCreated"));
      form.reset();

    } catch (error: unknown) {
      const message = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error
        : undefined;

      setFeedback(
        message ?? "Não foi possível criar sua conta. Tente novamente."
      );

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page signup-page">
      <div className="auth-panel signup-panel">

        <div className="auth-intro">
          <span className="auth-kicker">DeMoviefy</span>

          <h1>{t("signupTitle")}</h1>

          <p>{t("signupDescription")}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="auth-heading">
            <span className="auth-kicker">{t("newAccount")}</span>
            <h2>{t("register")}</h2>
          </div>

          <label className="auth-field">
            <span>{t("name")}</span>

            <input
              autoComplete="name"
              name="name"
              placeholder={t("yourName")}
              required
            />
          </label>

          <label className="auth-field">
            <span>{t("email")}</span>

            <input
              autoComplete="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </label>

          <label className="auth-field">
            <span>{t("password")}</span>

            <input
              autoComplete="new-password"
              minLength={8}
              name="password"
              placeholder={t("minPassword")}
              required
              type="password"
            />
          </label>

          <label className="auth-field">
            <span>{t("confirmPassword")}</span>

            <input
              autoComplete="new-password"
              minLength={8}
              name="confirm-password"
              placeholder={t("repeatPassword")}
              required
              type="password"
            />
          </label>

          <button
            className="auth-submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? t("creatingAccount")
              : t("createAccount")}
          </button>

          {feedback && (
            <p
              aria-live="polite"
              className="auth-feedback"
              role="status"
            >
              {feedback}
            </p>
          )}

          <p className="auth-switch">
            {t("hasAccount")}{" "}
            <Link to="/login">{t("login")}</Link>
          </p>

        </form>
      </div>
    </section>
  );
}