import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Download,
  FileText,
  AlertCircle,
  User,
  Building,
  Calendar,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
  DollarSign,
  Package,
  ShoppingBag
} from 'lucide-react';

const SellerVerification = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // API configuration
  const API_BASE = 'http://localhost:5000/api';
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch sellers with proper API call
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/sellers`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setSellers(data.sellers || []);
      } else {
        console.error('Failed to fetch sellers:', response.status);
        setSellers(getDemoSellers()); // Fallback to demo data
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setSellers(getDemoSellers()); // Fallback to demo data
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const pending = sellers.filter(s => s.status === 'pending' || s.status === 'under_review').length;
    const approved = sellers.filter(s => s.status === 'approved' || s.isSellerVerified === true).length;
    const rejected = sellers.filter(s => s.status === 'rejected' || s.status === 'suspended').length;

    return {
      total: sellers.length,
      pending,
      approved,
      rejected
    };
  };

  const stats = calculateStats();

  // Verify seller
  const verifySeller = async (sellerId) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE}/admin/sellers/${sellerId}/verify`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'approved',
          isSellerVerified: true,
          notes: verificationNotes,
          verifiedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Update local state
        setSellers(prev => prev.map(seller =>
          seller._id === sellerId
            ? {
              ...seller,
              status: 'approved',
              isSellerVerified: true,
              notes: verificationNotes,
              sellerSettings: {
                ...seller.sellerSettings,
                storeStatus: 'active'
              }
            }
            : seller
        ));

        setSelectedSeller(null);
        setIsModalOpen(false);
        setVerificationNotes('');
        alert('Seller approved successfully!');
        fetchSellers(); // Refresh the list
      } else {
        alert('Failed to approve seller.');
      }
    } catch (error) {
      console.error('Error approving seller:', error);
      alert('Error approving seller. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject seller
  const rejectSeller = async (sellerId) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE}/admin/sellers/${sellerId}/verify`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'rejected',
          isSellerVerified: false,
          notes: verificationNotes,
          rejectionReason: verificationNotes
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Update local state
        setSellers(prev => prev.map(seller =>
          seller._id === sellerId
            ? {
              ...seller,
              status: 'rejected',
              isSellerVerified: false,
              notes: verificationNotes,
              sellerSettings: {
                ...seller.sellerSettings,
                storeStatus: 'suspended'
              }
            }
            : seller
        ));

        setSelectedSeller(null);
        setIsModalOpen(false);
        setVerificationNotes('');
        alert('Seller rejected successfully!');
        fetchSellers(); // Refresh the list
      } else {
        alert('Failed to reject seller.');
      }
    } catch (error) {
      console.error('Error rejecting seller:', error);
      alert('Error rejecting seller. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter sellers
  const filteredSellers = sellers.filter(seller => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (seller.name && seller.name.toLowerCase().includes(searchLower)) ||
      (seller.email && seller.email.toLowerCase().includes(searchLower)) ||
      (seller.businessName && seller.businessName.toLowerCase().includes(searchLower)) ||
      (seller.phone && seller.phone.includes(searchTerm));

    const matchesStatus =
      filterStatus === 'all' ||
      seller.status === filterStatus ||
      (filterStatus === 'pending' && !seller.isSellerVerified && seller.status !== 'rejected') ||
      (filterStatus === 'approved' && seller.isSellerVerified) ||
      (filterStatus === 'rejected' && seller.status === 'rejected');

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
    } else if (seller.status === 'rejected' || seller.status === 'suspended') {
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

  // Get store status badge
  const getStoreStatusBadge = (seller) => {
    const storeStatus = seller.sellerSettings?.storeStatus || 'under_review';

    switch (storeStatus) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Suspended</span>;
      case 'under_review':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Under Review</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  // View seller details
  const viewSellerDetails = (seller) => {
    setSelectedSeller(seller);
    setVerificationNotes(seller.notes || '');
    setIsModalOpen(true);
  };

  // Demo data (for development)
  const getDemoSellers = () => [
    {
      _id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh@kumarconstructions.com',
      phone: '+91 9876543210',
      businessName: 'Kumar Constructions',
      businessType: 'Contractor',
      address: 'Mumbai, Maharashtra',
      registrationDate: '2024-01-15',
      status: 'pending',
      isSellerVerified: false,
      sellerSettings: {
        storeStatus: 'under_review'
      },
      verificationDocuments: {
        panCard: 'https://example.com/pan1.jpg',
        aadharCard: 'https://example.com/aadhaar1.jpg',
        gstCertificate: 'https://example.com/gst1.jpg'
      },
      notes: 'GST certificate verification pending',
      totalProducts: 45,
      totalOrders: 128,
      totalRevenue: 1250000,
      createdAt: '2024-03-10'
    },
    {
      _id: '2',
      name: 'Priya Sharma',
      email: 'priya@sharmafashion.com',
      phone: '+91 9876543211',
      businessName: 'Sharma Fashion House',
      businessType: 'Retail',
      address: 'Delhi, NCR',
      registrationDate: '2024-02-10',
      status: 'approved',
      isSellerVerified: true,
      sellerSettings: {
        storeStatus: 'active'
      },
      verificationDocuments: {
        panCard: 'https://example.com/pan2.jpg',
        aadharCard: 'https://example.com/aadhaar2.jpg',
        gstCertificate: 'https://example.com/gst2.jpg'
      },
      notes: 'All documents verified successfully',
      totalProducts: 23,
      totalOrders: 67,
      totalRevenue: 890000,
      createdAt: '2024-03-05'
    },
    {
      _id: '3',
      name: 'Arun Patel',
      email: 'arun@pateltech.com',
      phone: '+91 9876543212',
      businessName: 'Patel Tech Solutions',
      businessType: 'IT Services',
      address: 'Bangalore, Karnataka',
      registrationDate: '2024-01-28',
      status: 'rejected',
      isSellerVerified: false,
      sellerSettings: {
        storeStatus: 'suspended'
      },
      verificationDocuments: {
        panCard: 'https://example.com/pan3.jpg',
        aadharCard: 'https://example.com/aadhaar3.jpg',
        gstCertificate: 'https://example.com/gst3.jpg'
      },
      notes: 'Aadhaar verification failed',
      totalProducts: 12,
      totalOrders: 34,
      totalRevenue: 560000,
      createdAt: '2024-03-12'
    }
  ];

  // Format documents for display
  const formatDocuments = (seller) => {
    const docs = [];
    if (seller.verificationDocuments?.panCard) {
      docs.push({ type: 'PAN Card', url: seller.verificationDocuments.panCard, verified: true });
    }
    if (seller.verificationDocuments?.aadharCard) {
      docs.push({ type: 'Aadhaar Card', url: seller.verificationDocuments.aadharCard, verified: true });
    }
    if (seller.verificationDocuments?.gstCertificate) {
      docs.push({ type: 'GST Certificate', url: seller.verificationDocuments.gstCertificate, verified: true });
    }
    return docs;
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Seller Verification</h1>
          <p className="text-gray-600">Review and verify seller applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-gray-500">
            {stats.pending} pending verification
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sellers</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Review</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Verified</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Rejected</p>
              <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search sellers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filterStatus === status
                    ? status === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : status === 'approved'
                        ? 'bg-green-600 text-white'
                        : status === 'rejected'
                          ? 'bg-red-600 text-white'
                          : 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sellers...</p>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sellers found</p>
            {searchTerm && (
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Seller Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Business Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{seller.name}</p>
                          <p className="text-sm text-gray-500">{seller.email}</p>
                          <p className="text-xs text-gray-400 mt-1">{seller.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{seller.businessName}</p>
                      <p className="text-sm text-gray-500">{seller.businessType}</p>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {seller.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getStatusBadge(seller)}
                        <div>{getStoreStatusBadge(seller)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span>Products: <span className="font-medium">{seller.totalProducts || 0}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ShoppingBag className="h-4 w-4 text-gray-400" />
                          <span>Orders: <span className="font-medium">{seller.totalOrders || 0}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>Revenue: <span className="font-medium">₹{seller.totalRevenue?.toLocaleString() || 0}</span></span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => viewSellerDetails(seller)}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </button>
                        {!seller.isSellerVerified && seller.status !== 'rejected' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => verifySeller(seller._id)}
                              className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 flex items-center justify-center gap-2"
                              disabled={actionLoading}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => rejectSeller(seller._id)}
                              className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 flex items-center justify-center gap-2"
                              disabled={actionLoading}
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {isModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedSeller.name} - Verification Details
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Business: {selectedSeller.businessName} • ID: {selectedSeller._id}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  disabled={actionLoading}
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Personal Information */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{selectedSeller.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedSeller.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedSeller.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{selectedSeller.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Business Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Business Name</p>
                      <p className="font-medium">{selectedSeller.businessName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Business Type</p>
                      <p className="font-medium">{selectedSeller.businessType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Registration Date</p>
                        <p className="font-medium">{selectedSeller.registrationDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Store Status</p>
                      {getStoreStatusBadge(selectedSeller)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-700">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Total Products</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{selectedSeller.totalProducts || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Total Orders</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{selectedSeller.totalOrders || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-purple-500" />
                      <span className="text-sm font-medium">Total Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">₹{selectedSeller.totalRevenue?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Verification Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formatDocuments(selectedSeller).map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">{doc.type}</span>
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm rounded hover:bg-blue-100 text-center"
                        >
                          View
                        </a>
                        <a
                          href={doc.url}
                          download
                          className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm rounded hover:bg-gray-100 flex items-center justify-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  rows="4"
                  placeholder="Add notes about this verification..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  disabled={actionLoading}
                />
              </div>

              {/* Previous Notes */}
              {selectedSeller.notes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Previous Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedSeller.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                {!selectedSeller.isSellerVerified && selectedSeller.status !== 'rejected' && (
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