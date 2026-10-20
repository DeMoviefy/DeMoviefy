from app import db


class User(db.Model):
	__tablename__ = "users"

	id = db.Column(db.Integer, primary_key=True)
	nome = db.Column(db.String(120), nullable=False)
	email = db.Column(db.String(255), nullable=False, unique=True, index=True)
	senha = db.Column(db.String(255), nullable=False)

	videos = db.relationship("Video", back_populates="user", cascade="all, delete-orphan")
