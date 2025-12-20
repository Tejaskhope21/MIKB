import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Truck, CheckCircle, XCircle, Package } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-backend-navy.vercel.app/api';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`${API_URL}/seller/orders?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setOrders(response.data.orders);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, itemId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/seller/orders/${orderId}/items/${itemId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchOrders(); // Refresh orders
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-purple-100 text-purple-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'shipped': return <Truck className="w-4 h-4" />;
            case 'delivered': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <Package className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                <p className="text-gray-600">Manage customer orders</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Date Range
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <React.Fragment key={order._id}>
                                        {order.items.map((item, index) => (
                                            <tr key={`${order._id}-${item._id}`} className="hover:bg-gray-50">
                                                {index === 0 && (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap" rowSpan={order.items.length}>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {order.orderId}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap" rowSpan={order.items.length}>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {order.userId?.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {order.userId?.email}
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <img
                                                                className="h-10 w-10 rounded-md object-cover"
                                                                src={item.image || 'https://via.placeholder.com/40'}
                                                                alt={item.name}
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {item.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Qty: {item.quantity} × ₹{item.price}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {index === 0 && (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap" rowSpan={order.items.length}>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                ₹{order.total}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {order.payment.method.toUpperCase()}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap" rowSpan={order.items.length}>
                                                            <div className="flex items-center">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                                    {getStatusIcon(order.status)}
                                                                    <span className="ml-1">{order.status}</span>
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" rowSpan={order.items.length}>
                                                            <div className="flex space-x-2">
                                                                <button className="text-blue-600 hover:text-blue-900">
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                {item.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => updateOrderStatus(order._id, item._id, 'confirmed')}
                                                                        className="text-green-600 hover:text-green-900"
                                                                    >
                                                                        Confirm
                                                                    </button>
                                                                )}
                                                                {item.status === 'confirmed' && (
                                                                    <button
                                                                        onClick={() => updateOrderStatus(order._id, item._id, 'shipped')}
                                                                        className="text-indigo-600 hover:text-indigo-900"
                                                                    >
                                                                        Ship
                                                                    </button>
                                                                )}
                                                                {item.status === 'shipped' && (
                                                                    <button
                                                                        onClick={() => updateOrderStatus(order._id, item._id, 'delivered')}
                                                                        className="text-purple-600 hover:text-purple-900"
                                                                    >
                                                                        Deliver
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderList;