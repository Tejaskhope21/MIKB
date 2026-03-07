import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from "../../context/CartContext";

const CartPage = () => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal
    } = useCart();

    const navigate = useNavigate();

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="text-8xl mb-6 text-gray-300">🛒</div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Your Cart is Empty</h1>
                        <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
                        <Link
                            to="/"
                            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const subtotal = getCartTotal();
    const shipping = subtotal > 5000 ? 0 : 150;
    const tax = subtotal * 0.18;
    const total = subtotal + tax + shipping;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-8">Shopping Cart</h1>

                <div className="lg:flex gap-8">
                    {/* Cart Items */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in Cart
                                </h2>
                                <button
                                    onClick={clearCart}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {cartItems.map(item => (
                                    <div key={item.id} className="p-6 hover:bg-orange-50/50 transition-colors">
                                        <div className="flex">
                                            <img
                                                src={item.image || "https://via.placeholder.com/100x100/eeeeee/cccccc?text=Product"}
                                                alt={item.name}
                                                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/100x100/eeeeee/cccccc?text=Product";
                                                }}
                                            />
                                            <div className="flex-1 ml-4">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <Link
                                                            to={`/product/${item.id}`}
                                                            className="text-lg font-medium text-gray-900 hover:text-orange-600 transition-colors"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                        <p className="text-gray-600 text-sm mt-1">{item.brand}</p>
                                                        <p className="text-gray-600 text-sm">Unit: {item.unit}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                                className="w-10 h-10 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="w-10 h-10 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <span className="text-gray-500">{item.unit}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-gray-900">
                                                            ₹{(item.price * item.quantity).toLocaleString()}
                                                        </div>
                                                        <div className="text-gray-500 text-sm">
                                                            ₹{item.price.toLocaleString()} per {item.unit}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                to="/"
                                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors group"
                            >
                                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3 mt-8 lg:mt-0">
                        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 sticky top-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax (GST 18%)</span>
                                    <span className="font-medium text-gray-900">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span className="text-gray-900">Total Amount</span>
                                        <span className="text-orange-600">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-lg mb-4 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-[1.02]"
                            >
                                Proceed to Checkout
                            </button>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="font-medium text-gray-700 mb-3">Payment Methods</h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-300">
                                        Cash on Delivery
                                    </div>
                                    <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-300">
                                        Net Banking
                                    </div>
                                    <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-300">
                                        UPI
                                    </div>
                                    <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-300">
                                        Cards
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                                <div className="flex items-center text-orange-600 mb-2">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="font-semibold">Secure Checkout</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Your payment information is encrypted and secure.
                                </p>
                            </div>

                            {/* Free Shipping Threshold */}
                            {shipping > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-700 flex items-center">
                                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                                        </svg>
                                        Add ₹{(5000 - subtotal).toLocaleString()} more for FREE shipping!
                                    </p>
                                </div>
                            )}

                            {/* Bulk Order Info */}
                            {subtotal > 10000 && (
                                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-sm text-green-700 flex items-center">
                                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Eligible for bulk order discount! Contact our sales team.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;