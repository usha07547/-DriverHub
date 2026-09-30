Driver Hub – Driver Job Portal

Driver Hub is a web-based driver job portal that connects drivers/candidates with employers. It provides authentication, driver profiles, job posting and search, job applications, candidate search, application status management, and an admin dashboard.

Project status: Web application MVP completed. Android application is planned as a future phase and is not included in this repository.

Features

Driver / Candidate

Register and log in

Create and manage driver profile

Add driving experience, skills, location, and other profile details

Upload documents / resume

Search and filter driver job vacancies

View complete job details

Apply for jobs

Track applied jobs and application status

View notifications

Employer

Register and log in

Create and manage company profile

Post driver job vacancies

Edit and delete job postings

Specify driver category, experience, location, salary, working hours, and requirements

View received applications

Shortlist, reject, or select candidates

Search for suitable driver profiles

View candidate profiles

Admin

Admin login

View dashboard statistics

Manage users

Activate or block users

Manage job postings

Activate, block, or close jobs

View applications

Tech Stack

Frontend

React

Vite

JavaScript

React Router

Lucide React

CSS

Backend

Python

Flask

Flask-SQLAlchemy

Flask-JWT-Extended

Flask-CORS

PyMySQL

python-dotenv

Werkzeug

Database

MySQL 8.0

Project Structure

DriverHub_Web/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── extensions.py
│   ├── requirements.txt
│   ├── models/
│   │   ├── user.py
│   │   ├── driver_profile.py
│   │   ├── employer_profile.py
│   │   ├── job.py
│   │   ├── application.py
│   │   ├── document.py
│   │   └── notification.py
│   └── routes/
│       ├── auth.py
│       ├── driver.py
│       ├── employer.py
│       ├── jobs.py
│       ├── applications.py
│       ├── documents.py
│       ├── notifications.py
│       └── admin.py
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── services/
    │       └── api.js
    ├── package.json
    └── vite.config.js

Database Setup

Create a MySQL database named:

CREATE DATABASE driver_hub;

Configure the backend .env file:

SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

DB_HOST=localhost
DB_PORT=3306
DB_NAME=driver_hub
DB_USER=root
DB_PASSWORD=your_mysql_password

Do not commit the .env file or real passwords/API keys to GitHub.

Backend Setup

Open PowerShell in the project folder:

cd D:\DriverHub_Web\backend

Create and activate the virtual environment:

python -m venv venv
.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Start the Flask backend:

python app.py

Backend API:

http://127.0.0.1:5000

Frontend Setup

Open a second terminal:

cd D:\DriverHub_Web\frontend

Install packages:

npm install

Start the Vite development server:

npm run dev

Frontend:

http://localhost:5173

Main API Modules

/api/auth
/api/driver
/api/employer
/api/jobs
/api/applications
/api/documents
/api/notifications
/api/admin

JWT-based authentication is used for protected API endpoints.

Application Workflow

Driver
  ↓
Register / Login
  ↓
Create Profile
  ↓
Search Jobs
  ↓
View Job
  ↓
Apply
  ↓
Track Application Status

Employer
  ↓
Register / Login
  ↓
Create Company Profile
  ↓
Post Job
  ↓
View Applications
  ↓
Shortlist / Reject / Select Candidate

Admin
  ↓
Login
  ↓
Dashboard
  ↓
Manage Users
  ↓
Manage Jobs
  ↓
View Applications

Security

Passwords are stored using password hashing.

JWT tokens are used for authenticated API access.

Backend secrets are stored in .env.

Sensitive files are excluded using .gitignore.

Future Enhancements

Android mobile application

Email/SMS notifications

Real-time messaging between employers and candidates

Advanced job recommendations

Online verification of driver documents

Cloud deployment and production monitoring

Author

Iyapla Usha

GitHub: usha07547/-DriverHub

