import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    Eye,
    ShoppingBag
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-backend-qyea.onrender.com/api';

const MyOrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await axios.get(`${API_URL}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setOrders(res.data.orders || []);
            } else {
                setError('Failed to load orders');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || 'Failed to load orders');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusIconAndColor = (status) => {
        switch (status) {
            case 'pending':
                return { icon: Clock, color: 'text-yellow-600 bg-yellow-100' };
            case 'paid':
                return { icon: Package, color: 'text-blue-600 bg-blue-100' };
            case 'shipped':
                return { icon: Truck, color: 'text-indigo-600 bg-indigo-100' };
            case 'delivered':
                return { icon: CheckCircle, color: 'text-green-600 bg-green-100' };
            case 'cancelled':
                return { icon: XCircle, color: 'text-red-600 bg-red-100' };
            default:
                return { icon: Clock, color: 'text-gray-600 bg-gray-100' };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#800000] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
                    <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">No Orders Yet</h1>
                    <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
                    <Link
                        to="/"
                        className="inline-block bg-[#800000] text-white px-8 py-4 rounded-lg hover:bg-[#900000] font-semibold text-lg"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-2">Track and manage all your orders in one place</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {orders.map((order) => {
                        const { icon: StatusIcon, color: statusColor } = getStatusIconAndColor(order.status);

                        return (
                            <div
                                key={order._id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-[#800000] to-[#900000] text-white p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm opacity-90">Order ID</p>
                                            <h3 className="text-xl font-bold">{order.orderId || 'N/A'}</h3>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full ${statusColor} text-sm font-bold flex items-center gap-2`}>
                                            <StatusIcon className="w-4 h-4" />
                                            <span className="capitalize">{order.status}</span>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm opacity-90">
                                        Placed on {formatDate(order.createdAt)}
                                    </p>
                                </div>

                                {/* Body */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₹{order.totalPrice.toLocaleString('en-IN')}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Items ({order.items.length})</p>
                                            <div className="flex flex-wrap gap-2">
                                                {order.items.slice(0, 3).map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                                                    >
                                                        {item.quantity} × Product
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <span className="text-sm text-gray-500">
                                                        +{order.items.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">Payment</p>
                                            <p className="font-medium capitalize">{order.paymentMethod}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 px-6 py-4 border-t">
                                    <button
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                        className="w-full bg-[#800000] hover:bg-[#900000] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                                    >
                                        <Eye className="w-5 h-5" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MyOrdersPage;