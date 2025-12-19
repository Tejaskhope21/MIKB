import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    DollarSign,
    BarChart3,
    Settings,
    User,
    Bell,
    LogOut,
    Menu,
    X,
    Home
} from 'lucide-react';

const SellerLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/seller/dashboard' },
        { icon: Package, label: 'Products', path: '/seller/products' },
        { icon: ShoppingBag, label: 'Orders', path: '/seller/orders' },
        { icon: DollarSign, label: 'Payouts', path: '/seller/payouts' },
        { icon: BarChart3, label: 'Analytics', path: '/seller/analytics' },
        { icon: Settings, label: 'Settings', path: '/seller/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="px-6 py-4 border-b">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-800">Seller Panel</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 overflow-y-auto">
                        <ul className="space-y-2">
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <Link
                                        to={item.path}
                                        className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* User info */}
                    <div className="px-4 py-4 border-t">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {user.name || 'Seller'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.businessName || 'Store'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-10 bg-white shadow-sm">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>
                                <div className="flex items-center ml-4">
                                    <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center">
                                        <Home className="w-4 h-4 mr-2" />
                                        Back to Store
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button className="relative p-2 text-gray-500 hover:text-gray-900">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                <div className="relative">
                                    <div className="flex items-center space-x-3 cursor-pointer group">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className="hidden md:block">
                                            <p className="text-sm font-medium text-gray-700">{user.name}</p>
                                            <p className="text-xs text-gray-500">Seller</p>
                                        </div>
                                    </div>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <Link
                                            to="/seller/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Profile Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="py-6">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SellerLayout;