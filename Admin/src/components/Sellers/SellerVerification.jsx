import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  User,
  Building,
  Calendar,
  Shield,
} from "lucide-react";

const SellerVerification = () => {
  /* ---------------- DEMO DATA ---------------- */
  const demoData = [
    {
      id: "SELL001",
      name: "Rajesh Kumar",
      email: "rajesh@kumarconstructions.com",
      phone: "+91 9876543210",
      businessName: "Kumar Constructions",
      businessType: "Contractor",
      address: "Mumbai, Maharashtra",
      registrationDate: "2024-01-15",
      submittedDate: "2024-03-10",
      status: "pending",
      documents: [
        { name: "GST Certificate", verified: true },
        { name: "PAN Card", verified: true },
        { name: "Aadhaar Card", verified: false },
        { name: "Business License", verified: true },
      ],
      rating: 4.5,
      totalSales: 1250000,
      notes: "Requires Aadhaar verification",
    },
    {
      id: "SELL002",
      name: "Priya Sharma",
      email: "priya@sharmafashion.com",
      phone: "+91 9876543211",
      businessName: "Sharma Fashion House",
      businessType: "Retail",
      address: "Delhi, NCR",
      registrationDate: "2024-02-10",
      submittedDate: "2024-03-05",
      status: "approved",
      documents: [
        { name: "GST Certificate", verified: true },
        { name: "PAN Card", verified: true },
        { name: "Aadhaar Card", verified: true },
      ],
      rating: 4.8,
      totalSales: 890000,
      notes: "All documents verified",
    },
    {
      id: "SELL003",
      name: "Arun Patel",
      email: "arun@pateltech.com",
      phone: "+91 9876543212",
      businessName: "Patel Tech Solutions",
      businessType: "IT Services",
      address: "Bangalore, Karnataka",
      registrationDate: "2024-01-28",
      submittedDate: "2024-03-12",
      status: "rejected",
      documents: [
        { name: "GST Certificate", verified: true },
        { name: "PAN Card", verified: true },
        { name: "Aadhaar Card", verified: false },
      ],
      rating: 3.9,
      totalSales: 560000,
      notes: "Aadhaar verification failed",
    },
    {
      id: "SELL004",
      name: "Meena Singh",
      email: "meena@singhfoods.com",
      phone: "+91 9876543213",
      businessName: "Singh Foods & Catering",
      businessType: "Food Services",
      address: "Pune, Maharashtra",
      registrationDate: "2024-02-15",
      submittedDate: "2024-03-08",
      status: "pending",
      documents: [
        { name: "GST Certificate", verified: true },
        { name: "PAN Card", verified: true },
        { name: "FSSAI License", verified: false },
      ],
      rating: 4.2,
      totalSales: 720000,
      notes: "FSSAI license pending",
    },
  ];

  /* ---------------- STATE ---------------- */
  const [sellers, setSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Ensure demoData is an array
        const data = Array.isArray(demoData) ? demoData : [];
        setSellers(data);
      } catch (err) {
        console.error('Failed to load sellers:', err);
        setError('Failed to load seller data. Please try again.');
        setSellers([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  /* ---------------- SAFE FILTER FUNCTION ---------------- */
  const getFilteredSellers = () => {
    try {
      // Ensure sellers is an array
      const safeSellers = Array.isArray(sellers) ? sellers : [];
      
      // If no sellers or empty search/filter, return all
      if (safeSellers.length === 0) return [];
      if (!searchTerm && filterStatus === 'all') return safeSellers;
      
      return safeSellers.filter(seller => {
        if (!seller || typeof seller !== 'object') return false;
        
        const searchTermLower = (searchTerm || '').toLowerCase();
        const sellerName = String(seller.name || '');
        const sellerEmail = String(seller.email || '');
        const sellerId = String(seller.id || '');
        const sellerBusiness = String(seller.businessName || '');
        
        // Check if matches search
        const matchesSearch = !searchTerm || 
          sellerName.toLowerCase().includes(searchTermLower) ||
          sellerEmail.toLowerCase().includes(searchTermLower) ||
          sellerId.toLowerCase().includes(searchTermLower) ||
          sellerBusiness.toLowerCase().includes(searchTermLower);
        
        // Check if matches status filter
        const sellerStatus = String(seller.status || '');
        const matchesStatus = filterStatus === 'all' || sellerStatus === filterStatus;
        
        return matchesSearch && matchesStatus;
      });
    } catch (err) {
      console.error('Filter error:', err);
      return [];
    }
  };

  const filteredSellers = getFilteredSellers();

  /* ---------------- SAFE STATS FUNCTION ---------------- */
  const getStats = () => {
    const safeSellers = Array.isArray(sellers) ? sellers : [];
    return {
      total: safeSellers.length,
      pending: safeSellers.filter(s => String(s?.status || '') === 'pending').length,
      approved: safeSellers.filter(s => String(s?.status || '') === 'approved').length,
      rejected: safeSellers.filter(s => String(s?.status || '') === 'rejected').length,
    };
  };

  const stats = getStats();

  /* ---------------- HANDLERS ---------------- */
  const openSellerDetails = (seller) => {
    if (!seller || typeof seller !== 'object') return;
    
    setSelectedSeller(seller);
    setVerificationNotes(seller?.notes || "");
    setIsModalOpen(true);
  };

  const handleVerification = (status) => {
    if (!selectedSeller) return;

    setLoading(true);
    setTimeout(() => {
      try {
        setSellers((prev) => {
          const prevSellers = Array.isArray(prev) ? prev : [];
          return prevSellers.map((s) =>
            s?.id === selectedSeller.id
              ? { ...s, status, notes: verificationNotes }
              : s
          );
        });
      } catch (err) {
        console.error('Error updating seller status:', err);
        setError('Failed to update seller status');
      } finally {
        setLoading(false);
        setIsModalOpen(false);
      }
    }, 800);
  };

  /* ---------------- BADGE ---------------- */
  const getStatusBadge = (status) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    
    switch (String(status || '')) {
      case "approved":
        return (
          <span className={`${base} bg-green-100 text-green-700 flex items-center gap-1`}>
            <CheckCircle className="h-3 w-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className={`${base} bg-red-100 text-red-700 flex items-center gap-1`}>
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      case "pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700 flex items-center gap-1`}>
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-700`}>
            Unknown
          </span>
        );
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Seller Verification
          </h1>
          <p className="text-gray-600">
            Review and verify seller applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">
                {key}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">
                {value}
              </p>
              <div className={`h-1 w-12 mt-2 rounded ${
                key === 'pending' ? 'bg-yellow-500' :
                key === 'approved' ? 'bg-green-500' :
                key === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
              }`} />
            </div>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, business, or ID..."
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  filterStatus === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Clock className="h-4 w-4" /> Pending
              </button>
              <button
                onClick={() => setFilterStatus("approved")}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  filterStatus === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <CheckCircle className="h-4 w-4" /> Approved
              </button>
              <button
                onClick={() => setFilterStatus("rejected")}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
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
            <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the data</p>
          </div>
        )}

        {/* Sellers Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller Details
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSellers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-16 text-center">
                        <div className="flex flex-col items-center">
                          <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium mb-2">
                            No sellers found
                          </p>
                          <p className="text-gray-400 text-sm max-w-md">
                            {searchTerm || filterStatus !== 'all' 
                              ? "Try adjusting your search or filter criteria" 
                              : "No seller applications available at the moment"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSellers.map((seller) => (
                      <tr key={seller?.id || Math.random()} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{seller?.name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{seller?.email || 'No email'}</p>
                              <p className="text-xs text-gray-400 mt-1">ID: {seller?.id || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{seller?.businessName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{seller?.businessType || 'N/A'}</p>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {seller?.address || 'Address not available'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(seller?.status)}
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted: {seller?.submittedDate || 'N/A'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => openSellerDetails(seller)}
                              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!seller}
                            >
                              <Eye className="h-4 w-4" />
                              Review
                            </button>
                            <button
                              onClick={() => openSellerDetails(seller)}
                              className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!seller}
                            >
                              <FileText className="h-4 w-4" />
                              Docs
                            </button>
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
                      {selectedSeller?.name || 'Seller Details'}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Business: {selectedSeller?.businessName || 'N/A'} • ID: {selectedSeller?.id || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Seller Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Seller Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedSeller?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedSeller?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{selectedSeller?.address || 'N/A'}</p>
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
                        <p className="text-sm text-gray-500">Business Type</p>
                        <p className="font-medium">{selectedSeller?.businessType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Registration Date</p>
                        <p className="font-medium">{selectedSeller?.registrationDate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Sales</p>
                        <p className="font-medium">
                          ₹{(selectedSeller?.totalSales || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <div className="flex items-center">
                          <span className="font-medium">{selectedSeller?.rating || 0}/5</span>
                          <div className="ml-2 text-yellow-400">★★★★★</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents Verification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.isArray(selectedSeller?.documents) && selectedSeller.documents.length > 0 ? (
                      selectedSeller.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <span className="font-medium">{doc?.name || 'Unknown Document'}</span>
                          {doc?.verified ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-4 text-gray-500">
                        No documents available
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    rows="4"
                    placeholder="Add notes about this verification..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleVerification("approved")}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
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
                    onClick={() => handleVerification("rejected")}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject Application
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerVerification;