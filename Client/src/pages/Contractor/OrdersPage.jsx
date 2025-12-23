import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Package, Truck, CheckCircle, Clock, XCircle,
    RefreshCw, Eye, Download, Search, Filter,
    DollarSign, Calendar, MapPin, User, TrendingUp
} from 'lucide-react';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Mock data - replace with API call
            const mockOrders = [
                {
                    _id: 'ORD-2024-001',
                    materialName: 'Cement (UltraTech)',
                    quantity: 100,
                    unit: 'bags',
                    totalAmount: 38000,
                    status: 'delivered',
                    orderDate: '2024-11-15',
                    deliveryDate: '2024-11-16',
                    supplier: 'BuildMart Supplies',
                    deliveryAddress: 'Site 1, Bandra West, Mumbai',
                    paymentStatus: 'paid',
                    trackingId: 'TRK789456123',
                    items: [
                        { name: 'Cement OPC 53', quantity: 100, price: 380, amount: 38000 }
                    ]
                },
                {
                    _id: 'ORD-2024-002',
                    materialName: 'TMT Steel Bars',
                    quantity: 5,
                    unit: 'tons',
                    totalAmount: 310000,
                    status: 'shipped',
                    orderDate: '2024-11-10',
                    estimatedDelivery: '2024-11-18',
                    supplier: 'Steel World',
                    deliveryAddress: 'Project Site, Whitefield, Bangalore',
                    paymentStatus: 'paid',
                    trackingId: 'TRK123456789',
                    items: [
                        { name: 'TMT Bars 12mm', quantity: 2, price: 62000, amount: 124000 },
                        { name: 'TMT Bars 16mm', quantity: 3, price: 62000, amount: 186000 }
                    ]
                },
                {
                    _id: 'ORD-2024-003',
                    materialName: 'Birla White Putty',
                    quantity: 20,
                    unit: 'bags',
                    totalAmount: 8400,
                    status: 'processing',
                    orderDate: '2024-11-12',
                    estimatedDelivery: '2024-11-14',
                    supplier: 'Paint Paradise',
                    deliveryAddress: 'Renovation Site, Kharadi, Pune',
                    paymentStatus: 'pending',
                    items: [
                        { name: 'White Putty', quantity: 20, price: 420, amount: 8400 }
                    ]
                },
                {
                    _id: 'ORD-2024-004',
                    materialName: 'Kajaria Ceramic Tiles',
                    quantity: 50,
                    unit: 'boxes',
                    totalAmount: 115000,
                    status: 'cancelled',
                    orderDate: '2024-11-05',
                    cancellationDate: '2024-11-07',
                    supplier: 'Tile World',
                    deliveryAddress: 'Residential Project, Adyar, Chennai',
                    paymentStatus: 'refunded',
                    cancellationReason: 'Wrong tile size ordered'
                },
                {
                    _id: 'ORD-2024-005',
                    materialName: 'Asian Paints Royale',
                    quantity: 10,
                    unit: 'liters',
                    totalAmount: 80000,
                    status: 'delivered',
                    orderDate: '2024-10-28',
                    deliveryDate: '2024-10-30',
                    supplier: 'Color Masters',
                    deliveryAddress: 'Commercial Complex, Hitech City, Hyderabad',
                    paymentStatus: 'paid',
                    trackingId: 'TRK987654321'
                }
            ];
            setOrders(mockOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="w-4 h-4" />;
            case 'shipped': return <Truck className="w-4 h-4" />;
            case 'processing': return <RefreshCw className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'text-green-600';
            case 'pending': return 'text-yellow-600';
            case 'refunded': return 'text-blue-600';
            case 'failed': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: orders.length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
                    <p className="text-gray-600">Track and manage your material orders</p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all">
                    Order History Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold mt-2 text-green-600">{stats.delivered}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Processing</p>
                    <p className="text-2xl font-bold mt-2 text-yellow-600">{stats.processing}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Shipped</p>
                    <p className="text-2xl font-bold mt-2 text-blue-600">{stats.shipped}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold mt-2 text-red-600">{stats.cancelled}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold mt-2">₹{(stats.totalAmount / 1000).toFixed(1)}K</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by order ID, material, or supplier..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                            <option value="all">All time</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No orders found. Try different search terms.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{order._id}</div>
                                                <div className="text-sm text-gray-500">{order.materialName}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {order.quantity} {order.unit}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium">{order.supplier}</div>
                                                <div className="text-sm text-gray-500">
                                                    <MapPin className="w-3 h-3 inline mr-1" />
                                                    {order.deliveryAddress?.split(',')[0]}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className={`text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-lg">₹{(order.totalAmount / 1000).toFixed(1)}K</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                                                </div>
                                                {order.deliveryDate && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Delivered: {new Date(order.deliveryDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                {order.trackingId && (
                                                    <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg">
                                                        Track
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">Order {selectedOrder._id}</h2>
                                <p className="text-gray-600">{selectedOrder.materialName}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3">Order Status</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Current Status:</span>
                                            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Status:</span>
                                            <span className={`font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                                                {selectedOrder.paymentStatus}
                                            </span>
                                        </div>
                                        {selectedOrder.trackingId && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tracking ID:</span>
                                                <span className="font-medium">{selectedOrder.trackingId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3">Delivery Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Supplier:</span>
                                            <span className="font-medium">{selectedOrder.supplier}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery Address:</span>
                                            <span className="font-medium text-right">{selectedOrder.deliveryAddress}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Order Date:</span>
                                            <span>{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                                        </div>
                                        {selectedOrder.deliveryDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Delivery Date:</span>
                                                <span>{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-3">Order Summary</h3>
                                {selectedOrder.items ? (
                                    <>
                                        <div className="space-y-3 mb-4">
                                            {selectedOrder.items.map((item, index) => (
                                                <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                                                    <div>
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {item.quantity} × ₹{item.price}
                                                        </div>
                                                    </div>
                                                    <div className="font-bold">₹{item.amount}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-2 pt-4 border-t border-gray-300">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>₹{selectedOrder.totalAmount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Shipping:</span>
                                                <span>₹{selectedOrder.totalAmount > 10000 ? 0 : 500}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>GST (18%):</span>
                                                <span>₹{Math.round(selectedOrder.totalAmount * 0.18)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                                                <span>Total:</span>
                                                <span>₹{selectedOrder.totalAmount + (selectedOrder.totalAmount > 10000 ? 0 : 500) + Math.round(selectedOrder.totalAmount * 0.18)}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600">No item details available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Download Invoice
                            </button>
                            {selectedOrder.status === 'processing' && (
                                <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                    Cancel Order
                                </button>
                            )}
                            {selectedOrder.status === 'shipped' && (
                                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Track Shipment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;