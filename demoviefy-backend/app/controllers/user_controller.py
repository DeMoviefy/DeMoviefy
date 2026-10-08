from sqlalchemy.exc import IntegrityError
from flask import jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash
from app.repositories.user_repository import get_user_by_email, create_user
from app import db

def login_user():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie as credenciais em JSON."}), 400

    email = str(data.get("email", "")).strip().lower()
    senha = str(data.get("senha", ""))

    if not email or not senha:
        return jsonify({"error": "E-mail e senha são obrigatórios."}), 400

    user = get_user_by_email(email)
    if not user or not check_password_hash(user.senha, senha):
        return jsonify({"error": "E-mail ou senha incorretos."}), 401

    # Armazena o ID do usuário na sessão do Flask
    session["user_id"] = user.id

    return jsonify({
        "message": "Login realizado com sucesso.",
        "user": {
            "id": user.id,
            "nome": user.nome,
            "email": user.email
        }
    }), 200

def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Não autenticado."}), 401
    
    from app.models.user import User
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado."}), 404

    return jsonify({"id": user.id, "nome": user.nome, "email": user.email})


def register_user():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie os dados do cadastro em JSON."}), 400

    nome = data.get("nome")
    email = data.get("email")
    senha = data.get("senha")
    senha_confirmada = data.get("senha-confirmada")
    if not all(isinstance(value, str) for value in (nome, email, senha)):
        return jsonify({"error": "Nome, e-mail e senha são obrigatórios."}), 400
    
    if senha_confirmada != senha:
        return jsonify({"error": "Senhas não coincidem"}), 400

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