import { useEffect, useState } from "react";

import {
  getMyApplications,
  searchJobs,
  getNotifications,
  getJob,
  applyForJob,
  getDriverProfile,
  saveDriverProfile,
  uploadDocument,
  getMyDocuments,
  downloadDocument,
  getEmployerProfile,
  saveEmployerProfile,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  searchDrivers,
  getCandidate,
  getEmployerApplications,
  updateApplicationStatus,
} from "./services/api";

import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileText,
  Home,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  User,
  Users,
  X,
  Bell,
  MapPin,
  Phone,
  Award,
} from "lucide-react";

import "./App.css";

const API_URL = "http://127.0.0.1:5000/api";

/* =========================================================
   HELPER
========================================================= */

function formatSalary(salary) {
  if (!salary) {
    return "Salary not specified";
  }

  return String(salary)
    .replace(/\?/g, "₹")
    .replace(/Rs\.?\s*/gi, "₹");
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [page, setPage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setPage("dashboard");
  };

  if (!token || !user) {
    return (
      <AuthScreen
        onLogin={(data) => {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));

          setToken(data.access_token);
          setUser(data.user);
          setPage("dashboard");
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        page={page}
        setPage={setPage}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
        logout={logout}
      />

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={22} />
          </button>

          <div>
            <h2>
              {page === "dashboard"
                ? "Dashboard"
                : page.charAt(0).toUpperCase() + page.slice(1)}
            </h2>

            <p>Welcome back, {user.name}</p>
          </div>

          <div className="topbar-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <div className="user-mini">
              <div className="avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{user.name}</strong>
                <span>{user.role}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="content-area">
          {user.role === "DRIVER" && (
            <DriverDashboard
              page={page}
              setPage={setPage}
            />
          )}

          {user.role === "EMPLOYER" && (
            <EmployerDashboard
              page={page}
              setPage={setPage}
            />
          )}

          {user.role === "ADMIN" && (
            <AdminDashboard page={page} />
          )}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   AUTHENTICATION
========================================================= */

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("DRIVER");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "login"
          ? `${API_URL}/auth/login`
          : `${API_URL}/auth/register`;

      const body =
        mode === "login"
          ? {
              email: form.email,
              password: form.password,
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              role,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong"
        );
      }

      if (mode === "login") {
        onLogin(data);
      } else {
        setMode("login");

        setError(
          "Registration successful. Please login."
        );

        setForm({
          name: "",
          email: form.email,
          password: "",
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand-large">
          <div className="brand-icon">
            <BriefcaseBusiness size={30} />
          </div>

          <span>
            Driver
            <span className="brand-accent">Hub</span>
          </span>
        </div>

        <div className="hero-content">
          <span className="hero-badge">
            DRIVER CAREER PLATFORM
          </span>

          <h1>
            Connect drivers with
            <span> better opportunities.</span>
          </h1>

          <p>
            Driver Hub connects skilled drivers with
            trusted employers, making job discovery and
            hiring simple, transparent and efficient.
          </p>

          <div className="hero-features">
            <div>
              <CheckCircle2 size={20} />
              <span>Verified job opportunities</span>
            </div>

            <div>
              <CheckCircle2 size={20} />
              <span>Professional driver profiles</span>
            </div>

            <div>
              <CheckCircle2 size={20} />
              <span>Simple application tracking</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-heading">
            <h2>
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p>
              {mode === "login"
                ? "Sign in to continue to Driver Hub"
                : "Join the Driver Hub platform today"}
            </p>
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
          )}

          {mode === "register" && (
            <div className="role-selector">
              <label>Account Type</label>

              <div className="role-options">
                <button
                  type="button"
                  className={
                    role === "DRIVER"
                      ? "role-active"
                      : ""
                  }
                  onClick={() => setRole("DRIVER")}
                >
                  <User size={18} />
                  Driver
                </button>

                <button
                  type="button"
                  className={
                    role === "EMPLOYER"
                      ? "role-active"
                      : ""
                  }
                  onClick={() => setRole("EMPLOYER")}
                >
                  <Building2 size={18} />
                  Employer
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                required
              />
            </div>

            {error && (
              <div
                className={
                  error.includes("successful")
                    ? "success-message"
                    : "error-message"
                }
              >
                {error}
              </div>
            )}

            <button
              className="primary-btn auth-btn"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div className="auth-switch">
            {mode === "login" ? (
              <>
                Don't have an account?

                <button
                  onClick={() => setMode("register")}
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Already have an account?

                <button
                  onClick={() => setMode("login")}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  user,
  page,
  setPage,
  mobileMenu,
  setMobileMenu,
  logout,
}) {
  const driverMenu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "jobs",
      label: "Find Jobs",
      icon: Search,
    },
    {
      id: "applications",
      label: "My Applications",
      icon: FileText,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: User,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "documents",
      label: "My Documents",
      icon: FileText,
    },
  ];

  const employerMenu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "jobs",
      label: "Manage Jobs",
      icon: BriefcaseBusiness,
    },
    {
      id: "applications",
      label: "Applications",
      icon: FileText,
    },
    {
      id: "candidates",
      label: "Find Drivers",
      icon: Users,
    },
    {
      id: "profile",
      label: "Company Profile",
      icon: Building2,
    },
  ];

  const adminMenu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
    },
    {
      id: "jobs",
      label: "Job Postings",
      icon: BriefcaseBusiness,
    },
    {
      id: "applications",
      label: "Applications",
      icon: FileText,
    },
  ];

  const menu =
    user.role === "DRIVER"
      ? driverMenu
      : user.role === "EMPLOYER"
      ? employerMenu
      : adminMenu;

  return (
    <>
      {mobileMenu && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`sidebar ${
          mobileMenu ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <BriefcaseBusiness size={23} />
          </div>

          <span>
            Driver
            <span className="brand-accent">Hub</span>
          </span>

          <button
            className="sidebar-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={22} />
          </button>
        </div>

        <div className="sidebar-role">
          {user.role === "DRIVER" &&
            "Driver Portal"}

          {user.role === "EMPLOYER" &&
            "Employer Portal"}

          {user.role === "ADMIN" &&
            "Administration"}
        </div>

        <nav>
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-item ${
                  page === item.id
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setPage(item.id);
                  setMobileMenu(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-box">
            <ShieldCheck size={20} />

            <div>
              <strong>Secure Platform</strong>
              <span>Your account is protected</span>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   DRIVER DASHBOARD
========================================================= */

function DriverDashboard({ page, setPage }) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] =
    useState([]);
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        jobsData,
        applicationsData,
        notificationsData,
      ] = await Promise.all([
        searchJobs(),
        getMyApplications(),
        getNotifications(),
      ]);

      setJobs(jobsData.jobs || []);

      setApplications(
        applicationsData.applications || []
      );

      setNotifications(
        notificationsData.notifications || []
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (page === "jobs") {
    return <JobsPage />;
  }

  if (page === "applications") {
    return <ApplicationsPage />;
  }

  if (page === "profile") {
    return <ProfilePage />;
  }

  if (page === "notifications") {
    return <NotificationsPage />;
  }

  if (page === "documents") {
    return <DocumentsPage />;
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>Unable to load dashboard</h2>

        <p>{error}</p>

        <button
          className="primary-btn"
          onClick={loadDashboardData}
        >
          Try Again
        </button>
      </div>
    );
  }

  const shortlisted = applications.filter(
    (application) =>
      application.status === "SHORTLISTED"
  ).length;

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Driver Dashboard</h1>

          <p>
            Manage your career and discover new
            opportunities.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setPage("jobs")}
        >
          <Search size={18} />
          Find Jobs
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Available Jobs"
          value={jobs.length}
          icon={<BriefcaseBusiness />}
          description="Active opportunities"
        />

        <StatCard
          title="Applications"
          value={applications.length}
          icon={<FileText />}
          description="Jobs you've applied for"
        />

        <StatCard
          title="Shortlisted"
          value={shortlisted}
          icon={<CheckCircle2 />}
          description="Applications shortlisted"
        />

        <StatCard
          title="Profile Completion"
          value="80%"
          icon={<User />}
          description="Complete your profile"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Available Jobs</h3>

              <p>
                Latest opportunities from employers
              </p>
            </div>

            <button
              onClick={() => setPage("jobs")}
            >
              View all
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <BriefcaseBusiness size={35} />

              <h4>No jobs available</h4>

              <p>
                There are currently no active jobs
                available.
              </p>
            </div>
          ) : (
            jobs.slice(0, 5).map((job) => (
              <JobCard
                key={job.id}
                title={job.title}
                company={
                  job.company_name ||
                  `Employer #${job.employer_id}`
                }
                location={job.location}
                salary={formatSalary(job.salary)}
                category={job.driver_category}
              />
            ))
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Applications</h3>

              <p>
                Your latest application activity
              </p>
            </div>

            <button
              onClick={() =>
                setPage("applications")
              }
            >
              View all
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              <FileText size={35} />

              <h4>No applications yet</h4>

              <p>
                Apply for a job to see it here.
              </p>
            </div>
          ) : (
            applications.slice(0, 5).map(
              (application) => (
                <ApplicationRow
                  key={application.id}
                  title={
                    application.job?.title ||
                    `Job #${application.job_id}`
                  }
                  company={
                    application.job?.location ||
                    "Employer"
                  }
                  status={application.status}
                />
              )
            )
          )}
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="panel dashboard-notifications">
          <div className="panel-header">
            <div>
              <h3>Latest Notifications</h3>

              <p>
                Stay updated with your opportunities
              </p>
            </div>

            <button
              onClick={() =>
                setPage("notifications")
              }
            >
              View all
            </button>
          </div>

          {notifications.slice(0, 3).map(
            (notification) => (
              <div
                className="notification-item"
                key={notification.id}
              >
                <Bell size={20} />

                <div>
                  <strong>
                    {notification.message}
                  </strong>

                  <p>
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </>
  );
}

/* =========================================================
   JOBS PAGE
========================================================= */

function JobsPage() {
  const [jobs, setJobs] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] =
    useState(null);

  const [coverMessage, setCoverMessage] =
    useState("");

  const [applying, setApplying] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [applyError, setApplyError] =
    useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const data = await searchJobs(filters);

      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    loadJobs({
      keyword,
      location,
      category,
    });
  };

  const handleViewJob = async (jobId) => {
    try {
      setApplyError("");
      setSuccessMessage("");

      const data = await getJob(jobId);

      setSelectedJob(data.job);
    } catch (err) {
      setApplyError(err.message);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) {
      return;
    }

    try {
      setApplying(true);
      setApplyError("");
      setSuccessMessage("");

      const data = await applyForJob(
        selectedJob.id,
        coverMessage
      );

      setSuccessMessage(
        data.message ||
          "Application submitted successfully!"
      );

      setCoverMessage("");
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Find Driver Jobs</h1>

          <p>
            Search opportunities based on your skills
            and location.
          </p>
        </div>
      </div>

      <form
        className="search-panel"
        onSubmit={handleSearch}
      >
        <div className="form-group">
          <label>Job Title</label>

          <input
            placeholder="Search job title..."
            value={keyword}
            onChange={(e) =>
              setKeyword(e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Location</label>

          <input
            placeholder="Location..."
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Category</label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="">
              All Categories
            </option>

            <option value="LMV">LMV</option>

            <option value="HMV">HMV</option>

            <option value="Transport">
              Transport
            </option>

            <option value="Commercial">
              Commercial
            </option>
          </select>
        </div>

        <button
          className="primary-btn"
          type="submit"
        >
          <Search size={18} />
          Search
        </button>
      </form>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-page">
          <h2>Unable to load jobs</h2>

          <p>{error}</p>

          <button
            className="primary-btn"
            onClick={() => loadJobs()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="empty-state">
          <BriefcaseBusiness size={35} />

          <h4>No jobs found</h4>

          <p>
            Try changing your search filters.
          </p>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="job-list">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              company={
                job.company_name ||
                `Employer #${job.employer_id}`
              }
              location={job.location}
              salary={formatSalary(job.salary)}
              category={job.driver_category}
              onView={() =>
                handleViewJob(job.id)
              }
            />
          ))}
        </div>
      )}

      {selectedJob && (
        <div className="modal-overlay">
          <div className="job-details-modal">
            <button
              className="modal-close"
              onClick={() => {
                setSelectedJob(null);
                setApplyError("");
                setSuccessMessage("");
              }}
            >
              ×
            </button>

            <h2>{selectedJob.title}</h2>

            <p className="company-name">
              {selectedJob.company_name ||
                `Employer #${selectedJob.employer_id}`}
            </p>

            <div className="job-detail-grid">
              <div>
                <strong>Location</strong>
                <p>{selectedJob.location}</p>
              </div>

              <div>
                <strong>Driver Category</strong>
                <p>
                  {selectedJob.driver_category}
                </p>
              </div>

              <div>
                <strong>Experience</strong>
                <p>
                  {selectedJob.required_experience} years
                </p>
              </div>

              <div>
                <strong>Salary</strong>
                <p>
                  {formatSalary(selectedJob.salary)}
                </p>
              </div>

              <div>
                <strong>Working Hours</strong>
                <p>
                  {selectedJob.working_hours ||
                    "Not specified"}
                </p>
              </div>

              <div>
                <strong>Required Documents</strong>
                <p>
                  {selectedJob.required_documents ||
                    "Not specified"}
                </p>
              </div>
            </div>

            <div className="job-description">
              <h3>Job Description</h3>

              <p>
                {selectedJob.description ||
                  "No description provided."}
              </p>
            </div>

            <div className="application-section">
              <h3>Apply for this Job</h3>

              <textarea
                placeholder="Write a short message to the employer..."
                value={coverMessage}
                onChange={(e) =>
                  setCoverMessage(e.target.value)
                }
                rows="4"
              />

              {successMessage && (
                <div className="success-message">
                  {successMessage}
                </div>
              )}

              {applyError && (
                <div className="error-message">
                  {applyError}
                </div>
              )}

              <button
                className="primary-btn"
                onClick={handleApply}
                disabled={applying}
              >
                {applying
                  ? "Submitting..."
                  : "Apply for Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   APPLICATIONS
========================================================= */

function ApplicationsPage() {
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getMyApplications();

      setApplications(
        data.applications || []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>My Applications</h1>

          <p>
            Track the status of jobs you have
            applied for.
          </p>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading applications...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-page">
          <h2>
            Unable to load applications
          </h2>

          <p>{error}</p>

          <button
            className="primary-btn"
            onClick={loadApplications}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="panel">
          {applications.length === 0 ? (
            <div className="empty-state">
              <FileText size={35} />

              <h4>No applications yet</h4>

              <p>
                Apply for a job to see your
                applications here.
              </p>
            </div>
          ) : (
            applications.map((application) => (
              <ApplicationRow
                key={application.id}
                title={
                  application.job?.title ||
                  `Job #${application.job_id}`
                }
                company={
                  application.job?.location ||
                  "Employer"
                }
                status={application.status}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DRIVER PROFILE - REAL DATABASE
========================================================= */

function ProfilePage() {
  const [profile, setProfile] = useState({
    phone: "",
    date_of_birth: "",
    address: "",
    city: "",
    driving_experience: "",
    license_number: "",
    license_category: "",
    skills: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDriverProfile();

      if (data.profile) {
        setProfile({
          phone: data.profile.phone || "",
          date_of_birth:
            data.profile.date_of_birth || "",
          address: data.profile.address || "",
          city: data.profile.city || "",
          driving_experience:
            data.profile.driving_experience ?? "",
          license_number:
            data.profile.license_number || "",
          license_category:
            data.profile.license_category || "",
          skills: data.profile.skills || "",
          bio: data.profile.bio || "",
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        phone: profile.phone,
        date_of_birth: profile.date_of_birth,
        address: profile.address,
        city: profile.city,
        driving_experience:
          profile.driving_experience === ""
            ? null
            : Number(profile.driving_experience),
        license_number: profile.license_number,
        license_category:
          profile.license_category,
        skills: profile.skills,
        bio: profile.bio,
      };

      const data =
        await saveDriverProfile(payload);

      setSuccess(
        data.message ||
          "Profile updated successfully!"
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>My Profile</h1>

          <p>
            Keep your professional driver profile
            up to date.
          </p>
        </div>
      </div>

      <div className="panel form-panel">
        <div className="profile-header">
          <div className="profile-avatar">
            D
          </div>

          <div>
            <h3>Driver Information</h3>

            <p>
              Complete your profile to improve your
              job opportunities.
            </p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group">
              <label>Phone Number</label>

              <div className="input-with-icon">
                <Phone size={18} />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={profile.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Date of Birth</label>

              <input
                type="date"
                name="date_of_birth"
                value={profile.date_of_birth}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>City</label>

              <div className="input-with-icon">
                <MapPin size={18} />

                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={profile.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Driving Experience</label>

              <input
                type="number"
                min="0"
                name="driving_experience"
                placeholder="Years of experience"
                value={
                  profile.driving_experience
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>License Category</label>

              <select
                name="license_category"
                value={
                  profile.license_category
                }
                onChange={handleChange}
              >
                <option value="">
                  Select category
                </option>

                <option value="LMV">
                  LMV
                </option>

                <option value="HMV">
                  HMV
                </option>

                <option value="Transport">
                  Transport
                </option>

                <option value="Commercial">
                  Commercial
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>License Number</label>

              <div className="input-with-icon">
                <Award size={18} />

                <input
                  type="text"
                  name="license_number"
                  placeholder="Enter license number"
                  value={
                    profile.license_number
                  }
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Address</label>

              <textarea
                name="address"
                rows="3"
                placeholder="Enter your complete address"
                value={profile.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Skills</label>

              <input
                type="text"
                name="skills"
                placeholder="Example: Safe Driving, Route Planning, Vehicle Maintenance"
                value={profile.skills}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Professional Bio</label>

              <textarea
                name="bio"
                rows="5"
                placeholder="Write a short professional description about yourself..."
                value={profile.bio}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationsPage() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data =
        await getNotifications();

      setNotifications(
        data.notifications || []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Notifications</h1>

          <p>
            Stay updated with relevant job
            opportunities.
          </p>
        </div>
      </div>

      <div className="panel">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={35} />

            <h4>No notifications</h4>

            <p>
              You are all caught up.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              className="notification-item"
              key={notification.id}
            >
              <Bell size={20} />

              <div>
                <strong>
                  {notification.message}
                </strong>

                <p>
                  {new Date(
                    notification.created_at
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* =========================================================
   DRIVER DOCUMENTS
========================================================= */

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [documentType, setDocumentType] = useState("RESUME");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const data = await uploadDocument(
        selectedFile,
        documentType
      );

      setSuccess(
        data.message || "Document uploaded successfully!"
      );

      setSelectedFile(null);
      e.target.reset();

      await loadDocuments();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      setError("");

      const blob = await downloadDocument(document.id);

      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = url;
      link.download = document.file_name || "document";

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>My Documents</h1>
          <p>
            Upload and manage your professional documents.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="panel document-upload-panel">
        <div className="panel-header">
          <div>
            <h3>Upload Document</h3>
            <p>
              Upload your resume, driving license or
              other required documents.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleUpload}
          className="document-form"
        >
          <div className="form-group">
            <label>Document Type</label>

            <select
              value={documentType}
              onChange={(e) =>
                setDocumentType(e.target.value)
              }
            >
              <option value="RESUME">Resume</option>
              <option value="DRIVING_LICENSE">
                Driving License
              </option>
              <option value="AADHAAR">Aadhaar</option>
              <option value="EXPERIENCE_CERTIFICATE">
                Experience Certificate
              </option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select File</label>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) =>
                setSelectedFile(
                  e.target.files?.[0] || null
                )
              }
            />

            <small>
              Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG
            </small>
          </div>

          {selectedFile && (
            <div className="selected-file">
              <FileText size={20} />

              <div>
                <strong>
                  {selectedFile.name}
                </strong>

                <span>
                  {(
                    selectedFile.size / 1024 / 1024
                  ).toFixed(2)}{" "}
                  MB
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="primary-btn"
            disabled={uploading}
          >
            {uploading
              ? "Uploading..."
              : "Upload Document"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Uploaded Documents</h3>
            <p>Your saved documents</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <FileText size={35} />

            <h4>No documents uploaded</h4>

            <p>
              Upload your first document above.
            </p>
          </div>
        ) : (
          <div className="document-list">
            {documents.map((document) => (
              <div
                className="document-item"
                key={document.id}
              >
                <div className="document-icon">
                  <FileText size={22} />
                </div>

                <div className="document-info">
                  <strong>
                    {document.document_type || "Document"}
                  </strong>

                  <span>
                    {document.file_name}
                  </span>

                  <small>
                    Uploaded:{" "}
                    {document.uploaded_at
                      ? new Date(
                          document.uploaded_at
                        ).toLocaleString()
                      : "Recently"}
                  </small>
                </div>

                <button
                  type="button"
                  className="outline-btn"
                  onClick={() =>
                    handleDownload(document)
                  }
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   EMPLOYER DASHBOARD
========================================================= */

function EmployerDashboard({ page }) {
  if (page === "jobs") {
    return <EmployerJobsPage />;
  }

  if (page === "applications") {
    return <EmployerApplicationsPage />;
  }

  if (page === "candidates") {
    return <CandidatesPage />;
  }

  if (page === "profile") {
    return <CompanyProfilePage />;
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Employer Dashboard</h1>

          <p>
            Find skilled drivers and manage your
            hiring process.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setPage("jobs")}
        >
          <BriefcaseBusiness size={18} />
          Post New Job
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Active Jobs"
          value="8"
          icon={<BriefcaseBusiness />}
          description="Currently published"
        />

        <StatCard
          title="Applications"
          value="42"
          icon={<FileText />}
          description="Total applications"
        />

        <StatCard
          title="Shortlisted"
          value="12"
          icon={<CheckCircle2 />}
          description="Candidates shortlisted"
        />

        <StatCard
          title="Drivers"
          value="156"
          icon={<Users />}
          description="Available profiles"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Job Posts</h3>
              <p>Your latest vacancies</p>
            </div>
          </div>

          <JobCard
            title="Heavy Vehicle Driver"
            company="ABC Logistics"
            location="Bangalore"
            salary="₹25,000 - ₹30,000"
            category="HMV"
          />

          <JobCard
            title="Delivery Driver"
            company="ABC Logistics"
            location="Bangalore"
            salary="₹22,000 - ₹26,000"
            category="LMV"
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Applications</h3>
              <p>Latest candidates</p>
            </div>
          </div>

          <ApplicationRow
            title="Rajesh Kumar"
            company="Heavy Vehicle Driver"
            status="SHORTLISTED"
          />

          <ApplicationRow
            title="Arun Kumar"
            company="Delivery Driver"
            status="APPLIED"
          />

          <ApplicationRow
            title="Manoj Singh"
            company="Transport Driver"
            status="APPLIED"
          />
        </div>
      </div>
    </>
  );
}

/* =========================================================
   EMPLOYER JOBS
========================================================= */
function EmployerJobsPage() {
  const emptyForm = {
    title: "",
    driver_category: "",
    required_experience: "",
    location: "",
    salary: "",
    working_hours: "",
    required_documents: "",
    description: "",
  };

  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyJobs();

      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleOpenCreate = () => {
    setEditingJob(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleEdit = (job) => {
    setEditingJob(job);

    setForm({
      title: job.title || "",
      driver_category: job.driver_category || "",
      required_experience:
        job.required_experience ?? "",
      location: job.location || "",
      salary: job.salary || "",
      working_hours: job.working_hours || "",
      required_documents:
        job.required_documents || "",
      description: job.description || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingJob(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        title: form.title,
        driver_category: form.driver_category,
        required_experience:
          form.required_experience === ""
            ? null
            : Number(form.required_experience),
        location: form.location,
        salary: form.salary,
        working_hours: form.working_hours,
        required_documents:
          form.required_documents,
        description: form.description,
      };

      let data;

      if (editingJob) {
        data = await updateJob(
          editingJob.id,
          payload
        );
      } else {
        data = await createJob(payload);
      }

      setSuccess(
        data.message ||
          (editingJob
            ? "Job updated successfully!"
            : "Job posted successfully!")
      );

      setShowForm(false);
      setEditingJob(null);
      setForm(emptyForm);

      await loadJobs();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const data = await deleteJob(jobId);

      setSuccess(
        data.message ||
          "Job deleted successfully!"
      );

      await loadJobs();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Manage Jobs</h1>

          <p>
            Create and manage your driver
            vacancies.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={handleOpenCreate}
        >
          <BriefcaseBusiness size={18} />
          Post New Job
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {showForm && (
        <div className="panel form-panel">
          <div className="panel-header">
            <div>
              <h3>
                {editingJob
                  ? "Edit Job"
                  : "Post New Job"}
              </h3>

              <p>
                Enter the job requirements for
                drivers.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-grid">

              <div className="form-group">
                <label>Job Title</label>

                <input
                  type="text"
                  name="title"
                  placeholder="Example: Heavy Vehicle Driver"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Driver Category</label>

                <select
                  name="driver_category"
                  value={form.driver_category}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="LMV">
                    LMV
                  </option>

                  <option value="HMV">
                    HMV
                  </option>

                  <option value="Transport">
                    Transport
                  </option>

                  <option value="Commercial">
                    Commercial
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Required Experience (Years)
                </label>

                <input
                  type="number"
                  min="0"
                  name="required_experience"
                  placeholder="Example: 2"
                  value={
                    form.required_experience
                  }
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location</label>

                <input
                  type="text"
                  name="location"
                  placeholder="Example: Bangalore"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Salary</label>

                <input
                  type="text"
                  name="salary"
                  placeholder="Example: ₹25,000 - ₹30,000"
                  value={form.salary}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Working Hours</label>

                <input
                  type="text"
                  name="working_hours"
                  placeholder="Example: 8 hours/day"
                  value={form.working_hours}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label>
                  Required Documents
                </label>

                <input
                  type="text"
                  name="required_documents"
                  placeholder="Example: Driving License, Aadhaar, Experience Certificate"
                  value={
                    form.required_documents
                  }
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Job Description</label>

                <textarea
                  name="description"
                  rows="5"
                  placeholder="Describe the job responsibilities and requirements..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingJob
                  ? "Update Job"
                  : "Post Job"}
              </button>

              <button
                type="button"
                className="outline-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Your Job Postings</h3>

            <p>
              Jobs posted by your company
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <BriefcaseBusiness size={35} />

            <h4>No jobs posted yet</h4>

            <p>
              Click "Post New Job" to create
              your first vacancy.
            </p>
          </div>
        ) : (
          <div className="job-list">
            {jobs.map((job) => (
              <div
                className="panel"
                key={job.id}
                style={{
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3>{job.title}</h3>

                    <p>
                      {job.driver_category} •{" "}
                      {job.location}
                    </p>

                    <p>
                      Experience:{" "}
                      {job.required_experience}{" "}
                      years
                    </p>

                    <p>
                      Salary:{" "}
                      {formatSalary(job.salary)}
                    </p>

                    <p>
                      Working Hours:{" "}
                      {job.working_hours ||
                        "Not specified"}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    <button
                      className="outline-btn"
                      onClick={() =>
                        handleEdit(job)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="outline-btn"
                      onClick={() =>
                        handleDelete(job.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {job.description && (
                  <div
                    style={{
                      marginTop: "15px",
                    }}
                  >
                    <strong>
                      Description
                    </strong>

                    <p>
                      {job.description}
                    </p>
                  </div>
                )}

                {job.required_documents && (
                  <div
                    style={{
                      marginTop: "10px",
                    }}
                  >
                    <strong>
                      Required Documents
                    </strong>

                    <p>
                      {job.required_documents}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   EMPLOYER APPLICATIONS
========================================================= */

function EmployerApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployerApplications();
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      setError("");
      setSuccess("");

      const data = await updateApplicationStatus(
        applicationId,
        status
      );

      setSuccess(
        data.message || "Application status updated successfully!"
      );

      await loadApplications();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Applications</h1>
          <p>Review and manage driver applications.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <FileText size={35} />
            <h4>No applications yet</h4>
            <p>Applications from drivers will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="panel">
          {applications.map((application) => {
            const driver =
              application.driver ||
              application.user ||
              {};
            const job = application.job || {};

            return (
              <div
                className="application-row"
                key={application.id}
                style={{ alignItems: "flex-start" }}
              >
                <div className="application-icon">
                  <User size={19} />
                </div>

                <div style={{ flex: 1 }}>
                  <strong>
                    {driver.name ||
                      `Driver #${application.driver_id}`}
                  </strong>

                  <span>
                    {job.title || `Job #${application.job_id}`}
                  </span>

                  {driver.email && (
                    <span>{driver.email}</span>
                  )}

                  {application.cover_message && (
                    <span>
                      Message: {application.cover_message}
                    </span>
                  )}
                </div>

                <span
                  className={`status ${String(
                    application.status || "APPLIED"
                  ).toLowerCase()}`}
                >
                  {application.status || "APPLIED"}
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="outline-btn"
                    disabled={updatingId === application.id}
                    onClick={() =>
                      handleStatusChange(
                        application.id,
                        "SHORTLISTED"
                      )
                    }
                  >
                    Shortlist
                  </button>

                  <button
                    type="button"
                    className="outline-btn"
                    disabled={updatingId === application.id}
                    onClick={() =>
                      handleStatusChange(
                        application.id,
                        "REJECTED"
                      )
                    }
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    className="outline-btn"
                    disabled={updatingId === application.id}
                    onClick={() =>
                      handleStatusChange(
                        application.id,
                        "SELECTED"
                      )
                    }
                  >
                    Select
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FIND DRIVERS
========================================================= */

function CandidatesPage() {
  const [drivers, setDrivers] = useState([]);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const data = await searchDrivers(filters);
      setDrivers(data.drivers || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadDrivers({
      city: city.trim(),
      category,
      experience,
    });
  };

  const handleViewProfile = async (driver) => {
    const driverId =
      driver?.driver?.id ||
      driver?.user_id ||
      driver?.id;

    if (!driverId) {
      setError("Driver information is incomplete.");
      return;
    }

    try {
      setProfileLoading(true);
      setError("");

      const data = await getCandidate(driverId);

      setSelectedDriver(
        data.candidate ||
          data.driver ||
          data.profile ||
          null
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load driver profile");
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Find Drivers</h1>
          <p>Search qualified drivers for your vacancies.</p>
        </div>
      </div>

      <form className="search-panel" onSubmit={handleSearch}>
        <input
          placeholder="Search city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="LMV">LMV</option>
          <option value="HMV">HMV</option>
          <option value="Transport">Transport</option>
          <option value="Commercial">Commercial</option>
        </select>

        <input
          placeholder="Minimum experience"
          type="number"
          min="0"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />

        <button type="submit" className="primary-btn" disabled={loading}>
          <Search size={18} />
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading drivers...</p>
        </div>
      ) : drivers.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <Users size={35} />
            <h4>No drivers found</h4>
            <p>Try changing your search filters.</p>
          </div>
        </div>
      ) : (
        <div className="candidate-grid">
          {drivers.map((driver) => {
            const driverUser = driver.driver || {};
            const displayName =
              driverUser.name ||
              driver.name ||
              `Driver #${driverUser.id || driver.id}`;
            const displayId =
              driverUser.id || driver.user_id || driver.id;

            return (
              <div className="candidate-card" key={displayId}>
                <div className="candidate-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </div>

                <h3>{displayName}</h3>

                <p>{driver.city || "Location not specified"}</p>

                <span>
                  {driver.driving_experience ?? 0} Years Experience • {driver.license_category || "Category not specified"}
                </span>

                {driverUser.email && (
                  <span>{driverUser.email}</span>
                )}

                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => handleViewProfile(driver)}
                >
                  View Profile
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedDriver && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedDriver(null)}
            >
              ×
            </button>

            {profileLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading driver profile...</p>
              </div>
            ) : (
              <>
                <h2>{selectedDriver.name || "Driver Profile"}</h2>

                <div className="job-detail-grid">
                  <div>
                    <strong>City</strong>
                    <p>{selectedDriver.city || "Not specified"}</p>
                  </div>
                  <div>
                    <strong>Phone</strong>
                    <p>{selectedDriver.phone || "Not specified"}</p>
                  </div>
                  <div>
                    <strong>Email</strong>
                    <p>{selectedDriver.email || "Not specified"}</p>
                  </div>
                  <div>
                    <strong>Experience</strong>
                    <p>{selectedDriver.driving_experience ?? 0} years</p>
                  </div>
                  <div>
                    <strong>License Category</strong>
                    <p>{selectedDriver.license_category || "Not specified"}</p>
                  </div>
                  <div>
                    <strong>License Number</strong>
                    <p>{selectedDriver.license_number || "Not specified"}</p>
                  </div>
                  <div>
                    <strong>Skills</strong>
                    <p>{selectedDriver.skills || "Not specified"}</p>
                  </div>
                </div>

                <div className="job-description">
                  <h3>Address</h3>
                  <p>{selectedDriver.address || "Not specified"}</p>
                </div>

                <div className="job-description">
                  <h3>Professional Bio</h3>
                  <p>{selectedDriver.bio || "No bio provided."}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   COMPANY PROFILE
========================================================= */

function CompanyProfilePage() {
  const [profile, setProfile] = useState({
    company_name: "",
    company_description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    website: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployerProfile();

      if (data.profile) {
        setProfile({
          company_name: data.profile.company_name || "",
          company_description: data.profile.company_description || "",
          phone: data.profile.phone || "",
          email: data.profile.email || "",
          address: data.profile.address || "",
          city: data.profile.city || "",
          website: data.profile.website || "",
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = await saveEmployerProfile(profile);

      setSuccess(
        data.message || "Company profile updated successfully!"
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading company profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Company Profile</h1>
          <p>Manage your company information.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="panel form-panel">
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="company_name"
                value={profile.company_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={profile.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                rows="3"
                value={profile.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Company Website</label>
              <input
                type="url"
                name="website"
                placeholder="https://example.com"
                value={profile.website}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Company Description</label>
              <textarea
                name="company_description"
                rows="5"
                value={profile.company_description}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Company Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({ page }) {
  if (page === "users") {
    return <AdminUsersPage />;
  }

  if (page === "jobs") {
    return <AdminJobsPage />;
  }

  if (page === "applications") {
    return <AdminApplicationsPage />;
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Administration Dashboard</h1>
          <p>Monitor and manage the Driver Hub platform.</p>
        </div>

        <div className="admin-badge">
          <ShieldCheck size={18} />
          Administrator
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value="-"
          icon={<Users />}
          description="Registered accounts"
        />

        <StatCard
          title="Drivers"
          value="-"
          icon={<User />}
          description="Registered drivers"
        />

        <StatCard
          title="Employers"
          value="-"
          icon={<Building2 />}
          description="Registered employers"
        />

        <StatCard
          title="Job Posts"
          value="-"
          icon={<BriefcaseBusiness />}
          description="Total job postings"
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Platform Management</h3>
            <p>Use the sidebar to manage users, jobs and applications.</p>
          </div>
        </div>

        <div className="overview-list">
          <OverviewItem
            title="User Management"
            description="View registered drivers and employers"
            icon={<Users />}
          />

          <OverviewItem
            title="Job Management"
            description="Review job postings"
            icon={<BriefcaseBusiness />}
          />

          <OverviewItem
            title="Application Management"
            description="Monitor applications"
            icon={<FileText />}
          />
        </div>
      </div>
    </>
  );
}

/* =========================================================
   ADMIN USERS
========================================================= */

function AdminUsersPage() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>User Management</h1>

          <p>
            Manage registered drivers and
            employers.
          </p>
        </div>
      </div>

      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Test Driver</td>
              <td>driver@test.com</td>
              <td>DRIVER</td>

              <td>
                <span className="status active">
                  ACTIVE
                </span>
              </td>
            </tr>

            <tr>
              <td>Test Employer</td>
              <td>employer@test.com</td>
              <td>EMPLOYER</td>

              <td>
                <span className="status active">
                  ACTIVE
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN JOBS
========================================================= */

function AdminJobsPage() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Job Postings</h1>

          <p>
            Review and manage all job
            vacancies.
          </p>
        </div>
      </div>

      <div className="panel">
        <JobCard
          title="Heavy Vehicle Driver"
          company="ABC Logistics"
          location="Bangalore"
          salary="₹25,000 - ₹30,000"
          category="HMV"
        />
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN APPLICATIONS
========================================================= */

function AdminApplicationsPage() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Application Management</h1>

          <p>
            Monitor applications across the
            platform.
          </p>
        </div>
      </div>

      <div className="panel">
        <ApplicationRow
          title="Rajesh Kumar"
          company="Heavy Vehicle Driver • ABC Logistics"
          status="SHORTLISTED"
        />

        <ApplicationRow
          title="Arun Kumar"
          company="Delivery Driver • ABC Logistics"
          status="APPLIED"
        />
      </div>
    </div>
  );
}

/* =========================================================
   COMMON COMPONENTS
========================================================= */

function StatCard({
  title,
  value,
  icon,
  description,
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">
        <span>{title}</span>

        <strong>{value}</strong>

        <small>{description}</small>
      </div>
    </div>
  );
}

function JobCard({
  title,
  company,
  location,
  salary,
  category,
  onView,
}) {
  return (
    <div className="job-card">
      <div className="job-icon">
        <BriefcaseBusiness size={21} />
      </div>

      <div className="job-info">
        <h4>{title}</h4>

        <p>{company}</p>

        <div className="job-meta">
          <span>{location}</span>

          <span>{formatSalary(salary)}</span>

          <span>{category}</span>
        </div>
      </div>

      {onView && (
        <button
          className="outline-btn"
          onClick={onView}
        >
          View
        </button>
      )}
    </div>
  );
}

function ApplicationRow({
  title,
  company,
  status,
}) {
  return (
    <div className="application-row">
      <div className="application-icon">
        <FileText size={19} />
      </div>

      <div>
        <strong>{title}</strong>

        <span>{company}</span>
      </div>

      <span
        className={`status ${String(
          status
        ).toLowerCase()}`}
      >
        {status}
      </span>
    </div>
  );
}

function OverviewItem({
  title,
  description,
  icon,
}) {
  return (
    <div className="overview-item">
      <div className="overview-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>

        <p>{description}</p>
      </div>
    </div>
  );
}

export default App;