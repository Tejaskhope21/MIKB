// src/components/seller/OrderList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Eye,
  Truck,
  CheckCircle,
  Package,
  Clock,
  XCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

<<<<<<< HEAD
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://bricks-backend-qyea.onrender.com/api";
=======
const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-backend-qyea.onrender.com/api/v1';

>>>>>>> 5b54669abee385c3f19fca9c3783fe66a3020392

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: "",
    carrier: "",
  });

  useEffect(() => {
    fetchSellerOrders();
  }, [filters, pagination.page]);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      }).toString();

      const response = await axios.get(
        `${API_URL}/orders/seller?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("API Response:", response.data); // Debug log

      if (response.data && response.data.success) {
        setOrders(response.data.orders || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: response.data.pages || 1,
        }));
      } else {
        setOrders([]);
        setError(response.data?.message || "No orders found");
      }
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      setError("Failed to load orders. Please try again.");

      // More detailed error handling
      if (error.response) {
        console.error("Error response:", error.response.data);
        if (error.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else if (error.response.status === 403) {
          setError("Access denied. You may not have seller privileges.");
        } else if (error.response.status === 500) {
          setError("Server error. Please contact support.");
        }
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, extraData = {}) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        {
          status: newStatus,
          ...extraData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        // Refresh orders after status update
        fetchSellerOrders();
        setShowTrackingModal(false);
        setTrackingInfo({ trackingNumber: "", carrier: "" });
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(error.response?.data?.message || "Failed to update order status");
    }
  };

  const handleShipped = (orderId) => {
    setCurrentOrderId(orderId);
    setShowTrackingModal(true);
  };

  const confirmShipped = () => {
    if (!trackingInfo.trackingNumber.trim() || !trackingInfo.carrier.trim()) {
      alert("Please enter both tracking number and courier partner");
      return;
    }
    updateOrderStatus(currentOrderId, "shipped", {
      trackingNumber: trackingInfo.trackingNumber.trim(),
      carrier: trackingInfo.carrier.trim(),
    });
  };

<<<<<<< HEAD
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      paid: "bg-blue-100 text-blue-800 border border-blue-200",
      shipped: "bg-indigo-100 text-indigo-800 border border-indigo-200",
      delivered: "bg-green-100 text-green-800 border border-green-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
=======
            const response = await axios.get(
            `${API_URL}/orders/seller/orders?${queryParams}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

            if (response.data.success) {
                setOrders(response.data.orders || []);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching seller orders:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                alert('Failed to load orders. Please try again.');
            }
            setOrders([]);
        } finally {
            setLoading(false);
        }
>>>>>>> 5b54669abee385c3f19fca9c3783fe66a3020392
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      paid: <Package className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
    };

    const label = {
      pending: "Pending",
      paid: "Paid / Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-800 border border-gray-200"}`}
      >
        {icons[status] || <Package className="w-4 h-4" />}
        {label[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Safe image fallback
  const getProductImage = (images) => {
    if (Array.isArray(images) && images.length > 0 && images[0]) {
      return images[0];
    }
    return "https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image";
  };

  // Get category name safely
  const getCategoryName = (product) => {
    if (!product) return "Unknown Product";
    const cat = product.categoryId;
    const subcat = product.subcategoryId;

    if (subcat && (subcat.name || subcat.title)) {
      return subcat.name || subcat.title;
    }
    if (cat && (cat.name || cat.title)) {
      return cat.name || cat.title;
    }
    return "Uncategorized";
  };

  // Get shipping address safely
  const getShippingAddress = (order) => {
    if (!order.shippingAddress) return "N/A";
    const addr = order.shippingAddress;
    return (
      <div className="space-y-1">
        <div>{addr.address || ""}</div>
        <div>{[addr.city, addr.state].filter(Boolean).join(", ")}</div>
        {addr.pincode && <div>PIN: {addr.pincode}</div>}
        {addr.phone && <div>Phone: {addr.phone}</div>}
      </div>
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const resetFilters = () => {
    setFilters({ search: "", status: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Customer Orders
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and fulfill orders from your customers
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid / Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {(filters.search || filters.status) && (
            <button
              onClick={resetFilters}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && !loading && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={fetchSellerOrders}
              className="text-sm font-medium text-red-700 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#800000] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#660000] transition font-medium"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer & Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <React.Fragment key={order._id}>
                      {order.items?.map((item, idx) => (
                        <tr
                          key={`${order._id}-${item._id || idx}`}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Order Info - Only on first row */}
                          {idx === 0 && (
                            <>
                              <td
                                rowSpan={order.items?.length || 1}
                                className="px-6 py-4 align-top whitespace-nowrap"
                              >
                                <div className="text-sm font-bold text-gray-900">
                                  #
                                  {order.orderId ||
                                    order._id?.slice(-6).toUpperCase() ||
                                    "N/A"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatDate(order.createdAt)}
                                </div>
                              </td>

                              {/* Customer & Shipping Address */}
                              <td
                                rowSpan={order.items?.length || 1}
                                className="px-6 py-4 align-top"
                              >
                                <div className="text-sm font-medium text-gray-900">
                                  {order.user?.name || "Guest Customer"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.user?.email || "N/A"}
                                </div>

                                <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
                                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div className="min-w-0">
                                    {getShippingAddress(order)}
                                  </div>
                                </div>
                              </td>
                            </>
                          )}

                          {/* Product Item */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <img
                                  src={getProductImage(item.product?.images)}
                                  alt={item.product?.name || "Product"}
                                  className="w-16 h-16 rounded-lg object-cover shadow-sm border border-gray-200"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image";
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">
                                  {item.product?.name || "Unknown Product"}
                                </div>
                                {item.product?.brand && (
                                  <div className="text-xs text-gray-500">
                                    Brand: {item.product.brand}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  Category: {getCategoryName(item.product)}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Qty: <strong>{item.quantity || 0}</strong> × ₹
                                  {item.price?.toLocaleString("en-IN") || "0"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Total & Payment - Only on first row */}
                          {idx === 0 && (
                            <>
                              <td
                                rowSpan={order.items?.length || 1}
                                className="px-6 py-4 align-top whitespace-nowrap"
                              >
                                <div className="text-lg font-bold text-gray-900">
                                  ₹
                                  {order.totalPrice?.toLocaleString("en-IN") ||
                                    "0"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  via{" "}
                                  {order.paymentMethod === "COD"
                                    ? "Cash on Delivery"
                                    : "Online Payment"}
                                </div>
                              </td>

                              <td
                                rowSpan={order.items?.length || 1}
                                className="px-6 py-4 align-top"
                              >
                                {getStatusBadge(order.status)}
                              </td>

                              <td
                                rowSpan={order.items?.length || 1}
                                className="px-6 py-4 align-top"
                              >
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() =>
                                      navigate(`/seller/orders/${order._id}`)
                                    }
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </button>

                                  {order.status === "pending" && (
                                    <button
                                      onClick={() =>
                                        updateOrderStatus(order._id, "paid")
                                      }
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                    >
                                      Mark as Paid
                                    </button>
                                  )}

                                  {order.status === "paid" && (
                                    <button
                                      onClick={() => handleShipped(order._id)}
                                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                                    >
                                      Mark as Shipped
                                    </button>
                                  )}

                                  {order.status === "shipped" && (
                                    <button
                                      onClick={() =>
                                        updateOrderStatus(
                                          order._id,
                                          "delivered",
                                        )
                                      }
                                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium"
                                    >
                                      Mark as Delivered
                                    </button>
                                  )}

                                  {order.status === "delivered" && (
                                    <div className="text-xs text-center text-gray-500 mt-1">
                                      Order completed
                                    </div>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-semibold">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}
                  </span>{" "}
                  of <span className="font-semibold">{pagination.total}</span>{" "}
                  orders
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`p-2 rounded-lg border ${pagination.page === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (
                          pagination.page >=
                          pagination.totalPages - 2
                        ) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium ${pagination.page === pageNum ? "bg-[#800000] text-white" : "text-gray-700 hover:bg-gray-100"}`}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`p-2 rounded-lg border ${pagination.page === pagination.totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Shipping Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Mark as Shipped
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DL123456789IN"
                  value={trackingInfo.trackingNumber}
                  onChange={(e) =>
                    setTrackingInfo({
                      ...trackingInfo,
                      trackingNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Courier Partner
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhivery, Blue Dart, India Post"
                  value={trackingInfo.carrier}
                  onChange={(e) =>
                    setTrackingInfo({
                      ...trackingInfo,
                      carrier: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8 justify-end">
              <button
                onClick={() => {
                  setShowTrackingModal(false);
                  setTrackingInfo({ trackingNumber: "", carrier: "" });
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmShipped}
                className="px-6 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#660000] transition font-medium shadow-md"
              >
                Confirm Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
