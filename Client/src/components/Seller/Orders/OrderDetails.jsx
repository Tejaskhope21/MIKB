// src/components/Seller/Orders/OrderDetails.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle,
    User,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Printer,
    MessageSquare,
    Download,
    Building,
    Globe,
    Phone as PhoneIcon,
    FileText
} from 'lucide-react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-com-backend.vercel.app/api';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const invoiceRef = useRef(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login again');
                navigate('/login');
                return;
            }

            const response = await axios.get(`${API_URL}/orders/seller`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success && Array.isArray(response.data.orders)) {
                const foundOrder = response.data.orders.find(o => o._id === orderId);

                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    alert('Order not found in your records');
                    navigate('/seller/orders');
                }
            } else {
                alert('No orders found');
                navigate('/seller/orders');
            }
        } catch (error) {
            console.error('Error loading order:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                alert('Failed to load order details');
                navigate('/seller/orders');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (newStatus, extraData = {}) => {
        if (!window.confirm(`Mark order as ${newStatus.toUpperCase()}?`)) return;

        try {
            setUpdating(true);
            const token = localStorage.getItem('token');

            await axios.patch(
                `${API_URL}/orders/${orderId}/status`,
                { status: newStatus, ...extraData },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setOrder(prev => ({ ...prev, status: newStatus }));
            alert('Order status updated!');
        } catch (error) {
            console.error('Update failed:', error);
            alert(error.response?.data?.message || 'Failed to update');
        } finally {
            setUpdating(false);
        }
    };

    const handleShipped = () => {
        const tracking = prompt('Enter Tracking Number (e.g. DL123456789IN):');
        if (!tracking?.trim()) return;
        const carrier = prompt('Enter Courier (e.g. Delhivery, DTDC):');
        if (!carrier?.trim()) return;

        updateOrderStatus('shipped', {
            trackingNumber: tracking.trim(),
            carrier: carrier.trim()
        });
    };

    const generatePDF = async () => {
        if (!invoiceRef.current) return;

        const canvas = await html2canvas(invoiceRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`BricksIT_Invoice_${order.orderId || order._id.slice(-8).toUpperCase()}.pdf`);
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-blue-100 text-blue-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        const labels = {
            pending: 'Pending Payment',
            paid: 'Paid / Confirmed',
            shipped: 'Shipped',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };

        return (
            <span className={`px-5 py-2 rounded-full text-sm font-bold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const formatDate = (date) => new Date(date).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const formatDateShort = (date) => new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    const getProductImage = (images) => {
        if (Array.isArray(images) && images.length > 0 && images[0]) {
            return images[0];
        }
        return 'https://via.placeholder.com/300x300/f0f0f0/666666?text=No+Image';
    };

    const getCategoryName = (product) => {
        if (!product) return 'Unknown';
        const sub = product.subcategoryId;
        const cat = product.categoryId;
        return sub?.name || sub?.title || cat?.name || cat?.title || 'Uncategorized';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#69431f] mx-auto"></div>
                    <p className="mt-6 text-xl font-medium text-gray-700">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-10 text-center bg-gray-50 min-h-screen">
                <Package className="w-32 h-32 text-gray-300 mx-auto mb-8" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Not Found</h2>
                <p className="text-gray-600 mb-8 text-lg">This order may have been removed or doesn't belong to you.</p>
                <button
                    onClick={() => navigate('/seller/orders')}
                    className="px-8 py-4 bg-[#69431f] text-white text-lg font-bold rounded-xl hover:bg-[#5a381a] transition"
                >
                    ← Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <button
                    onClick={() => navigate('/seller/orders')}
                    className="flex items-center text-gray-600 hover:text-[#69431f] mb-6 font-medium text-lg"
                >
                    <ArrowLeft className="w-6 h-6 mr-2" /> Back to Orders
                </button>

                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Order #{order.orderId || order._id.slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-gray-600 flex items-center gap-3 text-lg mb-4">
                            <Calendar className="w-5 h-5" />
                            {formatDate(order.createdAt)}
                        </p>
                        <div>{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
                        >
                            <Printer className="w-6 h-6" /> Print Invoice
                        </button>
                        <button
                            onClick={generatePDF}
                            className="flex items-center gap-3 px-6 py-4 bg-[#69431f] text-white rounded-xl hover:bg-[#5a381a] font-medium transition"
                        >
                            <Download className="w-6 h-6" /> Download PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoice Section */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8" ref={invoiceRef}>
                {/* Invoice Header */}
                <div className="bg-[#69431f] text-white p-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Building className="w-10 h-10" />
                                <h1 className="text-4xl font-bold">BRICKSIT</h1>
                            </div>
                            <p className="text-lg opacity-90">Trusted Construction Material Marketplace</p>
                            <div className="mt-6 space-y-2">
                                <p className="flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    Nagpur, Maharashtra
                                </p>
                                <p className="flex items-center gap-2">
                                    <PhoneIcon className="w-5 h-5" />
                                    info@bricksit.in | +91 9876543210
                                </p>
                                <p className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    GSTIN: 27ABCDE1234F1Z5
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold mb-2">TAX INVOICE</h2>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 inline-block">
                                <p className="text-sm opacity-90">Invoice No.</p>
                                <p className="text-2xl font-bold">INV-{order.orderId || order._id.slice(-8).toUpperCase()}</p>
                                <p className="text-sm mt-2 opacity-90">Date: {formatDateShort(order.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order & Customer Info */}
                <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-8 border-b-2 border-gray-200">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-500 mb-3">BILL TO</h3>
                        <div className="space-y-2">
                            <p className="text-2xl font-bold text-gray-900">{order.user?.name || 'Guest Customer'}</p>
                            <p className="text-gray-700">{order.shippingAddress?.address}</p>
                            <p className="text-gray-700">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                            <p className="text-gray-700">Phone: {order.shippingAddress?.phone || 'N/A'}</p>
                            <p className="text-gray-700">Email: {order.user?.email || 'N/A'}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-500 mb-3">ORDER DETAILS</h3>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                <span className="font-semibold">Order ID:</span> {order.orderId || order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Order Date:</span> {formatDateShort(order.createdAt)}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Status:</span>
                                <span className="ml-2 px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                                    {order.status.toUpperCase()}
                                </span>
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Payment:</span> {order.paymentMethod?.toUpperCase() || 'COD'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-500 mb-3">SHIPPING INFO</h3>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                <span className="font-semibold">Delivery Address:</span> Same as Billing
                            </p>
                            {order.trackingNumber && (
                                <p className="text-gray-700">
                                    <span className="font-semibold">Tracking:</span> {order.trackingNumber}
                                </p>
                            )}
                            {order.carrier && (
                                <p className="text-gray-700">
                                    <span className="font-semibold">Courier:</span> {order.carrier}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">ORDER ITEMS</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-200">
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">#</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">ITEM DESCRIPTION</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">CATEGORY</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">QUANTITY</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">UNIT PRICE</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-6 text-gray-600">{index + 1}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={getProductImage(item.product?.images)}
                                                    alt={item.product?.name}
                                                    className="w-16 h-16 rounded-lg object-cover border"
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/64x64/f0f0f0/666666?text=No+Image'}
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                                                    {item.product?.brand && (
                                                        <p className="text-sm text-gray-600">Brand: {item.product.brand}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-700">{getCategoryName(item.product)}</td>
                                        <td className="py-4 px-6 text-gray-700">{item.quantity}</td>
                                        <td className="py-4 px-6 text-gray-700">₹{item.price.toLocaleString('en-IN')}</td>
                                        <td className="py-4 px-6 font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="mt-12 flex justify-end">
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal:</span>
                                    <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping:</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Tax (GST 18%):</span>
                                    <span>₹{(order.totalPrice * 0.18).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="border-t-2 border-gray-300 pt-4">
                                    <div className="flex justify-between text-2xl font-bold">
                                        <span>TOTAL AMOUNT</span>
                                        <span className="text-[#69431f]">₹{(order.totalPrice * 1.18).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-12 p-6 bg-gray-50 rounded-xl">
                        <h4 className="font-bold text-gray-900 mb-3">TERMS & NOTES</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            <li>Goods once sold will not be taken back</li>
                            <li>Payment due within 15 days of invoice date</li>
                            <li>Delivery within 5-7 business days</li>
                            <li>For queries, contact info@bricksit.in or call +91 9876543210</li>
                        </ul>
                    </div>
                </div>

                {/* Invoice Footer */}
                <div className="bg-[#69431f] text-white p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-bold mb-3">BRICKSIT CORPORATE</h4>
                            <p className="text-sm opacity-90">Nagpur, Maharashtra</p>
                            <p className="text-sm opacity-90">CIN: U74999MH2023PTC123456</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3">CONTACT</h4>
                            <p className="text-sm opacity-90">info@bricksit.in</p>
                            <p className="text-sm opacity-90">+91 9876543210</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3">BANK DETAILS</h4>
                            <p className="text-sm opacity-90">HDFC Bank, Nagpur</p>
                            <p className="text-sm opacity-90">A/C: 12345678901234</p>
                            <p className="text-sm opacity-90">IFSC: HDFC0001234</p>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/20 text-center">
                        <p className="text-sm opacity-90">Thank you for your business! • This is a computer-generated invoice</p>
                        <p className="text-xs mt-2 opacity-80">© {new Date().getFullYear()} BricksIT. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Order Management</h2>
                <div className="flex flex-wrap gap-5">
                    {order.status === 'pending' && (
                        <button
                            onClick={() => updateOrderStatus('paid')}
                            disabled={updating}
                            className="px-10 py-5 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition shadow-lg"
                        >
                            Mark as Paid
                        </button>
                    )}
                    {order.status === 'paid' && (
                        <button
                            onClick={handleShipped}
                            disabled={updating}
                            className="px-10 py-5 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition shadow-lg"
                        >
                            Mark as Shipped
                        </button>
                    )}
                    {order.status === 'shipped' && (
                        <button
                            onClick={() => updateOrderStatus('delivered')}
                            disabled={updating}
                            className="px-10 py-5 bg-green-600 text-white text-lg font-bold rounded-xl hover:bg-green-700 disabled:opacity-60 transition shadow-lg"
                        >
                            Mark as Delivered
                        </button>
                    )}
                    <button className="flex items-center gap-3 px-8 py-5 bg-[#69431f] text-white rounded-xl hover:bg-[#5a381a] font-medium transition">
                        <MessageSquare className="w-6 h-6" /> Contact Customer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;