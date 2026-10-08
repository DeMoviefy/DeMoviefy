import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { UserService } from "src/core/services/userService";

import "./index.css";

export default function Cadastro() {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setFeedback("");
    setIsSubmitting(true);
    try {
      await UserService.register({
        nome: String(formData.get("name")).trim(),
        email: String(formData.get("email")).trim(),
        senha: String(formData.get("password")),
        senha_confirmada: String(formData.get("confirm-password")),
      });
      setFeedback("Conta criada com sucesso. Você já pode entrar.");
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

          <button className="auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </button>
          {feedback && <p aria-live="polite" className="auth-feedback" role="status">{feedback}</p>}
          <p className="auth-switch">Já tem uma conta? <Link to="/login">Entrar</Link></p>
        </form>
      </div>
    </section>
  );
}
