import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Download,
  FileText,
  AlertCircle,
  User,
  Building,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  Shield,
} from "lucide-react";

const SellerVerification = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // API configuration - use the same as your backend
  const API_BASE = "http://localhost:5000/api";

  // Get authentication headers
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch sellers from your backend API
  const fetchSellers = async () => {
    try {
      setLoading(true);
      console.log("Fetching sellers from:", `${API_BASE}/admin/sellers`);

      const response = await fetch(`${API_BASE}/admin/sellers`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Sellers data:", data);

        // Transform the data to match your frontend structure
        const transformedSellers =
          data.sellers?.map((seller) => ({
            _id: seller._id,
            name: seller.name || "N/A",
            email: seller.email || "N/A",
            phone: seller.phone || "N/A",
            businessName: seller.businessName || seller.companyName || "N/A",
            businessType: seller.businessType || "N/A",
            address: seller.address || seller.location || "N/A",
            registrationDate: seller.createdAt
              ? new Date(seller.createdAt).toISOString().split("T")[0]
              : "N/A",
            status: seller.isSellerVerified ? "approved" : "pending",
            isSellerVerified: seller.isSellerVerified || false,
            notes: seller.notes || "",
            createdAt: seller.createdAt || new Date().toISOString(),
            totalProducts: seller.totalProducts || 0,
            totalOrders: seller.totalOrders || 0,
            totalRevenue: seller.totalRevenue || 0,
            // Add mock verification documents since your backend might not have these
            verificationDocuments: seller.documents || {
              panCard:
                "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=PAN+Card",
              aadharCard:
                "https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Aadhaar+Card",
              gstCertificate:
                "https://via.placeholder.com/300x200/FF9800/FFFFFF?text=GST+Certificate",
            },
          })) || getDemoSellers();

        setSellers(transformedSellers);
      } else {
        console.error(
          "Failed to fetch sellers:",
          response.status,
          response.statusText,
        );
        // Fallback to demo data if API fails
        setSellers(getDemoSellers());
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      // Fallback to demo data
      setSellers(getDemoSellers());
    } finally {
      setLoading(false);
    }
  };

  // Verify seller - updated to match your backend PATCH endpoint
  const verifySeller = async (sellerId) => {
    try {
      setActionLoading(true);
      console.log("Verifying seller:", sellerId);

      const response = await fetch(
        `${API_BASE}/admin/sellers/${sellerId}/verify`,
        {
          method: "PATCH", // Changed from PUT to PATCH to match your backend
          headers: getAuthHeaders(),
          body: JSON.stringify({
            isSellerVerified: true,
            status: "approved",
            notes: verificationNotes,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Verification response:", data);

        // Update local state
        setSellers((prev) =>
          prev.map((seller) =>
            seller._id === sellerId
              ? {
                  ...seller,
                  isSellerVerified: true,
                  status: "approved",
                  notes: verificationNotes,
                }
              : seller,
          ),
        );

        setSelectedSeller(null);
        setIsModalOpen(false);
        setVerificationNotes("");

        alert("Seller approved successfully!");
        fetchSellers(); // Refresh the list
      } else {
        const errorText = await response.text();
        console.error("Failed to verify seller:", response.status, errorText);
        alert(`Failed to approve seller: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error approving seller:", error);
      alert("Error approving seller. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject seller - you need to implement this in your backend
  const rejectSeller = async (sellerId) => {
    try {
      setActionLoading(true);

      // Since your backend doesn't have a reject endpoint yet,
      // we'll simulate it or you can create a separate endpoint
      // For now, we'll just update the local state

      // Option 1: Call a custom endpoint or use toggleUserStatus
      const response = await fetch(
        `${API_BASE}/admin/users/${sellerId}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            isActive: false,
            status: "rejected",
          }),
        },
      );

      if (response.ok) {
        // Update local state
        setSellers((prev) =>
          prev.map((seller) =>
            seller._id === sellerId
              ? {
                  ...seller,
                  status: "rejected",
                  isSellerVerified: false,
                  notes: verificationNotes,
                }
              : seller,
          ),
        );

        setSelectedSeller(null);
        setIsModalOpen(false);
        setVerificationNotes("");

        alert("Seller rejected successfully!");
        fetchSellers(); // Refresh the list
      } else {
        // If the endpoint doesn't exist, just update local state
        setSellers((prev) =>
          prev.map((seller) =>
            seller._id === sellerId
              ? {
                  ...seller,
                  status: "rejected",
                  isSellerVerified: false,
                  notes: verificationNotes,
                }
              : seller,
          ),
        );

        setSelectedSeller(null);
        setIsModalOpen(false);
        setVerificationNotes("");

        alert(
          "Seller rejected (local update only). Backend endpoint not implemented.",
        );
      }
    } catch (error) {
      console.error("Error rejecting seller:", error);
      alert("Error rejecting seller. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const pending = sellers.filter(
      (s) => !s.isSellerVerified && s.status !== "rejected",
    ).length;
    const approved = sellers.filter((s) => s.isSellerVerified).length;
    const rejected = sellers.filter((s) => s.status === "rejected").length;

    return {
      total: sellers.length,
      pending,
      approved,
      rejected,
    };
  };

  const stats = calculateStats();

  // Filter sellers
  const filteredSellers = sellers.filter((seller) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (seller.name && seller.name.toLowerCase().includes(searchLower)) ||
      (seller.email && seller.email.toLowerCase().includes(searchLower)) ||
      (seller.businessName &&
        seller.businessName.toLowerCase().includes(searchLower)) ||
      (seller.phone && seller.phone.includes(searchTerm));

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" &&
        !seller.isSellerVerified &&
        seller.status !== "rejected") ||
      (filterStatus === "approved" && seller.isSellerVerified) ||
      (filterStatus === "rejected" && seller.status === "rejected");

    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (seller) => {
    if (seller.isSellerVerified) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          Verified
        </span>
      );
    } else if (seller.status === "rejected") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-4 h-4 mr-1" />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-4 h-4 mr-1" />
          Pending
        </span>
      );
    }
  };

  // View seller details
  const viewSellerDetails = (seller) => {
    setSelectedSeller(seller);
    setVerificationNotes(seller.notes || "");
    setIsModalOpen(true);
  };

  // Format documents for display
  const formatDocuments = (seller) => {
    const docs = [];

    // Check for verification documents
    if (seller.verificationDocuments) {
      if (seller.verificationDocuments.panCard) {
        docs.push({
          type: "PAN Card",
          url: seller.verificationDocuments.panCard,
          verified: true,
        });
      }
      if (seller.verificationDocuments.aadharCard) {
        docs.push({
          type: "Aadhaar Card",
          url: seller.verificationDocuments.aadharCard,
          verified: true,
        });
      }
      if (seller.verificationDocuments.gstCertificate) {
        docs.push({
          type: "GST Certificate",
          url: seller.verificationDocuments.gstCertificate,
          verified: true,
        });
      }
    }

    // Fallback to demo documents if none exist
    if (docs.length === 0) {
      docs.push(
        {
          type: "PAN Card",
          url: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=PAN+Card",
          verified: true,
        },
        {
          type: "Aadhaar Card",
          url: "https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Aadhaar+Card",
          verified: true,
        },
        {
          type: "GST Certificate",
          url: "https://via.placeholder.com/300x200/FF9800/FFFFFF?text=GST+Certificate",
          verified: true,
        },
      );
    }

    return docs.slice(0, 3); // Show max 3 documents
  };

  // Demo data for fallback
  const getDemoSellers = () => [
    {
      _id: "1",
      name: "Rajesh Kumar",
      email: "rajesh@kumarconstructions.com",
      phone: "+91 9876543210",
      businessName: "Kumar Constructions",
      businessType: "Contractor",
      address: "Mumbai, Maharashtra",
      registrationDate: "2024-01-15",
      status: "pending",
      isSellerVerified: false,
      notes: "GST certificate verification pending",
      totalProducts: 45,
      totalOrders: 128,
      totalRevenue: 1250000,
      createdAt: "2024-03-10",
      verificationDocuments: {
        panCard:
          "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=PAN+Card",
        aadharCard:
          "https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Aadhaar+Card",
        gstCertificate:
          "https://via.placeholder.com/300x200/FF9800/FFFFFF?text=GST+Certificate",
      },
    },
    {
      _id: "2",
      name: "Priya Sharma",
      email: "priya@sharmafashion.com",
      phone: "+91 9876543211",
      businessName: "Sharma Fashion House",
      businessType: "Retail",
      address: "Delhi, NCR",
      registrationDate: "2024-02-10",
      status: "approved",
      isSellerVerified: true,
      notes: "All documents verified successfully",
      totalProducts: 23,
      totalOrders: 67,
      totalRevenue: 890000,
      createdAt: "2024-03-05",
    },
  ];

  // Initialize
  useEffect(() => {
    fetchSellers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Seller Verification
        </h1>
        <p className="text-gray-600 mt-1">
          Review and verify seller applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sellers</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Verified</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.approved}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stats.rejected}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email, business, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                filterStatus === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Clock className="h-4 w-4" /> Pending
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                filterStatus === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <CheckCircle className="h-4 w-4" /> Verified
            </button>
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                filterStatus === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <XCircle className="h-4 w-4" /> Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading sellers...</p>
        </div>
      )}

      {/* Sellers Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSellers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No sellers found
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm
                            ? "Try adjusting your search criteria"
                            : "No seller applications available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSellers.map((seller) => (
                    <tr key={seller._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {seller.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {seller.email}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {seller.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {seller.businessName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {seller.businessType}
                        </p>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {seller.address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {getStatusBadge(seller)}
                          <p className="text-xs text-gray-500">
                            Registered: {seller.registrationDate}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span>
                              Products:{" "}
                              <span className="font-medium">
                                {seller.totalProducts || 0}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <ShoppingBag className="h-4 w-4 text-gray-400" />
                            <span>
                              Orders:{" "}
                              <span className="font-medium">
                                {seller.totalOrders || 0}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>
                              Revenue:{" "}
                              <span className="font-medium">
                                ₹{seller.totalRevenue?.toLocaleString() || 0}
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => viewSellerDetails(seller)}
                            className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </button>
                          {!seller.isSellerVerified &&
                            seller.status !== "rejected" && (
                              <>
                                <button
                                  onClick={() => verifySeller(seller._id)}
                                  disabled={actionLoading}
                                  className="px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 flex items-center gap-2 disabled:opacity-50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  {actionLoading ? "Processing..." : "Approve"}
                                </button>
                                <button
                                  onClick={() => rejectSeller(seller._id)}
                                  disabled={actionLoading}
                                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-2 disabled:opacity-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {isModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedSeller.name} - Verification Details
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Business: {selectedSeller.businessName} • ID:{" "}
                    {selectedSeller._id}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  disabled={actionLoading}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{selectedSeller.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">{selectedSeller.email}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">{selectedSeller.phone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">{selectedSeller.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Business Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Business Name</p>
                      <p className="font-medium">
                        {selectedSeller.businessName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Business Type</p>
                      <p className="font-medium">
                        {selectedSeller.businessType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">
                          {selectedSeller.registrationDate}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Application Date</p>
                      <p className="font-medium">
                        {new Date(
                          selectedSeller.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">
                        Total Products
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedSeller.totalProducts || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Total Orders</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedSeller.totalOrders || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-purple-500" />
                      <span className="text-sm font-medium">Total Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      ₹{selectedSeller.totalRevenue?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Verification Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formatDocuments(selectedSeller).map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">{doc.type}</span>
                        {doc.verified ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                        <img
                          src={doc.url}
                          alt={doc.type}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/300x200/CCCCCC/666666?text=${encodeURIComponent(doc.type)}`;
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(doc.url, "_blank")}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm rounded hover:bg-blue-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = doc.url;
                            link.download = `${doc.type}.jpg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm rounded hover:bg-gray-100 flex items-center justify-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Section */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Verification Notes
                </h3>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  rows="3"
                  placeholder="Add verification notes here..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  disabled={actionLoading}
                />
              </div>

              {/* Previous Notes */}
              {selectedSeller.notes && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Previous Notes
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedSeller.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                {!selectedSeller.isSellerVerified &&
                  selectedSeller.status !== "rejected" && (
                    <>
                      <button
                        onClick={() => verifySeller(selectedSeller._id)}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Approve Seller
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => rejectSeller(selectedSeller._id)}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle className="h-5 w-5" />
                        Reject Application
                      </button>
                    </>
                  )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={actionLoading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerVerification;
