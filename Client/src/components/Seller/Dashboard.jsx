import React, { useState, useEffect } from 'react';
import {
    Package, ShoppingBag, DollarSign, Users,
    TrendingUp, AlertCircle, Clock, CheckCircle,
    BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SellerDashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/seller/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStats(response.data.stats);
                setRecentOrders(response.data.recentOrders || []);
                setLowStockProducts(response.data.lowStockProducts || []);
                setMonthlyRevenue(response.data.monthlyRevenue || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: Package,
            color: 'bg-blue-500',
            trend: '+12%'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: 'bg-green-500',
            trend: '+8%'
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            icon: Clock,
            color: 'bg-yellow-500',
            trend: '-3%'
        },
        {
            title: 'Total Revenue',
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-purple-500',
            trend: '+15%'
        }
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <span className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                        <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
                            <a href="/seller/orders" className="text-blue-600 hover:text-blue-800 text-sm">
                                View All
                            </a>
                        </div>
                        <div className="space-y-4">
                            {recentOrders.slice(0, 5).map((order) => (
                                <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-800">Order #{order.orderId}</p>
                                        <p className="text-sm text-gray-600">
                                            {order.userId?.name} • {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">₹{order.total}</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Low Stock Alert</h2>
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="space-y-4">
                            {lowStockProducts.slice(0, 5).map((product) => (
                                <div key={product._id} className="flex items-center p-3 bg-red-50 rounded-lg">
                                    <div className="w-10 h-10 bg-gray-200 rounded-md mr-3">
                                        {product.images?.[0] && (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-gray-600">SKU: {product.inventory.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600">{product.inventory.stock}</p>
                                        <p className="text-xs text-gray-600">left</p>
                                    </div>
                                </div>
                            ))}
                            {lowStockProducts.length === 0 && (
                                <p className="text-center text-gray-500 py-4">All products have sufficient stock</p>
                            )}
                        </div>
                        {lowStockProducts.length > 5 && (
                            <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-800 text-sm">
                                View All ({lowStockProducts.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="mt-6 bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Revenue</h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {monthlyRevenue.map((month, index) => (
                        <div key={index} className="text-center">
                            <div className="mb-2">
                                <div
                                    className="w-full bg-blue-100 rounded-md mx-auto"
                                    style={{ height: '100px' }}
                                >
                                    <div
                                        className="bg-blue-500 rounded-b-md"
                                        style={{
                                            height: `${Math.min(100, (month.revenue / Math.max(...monthlyRevenue.map(m => m.revenue))) * 100)}%`,
                                            width: '100%',
                                            position: 'relative',
                                            bottom: 0
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-gray-800">₹{month.revenue.toLocaleString()}</p>
                            <p className="text-xs text-gray-600">
                                {new Date(2000, month.month - 1).toLocaleString('default', { month: 'short' })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow text-center">
                    <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="font-medium text-gray-800">Add Product</p>
                </button>
                <button className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow text-center">
                    <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-gray-800">View Analytics</p>
                </button>
                <button className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow text-center">
                    <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="font-medium text-gray-800">Request Payout</p>
                </button>
                <button className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow text-center">
                    <CheckCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="font-medium text-gray-800">Process Orders</p>
                </button>
            </div>
        </div>
    );
};

export default SellerDashboard;