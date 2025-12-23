import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, HardHat, Users, MessageSquare, Image as ImageIcon,
    BarChart3, Settings, LogOut, Bell, Search, TrendingUp, Briefcase, Award,
    Calendar, DollarSign, FileText, Home
} from 'lucide-react';

const ContractorLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications] = useState([
        { id: 1, title: 'New project inquiry', time: '10 min ago', read: false },
        { id: 2, title: 'Material price drop alert', time: '1 hour ago', read: false },
        { id: 3, title: 'Community post liked', time: '2 hours ago', read: true },
    ]);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        const userData = localStorage.getItem('userData');

        console.log('ContractorLayout auth check:', { token, userRole, userData });

        if (!token || userRole !== 'contractor') {
            console.log('Not authenticated as contractor, redirecting to login');
            navigate('/login');
            return;
        }

        try {
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const navItems = [
        { path: '/contractor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/contractor/projects', label: 'Projects', icon: Briefcase },
        { path: '/contractor/portfolio', label: 'Portfolio', icon: ImageIcon },
        { path: '/contractor/materials', label: 'Materials', icon: Package },
        { path: '/contractor/orders', label: 'Orders', icon: Package },
        { path: '/contractor/quotes', label: 'Quotes', icon: FileText },
        { path: '/contractor/community', label: 'Community', icon: Users },
        { path: '/contractor/messages', label: 'Messages', icon: MessageSquare },
        { path: '/contractor/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/contractor/finance', label: 'Finance', icon: DollarSign },
        { path: '/contractor/schedule', label: 'Schedule', icon: Calendar },
        { path: '/contractor/settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl z-50">
                <div className="flex items-center justify-center h-16 border-b border-gray-700 px-4">
                    <Link to="/contractor/dashboard" className="flex items-center gap-2">
                        <HardHat className="w-8 h-8 text-amber-400" />
                        <span className="text-xl font-bold">Contractor Pro</span>
                    </Link>
                </div>

                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold">{user.name?.charAt(0) || 'C'}</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{user.name || 'Contractor'}</p>
                            <p className="text-xs text-gray-300">{user.contractorType || 'General Contractor'}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${user.isVerified
                                        ? 'bg-green-500/20 text-green-300'
                                        : 'bg-yellow-500/20 text-yellow-300'
                                    }`}>
                                    {user.isVerified ? 'Verified' : 'Pending Verification'}
                                </span>
                                <span className="text-xs text-gray-400">{user.experience || 1} years exp</span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-gray-800/50 p-2 rounded-lg">
                            <p className="text-2xl font-bold text-amber-400">12</p>
                            <p className="text-xs text-gray-400">Active Projects</p>
                        </div>
                        <div className="bg-gray-800/50 p-2 rounded-lg">
                            <p className="text-2xl font-bold text-green-400">₹2.5L</p>
                            <p className="text-xs text-gray-400">This Month</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 lg:ml-64">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1 max-w-2xl">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="search"
                                        placeholder="Search materials, projects, or contractors..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 ml-6">
                                <Link to="/" className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
                                    <Home className="w-4 h-4" />
                                    <span className="text-sm">Home</span>
                                </Link>

                                <div className="relative">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <div className="hidden md:flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{user.name || 'Contractor'}</p>
                                        <p className="text-xs text-gray-500">{user.companyName || 'ABC Construction'}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold">
                                            {user.name?.charAt(0) || 'C'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium">₹8.5L</span>
                                <span className="text-xs text-gray-600">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                                <Briefcase className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium">{user.projectsCompleted || 0}</span>
                                <span className="text-xs text-gray-600">Projects</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg">
                                <Award className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-medium">{user.ratings?.average || 0}/5</span>
                                <span className="text-xs text-gray-600">Rating</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="min-h-[calc(100vh-140px)] p-4 md:p-6">
                    <Outlet />
                </main>
            </div>

            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-800 text-white border-t border-gray-700 z-40">
                <div className="grid grid-cols-5 py-2">
                    {navItems.slice(0, 5).map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link key={item.path} to={item.path} className={`flex flex-col items-center py-2 ${isActive ? 'text-amber-400' : 'text-gray-300'}`}>
                                <Icon className="w-6 h-6" />
                                <span className="text-xs mt-1">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="lg:hidden pb-16"></div>
        </div>
    );
};

export default ContractorLayout;