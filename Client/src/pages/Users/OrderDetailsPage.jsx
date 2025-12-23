import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Truck, CheckCircle, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-backend-qyea.onrender.com/api';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(res.data.order);
            } catch (err) {
                console.error('Error fetching order:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <Link to="/orders/my-orders" className="text-[#800000] mb-6 inline-block">
                    ← Back to Orders
                </Link>
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold mb-6">Order #{order.orderId}</h1>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <p>Status: <span className="capitalize">{order.status}</span></p>
                            <p>Total: ₹{order.totalPrice.toLocaleString()}</p>
                            <p>Payment: {order.paymentMethod}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Items</h2>
                        <ul className="space-y-4">
                            {order.items.map((item, idx) => (
                                <li key={idx} className="border p-4 rounded-lg">
                                    <div className="flex justify-between">
                                        <span>{item.quantity} x Product</span>
                                        <span>₹{item.price * item.quantity}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;