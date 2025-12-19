import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, DollarSign, Calendar, Download, Filter } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Analytics = () => {
    const [timeRange, setTimeRange] = useState('last30days');
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState({
        overview: {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalCustomers: 0,
            revenueGrowth: 0,
            orderGrowth: 0
        },
        revenueChart: [],
        topProducts: [],
        recentOrders: []
    });

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/seller/analytics?range=${timeRange}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setAnalyticsData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRevenueChartData = () => {
        // Sample chart data - replace with real data from API
        return [
            { month: 'Jan', revenue: 45000 },
            { month: 'Feb', revenue: 52000 },
            { month: 'Mar', revenue: 48000 },
            { month: 'Apr', revenue: 61000 },
            { month: 'May', revenue: 55000 },
            { month: 'Jun', revenue: 72000 }
        ];
    };

    const exportReport = () => {
        // Implement export functionality
        console.log('Exporting analytics report');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const revenueData = getRevenueChartData();
    const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
                    <p className="text-gray-600">Track your store performance</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="today">Today</option>
                            <option value="last7days">Last 7 Days</option>
                            <option value="last30days">Last 30 Days</option>
                            <option value="last90days">Last 90 Days</option>
                            <option value="thisYear">This Year</option>
                        </select>
                    </div>
                    <button
                        onClick={exportReport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-2">
                                ₹{analyticsData.overview.totalRevenue.toLocaleString()}
                            </h3>
                            <div className="flex items-center mt-2">
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-sm text-green-600">
                                    +{analyticsData.overview.revenueGrowth}% from last period
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Orders</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-2">
                                {analyticsData.overview.totalOrders}
                            </h3>
                            <div className="flex items-center mt-2">
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-sm text-green-600">
                                    +{analyticsData.overview.orderGrowth}% from last period
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Package className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Products</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-2">
                                {analyticsData.overview.totalProducts}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">Active listings</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Package className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Customers</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-2">
                                {analyticsData.overview.totalCustomers}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">Active buyers</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Users className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Chart & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold mb-6">Revenue Overview</h2>
                    <div className="h-64 flex items-end space-x-2">
                        {revenueData.map((item, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <div
                                    className="w-10 bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                                    style={{ height: `${(item.revenue / maxRevenue) * 200}px` }}
                                    title={`₹${item.revenue.toLocaleString()}`}
                                ></div>
                                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mt-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                            <span>Monthly Revenue</span>
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold mb-6">Top Selling Products</h2>
                    <div className="space-y-4">
                        {analyticsData.topProducts.slice(0, 5).map((product, index) => (
                            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <span className="text-gray-400 font-medium w-6">{index + 1}</span>
                                    <img
                                        src={product.image || 'https://via.placeholder.com/40'}
                                        alt={product.name}
                                        className="w-10 h-10 object-cover rounded-lg ml-3"
                                    />
                                    <div className="ml-3">
                                        <h4 className="font-medium text-gray-800">{product.name}</h4>
                                        <p className="text-sm text-gray-500">Sold: {product.soldCount} units</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-800">₹{product.revenue.toLocaleString()}</p>
                                    <p className="text-sm text-green-600">+{product.growth}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {analyticsData.recentOrders.map((order, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-blue-600">#{order.orderId}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{order.customerName}</div>
                                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {new Date(order.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        ₹{order.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;