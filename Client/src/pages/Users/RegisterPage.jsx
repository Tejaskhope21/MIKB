import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "http://localhost:5000/api");

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleUserChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!userForm.name.trim()) return "Name is required";
    if (!userForm.email.trim()) return "Email is required";
    if (!userForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Valid email is required";
    if (userForm.password.length < 6)
      return "Password must be at least 6 characters";
    if (userForm.phone && !userForm.phone.match(/^[0-9]{10}$/))
      return "Valid 10-digit phone number is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const endpoint = `${API_URL}/auth/user/register`;
      
      console.log("Registering to:", endpoint);
      console.log("Payload:", userForm);

      const response = await axios.post(endpoint, userForm, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.data.success) {
        const successMessage = response.data.message || "Registration successful! Please login to continue.";
        setSuccess(successMessage);

        const token = response.data.token;
        const userData = response.data.user;

        localStorage.setItem("token", token);
        localStorage.setItem("userRole", "user");
        localStorage.setItem("userData", JSON.stringify(userData));

        setTimeout(() => {
          navigate("/user/dashboard");
        }, 2000);
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err.response?.data?.message) errorMessage = err.response.data.message;
      if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.map(e => e.msg).join(", ");
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderUserForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" style={{ color: "#0A2540" }} />
              Full Name *
            </div>
          </label>
          <input
            type="text"
            name="name"
            value={userForm.name}
            onChange={handleUserChange}
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
            placeholder="John Doe"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" style={{ color: "#0A2540" }} />
              Phone Number
            </div>
          </label>
          <input
            type="tel"
            name="phone"
            value={userForm.phone}
            onChange={handleUserChange}
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
            placeholder="9876543210"
            disabled={loading}
          />
          <p className="text-xs mt-1" style={{ color: "#0A254080" }}>
            Optional, but recommended for order updates
          </p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" style={{ color: "#0A2540" }} />
            Email Address *
          </div>
        </label>
        <input
          type="email"
          name="email"
          value={userForm.email}
          onChange={handleUserChange}
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
          placeholder="john@example.com"
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-2" style={{ color: "#0A2540" }} />
            Password *
          </div>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={userForm.password}
            onChange={handleUserChange}
            required
            minLength="6"
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
            placeholder="At least 6 characters"
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
        <p className="text-xs mt-2" style={{ color: "#0A254080" }}>
          Password must be at least 6 characters long
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group z-10"
        style={{ color: "#0A2540" }}
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg" style={{ backgroundColor: "#0A2540" }}>
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "#0A2540" }}>
            Create Your Account
          </h1>
          <p className="text-gray-600 mt-2">
            Join MIKB for a seamless shopping experience
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden" style={{ borderColor: "#0A254020" }}>
          <div className="md:flex">
            {/* Left Benefits Panel */}
            <div className="md:w-2/5 p-8 text-white" style={{ backgroundColor: "#0A2540" }}>
              <h2 className="text-2xl font-bold mb-6">Customer Benefits</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                  <span>Fast & secure checkout</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                  <span>Personalized shopping experience</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                  <span>Real-time order tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                  <span>Exclusive discounts & offers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                  <span>Wishlist & saved items</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                  <span>24/7 customer support</span>
                </li>
              </ul>
            </div>

            {/* Right Form Panel */}
            <div className="md:w-3/5 p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-green-600 text-sm whitespace-pre-line">
                    {success}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {renderUserForm()}

                <div className="mt-6">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 mr-3 h-4 w-4 rounded focus:ring-2 focus:outline-none"
                      style={{ 
                        color: "#0A2540",
                        borderColor: "#0A254020",
                      }}
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{" "}
                      <button
                        type="button"
                        className="hover:underline font-medium"
                        style={{ color: "#0A2540" }}
                        onClick={() => navigate("/terms")}
                      >
                        Terms & Conditions
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        className="hover:underline font-medium"
                        style={{ color: "#0A2540" }}
                        onClick={() => navigate("/privacy")}
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-8 text-white py-4 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: "#0A2540" }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="font-semibold hover:underline transition-colors"
                      style={{ color: "#0A2540" }}
                    >
                      Sign in here
                    </button>
                  </p>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: "#0A254010" }}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white" style={{ color: "#0A254080" }}>Secure Registration</span>
                  </div>
                </div>

                <p className="text-xs text-center" style={{ color: "#0A254080" }}>
                  By creating an account, you'll be able to track orders, save addresses, 
                  and enjoy a personalized shopping experience.
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm" style={{ color: "#0A254080" }}>
          <p>© {new Date().getFullYear()} MIKB. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;