from flask import Flask
from flask_cors import CORS

from config import Config
from extensions import db, jwt


app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
jwt.init_app(app)

from models.user import User
from models.driver_profile import DriverProfile
from models.employer_profile import EmployerProfile
from routes.auth import auth_bp
from routes.driver import driver_bp
from routes.employer import employer_bp
from routes.jobs import jobs_bp
from routes.applications import applications_bp
from routes.documents import documents_bp
from routes.notifications import notifications_bp
from routes.admin import admin_bp


app.register_blueprint(auth_bp)
app.register_blueprint(driver_bp)
app.register_blueprint(employer_bp)
app.register_blueprint(jobs_bp)
app.register_blueprint(applications_bp)
app.register_blueprint(documents_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(admin_bp)


@app.route("/")
def home():
    return {
        "message": "Driver Hub API is running!"
    }


@app.route("/api/health")
def health():
    return {
        "status": "success",
        "message": "Driver Hub backend is healthy"
    }


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)