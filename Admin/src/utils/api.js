import axios from "axios";

const api = axios.create({
  baseURL: "https://bricks-backend-qyea.onrender.com/api/admin",
  headers: {
    "Content-Type": "application/json",
  },
});

// Static admin credentials
export const STATIC_ADMIN_CREDENTIALS = {
  email: "admin@bricks.com",
  password: "Admin@123",
  name: "Super Admin",
  role: "super_admin"
};

// Check if credentials match
export const validateStaticCredentials = (email, password) => {
  return email === STATIC_ADMIN_CREDENTIALS.email &&
    password === STATIC_ADMIN_CREDENTIALS.password;
};

// Generate static token
export const generateStaticToken = () => {
  const tokenData = {
    email: STATIC_ADMIN_CREDENTIALS.email,
    name: STATIC_ADMIN_CREDENTIALS.name,
    role: STATIC_ADMIN_CREDENTIALS.role,
    timestamp: new Date().toISOString()
  };

  // Create a simple base64 token
  const token = btoa(JSON.stringify(tokenData));
  return token;
};

// Validate static token
export const validateStaticToken = (token) => {
  try {
    if (!token) return false;

    const decoded = atob(token);
    const tokenData = JSON.parse(decoded);

    // Check if token has required fields and matches admin email
    const isValid = tokenData.email === STATIC_ADMIN_CREDENTIALS.email &&
      tokenData.role === STATIC_ADMIN_CREDENTIALS.role;

    // Optional: Check if token is not too old (e.g., 24 hours)
    if (isValid) {
      const tokenTime = new Date(tokenData.timestamp);
      const now = new Date();
      const hoursDiff = Math.abs(now - tokenTime) / 36e5; // hours

      // Token expires after 24 hours
      if (hoursDiff > 24) {
        return false;
      }
    }

    return isValid;
  } catch (error) {
    return false;
  }
};

// Mock login function for static authentication
export const staticLogin = async (credentials) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (validateStaticCredentials(credentials.email, credentials.password)) {
        const token = generateStaticToken();
        localStorage.setItem("adminToken", token);
        localStorage.setItem("userType", "admin");

        resolve({
          success: true,
          token,
          user: {
            email: STATIC_ADMIN_CREDENTIALS.email,
            name: STATIC_ADMIN_CREDENTIALS.name,
            role: STATIC_ADMIN_CREDENTIALS.role
          }
        });
      } else {
        reject({
          success: false,
          message: "Invalid email or password"
        });
      }
    }, 500); // Simulate network delay
  });
};

// Mock logout function
export const staticLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("userType");
  window.location.href = "/admin/login";
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token && validateStaticToken(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      staticLogout();
    }
    return Promise.reject(error);
  }
);

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("adminToken");
  const userType = localStorage.getItem("userType");

  return token && validateStaticToken(token) && userType === "admin";
};

// Get current user info
export const getCurrentUser = () => {
  const token = localStorage.getItem("adminToken");

  if (!token || !validateStaticToken(token)) {
    return null;
  }

  try {
    const decoded = atob(token);
    const tokenData = JSON.parse(decoded);

    return {
      email: tokenData.email,
      name: tokenData.name,
      role: tokenData.role
    };
  } catch (error) {
    return null;
  }
};

export { api };