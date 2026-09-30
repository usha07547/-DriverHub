from datetime import datetime

from extensions import db


class DriverProfile(db.Model):
    __tablename__ = "driver_profiles"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    phone = db.Column(
        db.String(20),
        nullable=True
    )

    date_of_birth = db.Column(
        db.Date,
        nullable=True
    )

    address = db.Column(
        db.String(255),
        nullable=True
    )

    city = db.Column(
        db.String(100),
        nullable=True
    )

    driving_experience = db.Column(
        db.Integer,
        nullable=True
    )

    license_number = db.Column(
        db.String(50),
        nullable=True
    )

    license_category = db.Column(
        db.String(100),
        nullable=True
    )

    skills = db.Column(
        db.Text,
        nullable=True
    )

    bio = db.Column(
        db.Text,
        nullable=True
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
            "user_id": self.user_id,
            "phone": self.phone,
            "date_of_birth": (
                self.date_of_birth.isoformat()
                if self.date_of_birth
                else None
            ),
            "address": self.address,
            "city": self.city,
            "driving_experience": self.driving_experience,
            "license_number": self.license_number,
            "license_category": self.license_category,
            "skills": self.skills,
            "bio": self.bio,
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