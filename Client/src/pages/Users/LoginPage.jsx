// pages/Users/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Mail, Lock, Eye, EyeOff,
    Store, User, Shield, AlertCircle
} from 'lucide-react';
import axios from 'axios';

// Vite environment variables are available under import.meta.env
// Only variables prefixed with VITE_ are exposed to the client
const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-com-backend.vercel.app/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('user');
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

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const endpoint =
                activeTab === 'user' ? `${API_URL}/auth/user/login` :
                    activeTab === 'seller' ? `${API_URL}/auth/seller/login` :
                        `${API_URL}/auth/admin/login`;

            console.log('Logging in to:', endpoint);

            const response = await axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Login response:', response.data);

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);

                // Store user data based on role
                const userData = response.data.user || response.data.seller || response.data.admin;
                localStorage.setItem('user', JSON.stringify(userData));

                setError('');

                // Small delay for better UX
                setTimeout(() => {
                    const role = activeTab;
                    if (role === 'admin') {
                        navigate('/admin/dashboard');
                    } else if (role === 'seller') {
                        navigate('/seller/dashboard');
                    } else {
                        navigate('/');
                    }
                }, 500);
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err.response || err);

            if (err.response) {
                setError(err.response.data?.message ||
                    err.response.data?.error ||
                    `Login failed (${err.response.status})`);
            } else if (err.request) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setError('');
    };

    const handleDemoLogin = (role) => {
        setActiveTab(role);
        setFormData({
            email: role === 'admin' ? 'admin@example.com' :
                role === 'seller' ? 'seller@example.com' :
                    'user@example.com',
            password: 'password123'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#800000] rounded-full mb-4 shadow-lg">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>

                {/* Demo Login Buttons */}
                <div className="mb-6 bg-white rounded-xl shadow p-4">
                    <p className="text-sm text-gray-600 mb-2 text-center">Try demo login:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => handleDemoLogin('user')}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            User Demo
                        </button>
                        <button
                            onClick={() => handleDemoLogin('seller')}
                            className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
                        >
                            Seller Demo
                        </button>
                        <button
                            onClick={() => handleDemoLogin('admin')}
                            className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors"
                        >
                            Admin Demo
                        </button>
                    </div>
                </div>

                {/* Role Tabs */}
                <div className="bg-white rounded-xl shadow-lg p-1 mb-6">
                    <div className="flex space-x-1">
                        {['user', 'seller', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => handleTabChange(role)}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === role
                                    ? 'bg-[#800000] text-white shadow-md'
                                    : 'text-gray-600 hover:text-[#800000] hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    {role === 'user' && <User size={16} />}
                                    {role === 'seller' && <Store size={16} />}
                                    {role === 'admin' && <Shield size={16} />}
                                    <span className="capitalize">{role}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email Address
                                </div>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000] transition-all duration-200"
                                placeholder="Enter your email"
                                disabled={loading}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <Lock className="w-4 h-4 mr-2" />
                                    Password
                                </div>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000] pr-12 transition-all duration-200"
                                    placeholder="Enter your password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {activeTab === 'seller' && (
                                <p className="text-sm text-gray-500 mt-2">
                                    <Shield className="inline w-3 h-3 mr-1" />
                                    Seller accounts require verification
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#800000] text-white py-3.5 px-4 rounded-lg font-medium hover:bg-[#900000] focus:ring-4 focus:ring-red-300 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                `Sign in as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
                            )}
                        </button>

                        {/* Forgot Password */}
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                className="text-sm text-[#800000] hover:text-[#900000] hover:underline"
                                onClick={() => navigate('/forgot-password')}
                            >
                                Forgot your password?
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-sm text-gray-500">Or continue with</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="text-[#800000] font-semibold hover:text-[#900000] hover:underline"
                            >
                                Sign up now
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} BricksKart. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;