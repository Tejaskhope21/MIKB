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
            }
        } catch (error) {
            console.error('Error fetching seller orders:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
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
        if (!trackingInfo.trackingNumber || !trackingInfo.carrier) {
            alert('Please fill both tracking number and carrier');
            return;
        }
        updateOrderStatus(currentOrderId, 'shipped', {
            trackingNumber: trackingInfo.trackingNumber,
            carrier: trackingInfo.carrier
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

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {icons[status] || <Package className="w-4 h-4" />}
                <span className="capitalize">{status === 'paid' ? 'Confirmed/Paid' : status}</span>
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

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Customer Orders</h1>
                <p className="text-gray-600 mt-2">Manage and fulfill orders from your customers</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer Name..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] outline-none"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] outline-none"
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
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#800000] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Orders Found</h3>
                        <p className="text-gray-500">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer & Shipping</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <React.Fragment key={order._id}>
                                        {order.items.map((item, idx) => (
                                            <tr key={`${order._id}-${item._id}`} className="hover:bg-gray-50 transition-colors">
                                                {idx === 0 && (
                                                    <>
                                                        {/* Order Info */}
                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            <div className="text-sm font-bold text-gray-900">{order.orderId || 'N/A'}</div>
                                                            <div className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</div>
                                                        </td>

                                                        {/* Customer & Full Shipping Address */}
                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {order.user?.name || 'Guest Customer'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{order.user?.email || 'N/A'}</div>

                                                            {/* Shipping Address with Icon */}
                                                            <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
                                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <div className="font-medium">{order.shippingAddress.address}</div>
                                                                    <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                                                                    <div className="font-semibold">PIN: {order.shippingAddress.pincode}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}

                                                {/* Product Item */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                                                            alt={item.product?.name}
                                                            className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</div>
                                                            <div className="text-xs text-gray-500">
                                                                Qty: {item.quantity} × ₹{item.price?.toLocaleString() || '0'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {idx === 0 && (
                                                    <>
                                                        {/* Total Price & Payment Method */}
                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            <div className="text-sm font-bold text-gray-900">
                                                                ₹{order.totalPrice?.toLocaleString() || '0'}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                via {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}
                                                            </div>
                                                        </td>

                                                        {/* Status Badge */}
                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            {getStatusBadge(order.status)}
                                                        </td>

                                                        {/* Actions */}
                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            <div className="flex flex-col gap-2">
                                                                <button
                                                                    onClick={() => navigate(`/seller/orders/${order._id}`)}
                                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    View Details
                                                                </button>

                                                                {order.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => updateOrderStatus(order._id, 'paid')}
                                                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                                    >
                                                                        Mark as Paid
                                                                    </button>
                                                                )}

                                                                {order.status === 'paid' && (
                                                                    <button
                                                                        onClick={() => handleShipped(order._id)}
                                                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                                    >
                                                                        Mark as Shipped
                                                                    </button>
                                                                )}

                                                                {order.status === 'shipped' && (
                                                                    <button
                                                                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                                                                        className="text-green-600 hover:text-green-800 text-sm font-bold"
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

            {/* Shipping Details Modal */}
            {showTrackingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-5">Mark Order as Shipped</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. DL123456789IN"
                                    value={trackingInfo.trackingNumber}
                                    onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Courier Partner</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Delhivery, Blue Dart, DTDC"
                                    value={trackingInfo.carrier}
                                    onChange={(e) => setTrackingInfo({ ...trackingInfo, carrier: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button
                                onClick={() => {
                                    setShowTrackingModal(false);
                                    setTrackingInfo({ trackingNumber: '', carrier: '' });
                                }}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmShipped}
                                className="px-5 py-2.5 bg-[#800000] text-white rounded-lg hover:bg-[#660000] transition shadow-md"
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