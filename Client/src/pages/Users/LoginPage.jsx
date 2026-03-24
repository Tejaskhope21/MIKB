import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "http://localhost:5000/api");

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const endpoint = `${API_URL}/auth/user/login`;

      console.log("Attempting login to:", endpoint);

      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.data.success) {
        const token = response.data.token;
        const userData = response.data.user;

        localStorage.setItem("token", token);
        localStorage.setItem("userRole", "user");
        localStorage.setItem("userData", JSON.stringify(userData));

        console.log("Login successful");

        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err.response || err);
      let errorMsg = "An unexpected error occurred. Please try again.";
      if (err.response) {
        if (err.response.status === 404) errorMsg = "Login endpoint not found.";
        else if (err.response.status === 401)
          errorMsg = "Invalid email or password";
        else
          errorMsg =
            err.response.data?.message ||
            `Login failed (${err.response.status})`;
      } else if (err.code === "ERR_NETWORK") {
        errorMsg = "Cannot connect to server. Please check your connection.";
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group z-10"
        style={{ color: "#0A2540" }}
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      {/* Login Form */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full shadow-lg" style={{ backgroundColor: "#0A2540" }}>
              <ShoppingBag className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "#0A2540" }}>
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: "#0A254020" }}>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" style={{ color: "#0A2540" }} />
                  Email Address
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition text-gray-900 placeholder-gray-500"
                style={{
                  borderColor: "#0A254020",
                  focusRingColor: "#0A2540",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0A2540";
                  e.target.style.boxShadow = `0 0 0 2px ${"#0A2540"}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#0A254020";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" style={{ color: "#0A2540" }} />
                  Password
                </div>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition text-gray-900 placeholder-gray-500 pr-12"
                  style={{
                    borderColor: "#0A254020",
                    focusRingColor: "#0A2540",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0A2540";
                    e.target.style.boxShadow = `0 0 0 2px ${"#0A2540"}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#0A254020";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                  style={{ color: "#0A254080" }}
                  onMouseEnter={(e) => (e.target.style.color = "#0A2540")}
                  onMouseLeave={(e) => (e.target.style.color = "#0A254080")}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 px-4 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#0A2540" }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm transition-colors hover:underline"
                style={{ color: "#0A2540" }}
                onClick={() => navigate("/forgot-password")}
              >
                Forgot your password?
              </button>
            </div>
          </form>

          <div className="text-center mt-8 pt-6 border-t" style={{ borderColor: "#0A254010" }}>
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                className="font-semibold transition-colors hover:underline"
                style={{ color: "#0A2540" }}
                onClick={() => navigate("/register")}
              >
                Sign up now
              </button>
            </p>
          </div>

          <div className="mt-6 pt-4 text-center">
            <p className="text-xs" style={{ color: "#0A254080" }}>
              Secure login • Your data is protected
            </p>
          </div>
        </div>

        <div className="text-center mt-8 text-sm" style={{ color: "#0A254080" }}>
          <p>© {new Date().getFullYear()} MIKB. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;