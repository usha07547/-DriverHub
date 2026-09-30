from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.notification import Notification


notifications_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications"
)


# Get notifications
@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():

    user_id = int(get_jwt_identity())

    notifications = Notification.query.filter_by(
        user_id=user_id
    ).order_by(
        Notification.created_at.desc()
    ).all()

    return {
        "status": "success",
        "count": len(notifications),
        "notifications": [
            notification.to_dict()
            for notification in notifications
        ]
    }, 200


# Mark notification as read
@notifications_bp.route(
    "/<int:notification_id>/read",
    methods=["PUT"]
)
@jwt_required()
def mark_as_read(notification_id):

    user_id = int(get_jwt_identity())

    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user_id
    ).first()

    if not notification:
        return {
            "status": "error",
            "message": "Notification not found"
        }, 404

    notification.is_read = True

    db.session.commit()

    return {
        "status": "success",
        "message": "Notification marked as read"
    }, 200