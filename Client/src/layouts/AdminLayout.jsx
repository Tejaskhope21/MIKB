import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingBag,
    Tag,
    Settings,
    BarChart3,
    FileText,
    Shield,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronDown,
    Home
} from 'lucide-react';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();

    const adminMenuItems = [
        {
            title: 'Dashboard',
            path: '/admin/dashboard',
            icon: LayoutDashboard,
            exact: true
        },
        {
            title: 'User Management',
            path: '/admin/users',
            icon: Users,
            submenu: [
                { title: 'All Users', path: '/admin/users' },
                { title: 'Sellers', path: '/admin/users/sellers' },
                { title: 'Customers', path: '/admin/users/customers' },
                { title: 'Roles & Permissions', path: '/admin/users/roles' }
            ]
        },
        {
            title: 'Product Management',
            path: '/admin/products',
            icon: Package,
            submenu: [
                { title: 'All Products', path: '/admin/products' },
                { title: 'Categories', path: '/admin/products/categories' },
                { title: 'Brands', path: '/admin/products/brands' },
                { title: 'Reviews', path: '/admin/products/reviews' }
            ]
        },
        {
            title: 'Order Management',
            path: '/admin/orders',
            icon: ShoppingBag,
            submenu: [
                { title: 'All Orders', path: '/admin/orders' },
                { title: 'Returns', path: '/admin/orders/returns' },
                { title: 'Refunds', path: '/admin/orders/refunds' },
                { title: 'Disputes', path: '/admin/orders/disputes' }
            ]
        },
        {
            title: 'Content Management',
            path: '/admin/content',
            icon: FileText,
            submenu: [
                { title: 'Banners', path: '/admin/content/banners' },
                { title: 'Pages', path: '/admin/content/pages' },
                { title: 'Blog', path: '/admin/content/blog' },
                { title: 'FAQ', path: '/admin/content/faq' }
            ]
        },
        {
            title: 'Marketing',
            path: '/admin/marketing',
            icon: Tag,
            submenu: [
                { title: 'Coupons', path: '/admin/marketing/coupons' },
                { title: 'Promotions', path: '/admin/marketing/promotions' },
                { title: 'Email Campaigns', path: '/admin/marketing/email' }
            ]
        },
        {
            title: 'Analytics',
            path: '/admin/analytics',
            icon: BarChart3,
            submenu: [
                { title: 'Sales Analytics', path: '/admin/analytics/sales' },
                { title: 'User Analytics', path: '/admin/analytics/users' },
                { title: 'Product Analytics', path: '/admin/analytics/products' }
            ]
        },
        {
            title: 'System',
            path: '/admin/system',
            icon: Settings,
            submenu: [
                { title: 'General Settings', path: '/admin/settings/general' },
                { title: 'Payment Settings', path: '/admin/settings/payment' },
                { title: 'Shipping Settings', path: '/admin/settings/shipping' },
                { title: 'Email Settings', path: '/admin/settings/email' },
                { title: 'API Keys', path: '/admin/settings/api' }
            ]
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const adminUser = {
        name: 'Admin User',
        email: 'admin@bricks.com',
        role: 'Administrator',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=2563eb&color=fff'
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
            >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            `}>
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Bricks Admin</h1>
                            <p className="text-sm text-gray-400">Admin Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 overflow-y-auto h-[calc(100vh-160px)]">
                    <ul className="space-y-1">
                        {adminMenuItems.map((item) => {
                            const Icon = item.icon;
                            const hasSubmenu = item.submenu && item.submenu.length > 0;

                            return (
                                <li key={item.path}>
                                    {hasSubmenu ? (
                                        <div className="group">
                                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <Icon className="w-5 h-5" />
                                                    <span className="font-medium">{item.title}</span>
                                                </div>
                                                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                                            </div>
                                            <ul className="ml-8 mt-1 space-y-1 hidden group-hover:block">
                                                {item.submenu.map((subItem) => (
                                                    <li key={subItem.path}>
                                                        <NavLink
                                                            to={subItem.path}
                                                            className={({ isActive }) =>
                                                                `block px-3 py-2 rounded text-sm hover:bg-gray-800 ${isActive ? 'bg-blue-900 text-blue-100' : 'text-gray-300'
                                                                }`
                                                            }
                                                        >
                                                            {subItem.title}
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <NavLink
                                            to={item.path}
                                            end={item.exact}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : 'hover:bg-gray-800 text-gray-300'
                                                }`
                                            }
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{item.title}</span>
                                        </NavLink>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900">
                    <NavLink
                        to="/"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 text-gray-300"
                    >
                        <Home className="w-5 h-5" />
                        <span>Back to Store</span>
                    </NavLink>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Navigation */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Left Side */}
                            <div className="flex items-center flex-1">
                                <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
                            </div>

                            {/* Right Side */}
                            <div className="flex items-center gap-4">
                                {/* Search */}
                                <div className="relative hidden md:block">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Notifications */}
                                <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                                    <Bell className="w-5 h-5 text-gray-600" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <img
                                            src={adminUser.avatar}
                                            alt={adminUser.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className="text-left hidden md:block">
                                            <p className="text-sm font-medium text-gray-800">{adminUser.name}</p>
                                            <p className="text-xs text-gray-500">{adminUser.role}</p>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </button>

                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setUserMenuOpen(false)}
                                            ></div>
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-gray-800">{adminUser.name}</p>
                                                    <p className="text-xs text-gray-500">{adminUser.email}</p>
                                                </div>
                                                <NavLink
                                                    to="/admin/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    My Profile
                                                </NavLink>
                                                <NavLink
                                                    to="/admin/settings"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    Settings
                                                </NavLink>
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 px-6 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="text-sm text-gray-600">
                            © {new Date().getFullYear()} Bricks.com Admin Panel. All rights reserved.
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                            <span className="text-sm text-gray-600">v1.0.0</span>
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-green-600 font-medium">System Status: Online</span>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default AdminLayout;