import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaBuilding, 
  FaCheckCircle, 
  FaMapMarkerAlt, 
  FaUser,
  FaShieldAlt,
  FaPhone,
  FaQuestionCircle,
  FaArrowRight,
  FaUniversity  // Use FaUniversity instead of FaBank
} from "react-icons/fa";

const SellerRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [gstOption, setGstOption] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [verificationData, setVerificationData] = useState({
    panNumber: "ABCPS1234M",
    nameAsPerPan: "Demo Construction Supplier",
    email: "demo@brickskart.com",
    mobile: "9876543210",
    state: "Maharashtra",
    pincode: "400001",
    district: "Mumbai",
    city: "Mumbai",
    buildingNumber: "123",
    street: "MG Road",
    captcha: "A7B3",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("123456");
  const [openFAQ, setOpenFAQ] = useState(null);
  const [pickupAddress, setPickupAddress] = useState({
    name: "Demo Construction Supplier",
    phone: "9876543210",
    pincode: "400001",
    address: "123, MG Road, Near Business Complex",
    city: "Mumbai",
    state: "Maharashtra",
  });
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "123456789012",
    confirmAccountNumber: "123456789012",
    ifscCode: "SBIN0001234",
    accountHolderName: "Demo Construction Supplier",
  });
  const [supplierDetails, setSupplierDetails] = useState({
    supplierName: "Demo Construction Supplier",
    email: "demo@brickskart.com",
    password: "demo123",
    confirmPassword: "demo123",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const faqs = [
    {
      question: "Which sellers can sell on Brick's Kart?",
      answer: "Any registered business dealing in construction materials can sell on Brick's Kart. You can register with or without GSTIN. Non-GST sellers can obtain an Enrolment ID/UIN easily.",
    },
    {
      question: "How can I obtain GSTIN No or Enrolment ID / UIN?",
      answer: "You can obtain it from the GST portal or our partner Vakilsearch can assist in obtaining a GSTIN. For Enrolment ID, we provide assistance during registration.",
    },
    {
      question: "What types of building materials can I sell?",
      answer: "You can sell all types of construction materials including cement, steel, bricks, tools, hardware, paints, electrical items, plumbing materials, and more.",
    },
    {
      question: "What are the commission rates?",
      answer: "Brick's Kart offers competitive commission rates starting from 5% depending on the product category. Contact our sales team for custom rates for bulk sellers.",
    },
  ];

  const steps = [
    { number: 1, label: "Business Type", icon: <FaBuilding /> },
    { number: 2, label: "KYC Verification", icon: <FaShieldAlt /> },
    { number: 3, label: "Warehouse Address", icon: <FaMapMarkerAlt /> },
    { number: 4, label: "Bank Details", icon: <FaUniversity /> }, // Changed from FaBank to FaUniversity
    { number: 5, label: "Account Setup", icon: <FaUser /> },
  ];

  const states = [
    "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", 
    "Gujarat", "West Bengal", "Rajasthan", "Punjab", "Haryana"
  ];

  // Static registration function
  const staticRegister = () => {
    const sellerData = {
      seller: {
        id: "BK-SELLER-" + Date.now(),
        email: supplierDetails.email,
        name: supplierDetails.supplierName,
        businessName: supplierDetails.supplierName,
        phone: pickupAddress.phone,
        address: `${pickupAddress.address}, ${pickupAddress.city}, ${pickupAddress.state} - ${pickupAddress.pincode}`,
        gstNumber: gstOption === "yes" ? gstNumber : "NON-GST-SELLER",
        sellerId: "BK-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
        revenue: "0",
        orders: 0,
        status: gstOption === "yes" ? "Verified" : "Pending Verification",
        joinDate: new Date().toISOString().split('T')[0],
        panNumber: verificationData.panNumber,
        bankDetails: {
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          accountHolderName: bankDetails.accountHolderName
        },
        warehouseAddress: pickupAddress
      },
      token: "bk_reg_token_" + Date.now(),
      role: "seller",
      isAuthenticated: true,
      registrationTime: new Date().toISOString()
    };

    // Store in localStorage for persistence
    localStorage.setItem("sellerSession", JSON.stringify(sellerData));
    localStorage.setItem("authToken", sellerData.token);

    return { success: true, data: sellerData };
  };

  const handleContinue = () => {
    if (currentStep === 1 && gstOption) {
      if (gstOption === "yes" && !gstNumber) {
        setError("GST Number is required");
        return;
      }
      // Set demo GST number if needed
      if (gstOption === "yes" && !gstNumber) {
        setGstNumber("27AABCU9603R1ZM");
      }
      setCurrentStep(2);
      setError("");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
      setSuccess("");
    }
  };

  const handleVerificationChange = (e) => {
    const { name, value } = e.target;
    setVerificationData({
      ...verificationData,
      [name]: value,
    });
  };

  const handleSendOtp = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      setSuccess("OTP sent successfully! Use: 123456");
      setError("");
    }, 800);
  };

  const handleVerifyOtp = async () => {
    if (otp === "123456") {
      setCurrentStep(3);
      setSuccess("OTP verified successfully!");
      setError("");
    } else {
      setError("Invalid OTP. Try: 123456");
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setPickupAddress({
      ...pickupAddress,
      [name]: value,
    });
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setBankDetails({
      ...bankDetails,
      [name]: value,
    });
  };

  const handleSupplierDetailsChange = (e) => {
    const { name, value } = e.target;
    setSupplierDetails({
      ...supplierDetails,
      [name]: value,
    });
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      handleSendOtp();
      setLoading(false);
    }, 500);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setCurrentStep(4);
    setSuccess("Warehouse address saved!");
  };

  const handleBankDetailsSubmit = async (e) => {
    e.preventDefault();
    if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
      setError("Account numbers don't match!");
      return;
    }
    setCurrentStep(5);
    setSuccess("Bank details saved!");
    setError("");
  };

  const handleSupplierDetailsSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (supplierDetails.password !== supplierDetails.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    
    setLoading(true);
    setError("");
    
    // Simulate registration process
    setTimeout(() => {
      // Call static registration function
      const registrationResult = staticRegister();
      
      if (registrationResult.success) {
        setLoading(false);
        setSuccess("Registration completed successfully! Redirecting to login...");
        
        // Show success message and redirect
        setTimeout(() => {
          navigate("/seller-login");
        }, 2000);
      } else {
        setLoading(false);
        setError("Registration failed. Please try again.");
      }
    }, 1500);
  };

  const handleDemoRegistration = () => {
    setGstOption("yes");
    setGstNumber("27AABCU9603R1ZM");
    // Auto-fill all steps
    setTimeout(() => {
      setCurrentStep(2);
      setSuccess("Demo data loaded. Proceed to KYC verification.");
    }, 300);
  };

  const handleSkipToLogin = () => {
    // Pre-fill demo credentials in localStorage for easy login
    const demoCredentials = {
      email: "demo@brickskart.com",
      password: "demo123"
    };
    localStorage.setItem("demoCredentials", JSON.stringify(demoCredentials));
    navigate("/seller-login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaBuilding className="text-3xl text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold">Brick's Kart</h1>
                <p className="text-gray-300 text-sm">Building Materials Marketplace</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-300 hover:text-white">
                Visit Marketplace
              </Link>
              <button
                onClick={handleSkipToLogin}
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                Already Registered? Login
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 -translate-y-1/2 z-10 transition-all duration-500"
              style={{ width: `${(currentStep - 1) * 25}%` }}
            ></div>
            
            {steps.map((step, index) => (
              <div key={step.number} className="relative z-20">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                  currentStep >= step.number 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg' 
                    : 'bg-white text-gray-400 border-gray-300'
                }`}>
                  {step.icon}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
                  <span className={`text-sm font-semibold whitespace-nowrap ${
                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Error/Success Messages */}
          {(error || success) && (
            <div className={`mb-6 p-4 rounded-lg ${
              error ? 'bg-red-50 border border-red-200 text-red-700' : 
              'bg-green-50 border border-green-200 text-green-700'
            }`}>
              <div className="flex items-center gap-2">
                {error ? '⚠️' : '✅'} 
                <span>{error || success}</span>
              </div>
            </div>
          )}

          {/* Demo Quick Start */}
          <div className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Demo Registration</h3>
                <p className="text-gray-600">Test the seller registration process with pre-filled demo data</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDemoRegistration}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                >
                  Start Demo Registration
                </button>
                <button
                  onClick={handleSkipToLogin}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                >
                  Skip to Login
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                {currentStep === 1 && (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Seller Journey</h2>
                      <p className="text-gray-600">Join India's largest building materials marketplace</p>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Do you have a GST number?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                          className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                            gstOption === "yes" 
                              ? 'border-orange-500 bg-orange-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setGstOption("yes")}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              gstOption === "yes" ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                            }`}>
                              {gstOption === "yes" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <h4 className="text-lg font-semibold">Yes, I have GST</h4>
                          </div>
                          <p className="text-gray-600 text-sm">
                            Enter your GSTIN to start selling across India with tax compliance
                          </p>
                        </div>

                        <div
                          className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                            gstOption === "no" 
                              ? 'border-orange-500 bg-orange-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setGstOption("no")}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              gstOption === "no" ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                            }`}>
                              {gstOption === "no" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <h4 className="text-lg font-semibold">No GST</h4>
                          </div>
                          <p className="text-gray-600 text-sm">
                            Sell without GST! Get Enrolment ID in minutes
                            <span className="inline-block ml-2 text-orange-500 font-semibold">⚡ Fast Approval</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {gstOption === "yes" && (
                      <div className="mb-8 bg-gray-50 rounded-xl p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          GST Number*
                        </label>
                        <input
                          type="text"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="e.g., 27AABCU9603R1ZM"
                        />
                        <p className="text-xs text-gray-500 mt-2">Demo GST: 27AABCU9603R1ZM</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={handleContinue}
                        disabled={!gstOption || (gstOption === "yes" && !gstNumber)}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                          gstOption && (gstOption === "yes" ? gstNumber : true)
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Continue
                        <FaArrowRight className="inline ml-2" />
                      </button>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Verification</h2>
                    <p className="text-gray-600 mb-6">Enter your business details for verification</p>

                    {!otpSent ? (
                      <form onSubmit={handleVerificationSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              PAN Number*
                            </label>
                            <input
                              type="text"
                              name="panNumber"
                              value={verificationData.panNumber}
                              onChange={handleVerificationChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Name as per PAN*
                            </label>
                            <input
                              type="text"
                              name="nameAsPerPan"
                              value={verificationData.nameAsPerPan}
                              onChange={handleVerificationChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Email Address*
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={verificationData.email}
                              onChange={handleVerificationChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Mobile Number*
                            </label>
                            <input
                              type="tel"
                              name="mobile"
                              value={verificationData.mobile}
                              onChange={handleVerificationChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-4">Business Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                State*
                              </label>
                              <select
                                name="state"
                                value={verificationData.state}
                                onChange={handleVerificationChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              >
                                <option value="">Select State</option>
                                {states.map(state => (
                                  <option key={state} value={state}>{state}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Pincode*
                              </label>
                              <input
                                type="text"
                                name="pincode"
                                value={verificationData.pincode}
                                onChange={handleVerificationChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t">
                          <button
                            type="button"
                            onClick={handleBack}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700"
                            disabled={loading}
                          >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                          <div className="flex items-center gap-3 mb-3">
                            <FaShieldAlt className="text-blue-500 text-xl" />
                            <h3 className="text-lg font-semibold">Verify OTP</h3>
                          </div>
                          <p className="text-gray-600 mb-4">
                            OTP sent to your mobile number. Use: <span className="font-bold">123456</span>
                          </p>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 mb-4"
                            placeholder="Enter 6-digit OTP"
                          />
                          <div className="flex justify-between">
                            <button
                              onClick={handleBack}
                              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                              Back
                            </button>
                            <button
                              onClick={handleVerifyOtp}
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700"
                            >
                              Verify OTP
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Warehouse Address</h2>
                    <p className="text-gray-600 mb-6">Where should we pick up your construction materials from?</p>

                    <form onSubmit={handleAddressSubmit}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Contact Person*
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={pickupAddress.name}
                              onChange={handleAddressChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Phone Number*
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={pickupAddress.phone}
                              onChange={handleAddressChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Complete Address*
                          </label>
                          <textarea
                            name="address"
                            value={pickupAddress.address}
                            onChange={handleAddressChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            rows="3"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Pincode*
                            </label>
                            <input
                              type="text"
                              name="pincode"
                              value={pickupAddress.pincode}
                              onChange={handleAddressChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              City*
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={pickupAddress.city}
                              onChange={handleAddressChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              State*
                            </label>
                            <select
                              name="state"
                              value={pickupAddress.state}
                              onChange={handleAddressChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="">Select State</option>
                              {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-6 border-t mt-6">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700"
                        >
                          Save & Continue
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Details</h2>
                    <p className="text-gray-600 mb-6">Enter your bank account details for payments</p>

                    <form onSubmit={handleBankDetailsSubmit}>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Account Number*
                          </label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={bankDetails.accountNumber}
                            onChange={handleBankDetailsChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm Account Number*
                          </label>
                          <input
                            type="text"
                            name="confirmAccountNumber"
                            value={bankDetails.confirmAccountNumber}
                            onChange={handleBankDetailsChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              IFSC Code*
                            </label>
                            <input
                              type="text"
                              name="ifscCode"
                              value={bankDetails.ifscCode}
                              onChange={handleBankDetailsChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Account Holder Name*
                            </label>
                            <input
                              type="text"
                              name="accountHolderName"
                              value={bankDetails.accountHolderName}
                              onChange={handleBankDetailsChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-6 border-t mt-6">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700"
                        >
                          Save & Continue
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {currentStep === 5 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Setup</h2>
                    <p className="text-gray-600 mb-6">Create your seller account credentials</p>

                    <form onSubmit={handleSupplierDetailsSubmit}>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Business Name*
                          </label>
                          <input
                            type="text"
                            name="supplierName"
                            value={supplierDetails.supplierName}
                            onChange={handleSupplierDetailsChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address*
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={supplierDetails.email}
                            onChange={handleSupplierDetailsChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Password*
                            </label>
                            <input
                              type="password"
                              name="password"
                              value={supplierDetails.password}
                              onChange={handleSupplierDetailsChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Confirm Password*
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={supplierDetails.confirmPassword}
                              onChange={handleSupplierDetailsChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
                        <h3 className="font-semibold text-gray-900 mb-2">Demo Credentials</h3>
                        <p className="text-gray-600 text-sm">
                          Use email: <span className="font-bold">demo@brickskart.com</span> and password: <span className="font-bold">demo123</span>
                        </p>
                      </div>

                      <div className="flex justify-between pt-6 border-t mt-6">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                            loading
                              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg'
                          }`}
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Creating Account...
                            </span>
                          ) : (
                            'Complete Registration'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - FAQs & Support */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaQuestionCircle className="text-orange-500" />
                    Seller FAQs
                  </h3>
                  <div className="space-y-4">
                    {faqs.map((faq, i) => (
                      <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                        <button
                          className="flex justify-between w-full text-left"
                          onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                        >
                          <span className="font-medium text-gray-800">{faq.question}</span>
                          <span className="text-gray-500">{openFAQ === i ? '−' : '+'}</span>
                        </button>
                        {openFAQ === i && (
                          <p className="text-gray-600 text-sm mt-2">{faq.answer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaPhone className="text-orange-400" />
                    <h3 className="text-lg font-bold">Need Help?</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-300 text-sm">Seller Support</p>
                      <p className="text-xl font-bold">1800-XXX-XXXX</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Email Support</p>
                      <p className="font-medium">support@brickskart.com</p>
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-sm">Working hours: 9 AM - 9 PM, 7 days a week</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Why Choose Brick's Kart?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-500 mt-1" />
                      <span className="text-sm">Pan-India reach to construction professionals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-500 mt-1" />
                      <span className="text-sm">Secure payments with 7-day settlements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-500 mt-1" />
                      <span className="text-sm">Dedicated logistics support for heavy materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-500 mt-1" />
                      <span className="text-sm">Competitive commission rates from 5%</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-12 w-12 text-orange-500 mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-gray-700 font-semibold">Processing your registration...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerRegistration;