import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  User,
  HardHat,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "https://bricks-backend-qyea.onrender.com/api"
    : "https://bricks-backend-qyea.onrender.com/api");

const LoginPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user");
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
      let endpoint;
      if (activeTab === "user") {
        endpoint = `${API_URL}/auth/user/login`;
      } else if (activeTab === "seller") {
        endpoint = `${API_URL}/auth/seller/login`;
      } else if (activeTab === "contractor") {
        endpoint = `${API_URL}/contractor/auth/login`;
      }

      console.log("Attempting login to:", endpoint);

      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.data.success) {
        const token = response.data.token;
        const userData =
          response.data.user ||
          response.data.seller ||
          response.data.contractor;

        let userRole = activeTab;

        if (response.data.contractor) {
          userRole = "contractor";
        } else if (response.data.seller) {
          userRole = "seller";
        } else if (response.data.user) {
          userRole = "user";
        }

        localStorage.setItem("token", token);
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userData", JSON.stringify(userData));

        console.log("Login successful. Role:", userRole);

        setTimeout(() => {
          switch (userRole) {
            case "seller":
              navigate("/seller/dashboard");
              break;
            case "contractor":
              navigate("/contractor/dashboard");
              break;
            default:
              navigate("/");
          }
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
        errorMsg = "Cannot connect to server.";
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setFormData({ email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {/* Role Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6">
            <div className="flex space-x-1">
              {["user", "seller", "contractor"].map((role) => (
                <button
                  key={role}
                  onClick={() => handleTabChange(role)}
                  className={`flex-1 py-3 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === role
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    {role === "user" && <User size={14} />}
                    {role === "seller" && <Store size={14} />}
                    {role === "contractor" && <HardHat size={14} />}
                    <span className="capitalize">{role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-orange-600" /> Email Address
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-orange-600" /> Password
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500 pr-12"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3.5 px-4 rounded-lg font-medium hover:bg-orange-700 transition-all duration-300 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  `Sign in as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  className="text-sm text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot your password?
                </button>
              </div>
            </form>

            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-colors"
                  onClick={() => navigate("/register")}
                >
                  Sign up now
                </button>
              </p>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-500">
            <p>© 2025 InfraKarts. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;