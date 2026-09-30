from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User
from models.job import Job
from models.application import Application


admin_bp = Blueprint(
    "admin",
    __name__,
    url_prefix="/api/admin"
)


def check_admin():

    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return None

    if user.role != "ADMIN":
        return None

    return user


# ============================================================
# ADMIN DASHBOARD
# ============================================================
@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():

    admin = check_admin()

    if not admin:
        return {
            "status": "error",
            "message": "Admin access required"
        }, 403

    total_users = User.query.count()

    total_drivers = User.query.filter_by(
        role="DRIVER"
    ).count()

    total_employers = User.query.filter_by(
        role="EMPLOYER"
    ).count()

    total_jobs = Job.query.count()

    active_jobs = Job.query.filter_by(
        status="ACTIVE"
    ).count()

    total_applications = Application.query.count()

    return {
        "status": "success",
        "dashboard": {
            "total_users": total_users,
            "total_drivers": total_drivers,
            "total_employers": total_employers,
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_applications": total_applications
        }
    }, 200


# ============================================================
# GET ALL USERS
# ============================================================
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():

    admin = check_admin()

    if not admin:
        return {
            "status": "error",
            "message": "Admin access required"
        }, 403

    users = User.query.order_by(
        User.created_at.desc()
    ).all()

    return {
        "status": "success",
        "count": len(users),
        "users": [
            user.to_dict()
            for user in users
        ]
    }, 200


# ============================================================
# BLOCK / UNBLOCK USER
# ============================================================
@admin_bp.route(
    "/users/<int:user_id>/status",
    methods=["PUT"]
)
@jwt_required()
def update_user_status(user_id):

    admin = check_admin()

    if not admin:
        return {
            "status": "error",
            "message": "Admin access required"
        }, 403

    user = User.query.get(user_id)

    if not user:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    data = request.get_json()

    status = data.get("status")

    if status not in ["ACTIVE", "BLOCKED"]:
        return {
            "status": "error",
            "message": "Status must be ACTIVE or BLOCKED"
        }, 400

    user.status = status

    db.session.commit()

    return {
        "status": "success",
        "message": "User status updated",
        "user": user.to_dict()
    }, 200


# ============================================================
# GET ALL JOBS
# ============================================================
@admin_bp.route("/jobs", methods=["GET"])
@jwt_required()
def get_jobs():

    admin = check_admin()

    if not admin:
        return {
            "status": "error",
            "message": "Admin access required"
        }, 403

    jobs = Job.query.order_by(
        Job.created_at.desc()
    ).all()

    return {
        "status": "success",
        "count": len(jobs),
        "jobs": [
            job.to_dict()
            for job in jobs
        ]
    }, 200


# ============================================================
# APPROVE / BLOCK JOB
# ============================================================
@admin_bp.route(
    "/jobs/<int:job_id>/status",
    methods=["PUT"]
)
@jwt_required()
def update_job_status(job_id):

    admin = check_admin()

    if not admin:
        return {
            "status": "error",
            "message": "Admin access required"
        }, 403

    job = Job.query.get(job_id)

    if not job:
        return {
            "status": "error",
            "message": "Job not found"
        }, 404

    data = request.get_json()

    status = data.get("status")

    allowed_statuses = [
        "ACTIVE",
        "BLOCKED",
        "CLOSED"
    ]

    if status not in allowed_statuses:
        return {
            "status": "error",
            "message": (
                "Status must be ACTIVE, BLOCKED or CLOSED"
            )
        }, 400

    job.status = status

    db.session.commit()

    return {
        "status": "success",
        "message": "Job status updated",
        "job": job.to_dict()
    }, 200


# ============================================================
# GET ALL APPLICATIONS
# ============================================================
@admin_bp.route("/applications", methods=["GET"])
@jwt_required()
def get_applications():

    admin = check_admin()

    if not admin:
        return {
            "status": "error",
            "message": "Admin access required"
        }, 403

    applications = Application.query.order_by(
        Application.applied_at.desc()
    ).all()

    return {
        "status": "success",
        "count": len(applications),
        "applications": [
            application.to_dict()
            for application in applications
        ]
    }, 200