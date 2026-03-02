import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Filter,
  Shield,
} from "lucide-react";

const SellerVerificationDashboard = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");

  // Use direct URL instead of process.env
  const API_BASE = "https://bricks-backend-qyea.onrender.com/api";

  // Fetch all sellers
  const fetchSellers = async () => {
    try {
      setLoading(true);
      // For demo purposes - replace with actual API call
      // const response = await axios.get(`${API_BASE}/admin/sellers`, {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   }
      // });

      // Simulate API call with demo data
      setTimeout(() => {
        const demoData = getDemoData();
        setSellers(demoData);
        calculateStats(demoData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      const demoData = getDemoData();
      setSellers(demoData);
      calculateStats(demoData);
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (sellersList) => {
    const stats = {
      total: sellersList.length,
      pending: sellersList.filter(
        (s) => s.status === "pending" || s.status === "under_review",
      ).length,
      approved: sellersList.filter(
        (s) => s.status === "approved" || s.status === "active",
      ).length,
      rejected: sellersList.filter(
        (s) => s.status === "rejected" || s.status === "suspended",
      ).length,
    };
    // You can set stats state if you have one
  };

  // Verify seller
  const verifySeller = async (sellerId) => {
    try {
      // For demo - replace with actual API call
      // const response = await axios.put(
      //   `${API_BASE}/admin/sellers/${sellerId}/verify`,
      //   { status: 'approved', notes: verificationNotes },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${localStorage.getItem('token')}`
      //     }
      //   }
      // );

      // Simulate API call
      setTimeout(() => {
        // Update local state
        setSellers((prev) =>
          prev.map((seller) =>
            seller._id === sellerId
              ? { ...seller, status: "approved", notes: verificationNotes }
              : seller,
          ),
        );

        setSelectedSeller(null);
        setIsModalOpen(false);
        setVerificationNotes("");

        alert("Seller approved successfully!");
      }, 500);
    } catch (error) {
      console.error("Error approving seller:", error);
      alert("Failed to approve seller. Please try again.");
    }
  };

  // Reject seller
  const rejectSeller = async (sellerId) => {
    try {
      // For demo - replace with actual API call
      // const response = await axios.put(
      //   `${API_BASE}/admin/sellers/${sellerId}/verify`,
      //   { status: 'rejected', notes: verificationNotes },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${localStorage.getItem('token')}`
      //     }
      //   }
      // );

      // Simulate API call
      setTimeout(() => {
        // Update local state
        setSellers((prev) =>
          prev.map((seller) =>
            seller._id === sellerId
              ? { ...seller, status: "rejected", notes: verificationNotes }
              : seller,
          ),
        );

        setSelectedSeller(null);
        setIsModalOpen(false);
        setVerificationNotes("");

        alert("Seller rejected successfully!");
      }, 500);
    } catch (error) {
      console.error("Error rejecting seller:", error);
      alert("Failed to reject seller. Please try again.");
    }
  };

  // Filter sellers based on search and status
  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      searchTerm === "" ||
      seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.phone?.includes(searchTerm);

    const matchesStatus =
      filterStatus === "all" || seller.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats for display
  const stats = {
    total: sellers.length,
    pending: sellers.filter(
      (s) => s.status === "pending" || s.status === "under_review",
    ).length,
    approved: sellers.filter(
      (s) => s.status === "approved" || s.status === "active",
    ).length,
    rejected: sellers.filter(
      (s) => s.status === "rejected" || s.status === "suspended",
    ).length,
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
      case "active":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case "rejected":
      case "suspended":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      case "pending":
      case "under_review":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
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

  // Download document
  const downloadDocument = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Demo data for testing
  const getDemoData = () => [
    {
      _id: "1",
      name: "Rajesh Kumar",
      email: "rajesh@kumarconstructions.com",
      phone: "+91 9876543210",
      businessName: "Kumar Constructions",
      businessType: "Contractor",
      address: "123, Main Street, Mumbai, Maharashtra",
      registrationDate: "2024-01-15",
      status: "pending",
      documents: [
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
          verified: false,
        },
        {
          type: "Business License",
          url: "https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Business+License",
          verified: true,
        },
      ],
      notes: "GST certificate verification pending",
      createdAt: "2024-03-10T10:30:00Z",
    },
    {
      _id: "2",
      name: "Priya Sharma",
      email: "priya@sharmafashion.com",
      phone: "+91 9876543211",
      businessName: "Sharma Fashion House",
      businessType: "Retail",
      address: "456, Connaught Place, Delhi",
      registrationDate: "2024-02-10",
      status: "approved",
      documents: [
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
      ],
      notes: "All documents verified successfully",
      createdAt: "2024-03-05T14:20:00Z",
    },
    {
      _id: "3",
      name: "Arun Patel",
      email: "arun@pateltech.com",
      phone: "+91 9876543212",
      businessName: "Patel Tech Solutions",
      businessType: "IT Services",
      address: "789, MG Road, Bangalore",
      registrationDate: "2024-01-28",
      status: "rejected",
      documents: [
        {
          type: "PAN Card",
          url: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=PAN+Card",
          verified: true,
        },
        {
          type: "Aadhaar Card",
          url: "https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Aadhaar+Card",
          verified: false,
        },
        {
          type: "GST Certificate",
          url: "https://via.placeholder.com/300x200/FF9800/FFFFFF?text=GST+Certificate",
          verified: true,
        },
      ],
      notes: "Aadhaar verification failed",
      createdAt: "2024-03-12T09:15:00Z",
    },
    {
      _id: "4",
      name: "Meena Singh",
      email: "meena@singhfoods.com",
      phone: "+91 9876543213",
      businessName: "Singh Foods & Catering",
      businessType: "Food Services",
      address: "321, Koregaon Park, Pune",
      registrationDate: "2024-03-01",
      status: "pending",
      documents: [
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
          type: "FSSAI License",
          url: "https://via.placeholder.com/300x200/FF5722/FFFFFF?text=FSSAI+License",
          verified: false,
        },
      ],
      notes: "FSSAI license verification pending",
      createdAt: "2024-03-15T11:45:00Z",
    },
  ];

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
              <p className="text-sm text-gray-500 font-medium">Approved</p>
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
              <CheckCircle className="h-4 w-4" /> Approved
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
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                        <div className="flex flex-wrap gap-1">
                          {seller.documents?.map((doc, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                                doc.verified
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {doc.verified ? (
                                <Check className="h-3 w-3 mr-1" />
                              ) : (
                                <X className="h-3 w-3 mr-1" />
                              )}
                              {doc.type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(seller.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          Registered:{" "}
                          {new Date(
                            seller.registrationDate,
                          ).toLocaleDateString()}
                        </p>
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
                          {seller.status === "pending" && (
                            <>
                              <button
                                onClick={() => verifySeller(seller._id)}
                                className="px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => rejectSeller(seller._id)}
                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-2"
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
                    Business: {selectedSeller.businessName} • Status:{" "}
                    {selectedSeller.status}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
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
                          {new Date(
                            selectedSeller.registrationDate,
                          ).toLocaleDateString()}
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

              {/* Documents Section */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Verification Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedSeller.documents?.map((doc, index) => (
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
                          onClick={() =>
                            downloadDocument(doc.url, `${doc.type}.jpg`)
                          }
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add verification notes here..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
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
                {selectedSeller.status === "pending" && (
                  <>
                    <button
                      onClick={() => verifySeller(selectedSeller._id)}
                      className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Approve Seller
                    </button>
                    <button
                      onClick={() => rejectSeller(selectedSeller._id)}
                      className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject Application
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
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

export default SellerVerificationDashboard;
