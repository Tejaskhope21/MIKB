import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Mail, Lock, Eye, EyeOff,
    Store, User, Shield, AlertCircle, HardHat
} from 'lucide-react';
import axios from 'axios';

const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === 'development'
        ? 'https://bricks-backend-qyea.onrender.com/api'
        : 'https://bricks-backend-qyea.onrender.com/api');

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

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            let endpoint;
            if (activeTab === 'user') {
                endpoint = `${API_URL}/auth/user/login`;
            } else if (activeTab === 'seller') {
                endpoint = `${API_URL}/auth/seller/login`;
            } else if (activeTab === 'contractor') {
                endpoint = `${API_URL}/contractor/auth/login`;
            } else if (activeTab === 'admin') {
                endpoint = `${API_URL}/auth/admin/login`;
            }

            console.log('Attempting login to:', endpoint);

            const response = await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            if (response.data.success) {
                const token = response.data.token;
                const userData = response.data.user ||
                    response.data.seller ||
                    response.data.contractor ||
                    response.data.admin;

                // Determine role from response data
                let userRole = activeTab; // Default to activeTab

                // Check which user object exists in response to determine role
                if (response.data.contractor) {
                    userRole = 'contractor';
                } else if (response.data.seller) {
                    userRole = 'seller';
                } else if (response.data.admin) {
                    userRole = 'admin';
                } else if (response.data.user) {
                    userRole = 'user';
                }

                // Save to localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('userRole', userRole); // Use determined role
                localStorage.setItem('userData', JSON.stringify(userData));

                console.log('Login successful. Role:', userRole);
                console.log('Stored role:', localStorage.getItem('userRole'));
                console.log('User data:', userData);

                // Redirect based on role
                setTimeout(() => {
                    switch (userRole) {
                        case 'admin':
                            navigate('/admin/dashboard');
                            break;
                        case 'seller':
                            navigate('/seller/dashboard');
                            break;
                        case 'contractor':
                            navigate('/contractor/dashboard');
                            break;
                        default:
                            navigate('/');
                    }
                }, 500);
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err.response || err);
            let errorMsg = 'An unexpected error occurred. Please try again.';
            if (err.response) {
                if (err.response.status === 404) errorMsg = 'Login endpoint not found.';
                else if (err.response.status === 401) errorMsg = 'Invalid email or password';
                else errorMsg = err.response.data?.message || `Login failed (${err.response.status})`;
            } else if (err.code === 'ERR_NETWORK') {
                errorMsg = 'Cannot connect to server.';
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setError('');
        setFormData({ email: '', password: '' });
    };

    const handleDemoLogin = (role) => {
        setActiveTab(role);
        setFormData({
            email: role === 'admin' ? 'admin@example.com' :
                role === 'seller' ? 'seller@example.com' :
                    role === 'contractor' ? 'contractor@example.com' :
                        'user@example.com',
            password: 'password123'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#800000] rounded-full mb-4 shadow-lg">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>

                <div className="mb-6 bg-white rounded-xl shadow p-4">
                    <p className="text-sm text-gray-600 mb-2 text-center">Try demo login:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button onClick={() => handleDemoLogin('user')} className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200">User Demo</button>
                        <button onClick={() => handleDemoLogin('seller')} className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200">Seller Demo</button>
                        <button onClick={() => handleDemoLogin('contractor')} className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm rounded-lg hover:bg-amber-200">Contractor Demo</button>
                        <button onClick={() => handleDemoLogin('admin')} className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200">Admin Demo</button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-1 mb-6">
                    <div className="flex space-x-1">
                        {['user', 'seller', 'contractor', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => handleTabChange(role)}
                                className={`flex-1 py-3 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === role ? 'bg-[#800000] text-white shadow-md' : 'text-gray-600 hover:text-[#800000] hover:bg-gray-100'}`}
                            >
                                <div className="flex items-center justify-center space-x-1">
                                    {role === 'user' && <User size={14} />}
                                    {role === 'seller' && <Store size={14} />}
                                    {role === 'contractor' && <HardHat size={14} />}
                                    {role === 'admin' && <Shield size={14} />}
                                    <span className="capitalize">{role}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

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
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center"><Mail className="w-4 h-4 mr-2" />Email Address</div>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                                placeholder="Enter your email"
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center"><Lock className="w-4 h-4 mr-2" />Password</div>
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
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#800000] text-white py-3.5 px-4 rounded-lg font-medium hover:bg-[#900000] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : `Sign in as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                        </button>

                        <div className="text-center mt-4">
                            <button type="button" className="text-sm text-[#800000] hover:underline" onClick={() => navigate('/forgot-password')}>
                                Forgot your password?
                            </button>
                        </div>
                    </form>

                    <div className="my-8 flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-sm text-gray-500">Or continue with</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <button type="button" className="text-[#800000] font-semibold hover:underline" onClick={() => navigate('/register')}>
                                Sign up now
                            </button>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>© 2025 BricksKart. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;