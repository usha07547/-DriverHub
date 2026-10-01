from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.driver_profile import DriverProfile
from models.user import User


driver_bp = Blueprint(
    "driver",
    __name__,
    url_prefix="/api/driver"
)


# =========================
# GET DRIVER PROFILE
# =========================
@driver_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if user.role != "DRIVER":
        return {
            "status": "error",
            "message": "Only drivers can access this profile"
        }, 403

    profile = DriverProfile.query.filter_by(
        user_id=user_id
    ).first()

    if not profile:
        return {
            "status": "success",
            "message": "Driver profile not created yet",
            "profile": None
        }, 200

    return {
        "status": "success",
        "profile": profile.to_dict()
    }, 200


# =========================
# CREATE DRIVER PROFILE
# =========================
@driver_bp.route("/profile", methods=["POST"])
@jwt_required()
def create_profile():
    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if user.role != "DRIVER":
        return {
            "status": "error",
            "message": "Only drivers can create a profile"
        }, 403

    existing_profile = DriverProfile.query.filter_by(
        user_id=user_id
    ).first()

    if existing_profile:
        return {
            "status": "error",
            "message": "Driver profile already exists"
        }, 409

    data = request.get_json() or {}

    profile = DriverProfile(
        user_id=user_id,
        phone=data.get("phone"),
        date_of_birth=data.get("date_of_birth"),
        address=data.get("address"),
        city=data.get("city"),
        driving_experience=data.get("driving_experience"),
        license_number=data.get("license_number"),
        license_category=data.get("license_category"),
        skills=data.get("skills"),
        bio=data.get("bio")
    )

    db.session.add(profile)
    db.session.commit()

    return {
        "status": "success",
        "message": "Driver profile created successfully",
        "profile": profile.to_dict()
    }, 201


# =========================
# UPDATE / CREATE DRIVER PROFILE
# =========================
@driver_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if user.role != "DRIVER":
        return {
            "status": "error",
            "message": "Only drivers can update this profile"
        }, 403

    data = request.get_json() or {}

    profile = DriverProfile.query.filter_by(
        user_id=user_id
    ).first()

    # Create the profile on first save if it does not exist
    if not profile:
        profile = DriverProfile(
            user_id=user_id,
            phone=data.get("phone"),
            date_of_birth=data.get("date_of_birth"),
            address=data.get("address"),
            city=data.get("city"),
            driving_experience=data.get("driving_experience"),
            license_number=data.get("license_number"),
            license_category=data.get("license_category"),
            skills=data.get("skills"),
            bio=data.get("bio")
        )

        db.session.add(profile)
        message = "Driver profile created successfully"

    # Update existing profile
    else:
        profile.phone = data.get(
            "phone",
            profile.phone
        )
        profile.date_of_birth = data.get(
            "date_of_birth",
            profile.date_of_birth
        )
        profile.address = data.get(
            "address",
            profile.address
        )
        profile.city = data.get(
            "city",
            profile.city
        )
        profile.driving_experience = data.get(
            "driving_experience",
            profile.driving_experience
        )
        profile.license_number = data.get(
            "license_number",
            profile.license_number
        )
        profile.license_category = data.get(
            "license_category",
            profile.license_category
        )
        profile.skills = data.get(
            "skills",
            profile.skills
        )
        profile.bio = data.get(
            "bio",
            profile.bio
        )
        message = "Driver profile updated successfully"

    db.session.commit()

    return {
        "status": "success",
        "message": message,
        "profile": profile.to_dict()
    }, 200


# ============================================================
# GET - Employer searches driver profiles
# ============================================================
@driver_bp.route("/search", methods=["GET"])
@jwt_required()
def search_drivers():

    employer_id = int(get_jwt_identity())

    employer = User.query.get(employer_id)

    if not employer:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if employer.role != "EMPLOYER":
        return {
            "status": "error",
            "message": "Only employers can search drivers"
        }, 403

    query = DriverProfile.query

    city = request.args.get("city")

    if city:
        query = query.filter(
            DriverProfile.city.ilike(f"%{city}%")
        )

    category = request.args.get("category")

    if category:
        query = query.filter(
            DriverProfile.license_category.ilike(
                f"%{category}%"
            )
        )

    experience = request.args.get(
        "experience",
        type=int
    )

    if experience is not None:
        query = query.filter(
            DriverProfile.driving_experience >= experience
        )

    profiles = query.all()

    results = []

    for profile in profiles:

        user = User.query.get(profile.user_id)

        if user and user.status == "ACTIVE":

            profile_data = profile.to_dict()

            profile_data["user_id"] = user.id
            profile_data["name"] = user.name
            profile_data["email"] = user.email
            profile_data["driver"] = {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }

            results.append(profile_data)

    return {
        "status": "success",
        "count": len(results),
        "drivers": results
    }, 200


# ============================================================
# GET - Employer views one driver profile
# ============================================================
@driver_bp.route("/candidate/<int:driver_id>", methods=["GET"])
@jwt_required()
def get_candidate(driver_id):

    employer_id = int(get_jwt_identity())
    employer = User.query.get(employer_id)

    if not employer:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if employer.role != "EMPLOYER":
        return {
            "status": "error",
            "message": "Only employers can view driver profiles"
        }, 403

    driver = User.query.get(driver_id)

    if not driver or driver.role != "DRIVER" or driver.status != "ACTIVE":
        return {
            "status": "error",
            "message": "Driver not found"
        }, 404

    profile = DriverProfile.query.filter_by(
        user_id=driver_id
    ).first()

    if not profile:
        return {
            "status": "error",
            "message": "Driver profile not found"
        }, 404

    candidate = profile.to_dict()
    candidate["user_id"] = driver.id
    candidate["name"] = driver.name
    candidate["email"] = driver.email

    return {
        "status": "success",
        "candidate": candidate
    }, 200
