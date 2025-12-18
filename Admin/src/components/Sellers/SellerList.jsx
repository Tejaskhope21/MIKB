// src/components/Seller/SellerList.jsx
import React, { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Filter,
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Star,
  AlertCircle,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";

const SellerList = ({
  sellers = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onVerify,
  onSuspend,
  onSelect,
  selectedSellers = [],
  selectable = false,
  showActions = true,
  showStats = true,
  showFilters = true,
  itemsPerPage = 10,
  onPageChange,
  currentPage = 1,
  totalItems = 0,
}) => {
  const [sortColumn, setSortColumn] = useState("joinDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilters, setActiveFilters] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  // Sort columns configuration
  const sortableColumns = [
    { key: "businessName", label: "Business Name" },
    { key: "ownerName", label: "Owner" },
    { key: "joinDate", label: "Join Date" },
    { key: "totalSales", label: "Sales" },
    { key: "rating", label: "Rating" },
    { key: "status", label: "Status" },
  ];

  // Status options
  const statusOptions = [
    { id: "all", label: "All Status", color: "gray" },
    { id: "verified", label: "Verified", color: "green" },
    { id: "pending", label: "Pending", color: "yellow" },
    { id: "suspended", label: "Suspended", color: "red" },
    { id: "inactive", label: "Inactive", color: "gray" },
  ];

  // Additional filters
  const filterOptions = [
    { id: "highRating", label: "High Rating (4+)" },
    { id: "newSellers", label: "New (Last 30 days)" },
    { id: "topSellers", label: "Top Sellers" },
    { id: "needsAttention", label: "Needs Attention" },
  ];

  // Get status color
  const getStatusColor = (status) => {
    const statusMap = {
      verified: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      suspended: "bg-red-100 text-red-800 border-red-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      default: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return statusMap[status] || statusMap.default;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const iconMap = {
      verified: CheckCircle,
      pending: AlertCircle,
      suspended: XCircle,
      inactive: UserX,
    };
    return iconMap[status] || UserCheck;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Handle sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Handle filter toggle
  const toggleFilter = (filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Filter and sort sellers - SAFE VERSION
  const filteredAndSortedSellers = (sellers || [])
    .filter((seller) => {
      if (!seller || typeof seller !== "object") return false;
      
      // Search filter
      const matchesSearch =
        !searchTerm ||
        (seller.businessName && seller.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (seller.ownerName && seller.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (seller.email && seller.email.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === "all" || seller.status === statusFilter;

      // Additional filters
      const matchesAdditionalFilters = activeFilters.every((filter) => {
        if (!seller) return false;
        
        switch (filter) {
          case "highRating":
            return seller.rating >= 4;
          case "newSellers":
            if (!seller.joinDate) return false;
            const joinDate = new Date(seller.joinDate);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return joinDate >= thirtyDaysAgo;
          case "topSellers":
            return seller.totalSales > 500000;
          case "needsAttention":
            return seller.status === "pending" || seller.rating < 3;
          default:
            return true;
        }
      });

      return matchesSearch && matchesStatus && matchesAdditionalFilters;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle undefined/null values
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      // Handle special cases
      if (sortColumn === "joinDate") {
        try {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } catch (error) {
          return 0;
        }
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // Stats calculation - SAFE VERSION
  const stats = {
    total: sellers?.length || 0,
    verified: (sellers || []).filter((s) => s?.status === "verified").length,
    pending: (sellers || []).filter((s) => s?.status === "pending").length,
    suspended: (sellers || []).filter((s) => s?.status === "suspended").length,
    active: (sellers || []).filter((s) => s?.isActive).length,
    totalSales: (sellers || []).reduce((sum, seller) => sum + (seller?.totalSales || 0), 0),
    avgRating: (sellers || []).reduce((sum, seller) => sum + (seller?.rating || 0), 0) / Math.max((sellers || []).length, 1),
  };

  // Handle row selection
  const handleSelectRow = (sellerId) => {
    if (!selectable) return;
    onSelect?.(sellerId);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!selectable) return;
    const allIds = filteredAndSortedSellers.map((seller) => seller?.id).filter(Boolean);
    if (selectedSellers.length === filteredAndSortedSellers.length) {
      onSelect?.([]);
    } else {
      onSelect?.(allIds);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading sellers...</p>
      </div>
    );
  }

  // Render empty state
  if (!sellers || sellers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <UserX className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No sellers</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding a new seller.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sellers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold">{stats.verified}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalSales)}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sellers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                  activeFilters.includes(filter.id)
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
                {activeFilters.includes(filter.id) && (
                  <XCircle className="h-3 w-3 ml-2" />
                )}
              </button>
            ))}
          </div>

          {/* Active filters indicator */}
          {activeFilters.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">{activeFilters.length}</span> active
              filter{activeFilters.length > 1 ? "s" : ""}
              <button
                onClick={() => setActiveFilters([])}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sellers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Select All Checkbox */}
                {selectable && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedSellers.length === filteredAndSortedSellers.length &&
                        filteredAndSortedSellers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                )}

                {/* Table Headers */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("businessName")}
                    className="flex items-center hover:text-gray-700"
                  >
                    Business
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("ownerName")}
                    className="flex items-center hover:text-gray-700"
                  >
                    Owner
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("totalSales")}
                    className="flex items-center hover:text-gray-700"
                  >
                    Sales
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("rating")}
                    className="flex items-center hover:text-gray-700"
                  >
                    Rating
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center hover:text-gray-700"
                  >
                    Status
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("joinDate")}
                    className="flex items-center hover:text-gray-700"
                  >
                    Join Date
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>

                {showActions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedSellers.map((seller) => {
                if (!seller) return null;
                
                const isSelected = selectable && selectedSellers.includes(seller.id);
                const isExpanded = expandedRow === seller.id;
                const StatusIcon = getStatusIcon(seller.status);

                return (
                  <React.Fragment key={seller.id}>
                    {/* Main Row */}
                    <tr
                      className={`hover:bg-gray-50 transition-colors ${
                        isSelected ? "bg-blue-50" : ""
                      } ${isExpanded ? "bg-gray-50" : ""}`}
                    >
                      {/* Select Checkbox */}
                      {selectable && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(seller.id)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                      )}

                      {/* Business Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            <ShoppingBag className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {seller.businessName || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {seller.businessType || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {seller.ownerName || "N/A"}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {seller.email || "N/A"}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {seller.phone || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Sales */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold">
                          {formatCurrency(seller.totalSales)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {seller.totalOrders || 0} orders
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(seller.rating || 0)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 font-medium">{seller.rating?.toFixed(1) || "0.0"}</span>
                          <span className="ml-1 text-sm text-gray-500">
                            ({seller.reviewCount || 0})
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            seller.status || "pending"
                          )}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {(seller.status || "pending").charAt(0).toUpperCase() +
                            (seller.status || "pending").slice(1)}
                        </span>
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(seller.joinDate)}
                        </div>
                      </td>

                      {/* Actions */}
                      {showActions && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onView?.(seller)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => onEdit?.(seller)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {seller.status === "pending" ? (
                              <button
                                onClick={() => onVerify?.(seller.id)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Verify"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            ) : seller.status === "verified" ? (
                              <button
                                onClick={() => onSuspend?.(seller.id)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Suspend"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            ) : null}

                            <button
                              onClick={() => onDelete?.(seller.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() =>
                                setExpandedRow(isExpanded ? null : seller.id)
                              }
                              className="p-1 text-gray-600 hover:text-gray-800"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td
                          colSpan={
                            selectable
                              ? showActions
                                ? 9
                                : 8
                              : showActions
                              ? 8
                              : 7
                          }
                          className="px-6 py-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Business Details */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-gray-900">
                                Business Information
                              </h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">GST:</span>
                                  <span className="text-sm font-medium">
                                    {seller.gstNumber || "Not provided"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">PAN:</span>
                                  <span className="text-sm font-medium">
                                    {seller.panNumber || "Not provided"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">
                                    Business Type:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {seller.businessType || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-gray-900">
                                Contact Details
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-start">
                                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">
                                    {seller.address || "Address not provided"}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm">{seller.phone || "N/A"}</span>
                                </div>
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm">{seller.email || "N/A"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-gray-900">
                                Performance Metrics
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-600">
                                    Total Products
                                  </div>
                                  <div className="text-lg font-bold">
                                    {seller.productCount || 0}
                                  </div>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-600">
                                    Avg Order Value
                                  </div>
                                  <div className="text-lg font-bold">
                                    {formatCurrency(seller.avgOrderValue || 0)}
                                  </div>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-600">
                                    Response Time
                                  </div>
                                  <div className="text-lg font-bold">
                                    {seller.responseTime || "N/A"}
                                  </div>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-600">
                                    Completion Rate
                                  </div>
                                  <div className="text-lg font-bold">
                                    {seller.completionRate || 0}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty filtered state */}
        {filteredAndSortedSellers.length === 0 && (
          <div className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No sellers found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {onPageChange && totalItems > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(Math.ceil(totalItems / itemsPerPage))].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => onPageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Selected Actions Bar */}
      {selectable && selectedSellers.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium">
              {selectedSellers.length} seller{selectedSellers.length > 1 ? "s" : ""}{" "}
              selected
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  selectedSellers.forEach((id) => onVerify?.(id));
                  onSelect?.([]);
                }}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
              >
                Verify All
              </button>
              <button
                onClick={() => {
                  selectedSellers.forEach((id) => onSuspend?.(id));
                  onSelect?.([]);
                }}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
              >
                Suspend All
              </button>
              <button
                onClick={() => {
                  selectedSellers.forEach((id) => onDelete?.(id));
                  onSelect?.([]);
                }}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
              >
                Delete All
              </button>
              <button
                onClick={() => onSelect?.([])}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerList;