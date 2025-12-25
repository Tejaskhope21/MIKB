import React, { useState } from "react";
import { Lock, Mail, Store, Eye, EyeOff } from "lucide-react";
import { staticLogin } from "../utils/api";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await staticLogin(credentials);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setCredentials({
      email: "admin@bricks.com",
      password: "Admin@123",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo & Title */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg">
              <Store className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900">Admin Portal</h2>
          <p className="mt-2 text-gray-600">Manage users, sellers & platform</p>

          {/* Demo Credentials Box */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5 text-left">
            <h3 className="font-semibold text-amber-900 mb-3">Demo Login</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-700">Email:</span>
                <code className="bg-white px-3 py-1 rounded border font-mono">
                  admin@bricks.com
                </code>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-700">Pass:</span>
                <code className="bg-white px-3 py-1 rounded border font-mono">
                  Admin@123
                </code>
              </div>
            </div>
            <button
              onClick={handleDemoLogin}
              className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 rounded-lg transition"
            >
              Auto-fill Demo Credentials
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="admin@bricks.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Note: This uses static demo login. In production, replace with real JWT auth.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;