import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import "./index.css";

export default function Cadastro() {
  const [feedback, setFeedback] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (formData.get("password") !== formData.get("confirm-password")) {
      setFeedback("As senhas não coincidem.");
      return;
    }
    setFeedback("Cadastro validado. A criação de conta ainda não está conectada ao servidor.");
  }

  return (
    <section className="auth-page signup-page">
      <div className="auth-panel signup-panel">
        <div className="auth-intro">
          <span className="auth-kicker">DeMoviefy</span>
          <h1>Seu próximo filme começa aqui.</h1>
          <p>Crie sua conta para organizar e descobrir histórias para assistir.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-heading">
            <span className="auth-kicker">Nova conta</span>
            <h2>Cadastre-se</h2>
          </div>

          <label className="auth-field">
            <span>Nome</span>
            <input autoComplete="name" name="name" placeholder="Seu nome" required />
          </label>
          <label className="auth-field">
            <span>E-mail</span>
            <input autoComplete="email" name="email" placeholder="voce@exemplo.com" required type="email" />
          </label>
          <label className="auth-field">
            <span>Senha</span>
            <input autoComplete="new-password" minLength={8} name="password" placeholder="No mínimo 8 caracteres" required type="password" />
          </label>
          <label className="auth-field">
            <span>Confirme sua senha</span>
            <input autoComplete="new-password" minLength={8} name="confirm-password" placeholder="Digite a senha novamente" required type="password" />
          </label>

          <button className="auth-submit" type="submit">Criar conta</button>
          {feedback && <p aria-live="polite" className="auth-feedback">{feedback}</p>}
          <p className="auth-switch">Já tem uma conta? <Link to="/login">Entrar</Link></p>
        </form>
      </div>
    </section>
  );
}
