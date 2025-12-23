import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, MessageSquare, TrendingUp, ThumbsUp,
    Share2, Bookmark, Filter, Search, Plus,
    Award, Calendar, MapPin, Hash, Clock, Eye,
    UserCircle, Send, Image as ImageIcon, Link
} from 'lucide-react';

const CommunityPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'discussion' });
    const [showNewPostForm, setShowNewPostForm] = useState(false);

    useEffect(() => {
        fetchCommunityPosts();
    }, []);

    const fetchCommunityPosts = async () => {
        try {
            setLoading(true);
            // Mock data - replace with API call
            const mockPosts = [
                {
                    _id: '1',
                    title: 'Best practices for RCC work in monsoon season',
                    author: {
                        name: 'Raj Construction',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                        role: 'Civil Engineer',
                        experience: '15 years'
                    },
                    content: 'During monsoon, proper curing and waterproofing are crucial. Here are some tips I\'ve learned over the years...',
                    category: 'construction',
                    tags: ['RCC', 'Monsoon', 'Concrete', 'Waterproofing'],
                    likes: 45,
                    comments: 12,
                    shares: 5,
                    views: 128,
                    createdAt: '2024-11-15T10:30:00Z',
                    isLiked: false,
                    isBookmarked: false
                },
                {
                    _id: '2',
                    title: 'New building code updates 2025 - What you need to know',
                    author: {
                        name: 'Civil Engineers Forum',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                        role: 'Building Inspector',
                        experience: '20 years'
                    },
                    content: 'The updated building codes focus on earthquake resistance and energy efficiency. Key changes include...',
                    category: 'regulations',
                    tags: ['Building Codes', 'Regulations', '2025', 'Compliance'],
                    likes: 89,
                    comments: 34,
                    shares: 23,
                    views: 256,
                    createdAt: '2024-11-14T14:20:00Z',
                    isLiked: true,
                    isBookmarked: true
                },
                {
                    _id: '3',
                    title: 'Steel price forecast Q1 2025 - Analysis and predictions',
                    author: {
                        name: 'Material Suppliers Group',
                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
                        role: 'Steel Supplier',
                        experience: '25 years'
                    },
                    content: 'Based on current market trends and demand projections, here\'s what we expect for steel prices...',
                    category: 'materials',
                    tags: ['Steel', 'Prices', 'Market', 'Forecast', '2025'],
                    likes: 123,
                    comments: 45,
                    shares: 18,
                    views: 312,
                    createdAt: '2024-11-13T09:15:00Z',
                    isLiked: false,
                    isBookmarked: false
                },
                {
                    _id: '4',
                    title: 'Sustainable construction techniques for modern buildings',
                    author: {
                        name: 'Green Builders Association',
                        avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005-128?w=100',
                        role: 'Sustainability Expert',
                        experience: '18 years'
                    },
                    content: 'Eco-friendly construction not only helps the environment but can also reduce long-term costs...',
                    category: 'sustainability',
                    tags: ['Green Building', 'Sustainability', 'Eco-friendly', 'Cost Saving'],
                    likes: 67,
                    comments: 28,
                    shares: 12,
                    views: 189,
                    createdAt: '2024-11-12T16:45:00Z',
                    isLiked: true,
                    isBookmarked: false
                },
                {
                    _id: '5',
                    title: 'How to manage construction delays effectively',
                    author: {
                        name: 'Project Management Pros',
                        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
                        role: 'Project Manager',
                        experience: '22 years'
                    },
                    content: 'Delays are inevitable in construction. Here\'s my framework for minimizing impact and keeping projects on track...',
                    category: 'management',
                    tags: ['Project Management', 'Delays', 'Time Management', 'Planning'],
                    likes: 78,
                    comments: 31,
                    shares: 9,
                    views: 234,
                    createdAt: '2024-11-11T11:10:00Z',
                    isLiked: false,
                    isBookmarked: true
                }
            ];
            setPosts(mockPosts);
        } catch (error) {
            console.error('Error fetching community posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: 'all', name: 'All Topics' },
        { id: 'construction', name: 'Construction', icon: '🏗️' },
        { id: 'materials', name: 'Materials', icon: '🧱' },
        { id: 'management', name: 'Management', icon: '📊' },
        { id: 'regulations', name: 'Regulations', icon: '📜' },
        { id: 'sustainability', name: 'Sustainability', icon: '🌱' },
        { id: 'technology', name: 'Technology', icon: '💻' },
        { id: 'safety', name: 'Safety', icon: '⚠️' }
    ];

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleLike = (postId) => {
        setPosts(posts.map(post =>
            post._id === postId
                ? {
                    ...post,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    isLiked: !post.isLiked
                }
                : post
        ));
    };

    const handleBookmark = (postId) => {
        setPosts(posts.map(post =>
            post._id === postId
                ? { ...post, isBookmarked: !post.isBookmarked }
                : post
        ));
    };

    const handleSubmitPost = (e) => {
        e.preventDefault();
        const newPostObj = {
            _id: `post-${Date.now()}`,
            title: newPost.title,
            author: {
                name: 'You',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                role: 'Contractor',
                experience: '5 years'
            },
            content: newPost.content,
            category: newPost.category,
            tags: [],
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
            createdAt: new Date().toISOString(),
            isLiked: false,
            isBookmarked: false
        };
        setPosts([newPostObj, ...posts]);
        setNewPost({ title: '', content: '', category: 'discussion' });
        setShowNewPostForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Community</h1>
                    <p className="text-gray-600">Connect, share, and learn with fellow contractors</p>
                </div>
                <button
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all flex items-center gap-2"
                    onClick={() => setShowNewPostForm(true)}
                >
                    <Plus className="w-5 h-5" />
                    Create Post
                </button>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold mt-2">1.2K+</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Total Posts</p>
                    <p className="text-2xl font-bold mt-2">456</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Discussions</p>
                    <p className="text-2xl font-bold mt-2">289</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Today's Activity</p>
                    <p className="text-2xl font-bold mt-2">42</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar - Categories */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Categories
                        </h3>
                        <div className="space-y-2">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${filterCategory === category.id
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                            : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    onClick={() => setFilterCategory(category.id)}
                                >
                                    <span className="text-lg">{category.icon}</span>
                                    <span>{category.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trending Tags */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Trending Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {['#Construction', '#Materials', '#ProjectManagement', '#Safety', '#Sustainability', '#RCC', '#Steel', '#Concrete', '#CostControl', '#GreenBuilding'].map(tag => (
                                <button
                                    key={tag}
                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center gap-1"
                                    onClick={() => setSearchTerm(tag.replace('#', ''))}
                                >
                                    <Hash className="w-3 h-3" />
                                    {tag.replace('#', '')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content - Posts */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search discussions, topics, or tags..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                                <option value="newest">Newest First</option>
                                <option value="popular">Most Popular</option>
                                <option value="trending">Trending</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {/* New Post Form */}
                    {showNewPostForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Create New Post</h3>
                                <button
                                    onClick={() => setShowNewPostForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleSubmitPost}>
                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Post title"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                            value={newPost.title}
                                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            placeholder="What would you like to discuss?"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 h-32"
                                            value={newPost.content}
                                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <button type="button" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                                <ImageIcon className="w-5 h-5" />
                                            </button>
                                            <button type="button" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                                <Link className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex gap-3">
                                            <select
                                                className="px-4 py-2 border border-gray-300 rounded-lg"
                                                value={newPost.category}
                                                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                            >
                                                <option value="discussion">Discussion</option>
                                                <option value="question">Question</option>
                                                <option value="tip">Tip</option>
                                                <option value="news">News</option>
                                            </select>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Posts List */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                            <p className="text-gray-600">Try different search terms or start a new discussion</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredPosts.map((post) => (
                                <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="p-6">
                                        {/* Post Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={post.author.avatar}
                                                    alt={post.author.name}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                                <div>
                                                    <div className="font-bold">{post.author.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {post.author.role} • {post.author.experience} experience
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Post Content */}
                                        <div className="mb-4">
                                            <h3 className="font-bold text-xl mb-3">{post.title}</h3>
                                            <p className="text-gray-700 mb-4">{post.content}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {post.tags.map(tag => (
                                                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Post Stats and Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-6 text-gray-600">
                                                <button
                                                    className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                                                    onClick={() => handleLike(post._id)}
                                                >
                                                    <ThumbsUp className="w-5 h-5" />
                                                    <span>{post.likes}</span>
                                                </button>
                                                <button className="flex items-center gap-2 hover:text-blue-500">
                                                    <MessageSquare className="w-5 h-5" />
                                                    <span>{post.comments}</span>
                                                </button>
                                                <button className="flex items-center gap-2 hover:text-green-500">
                                                    <Share2 className="w-5 h-5" />
                                                    <span>{post.shares}</span>
                                                </button>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Eye className="w-5 h-5" />
                                                    <span>{post.views}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className={`p-2 rounded-lg ${post.isBookmarked ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-600 hover:bg-gray-100'}`}
                                                    onClick={() => handleBookmark(post._id)}
                                                >
                                                    <Bookmark className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;