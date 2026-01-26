// src/pages/Contractor/DashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    Briefcase,
    DollarSign,
    Award,
    FileText,
    Building,
    Clock,
    CheckCircle,
    AlertCircle,
    Users,
    MessageSquare,
    Package,
    Image as ImageIcon,
    HardHat
} from 'lucide-react';

const ContractorDashboardPage = () => {
    // Mock data - replace with API calls later
    const stats = {
        activeProjects: 12,
        completedProjects: 24,
        pendingQuotes: 5,
        monthlyRevenue: 250000,
        clientRating: 4.8
    };

    const recentProjects = [
        { id: 1, name: 'Residential Villa Construction', client: 'Mr. Rajesh Sharma', status: 'active', progress: 75, budget: '₹45 Lakh', dueDate: '15 Mar 2025' },
        { id: 2, name: 'Commercial Office Complex', client: 'ABC Corporation', status: 'planning', progress: 20, budget: '₹1.2 Crore', dueDate: '30 Jun 2025' },
        { id: 3, name: 'Luxury Apartment Renovation', client: 'Mrs. Priya Patel', status: 'active', progress: 90, budget: '₹12 Lakh', dueDate: '28 Feb 2025' },
        { id: 4, name: 'Industrial Factory Shed', client: 'XYZ Industries Ltd.', status: 'completed', progress: 100, budget: '₹85 Lakh', dueDate: '15 Jan 2026' },
    ];

    const upcomingTasks = [
        { id: 1, task: 'Material procurement for Villa project (Cement & Steel)', due: 'Today', priority: 'high' },
        { id: 2, task: 'Client meeting with ABC Corp - Project kickoff', due: 'Tomorrow', priority: 'medium' },
        { id: 3, task: 'Site inspection & quality check - Patel Residence', due: '25 Dec', priority: 'high' },
        { id: 4, task: 'Submit building permit application', due: '28 Dec', priority: 'low' },
    ];

    const communityPosts = [
        { id: 1, author: 'Raj Construction', title: 'Best practices for RCC work in monsoon', likes: 45, comments: 12, time: '2 hours ago' },
        { id: 2, author: 'Civil Engineers Forum', title: 'New building code updates 2025', likes: 89, comments: 34, time: '5 hours ago' },
        { id: 3, author: 'Material Suppliers Group', title: 'Steel price forecast Q1 2025', likes: 123, comments: 45, time: '1 day ago' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold mb-3">Welcome back, Tejas!</h1>
                <p className="text-amber-100 text-lg mb-6">
                    You have <span className="font-bold">{stats.activeProjects} active projects</span> and <span className="font-bold">{stats.pendingQuotes} pending quotes</span> to review.
                </p>
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-amber-100">85% On-time Delivery Rate</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Award className="w-6 h-6" />
                        <span className="text-amber-100">Top Rated Contractor</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Active Projects</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeProjects}</p>
                        </div>
                        <Briefcase className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +2 this month
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Monthly Revenue</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">₹{stats.monthlyRevenue.toLocaleString('en-IN')}</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +15% from last month
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Client Rating</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.clientRating}/5.0</p>
                        </div>
                        <Award className="w-10 h-10 text-amber-600" />
                    </div>
                    <p className="text-sm text-gray-600">Based on 24 reviews</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Pending Quotes</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingQuotes}</p>
                        </div>
                        <FileText className="w-10 h-10 text-purple-600" />
                    </div>
                    <Link to="/contractor/quotes" className="text-sm text-purple-600 hover:underline font-medium">
                        Review Quotes →
                    </Link>
                </div>
            </div>

            {/* Main Grid: Projects + Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Projects */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Recent Projects</h2>
                        <Link to="/contractor/projects" className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                            View All →
                        </Link>
                    </div>
                    <div className="p-6 space-y-5">
                        {recentProjects.map((project) => (
                            <div key={project.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-lg">{project.name}</h3>
                                        <p className="text-gray-600 text-sm">{project.client}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="font-bold text-xl">{project.budget}</p>
                                        <p className="text-xs text-gray-500 mt-1">Due: {project.dueDate}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${project.progress >= 80 ? 'bg-green-500' :
                                                        project.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{project.progress}% Complete</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Upcoming Tasks */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Upcoming Tasks</h2>
                            <Link to="/contractor/schedule" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                                View Calendar →
                            </Link>
                        </div>
                        <div className="p-6 space-y-4">
                            {upcomingTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{task.task}</p>
                                        <p className="text-xs text-gray-500 mt-1">Due: {task.due}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                            task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {task.priority.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Community Activity */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Community Activity</h2>
                            <Link to="/contractor/community" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                                Join Discussion →
                            </Link>
                        </div>
                        <div className="p-6 space-y-4">
                            {communityPosts.map((post) => (
                                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow transition-shadow">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                                        <div>
                                            <p className="font-medium text-sm">{post.author}</p>
                                            <p className="text-xs text-gray-500">{post.time}</p>
                                        </div>
                                    </div>
                                    <h4 className="font-semibold text-sm mb-2">{post.title}</h4>
                                    <div className="flex items-center gap-5 text-xs text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="w-4 h-4" />
                                            {post.comments}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4" />
                                            {post.likes}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Material Price Alert */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-8 h-8" />
                            <h3 className="text-xl font-bold">Material Price Alert</h3>
                        </div>
                        <p className="mb-5 text-blue-100">
                            Steel & Cement prices expected to rise by 8-10% next week due to demand surge.
                        </p>
                        <Link
                            to="/contractor/materials"
                            className="inline-block px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Order Materials Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Link to="/contractor/projects/new" className="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all">
                        <HardHat className="w-12 h-12 mx-auto text-amber-600 mb-3" />
                        <p className="font-semibold">Start New Project</p>
                    </Link>
                    <Link to="/contractor/materials" className="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all">
                        <Package className="w-12 h-12 mx-auto text-green-600 mb-3" />
                        <p className="font-semibold">Order Materials</p>
                    </Link>
                    <Link to="/contractor/portfolio/add" className="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all">
                        <ImageIcon className="w-12 h-12 mx-auto text-purple-600 mb-3" />
                        <p className="font-semibold">Add to Portfolio</p>
                    </Link>
                    <Link to="/contractor/community" className="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <Users className="w-12 h-12 mx-auto text-blue-600 mb-3" />
                        <p className="font-semibold">Join Community</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ContractorDashboardPage;