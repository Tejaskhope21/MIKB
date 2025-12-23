// src/components/seller/OrderList.jsx (or wherever your file is)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    Eye,
    Truck,
    CheckCircle,
    Package,
    Clock,
    XCircle,
    MapPin
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-com-backend.vercel.app/api';

const OrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        page: 1,
        limit: 10
    });

    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [trackingInfo, setTrackingInfo] = useState({
        trackingNumber: '',
        carrier: ''
    });

    useEffect(() => {
        fetchSellerOrders();
    }, [filters]);

    const fetchSellerOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const queryParams = new URLSearchParams({
                page: filters.page,
                limit: filters.limit,
                ...(filters.search && { search: filters.search }),
                ...(filters.status && { status: filters.status })
            }).toString();

            const response = await axios.get(`${API_URL}/orders/seller?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

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
    };

    const updateOrderStatus = async (orderId, newStatus, extraData = {}) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/orders/${orderId}/status`,
                { status: newStatus, ...extraData },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh orders after status update
            fetchSellerOrders();
            setShowTrackingModal(false);
            setTrackingInfo({ trackingNumber: '', carrier: '' });
        } catch (error) {
            console.error('Failed to update status:', error);
            alert(error.response?.data?.message || 'Failed to update order status');
        }
    };

    const handleShipped = (orderId) => {
        setCurrentOrderId(orderId);
        setShowTrackingModal(true);
    };

    const confirmShipped = () => {
        if (!trackingInfo.trackingNumber.trim() || !trackingInfo.carrier.trim()) {
            alert('Please enter both tracking number and courier partner');
            return;
        }
        updateOrderStatus(currentOrderId, 'shipped', {
            trackingNumber: trackingInfo.trackingNumber.trim(),
            carrier: trackingInfo.carrier.trim()
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-blue-100 text-blue-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        const icons = {
            pending: <Clock className="w-4 h-4" />,
            paid: <Package className="w-4 h-4" />,
            shipped: <Truck className="w-4 h-4" />,
            delivered: <CheckCircle className="w-4 h-4" />,
            cancelled: <XCircle className="w-4 h-4" />
        };

        const label = {
            pending: 'Pending',
            paid: 'Paid / Confirmed',
            shipped: 'Shipped',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {icons[status] || <Package className="w-4 h-4" />}
                {label[status] || status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Safe image fallback
    const getProductImage = (images) => {
        if (Array.isArray(images) && images.length > 0 && images[0]) {
            return images[0];
        }
        return 'https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image';
    };

    // Get category name safely
    const getCategoryName = (product) => {
        if (!product) return 'Unknown Product';
        const cat = product.categoryId;
        const subcat = product.subcategoryId;

        if (subcat && (subcat.name || subcat.title)) {
            return subcat.name || subcat.title;
        }
        if (cat && (cat.name || cat.title)) {
            return cat.name || cat.title;
        }
        return 'Uncategorized';
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Orders</h1>
                <p className="text-gray-600 mt-2">Manage and fulfill orders from your customers</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer Name..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid / Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

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
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Orders Found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer & Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Products</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <React.Fragment key={order._id}>
                                        {order.items.map((item, idx) => (
                                            <tr key={`${order._id}-${item._id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                                                {/* Order Info - Only on first row */}
                                                {idx === 0 && (
                                                    <>
                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top whitespace-nowrap">
                                                            <div className="text-sm font-bold text-gray-900">#{order.orderId || order._id.slice(-6).toUpperCase()}</div>
                                                            <div className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</div>
                                                        </td>

                                                        {/* Customer & Shipping Address */}
                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {order.user?.name || 'Guest Customer'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{order.user?.email || 'N/A'}</div>

                                                            <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
                                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <div>{order.shippingAddress.address}</div>
                                                                    <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                                                                    <div className="font-semibold">PIN: {order.shippingAddress.pincode}</div>
                                                                    {order.shippingAddress.phone && (
                                                                        <div className="mt-1">Phone: {order.shippingAddress.phone}</div>
                                                                    )}
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
                                                                alt={item.product?.name || 'Product'}
                                                                className="w-16 h-16 rounded-lg object-cover shadow-sm border border-gray-200"
                                                                onError={(e) => {
                                                                    e.target.src = 'https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-semibold text-gray-900 truncate">
                                                                {item.product?.name || 'Unknown Product'}
                                                            </div>
                                                            {item.product?.brand && (
                                                                <div className="text-xs text-gray-500">Brand: {item.product.brand}</div>
                                                            )}
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Category: {getCategoryName(item.product)}
                                                            </div>
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                Qty: <strong>{item.quantity}</strong> × ₹{item.price?.toLocaleString('en-IN') || '0'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Total & Payment - Only on first row */}
                                                {idx === 0 && (
                                                    <>
                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top whitespace-nowrap">
                                                            <div className="text-lg font-bold text-gray-900">
                                                                ₹{order.totalPrice?.toLocaleString('en-IN') || '0'}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                via {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                                                            </div>
                                                        </td>

                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            {getStatusBadge(order.status)}
                                                        </td>

                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            <div className="flex flex-col gap-3">
                                                                <button
                                                                    onClick={() => navigate(`/seller/orders/${order._id}`)}
                                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    View Details
                                                                </button>

                                                                {order.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => updateOrderStatus(order._id, 'paid')}
                                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                                                    >
                                                                        Mark as Paid
                                                                    </button>
                                                                )}

                                                                {order.status === 'paid' && (
                                                                    <button
                                                                        onClick={() => handleShipped(order._id)}
                                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                                                                    >
                                                                        Mark as Shipped
                                                                    </button>
                                                                )}

                                                                {order.status === 'shipped' && (
                                                                    <button
                                                                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                                                                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium"
                                                                    >
                                                                        Mark as Delivered
                                                                    </button>
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
                )}
            </div>

            {/* Shipping Tracking Modal */}
            {showTrackingModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Mark as Shipped</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tracking Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. DL123456789IN"
                                    value={trackingInfo.trackingNumber}
                                    onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Courier Partner</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Delhivery, Blue Dart, India Post"
                                    value={trackingInfo.carrier}
                                    onChange={(e) => setTrackingInfo({ ...trackingInfo, carrier: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8 justify-end">
                            <button
                                onClick={() => {
                                    setShowTrackingModal(false);
                                    setTrackingInfo({ trackingNumber: '', carrier: '' });
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