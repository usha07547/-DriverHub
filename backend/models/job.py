from datetime import datetime

from extensions import db


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)

    employer_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    title = db.Column(
        db.String(150),
        nullable=False
    )

    driver_category = db.Column(
        db.String(100),
        nullable=False
    )

    required_experience = db.Column(
        db.Integer,
        nullable=False
    )

    location = db.Column(
        db.String(150),
        nullable=False
    )

    salary = db.Column(
        db.String(100)
    )

    working_hours = db.Column(
        db.String(100)
    )

    required_documents = db.Column(
        db.Text
    )

    description = db.Column(
        db.Text
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="ACTIVE"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "employer_id": self.employer_id,
            "title": self.title,
            "driver_category": self.driver_category,
            "required_experience": self.required_experience,
            "location": self.location,
            "salary": self.salary,
            "working_hours": self.working_hours,
            "required_documents": self.required_documents,
            "description": self.description,
            "status": self.status,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            )
        }