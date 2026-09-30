from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.job import Job
from models.user import User


jobs_bp = Blueprint(
    "jobs",
    __name__,
    url_prefix="/api/jobs"
)


# ============================================================
# POST - Employer creates a job
# ============================================================
@jobs_bp.route("", methods=["POST"])
@jwt_required()
def create_job():

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
            "message": "Only employers can post jobs"
        }, 403

    data = request.get_json()

    required_fields = [
        "title",
        "driver_category",
        "required_experience",
        "location"
    ]

    for field in required_fields:
        if not data.get(field):
            return {
                "status": "error",
                "message": f"{field} is required"
            }, 400

    job = Job(
        employer_id=user_id,
        title=data.get("title"),
        driver_category=data.get("driver_category"),
        required_experience=data.get("required_experience"),
        location=data.get("location"),
        salary=data.get("salary"),
        working_hours=data.get("working_hours"),
        required_documents=data.get("required_documents"),
        description=data.get("description")
    )

    db.session.add(job)
    db.session.commit()

    return {
        "status": "success",
        "message": "Job posted successfully",
        "job": job.to_dict()
    }, 201


# ============================================================
# GET - Employer views their jobs
# ============================================================
@jobs_bp.route("/my-jobs", methods=["GET"])
@jwt_required()
def get_my_jobs():

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
            "message": "Only employers can access this"
        }, 403

    jobs = Job.query.filter_by(
        employer_id=user_id
    ).order_by(
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
# GET - Driver searches and filters jobs
# ============================================================
@jobs_bp.route("/search", methods=["GET"])
@jwt_required()
def search_jobs():

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
            "message": "Only drivers can search for jobs"
        }, 403

    query = Job.query.filter_by(
        status="ACTIVE"
    )

    # Keyword search
    keyword = request.args.get("keyword")

    if keyword:
        query = query.filter(
            Job.title.ilike(f"%{keyword}%")
        )

    # Location filter
    location = request.args.get("location")

    if location:
        query = query.filter(
            Job.location.ilike(f"%{location}%")
        )

    # Driver category filter
    category = request.args.get("category")

    if category:
        query = query.filter(
            Job.driver_category.ilike(f"%{category}%")
        )

    # Experience filter
    min_experience = request.args.get(
        "min_experience",
        type=int
    )

    if min_experience is not None:
        query = query.filter(
            Job.required_experience <= min_experience
        )

    jobs = query.order_by(
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
# GET - View a single job
# ============================================================
@jobs_bp.route("/<int:job_id>", methods=["GET"])
@jwt_required()
def get_job(job_id):

    job = Job.query.get(job_id)

    if not job:
        return {
            "status": "error",
            "message": "Job not found"
        }, 404

    return {
        "status": "success",
        "job": job.to_dict()
    }, 200


# ============================================================
# PUT - Employer updates their job
# ============================================================
@jobs_bp.route("/<int:job_id>", methods=["PUT"])
@jwt_required()
def update_job(job_id):

    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user or user.role != "EMPLOYER":
        return {
            "status": "error",
            "message": "Only employers can update jobs"
        }, 403

    job = Job.query.get(job_id)

    if not job:
        return {
            "status": "error",
            "message": "Job not found"
        }, 404

    if job.employer_id != user_id:
        return {
            "status": "error",
            "message": "You can only update your own jobs"
        }, 403

    data = request.get_json()

    job.title = data.get(
        "title",
        job.title
    )

    job.driver_category = data.get(
        "driver_category",
        job.driver_category
    )

    job.required_experience = data.get(
        "required_experience",
        job.required_experience
    )

    job.location = data.get(
        "location",
        job.location
    )

    job.salary = data.get(
        "salary",
        job.salary
    )

    job.working_hours = data.get(
        "working_hours",
        job.working_hours
    )

    job.required_documents = data.get(
        "required_documents",
        job.required_documents
    )

    job.description = data.get(
        "description",
        job.description
    )

    job.status = data.get(
        "status",
        job.status
    )

    db.session.commit()

    return {
        "status": "success",
        "message": "Job updated successfully",
        "job": job.to_dict()
    }, 200


# ============================================================
# DELETE - Employer deletes their job
# ============================================================
# ============================================================
# DELETE - Employer deletes their job
# ============================================================
@jobs_bp.route("/<int:job_id>", methods=["DELETE"])
@jwt_required()
def delete_job(job_id):

    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user or user.role != "EMPLOYER":
        return {
            "status": "error",
            "message": "Only employers can delete jobs"
        }, 403

    job = Job.query.get(job_id)

    if not job:
        return {
            "status": "error",
            "message": "Job not found"
        }, 404

    if job.employer_id != user_id:
        return {
            "status": "error",
            "message": "You can only delete your own jobs"
        }, 403

    try:
        # Remove related applications first if they exist.
        from models.application import Application

        Application.query.filter_by(
            job_id=job_id
        ).delete(synchronize_session=False)

        db.session.delete(job)
        db.session.commit()

        return {
            "status": "success",
            "message": "Job deleted successfully"
        }, 200

    except Exception as e:
        db.session.rollback()

        print("DELETE JOB ERROR:", str(e))

        return {
            "status": "error",
            "message": "Unable to delete job",
            "error": str(e)
        }, 500