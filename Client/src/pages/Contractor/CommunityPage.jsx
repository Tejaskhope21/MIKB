// pages/Contractor/CommunityPage.jsx
import React, { useState } from 'react';
import {
    Users, MessageSquare, TrendingUp, Filter,
    Search, Plus, ThumbsUp, MessageCircle, Share2,
    Award, Calendar, Briefcase, HardHat, BookOpen
} from 'lucide-react';

const CommunityPage = () => {
    const [activeTab, setActiveTab] = useState('discussions');
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: 'Raj Construction',
            role: 'General Contractor',
            avatar: 'https://via.placeholder.com/40',
            title: 'Best practices for RCC work in high-rise buildings',
            content: 'Sharing some insights from our recent 25-story project...',
            category: 'Construction',
            likes: 45,
            comments: 12,
            shares: 5,
            time: '2 hours ago',
            tags: ['rcc', 'high-rise', 'best-practices']
        },
        {
            id: 2,
            author: 'Material Suppliers Group',
            role: 'Supplier Network',
            avatar: 'https://via.placeholder.com/40',
            title: 'Steel price forecast for Q2 2024',
            content: 'Market analysis suggests prices may rise by 8-10% next quarter...',
            category: 'Materials',
            likes: 123,
            comments: 45,
            shares: 28,
            time: '1 day ago',
            tags: ['steel', 'market', 'forecast']
        },
        {
            id: 3,
            author: 'Civil Engineers Forum',
            role: 'Professional Association',
            avatar: 'https://via.placeholder.com/40',
            title: 'New building code updates 2024',
            content: 'Important changes in the latest building regulations...',
            category: 'Regulations',
            likes: 89,
            comments: 34,
            shares: 19,
            time: '5 hours ago',
            tags: ['code', 'regulations', 'updates']
        }
    ]);

    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Construction Tech Expo 2024',
            date: 'Mar 15-17, 2024',
            location: 'Mumbai',
            attendees: 245,
            type: 'Expo'
        },
        {
            id: 2,
            title: 'Sustainable Building Workshop',
            date: 'Mar 22, 2024',
            location: 'Pune',
            attendees: 120,
            type: 'Workshop'
        },
        {
            id: 3,
            title: 'Contractor Networking Meet',
            date: 'Apr 5, 2024',
            location: 'Online',
            attendees: 350,
            type: 'Networking'
        }
    ]);

    const [topContributors, setTopContributors] = useState([
        { id: 1, name: 'Arun Builders', points: 1245, projects: 42 },
        { id: 2, name: 'Mohan Construction', points: 987, projects: 35 },
        { id: 3, name: 'City Contractors', points: 765, projects: 28 },
        { id: 4, name: 'Green Build Co.', points: 654, projects: 22 },
    ]);

    const handleLike = (postId) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, likes: post.likes + 1 }
                : post
        ));
    };

    const handleNewPost = () => {
        console.log('Create new post');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold">Contractor Community</h1>
                        <p className="text-blue-100 mt-2">Connect, learn, and grow with fellow construction professionals</p>
                        <div className="flex items-center gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span>1,245 Active Members</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                <span>548 Discussions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>85% Engagement Rate</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleNewPost}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Start Discussion
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Discussions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow border">
                        <div className="border-b">
                            <div className="flex">
                                {['discussions', 'questions', 'trending'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-4 font-medium ${activeTab === tab
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl shadow border p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="search"
                                        placeholder="Search discussions..."
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-500" />
                                <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>All Categories</option>
                                    <option>Construction</option>
                                    <option>Materials</option>
                                    <option>Regulations</option>
                                    <option>Business</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Discussion Posts */}
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-xl shadow border overflow-hidden">
                                <div className="p-6">
                                    {/* Post Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={post.avatar}
                                                alt={post.author}
                                                className="w-12 h-12 rounded-full"
                                            />
                                            <div>
                                                <h3 className="font-bold text-gray-900">{post.author}</h3>
                                                <p className="text-sm text-gray-600">{post.role}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500">{post.time}</span>
                                    </div>

                                    {/* Post Content */}
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
                                        <p className="text-gray-700">{post.content}</p>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {post.tags.map((tag, index) => (
                                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                                            >
                                                <ThumbsUp className="w-5 h-5" />
                                                <span>{post.likes} Likes</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                                <MessageCircle className="w-5 h-5" />
                                                <span>{post.comments} Comments</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                                <Share2 className="w-5 h-5" />
                                                <span>{post.shares} Shares</span>
                                            </button>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                                            Join Discussion →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Top Contributors */}
                    <div className="bg-white rounded-xl shadow border p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            Top Contributors
                        </h3>
                        <div className="space-y-4">
                            {topContributors.map((contributor) => (
                                <div key={contributor.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {contributor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{contributor.name}</p>
                                            <p className="text-xs text-gray-500">{contributor.projects} projects</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-amber-600">{contributor.points}</p>
                                        <p className="text-xs text-gray-500">points</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-center text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50">
                            View All Contributors
                        </button>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white rounded-xl shadow border p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-500" />
                            Upcoming Events
                        </h3>
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold">{event.title}</h4>
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                            {event.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{event.date} • {event.location}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">
                                            👥 {event.attendees} attending
                                        </span>
                                        <button className="text-sm text-blue-600 hover:text-blue-700">
                                            Register
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="w-6 h-6" />
                            <h3 className="font-bold">Learning Resources</h3>
                        </div>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="flex items-center gap-2 hover:underline">
                                    <Briefcase className="w-4 h-4" />
                                    Project Management Guide
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-2 hover:underline">
                                    <HardHat className="w-4 h-4" />
                                    Safety Protocols 2024
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-2 hover:underline">
                                    <TrendingUp className="w-4 h-4" />
                                    Market Analysis Report
                                </a>
                            </li>
                        </ul>
                        <button className="w-full mt-4 py-2 bg-white text-green-600 font-medium rounded-lg hover:bg-green-50">
                            Explore Resources
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;