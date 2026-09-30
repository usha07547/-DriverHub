from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.application import Application
from models.job import Job
from models.user import User


applications_bp = Blueprint(
    "applications",
    __name__,
    url_prefix="/api/applications"
)


# ============================================================
# POST - Driver applies for a job
# ============================================================
@applications_bp.route("", methods=["POST"])
@jwt_required()
def apply_for_job():

    driver_id = int(get_jwt_identity())

    driver = User.query.get(driver_id)

    if not driver:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if driver.role != "DRIVER":
        return {
            "status": "error",
            "message": "Only drivers can apply for jobs"
        }, 403

    data = request.get_json()

    job_id = data.get("job_id")

    if not job_id:
        return {
            "status": "error",
            "message": "job_id is required"
        }, 400

    job = Job.query.get(job_id)

    if not job:
        return {
            "status": "error",
            "message": "Job not found"
        }, 404

    if job.status != "ACTIVE":
        return {
            "status": "error",
            "message": "This job is no longer active"
        }, 400

    # Prevent duplicate applications
    existing_application = Application.query.filter_by(
        job_id=job_id,
        driver_id=driver_id
    ).first()

    if existing_application:
        return {
            "status": "error",
            "message": "You have already applied for this job"
        }, 409

    application = Application(
        job_id=job_id,
        driver_id=driver_id,
        cover_message=data.get("cover_message")
    )

    db.session.add(application)
    db.session.commit()

    return {
        "status": "success",
        "message": "Job application submitted successfully",
        "application": application.to_dict()
    }, 201


# ============================================================
# GET - Driver views their applications
# ============================================================
@applications_bp.route("/my-applications", methods=["GET"])
@jwt_required()
def get_my_applications():

    driver_id = int(get_jwt_identity())

    driver = User.query.get(driver_id)

    if not driver:
        return {
            "status": "error",
            "message": "User not found"
        }, 404

    if driver.role != "DRIVER":
        return {
            "status": "error",
            "message": "Only drivers can view their applications"
        }, 403

    applications = Application.query.filter_by(
        driver_id=driver_id
    ).order_by(
        Application.applied_at.desc()
    ).all()

    result = []

    for application in applications:

        job = Job.query.get(application.job_id)

        application_data = application.to_dict()

        if job:
            application_data["job"] = job.to_dict()

        result.append(application_data)

    return {
        "status": "success",
        "count": len(result),
        "applications": result
    }, 200


# ============================================================
# GET - Employer views applications for their jobs
# ============================================================
@applications_bp.route("/employer", methods=["GET"])
@jwt_required()
def get_employer_applications():

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
            "message": "Only employers can view applications"
        }, 403

    jobs = Job.query.filter_by(
        employer_id=employer_id
    ).all()

    job_ids = [
        job.id
        for job in jobs
    ]

    if not job_ids:
        return {
            "status": "success",
            "count": 0,
            "applications": []
        }, 200

    applications = Application.query.filter(
        Application.job_id.in_(job_ids)
    ).order_by(
        Application.applied_at.desc()
    ).all()

    result = []

    for application in applications:

        job = Job.query.get(application.job_id)
        driver = User.query.get(application.driver_id)

        application_data = application.to_dict()

        if job:
            application_data["job"] = {
                "id": job.id,
                "title": job.title,
                "location": job.location
            }

        if driver:
            application_data["driver"] = {
                "id": driver.id,
                "name": driver.name,
                "email": driver.email
            }

        result.append(application_data)

    return {
        "status": "success",
        "count": len(result),
        "applications": result
    }, 200


# ============================================================
# PUT - Employer updates application status
# ============================================================
@applications_bp.route(
    "/<int:application_id>/status",
    methods=["PUT"]
)
@jwt_required()
def update_application_status(application_id):

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
            "message": "Only employers can update application status"
        }, 403

    application = Application.query.get(application_id)

    if not application:
        return {
            "status": "error",
            "message": "Application not found"
        }, 404

    job = Job.query.get(application.job_id)

    if not job:
        return {
            "status": "error",
            "message": "Job not found"
        }, 404

    if job.employer_id != employer_id:
        return {
            "status": "error",
            "message": "You can only manage applications for your jobs"
        }, 403

    data = request.get_json()

    new_status = data.get("status")

    allowed_statuses = [
        "APPLIED",
        "SHORTLISTED",
        "REJECTED",
        "SELECTED"
    ]

    if new_status not in allowed_statuses:
        return {
            "status": "error",
            "message": (
                "Status must be APPLIED, SHORTLISTED, "
                "REJECTED or SELECTED"
            )
        }, 400

    application.status = new_status

    db.session.commit()

    return {
        "status": "success",
        "message": "Application status updated successfully",
        "application": application.to_dict()
    }, 200