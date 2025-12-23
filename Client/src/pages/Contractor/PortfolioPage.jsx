import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Image as ImageIcon, Plus, Eye, Heart, Share2,
    Edit, Trash2, Filter, Search, Award, MapPin,
    Calendar, DollarSign, TrendingUp, Users
} from 'lucide-react';

const PortfolioPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [selectedProject, setSelectedProject] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            // Mock data - replace with API call
            const mockPortfolio = [
                {
                    _id: '1',
                    title: 'Luxury Villa Construction',
                    category: 'Residential',
                    client: 'Mr. & Mrs. Sharma',
                    location: 'Mumbai, Maharashtra',
                    year: 2024,
                    budget: 5000000,
                    description: 'Complete modern villa with smart home features and landscape design',
                    images: [
                        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
                        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w-800',
                        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
                    ],
                    status: 'completed',
                    likes: 45,
                    views: 128,
                    features: ['Smart Home', 'Landscaped Garden', 'Swimming Pool', 'Solar Panels'],
                    teamSize: 12,
                    duration: '8 months'
                },
                {
                    _id: '2',
                    title: 'Commercial Office Complex',
                    category: 'Commercial',
                    client: 'TechCorp Solutions',
                    location: 'Bangalore, Karnataka',
                    year: 2023,
                    budget: 12000000,
                    description: 'Modern office building with eco-friendly design and advanced facilities',
                    images: [
                        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
                        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
                    ],
                    status: 'completed',
                    likes: 89,
                    views: 256,
                    features: ['LEED Certified', 'Parking Facility', 'Cafeteria', 'Conference Rooms'],
                    teamSize: 25,
                    duration: '14 months'
                },
                {
                    _id: '3',
                    title: 'School Renovation Project',
                    category: 'Educational',
                    client: 'Government School Board',
                    location: 'Pune, Maharashtra',
                    year: 2024,
                    budget: 3500000,
                    description: 'Complete renovation of school building with earthquake-resistant structure',
                    images: [
                        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
                        'https://images.unsplash.com/photo-1562774053-701939374585?w=800'
                    ],
                    status: 'ongoing',
                    likes: 23,
                    views: 95,
                    features: ['Earthquake Resistant', 'Disabled Friendly', 'Playground', 'Library'],
                    teamSize: 15,
                    duration: '6 months'
                },
                {
                    _id: '4',
                    title: 'Industrial Warehouse',
                    category: 'Industrial',
                    client: 'Logistics Express',
                    location: 'Chennai, Tamil Nadu',
                    year: 2023,
                    budget: 8500000,
                    description: 'Large-scale warehouse with automated storage and loading systems',
                    images: [
                        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
                        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800'
                    ],
                    status: 'completed',
                    likes: 67,
                    views: 187,
                    features: ['Automated Storage', 'Loading Docks', 'Security System', 'Fire Safety'],
                    teamSize: 30,
                    duration: '10 months'
                }
            ];
            setProjects(mockPortfolio);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', 'Residential', 'Commercial', 'Industrial', 'Educational', 'Healthcare', 'Hospitality'];

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const stats = {
        total: projects.length,
        completed: projects.filter(p => p.status === 'completed').length,
        ongoing: projects.filter(p => p.status === 'ongoing').length,
        totalLikes: projects.reduce((sum, p) => sum + p.likes, 0),
        totalViews: projects.reduce((sum, p) => sum + p.views, 0),
        totalBudget: projects.reduce((sum, p) => sum + p.budget, 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Portfolio</h1>
                    <p className="text-gray-600">Showcase your best construction projects</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            className={`px-4 py-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-600'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            Grid
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'}`}
                            onClick={() => setViewMode('list')}
                        >
                            List
                        </button>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Project
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold mt-2">{stats.completed}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-2xl font-bold mt-2">₹{(stats.totalBudget / 1000000).toFixed(1)}Cr</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Total Likes</p>
                    <p className="text-2xl font-bold mt-2">{stats.totalLikes}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold mt-2">{stats.totalViews}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Team Size</p>
                    <p className="text-2xl font-bold mt-2">82</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search portfolio projects..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                        <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            More Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Portfolio Grid/List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio projects found</h3>
                    <p className="text-gray-600 mb-6">Try different search terms or add your first project</p>
                    <button className="px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700">
                        <Plus className="w-5 h-5 inline mr-2" />
                        Add First Project
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative">
                                <img
                                    src={project.images[0]}
                                    alt={project.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            project.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{project.title}</h3>
                                        <p className="text-gray-600 text-sm">{project.category} • {project.year}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-xl">₹{(project.budget / 100000).toFixed(1)}L</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4 line-clamp-2">{project.description}</p>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{project.location.split(',')[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            {project.likes}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            {project.views}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredProjects.map((project) => (
                        <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex gap-6">
                                <img
                                    src={project.images[0]}
                                    alt={project.title}
                                    className="w-48 h-48 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-xl mb-2">{project.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Award className="w-4 h-4" />
                                                    {project.category}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {project.year}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {project.location}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-2xl mb-2">₹{(project.budget / 100000).toFixed(1)}L</p>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    project.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-4">{project.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            {project.features.slice(0, 3).map((feature, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                Team: {project.teamSize}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {project.duration}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;