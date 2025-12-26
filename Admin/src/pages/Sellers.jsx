import React, { useState, useEffect } from "react";
import {
  Search, Filter, Download,
  Eye, CheckCircle, XCircle,
  MoreVertical, User, Building,
  Calendar, Phone, Mail, MapPin
} from "lucide-react";

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:5000/api/admin/sellers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSellers(data.sellers || []);
      } else {
        // Demo data for testing
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

  const handleVerify = async (sellerId) => {
    try {
      await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: 'verified' })
      });

      // Update local state
      setSellers(sellers.map(seller =>
        seller._id === sellerId ? { ...seller, status: 'verified' } : seller
      ));
    } catch (error) {
      console.error("Error verifying seller:", error);
    }
  };

  const handleSuspend = async (sellerId) => {
    try {
      await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: 'suspended' })
      });

      // Update local state
      setSellers(sellers.map(seller =>
        seller._id === sellerId ? { ...seller, status: 'suspended' } : seller
      ));
    } catch (error) {
      console.error("Error suspending seller:", error);
    }
  };

  const handleActivate = async (sellerId) => {
    try {
      await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}/activate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: 'active' })
      });

      // Update local state
      setSellers(sellers.map(seller =>
        seller._id === sellerId ? { ...seller, status: 'active' } : seller
      ));
    } catch (error) {
      console.error("Error activating seller:", error);
    }
  };

  const viewSellerDetails = (seller) => {
    setSelectedSeller(seller);
    setIsModalOpen(true);
  };

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
      status: "verified",
      documents: [
        { type: "PAN Card", verified: true },
        { type: "GST Certificate", verified: true }
      ],
      totalProducts: 45,
      totalOrders: 128,
      totalRevenue: 1250000,
      storeStatus: "active"
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
      status: "pending",
      documents: [
        { type: "PAN Card", verified: true },
        { type: "GST Certificate", verified: false }
      ],
      totalProducts: 23,
      totalOrders: 67,
      totalRevenue: 890000,
      storeStatus: "inactive"
    },
    {
      _id: "3",
      name: "Arun Patel",
      email: "arun@pateltech.com",
      phone: "+91 9876543212",
      businessName: "Patel Tech Solutions",
      businessType: "IT Services",
      address: "Bangalore, Karnataka",
      registrationDate: "2024-01-28",
      status: "suspended",
      documents: [
        { type: "PAN Card", verified: true },
        { type: "GST Certificate", verified: true }
      ],
      totalProducts: 12,
      totalOrders: 34,
      totalRevenue: 560000,
      storeStatus: "suspended"
    },
    {
      _id: "4",
      name: "Meena Singh",
      email: "meena@singhfoods.com",
      phone: "+91 9876543213",
      businessName: "Singh Foods & Catering",
      businessType: "Food Services",
      address: "Pune, Maharashtra",
      registrationDate: "2024-02-15",
      status: "verified",
      documents: [
        { type: "PAN Card", verified: true },
        { type: "FSSAI License", verified: true },
        { type: "GST Certificate", verified: true }
      ],
      totalProducts: 56,
      totalOrders: 189,
      totalRevenue: 2100000,
      storeStatus: "active"
    }
  ];

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = searchTerm === "" ||
      seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.phone?.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || seller.status === statusFilter;

    let matchesDate = true;
    if (dateFilter) {
      matchesDate = seller.registrationDate?.includes(dateFilter);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
      case 'active':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Verified
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Suspended
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <span className="w-4 h-4 mr-1">⏱️</span>
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

  const getStoreStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Inactive</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Suspended</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Business Name', 'Status', 'Registration Date', 'Total Products', 'Total Orders', 'Total Revenue'];
    const csvData = sellers.map(seller => [
      seller.name,
      seller.email,
      seller.phone,
      seller.businessName,
      seller.status,
      seller.registrationDate,
      seller.totalProducts || 0,
      seller.totalOrders || 0,
      seller.totalRevenue || 0
    ]);

    const csv = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sellers_export.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Seller Management</h1>
          <p className="text-gray-600">Manage all sellers and their accounts</p>
        </div>
        <button
          onClick={exportToCSV}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sellers</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{sellers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Stores</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {sellers.filter(s => s.storeStatus === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Building className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Verification</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {sellers.filter(s => s.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Suspended</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {sellers.filter(s => s.status === 'suspended').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search sellers by name, email, business, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="active">Active</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Info
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading sellers...</p>
                  </td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <p className="text-gray-500">No sellers found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm ? 'Try adjusting your search criteria' : 'No sellers available'}
                    </p>
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
                        <Calendar className="h-3 w-3 mr-1" />
                        {seller.registrationDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getStatusBadge(seller.status)}
                        <div>
                          {getStoreStatusBadge(seller.storeStatus)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-500">Products: </span>
                          <span className="font-medium">{seller.totalProducts || 0}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Orders: </span>
                          <span className="font-medium">{seller.totalOrders || 0}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Revenue: </span>
                          <span className="font-medium">₹{seller.totalRevenue?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => viewSellerDetails(seller)}
                          className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        <div className="flex gap-2">
                          {seller.status === 'pending' && (
                            <button
                              onClick={() => handleVerify(seller._id)}
                              className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Verify
                            </button>
                          )}
                          {seller.status === 'suspended' ? (
                            <button
                              onClick={() => handleActivate(seller._id)}
                              className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 flex items-center justify-center gap-1"
                            >
                              Activate
                            </button>
                          ) : seller.status === 'verified' || seller.status === 'active' ? (
                            <button
                              onClick={() => handleSuspend(seller._id)}
                              className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 flex items-center justify-center gap-1"
                            >
                              Suspend
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seller Details Modal */}
      {isModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Seller Details</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-medium">{selectedSeller.registrationDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Store Status</p>
                      {getStoreStatusBadge(selectedSeller.storeStatus)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-700">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Total Products</p>
                    <p className="text-2xl font-bold text-gray-800">{selectedSeller.totalProducts || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{selectedSeller.totalOrders || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">₹{selectedSeller.totalRevenue?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-700">Verification Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedSeller.documents?.map((doc, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{doc.type}</span>
                        {doc.verified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Status: {doc.verified ? 'Verified' : 'Pending'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                {selectedSeller.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleVerify(selectedSeller._id);
                      setIsModalOpen(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Verify Seller
                  </button>
                )}
                {selectedSeller.status === 'suspended' && (
                  <button
                    onClick={() => {
                      handleActivate(selectedSeller._id);
                      setIsModalOpen(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Activate Seller
                  </button>
                )}
                {(selectedSeller.status === 'verified' || selectedSeller.status === 'active') && (
                  <button
                    onClick={() => {
                      handleSuspend(selectedSeller._id);
                      setIsModalOpen(false);
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Suspend Seller
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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

export default Sellers;