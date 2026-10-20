from app import db
from app.models.user import User


def get_user_by_email(email: str) -> User | None:
    return User.query.filter_by(email=email).first()


def create_user(*, nome: str, email: str, senha_hash: str) -> User:
    user = User(nome=nome, email=email, senha=senha_hash)
    db.session.add(user)
    db.session.commit()
    return user