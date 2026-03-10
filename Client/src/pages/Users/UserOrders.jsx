import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setOrders(res.data.orders || []);
      } else {
        setError("Failed to load orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load orders");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIconAndColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
      case "processing":
        return { icon: Package, color: "bg-orange-100 text-orange-800 border-orange-200" };
      case "shipped":
        return { icon: Truck, color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "delivered":
        return { icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-200" };
      case "cancelled":
        return { icon: XCircle, color: "bg-red-100 text-red-800 border-red-200" };
      default:
        return { icon: Clock, color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
          <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300"></div>
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="mb-10">
            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-orange-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            No Orders Yet
          </h1>
          <p className="text-gray-600 mb-8">
            You haven't placed any orders yet. Start exploring our products and find something you love!
          </p>
          <Link
            to="/"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-sm hover:shadow-xl transform hover:scale-[1.02]"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Track and manage all your orders in one place
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-orange-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white rounded-xl border border-green-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status?.toLowerCase() === 'delivered').length}
            </div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => ['shipped', 'processing'].includes(o.status?.toLowerCase())).length}
            </div>
            <div className="text-sm text-gray-600">In Transit</div>
          </div>
          <div className="bg-white rounded-xl border border-orange-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              ₹{orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => {
            const { icon: StatusIcon, color: statusColor } =
              getStatusIconAndColor(order.status);

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-300 group"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-orange-100">Order ID</p>
                      <h3 className="text-xl font-bold">
                        #{order.orderId || order._id?.slice(-8)}
                      </h3>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full ${statusColor} text-sm font-medium flex items-center gap-1.5 border bg-white shadow-sm`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-orange-100 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Total Amount */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{order.totalPrice?.toLocaleString("en-IN") || "0"}
                      </p>
                    </div>

                    {/* Items Summary */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Items ({order.items?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200"
                          >
                            {item.quantity} × {item.name?.substring(0, 10) || "Product"}
                            {item.name?.length > 10 ? "..." : ""}
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Payment</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                        </p>
                      </div>
                      {order.paymentStatus && (
                        <div className={`text-sm px-3 py-1 rounded-full ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-lg group-hover:scale-[1.02]"
                  >
                    <Eye className="w-5 h-5" />
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Need Help Section */}
        <div className="mt-12 bg-orange-50 rounded-xl border border-orange-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Need Help with Your Orders?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our customer support team is here to assist you with any questions about your orders, returns, or refunds.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/contact"
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg"
            >
              Contact Support
            </Link>
            <Link
              to="/faq"
              className="px-6 py-3 bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-medium rounded-lg transition-all duration-300"
            >
              Visit FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;