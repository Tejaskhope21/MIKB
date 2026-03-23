// pages/Users/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  User,
  Mail,
  Lock,
  Phone,
  Store,
  Building,
  PhoneCall,
  Globe,
  HardHat,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  CreditCard,
  MapPin,
  Award,
  Users,
  Briefcase,
  CheckSquare,
} from "lucide-react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "http://localhost:5000/api");

const RegisterPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user");
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

  const [sellerForm, setSellerForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    businessType: "",
    gstNumber: "",
    contactNumber: "",
    businessAddress: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankIFSC: "",
  });

  const [contractorForm, setContractorForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    companyName: "",
    contractorType: "",
    experience: "",
    licenseNumber: "",
    address: "",
    specialties: [],
    projectsCompleted: 0,
    teamSize: "",
    website: "",
  });

  const contractorSpecialties = [
    "Residential Construction",
    "Commercial Construction",
    "Industrial Construction",
    "Renovation",
    "Civil Works",
    "Electrical",
    "Plumbing",
    "Interior Design",
    "Landscaping",
    "Project Management",
  ];

  const handleUserChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleSellerChange = (e) => {
    setSellerForm({ ...sellerForm, [e.target.name]: e.target.value });
  };

  const handleContractorChange = (e) => {
    const { name, value } = e.target;
    setContractorForm({ ...contractorForm, [name]: value });
  };

  const handleSpecialtyToggle = (specialty) => {
    setContractorForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const validateForm = (role) => {
    const forms = {
      user: userForm,
      seller: sellerForm,
      contractor: contractorForm,
    };
    const form = forms[role];

    if (role === "user") {
      if (!form.name.trim()) return "Name is required";
      if (!form.email.trim()) return "Email is required";
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        return "Valid email is required";
      if (form.password.length < 6)
        return "Password must be at least 6 characters";
      if (form.phone && !form.phone.match(/^[0-9]{10}$/))
        return "Valid 10-digit phone number is required";
    } else if (role === "seller") {
      if (!form.name.trim()) return "Owner name is required";
      if (!form.email.trim()) return "Email is required";
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        return "Valid email is required";
      if (form.password.length < 6)
        return "Password must be at least 6 characters";
      if (!form.businessName.trim()) return "Business name is required";
      if (!form.businessType) return "Business type is required";
      if (!form.gstNumber.trim()) return "GST number is required";
      if (
        !form.gstNumber.match(
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        )
      )
        return "Valid GST number is required";
      if (!form.contactNumber.match(/^[0-9]{10}$/))
        return "Valid 10-digit contact number is required";
      if (!form.businessAddress.trim()) return "Business address is required";
      if (!form.bankAccountNumber.match(/^[0-9]{9,18}$/))
        return "Valid bank account number is required";
      if (!form.bankAccountName.trim()) return "Bank account name is required";
      if (!form.bankIFSC.match(/^[A-Z]{4}0[A-Z0-9]{6}$/))
        return "Valid IFSC code is required";
    } else if (role === "contractor") {
      if (!form.name.trim()) return "Full name is required";
      if (!form.email.trim()) return "Email is required";
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        return "Valid email is required";
      if (form.password.length < 6)
        return "Password must be at least 6 characters";
      if (!form.phone.match(/^[0-9]{10}$/))
        return "Valid 10-digit phone number is required";
      if (!form.companyName.trim()) return "Company name is required";
      if (!form.contractorType) return "Contractor type is required";
      if (!form.experience || parseInt(form.experience) < 1)
        return "Experience must be at least 1 year";
      if (!form.licenseNumber.trim()) return "License number is required";
      if (!form.address.trim()) return "Address is required";
      if (form.specialties.length === 0)
        return "Please select at least one specialty";
      if (!form.teamSize) return "Team size is required";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const validationError = validateForm(activeTab);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // Correct endpoints as per your server.js
      let endpoint;
      if (activeTab === "contractor") {
        endpoint = `${API_URL}/contractor/auth/register`;
      } else if (activeTab === "seller") {
        endpoint = `${API_URL}/auth/seller/register`; // change if your seller route is different
      } else {
        endpoint = `${API_URL}/auth/user/register`;
      }

      const data =
        activeTab === "user"
          ? userForm
          : activeTab === "seller"
            ? sellerForm
            : contractorForm;

      console.log("Registering to:", endpoint);
      console.log("Payload:", data);

      const response = await axios.post(endpoint, data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.data.success) {
        let successMessage =
          response.data.message || "Registration successful!";

        if (activeTab === "contractor") {
          successMessage =
            "Contractor registered successfully! 🎉\nYour profile is under review. We'll notify you via email once approved.";
        } else if (activeTab === "seller") {
          successMessage =
            "Seller registration submitted! Awaiting admin approval.";
        }

        setSuccess(successMessage);

        // Auto-login for user & contractor
        if (activeTab === "user" || activeTab === "contractor") {
          const token = response.data.token;
          const userData = response.data.contractor || response.data.user;

          localStorage.setItem("token", token);
          localStorage.setItem("userRole", activeTab);
          localStorage.setItem("userData", JSON.stringify(userData));

          setTimeout(() => {
            navigate(`/${activeTab}/dashboard`);
          }, 2500);
        } else if (activeTab === "seller") {
          setTimeout(() => navigate("/login"), 3500);
        }
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err.response?.data?.message) errorMessage = err.response.data.message;
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
              <User className="w-4 h-4 mr-2 text-orange-600" />
              Full Name *
            </div>
          </label>
          <input
            type="text"
            name="name"
            value={userForm.name}
            onChange={handleUserChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
            placeholder="John Doe"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-orange-600" />
              Phone Number
            </div>
          </label>
          <input
            type="tel"
            name="phone"
            value={userForm.phone}
            onChange={handleUserChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
            placeholder="9876543210"
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-orange-600" />
            Email Address *
          </div>
        </label>
        <input
          type="email"
          name="email"
          value={userForm.email}
          onChange={handleUserChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
          placeholder="john@example.com"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-2 text-orange-600" />
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500 pr-12"
            placeholder="At least 6 characters"
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
              <User className="w-4 h-4 mr-2 text-orange-600" />
              Owner Name *
            </div>
          </label>
          <input
            type="text"
            name="name"
            value={sellerForm.name}
            onChange={handleSellerChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
            placeholder="John Doe"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Store className="w-4 h-4 mr-2 text-orange-600" />
              Business Name *
            </div>
          </label>
          <input
            type="text"
            name="businessName"
            value={sellerForm.businessName}
            onChange={handleSellerChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
            placeholder="ABC Enterprises"
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-orange-600" />
            Email Address *
          </div>
        </label>
        <input
          type="email"
          name="email"
          value={sellerForm.email}
          onChange={handleSellerChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
          placeholder="business@example.com"
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Lock className="w-4 h-4 mr-2 text-orange-600" />
              Password *
            </div>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={sellerForm.password}
              onChange={handleSellerChange}
              required
              minLength="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500 pr-12"
              placeholder="At least 6 characters"
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <PhoneCall className="w-4 h-4 mr-2 text-orange-600" />
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500 uppercase"
            placeholder="22ABCDE1234F1Z5"
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-2 text-orange-600" />
            Business Address *
          </div>
        </label>
        <textarea
          name="businessAddress"
          value={sellerForm.businessAddress}
          onChange={handleSellerChange}
          required
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500 resize-none"
          placeholder="Enter complete business address"
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-orange-600" />
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500 uppercase"
            placeholder="SBIN0000123"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );

  const renderContractorForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-orange-600" />
              Full Name *
            </div>
          </label>
          <input
            type="text"
            name="name"
            value={contractorForm.name}
            onChange={handleContractorChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
            placeholder="John Contractor"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-orange-600" />
              Phone Number *
            </div>
          </label>
          <input
            type="tel"
            name="phone"
            value={contractorForm.phone}
            onChange={handleContractorChange}
            required
            pattern="[0-9]{10}"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
            placeholder="9876543210"
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-orange-600" />
            Email Address *
          </div>
        </label>
        <input
          type="email"
          name="email"
          value={contractorForm.email}
          onChange={handleContractorChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
          placeholder="contractor@example.com"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-2 text-orange-600" />
            Password *
          </div>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={contractorForm.password}
            onChange={handleContractorChange}
            required
            minLength="6"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500 pr-12"
            placeholder="At least 6 characters"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-orange-600" />
              Company Name *
            </div>
          </label>
          <input
            type="text"
            name="companyName"
            value={contractorForm.companyName}
            onChange={handleContractorChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
            placeholder="ABC Construction Co."
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contractor Type *
          </label>
          <select
            name="contractorType"
            value={contractorForm.contractorType}
            onChange={handleContractorChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900"
            disabled={loading}
          >
            <option value="">Select Type</option>
            <option value="General Contractor">General Contractor</option>
            <option value="Specialty Contractor">Specialty Contractor</option>
            <option value="Subcontractor">Subcontractor</option>
            <option value="Builder">Builder</option>
            <option value="Civil Engineer">Civil Engineer</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-orange-600" />
              Experience (Years) *
            </div>
          </label>
          <input
            type="number"
            name="experience"
            value={contractorForm.experience}
            onChange={handleContractorChange}
            required
            min="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
            placeholder="5"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Number *
          </label>
          <input
            type="text"
            name="licenseNumber"
            value={contractorForm.licenseNumber}
            onChange={handleContractorChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
            placeholder="LIC-123456"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-orange-600" />
              Team Size *
            </div>
          </label>
          <select
            name="teamSize"
            value={contractorForm.teamSize}
            onChange={handleContractorChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900"
            disabled={loading}
          >
            <option value="">Select Size</option>
            <option value="1-5">1-5 People</option>
            <option value="5-20">5-20 People</option>
            <option value="20-50">20-50 People</option>
            <option value="50+">50+ People</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialties *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {contractorSpecialties.map((specialty) => (
            <button
              key={specialty}
              type="button"
              onClick={() => handleSpecialtyToggle(specialty)}
              className={`px-4 py-3 rounded-lg border text-left transition-all ${
                contractorForm.specialties.includes(specialty)
                  ? "bg-orange-50 border-orange-500 text-orange-700"
                  : "border-gray-300 text-gray-700 hover:border-orange-300 hover:bg-orange-50/50"
              }`}
              disabled={loading}
            >
              <div className="flex items-center">
                <CheckSquare
                  className={`w-4 h-4 mr-2 transition-opacity ${
                    contractorForm.specialties.includes(specialty) 
                      ? "text-orange-600 opacity-100" 
                      : "opacity-0"
                  }`}
                />
                {specialty}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Selected: {contractorForm.specialties.length} specialties
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-orange-600" />
            Address *
          </div>
        </label>
        <textarea
          name="address"
          value={contractorForm.address}
          onChange={handleContractorChange}
          required
          rows="2"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
          placeholder="Complete address"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-2 text-orange-600" />
            Website (Optional)
          </div>
        </label>
        <input
          type="url"
          name="website"
          value={contractorForm.website}
          onChange={handleContractorChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
          placeholder="https://yourcompany.com"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Projects Completed
        </label>
        <input
          type="number"
          name="projectsCompleted"
          value={contractorForm.projectsCompleted}
          onChange={handleContractorChange}
          min="0"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
          placeholder="0"
          disabled={loading}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full mb-4 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Join MIKB</h1>
          <p className="text-gray-600 mt-2">
            Choose your account type to get started
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-1">
            {["user", "seller", "contractor"].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setActiveTab(role);
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-4 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === role 
                    ? "bg-orange-600 text-white shadow-sm" 
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {role === "user" && <User size={18} />}
                  {role === "seller" && <Store size={18} />}
                  {role === "contractor" && <HardHat size={18} />}
                  <span className="capitalize">{role}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="md:flex">
            {/* Left Benefits Panel */}
            <div className="md:w-2/5 bg-gradient-to-b from-orange-600 to-orange-500 p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">
                {activeTab === "user"
                  ? "Customer Benefits"
                  : activeTab === "seller"
                    ? "Seller Benefits"
                    : "Contractor Benefits"}
              </h2>
              <ul className="space-y-4">
                {activeTab === "user" ? (
                  <>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Fast & secure checkout</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Personalized experience</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Order tracking</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Exclusive discounts</span>
                    </li>
                  </>
                ) : activeTab === "seller" ? (
                  <>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Reach millions of customers</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Secure payments</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Seller dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Dedicated support</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Bulk material access</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Portfolio showcase</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Connect with clients</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-white/90" />
                      <span>Professional network</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Right Form Panel */}
            <div className="md:w-3/5 p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
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
                {activeTab === "user"
                  ? renderUserForm()
                  : activeTab === "seller"
                    ? renderSellerForm()
                    : renderContractorForm()}

                <div className="mt-6">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 mr-3 h-4 w-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{" "}
                      <button
                        type="button"
                        className="text-orange-600 hover:underline"
                      >
                        Terms & Conditions
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        className="text-orange-600 hover:underline"
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-8 bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
                    `Create ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Account`
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-colors"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MIKB. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;