import axios from "axios";

/* ===============================
   API BASE URL (LOCAL + PROD SAFE)
================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? " https://bricks-backend-qyea.onrender.com/api"
    : " https://bricks-backend-qyea.onrender.com/api");

/* ===============================
   AXIOS INSTANCE - POINTS TO ADMIN V1 ROUTES
================================ */

const api = axios.create({
  baseURL: `${API_BASE_URL}/v1/admin`, // ← Correct path matching your backend
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===============================
   STATIC ADMIN CREDENTIALS (DEMO ONLY)
================================ */

export const STATIC_ADMIN_CREDENTIALS = {
  email: "admin@bricks.com",
  password: "Admin@123",
  name: "Super Admin",
  role: "super_admin",
};

/* ===============================
   STATIC AUTH HELPERS (CLIENT-SIDE ONLY)
================================ */

export const validateStaticCredentials = (email, password) => {
  return (
    email === STATIC_ADMIN_CREDENTIALS.email &&
    password === STATIC_ADMIN_CREDENTIALS.password
  );
};

export const generateStaticToken = () => {
  const tokenData = {
    email: STATIC_ADMIN_CREDENTIALS.email,
    name: STATIC_ADMIN_CREDENTIALS.name,
    role: STATIC_ADMIN_CREDENTIALS.role,
    timestamp: new Date().toISOString(),
  };

  return btoa(JSON.stringify(tokenData));
};

export const validateStaticToken = (token) => {
  try {
    if (!token) return false;

    const decoded = JSON.parse(atob(token));

    if (
      decoded.email !== STATIC_ADMIN_CREDENTIALS.email ||
      decoded.role !== STATIC_ADMIN_CREDENTIALS.role
    ) {
      return false;
    }

    // Token valid for 24 hours
    const tokenTime = new Date(decoded.timestamp);
    const now = new Date();
    const hoursDiff = Math.abs(now - tokenTime) / 36e5;

    return hoursDiff <= 24;
  } catch {
    return false;
  }
};

/* ===============================
   MOCK LOGIN / LOGOUT (DEMO PURPOSES)
================================ */

export const staticLogin = async ({ email, password }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (validateStaticCredentials(email, password)) {
        const token = generateStaticToken();

        localStorage.setItem("adminToken", token);
        localStorage.setItem("userType", "admin");

        resolve({
          success: true,
          token,
          user: {
            email: STATIC_ADMIN_CREDENTIALS.email,
            name: STATIC_ADMIN_CREDENTIALS.name,
            role: STATIC_ADMIN_CREDENTIALS.role,
          },
        });
      } else {
        reject({
          success: false,
          message: "Invalid email or password",
        });
      }
    }, 800);
  });
};

export const staticLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("userType");
  window.location.href = "/admin/login";
};

/* ===============================
   AXIOS INTERCEPTORS
================================ */

// Add token to every request if valid
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token && validateStaticToken(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 → auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized access - logging out");
      staticLogout();
    }
    return Promise.reject(error);
  },
);

/* ===============================
   AUTH STATE HELPERS
================================ */

export const isAuthenticated = () => {
  const token = localStorage.getItem("adminToken");
  const userType = localStorage.getItem("userType");

  return Boolean(token && validateStaticToken(token) && userType === "admin");
};

export const getCurrentUser = () => {
  const token = localStorage.getItem("adminToken");

  if (!token || !validateStaticToken(token)) return null;

  try {
    const decoded = JSON.parse(atob(token));
    return {
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    return null;
  }
};

/* ===============================
   EXPORT AXIOS INSTANCE
================================ */

export { api };
