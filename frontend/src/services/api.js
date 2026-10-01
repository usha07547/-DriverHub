const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
}

/* =========================================================
   AUTH
========================================================= */

export async function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function register(
  name,
  email,
  password,
  role
) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      role,
    }),
  });
}

export async function getCurrentUser() {
  return request("/auth/me");
}

/* =========================================================
   DRIVER PROFILE
========================================================= */

export async function getDriverProfile() {
  return request("/driver/profile");
}

export async function saveDriverProfile(profile) {
  return request("/driver/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export async function searchDrivers(filters = {}) {
  const params = new URLSearchParams();

  if (filters.city) {
    params.append("city", filters.city);
  }

  if (filters.category) {
    params.append("category", filters.category);
  }

  if (
    filters.experience !== undefined &&
    filters.experience !== ""
  ) {
    params.append(
      "experience",
      filters.experience
    );
  }

  const query = params.toString();

  return request(
    `/driver/search${query ? `?${query}` : ""}`
  );
}

export async function getCandidate(driverId) {
  return request(
    `/driver/candidate/${driverId}`
  );
}

/* =========================================================
   JOBS
========================================================= */

export async function searchJobs(filters = {}) {
  const params = new URLSearchParams();

  if (filters.keyword) {
    params.append("keyword", filters.keyword);
  }

  if (filters.location) {
    params.append("location", filters.location);
  }

  if (filters.category) {
    params.append("category", filters.category);
  }

  if (
    filters.min_experience !== undefined &&
    filters.min_experience !== ""
  ) {
    params.append(
      "min_experience",
      filters.min_experience
    );
  }

  const query = params.toString();

  return request(
    `/jobs/search${query ? `?${query}` : ""}`
  );
}

export async function getJob(jobId) {
  return request(`/jobs/${jobId}`);
}

export async function createJob(job) {
  return request("/jobs", {
    method: "POST",
    body: JSON.stringify(job),
  });
}

export async function getMyJobs() {
  return request("/jobs/my-jobs");
}

export async function updateJob(jobId, job) {
  return request(`/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(job),
  });
}

export async function deleteJob(jobId) {
  return request(`/jobs/${jobId}`, {
    method: "DELETE",
  });
}

/* =========================================================
   APPLICATIONS
========================================================= */

export async function applyForJob(
  jobId,
  coverMessage = ""
) {
  return request("/applications", {
    method: "POST",
    body: JSON.stringify({
      job_id: jobId,
      cover_message: coverMessage,
    }),
  });
}

export async function getMyApplications() {
  return request(
    "/applications/my-applications"
  );
}

export async function getEmployerApplications() {
  return request("/applications/employer");
}

export async function updateApplicationStatus(
  applicationId,
  status
) {
  return request(
    `/applications/${applicationId}/status`,
    {
      method: "PUT",
      body: JSON.stringify({
        status,
      }),
    }
  );
}

/* =========================================================
   EMPLOYER PROFILE
========================================================= */

export async function getEmployerProfile() {
  return request("/employer/profile");
}

export async function saveEmployerProfile(
  profile
) {
  return request("/employer/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

/* =========================================================
   DOCUMENTS
========================================================= */

export async function uploadDocument(
  file,
  documentType
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "document_type",
    documentType
  );

  return request("/documents/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getMyDocuments() {
  return request(
    "/documents/my-documents"
  );
}

export async function downloadDocument(
  documentId
) {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/documents/${documentId}/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    let message =
      "Unable to download document";

    try {
      const data =
        await response.json();

      message =
        data.message || message;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }

  return response.blob();
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

export async function getNotifications() {
  return request("/notifications");
}

export async function markNotificationRead(
  notificationId
) {
  return request(
    `/notifications/${notificationId}/read`,
    {
      method: "PUT",
    }
  );
}

/* =========================================================
   ADMIN
========================================================= */

export async function getAdminDashboard() {
  return request("/admin/dashboard");
}

export async function getAdminUsers() {
  return request("/admin/users");
}

export async function updateUserStatus(
  userId,
  status
) {
  return request(
    `/admin/users/${userId}/status`,
    {
      method: "PUT",
      body: JSON.stringify({
        status,
      }),
    }
  );
}

export async function getAdminJobs() {
  return request("/admin/jobs");
}

export async function updateAdminJobStatus(
  jobId,
  status
) {
  return request(
    `/admin/jobs/${jobId}/status`,
    {
      method: "PUT",
      body: JSON.stringify({
        status,
      }),
    }
  );
}

export async function getAdminApplications() {
  return request(
    "/admin/applications"
  );
}