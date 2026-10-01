from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.employer_profile import EmployerProfile
from models.user import User


employer_bp = Blueprint(
    "employer",
    __name__,
    url_prefix="/api/employer"
)


# =========================
# GET EMPLOYER PROFILE
# =========================
@employer_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if user.role != "EMPLOYER":
        return {
            "status": "error",
            "message": "Only employers can access this profile"
        }, 403

    profile = EmployerProfile.query.filter_by(
        user_id=user_id
    ).first()

    if not profile:
        return {
            "status": "success",
            "message": "Company profile not created yet",
            "profile": None
        }, 200

    return {
        "status": "success",
        "profile": profile.to_dict()
    }, 200


# =========================
# CREATE EMPLOYER PROFILE
# =========================
@employer_bp.route("/profile", methods=["POST"])
@jwt_required()
def create_profile():
    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if user.role != "EMPLOYER":
        return {
            "status": "error",
            "message": "Only employers can create a profile"
        }, 403

    existing_profile = EmployerProfile.query.filter_by(
        user_id=user_id
    ).first()

    if existing_profile:
        return {
            "status": "error",
            "message": "Company profile already exists"
        }, 409

    data = request.get_json() or {}

    company_name = data.get("company_name")

    if not company_name:
        return {
            "status": "error",
            "message": "Company name is required"
        }, 400

    profile = EmployerProfile(
        user_id=user_id,
        company_name=company_name,
        company_description=data.get("company_description"),
        phone=data.get("phone"),
        email=data.get("email"),
        address=data.get("address"),
        city=data.get("city"),
        website=data.get("website")
    )

    db.session.add(profile)
    db.session.commit()

    return {
        "status": "success",
        "message": "Company profile created successfully",
        "profile": profile.to_dict()
    }, 201


# =========================
# UPDATE / CREATE EMPLOYER PROFILE
# =========================
@employer_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if user.role != "EMPLOYER":
        return {
            "status": "error",
            "message": "Only employers can update this profile"
        }, 403

    data = request.get_json() or {}

    company_name = data.get("company_name")

    if not company_name:
        return {
            "status": "error",
            "message": "Company name is required"
        }, 400

    profile = EmployerProfile.query.filter_by(
        user_id=user_id
    ).first()

    # Create profile on first save
    if not profile:
        profile = EmployerProfile(
            user_id=user_id,
            company_name=company_name,
            company_description=data.get("company_description"),
            phone=data.get("phone"),
            email=data.get("email"),
            address=data.get("address"),
            city=data.get("city"),
            website=data.get("website")
        )

        db.session.add(profile)

        message = "Company profile created successfully"

    # Update existing profile
    else:
        profile.company_name = data.get(
            "company_name",
            profile.company_name
        )

        profile.company_description = data.get(
            "company_description",
            profile.company_description
        )

        profile.phone = data.get(
            "phone",
            profile.phone
        )

        profile.email = data.get(
            "email",
            profile.email
        )

        profile.address = data.get(
            "address",
            profile.address
        )

        profile.city = data.get(
            "city",
            profile.city
        )

        profile.website = data.get(
            "website",
            profile.website
        )

        message = "Company profile updated successfully"

    db.session.commit()

    return {
        "status": "success",
        "message": message,
        "profile": profile.to_dict()
    }, 200
