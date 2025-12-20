import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import {
    MapPin,
    CreditCard,
    Building,
    Wallet,
    Upload,
    Shield,
    Truck,
    CheckCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-backend-navy.vercel.app/api';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [bankTransferDetails, setBankTransferDetails] = useState({
        transactionId: '',
        screenshot: null,
        bankName: '',
        amount: 0
    });
    const [notes, setNotes] = useState('');

    const subtotal = getCartTotal();
    const tax = subtotal * 0.18;
    const shipping = subtotal > 5000 ? 0 : 150;
    const total = subtotal + tax + shipping;

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setUser(response.data.user);
                setAddresses(response.data.user.addresses || []);

                const defaultAddress = response.data.user.addresses?.find(addr => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddress(defaultAddress._id);
                } else if (response.data.user.addresses?.length > 0) {
                    setSelectedAddress(response.data.user.addresses[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        if (method === 'bank_transfer') {
            setBankTransferDetails(prev => ({ ...prev, amount: total }));
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setBankTransferDetails(prev => ({ ...prev, screenshot: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        if (!selectedAddress) {
            alert('Please select a delivery address');
            return false;
        }

        if (paymentMethod === 'bank_transfer') {
            if (!bankTransferDetails.transactionId.trim()) {
                alert('Please enter transaction ID');
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

            const orderData = {
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
                shippingAddress: selectedAddress,
                paymentMethod: paymentMethod,
                notes: notes,
                ...(paymentMethod === 'bank_transfer' && {
                    bankTransferDetails: {
                        transactionId: bankTransferDetails.transactionId,
                        screenshot: bankTransferDetails.screenshot,
                        bankName: bankTransferDetails.bankName
                    }
                })
            };

            const response = await axios.post(`${API_URL}/orders`, orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                clearCart();
                navigate(`/order-success/${response.data.order._id}`);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert(error.response?.data?.message || 'Failed to place order. Please try again.');
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
                <div className="text-center">
                    <div className="text-6xl mb-6 text-gray-300">🛒</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
                    <p className="text-gray-600 mb-8">Add items to your cart to proceed to checkout</p>
                    <Link to="/" className="inline-block bg-[#800000] text-white px-6 py-3 rounded-lg hover:bg-[#900000]">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-xl shadow p-6 mb-6">
                            <div className="flex items-center mb-6">
                                <MapPin className="w-6 h-6 text-[#800000] mr-3" />
                                <h2 className="text-xl font-bold text-gray-800">Delivery Address</h2>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">No addresses found</p>
                                    <Link to="/profile/addresses" className="text-[#800000] hover:text-[#900000] font-medium">
                                        Add New Address
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map((address) => (
                                        <div
                                            key={address._id}
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedAddress === address._id
                                                    ? 'border-[#800000] bg-red-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setSelectedAddress(address._id)}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{address.fullName}</h3>
                                                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full mt-1">
                                                        {address.addressType}
                                                    </span>
                                                    {address.isDefault && (
                                                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full ml-2">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedAddress === address._id && <CheckCircle className="w-5 h-5 text-green-600" />}
                                            </div>
                                            <p className="text-gray-600 text-sm">
                                                {address.addressLine}, {address.city}<br />
                                                {address.state} - {address.pincode}<br />
                                                {address.country}
                                            </p>
                                            <p className="text-gray-600 text-sm mt-2">📱 {address.phone}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t">
                                <Link to="/profile/addresses" className="inline-flex items-center text-[#800000] hover:text-[#900000] font-medium">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add New Address
                                </Link>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl shadow p-6 mb-6">
                            <div className="flex items-center mb-6">
                                <CreditCard className="w-6 h-6 text-[#800000] mr-3" />
                                <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
                            </div>

                            <div className="space-y-4">
                                <div
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#800000] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => handlePaymentMethodChange('cod')}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold mr-3">COD</div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">Cash on Delivery</h3>
                                                <p className="text-sm text-gray-600">Pay when you receive the order</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'cod' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    </div>
                                </div>

                                <div
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-[#800000] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => handlePaymentMethodChange('bank_transfer')}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <Building className="w-5 h-5 text-blue-600 mr-3" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">Bank Transfer / UPI</h3>
                                                <p className="text-sm text-gray-600">Instant transfer to our account</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'bank_transfer' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    </div>

                                    {paymentMethod === 'bank_transfer' && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                                <h4 className="font-medium text-gray-900 mb-3">Bank / UPI Details:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div><p className="text-gray-600">Account Name</p><p className="font-medium">{bankDetails.accountName}</p></div>
                                                    <div><p className="text-gray-600">Account No.</p><p className="font-medium">{bankDetails.accountNumber}</p></div>
                                                    <div><p className="text-gray-600">IFSC Code</p><p className="font-medium">{bankDetails.ifscCode}</p></div>
                                                    <div><p className="text-gray-600">Bank</p><p className="font-medium">{bankDetails.bankName}</p></div>
                                                    <div><p className="text-gray-600">Branch</p><p className="font-medium">{bankDetails.branch}</p></div>
                                                    <div><p className="text-gray-600">UPI ID</p><p className="font-medium">{bankDetails.upiId}</p></div>
                                                </div>
                                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <p className="text-sm text-yellow-800">
                                                        <span className="font-medium">Important:</span> Transfer exactly ₹{total.toLocaleString()} and upload screenshot.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <input type="text" placeholder="Transaction ID / UPI Reference *" value={bankTransferDetails.transactionId}
                                                    onChange={e => setBankTransferDetails(prev => ({ ...prev, transactionId: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000]" />

                                                <input type="text" placeholder="Bank Name (e.g. SBI, HDFC) *" value={bankTransferDetails.bankName}
                                                    onChange={e => setBankTransferDetails(prev => ({ ...prev, bankName: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000]" />

                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                    {bankTransferDetails.screenshot ? (
                                                        <div className="space-y-3">
                                                            <img src={bankTransferDetails.screenshot} alt="Proof" className="mx-auto max-h-48 rounded-lg" />
                                                            <button type="button" onClick={() => setBankTransferDetails(prev => ({ ...prev, screenshot: null }))}
                                                                className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                            <p className="text-gray-600 mb-2">Upload payment screenshot</p>
                                                            <label className="inline-block bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg cursor-pointer">
                                                                Choose File
                                                                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                                            </label>
                                                            <p className="text-xs text-gray-500 mt-2">Max 5MB</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Additional Notes (Optional)</h2>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000]"
                                rows="3" placeholder="Any special instructions..." />
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1 mt-8 lg:mt-0">
                        <div className="bg-white rounded-xl shadow p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                <h3 className="font-medium text-gray-700">Items ({cartItems.length})</h3>
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <div>
                                            <p className="text-gray-900">{item.name}</p>
                                            <p className="text-gray-500">{item.quantity} × ₹{item.price.toLocaleString()}</p>
                                        </div>
                                        <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 mb-6 border-t pt-4">
                                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">GST (18%)</span><span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span></div>
                                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center text-green-700">
                                    <Truck className="w-5 h-5 mr-2" />
                                    <span className="font-medium">Estimated Delivery: 3-7 days</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-[#800000] hover:bg-[#900000] text-white font-bold py-4 rounded-lg disabled:opacity-60"
                            >
                                {loading ? 'Processing...' : `Place Order${paymentMethod === 'cod' ? ' (Pay on Delivery)' : ''}`}
                            </button>

                            <div className="mt-4 text-center">
                                <Link to="/cart" className="text-sm text-gray-600 hover:text-[#800000]">← Back to Cart</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;