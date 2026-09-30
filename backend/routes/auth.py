from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)

from extensions import db
from models.user import User


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


# =========================
# REGISTER
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "DRIVER").upper()

    if not name or not email or not password:
        return {
            "status": "error",
            "message": "Name, email and password are required"
        }, 400

    if role not in ["DRIVER", "EMPLOYER"]:
        return {
            "status": "error",
            "message": "Role must be DRIVER or EMPLOYER"
        }, 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return {
            "status": "error",
            "message": "Email already registered"
        }, 409

    user = User(
        name=name,
        email=email,
        role=role
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return {
        "status": "success",
        "message": "Registration successful",
        "user": user.to_dict()
    }, 201


# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {
            "status": "error",
            "message": "Email and password are required"
        }, 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return {
            "status": "error",
            "message": "Invalid email or password"
        }, 401

    if not user.check_password(password):
        return {
            "status": "error",
            "message": "Invalid email or password"
        }, 401

    if user.status != "ACTIVE":
        return {
            "status": "error",
            "message": "Your account is not active"
        }, 403

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role
        }
    )

    return {
        "status": "success",
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }, 200


# =========================
# CURRENT USER
# =========================
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    claims = get_jwt()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    return {
        "status": "success",
        "user": user.to_dict(),
        "role": claims.get("role")
    }, 200