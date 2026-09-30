from datetime import datetime

from extensions import db


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    job_id = db.Column(
        db.Integer,
        db.ForeignKey("jobs.id"),
        nullable=False
    )

    driver_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="APPLIED"
    )

    cover_message = db.Column(
        db.Text,
        nullable=True
    )

    applied_at = db.Column(
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
            "job_id": self.job_id,
            "driver_id": self.driver_id,
            "status": self.status,
            "cover_message": self.cover_message,
            "applied_at": (
                self.applied_at.isoformat()
                if self.applied_at
                else None
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            )
        }