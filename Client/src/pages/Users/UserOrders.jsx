import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UserOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserOrders();
    }, []);

    const fetchUserOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'processing': return <Clock className="w-5 h-5 text-blue-600" />;
            case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Package className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-xl shadow p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-medium text-gray-800">Order #{order.orderId}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(order.status)}
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <div className="text-gray-700">
                                        <span className="font-medium">Total: ₹{order.total}</span>
                                        <span className="text-sm text-gray-500 ml-4">
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <button className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserOrdersPage;