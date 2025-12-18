// src/Pages/Seller/SellerLogin.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBuilding, FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

const SellerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Static seller credentials for demo
  const staticSellers = [
    { email: "demo@brickskart.com", password: "demo123", name: "Demo Seller", businessName: "Demo Construction Materials" },
    { email: "steel@brickskart.com", password: "steel123", name: "Steel Supplier", businessName: "Premium Steel & Metals" },
    { email: "cement@brickskart.com", password: "cement123", name: "Cement Distributor", businessName: "StrongBuild Cement" },
    { email: "tools@brickskart.com", password: "tools123", name: "Tools Merchant", businessName: "Builders Tools Depot" },
  ];

  // Static login function
  const staticLogin = () => {
    const matchedSeller = staticSellers.find(
      seller => seller.email === email && seller.password === password
    );

    if (!matchedSeller) {
      return { success: false, error: "Invalid email or password" };
    }

    // Create seller session data
    const sellerData = {
      seller: {
        id: "BK-SELLER-" + Date.now(),
        email: matchedSeller.email,
        name: matchedSeller.name,
        businessName: matchedSeller.businessName,
        phone: "+91 98765 43210",
        address: "Mumbai, Maharashtra",
        gstNumber: "27AABCU9603R1ZM",
        sellerId: "BK-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
        revenue: "1,24,567",
        orders: 24,
        status: "Verified",
        joinDate: "2023-10-15"
      },
      token: "bk_token_" + Date.now(),
      role: "seller",
      isAuthenticated: true,
      loginTime: new Date().toISOString()
    };

    // Store in localStorage for persistence
    localStorage.setItem("sellerSession", JSON.stringify(sellerData));
    localStorage.setItem("authToken", sellerData.token);

    return { success: true, data: sellerData };
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Use static login
      const loginResult = staticLogin();

      if (!loginResult.success) {
        throw new Error(loginResult.error || "Invalid email or password. Try demo@brickskart.com / demo123");
      }

      setSuccess(`Welcome back, ${loginResult.data.seller.businessName}!`);
      
      setTimeout(() => {
        navigate("/seller/home-dashboard");
      }, 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    // Auto-login after a short delay
    setTimeout(() => {
      handleLogin();
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Brand & Info */}
      <div className="md:w-2/5 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 md:p-12">
        <div className="flex items-center gap-3 mb-12">
          <FaBuilding className="text-4xl text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold">Brick's Kart</h1>
            <p className="text-gray-300">Building Materials Marketplace</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Sell Building Materials Online</h2>
            <p className="text-gray-300 leading-relaxed">
              Join India's fastest-growing B2B marketplace for construction materials. 
              Connect with builders, contractors, and retailers nationwide.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaBuilding className="text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold">Reach Pan-India Buyers</h3>
                <p className="text-sm text-gray-300">Access thousands of construction professionals</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaLock className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Payments</h3>
                <p className="text-sm text-gray-300">Guaranteed payments with 7-day settlements</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="font-bold mb-3">Quick Demo Access</h3>
            <div className="space-y-2">
              {staticSellers.map((seller, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoLogin(seller.email, seller.password)}
                  disabled={loading}
                  className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <div className="font-medium">{seller.businessName}</div>
                  <div className="text-sm text-gray-400">{seller.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="md:w-3/5 bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-4">
              <FaBuilding className="text-2xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Seller Login</h2>
            <p className="text-gray-600 mt-2">Access your seller dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="font-semibold">Login Failed</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              <div className="font-semibold">Success!</div>
              <div className="text-sm mt-1">{success}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  placeholder="seller@company.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Demo: demo@brickskart.com / demo123
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-orange-600 hover:text-orange-500 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                loading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-500/30"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login to Seller Dashboard"
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Link
                to="/seller-register"
                className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium transition-colors"
              >
                Register as Seller
              </Link>
              <Link
                to="/"
                className="px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-center font-medium transition-colors"
              >
                Visit Marketplace
              </Link>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                By logging in, you agree to our{" "}
                <Link to="/terms" className="text-orange-600 hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-orange-600 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;