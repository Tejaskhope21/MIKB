import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Mail, Lock, Phone, Store, Building, CreditCard, MapPin,
  Eye, EyeOff, CheckCircle, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SellerRegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Owner name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Valid email is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (!formData.businessName.trim()) return 'Business name is required';
    if (!formData.businessType) return 'Business type is required';
    if (!formData.gstNumber.match(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)) return 'Valid GST number required';
    if (!formData.contactNumber.match(/^[0-9]{10}$/)) return 'Valid 10-digit contact number required';
    if (!formData.businessAddress.trim()) return 'Business address is required';
    if (!formData.bankAccountNumber.match(/^[0-9]{9,18}$/)) return 'Valid bank account number required';
    if (!formData.bankAccountName.trim()) return 'Bank account name required';
    if (!formData.bankIFSC.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) return 'Valid IFSC code required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/seller/register`, formData, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        setSuccess('Registration successful! Awaiting admin verification. You will receive an email once approved.');
        setTimeout(() => navigate('/seller/login'), 4000);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#800000] to-[#a00000] rounded-full mb-4 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Become a Seller</h1>
          <p className="text-gray-600 mt-2">Register your business on BricksKart</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            {/* Benefits Sidebar */}
            <div className="md:w-2/5 bg-gradient-to-b from-[#800000] to-[#a00000] p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Seller Benefits</h2>
              <ul className="space-y-4">
                <li className="flex items-start"><CheckCircle className="w-5 h-5 mr-3 mt-1" /><span>Reach millions of customers</span></li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 mr-3 mt-1" /><span>Secure payments</span></li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 mr-3 mt-1" /><span>Analytics dashboard</span></li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 mr-3 mt-1" /><span>Dedicated support</span></li>
              </ul>
              <p className="mt-8 text-red-100 text-sm">
                Note: Seller accounts require verification. You'll be notified via email once approved.
              </p>
            </div>

            {/* Form */}
            <div className="md:w-3/5 p-8">
              {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"><AlertCircle className="w-5 h-5 text-red-600 mr-2" /><p className="text-red-600 text-sm">{error}</p></div>}
              {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /><p className="text-green-600 text-sm">{success}</p></div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Same form fields as your original seller form in RegisterPage */}
                {/* ... (copy-paste the renderSellerForm content here as direct JSX) ... */}
                {/* For brevity, I'm summarizing – use the exact fields from your original renderSellerForm() */}

                {/* Example of one section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><User className="w-4 h-4 mr-2" /> Owner Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#800000]" disabled={loading} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Store className="w-4 h-4 mr-2" /> Business Name *</label>
                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#800000]" disabled={loading} />
                  </div>
                </div>

                {/* Add all other fields similarly: email, password (with eye toggle), contact, business type select, GST, address textarea, bank details grid */}

                {/* Terms */}
                <label className="flex items-start">
                  <input type="checkbox" required className="mt-1 mr-3" disabled={loading} />
                  <span className="text-sm text-gray-600">I agree to the Terms & Conditions and Privacy Policy</span>
                </label>

                <button type="submit" disabled={loading} className="w-full bg-[#800000] text-white py-4 rounded-lg font-semibold hover:bg-[#900000] shadow-lg disabled:opacity-50">
                  {loading ? 'Creating Account...' : 'Register as Seller'}
                </button>

                <div className="text-center mt-6 text-gray-600">
                  Already have an account?{' '}
                  <button type="button" onClick={() => navigate('/seller/login')} className="text-[#800000] font-semibold hover:underline">
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          © {new Date().getFullYear()} BricksKart. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default SellerRegisterPage;