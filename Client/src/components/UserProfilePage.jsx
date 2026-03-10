// src/components/UserProfilePage.jsx
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  ShoppingBag,
  Package,
  CreditCard,
  LogOut,
  Shield,
  Clock,
  CheckCircle,
  Home,
  Building,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

// Automatic API URL - Local ya Production detect karega
const API_URL = "http://localhost:5000/api";

const UserProfilePage = () => {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth header with token
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["profile", "addresses", "orders", "payments"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }

    fetchUserData();
    if (tabParam === "addresses") {
      fetchAddresses();
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "addresses") {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await axios.get(`${API_URL}/auth/me`, getAuthHeader());

      if (response.data.success) {
        setUser(response.data.user);
        setProfileData({
          name: response.data.user.name || "",
          email: response.data.user.email || "",
          phone: response.data.user.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/user/addresses`,
        getAuthHeader(),
      );

      if (response.data.success) {
        setAddresses(response.data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setError("Failed to load addresses.");
    }
  };

  const handleProfileUpdate = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await axios.put(
        `${API_URL}/user/profile`,
        profileData,
        getAuthHeader(),
      );

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setEditing(false);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAddress = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await axios.post(
        `${API_URL}/user/addresses`,
        newAddress,
        getAuthHeader(),
      );

      if (response.data.success) {
        setAddresses(response.data.addresses);
        setNewAddress({
          fullName: "",
          phone: "",
          addressLine: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
          isDefault: false,
        });
        setShowAddressForm(false);
        setSuccess("Address added successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error adding address:", error);
      setError(
        error.response?.data?.message ||
          "Failed to add address. Please check all fields.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      const response = await axios.delete(
        `${API_URL}/user/addresses/${addressId}`,
        getAuthHeader(),
      );

      if (response.data.success) {
        setAddresses(response.data.addresses);
        setSuccess("Address deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      setError("Failed to delete address.");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/user/addresses/${addressId}/default`,
        {},
        getAuthHeader(),
      );

      if (response.data.success) {
        setAddresses(response.data.addresses);
        setSuccess("Default address updated!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      setError("Failed to update default address.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const validateAddress = () => {
    if (!newAddress.fullName.trim()) return "Full name is required";
    if (!newAddress.phone.match(/^[0-9]{10}$/))
      return "Valid 10-digit phone number is required";
    if (!newAddress.addressLine.trim()) return "Address line is required";
    if (!newAddress.city.trim()) return "City is required";
    if (!newAddress.state.trim()) return "State is required";
    if (!newAddress.pincode.match(/^[0-9]{6}$/))
      return "Valid 6-digit pincode is required";
    return null;
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="md:w-3/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-6"></div>
              <div className="space-y-4">
                <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl shadow-lg flex items-center animate-slideIn">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl shadow-lg flex items-center animate-slideIn">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.name || "User"}
                  </h2>
                  <p className="text-gray-600 text-sm">{user?.email}</p>
                  <div className="flex items-center mt-1">
                    <Shield className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 font-medium">
                      Verified User
                    </span>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: "profile", icon: User, label: "Profile" },
                  { id: "addresses", icon: MapPin, label: "Addresses" },
                  { id: "orders", icon: Package, label: "My Orders" },
                  { id: "payments", icon: CreditCard, label: "Payments" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === item.id
                        ? "bg-orange-50 text-orange-600 border-l-4 border-orange-600 font-semibold"
                        : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <button
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all duration-300"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>

            {/* Account Overview */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl shadow-lg p-6 text-white">
              <h3 className="font-semibold mb-4 text-lg">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-orange-100">Member Since</span>
                  <span className="font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-100">Last Login</span>
                  <span className="font-medium">
                    {user?.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-100">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:w-3/4">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Personal Information
                    </h2>
                    <button
                      onClick={() => setEditing(!editing)}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        editing
                          ? "text-gray-600 hover:bg-gray-100"
                          : "text-orange-600 hover:bg-orange-50"
                      }`}
                    >
                      {editing ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-orange-600" />
                          Full Name
                        </div>
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium text-lg">
                          {user?.name || "Not set"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-orange-600" />
                          Email Address
                        </div>
                      </label>
                      {editing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500"
                        />
                      ) : (
                        <p className="text-gray-900">{user?.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-orange-600" />
                          Phone Number
                        </div>
                      </label>
                      {editing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-gray-900"
                          placeholder="Enter 10-digit phone number"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {user?.phone || "Not provided"}
                        </p>
                      )}
                    </div>

                    {editing && (
                      <div className="pt-6 border-t border-gray-200">
                        <button
                          onClick={handleProfileUpdate}
                          disabled={isSubmitting}
                          className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-lg"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      My Addresses
                    </h2>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Add New Address
                    </button>
                  </div>
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                  <div className="p-6 border-b border-gray-200 bg-orange-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Add New Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newAddress.fullName}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={newAddress.phone}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          placeholder="10-digit number"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line *
                        </label>
                        <input
                          type="text"
                          value={newAddress.addressLine}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              addressLine: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          placeholder="House number, street, area"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              city: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              state: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={newAddress.pincode}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              pincode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          placeholder="6-digit pincode"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={newAddress.country}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          id="default"
                          checked={newAddress.isDefault}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              isDefault: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                        />
                        <label
                          htmlFor="default"
                          className="ml-2 text-sm text-gray-700"
                        >
                          Set as default address
                        </label>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => {
                          const validationError = validateAddress();
                          if (validationError) {
                            setError(validationError);
                            return;
                          }
                          handleAddAddress();
                        }}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-lg"
                      >
                        {isSubmitting ? "Adding..." : "Save Address"}
                      </button>
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Addresses List */}
                <div className="p-6">
                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No addresses saved
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Add your first address to get started
                      </p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-sm hover:shadow-lg"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className={`border rounded-xl p-5 transition-all ${
                            address.isDefault
                              ? "border-orange-600 border-2 bg-orange-50 shadow-md"
                              : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center flex-wrap gap-2">
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {address.fullName}
                                </h3>
                                {address.isDefault && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-600 text-white">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center mt-1 text-gray-600">
                                <Phone className="h-3 w-3 mr-1" />
                                <span className="text-sm">{address.phone}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(address._id)}
                                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddress(address._id)}
                                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 mt-3">
                            <div className="flex items-start">
                              <Home className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                              <p className="text-gray-700">
                                {address.addressLine}
                              </p>
                            </div>
                            <div className="flex items-start">
                              <Building className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                              <p className="text-gray-700">
                                {address.city}, {address.state} -{" "}
                                {address.pincode}
                              </p>
                            </div>
                            <p className="text-gray-600 text-sm">
                              {address.country}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
                </div>
                <div className="p-12 text-center">
                  <Package className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No orders yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start shopping to see your orders here
                  </p>
                  <button
                    onClick={() => (window.location.href = "/products")}
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-sm hover:shadow-lg"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Start Shopping
                  </button>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Payment Methods
                  </h2>
                </div>
                <div className="p-12 text-center">
                  <CreditCard className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No saved payment methods
                  </h3>
                  <p className="text-gray-600">
                    Add payment methods during checkout for faster transactions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;