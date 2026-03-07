import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { 
  Truck, 
  CheckCircle, 
  XCircle,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  ArrowLeft,
  Clock
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://bricks-backend-qyea.onrender.com/api";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data.order);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.response?.data?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-6"></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-6"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-12 text-center">
            <div className="text-orange-600 text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {error || "Order not found"}
            </h3>
            <p className="text-gray-600 mb-6">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link
              to="/orders/my-orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/orders/my-orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          Back to My Orders
        </Link>

        {/* Main Order Card */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Order #{order.orderId || order._id?.slice(-8)}
                </h1>
                <div className="flex items-center gap-3 text-orange-100">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-full border ${getStatusColor(order.status)} flex items-center gap-2 bg-white/10 backdrop-blur-sm`}>
                  {getStatusIcon(order.status)}
                  <span className="font-medium capitalize">{order.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Order Summary Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Shipping Address */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Shipping Address
                </h2>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <p className="text-gray-800 font-medium">
                    {order.shippingAddress?.fullName || "Recipient"}
                  </p>
                  <p className="text-gray-600 mt-2">{order.shippingAddress?.address}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </p>
                  {order.shippingAddress?.phone && (
                    <p className="text-gray-600 mt-2">Phone: {order.shippingAddress.phone}</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  Order Summary
                </h2>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-orange-600 text-xl">
                      ₹{order.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                    </span>
                  </div>
                  {order.paymentStatus && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`font-medium ${
                        order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Items Ordered ({order.items?.length || 0})
              </h2>
              
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Image Placeholder */}
                      <div className="w-20 h-20 bg-orange-50 rounded-lg border border-orange-200 flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-orange-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {item.product?.name || item.name || `Product ${idx + 1}`}
                            </h3>
                            {item.brand && (
                              <p className="text-sm text-gray-600 mt-1">Brand: {item.brand}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-orange-600">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              ₹{item.price.toLocaleString()} × {item.quantity}
                            </div>
                          </div>
                        </div>
                        
                        {/* Item Details */}
                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                          {item.unit && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Unit: {item.unit}
                            </span>
                          )}
                          {item.grade && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Grade: {item.grade}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline - Optional */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  {order.timeline.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-orange-600"></div>
                      <div>
                        <p className="font-medium text-gray-900">{event.status}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                        {event.note && (
                          <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Need Help Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="font-semibold text-gray-900 mb-2">Need Help with this Order?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  If you have any questions about your order, please contact our support team.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/contact"
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-2"
                  >
                    Contact Support
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                  {order.status?.toLowerCase() !== 'cancelled' && order.status?.toLowerCase() !== 'delivered' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this order?')) {
                          // Add cancel order logic here
                        }
                      }}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;