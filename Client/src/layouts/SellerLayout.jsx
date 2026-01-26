// src/layouts/SellerLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    CreditCard,
    BarChart3,
    Settings,
    LogOut,
    Store,
    MessageSquare,
    Flame
} from 'lucide-react';

const SellerLayout = () => {
    const location = useLocation();

    const navItems = [
        { path: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/seller/products', label: 'Products', icon: Package },
        { path: '/seller/products/hotdeal', label: 'Hot Deal', icon: Package },
        { path: '/seller/products/trending', label: 'Trending', icon: Flame },
        { path: '/seller/orders', label: 'Orders', icon: ShoppingBag },
        { path: '/seller/payouts', label: 'Payouts', icon: CreditCard },
        { path: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/seller/reviews', label: 'Reviews', icon: MessageSquare },
        { path: '/seller/settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Fixed on desktop */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white shadow-lg z-50">
                <div className="flex items-center justify-center h-16 border-b border-gray-200">
                    <Link to="/seller/dashboard" className="flex items-center gap-2">
                        <Store className="w-8 h-8 text-red-600" />
                        <span className="text-xl font-bold text-gray-800">Seller Panel</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center mb-4 px-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full mr-3" />
                        <div>
                            <p className="font-medium text-gray-800">Tejas Khope</p>
                            <p className="text-xs text-gray-500">online kharida</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area - Offset on desktop */}
            <div className="flex-1 lg:ml-64">
                {/* Top bar for mobile */}
                <header className="lg:hidden bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 py-4">
                        <Link to="/seller/dashboard" className="flex items-center gap-2">
                            <Store className="w-7 h-7 text-red-600" />
                            <span className="font-bold text-gray-800">Seller Panel</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Tejas Khope</span>
                            <div className="w-8 h-8 bg-gray-300 rounded-full" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="min-h-screen">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                <div className="grid grid-cols-5 py-2">
                    {navItems.slice(0, 5).map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center py-2 ${
                                    isActive ? 'text-blue-600' : 'text-gray-600'
                                }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs mt-1">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default SellerLayout;