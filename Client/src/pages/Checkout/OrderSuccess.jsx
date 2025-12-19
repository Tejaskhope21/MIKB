import React from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderSuccessPage = () => {
    const { orderId } = useParams();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for your purchase. Your order #{orderId} has been successfully placed.
                </p>

                <div className="space-y-4">
                    <Link
                        to="/orders"
                        className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        View Order Details
                    </Link>
                    <Link
                        to="/"
                        className="inline-block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>

                <p className="mt-6 text-sm text-gray-500">
                    A confirmation email has been sent to your registered email address.
                </p>
            </div>
        </div>
    );
};

export default OrderSuccessPage;