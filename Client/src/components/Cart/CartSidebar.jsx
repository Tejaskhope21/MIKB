import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from "../../context/CartContext";

const CartSidebar = () => {
    const {
        cartItems,
        isCartOpen,
        toggleCart,
        closeCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartCount
    } = useCart();

    const handleCheckout = () => {
        alert('Proceeding to checkout!');
        closeCart();
    };

    return (
        <>
            {/* Cart Icon */}
            <button
                onClick={toggleCart}
                className="fixed right-6 bottom-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition z-50"
            >
                <div className="relative">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {getCartCount() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {getCartCount()}
                        </span>
                    )}
                </div>
            </button>

            {/* Cart Sidebar */}
            <div className={`fixed inset-0 z-50 ${isCartOpen ? 'block' : 'hidden'}`}>
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black bg-opacity-50"
                    onClick={closeCart}
                ></div>

                {/* Cart Panel */}
                <div className="absolute right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl">
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
                            </div>
                            <button
                                onClick={closeCart}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4 text-gray-300">🛒</div>
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</h3>
                                    <p className="text-gray-500 mb-6">Add some products to get started</p>
                                    <button
                                        onClick={closeCart}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex items-center border border-gray-200 rounded-lg p-3">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div className="flex-1 ml-3">
                                                <h4 className="font-medium text-gray-800 line-clamp-1">{item.name}</h4>
                                                <p className="text-sm text-gray-600">{item.brand}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                                                        >
                                                            +
                                                        </button>
                                                        <span className="text-gray-500 text-sm ml-2">{item.unit}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900">
                                                            ₹{(item.price * item.quantity).toLocaleString()}
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-red-500 text-sm hover:text-red-700"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="border-t p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{getCartTotal().toLocaleString()}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <Link
                                        to="/cart"
                                        onClick={closeCart}
                                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium"
                                    >
                                        View Full Cart
                                    </Link>
                                    <button
                                        onClick={handleCheckout}
                                        className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
                                    >
                                        Checkout Now
                                    </button>
                                </div>
                                <p className="text-center text-gray-500 text-sm mt-4">
                                    Free shipping on orders above ₹5000
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartSidebar;