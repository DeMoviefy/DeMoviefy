from flask import jsonify, request
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash

from app import db
from app.repositories.user_repository import create_user, get_user_by_email


def register_user():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie os dados do cadastro em JSON."}), 400

    nome = data.get("nome")
    email = data.get("email")
    senha = data.get("senha")
    if not all(isinstance(value, str) for value in (nome, email, senha)):
        return jsonify({"error": "Nome, e-mail e senha são obrigatórios."}), 400

    nome = nome.strip()
    email = email.strip().lower()
    if not nome or len(nome) > 120:
        return jsonify({"error": "Informe um nome de até 120 caracteres."}), 400
    if len(email) > 255 or email.count("@") != 1 or "." not in email.rsplit("@", 1)[1]:
        return jsonify({"error": "Informe um e-mail válido."}), 400
    if len(senha) < 8 or len(senha) > 128:
        return jsonify({"error": "A senha deve ter entre 8 e 128 caracteres."}), 400
    if get_user_by_email(email):
        return jsonify({"error": "Este e-mail já está cadastrado."}), 409

    try:
        user = create_user(
            nome=nome,
            email=email,
            senha_hash=generate_password_hash(senha),
        )
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Este e-mail já está cadastrado."}), 409

    return jsonify({"id": user.id, "nome": user.nome, "email": user.email}), 201