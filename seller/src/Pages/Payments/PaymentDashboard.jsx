// src/components/payments/PaymentsDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaDownload, 
  FaFileInvoiceDollar, 
  FaTruck, 
  FaBuilding,
  FaChartLine,
  FaFilter,
  FaSearch,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaRupeeSign 
} from "react-icons/fa";

const PaymentsDashboard = () => {
  const [timeFilter, setTimeFilter] = useState("last30days");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedUpcomingPayment, setSelectedUpcomingPayment] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const navigate = useNavigate();

  // Brick's Kart specific payment data for construction materials
  const paymentData = {
    upcoming: {
      amount: 254750.50,
      next7Days: 125850.25,
      payments: [
        {
          id: "BK-UP001",
          date: "2024-12-20",
          amount: 125450.50,
          orders: 3,
          status: "processing",
          orderDetails: [
            {
              orderId: "BK-ORD-23001",
              customer: "Sharma Construction",
              product: "Premium Cement Bags (OPC 53 Grade)",
              quantity: 200,
              amount: 64000,
              status: "Shipped",
              expectedDelivery: "2024-12-18",
              materialType: "Cement"
            },
            {
              orderId: "BK-ORD-23002",
              customer: "Gupta Builders",
              product: "TMT Steel Rods (12mm Grade)",
              quantity: 100,
              amount: 62000,
              status: "Delivered",
              expectedDelivery: "2024-12-15",
              materialType: "Steel"
            },
            {
              orderId: "BK-ORD-23003",
              customer: "Modern Interiors",
              product: "Ceramic Floor Tiles (Wooden Finish)",
              quantity: 500,
              amount: 37500,
              status: "Processing",
              expectedDelivery: "2024-12-19",
              materialType: "Tiles"
            },
          ],
        },
        {
          id: "BK-UP002",
          date: "2024-12-22",
          amount: 129300.00,
          orders: 2,
          status: "processing",
          orderDetails: [
            {
              orderId: "BK-ORD-23004",
              customer: "Water Works Ltd.",
              product: "PVC Plumbing Pipes (4 inch)",
              quantity: 150,
              amount: 63000,
              status: "Packed",
              expectedDelivery: "2024-12-20",
              materialType: "Pipes"
            },
            {
              orderId: "BK-ORD-23005",
              customer: "Luxury Bathrooms",
              product: "Bathroom Fittings Set (Chrome Finish)",
              quantity: 25,
              amount: 27500,
              status: "Shipped",
              expectedDelivery: "2024-12-21",
              materialType: "Fittings"
            },
            {
              orderId: "BK-ORD-23006",
              customer: "Color World",
              product: "Asian Paints Weatherproof Exterior",
              quantity: 40,
              amount: 106000,
              status: "Processing",
              expectedDelivery: "2024-12-19",
              materialType: "Paint"
            },
          ],
        },
      ],
    },
    completed: {
      total: 856842.63,
      last30Days: 278465.63,
      payments: [
        {
          date: "16 Dec 2024",
          orderAmount: 174965.97,
          platformRecovery: 0,
          platformCompensation: 0,
          netAmount: 174965.97,
          paymentId: "SCBLNS2024121600304685",
          transactionType: "Construction Materials",
          details: "Cement and Steel sales",
          amount: 174965.97,
          orders: 12
        },
        {
          date: "28 Nov 2024",
          orderAmount: 0,
          platformRecovery: 0,
          platformCompensation: 0,
          netAmount: 0,
          paymentId: "NA",
          transactionType: "Construction Materials",
          details: "Sales and returns",
          amount: 0,
          orders: 0
        },
        {
          date: "25 Nov 2024",
          orderAmount: 174965.97,
          platformRecovery: 0,
          platformCompensation: 0,
          netAmount: 174965.97,
          paymentId: "IN6ON24112505GST",
          transactionType: "Construction Materials",
          details: "Tiles and Pipes sales",
          amount: 174965.97,
          orders: 8
        },
        {
          date: "20 Nov 2024",
          orderAmount: 256894.25,
          platformRecovery: 1250.00,
          platformCompensation: 0,
          netAmount: 255644.25,
          paymentId: "BKPAY24112001",
          transactionType: "Bulk Construction Materials",
          details: "Bricks and Aggregates",
          amount: 255644.25,
          orders: 5
        },
        {
          date: "15 Nov 2024",
          orderAmount: 251267.44,
          platformRecovery: 0,
          platformCompensation: 1500.00,
          netAmount: 252767.44,
          paymentId: "BKPAY24111502",
          transactionType: "Construction Materials",
          details: "Steel and Hardware",
          amount: 252767.44,
          orders: 7
        },
      ],
    },
    summary: {
      totalNetOrderAmount: 856842.80,
      totalPlatformRecovery: 1250.00,
      totalPlatformCompensation: 1500.00,
      totalAmount: 856842.63,
    },
    overTime: {
      outstanding: 254750.50,
      timeline: [
        { month: "Sep 2024", amount: 521150.25 },
        { month: "Oct 2024", amount: 678955.50 },
        { month: "Nov 2024", amount: 845050.75 },
        { month: "Dec 2024", amount: 856842.63, projected: false },
      ],
    },
    stats: {
      averageOrderValue: 78542.80,
      paymentSuccessRate: 98.5,
      pendingOrders: 15,
      totalCustomers: 42
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount/100000).toFixed(2)} Lakh`;
    }
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      processing: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      completed: "bg-green-100 text-green-800 border border-green-200",
      pending: "bg-blue-100 text-blue-800 border border-blue-200",
      shipped: "bg-blue-100 text-blue-800 border border-blue-200",
      delivered: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      packed: "bg-purple-100 text-purple-800 border border-purple-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-800 border border-gray-200"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMaterialTypeBadge = (materialType) => {
    const materialStyles = {
      cement: "bg-gray-100 text-gray-800 border border-gray-200",
      steel: "bg-red-100 text-red-800 border border-red-200",
      tiles: "bg-blue-100 text-blue-800 border border-blue-200",
      pipes: "bg-green-100 text-green-800 border border-green-200",
      fittings: "bg-purple-100 text-purple-800 border border-purple-200",
      paint: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      putty: "bg-indigo-100 text-indigo-800 border border-indigo-200",
      bricks: "bg-orange-100 text-orange-800 border border-orange-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs ${
          materialStyles[materialType?.toLowerCase()] || "bg-gray-100 text-gray-800"
        }`}
      >
        {materialType}
      </span>
    );
  };

  // Calculate max amount for chart scaling
  const maxAmount = Math.max(
    ...paymentData.overTime.timeline.map((item) => item.amount)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
              <FaMoneyBillWave className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payments & Settlements</h1>
              <p className="text-gray-600">Track your construction material sales revenue and payments</p>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Upcoming Payments</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentData.upcoming.amount)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FaClock className="text-yellow-600 text-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Next 7 Days: {formatCurrency(paymentData.upcoming.next7Days)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Received</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentData.completed.total)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Last 30 Days: {formatCurrency(paymentData.completed.last30Days)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentData.overTime.outstanding)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FaFileInvoiceDollar className="text-red-600 text-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Average Order: {formatCurrency(paymentData.stats.averageOrderValue)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Payment Success</p>
                <p className="text-2xl font-bold text-gray-900">{paymentData.stats.paymentSuccessRate}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-blue-600 text-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Pending Orders: {paymentData.stats.pendingOrders}
              </div>
            </div>
          </div>
        </div>

        {/* Time Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-gray-600 text-sm">
                <FaFilter className="mr-2" />
                <span>Filter by Time:</span>
              </div>
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === "last30days"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setTimeFilter("last30days")}
                >
                  Last 30 Days
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === "custom"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setTimeFilter("custom")}
                >
                  Custom Range
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  onClick={() => setTimeFilter("all")}
                >
                  All Time
                </button>
              </div>
            </div>

            {timeFilter === "custom" && (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Payments Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Payments</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Next 7 days: <span className="font-medium">{formatCurrency(paymentData.upcoming.next7Days)}</span></span>
              <span className="mx-2">•</span>
              <span>Total upcoming: <span className="font-medium">{formatCurrency(paymentData.upcoming.amount)}</span></span>
            </div>
          </div>

          {paymentData.upcoming.payments.length > 0 ? (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paymentData.upcoming.payments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2" />
                            <span className="text-sm">{formatDate(payment.date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {payment.orders} orders
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors flex items-center"
                            onClick={() => setSelectedUpcomingPayment(payment)}
                          >
                            <FaEye className="mr-1" />
                            View Orders
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FaClock className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-600">No upcoming payments to show</p>
              <p className="text-sm text-gray-500 mt-1">
                Your upcoming payouts will appear here once construction material orders are delivered.
              </p>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Payment Summary</h2>
            <div className="text-sm text-gray-600">
              Last 30 days: <span className="font-medium">{formatCurrency(paymentData.completed.last30Days)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Net Order Amount</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(paymentData.summary.totalNetOrderAmount)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Platform Recovery</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(paymentData.summary.totalPlatformRecovery)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Platform Compensation</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(paymentData.summary.totalPlatformCompensation)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Amount Received</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(paymentData.summary.totalAmount)}
              </p>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-4">Completed Payments</h3>
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Order Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Platform Recovery
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Platform Compensation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Net Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paymentData.completed.payments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm">{payment.date}</td>
                        <td className="px-6 py-4 text-sm">
                          {formatCurrency(payment.orderAmount)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatCurrency(payment.platformRecovery)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatCurrency(payment.platformCompensation)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {formatCurrency(payment.netAmount)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {payment.orders || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{payment.paymentId}</span>
                            <button
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              To view earlier payouts, please download the detailed report.
            </div>
            <div className="flex space-x-3">
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center">
                <FaDownload className="mr-2" />
                Download Report
              </button>
              <button
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                onClick={() => navigate("/seller/payment-details")}
              >
                View All Payments
              </button>
            </div>
          </div>
        </div>

        {/* Payments Over Time Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Payments Over Time</h2>
            <div className="text-sm text-gray-600">
              Outstanding: <span className="font-medium text-red-600">{formatCurrency(paymentData.overTime.outstanding)}</span>
            </div>
          </div>

          {paymentData.overTime.timeline.length > 0 ? (
            <div className="mt-6">
              <div className="flex items-end h-48 gap-6 mt-6 border-b border-gray-200">
                {paymentData.overTime.timeline.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-full rounded-t-lg max-w-20 ${
                        item.projected ? "bg-orange-200" : "bg-orange-500"
                      }`}
                      style={{ height: `${(item.amount / maxAmount) * 100}%` }}
                      title={formatCurrency(item.amount)}
                    ></div>
                    <div className="text-xs text-gray-500 mt-3 whitespace-nowrap">
                      {item.month}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {paymentData.overTime.timeline.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">{item.month}</div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(item.amount)}
                    </div>
                    {item.projected && (
                      <div className="text-xs text-orange-600 mt-1">Projected</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FaChartLine className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-600">No Trend to Show</p>
              <p className="text-sm text-gray-500 mt-1">
                There is no sufficient data to show the results in the selected timeframe.
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Payment Details Modal */}
        {selectedUpcomingPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Construction Material Orders for Payment on {formatDate(selectedUpcomingPayment.date)}
                    </h2>
                    <div className="mt-2 text-sm text-gray-600">
                      Total Amount: <span className="font-medium">{formatCurrency(selectedUpcomingPayment.amount)}</span> | 
                      Orders: <span className="font-medium">{selectedUpcomingPayment.orders}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUpcomingPayment(null)}
                    className="text-gray-500 hover:text-gray-700 text-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Material Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Expected Delivery
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedUpcomingPayment.orderDetails.map(
                          (order, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium">
                                {order.orderId}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="font-medium">{order.customer}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <FaBuilding className="inline mr-1" />
                                  Construction Company
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div>{order.product}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Bulk Construction Material
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {getMaterialTypeBadge(order.materialType)}
                              </td>
                              <td className="px-6 py-4 text-sm text-center">
                                <div className="font-medium">{order.quantity}</div>
                                <div className="text-xs text-gray-500">units</div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="font-semibold">{formatCurrency(order.amount)}</div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {getStatusBadge(order.status)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center">
                                  <FaTruck className="text-gray-400 mr-1" />
                                  {formatDate(order.expectedDelivery)}
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium" colSpan="5">
                            Total Payment Amount
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold" colSpan="3">
                            {formatCurrency(selectedUpcomingPayment.amount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium transition-colors"
                  onClick={() => setSelectedUpcomingPayment(null)}
                >
                  Close
                </button>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center">
                  <FaDownload className="mr-2" />
                  Download Construction Order Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Payment Date: {selectedPayment.date} | ID: {selectedPayment.paymentId}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="text-gray-500 hover:text-gray-700 text-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3">Transaction Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Order Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedPayment.orderAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Platform Recovery:</span>
                      <span className="font-medium text-red-600">{formatCurrency(selectedPayment.platformRecovery)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Platform Compensation:</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedPayment.platformCompensation)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-medium">Net Amount:</span>
                      <span className="text-lg font-semibold text-gray-900">{formatCurrency(selectedPayment.netAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3">Transaction Details</h3>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">
                            Transaction Type
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">
                            Details
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 text-sm">Construction Materials</td>
                          <td className="p-3 text-sm">{selectedPayment.details}</td>
                          <td className="p-3 text-sm">{formatCurrency(selectedPayment.amount)}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-3 text-sm" colSpan="2">
                            <span className="font-medium">Net platform recovery</span>
                          </td>
                          <td className="p-3 text-sm">{formatCurrency(0)}</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-sm pl-6">Construction Material Ads</td>
                          <td className="p-3 text-sm"></td>
                          <td className="p-3 text-sm">{formatCurrency(0)}</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-sm pl-6">Brick's Kart Program Cost</td>
                          <td className="p-3 text-sm"></td>
                          <td className="p-3 text-sm">{formatCurrency(0)}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-3 text-sm" colSpan="2">
                            <span className="font-medium">Net platform compensation</span>
                          </td>
                          <td className="p-3 text-sm">{formatCurrency(0)}</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-sm pl-6">Construction Referral Program</td>
                          <td className="p-3 text-sm"></td>
                          <td className="p-3 text-sm">{formatCurrency(0)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Payment ID:</span> {selectedPayment.paymentId}
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium transition-colors"
                  onClick={() => setSelectedPayment(null)}
                >
                  Close
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center">
                  <FaDownload className="mr-2" />
                  Download Payment Statement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsDashboard;