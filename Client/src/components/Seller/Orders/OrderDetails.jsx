import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, User, MapPin, Phone, Mail, Calendar, CreditCard, Printer, MessageSquare } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-backend-navy.vercel.app/api';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/seller/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setOrder(response.data.order);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            alert('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (newStatus) => {
        if (!window.confirm(`Change order status to ${newStatus}?`)) return;

        try {
            setUpdating(true);
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/seller/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setOrder({ ...order, status: newStatus });
                alert('Order status updated successfully');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusSteps = () => {
        const steps = [
            { status: 'pending', label: 'Order Placed', icon: Package },
            { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
            { status: 'processing', label: 'Processing', icon: Package },
            { status: 'shipped', label: 'Shipped', icon: Truck },
            { status: 'delivered', label: 'Delivered', icon: CheckCircle }
        ];

        const currentIndex = steps.findIndex(step => step.status === order?.status);
        return steps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            current: index === currentIndex
        }));
    };

    const printOrder = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-800">Order not found</h2>
                <button
                    onClick={() => navigate('/seller/orders')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    const statusSteps = getStatusSteps();

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/seller/orders')}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Order #{order.orderId}</h1>
                        <p className="text-gray-600">
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={printOrder}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Printer className="w-4 h-4" />
                            Print Invoice
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <MessageSquare className="w-4 h-4" />
                            Contact Customer
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Timeline */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                        <div className="relative">
                            <div className="flex justify-between mb-8">
                                {statusSteps.map((step, index) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.status} className="flex flex-col items-center relative z-10">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${step.completed ? 'bg-green-100 text-green-600' :
                                                step.current ? 'bg-blue-100 text-blue-600' :
                                                    'bg-gray-100 text-gray-400'
                                                }`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className={`text-sm font-medium ${step.completed ? 'text-green-700' :
                                                step.current ? 'text-blue-700' :
                                                    'text-gray-500'
                                                }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="absolute top-6 left-12 right-12 h-1 bg-gray-200">
                                <div
                                    className="h-1 bg-green-500 transition-all duration-300"
                                    style={{ width: `${(statusSteps.filter(s => s.completed).length / 4) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Status Update Buttons */}
                        <div className="flex flex-wrap gap-2 mt-6">
                            {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => updateOrderStatus(status)}
                                    disabled={updating || order.status === status}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${order.status === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/50'}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg mr-4"
                                        />
                                        <div>
                                            <h3 className="font-medium text-gray-800">{item.name}</h3>
                                            <p className="text-sm text-gray-500">SKU: {item.sku || 'N/A'}</p>
                                            {item.variant && (
                                                <p className="text-sm text-gray-500">Variant: {item.variant}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-800">₹{item.price.toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            Subtotal: ₹{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{order.subtotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">₹{order.shipping?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">₹{order.tax?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                    <span>Total</span>
                                    <span>₹{order.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer & Shipping Info */}
                <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Customer Information
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{order.customer?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium flex items-center">
                                    <Mail className="w-4 h-4 mr-1" />
                                    {order.customer?.email || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium flex items-center">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {order.customer?.phone || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            Shipping Address
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium">{order.shippingAddress?.address || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">City & ZIP</p>
                                <p className="font-medium">
                                    {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">State & Country</p>
                                <p className="font-medium">
                                    {order.shippingAddress?.state}, {order.shippingAddress?.country}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2" />
                            Payment Information
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Payment Method</p>
                                <p className="font-medium capitalize">
                                    {order.payment?.method || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Transaction ID</p>
                                <p className="font-medium text-sm">
                                    {order.payment?.transactionId || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Payment Status</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.payment?.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.payment?.status || 'pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2" />
                                Order Notes
                            </h2>
                            <p className="text-gray-700">{order.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;