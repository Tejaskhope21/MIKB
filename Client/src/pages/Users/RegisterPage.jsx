// pages/Users/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, User, Mail, Lock, Phone,
    Store, Building, PhoneCall, Globe,
    Eye, EyeOff, CheckCircle, AlertCircle, CreditCard, MapPin
} from 'lucide-react';
import axios from 'axios';

// Vite environment variables – only VITE_ prefixed vars are exposed to the client
const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-com-backend.vercel.app/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('user');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    const [sellerForm, setSellerForm] = useState({
        name: '',
        email: '',
        password: '',
        businessName: '',
        businessType: '',
        gstNumber: '',
        contactNumber: '',
        businessAddress: '',
        bankAccountNumber: '',
        bankAccountName: '',
        bankIFSC: ''
    });

    const handleUserChange = (e) => {
        setUserForm({
            ...userForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSellerChange = (e) => {
        setSellerForm({
            ...sellerForm,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = (isSeller = false) => {
        const form = isSeller ? sellerForm : userForm;

        if (isSeller) {
            if (!form.name.trim()) return 'Owner name is required';
            if (!form.email.trim()) return 'Email is required';
            if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Valid email is required';
            if (form.password.length < 6) return 'Password must be at least 6 characters';
            if (!form.businessName.trim()) return 'Business name is required';
            if (!form.businessType) return 'Business type is required';
            if (!form.gstNumber.trim()) return 'GST number is required';
            if (!form.gstNumber.match(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)) return 'Valid GST number is required';
            if (!form.contactNumber.match(/^[0-9]{10}$/)) return 'Valid 10-digit contact number is required';
            if (!form.businessAddress.trim()) return 'Business address is required';
            if (!form.bankAccountNumber.match(/^[0-9]{9,18}$/)) return 'Valid bank account number is required';
            if (!form.bankAccountName.trim()) return 'Bank account name is required';
            if (!form.bankIFSC.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) return 'Valid IFSC code is required';
        } else {
            if (!form.name.trim()) return 'Name is required';
            if (!form.email.trim()) return 'Email is required';
            if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Valid email is required';
            if (form.password.length < 6) return 'Password must be at least 6 characters';
            if (form.phone && !form.phone.match(/^[0-9]{10}$/)) return 'Valid 10-digit phone number is required';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validate form
        const validationError = validateForm(activeTab === 'seller');
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const endpoint = activeTab === 'user'
                ? `${API_URL}/auth/user/register`
                : `${API_URL}/auth/seller/register`;

            const data = activeTab === 'user' ? userForm : sellerForm;

            console.log('Registering to:', endpoint);

            const response = await axios.post(endpoint, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Registration response:', response.data);

            if (response.data.success) {
                setSuccess(response.data.message || 'Registration successful!');

                if (activeTab === 'user') {
                    // Auto login after user registration
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    setTimeout(() => navigate('/'), 2000);
                } else {
                    // For sellers, redirect to login after showing success
                    setTimeout(() => {
                        setActiveTab('user');
                        navigate('/login');
                    }, 3000);
                }
            } else {
                setError(response.data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err.response || err);

            if (err.response) {
                setError(err.response.data?.message ||
                    err.response.data?.error ||
                    `Registration failed (${err.response.status})`);
            } else if (err.request) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
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
                            <User className="w-4 h-4 mr-2" />
                            Full Name *
                        </div>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={userForm.name}
                        onChange={handleUserChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                        placeholder="John Doe"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            Phone Number
                        </div>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={userForm.phone}
                        onChange={handleUserChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                        placeholder="9876543210"
                        disabled={loading}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Address *
                    </div>
                </label>
                <input
                    type="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleUserChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                    placeholder="john@example.com"
                    disabled={loading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Password *
                    </div>
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={userForm.password}
                        onChange={handleUserChange}
                        required
                        minLength="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000] pr-12"
                        placeholder="At least 6 characters"
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
                <p className="text-xs text-gray-500 mt-2">
                    Password must be at least 6 characters long
                </p>
            </div>
        </div>
    );

    const renderSellerForm = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Owner Name *
                        </div>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={sellerForm.name}
                        onChange={handleSellerChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                        placeholder="John Doe"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                            <Store className="w-4 h-4 mr-2" />
                            Business Name *
                        </div>
                    </label>
                    <input
                        type="text"
                        name="businessName"
                        value={sellerForm.businessName}
                        onChange={handleSellerChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                        placeholder="ABC Enterprises"
                        disabled={loading}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Address *
                    </div>
                </label>
                <input
                    type="email"
                    name="email"
                    value={sellerForm.email}
                    onChange={handleSellerChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                    placeholder="business@example.com"
                    disabled={loading}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                            <Lock className="w-4 h-4 mr-2" />
                            Password *
                        </div>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={sellerForm.password}
                            onChange={handleSellerChange}
                            required
                            minLength="6"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000] pr-12"
                            placeholder="At least 6 characters"
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                            <PhoneCall className="w-4 h-4 mr-2" />
                            Contact Number *
                        </div>
                    </label>
                    <input
                        type="tel"
                        name="contactNumber"
                        value={sellerForm.contactNumber}
                        onChange={handleSellerChange}
                        required
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                        placeholder="9876543210"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type *
                    </label>
                    <select
                        name="businessType"
                        value={sellerForm.businessType}
                        onChange={handleSellerChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                        disabled={loading}
                    >
                        <option value="">Select Type</option>
                        <option value="Manufacturer">Manufacturer</option>
                        <option value="Distributor">Distributor</option>
                        <option value="Retailer">Retailer</option>
                        <option value="Wholesaler">Wholesaler</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST Number *
                    </label>
                    <input
                        type="text"
                        name="gstNumber"
                        value={sellerForm.gstNumber}
                        onChange={handleSellerChange}
                        required
                        pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000] uppercase"
                        placeholder="22ABCDE1234F1Z5"
                        disabled={loading}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        Business Address *
                    </div>
                </label>
                <textarea
                    name="businessAddress"
                    value={sellerForm.businessAddress}
                    onChange={handleSellerChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000] resize-none"
                    placeholder="Enter complete business address"
                    disabled={loading}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Bank Account Number *
                        </div>
                    </label>
                    <input
                        type="text"
                        name="bankAccountNumber"
                        value={sellerForm.bankAccountNumber}
                        onChange={handleSellerChange}
                        required
                        pattern="^[0-9]{9,18}$"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                        placeholder="123456789012"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Name *
                    </label>
                    <input
                        type="text"
                        name="bankAccountName"
                        value={sellerForm.bankAccountName}
                        onChange={handleSellerChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000]"
                        placeholder="Account holder name"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code *
                    </label>
                    <input
                        type="text"
                        name="bankIFSC"
                        value={sellerForm.bankIFSC}
                        onChange={handleSellerChange}
                        required
                        pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000] uppercase"
                        placeholder="SBIN0000123"
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Logo & Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#800000] to-[#a00000] rounded-full mb-4 shadow-lg">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Create Your Account</h1>
                    <p className="text-gray-600 mt-2">Join our e-commerce platform today</p>
                </div>

                {/* Role Tabs */}
                <div className="bg-white rounded-xl shadow-lg p-1 mb-8 max-w-md mx-auto">
                    <div className="flex">
                        {['user', 'seller'].map((role) => (
                            <button
                                key={role}
                                onClick={() => {
                                    setActiveTab(role);
                                    setError('');
                                    setSuccess('');
                                }}
                                className={`flex-1 py-4 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === role
                                    ? 'bg-gradient-to-r from-[#800000] to-[#a00000] text-white shadow-md'
                                    : 'text-gray-600 hover:text-[#800000] hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    {role === 'user' && <User size={18} />}
                                    {role === 'seller' && <Store size={18} />}
                                    <span className="capitalize">{role}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="md:flex">
                        {/* Left Side - Benefits */}
                        <div className="md:w-2/5 bg-gradient-to-b from-[#800000] to-[#a00000] p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6">
                                {activeTab === 'user' ? 'Customer Benefits' : 'Seller Benefits'}
                            </h2>
                            <ul className="space-y-4">
                                {activeTab === 'user' ? (
                                    <>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                            <span>Fast & secure checkout process</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                            <span>Personalized shopping experience</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                            <span>Order tracking and history</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                            <span>Exclusive member discounts</span>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                            <span>Reach millions of customers</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                            <span>Secure payment processing</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                            <span>Seller dashboard with analytics</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                            <span>Dedicated seller support</span>
                                        </li>
                                    </>
                                )}
                            </ul>
                            <div className="mt-8 pt-8 border-t border-red-400">
                                <p className="text-red-100 text-sm">
                                    {activeTab === 'seller' &&
                                        "Note: Seller accounts require verification. You'll receive email confirmation once verified."}
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="md:w-3/5 p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                        <p className="text-green-600 text-sm">{success}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {activeTab === 'user' ? renderUserForm() : renderSellerForm()}

                                {/* Terms & Conditions */}
                                <div className="mt-6">
                                    <label className="flex items-start">
                                        <input
                                            type="checkbox"
                                            required
                                            className="mt-1 mr-3 h-4 w-4 text-[#800000] rounded focus:ring-[#800000]"
                                            disabled={loading}
                                        />
                                        <span className="text-sm text-gray-600">
                                            I agree to the{' '}
                                            <button type="button" className="text-[#800000] hover:underline">
                                                Terms & Conditions
                                            </button>
                                            {' '}and{' '}
                                            <button type="button" className="text-[#800000] hover:underline">
                                                Privacy Policy
                                            </button>
                                        </span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-8 bg-[#800000] text-white py-4 px-4 rounded-lg font-semibold hover:bg-[#900000] focus:ring-4 focus:ring-red-300 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Creating Account...
                                        </span>
                                    ) : (
                                        `Create ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Account`
                                    )}
                                </button>

                                {/* Login Link */}
                                <div className="text-center mt-6">
                                    <p className="text-gray-600">
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => navigate('/login')}
                                            className="text-[#800000] font-semibold hover:text-[#900000] hover:underline"
                                        >
                                            Sign in here
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} BricksKart. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;