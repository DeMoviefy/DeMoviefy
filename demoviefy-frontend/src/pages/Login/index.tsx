import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { UserService } from "src/core/services/userService";

import "./index.css";

export default function Login() {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setFeedback("");
    setIsSubmitting(true);
    try {
      await UserService.login({
        email: String(formData.get("email")).trim(),
        senha: String(formData.get("password")),
      });
      setFeedback("penis");
      form.reset();
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error
        : undefined;
      setFeedback(message ?? "Não foi possível criar sua conta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page signin-page">
      <div className="auth-panel signin-panel">
        <div className="auth-intro">
          <span className="auth-kicker">DeMoviefy</span>
          <h1>Que bom ter você de volta.</h1>
          <p>Entre para continuar sua jornada pelo mundo dos filmes.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-heading">
            <span className="auth-kicker">Acesse sua conta</span>
            <h2>Entrar</h2>
          </div>

          <label className="auth-field">
            <span>E-mail</span>
            <input autoComplete="email" name="email" placeholder="voce@exemplo.com" required type="email" />
          </label>
          <label className="auth-field">
            <span>Senha</span>
            <input autoComplete="current-password" name="password" placeholder="Sua senha" required type="password" />
          </label>

          <button className="auth-submit" type="submit">Entrar</button>
          {feedback && <p aria-live="polite" className="auth-feedback">{feedback}</p>}
          <p className="auth-switch">Ainda não tem uma conta? <Link to="/cadastro">Cadastre-se</Link></p>
        </form>
      </div>
    </section>
  );
}