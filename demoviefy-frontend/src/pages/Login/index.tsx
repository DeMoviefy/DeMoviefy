import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import "./index.css";

export default function Login() {
  const [feedback, setFeedback] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("O login ainda não está conectado ao servidor.");
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