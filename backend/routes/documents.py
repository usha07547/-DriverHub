import os

from flask import Blueprint, request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from extensions import db
from models.document import Document
from models.user import User


documents_bp = Blueprint(
    "documents",
    __name__,
    url_prefix="/api/documents"
)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {
    "pdf",
    "doc",
    "docx",
    "jpg",
    "jpeg",
    "png"
}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


# Upload document
@documents_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_document():

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
            "message": "Only drivers can upload documents"
        }, 403

    if "file" not in request.files:
        return {
            "status": "error",
            "message": "File is required"
        }, 400

    file = request.files["file"]

    document_type = request.form.get("document_type")

    if not document_type:
        return {
            "status": "error",
            "message": "document_type is required"
        }, 400

    if file.filename == "":
        return {
            "status": "error",
            "message": "No file selected"
        }, 400

    if not allowed_file(file.filename):
        return {
            "status": "error",
            "message": "Allowed files: PDF, DOC, DOCX, JPG, JPEG, PNG"
        }, 400

    filename = secure_filename(file.filename)

    unique_filename = (
        f"{driver_id}_{document_type}_{filename}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    file.save(file_path)

    document = Document(
        driver_id=driver_id,
        document_type=document_type,
        file_name=filename,
        file_path=file_path
    )

    db.session.add(document)
    db.session.commit()

    return {
        "status": "success",
        "message": "Document uploaded successfully",
        "document": document.to_dict()
    }, 201


# Driver views documents
@documents_bp.route("/my-documents", methods=["GET"])
@jwt_required()
def my_documents():

    driver_id = int(get_jwt_identity())

    documents = Document.query.filter_by(
        driver_id=driver_id
    ).order_by(
        Document.uploaded_at.desc()
    ).all()

    return {
        "status": "success",
        "count": len(documents),
        "documents": [
            document.to_dict()
            for document in documents
        ]
    }, 200


# Download/view document
@documents_bp.route(
    "/<int:document_id>/download",
    methods=["GET"]
)
@jwt_required()
def download_document(document_id):

    user_id = int(get_jwt_identity())

    document = Document.query.get(document_id)

    if not document:
        return {
            "status": "error",
            "message": "Document not found"
        }, 404

    user = User.query.get(user_id)

    if user.role == "DRIVER":
        if document.driver_id != user_id:
            return {
                "status": "error",
                "message": "Access denied"
            }, 403

    return send_from_directory(
        UPLOAD_FOLDER,
        os.path.basename(document.file_path),
        as_attachment=False
    )