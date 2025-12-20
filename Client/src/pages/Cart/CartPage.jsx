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
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="text-8xl mb-6 text-gray-300">🛒</div>
                        <h1 className="text-3xl font-bold text-gray-700 mb-4">Your Cart is Empty</h1>
                        <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
                        <Link
                            to="/"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="lg:flex gap-8">
                    {/* Cart Items */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in Cart
                                </h2>
                                <button
                                    onClick={clearCart}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {cartItems.map(item => (
                                    <div key={item.id} className="p-4">
                                        <div className="flex">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                            <div className="flex-1 ml-4">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <Link
                                                            to={`/product/${item.id}`}
                                                            className="text-lg font-medium text-gray-900 hover:text-blue-600"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                        <p className="text-gray-600 text-sm mt-1">{item.brand}</p>
                                                        <p className="text-gray-600 text-sm">Unit: {item.unit}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-12 text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
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
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3 mt-8 lg:mt-0">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">
                                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax (GST 18%)</span>
                                    <span className="font-medium">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                                </div>
                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Amount</span>
                                        <span>₹{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mb-4 transition"
                            >
                                Proceed to Checkout
                            </button>

                            <div className="border-t pt-6">
                                <h3 className="font-medium text-gray-700 mb-3">Payment Methods</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">COD</div>
                                    <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">BANK</div>
                                    <div className="w-10 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">UPI</div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center text-blue-600 mb-2">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="font-medium">Secure Checkout</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Your payment information is encrypted and secure.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;