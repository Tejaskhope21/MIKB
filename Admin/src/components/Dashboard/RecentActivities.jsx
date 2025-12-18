import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  User,
  Store,
  Package,
  DollarSign,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  ExternalLink,
  Users,
  FileText,
  Settings,
  Bell,
  Activity,
} from "lucide-react";


const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all",
    userType: "all",
    dateRange: "today",
    search: "",
  });
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Activity types
  const activityTypes = [
    { id: "all", label: "All Activities", color: "gray" },
    { id: "user", label: "User Actions", color: "blue", icon: User },
    { id: "seller", label: "Seller Activities", color: "green", icon: Store },
    { id: "order", label: "Order Updates", color: "purple", icon: Package },
    { id: "payment", label: "Payment Transactions", color: "yellow", icon: DollarSign },
    { id: "security", label: "Security Events", color: "red", icon: Shield },
    { id: "system", label: "System Activities", color: "orange", icon: Settings },
  ];

  // User types
  const userTypes = [
    { id: "all", label: "All Users" },
    { id: "admin", label: "Admins" },
    { id: "seller", label: "Sellers" },
    { id: "customer", label: "Customers" },
  ];

  // Date ranges
  const dateRanges = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "week", label: "Last 7 Days" },
    { id: "month", label: "Last 30 Days" },
    { id: "custom", label: "Custom Range" },
  ];

  useEffect(() => {
    fetchActivities();
  }, [filters.dateRange]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with actual API call
      const data = [
        {
          id: 1,
          type: "user",
          userType: "admin",
          userId: "ADM001",
          userName: "John Admin",
          userEmail: "john@admin.com",
          action: "logged_in",
          description: "Successfully logged into admin panel",
          details: {
            ip: "192.168.1.100",
            browser: "Chrome 120",
            device: "Desktop",
            location: "Mumbai, IN",
          },
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
          status: "success",
          priority: "low",
        },
        {
          id: 2,
          type: "seller",
          userType: "seller",
          userId: "SEL023",
          userName: "ElectroHub",
          userEmail: "contact@electrohub.com",
          action: "verified",
          description: "Seller account verified successfully",
          details: {
            businessName: "ElectroHub Electronics",
            verifiedBy: "John Admin",
            documents: "All documents approved",
          },
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
          status: "success",
          priority: "medium",
        },
        {
          id: 3,
          type: "order",
          userType: "customer",
          userId: "CUS456",
          userName: "Rahul Sharma",
          userEmail: "rahul@example.com",
          action: "order_placed",
          description: "New order placed #ORD-789012",
          details: {
            orderId: "ORD-789012",
            amount: "₹25,499",
            items: 3,
            payment: "Credit Card",
          },
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
          status: "success",
          priority: "medium",
        },
        {
          id: 4,
          type: "payment",
          userType: "seller",
          userId: "SEL015",
          userName: "Fashionista",
          userEmail: "info@fashionista.com",
          action: "payout_processed",
          description: "Payout processed for Fashionista",
          details: {
            amount: "₹42,850",
            transactionId: "TXN-789456",
            method: "Bank Transfer",
          },
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutes ago
          status: "success",
          priority: "high",
        },
        {
          id: 5,
          type: "security",
          userType: "admin",
          userId: "ADM001",
          userName: "John Admin",
          userEmail: "john@admin.com",
          action: "password_changed",
          description: "Password changed successfully",
          details: {
            changedAt: "Admin Panel",
            device: "Desktop",
            location: "Mumbai, IN",
          },
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
          status: "success",
          priority: "high",
        },
        {
          id: 6,
          type: "seller",
          userType: "seller",
          userId: "SEL042",
          userName: "Home Bliss",
          userEmail: "support@homebliss.com",
          action: "registration",
          description: "New seller registration pending verification",
          details: {
            businessType: "Home & Kitchen",
            registeredAt: "Web Portal",
            status: "Pending",
          },
          timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
          status: "pending",
          priority: "medium",
        },
        {
          id: 7,
          type: "system",
          userType: "system",
          userId: "SYS001",
          userName: "System",
          userEmail: "system@bricks.com",
          action: "backup_completed",
          description: "Daily system backup completed successfully",
          details: {
            size: "2.4 GB",
            duration: "15 minutes",
            status: "Completed",
          },
          timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
          status: "success",
          priority: "low",
        },
        {
          id: 8,
          type: "security",
          userType: "unknown",
          userId: "UNK001",
          userName: "Unknown User",
          userEmail: null,
          action: "failed_login",
          description: "Failed login attempt detected",
          details: {
            ip: "103.216.182.1",
            attempts: 3,
            reason: "Invalid credentials",
          },
          timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), // 5 hours ago
          status: "failed",
          priority: "high",
        },
        {
          id: 9,
          type: "order",
          userType: "seller",
          userId: "SEL023",
          userName: "ElectroHub",
          userEmail: "contact@electrohub.com",
          action: "order_shipped",
          description: "Order #ORD-789011 marked as shipped",
          details: {
            orderId: "ORD-789011",
            tracking: "TRK-456789123",
            carrier: "Blue Dart",
          },
          timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), // 6 hours ago
          status: "success",
          priority: "low",
        },
        {
          id: 10,
          type: "user",
          userType: "customer",
          userId: "CUS789",
          userName: "Priya Patel",
          userEmail: "priya@example.com",
          action: "profile_updated",
          description: "User updated profile information",
          details: {
            updatedFields: ["Phone", "Address"],
            updatedAt: "Mobile App",
          },
          timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), // 8 hours ago
          status: "success",
          priority: "low",
        },
        {
          id: 11,
          type: "payment",
          userType: "customer",
          userId: "CUS321",
          userName: "Amit Kumar",
          userEmail: "amit@example.com",
          action: "refund_processed",
          description: "Refund processed for order #ORD-788901",
          details: {
            orderId: "ORD-788901",
            amount: "₹12,499",
            reason: "Product Return",
          },
          timestamp: new Date(Date.now() - 10 * 3600000).toISOString(), // 10 hours ago
          status: "success",
          priority: "medium",
        },
        {
          id: 12,
          type: "system",
          userType: "system",
          userId: "SYS001",
          userName: "System",
          userEmail: "system@bricks.com",
          action: "maintenance",
          description: "Scheduled maintenance completed",
          details: {
            duration: "30 minutes",
            downtime: "2 minutes",
            status: "Completed",
          },
          timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 hours ago
          status: "success",
          priority: "medium",
        },
      ];
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-500";
      case "medium":
        return "border-yellow-500";
      case "low":
        return "border-blue-500";
      default:
        return "border-gray-300";
    }
  };

  const getTypeIcon = (type) => {
    const typeConfig = activityTypes.find((t) => t.id === type);
    if (typeConfig && typeConfig.icon) {
      const Icon = typeConfig.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const filteredActivities = activities.filter((activity) => {
    if (filters.type !== "all" && activity.type !== filters.type) return false;
    if (filters.userType !== "all" && activity.userType !== filters.userType)
      return false;
    if (
      filters.search &&
      !activity.description.toLowerCase().includes(filters.search.toLowerCase()) &&
      !activity.userName.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleExport = () => {
    alert("Exporting activities data...");
    // Implement export logic
  };

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear all activity logs? This action cannot be undone.")) {
      alert("Activity logs cleared!");
      // Implement clear logic
    }
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
  };

  const stats = {
    total: activities.length,
    today: activities.filter((a) => {
      const today = new Date().toDateString();
      return new Date(a.timestamp).toDateString() === today;
    }).length,
    success: activities.filter((a) => a.status === "success").length,
    failed: activities.filter((a) => a.status === "failed").length,
    pending: activities.filter((a) => a.status === "pending").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Recent Activities</h1>
          <p className="text-gray-600">
            Track all system activities and user actions in real-time
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchActivities}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600 font-medium">
            +12% from yesterday
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Activities</p>
              <p className="text-2xl font-bold mt-1">{stats.today}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Last updated: Just now
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-2xl font-bold mt-1">{stats.success}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600 font-medium">
            {((stats.success / stats.total) * 100).toFixed(1)}% success rate
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed Activities</p>
              <p className="text-2xl font-bold mt-1">{stats.failed}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-red-600 font-medium">
            {((stats.failed / stats.total) * 100).toFixed(1)}% failure rate
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities by description or user..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Activity Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="h-4 w-4 inline mr-1" />
                Activity Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activityTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                User Type
              </label>
              <select
                value={filters.userType}
                onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {userTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateRanges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {activityTypes.slice(1).map((type) => (
              <button
                key={type.id}
                onClick={() => setFilters({ ...filters, type: type.id })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                  filters.type === type.id
                    ? `bg-${type.color}-100 text-${type.color}-800`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {getTypeIcon(type.id)}
                <span className="ml-2">{type.label}</span>
                <span className="ml-2 bg-white px-1.5 py-0.5 rounded text-xs">
                  {activities.filter((a) => a.type === type.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Activity Log</h3>
            <p className="text-sm text-gray-600">
              Showing {filteredActivities.length} of {activities.length} activities
            </p>
          </div>
          <button
            onClick={handleClearLogs}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">Loading activities...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredActivities.length === 0 ? (
              <div className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No activities found
                </h3>
                <p className="mt-1 text-gray-600">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(
                    activity.priority
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getTypeIcon(activity.type)}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {activity.description}
                              </h4>
                              <div className="mt-1 flex items-center space-x-4">
                                <div className="flex items-center text-sm text-gray-500">
                                  <User className="h-4 w-4 mr-1" />
                                  {activity.userName}
                                  {activity.userEmail && (
                                    <span className="ml-1">({activity.userEmail})</span>
                                  )}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {getTimeAgo(activity.timestamp)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                  activity.status
                                )}`}
                              >
                                {activity.status.toUpperCase()}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full border ${
                                  activity.priority === "high"
                                    ? "border-red-300 bg-red-50 text-red-700"
                                    : activity.priority === "medium"
                                    ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                                    : "border-blue-300 bg-blue-50 text-blue-700"
                                }`}
                              >
                                {activity.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Action Details */}
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {activity.details &&
                              Object.entries(activity.details).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium text-gray-700">
                                    {key.replace(/_/g, " ").toUpperCase()}:
                                  </span>{" "}
                                  <span className="text-gray-600">{value}</span>
                                </div>
                              ))}
                          </div>

                          {/* Quick Actions */}
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(activity)}
                              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </button>
                            {activity.userId && (
                              <button className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Profile
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Activity Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activityTypes.slice(1).map((type) => {
            const count = activities.filter((a) => a.type === type.id).length;
            const percentage = ((count / activities.length) * 100).toFixed(1);
            const Icon = type.icon || Activity;
            return (
              <div key={type.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{type.label}</div>
                    <div className="text-2xl font-bold mt-1">{count}</div>
                    <div className="text-sm text-gray-500">{percentage}% of total</div>
                  </div>
                  <Icon className={`h-8 w-8 text-${type.color}-500`} />
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${type.color}-500 h-2 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Activity Details</h3>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Activity ID</div>
                      <div className="font-medium">{selectedActivity.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Timestamp</div>
                      <div className="font-medium">
                        {new Date(selectedActivity.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Activity Type</div>
                      <div className="font-medium capitalize">
                        {selectedActivity.type}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">User Type</div>
                      <div className="font-medium capitalize">
                        {selectedActivity.userType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">User Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">User ID</div>
                      <div className="font-medium">{selectedActivity.userId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">User Name</div>
                      <div className="font-medium">{selectedActivity.userName}</div>
                    </div>
                    {selectedActivity.userEmail && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium">{selectedActivity.userEmail}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Activity Details</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Description</div>
                      <div className="font-medium">{selectedActivity.description}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Action</div>
                      <div className="font-medium">{selectedActivity.action}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="font-medium">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                            selectedActivity.status
                          )}`}
                        >
                          {selectedActivity.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {selectedActivity.details && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Additional Details</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedActivity.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            {key.replace(/_/g, " ").toUpperCase()}
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Take Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;