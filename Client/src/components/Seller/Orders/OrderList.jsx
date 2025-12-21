import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    Filter,
    Eye,
    Truck,
    CheckCircle,
    Package,
    Clock,
    XCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

    const updateItemStatus = async (orderId, itemId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/orders/${orderId}/items/${itemId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh orders
            fetchSellerOrders();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-purple-100 text-purple-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        const icons = {
            pending: <Clock className="w-4 h-4" />,
            confirmed: <Package className="w-4 h-4" />,
            processing: <Package className="w-4 h-4" />,
            shipped: <Truck className="w-4 h-4" />,
            delivered: <CheckCircle className="w-4 h-4" />,
            cancelled: <XCircle className="w-4 h-4" />
        };

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {icons[status] || <Package className="w-4 h-4" />}
                <span className="capitalize">{status}</span>
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
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000]"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="w-5 h-5" />
                        More Filters
                    </button>
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
                        <p className="text-gray-600">You don't have any orders matching the current filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Info
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <React.Fragment key={order._id}>
                                        {order.items.map((item, idx) => (
                                            <tr key={`${order._id}-${item._id}`} className="hover:bg-gray-50 transition">
                                                {/* Order ID & Date - only on first row */}
                                                {idx === 0 && (
                                                    <>
                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            <div className="text-sm font-bold text-gray-900">
                                                                {order.orderId}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {formatDate(order.createdAt)}
                                                            </div>
                                                        </td>
                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {order.user?.name || 'Customer'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {order.user?.email}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                📍 {order.shippingAddress.city}
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
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {item.product?.name || 'Product Name'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Total - only on first row */}
                                                {idx === 0 && (
                                                    <>
                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top text-sm font-bold text-gray-900">
                                                            ₹{order.totalPrice.toLocaleString()}
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {order.paymentMethod}
                                                            </div>
                                                        </td>

                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            {getStatusBadge(order.status)}
                                                        </td>

                                                        <td rowSpan={order.items.length} className="px-6 py-4 align-top">
                                                            <div className="flex flex-col gap-2">
                                                                <button
                                                                    onClick={() => navigate(`/seller/orders/${order._id}`)}
                                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    View Details
                                                                </button>

                                                                {/* Status Update Buttons */}
                                                                {order.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => updateItemStatus(order._id, item._id, 'confirmed')}
                                                                        className="text-green-600 hover:text-green-800 text-sm"
                                                                    >
                                                                        Confirm Order
                                                                    </button>
                                                                )}
                                                                {order.status === 'confirmed' && (
                                                                    <button
                                                                        onClick={() => updateItemStatus(order._id, item._id, 'processing')}
                                                                        className="text-purple-600 hover:text-purple-800 text-sm"
                                                                    >
                                                                        Start Processing
                                                                    </button>
                                                                )}
                                                                {order.status === 'processing' && (
                                                                    <button
                                                                        onClick={() => updateItemStatus(order._id, item._id, 'shipped')}
                                                                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                                                                    >
                                                                        Mark as Shipped
                                                                    </button>
                                                                )}
                                                                {order.status === 'shipped' && (
                                                                    <button
                                                                        onClick={() => updateItemStatus(order._id, item._id, 'delivered')}
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
        </div>
    );
};

export default OrderList;