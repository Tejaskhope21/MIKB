import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Mail, Lock, Eye, EyeOff,
  Store, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SellerLoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const endpoint = `${API_URL}/auth/seller/login`;

      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.seller));

        setTimeout(() => navigate('/seller/dashboard'), 500);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || err.response.data?.error || `Login failed (${err.response.status})`);
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Demo credentials
  const handleDemoLogin = () => {
    setFormData({
      email: 'seller@example.com',
      password: 'password123'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#800000] rounded-full mb-4 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Seller Login</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your store</p>
        </div>

        {/* Demo Button */}
        <div className="mb-6 bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Try demo login:</p>
          <button
            onClick={handleDemoLogin}
            className="px-4 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
          >
            Seller Demo (seller@example.com / password123)
          </button>
        </div>

        {/* Fixed Seller Tab Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-1 mb-6">
          <div className="flex">
            <div className="flex-1 py-3 px-4 rounded-lg bg-[#800000] text-white shadow-md flex items-center justify-center space-x-2">
              <Store size={16} />
              <span>Seller</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                placeholder="seller@example.com"
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000] pr-12"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Seller accounts require admin verification
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800000] text-white py-3.5 rounded-lg font-medium hover:bg-[#900000] shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in as Seller'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-[#800000] hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="my-8 text-center text-gray-600">
            Don't have a seller account?{' '}
            <button
              onClick={() => navigate('/seller/register')}
              className="text-[#800000] font-semibold hover:underline"
            >
              Register here
            </button>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          © {new Date().getFullYear()} BricksKart. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default SellerLoginPage;