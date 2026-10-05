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
  Eye,
  EyeOff,
} from "lucide-react";

import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000/api";

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
  const [showAuth, setShowAuth] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        throw new Error(data.message || "Something went wrong");
      }

      if (mode === "login") {
        onLogin(data);
      } else {
        setMode("login");
        setError("Registration successful. Please login.");

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

  const openAuth = (nextMode = "login", nextRole = role) => {
    setMode(nextMode);
    setRole(nextRole);
    setError("");
    setShowPassword(false);
    setShowAuth(true);
  };

  const explorePlatform = () => {
    document
      .getElementById("platform-overview")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <div className="auth-page-premium">
      <div className="auth-noise"></div>

      <header className="landing-nav">
        <div className="landing-brand">
          <div className="landing-brand-mark">
            <BriefcaseBusiness size={22} strokeWidth={2.4} />
          </div>

          <div>
            <div className="landing-brand-name">
              Driver<span>Hub</span>
            </div>

            <div className="landing-brand-caption">
              DRIVER CAREER PLATFORM
            </div>
          </div>
        </div>

        <div className="landing-nav-right">
          <span className="nav-status">
            <span className="status-pulse"></span>
            Platform online
          </span>

          <button
            type="button"
            className="nav-login-link"
            onClick={() => openAuth("login")}
          >
            Sign in
          </button>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-copy">
          <div className="eyebrow-pill">
            <span className="eyebrow-dot"></span>
            THE SMARTER WAY TO DRIVE YOUR CAREER
          </div>

          <h1>
            Your next
            <span> driving opportunity</span>
            starts here.
          </h1>

          <p className="landing-description">
            Discover trusted driving jobs, build a verified professional
            profile, and connect with employers looking for people like you.
          </p>

          <div className="landing-actions">
            <button
              type="button"
              className="landing-primary"
              onClick={() => openAuth("register", "DRIVER")}
            >
              Create driver profile
              <span>→</span>
            </button>

            <button
              type="button"
              className="landing-secondary"
              onClick={explorePlatform}
            >
              Explore the platform
              <span>↗</span>
            </button>
          </div>

          <div className="trust-row">
            <div className="trust-item">
              <CheckCircle2 size={18} />
              <span>Verified opportunities</span>
            </div>

            <div className="trust-item">
              <ShieldCheck size={18} />
              <span>Secure profiles</span>
            </div>

            <div className="trust-item">
              <Award size={18} />
              <span>Career focused</span>
            </div>
          </div>

          <div className="landing-metrics">
            <div>
              <strong>10K+</strong>
              <span>Drivers</span>
            </div>

            <div>
              <strong>500+</strong>
              <span>Employers</span>
            </div>

            <div>
              <strong>1.2K+</strong>
              <span>Opportunities</span>
            </div>
          </div>
        </section>

        <section
          className="landing-visual"
          aria-label="DriverHub product preview"
        >
          <div className="visual-glow"></div>
          <div className="visual-orbit orbit-one"></div>
          <div className="visual-orbit orbit-two"></div>

          <div className="match-card glass-card">
            <div className="glass-card-top">
              <span className="mini-label">
                DRIVER MATCH
              </span>

              <span className="verified-chip">
                <CheckCircle2 size={13} />
                Verified
              </span>
            </div>

            <div className="match-score">
              <strong>94%</strong>
              <span>Excellent match</span>
            </div>

            <div className="match-bar">
              <span></span>
            </div>

            <div className="match-list">
              <div>
                <CheckCircle2 size={15} />
                <span>License verified</span>
              </div>

              <div>
                <CheckCircle2 size={15} />
                <span>Experience matched</span>
              </div>

              <div>
                <CheckCircle2 size={15} />
                <span>Location compatible</span>
              </div>
            </div>
          </div>

          <div className="job-preview-card glass-card">
            <div className="job-preview-icon">
              <BriefcaseBusiness size={20} />
            </div>

            <div className="job-preview-content">
              <span className="mini-label">
                NEW OPPORTUNITY
              </span>

              <strong>Heavy Vehicle Driver</strong>

              <span className="job-preview-company">
                ABC Logistics · Bangalore
              </span>

              <div className="job-preview-bottom">
                <b>₹25K – ₹35K / month</b>
                <span>View role →</span>
              </div>
            </div>
          </div>

          <div className="profile-card glass-card">
            <div className="profile-avatar">
              <User size={20} />
            </div>

            <div>
              <span className="mini-label">
                PROFILE STRENGTH
              </span>

              <strong>80% complete</strong>

              <div className="profile-progress">
                <span></span>
              </div>
            </div>
          </div>

          <div className="visual-center">
            <div className="center-ring">
              <div className="center-logo">
                <BriefcaseBusiness size={34} />
              </div>
            </div>

            <span>DRIVERHUB</span>
            <small>CONNECT · DRIVE · GROW</small>
          </div>
        </section>
      </main>

      {/* =====================================================
          PLATFORM OVERVIEW
      ===================================================== */}

      <section
        id="platform-overview"
        className="platform-overview"
      >
        <div className="platform-heading">
          <span className="section-kicker">
            DRIVERHUB PLATFORM
          </span>

          <h2>
            Everything you need
            <br />
            to move forward.
          </h2>

          <p>
            One focused platform connecting drivers, employers,
            and administrators through a simple professional workflow.
          </p>
        </div>

        <div className="platform-role-grid">
          <div className="platform-role-card">
            <div className="platform-role-icon driver-icon">
              <User size={22} />
            </div>

            <span className="platform-role-label">
              FOR DRIVERS
            </span>

            <h3>Find your next opportunity</h3>

            <p>
              Build your professional profile, discover relevant
              jobs, apply with confidence, and track your progress.
            </p>

            <div className="platform-feature-list">
              <div>
                <CheckCircle2 size={16} />
                Smart job discovery
              </div>

              <div>
                <CheckCircle2 size={16} />
                Profile & documents
              </div>

              <div>
                <CheckCircle2 size={16} />
                Application tracking
              </div>
            </div>
          </div>

          <div className="platform-role-card platform-role-featured">
            <div className="platform-role-icon employer-icon">
              <Building2 size={22} />
            </div>

            <span className="platform-role-label">
              FOR EMPLOYERS
            </span>

            <h3>Hire the right driver</h3>

            <p>
              Publish vacancies, discover suitable drivers,
              and manage your hiring pipeline from one place.
            </p>

            <div className="platform-feature-list">
              <div>
                <CheckCircle2 size={16} />
                Job posting management
              </div>

              <div>
                <CheckCircle2 size={16} />
                Candidate discovery
              </div>

              <div>
                <CheckCircle2 size={16} />
                Shortlist & manage
              </div>
            </div>
          </div>

          <div className="platform-role-card">
            <div className="platform-role-icon admin-icon">
              <ShieldCheck size={22} />
            </div>

            <span className="platform-role-label">
              FOR ADMIN
            </span>

            <h3>Keep the platform trusted</h3>

            <p>
              Manage users, job postings, and applications
              while keeping the DriverHub ecosystem organized.
            </p>

            <div className="platform-feature-list">
              <div>
                <CheckCircle2 size={16} />
                User management
              </div>

              <div>
                <CheckCircle2 size={16} />
                Job moderation
              </div>

              <div>
                <CheckCircle2 size={16} />
                Platform oversight
              </div>
            </div>
          </div>
        </div>

        <div className="platform-bottom-grid">
          <div className="how-it-works-card">
            <span className="section-kicker">
              HOW IT WORKS
            </span>

            <h3>
              A simple journey from profile
              to opportunity.
            </h3>

            <div className="journey-grid">
              <div>
                <span>01</span>
                <b>Create your account</b>
              </div>

              <div>
                <span>02</span>
                <b>Build your profile</b>
              </div>

              <div>
                <span>03</span>
                <b>Connect & apply</b>
              </div>

              <div>
                <span>04</span>
                <b>Track your progress</b>
              </div>
            </div>
          </div>

          <div className="contact-platform-card">
            <span className="section-kicker">
              NEED HELP?
            </span>

            <h3>Let's get you moving.</h3>

            <p>
              For platform support, partnership questions,
              or hiring assistance, reach out to the DriverHub team.
            </p>

            <div className="contact-detail">
              <Phone size={17} />
              <span>+91 98765 43210</span>
            </div>

            <div className="contact-detail">
              <FileText size={17} />
              <span>support@driverhub.com</span>
            </div>

            <div className="contact-detail">
              <MapPin size={17} />
              <span>Bangalore, Karnataka</span>
            </div>
          </div>
        </div>
      </section>

      {showAuth && (
        <div
          className="auth-modal-overlay"
          onClick={() => setShowAuth(false)}
          aria-hidden="true"
        />
      )}

      {showAuth && (
        <aside className="auth-panel-wrap auth-modal-wrap">
          <div className="auth-panel">
            <button
              type="button"
              className="auth-modal-close"
              onClick={() => setShowAuth(false)}
              aria-label="Close sign in"
            >
              <X size={18} />
            </button>

            <div className="auth-panel-head">
              <div className="auth-panel-icon">
                {mode === "login" ? (
                  <BriefcaseBusiness size={21} />
                ) : (
                  <User size={21} />
                )}
              </div>

              <div>
                <span className="auth-panel-kicker">
                  DRIVERHUB ACCESS
                </span>

                <h2>
                  {mode === "login"
                    ? "Welcome back."
                    : "Build your profile."}
                </h2>

                <p>
                  {mode === "login"
                    ? "Sign in to continue your career journey."
                    : "Join drivers and employers using DriverHub."}
                </p>
              </div>
            </div>

            {mode === "register" && (
              <div className="form-group premium-form-group">
                <label>Full Name</label>

                <div className="input-shell">
                  <User size={17} />

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
              </div>
            )}

            {mode === "register" && (
              <div className="role-selector premium-role-selector">
                <label>Choose your account</label>

                <div className="role-options premium-role-options">
                  <button
                    type="button"
                    className={
                      role === "DRIVER"
                        ? "role-active"
                        : ""
                    }
                    onClick={() =>
                      setRole("DRIVER")
                    }
                  >
                    <User size={18} />

                    <span>
                      <b>Driver</b>
                      <small>
                        Find opportunities
                      </small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      role === "EMPLOYER"
                        ? "role-active"
                        : ""
                    }
                    onClick={() =>
                      setRole("EMPLOYER")
                    }
                  >
                    <Building2 size={18} />

                    <span>
                      <b>Employer</b>
                      <small>
                        Hire drivers
                      </small>
                    </span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group premium-form-group">
                <label>Email Address</label>

                <div className="input-shell">
                  <span className="input-symbol">
                    @
                  </span>

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
              </div>

              <div className="form-group premium-form-group">
                <div className="label-row">
                  <label>Password</label>

                  {mode === "login" && (
                    <span className="secure-label">
                      <ShieldCheck size={13} />
                      Secure login
                    </span>
                  )}
                </div>

                <div className="input-shell password-input-shell">
                  <span className="input-symbol">
                    ••
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
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

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    title={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className={
                    error.includes("successful")
                      ? "success-message premium-message"
                      : "error-message premium-message"
                  }
                >
                  {error}
                </div>
              )}

              <button
                className="primary-btn auth-btn premium-auth-btn"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Please wait..."
                    : mode === "login"
                    ? "Sign in to DriverHub"
                    : "Create my account"}
                </span>

                {!loading && (
                  <span className="button-arrow">
                    →
                  </span>
                )}
              </button>
            </form>

            <div className="auth-panel-divider">
              <span>OR</span>
            </div>

            <div className="auth-switch premium-auth-switch">
              {mode === "login" ? (
                <>
                  <span>
                    New to DriverHub?
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError("");
                    }}
                  >
                    Create free account
                  </button>
                </>
              ) : (
                <>
                  <span>
                    Already have an account?
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            <div className="auth-security-note">
              <ShieldCheck size={16} />

              <span>
                Your account and application data are protected.
              </span>
            </div>
          </div>
        </aside>
      )}

      <footer className="landing-footer">
        <span>© 2026 DriverHub</span>
        <span>
          Built for drivers. Designed for opportunity.
        </span>
        <span>Secure career platform</span>
      </footer>
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
          onClick={() =>
            setMobileMenu(false)
          }
        />
      )}

      <aside
        className={`sidebar ${
          mobileMenu
            ? "sidebar-open"
            : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <BriefcaseBusiness size={23} />
          </div>

          <span>
            Driver
            <span className="brand-accent">
              Hub
            </span>
          </span>

          <button
            className="sidebar-close"
            onClick={() =>
              setMobileMenu(false)
            }
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
                <span>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-box">
            <ShieldCheck size={20} />

            <div>
              <strong>
                Secure Platform
              </strong>

              <span>
                Your account is protected
              </span>
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

function DriverDashboard({
  page,
  setPage,
}) {
  const [jobs, setJobs] =
    useState([]);

  const [applications, setApplications] =
    useState([]);

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData =
    async () => {
      try {
        setLoading(true);
        setError("");

        const results =
          await Promise.allSettled([
            searchJobs(),
            getMyApplications(),
            getNotifications(),
          ]);

        const jobsResult =
          results[0];

        const applicationsResult =
          results[1];

        const notificationsResult =
          results[2];

        if (
          jobsResult.status ===
          "fulfilled"
        ) {
          setJobs(
            jobsResult.value.jobs ||
              []
          );
        }

        if (
          applicationsResult.status ===
          "fulfilled"
        ) {
          setApplications(
            applicationsResult.value
              .applications || []
          );
        }

        if (
          notificationsResult.status ===
          "fulfilled"
        ) {
          setNotifications(
            notificationsResult.value
              .notifications || []
          );
        }

        const failed =
          results.find(
            (result) =>
              result.status ===
              "rejected"
          );

        if (failed) {
          console.error(
            failed.reason
          );
        }
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

        <p>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>
          Unable to load dashboard
        </h2>

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

  const shortlisted =
    applications.filter(
      (application) =>
        application.status ===
        "SHORTLISTED"
    ).length;

  const appliedCount =
    applications.length;

  const profileCompletion =
    80;

  return (
    <>
      <div className="dashboard-hero driver-dashboard-hero">
        <div>
          <div className="dashboard-eyebrow">
            <span></span>
            DRIVER CAREER CENTER
          </div>

          <h1>
            Your next opportunity
            <span> starts here.</span>
          </h1>

          <p>
            Discover suitable driving jobs,
            manage applications, and keep
            your professional profile ready.
          </p>

          <div className="dashboard-quick-actions">
            <button
              className="primary-btn"
              onClick={() =>
                setPage("jobs")
              }
            >
              <Search size={18} />
              Explore Jobs
            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                setPage("profile")
              }
            >
              <User size={18} />
              Complete Profile
            </button>
          </div>
        </div>

        <div className="profile-strength-card">
          <div className="strength-header">
            <div>
              <span>
                PROFILE STRENGTH
              </span>

              <strong>
                {profileCompletion}%
              </strong>
            </div>

            <div className="strength-icon">
              <Award size={23} />
            </div>
          </div>

          <div className="strength-track">
            <span
              style={{
                width:
                  `${profileCompletion}%`,
              }}
            ></span>
          </div>

          <p>
            Complete your profile to
            improve employer visibility.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Available Jobs"
          value={jobs.length}
          icon={
            <BriefcaseBusiness />
          }
          description="Active opportunities"
        />

        <StatCard
          title="Applications"
          value={appliedCount}
          icon={<FileText />}
          description="Jobs you've applied for"
        />

        <StatCard
          title="Shortlisted"
          value={shortlisted}
          icon={
            <CheckCircle2 />
          }
          description="Applications shortlisted"
        />

        <StatCard
          title="Profile Completion"
          value={`${profileCompletion}%`}
          icon={<User />}
          description="Profile strength"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Recommended Opportunities
              </h3>

              <p>
                Latest driving jobs available
                for you
              </p>
            </div>

            <button
              onClick={() =>
                setPage("jobs")
              }
            >
              View all
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <BriefcaseBusiness
                size={35}
              />

              <h4>
                No jobs available
              </h4>

              <p>
                There are currently no
                active jobs available.
              </p>
            </div>
          ) : (
            jobs
              .slice(0, 5)
              .map((job) => (
                <JobCard
                  key={job.id}
                  title={job.title}
                  company={
                    job.company_name ||
                    `Employer #${job.employer_id}`
                  }
                  location={
                    job.location
                  }
                  salary={formatSalary(
                    job.salary
                  )}
                  category={
                    job.driver_category
                  }
                />
              ))
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Recent Applications
              </h3>

              <p>
                Your latest application activity
              </p>
            </div>

            <button
              onClick={() =>
                setPage(
                  "applications"
                )
              }
            >
              View all
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              <FileText size={35} />

              <h4>
                No applications yet
              </h4>

              <p>
                Apply for a job to see
                it here.
              </p>
            </div>
          ) : (
            applications
              .slice(0, 5)
              .map(
                (application) => (
                  <ApplicationRow
                    key={
                      application.id
                    }
                    title={
                      application.job
                        ?.title ||
                      `Job #${application.job_id}`
                    }
                    company={
                      application.job
                        ?.location ||
                      "Employer"
                    }
                    status={
                      application.status
                    }
                  />
                )
              )
          )}
        </div>
      </div>

      <div className="dashboard-grid driver-bottom-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Career Checklist
              </h3>

              <p>
                Keep your profile ready
                for employers
              </p>
            </div>
          </div>

          <div className="career-checklist">
            <ChecklistItem
              title="Complete your profile"
              description="Add your experience, skills and driving details."
              complete={
                profileCompletion >= 80
              }
              onClick={() =>
                setPage("profile")
              }
            />

            <ChecklistItem
              title="Upload documents"
              description="Keep your driving and experience documents ready."
              complete={false}
              onClick={() =>
                setPage("documents")
              }
            />

            <ChecklistItem
              title="Explore new jobs"
              description="Check current opportunities matching your skills."
              complete={
                jobs.length > 0
              }
              onClick={() =>
                setPage("jobs")
              }
            />
          </div>
        </div>

        <div className="panel driver-status-panel">
          <div className="panel-header">
            <div>
              <h3>
                Application Status
              </h3>

              <p>
                Keep track of your
                hiring progress
              </p>
            </div>
          </div>

          <div className="status-summary">
            <div>
              <strong>
                {appliedCount}
              </strong>

              <span>
                Applied
              </span>
            </div>

            <div>
              <strong>
                {shortlisted}
              </strong>

              <span>
                Shortlisted
              </span>
            </div>

            <div>
              <strong>
                {
                  applications.filter(
                    (a) =>
                      a.status ===
                      "SELECTED"
                  ).length
                }
              </strong>

              <span>
                Selected
              </span>
            </div>
          </div>

          <button
            className="panel-action-btn"
            onClick={() =>
              setPage(
                "applications"
              )
            }
          >
            View application progress
            <span>→</span>
          </button>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   SMALL DRIVER COMPONENTS
========================================================= */

function ChecklistItem({
  title,
  description,
  complete,
  onClick,
}) {
  return (
    <button
      className={`checklist-item ${
        complete
          ? "checklist-complete"
          : ""
      }`}
      onClick={onClick}
    >
      <div className="checklist-icon">
        {complete ? (
          <CheckCircle2 size={20} />
        ) : (
          <Award size={20} />
        )}
      </div>

      <div>
        <strong>{title}</strong>

        <span>{description}</span>
      </div>

      <span className="checklist-arrow">
        →
      </span>
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  description,
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">
          {icon}
        </div>

        <span className="stat-label">
          {title}
        </span>
      </div>

      <strong className="stat-value">
        {value}
      </strong>

      <span className="stat-description">
        {description}
      </span>
    </div>
  );
}

/* =========================================================
   JOB CARD
========================================================= */

function JobCard({
  title,
  company,
  location,
  salary,
  category,
}) {
  return (
    <div className="job-card">
      <div className="job-card-icon">
        <BriefcaseBusiness size={21} />
      </div>

      <div className="job-card-main">
        <h4>{title}</h4>

        <p>{company}</p>

        <div className="job-card-meta">
          {location && (
            <span>
              <MapPin size={14} />
              {location}
            </span>
          )}

          {salary && (
            <span>
              {salary}
            </span>
          )}

          {category && (
            <span>
              {category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   APPLICATION ROW
========================================================= */

function ApplicationRow({
  title,
  company,
  status,
}) {
  const statusClass =
    String(status || "APPLIED")
      .toLowerCase();

  return (
    <div className="application-row">
      <div className="application-row-icon">
        <FileText size={18} />
      </div>

      <div className="application-row-main">
        <strong>{title}</strong>
        <span>{company}</span>
      </div>

      <span
        className={`status-badge status-${statusClass}`}
      >
        {status || "APPLIED"}
      </span>
    </div>
  );
}

/* =========================================================
   END OF PART 1
========================================================= */
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

  const [selectedJob, setSelectedJob] = useState(null);

  const [coverMessage, setCoverMessage] = useState("");

  const [applying, setApplying] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [applyError, setApplyError] = useState("");

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
    <div className="jobs-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            CAREER OPPORTUNITIES
          </div>

          <h1>Find your next driving job</h1>

          <p>
            Search verified opportunities based on
            your skills, category and location.
          </p>
        </div>
      </div>

      <form
        className="search-panel"
        onSubmit={handleSearch}
      >
        <div className="form-group">
          <label>Job Title</label>

          <div className="input-with-icon">
            <Search size={17} />

            <input
              placeholder="Search job title..."
              value={keyword}
              onChange={(e) =>
                setKeyword(e.target.value)
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>

          <div className="input-with-icon">
            <MapPin size={17} />

            <input
              placeholder="Bangalore, Hyderabad..."
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            />
          </div>
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

        <button
          className="primary-btn"
          type="submit"
        >
          <Search size={18} />
          Search Jobs
        </button>
      </form>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>

          <p>
            Finding the latest opportunities...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="error-page">
          <h2>
            Unable to load jobs
          </h2>

          <p>{error}</p>

          <button
            className="primary-btn"
            onClick={() => loadJobs()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        jobs.length === 0 && (
          <div className="empty-state">
            <BriefcaseBusiness size={38} />

            <h4>
              No opportunities found
            </h4>

            <p>
              Try changing your search
              filters or check again later.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        jobs.length > 0 && (
          <div className="professional-job-list">
            {jobs.map((job) => (
              <div
                className="professional-job-card"
                key={job.id}
              >
                <div className="professional-job-main">
                  <div className="professional-job-icon">
                    <BriefcaseBusiness
                      size={22}
                    />
                  </div>

                  <div>
                    <div className="job-card-heading">
                      <h3>{job.title}</h3>

                      <span className="job-status-pill">
                        OPEN
                      </span>
                    </div>

                    <p className="job-company">
                      {job.company_name ||
                        `Employer #${job.employer_id}`}
                    </p>

                    <div className="job-info-row">
                      <span>
                        <MapPin size={14} />
                        {job.location ||
                          "Location not specified"}
                      </span>

                      <span>
                        {formatSalary(
                          job.salary
                        )}
                      </span>

                      <span>
                        {job.driver_category ||
                          "Driver"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="professional-job-action">
                  <button
                    className="secondary-btn"
                    onClick={() =>
                      handleViewJob(job.id)
                    }
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {selectedJob && (
        <div className="modal-overlay">
          <div className="job-details-modal professional-modal">
            <button
              className="modal-close"
              onClick={() => {
                setSelectedJob(null);
                setApplyError("");
                setSuccessMessage("");
              }}
              aria-label="Close"
            >
              <X size={19} />
            </button>

            <div className="modal-heading">
              <div className="modal-job-icon">
                <BriefcaseBusiness
                  size={23}
                />
              </div>

              <div>
                <span className="section-kicker">
                  JOB OPPORTUNITY
                </span>

                <h2>
                  {selectedJob.title}
                </h2>

                <p>
                  {selectedJob.company_name ||
                    `Employer #${selectedJob.employer_id}`}
                </p>
              </div>
            </div>

            <div className="job-detail-grid">
              <div className="job-detail-box">
                <span>Location</span>
                <strong>
                  {selectedJob.location ||
                    "Not specified"}
                </strong>
              </div>

              <div className="job-detail-box">
                <span>Category</span>
                <strong>
                  {selectedJob.driver_category ||
                    "Driver"}
                </strong>
              </div>

              <div className="job-detail-box">
                <span>Experience</span>
                <strong>
                  {selectedJob.required_experience ||
                    0}{" "}
                  years
                </strong>
              </div>

              <div className="job-detail-box">
                <span>Salary</span>
                <strong>
                  {formatSalary(
                    selectedJob.salary
                  )}
                </strong>
              </div>

              <div className="job-detail-box">
                <span>Working Hours</span>
                <strong>
                  {selectedJob.working_hours ||
                    "Not specified"}
                </strong>
              </div>

              <div className="job-detail-box">
                <span>Required Documents</span>
                <strong>
                  {selectedJob.required_documents ||
                    "Not specified"}
                </strong>
              </div>
            </div>

            <div className="job-description">
              <h3>
                Job Description
              </h3>

              <p>
                {selectedJob.description ||
                  "No description provided."}
              </p>
            </div>

            <div className="application-section">
              <div>
                <h3>
                  Apply for this opportunity
                </h3>

                <p>
                  Add a short message to introduce
                  yourself to the employer.
                </p>
              </div>

              <textarea
                placeholder="Write a short professional message..."
                value={coverMessage}
                onChange={(e) =>
                  setCoverMessage(
                    e.target.value
                  )
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
                  : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   APPLICATIONS PAGE
========================================================= */

function ApplicationsPage() {
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCount =
    applications.filter(
      (item) =>
        item.status === "SELECTED"
    ).length;

  const shortlistedCount =
    applications.filter(
      (item) =>
        item.status === "SHORTLISTED"
    ).length;

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            APPLICATION TRACKER
          </div>

          <h1>My Applications</h1>

          <p>
            Track every opportunity from
            application to selection.
          </p>
        </div>
      </div>

      <div className="application-summary-strip">
        <div>
          <strong>
            {applications.length}
          </strong>

          <span>
            Total applications
          </span>
        </div>

        <div>
          <strong>
            {shortlistedCount}
          </strong>

          <span>
            Shortlisted
          </span>
        </div>

        <div>
          <strong>
            {selectedCount}
          </strong>

          <span>
            Selected
          </span>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>

          <p>
            Loading applications...
          </p>
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

      {!loading &&
        !error &&
        applications.length === 0 && (
          <div className="empty-state">
            <FileText size={38} />

            <h4>
              No applications yet
            </h4>

            <p>
              Explore available jobs and
              submit your first application.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        applications.length > 0 && (
          <div className="panel applications-panel">
            {applications.map(
              (application) => (
                <ApplicationRow
                  key={application.id}
                  title={
                    application.job?.title ||
                    `Job #${application.job_id}`
                  }
                  company={
                    application.job?.company_name ||
                    application.job?.location ||
                    "Employer"
                  }
                  status={
                    application.status
                  }
                />
              )
            )}
          </div>
        )}
    </div>
  );
}

/* =========================================================
   DRIVER PROFILE
========================================================= */

function ProfilePage() {
  const [profile, setProfile] =
    useState({
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

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getDriverProfile();

      if (data.profile) {
        setProfile({
          phone:
            data.profile.phone || "",
          date_of_birth:
            data.profile.date_of_birth ||
            "",
          address:
            data.profile.address || "",
          city:
            data.profile.city || "",
          driving_experience:
            data.profile
              .driving_experience ??
            "",
          license_number:
            data.profile
              .license_number || "",
          license_category:
            data.profile
              .license_category ||
            "",
          skills:
            data.profile.skills || "",
          bio:
            data.profile.bio || "",
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
    const {
      name,
      value,
    } = e.target;

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
        date_of_birth:
          profile.date_of_birth,
        address: profile.address,
        city: profile.city,

        driving_experience:
          profile.driving_experience ===
          ""
            ? null
            : Number(
                profile.driving_experience
              ),

        license_number:
          profile.license_number,

        license_category:
          profile.license_category,

        skills: profile.skills,

        bio: profile.bio,
      };

      const data =
        await saveDriverProfile(
          payload
        );

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

        <p>
          Loading your profile...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            PROFESSIONAL PROFILE
          </div>

          <h1>My Profile</h1>

          <p>
            Keep your driver profile complete
            and ready for new opportunities.
          </p>
        </div>
      </div>

      <div className="profile-progress-banner">
        <div className="profile-progress-copy">
          <div className="profile-progress-icon">
            <Award size={22} />
          </div>

          <div>
            <strong>
              Your profile is your first impression
            </strong>

            <p>
              Complete your experience, skills,
              license and contact details.
            </p>
          </div>
        </div>

        <div className="profile-progress-value">
          <strong>80%</strong>

          <span>Profile strength</span>
        </div>
      </div>

      <div className="panel form-panel">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={28} />
          </div>

          <div>
            <h3>
              Driver Information
            </h3>

            <p>
              These details help employers
              understand your professional
              experience.
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
              <label>
                Phone Number
              </label>

              <div className="input-with-icon">
                <Phone size={18} />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={
                    profile.phone
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Date of Birth
              </label>

              <input
                type="date"
                name="date_of_birth"
                value={
                  profile.date_of_birth
                }
                onChange={
                  handleChange
                }
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
                  value={
                    profile.city
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Driving Experience
              </label>

              <input
                type="number"
                min="0"
                name="driving_experience"
                placeholder="Years of experience"
                value={
                  profile.driving_experience
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="form-group">
              <label>
                License Category
              </label>

              <select
                name="license_category"
                value={
                  profile.license_category
                }
                onChange={
                  handleChange
                }
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
                License Number
              </label>

              <div className="input-with-icon">
                <Award size={18} />

                <input
                  type="text"
                  name="license_number"
                  placeholder="Enter license number"
                  value={
                    profile.license_number
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>
                Address
              </label>

              <textarea
                name="address"
                rows="3"
                placeholder="Enter your complete address"
                value={
                  profile.address
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="form-group full-width">
              <label>
                Skills
              </label>

              <input
                type="text"
                name="skills"
                placeholder="Safe Driving, Highway Driving, Vehicle Maintenance"
                value={
                  profile.skills
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="form-group full-width">
              <label>
                Professional Bio
              </label>

              <textarea
                name="bio"
                rows="5"
                placeholder="Write a short professional description..."
                value={
                  profile.bio
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Profile"}
            </button>
          </div>
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

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications =
    async () => {
      try {
        setLoading(true);

        const data =
          await getNotifications();

        setNotifications(
          data.notifications || []
        );
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            UPDATES
          </div>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated with your
            applications and opportunities.
          </p>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>

          <p>
            Loading notifications...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="error-page">
          <h2>
            Unable to load notifications
          </h2>

          <p>{error}</p>

          <button
            className="primary-btn"
            onClick={
              loadNotifications
            }
          >
            Try Again
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        notifications.length === 0 && (
          <div className="empty-state">
            <Bell size={38} />

            <h4>
              You're all caught up
            </h4>

            <p>
              New application updates
              will appear here.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        notifications.length > 0 && (
          <div className="panel notification-panel">
            {notifications.map(
              (notification) => (
                <div
                  className={`notification-item ${
                    notification.is_read
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                  key={
                    notification.id
                  }
                >
                  <div className="notification-icon">
                    <Bell size={18} />
                  </div>

                  <div>
                    <strong>
                      {
                        notification.message
                      }
                    </strong>

                    <p>
                      {notification.created_at
                        ? new Date(
                            notification.created_at
                          ).toLocaleString()
                        : "Recently"}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
    </div>
  );
}

/* =========================================================
   DOCUMENTS
========================================================= */

function DocumentsPage() {
  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadDocuments =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMyDocuments();

        setDocuments(
          data.documents || []
        );
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      await uploadDocument(file);

      setSuccess(
        "Document uploaded successfully."
      );

      await loadDocuments();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDownload =
    async (documentId, fileName) => {
      try {
        const blob =
          await downloadDocument(
            documentId
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement("a");

        link.href = url;
        link.download =
          fileName || "document";

        document.body.appendChild(
          link
        );

        link.click();
        link.remove();

        window.URL.revokeObjectURL(
          url
        );
      } catch (err) {
        setError(err.message);
      }
    };

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            PROFESSIONAL DOCUMENTS
          </div>

          <h1>
            My Documents
          </h1>

          <p>
            Keep your driving and
            experience documents ready.
          </p>
        </div>
      </div>

      <div className="upload-document-card">
        <div className="upload-document-icon">
          <FileText size={25} />
        </div>

        <div>
          <h3>
            Upload a document
          </h3>

          <p>
            Add your driving license,
            experience certificate or
            other relevant document.
          </p>
        </div>

        <label className="upload-btn">
          {uploading
            ? "Uploading..."
            : "Choose File"}

          <input
            type="file"
            onChange={
              handleUpload
            }
            disabled={uploading}
            hidden
          />
        </label>
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

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>
              Uploaded Documents
            </h3>

            <p>
              Documents available in
              your DriverHub profile.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>

            <p>
              Loading documents...
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <FileText size={38} />

            <h4>
              No documents uploaded
            </h4>

            <p>
              Upload your first
              professional document above.
            </p>
          </div>
        ) : (
          documents.map(
            (document) => (
              <div
                className="document-row"
                key={
                  document.id
                }
              >
                <div className="document-icon">
                  <FileText size={19} />
                </div>

                <div className="document-info">
                  <strong>
                    {document.file_name ||
                      document.filename ||
                      "Document"}
                  </strong>

                  <span>
                    {document.document_type ||
                      "Professional document"}
                  </span>
                </div>

                <button
                  className="secondary-btn"
                  onClick={() =>
                    handleDownload(
                      document.id,
                      document.file_name ||
                        document.filename
                    )
                  }
                >
                  Download
                </button>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   END OF PART 2
========================================================= */
/* =========================================================
   EMPLOYER DASHBOARD
========================================================= */

function EmployerDashboard({ page, setPage }) {
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
      <div className="employer-hero">
        <div className="employer-hero-content">
          <div className="dashboard-eyebrow">
            <span></span>
            HIRING COMMAND CENTER
          </div>

          <h1>
            Build your team
            <span> with confidence.</span>
          </h1>

          <p>
            Manage your vacancies, discover qualified
            drivers and move the right candidates
            through your hiring process.
          </p>

          <div className="dashboard-quick-actions">
            <button
              className="primary-btn"
              onClick={() => setPage("jobs")}
            >
              <BriefcaseBusiness size={18} />
              Manage Jobs
            </button>

            <button
              className="secondary-btn"
              onClick={() => setPage("candidates")}
            >
              <Users size={18} />
              Find Drivers
            </button>
          </div>
        </div>

        <div className="employer-hero-card">
          <div className="hero-card-header">
            <div>
              <span>HIRING OVERVIEW</span>
              <strong>DriverHub</strong>
            </div>

            <div className="live-indicator">
              <span></span>
              LIVE
            </div>
          </div>

          <div className="hero-hiring-metric">
            <strong>12</strong>
            <span>candidates ready for review</span>
          </div>

          <div className="hero-progress">
            <div>
              <span>Hiring activity</span>
              <strong>78%</strong>
            </div>

            <div className="hero-progress-track">
              <span></span>
            </div>
          </div>

          <div className="hero-mini-row">
            <div>
              <CheckCircle2 size={16} />
              Verified profiles
            </div>

            <div>
              <Users size={16} />
              Active candidates
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid employer-stats-grid">
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
          title="Available Drivers"
          value="156"
          icon={<Users />}
          description="Profiles available"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                YOUR VACANCIES
              </span>

              <h3>Recent Job Posts</h3>

              <p>
                Keep track of your latest driver
                opportunities.
              </p>
            </div>

            <button
              className="panel-link"
              onClick={() => setPage("jobs")}
            >
              View all →
            </button>
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
              <span className="section-kicker">
                CANDIDATE ACTIVITY
              </span>

              <h3>Recent Applications</h3>

              <p>
                Review the latest candidate activity.
              </p>
            </div>

            <button
              className="panel-link"
              onClick={() => setPage("applications")}
            >
              View all →
            </button>
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

      <div className="employer-bottom-grid">
        <div className="panel employer-workflow-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                HIRING WORKFLOW
              </span>

              <h3>Simple hiring process</h3>

              <p>
                Move candidates from application
                to selection with confidence.
              </p>
            </div>
          </div>

          <div className="hiring-workflow">
            <div>
              <span>01</span>
              <strong>Post a job</strong>
              <p>Create a clear driver vacancy.</p>
            </div>

            <div>
              <span>02</span>
              <strong>Review candidates</strong>
              <p>Find suitable driver profiles.</p>
            </div>

            <div>
              <span>03</span>
              <strong>Shortlist</strong>
              <p>Move strong candidates forward.</p>
            </div>

            <div>
              <span>04</span>
              <strong>Select</strong>
              <p>Choose the right candidate.</p>
            </div>
          </div>
        </div>

        <div className="panel employer-action-panel">
          <div className="employer-action-icon">
            <Users size={22} />
          </div>

          <span className="section-kicker">
            TALENT SEARCH
          </span>

          <h3>Looking for a specific driver?</h3>

          <p>
            Search DriverHub profiles by location,
            category and experience.
          </p>

          <button
            className="secondary-btn full-action-btn"
            onClick={() => setPage("candidates")}
          >
            Find Drivers
            <span>→</span>
          </button>
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
          <span className="section-kicker">
            EMPLOYER WORKSPACE
          </span>

          <h1>Manage Jobs</h1>

          <p>
            Create, update and manage your
            driver vacancies.
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
        <div className="panel form-panel job-form-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                {editingJob
                  ? "EDIT VACANCY"
                  : "NEW VACANCY"}
              </span>

              <h3>
                {editingJob
                  ? "Update Job"
                  : "Create a Job"}
              </h3>

              <p>
                Give drivers clear information
                about the opportunity.
              </p>
            </div>

            <button
              className="modal-close-small"
              type="button"
              onClick={handleCancel}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group">
                <label>Job Title</label>

                <input
                  type="text"
                  name="title"
                  placeholder="Heavy Vehicle Driver"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Driver Category</label>

                <select
                  name="driver_category"
                  value={
                    form.driver_category
                  }
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
                  Required Experience
                </label>

                <input
                  type="number"
                  min="0"
                  name="required_experience"
                  placeholder="2 years"
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
                  placeholder="Bangalore"
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
                  placeholder="₹25,000 - ₹30,000"
                  value={form.salary}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Working Hours</label>

                <input
                  type="text"
                  name="working_hours"
                  placeholder="8 hours/day"
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
                  placeholder="Driving License, Aadhaar, Experience Certificate"
                  value={
                    form.required_documents
                  }
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label>
                  Job Description
                </label>

                <textarea
                  name="description"
                  rows="5"
                  placeholder="Describe responsibilities, requirements and expectations..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingJob
                  ? "Update Job"
                  : "Publish Job"}
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

      <div className="job-management-summary">
        <div>
          <strong>{jobs.length}</strong>
          <span>Total postings</span>
        </div>

        <div>
          <strong>
            {
              jobs.filter(
                (job) =>
                  job.status !== "CLOSED"
              ).length
            }
          </strong>

          <span>Active opportunities</span>
        </div>

        <div>
          <strong>
            {jobs.filter(
              (job) =>
                job.status === "CLOSED"
            ).length}
          </strong>

          <span>Closed postings</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="section-kicker">
              YOUR VACANCIES
            </span>

            <h3>Job Postings</h3>

            <p>
              Manage the opportunities currently
              published by your company.
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
            <BriefcaseBusiness size={38} />

            <h4>
              No jobs posted yet
            </h4>

            <p>
              Create your first vacancy to
              start receiving applications.
            </p>

            <button
              className="primary-btn"
              onClick={handleOpenCreate}
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="employer-job-list">
            {jobs.map((job) => (
              <div
                className="employer-job-card"
                key={job.id}
              >
                <div className="employer-job-header">
                  <div className="employer-job-title">
                    <div className="employer-job-icon">
                      <BriefcaseBusiness
                        size={21}
                      />
                    </div>

                    <div>
                      <h3>
                        {job.title}
                      </h3>

                      <p>
                        {job.driver_category ||
                          "Driver"}{" "}
                        ·{" "}
                        {job.location ||
                          "Location not specified"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`job-status-badge ${
                      job.status ===
                      "CLOSED"
                        ? "closed"
                        : "active"
                    }`}
                  >
                    {job.status ||
                      "ACTIVE"}
                  </span>
                </div>

                <div className="employer-job-metrics">
                  <div>
                    <span>
                      Experience
                    </span>

                    <strong>
                      {job.required_experience ??
                        0}{" "}
                      years
                    </strong>
                  </div>

                  <div>
                    <span>
                      Salary
                    </span>

                    <strong>
                      {formatSalary(
                        job.salary
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Working Hours
                    </span>

                    <strong>
                      {job.working_hours ||
                        "Not specified"}
                    </strong>
                  </div>
                </div>

                {job.description && (
                  <div className="employer-job-description">
                    <span>
                      DESCRIPTION
                    </span>

                    <p>
                      {job.description}
                    </p>
                  </div>
                )}

                {job.required_documents && (
                  <div className="employer-job-documents">
                    <span>
                      REQUIRED DOCUMENTS
                    </span>

                    <p>
                      {job.required_documents}
                    </p>
                  </div>
                )}

                <div className="employer-job-actions">
                  <button
                    className="job-edit-btn"
                    onClick={() =>
                      handleEdit(job)
                    }
                  >
                    Edit Job
                  </button>

                  <button
                    className="job-delete-btn"
                    onClick={() =>
                      handleDelete(
                        job.id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
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
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getEmployerApplications();

        setApplications(
          data.applications || []
        );
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  const handleStatusChange =
    async (
      applicationId,
      status
    ) => {
      try {
        setUpdatingId(
          applicationId
        );

        setError("");
        setSuccess("");

        const data =
          await updateApplicationStatus(
            applicationId,
            status
          );

        setSuccess(
          data.message ||
            "Application status updated successfully!"
        );

        await loadApplications();
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setUpdatingId(null);
      }
    };

  const countStatus = (status) =>
    applications.filter(
      (item) =>
        item.status === status
    ).length;

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            HIRING PIPELINE
          </span>

          <h1>
            Applications
          </h1>

          <p>
            Review candidates and move the
            right people forward.
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

      <div className="application-summary-strip employer-application-summary">
        <div>
          <strong>
            {applications.length}
          </strong>

          <span>
            Total applications
          </span>
        </div>

        <div className="summary-blue">
          <strong>
            {countStatus(
              "SHORTLISTED"
            )}
          </strong>

          <span>
            Shortlisted
          </span>
        </div>

        <div className="summary-green">
          <strong>
            {countStatus(
              "SELECTED"
            )}
          </strong>

          <span>
            Selected
          </span>
        </div>

        <div className="summary-red">
          <strong>
            {countStatus(
              "REJECTED"
            )}
          </strong>

          <span>
            Rejected
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>

          <p>
            Loading applications...
          </p>
        </div>
      ) : applications.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <Users size={38} />

            <h4>
              No applications yet
            </h4>

            <p>
              Applications from drivers
              will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="application-management-list">
          {applications.map(
            (application) => {
              const driver =
                application.driver ||
                application.user ||
                {};

              const job =
                application.job ||
                {};

              const currentStatus =
                application.status ||
                "APPLIED";

              return (
                <div
                  className="employer-application-card"
                  key={
                    application.id
                  }
                >
                  <div className="application-card-main">
                    <div className="candidate-avatar-large">
                      {(driver.name ||
                        "D")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="application-candidate-info">
                      <div className="candidate-name-row">
                        <h3>
                          {driver.name ||
                            `Driver #${application.driver_id}`}
                        </h3>

                        <span
                          className={`application-status ${String(
                            currentStatus
                          ).toLowerCase()}`}
                        >
                          {currentStatus}
                        </span>
                      </div>

                      <p className="candidate-job">
                        Applied for{" "}
                        <strong>
                          {job.title ||
                            `Job #${application.job_id}`}
                        </strong>
                      </p>

                      {driver.email && (
                        <p>
                          {driver.email}
                        </p>
                      )}

                      {application.cover_message && (
                        <div className="candidate-message">
                          <span>
                            APPLICATION MESSAGE
                          </span>

                          <p>
                            {
                              application.cover_message
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="application-actions">
                    <button
                      className="action-btn shortlist-action"
                      disabled={
                        updatingId ===
                        application.id
                      }
                      onClick={() =>
                        handleStatusChange(
                          application.id,
                          "SHORTLISTED"
                        )
                      }
                    >
                      <CheckCircle2
                        size={16}
                      />

                      {updatingId ===
                      application.id
                        ? "Updating..."
                        : "Shortlist"}
                    </button>

                    <button
                      className="action-btn reject-action"
                      disabled={
                        updatingId ===
                        application.id
                      }
                      onClick={() =>
                        handleStatusChange(
                          application.id,
                          "REJECTED"
                        )
                      }
                    >
                      <X size={16} />

                      Reject
                    </button>

                    <button
                      className="action-btn select-action"
                      disabled={
                        updatingId ===
                        application.id
                      }
                      onClick={() =>
                        handleStatusChange(
                          application.id,
                          "SELECTED"
                        )
                      }
                    >
                      <Award
                        size={16}
                      />

                      Select
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   FIND DRIVERS
========================================================= */

function CandidatesPage() {
  const [drivers, setDrivers] =
    useState([]);

  const [city, setCity] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedDriver, setSelectedDriver] =
    useState(null);

  const [profileLoading, setProfileLoading] =
    useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers =
    async (filters = {}) => {
      try {
        setLoading(true);
        setError("");

        const data =
          await searchDrivers(
            filters
          );

        setDrivers(
          data.drivers || []
        );
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to load drivers"
        );
      } finally {
        setLoading(false);
      }
    };

  const handleSearch =
    async (e) => {
      e.preventDefault();

      await loadDrivers({
        city: city.trim(),
        category,
        experience,
      });
    };

  const handleViewProfile =
    async (driver) => {
      const driverId =
        driver?.driver?.id ||
        driver?.user_id ||
        driver?.id;

      if (!driverId) {
        setError(
          "Driver information is incomplete."
        );

        return;
      }

      try {
        setProfileLoading(true);
        setError("");

        const data =
          await getCandidate(
            driverId
          );

        setSelectedDriver(
          data.candidate ||
            data.driver ||
            data.profile ||
            null
        );
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to load driver profile"
        );
      } finally {
        setProfileLoading(false);
      }
    };

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            TALENT DISCOVERY
          </span>

          <h1>
            Find Drivers
          </h1>

          <p>
            Discover qualified drivers based
            on location, experience and category.
          </p>
        </div>
      </div>

      <form
        className="driver-search-panel"
        onSubmit={handleSearch}
      >
        <div className="form-group">
          <label>
            Location
          </label>

          <div className="input-with-icon">
            <MapPin size={17} />

            <input
              placeholder="Search city..."
              value={city}
              onChange={(e) =>
                setCity(
                  e.target.value
                )
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            Driver Category
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          >
            <option value="">
              All Categories
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
            Minimum Experience
          </label>

          <input
            placeholder="Years"
            type="number"
            min="0"
            value={experience}
            onChange={(e) =>
              setExperience(
                e.target.value
              )
            }
          />
        </div>

        <button
          type="submit"
          className="primary-btn"
          disabled={loading}
        >
          <Search size={18} />

          {loading
            ? "Searching..."
            : "Search Drivers"}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>

          <p>
            Finding suitable drivers...
          </p>
        </div>
      ) : drivers.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <Users size={38} />

            <h4>
              No drivers found
            </h4>

            <p>
              Try changing your search
              filters.
            </p>
          </div>
        </div>
      ) : (
        <div className="candidate-grid">
          {drivers.map(
            (driver) => {
              const driverUser =
                driver.driver ||
                {};

              const displayName =
                driverUser.name ||
                driver.name ||
                `Driver #${
                  driverUser.id ||
                  driver.id
                }`;

              const displayId =
                driverUser.id ||
                driver.user_id ||
                driver.id;

              return (
                <div
                  className="professional-candidate-card"
                  key={displayId}
                >
                  <div className="candidate-card-top">
                    <div className="candidate-avatar">
                      {displayName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <span className="verified-chip">
                      <CheckCircle2
                        size={13}
                      />
                      Profile
                    </span>
                  </div>

                  <h3>
                    {displayName}
                  </h3>

                  <p className="candidate-location">
                    <MapPin size={14} />
                    {driver.city ||
                      "Location not specified"}
                  </p>

                  <div className="candidate-info-grid">
                    <div>
                      <span>
                        Experience
                      </span>

                      <strong>
                        {driver.driving_experience ??
                          0}{" "}
                        yrs
                      </strong>
                    </div>

                    <div>
                      <span>
                        Category
                      </span>

                      <strong>
                        {driver.license_category ||
                          "Not specified"}
                      </strong>
                    </div>
                  </div>

                  {driver.skills && (
                    <div className="candidate-skills">
                      {driver.skills}
                    </div>
                  )}

                  {driverUser.email && (
                    <p className="candidate-email">
                      {driverUser.email}
                    </p>
                  )}

                  <button
                    type="button"
                    className="outline-btn full-width-btn"
                    onClick={() =>
                      handleViewProfile(
                        driver
                      )
                    }
                  >
                    View Driver Profile
                    <span>→</span>
                  </button>
                </div>
              );
            }
          )}
        </div>
      )}

      {selectedDriver && (
        <div className="modal-overlay">
          <div className="modal-card professional-candidate-modal">
            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setSelectedDriver(
                  null
                )
              }
            >
              <X size={19} />
            </button>

            {profileLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>

                <p>
                  Loading driver profile...
                </p>
              </div>
            ) : (
              <>
                <div className="candidate-modal-heading">
                  <div className="candidate-avatar-large">
                    {(
                      selectedDriver.name ||
                      "D"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <span className="section-kicker">
                      DRIVER PROFILE
                    </span>

                    <h2>
                      {selectedDriver.name ||
                        "Driver Profile"}
                    </h2>

                    <p>
                      {selectedDriver.city ||
                        "Location not specified"}
                    </p>
                  </div>
                </div>

                <div className="job-detail-grid">
                  <div className="job-detail-box">
                    <span>
                      City
                    </span>

                    <strong>
                      {selectedDriver.city ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div className="job-detail-box">
                    <span>
                      Phone
                    </span>

                    <strong>
                      {selectedDriver.phone ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div className="job-detail-box">
                    <span>
                      Email
                    </span>

                    <strong>
                      {selectedDriver.email ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div className="job-detail-box">
                    <span>
                      Experience
                    </span>

                    <strong>
                      {selectedDriver.driving_experience ??
                        0}{" "}
                      years
                    </strong>
                  </div>

                  <div className="job-detail-box">
                    <span>
                      License Category
                    </span>

                    <strong>
                      {selectedDriver.license_category ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div className="job-detail-box">
                    <span>
                      License Number
                    </span>

                    <strong>
                      {selectedDriver.license_number ||
                        "Not specified"}
                    </strong>
                  </div>
                </div>

                <div className="job-description">
                  <h3>
                    Skills
                  </h3>

                  <p>
                    {selectedDriver.skills ||
                      "No skills listed."}
                  </p>
                </div>

                <div className="job-description">
                  <h3>
                    Professional Bio
                  </h3>

                  <p>
                    {selectedDriver.bio ||
                      "No bio provided."}
                  </p>
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
  const [profile, setProfile] =
    useState({
      company_name: "",
      company_description: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      website: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getEmployerProfile();

        if (data.profile) {
          setProfile({
            company_name:
              data.profile.company_name ||
              "",

            company_description:
              data.profile.company_description ||
              "",

            phone:
              data.profile.phone ||
              "",

            email:
              data.profile.email ||
              "",

            address:
              data.profile.address ||
              "",

            city:
              data.profile.city ||
              "",

            website:
              data.profile.website ||
              "",
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
    const {
      name,
      value,
    } = e.target;

    setProfile(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const handleSave =
    async (e) => {
      e.preventDefault();

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const data =
          await saveEmployerProfile(
            profile
          );

        setSuccess(
          data.message ||
            "Company profile updated successfully!"
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

        <p>
          Loading company profile...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            COMPANY WORKSPACE
          </span>

          <h1>
            Company Profile
          </h1>

          <p>
            Keep your company information
            professional and up to date.
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

      <div className="company-profile-banner">
        <div className="company-profile-icon">
          <Building2 size={28} />
        </div>

        <div>
          <span>
            COMPANY PROFILE
          </span>

          <h2>
            {profile.company_name ||
              "Your Company"}
          </h2>

          <p>
            A complete company profile
            builds trust with candidates.
          </p>
        </div>
      </div>

      <div className="panel form-panel">
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group">
              <label>
                Company Name
              </label>

              <input
                type="text"
                name="company_name"
                value={
                  profile.company_name
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={
                  profile.phone
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="form-group">
              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  profile.email
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="form-group">
              <label>
                City
              </label>

              <input
                type="text"
                name="city"
                value={
                  profile.city
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="form-group full-width">
              <label>
                Address
              </label>

              <textarea
                name="address"
                rows="3"
                value={
                  profile.address
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="form-group full-width">
              <label>
                Company Website
              </label>

              <input
                type="url"
                name="website"
                placeholder="https://example.com"
                value={
                  profile.website
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="form-group full-width">
              <label>
                Company Description
              </label>

              <textarea
                name="company_description"
                rows="5"
                placeholder="Tell drivers about your company..."
                value={
                  profile.company_description
                }
                onChange={
                  handleChange
                }
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
              : "Save Company Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({
  page,
}) {
  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const loadAdminDashboard =
    async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}/admin/dashboard`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load admin dashboard"
          );
        }

        setStats(
          data.dashboard ||
            data.stats ||
            data
        );
      } catch (err) {
        console.error(err);
        setError(
          err.message
        );
      } finally {
        setLoading(false);
      }
    };

  if (page === "users") {
    return <AdminUsersPage />;
  }

  if (page === "jobs") {
    return <AdminJobsPage />;
  }

  if (page === "applications") {
    return (
      <AdminApplicationsPage />
    );
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>

        <p>
          Loading platform overview...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-command-header">
        <div>
          <div className="dashboard-eyebrow">
            <span></span>
            PLATFORM CONTROL CENTER
          </div>

          <h1>
            Everything under control.
          </h1>

          <p>
            Monitor users, job postings and
            application activity from one place.
          </p>
        </div>

        <div className="admin-security-card">
          <ShieldCheck size={22} />

          <div>
            <strong>
              Platform secure
            </strong>

            <span>
              Administration access active
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="stats-grid admin-stats-grid">
        <StatCard
          title="Total Users"
          value={
            stats?.total_users ??
            stats?.users ??
            0
          }
          icon={<Users />}
          description="Registered accounts"
        />

        <StatCard
          title="Drivers"
          value={
            stats?.total_drivers ??
            stats?.drivers ??
            0
          }
          icon={<User />}
          description="Driver accounts"
        />

        <StatCard
          title="Employers"
          value={
            stats?.total_employers ??
            stats?.employers ??
            0
          }
          icon={<Building2 />}
          description="Employer accounts"
        />

        <StatCard
          title="Job Posts"
          value={
            stats?.total_jobs ??
            stats?.jobs ??
            0
          }
          icon={<BriefcaseBusiness />}
          description="Platform vacancies"
        />
      </div>

      <div className="admin-overview-grid">
        <div className="panel admin-management-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                PLATFORM MANAGEMENT
              </span>

              <h3>
                Administration workspace
              </h3>

              <p>
                Quickly access the areas that
                need your attention.
              </p>
            </div>
          </div>

          <div className="admin-management-grid">
            <AdminActionCard
              icon={<Users />}
              title="Manage Users"
              description="Review driver and employer accounts."
              color="blue"
            />

            <AdminActionCard
              icon={<BriefcaseBusiness />}
              title="Moderate Jobs"
              description="Review active job postings."
              color="purple"
            />

            <AdminActionCard
              icon={<FileText />}
              title="Applications"
              description="Monitor platform applications."
              color="green"
            />

            <AdminActionCard
              icon={<ShieldCheck />}
              title="Platform Security"
              description="Keep the ecosystem trusted."
              color="orange"
            />
          </div>
        </div>

        <div className="panel platform-health-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                SYSTEM STATUS
              </span>

              <h3>
                Platform health
              </h3>
            </div>
          </div>

          <div className="health-item">
            <div>
              <span className="health-dot"></span>

              <strong>
                Authentication
              </strong>
            </div>

            <span className="health-status">
              Operational
            </span>
          </div>

          <div className="health-item">
            <div>
              <span className="health-dot"></span>

              <strong>
                Job Marketplace
              </strong>
            </div>

            <span className="health-status">
              Operational
            </span>
          </div>

          <div className="health-item">
            <div>
              <span className="health-dot"></span>

              <strong>
                Applications
              </strong>
            </div>

            <span className="health-status">
              Operational
            </span>
          </div>

          <div className="health-item">
            <div>
              <span className="health-dot"></span>

              <strong>
                User Management
              </strong>
            </div>

            <span className="health-status">
              Operational
            </span>
          </div>
        </div>
      </div>

      <div className="admin-insight-banner">
        <div className="admin-insight-icon">
          <Award size={22} />
        </div>

        <div>
          <span>
            ADMIN INSIGHT
          </span>

          <strong>
            Keep job quality high and
            user activity trusted.
          </strong>

          <p>
            Review new postings and user
            activity regularly to maintain
            a reliable DriverHub experience.
          </p>
        </div>
      </div>
    </>
  );
}


/* =========================================================
   ADMIN ACTION CARD
========================================================= */

function AdminActionCard({
  icon,
  title,
  description,
  color,
}) {
  return (
    <div
      className={`admin-action-card ${color}`}
    >
      <div className="admin-action-icon">
        {icon}
      </div>

      <h4>
        {title}
      </h4>

      <p>
        {description}
      </p>

      <span>
        Open workspace →
      </span>
    </div>
  );
}


/* =========================================================
   ADMIN USERS
========================================================= */

function AdminUsersPage() {
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers =
    async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}/admin/users`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load users"
          );
        }

        setUsers(
          data.users || []
        );
      } catch (err) {
        console.error(err);
        setError(
          err.message
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            ADMINISTRATION
          </span>

          <h1>
            User Management
          </h1>

          <p>
            Review and manage DriverHub
            accounts.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="panel admin-table-panel">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>

            <p>
              Loading users...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Users size={38} />

            <h4>
              No users found
            </h4>

            <p>
              Registered accounts will
              appear here.
            </p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>
                    User
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map(
                  (userItem) => (
                    <tr
                      key={
                        userItem.id
                      }
                    >
                      <td>
                        <div className="table-user">
                          <div className="table-avatar">
                            {(
                              userItem.name ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>
                            {
                              userItem.name
                            }
                          </strong>
                        </div>
                      </td>

                      <td>
                        {
                          userItem.email
                        }
                      </td>

                      <td>
                        <span className="role-badge">
                          {
                            userItem.role
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status ${
                            String(
                              userItem.status ||
                                "ACTIVE"
                            ).toLowerCase()
                          }`}
                        >
                          {
                            userItem.status ||
                              "ACTIVE"
                          }
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   ADMIN JOBS
========================================================= */

function AdminJobsPage() {
  const [jobs, setJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs =
    async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}/admin/jobs`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load jobs"
          );
        }

        setJobs(
          data.jobs || []
        );
      } catch (err) {
        console.error(err);
        setError(
          err.message
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            MODERATION
          </span>

          <h1>
            Job Postings
          </h1>

          <p>
            Review job postings across
            the DriverHub platform.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="panel admin-table-panel">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>

            <p>
              Loading job postings...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <BriefcaseBusiness
              size={38}
            />

            <h4>
              No job postings
            </h4>

            <p>
              Job postings will appear
              here for moderation.
            </p>
          </div>
        ) : (
          <div className="admin-job-list">
            {jobs.map(
              (job) => (
                <div
                  className="admin-job-item"
                  key={job.id}
                >
                  <div>
                    <span className="section-kicker">
                      JOB POSTING
                    </span>

                    <h3>
                      {job.title}
                    </h3>

                    <p>
                      {job.location ||
                        "Location not specified"}
                    </p>
                  </div>

                  <span
                    className={`job-status-badge ${
                      job.status ===
                      "CLOSED"
                        ? "closed"
                        : "active"
                    }`}
                  >
                    {job.status ||
                      "ACTIVE"}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   ADMIN APPLICATIONS
========================================================= */

function AdminApplicationsPage() {
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications =
    async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}/admin/applications`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load applications"
          );
        }

        setApplications(
          data.applications || []
        );
      } catch (err) {
        console.error(err);
        setError(
          err.message
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            PLATFORM ACTIVITY
          </span>

          <h1>
            Applications
          </h1>

          <p>
            Monitor application activity
            across the platform.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="panel">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>

            <p>
              Loading applications...
            </p>
          </div>
        ) : applications.length ===
          0 ? (
          <div className="empty-state">
            <FileText size={38} />

            <h4>
              No applications found
            </h4>

            <p>
              Platform applications
              will appear here.
            </p>
          </div>
        ) : (
          <div className="application-management-list">
            {applications.map(
              (application) => (
                <div
                  className="employer-application-card"
                  key={
                    application.id
                  }
                >
                  <div className="application-card-main">
                    <div className="candidate-avatar-large">
                      <User size={20} />
                    </div>

                    <div className="application-candidate-info">
                      <div className="candidate-name-row">
                        <h3>
                          {application
                            .driver
                            ?.name ||
                            application
                              .user
                              ?.name ||
                            `Driver #${
                              application.driver_id
                            }`}
                        </h3>

                        <span
                          className={`application-status ${String(
                            application.status ||
                              "APPLIED"
                          ).toLowerCase()}`}
                        >
                          {application.status ||
                            "APPLIED"}
                        </span>
                      </div>

                      <p className="candidate-job">
                        {application
                          .job
                          ?.title ||
                          `Job #${application.job_id}`}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   COMMON COMPONENTS
========================================================= */





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
        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>
      </div>
    </div>
  );
}


/* =========================================================
   END OF PART 3
========================================================= */

export default App;