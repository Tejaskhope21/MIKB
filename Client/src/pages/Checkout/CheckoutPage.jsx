import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import {
    MapPin,
    CreditCard,
    Building,
    Upload,
    CheckCircle,
    Truck
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-com-backend.vercel.app/api';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [bankTransferDetails, setBankTransferDetails] = useState({
        transactionId: '',
        screenshot: null,
        bankName: ''
    });

    const [notes, setNotes] = useState('');

    // Price calculation
    const subtotal = getCartTotal();
    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal > 5000 ? 0 : 150;
    const total = subtotal + tax + shipping;

    // Fetch addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const res = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const userAddresses = res.data.user.addresses || [];
                setAddresses(userAddresses);

                const defaultAddr = userAddresses.find(a => a.isDefault) || userAddresses[0];
                if (defaultAddr) {
                    setSelectedAddress(defaultAddr._id);
                }
            } catch (err) {
                console.error('Failed to fetch addresses:', err);
                if (err.response?.status === 401) navigate('/login');
            }
        };

        fetchAddresses();
    }, [navigate]);

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setBankTransferDetails(prev => ({ ...prev, screenshot: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        if (!selectedAddress) {
            alert('Please select a delivery address');
            return false;
        }

        if (paymentMethod === 'bank_transfer') {
            if (!bankTransferDetails.transactionId.trim()) {
                alert('Please enter transaction ID / UPI reference');
                return false;
            }
            if (!bankTransferDetails.screenshot) {
                alert('Please upload payment screenshot');
                return false;
            }
            if (!bankTransferDetails.bankName.trim()) {
                alert('Please enter bank name');
                return false;
            }
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            const selectedAddrObj = addresses.find(a => a._id === selectedAddress);
            if (!selectedAddrObj) {
                alert('Selected address not found');
                setLoading(false);
                return;
            }

            const shippingAddress = {
                address: selectedAddrObj.addressLine || selectedAddrObj.address || '',
                city: selectedAddrObj.city || '',
                state: selectedAddrObj.state || '',
                pincode: selectedAddrObj.pincode || ''
            };

            const payload = {
                items: cartItems.map(item => ({
                    productId: item.id,  // Ensure this is Mongo _id string
                    quantity: item.quantity
                })),
                shippingAddress,
                paymentMethod: paymentMethod === 'cod' ? 'COD' : 'BANK_TRANSFER',
                notes: notes.trim()
            };

            if (paymentMethod === 'bank_transfer') {
                payload.paymentProof = {
                    transactionId: bankTransferDetails.transactionId,
                    screenshot: bankTransferDetails.screenshot,
                    bankName: bankTransferDetails.bankName
                };
            }

            console.log('Order payload:', payload);

            const res = await axios.post(`${API_URL}/orders`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            clearCart();
            navigate(`/order-success/${res.data._id || res.data.order?._id || res.data.orderId}`);

        } catch (err) {
            console.error('Order failed:', err);
            alert(err.response?.data?.message || 'Failed to place order. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const bankDetails = {
        accountName: "BuilderSmart Solutions Pvt Ltd",
        accountNumber: "123456789012",
        ifscCode: "SBIN0001234",
        bankName: "State Bank of India",
        branch: "Mumbai Main Branch",
        upiId: "buildersmart@sbi"
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-xl shadow">
                    <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                    <Link to="/" className="bg-[#800000] text-white px-8 py-3 rounded-lg hover:bg-[#900000]">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-gray-900 mb-10">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Forms Section */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Address */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex items-center mb-8">
                                <MapPin className="w-8 h-8 text-[#800000] mr-4" />
                                <h2 className="text-2xl font-bold">Delivery Address</h2>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 mb-6">No saved addresses</p>
                                    <Link to="/profile?tab=addresses" className="text-[#800000] font-semibold">
                                        Add Address
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {addresses.map(addr => (
                                            <div
                                                key={addr._id}
                                                onClick={() => setSelectedAddress(addr._id)}
                                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === addr._id
                                                    ? 'border-[#800000] bg-red-50'
                                                    : 'border-gray-200 hover:border-gray-400'
                                                    }`}
                                            >
                                                <div className="flex justify-between mb-3">
                                                    <h3 className="font-bold text-lg">{addr.fullName}</h3>
                                                    {selectedAddress === addr._id && <CheckCircle className="w-6 h-6 text-green-600" />}
                                                </div>
                                                {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Default</span>}
                                                <p className="text-gray-700 mt-3">
                                                    {addr.addressLine || addr.address}<br />
                                                    {addr.city}, {addr.state} - {addr.pincode}
                                                </p>
                                                <p className="text-gray-600 mt-2">Phone: {addr.phone}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Link to="/profile?tab=addresses" className="mt-8 inline-block text-[#800000] font-semibold">
                                        + Add New Address
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Payment */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex items-center mb-8">
                                <CreditCard className="w-8 h-8 text-[#800000] mr-4" />
                                <h2 className="text-2xl font-bold">Payment Method</h2>
                            </div>

                            {/* COD */}
                            <div
                                onClick={() => handlePaymentMethodChange('cod')}
                                className={`p-6 rounded-xl border-2 cursor-pointer mb-6 transition-all ${paymentMethod === 'cod' ? 'border-[#800000] bg-red-50' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold mr-4">COD</div>
                                        <div>
                                            <h3 className="font-bold text-lg">Cash on Delivery</h3>
                                            <p className="text-gray-600">Pay with cash when you receive your order</p>
                                        </div>
                                    </div>
                                    {paymentMethod === 'cod' && <CheckCircle className="w-6 h-6 text-green-600" />}
                                </div>
                            </div>

                            {/* Bank Transfer */}
                            <div
                                onClick={() => handlePaymentMethodChange('bank_transfer')}
                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-[#800000] bg-red-50' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <Building className="w-6 h-6 text-blue-600 mr-4" />
                                        <div>
                                            <h3 className="font-bold text-lg">Bank Transfer / UPI</h3>
                                            <p className="text-gray-600">Direct bank or UPI payment</p>
                                        </div>
                                    </div>
                                    {paymentMethod === 'bank_transfer' && <CheckCircle className="w-6 h-6 text-green-600" />}
                                </div>

                                {paymentMethod === 'bank_transfer' && (
                                    <div className="mt-6 space-y-6">
                                        <div className="bg-blue-50 p-6 rounded-xl">
                                            <h4 className="font-bold mb-4">Transfer Details</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><strong>Account Name:</strong> {bankDetails.accountName}</div>
                                                <div><strong>Account No:</strong> {bankDetails.accountNumber}</div>
                                                <div><strong>IFSC:</strong> {bankDetails.ifscCode}</div>
                                                <div><strong>UPI ID:</strong> {bankDetails.upiId}</div>
                                                <div><strong>Bank:</strong> {bankDetails.bankName}</div>
                                                <div><strong>Branch:</strong> {bankDetails.branch}</div>
                                            </div>
                                            <p className="mt-4 text-yellow-800 bg-yellow-100 p-3 rounded-lg font-semibold">
                                                Transfer exactly ₹{total.toFixed(2)}
                                            </p>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Transaction ID / UPI Reference *"
                                            value={bankTransferDetails.transactionId}
                                            onChange={e => setBankTransferDetails(prev => ({ ...prev, transactionId: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000]"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Bank Name *"
                                            value={bankTransferDetails.bankName}
                                            onChange={e => setBankTransferDetails(prev => ({ ...prev, bankName: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000]"
                                        />

                                        <div className="border-2 border-dashed border-gray-400 rounded-xl p-8 text-center">
                                            {bankTransferDetails.screenshot ? (
                                                <div>
                                                    <img src={bankTransferDetails.screenshot} alt="Proof" className="mx-auto max-h-64 rounded-lg shadow" />
                                                    <button
                                                        onClick={() => setBankTransferDetails(prev => ({ ...prev, screenshot: null }))}
                                                        className="mt-4 text-red-600 font-medium"
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-600 mb-4">Upload payment proof</p>
                                                    <label className="cursor-pointer bg-[#800000] text-white px-6 py-3 rounded-lg hover:bg-[#900000]">
                                                        Choose File
                                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                                    </label>
                                                    <p className="text-xs text-gray-500 mt-3">Max 5MB</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold mb-4">Additional Notes (Optional)</h2>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows="4"
                                placeholder="Any special delivery instructions..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000]"
                            />
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
                            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between pb-4 border-b">
                                        <div className="flex-1">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-gray-500">{item.quantity} × ₹{item.price.toLocaleString()}</p>
                                        </div>
                                        <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 border-t pt-6">
                                <div className="flex justify-between text-lg">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>GST (18%)</span>
                                    <span>₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-2xl font-bold pt-4 border-t">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="my-8 flex items-center text-green-700 bg-green-50 p-4 rounded-lg">
                                <Truck className="w-6 h-6 mr-3" />
                                <span className="font-semibold">Estimated Delivery: 3-7 days</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-[#800000] hover:bg-[#900000] text-white font-bold text-xl py-5 rounded-xl disabled:opacity-60 transition"
                            >
                                {loading ? 'Placing Order...' : 'Place Order'}
                            </button>

                            <div className="text-center mt-6">
                                <Link to="/cart" className="text-gray-600 hover:text-[#800000]">
                                    ← Back to Cart
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;