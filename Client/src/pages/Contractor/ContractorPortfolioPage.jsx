import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Image as ImageIcon, Plus, Eye, Heart, Share2,
    Edit, Trash2, Filter, Search, Award, MapPin,
    Calendar, DollarSign, TrendingUp, Users, Clock,
    Loader2, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ContractorPortfolioPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [selectedProject, setSelectedProject] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Residential Construction',
        client: '',
        location: '',
        year: new Date().getFullYear(),
        budget: 0,
        images: [],
        status: 'completed',
        features: []
    });
    const [newFeature, setNewFeature] = useState('');

    // FIXED: Use import.meta.env for Vite instead of process.env
    // Get API URL from environment variables or use localhost as fallback
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://bricks-backend-qyea.onrender.com';
    
    // Alternative: You can also hardcode your backend URL directly
    // const API_BASE_URL = ' https://bricks-backend-qyea.onrender.com';
    
    const token = localStorage.getItem('token');

    // Create axios instance with auth header
    const getAuthHeaders = () => ({
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            
            // Check if user is authenticated
            if (!token) {
                toast.error('Please login to access portfolio');
                // Optionally redirect to login page
                // navigate('/login');
                setLoading(false);
                return;
            }
            
            // Fetch contractor's own portfolio
            const response = await axios.get(
                `${API_BASE_URL}/api/contractor/portfolio/projects`,
                getAuthHeaders()
            );
            
            if (response.data.success) {
                setProjects(response.data.portfolio || []);
                toast.success(`Loaded ${response.data.count} projects`);
            } else {
                toast.error('Failed to load portfolio');
            }
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            
            // If 401/403, redirect to login
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error('Please login to access portfolio');
                // Clear invalid token
                localStorage.removeItem('token');
                // Optionally redirect to login page
                // navigate('/login');
                return;
            }
            
            // Handle network errors
            if (error.code === 'ERR_NETWORK') {
                toast.error('Unable to connect to server. Please check your connection.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to load portfolio');
            }
            
            // Fallback to empty array if API fails
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProject = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/contractor/portfolio/projects`,
                formData,
                getAuthHeaders()
            );
            
            if (response.data.success) {
                toast.success('Project added successfully!');
                
                // Add new project to the list
                const newProject = response.data.project;
                setProjects(prev => [newProject, ...prev]);
                
                setIsModalOpen(false);
                resetForm();
            } else {
                toast.error(response.data.message || 'Failed to add project');
            }
        } catch (error) {
            console.error('Error adding project:', error);
            toast.error(error.response?.data?.message || 'Failed to add project');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProject = async (projectId, updates) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/contractor/portfolio/projects/${projectId}`,
                updates,
                getAuthHeaders()
            );
            
            if (response.data.success) {
                toast.success('Project updated successfully!');
                
                // Update project in state
                setProjects(prev => prev.map(p => 
                    p._id === projectId ? { ...p, ...response.data.project, updatedAt: new Date() } : p
                ));
            } else {
                toast.error(response.data.message || 'Failed to update project');
            }
        } catch (error) {
            console.error('Error updating project:', error);
            toast.error(error.response?.data?.message || 'Failed to update project');
        }
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            const response = await axios.delete(
                `${API_BASE_URL}/api/contractor/portfolio/projects/${projectToDelete}`,
                getAuthHeaders()
            );
            
            if (response.data.success) {
                toast.success('Project deleted successfully!');
                
                // Remove project from state
                setProjects(prev => prev.filter(p => p._id !== projectToDelete));
                
                setIsDeleteModalOpen(false);
                setProjectToDelete(null);
            } else {
                toast.error(response.data.message || 'Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error(error.response?.data?.message || 'Failed to delete project');
        }
    };

    const handleEditProject = (project) => {
        setFormData({
            _id: project._id,
            title: project.title || '',
            description: project.description || '',
            category: project.category || 'Residential Construction',
            client: project.client || '',
            location: project.location || '',
            year: project.year || new Date().getFullYear(),
            budget: project.budget || 0,
            images: project.images || [],
            status: project.status || 'completed',
            features: project.features || []
        });
        setIsModalOpen(true);
    };

    const handleLikeProject = async (projectId) => {
        const project = projects.find(p => p._id === projectId);
        if (!project) return;

        const newLikes = (project.likes || 0) + 1;
        
        try {
            await handleUpdateProject(projectId, { likes: newLikes });
        } catch (error) {
            console.error('Error liking project:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'Residential Construction',
            client: '',
            location: '',
            year: new Date().getFullYear(),
            budget: 0,
            images: [],
            status: 'completed',
            features: []
        });
        setNewFeature('');
    };

    // Categories based on your contractor model
    const categories = [
        'all',
        'Residential Construction',
        'Commercial Construction',
        'Industrial Construction',
        'Renovation',
        'Civil Works',
        'Electrical',
        'Plumbing',
        'Interior Design',
        'Landscaping',
        'Project Management'
    ];

    const statusColors = {
        completed: 'bg-green-100 text-green-800',
        ongoing: 'bg-blue-100 text-blue-800',
        upcoming: 'bg-yellow-100 text-yellow-800',
        on_hold: 'bg-orange-100 text-orange-800'
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch = 
            (project.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (project.client?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (project.location?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
        
        return matchesSearch && matchesCategory;
    });

    const stats = {
        total: projects.length,
        completed: projects.filter(p => p.status === 'completed').length,
        ongoing: projects.filter(p => p.status === 'ongoing').length,
        totalLikes: projects.reduce((sum, p) => sum + (p.likes || 0), 0),
        totalViews: projects.reduce((sum, p) => sum + (p.views || 0), 0),
        totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    };

    const handleAddFeature = () => {
        if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
            setFormData({
                ...formData,
                features: [...formData.features, newFeature.trim()]
            });
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (index) => {
        const newFeatures = [...formData.features];
        newFeatures.splice(index, 1);
        setFormData({ ...formData, features: newFeatures });
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(2)} K`;
        }
        return `₹${amount}`;
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Portfolio</h1>
                    <p className="text-gray-600">Showcase your construction projects</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            className={`px-3 py-2 rounded-md text-sm ${viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-600'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            Grid
                        </button>
                        <button
                            className={`px-3 py-2 rounded-md text-sm ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'}`}
                            onClick={() => setViewMode('list')}
                        >
                            List
                        </button>
                    </div>
                    <button 
                        className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all flex items-center gap-2 text-sm"
                        onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Project
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Total Projects</p>
                    <p className="text-xl md:text-2xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-xl md:text-2xl font-bold mt-2">{stats.completed}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-xl md:text-2xl font-bold mt-2">{formatCurrency(stats.totalBudget)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Total Likes</p>
                    <p className="text-xl md:text-2xl font-bold mt-2">{stats.totalLikes}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-xl md:text-2xl font-bold mt-2">{stats.totalViews}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600">Ongoing</p>
                    <p className="text-xl md:text-2xl font-bold mt-2">{stats.ongoing}</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search projects by title, client, or location..."
                            className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm w-full md:w-auto"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Portfolio Content */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600 mb-6">
                        {projects.length === 0 
                            ? "You haven't added any projects yet. Start building your portfolio!"
                            : "No projects match your search criteria."}
                    </p>
                    {projects.length === 0 && (
                        <button 
                            className="px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 text-sm"
                            onClick={() => {
                                resetForm();
                                setIsModalOpen(true);
                            }}
                        >
                            <Plus className="w-5 h-5 inline mr-2" />
                            Add Your First Project
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative">
                                <img
                                    src={project.images?.[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'}
                                    alt={project.title}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800';
                                    }}
                                />
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button 
                                        className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                                        onClick={() => setSelectedProject(project)}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                                        onClick={() => handleEditProject(project)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                                        onClick={() => {
                                            setProjectToDelete(project._id);
                                            setIsDeleteModalOpen(true);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 md:p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-base md:text-lg mb-1 line-clamp-1">{project.title}</h3>
                                        <p className="text-gray-600 text-xs md:text-sm">
                                            {project.category} • {project.year || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right ml-2">
                                        <p className="font-bold text-base md:text-lg">{formatCurrency(project.budget)}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-3 line-clamp-2 text-sm">
                                    {project.description || 'No description provided.'}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {project.features?.slice(0, 2).map((feature, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                            {feature}
                                        </span>
                                    ))}
                                    {project.features?.length > 2 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                            +{project.features.length - 2} more
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="truncate max-w-[100px] md:max-w-[120px]">
                                            {project.location?.split(',')[0] || 'Location not specified'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            className="flex items-center gap-1 hover:text-red-500 transition-colors"
                                            onClick={() => handleLikeProject(project._id)}
                                        >
                                            <Heart className="w-3 h-3 md:w-4 md:h-4" />
                                            <span>{project.likes || 0}</span>
                                        </button>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3 md:w-4 md:h-4" />
                                            <span>{project.views || 0}</span>
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
                        <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                <img
                                    src={project.images?.[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'}
                                    alt={project.title}
                                    className="w-full md:w-48 h-48 object-cover rounded-lg"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800';
                                    }}
                                />
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg md:text-xl mb-2">{project.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-600 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Award className="w-4 h-4" />
                                                    {project.category}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {project.year || 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {project.location || 'Location not specified'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right mt-2 md:mt-0">
                                            <p className="font-bold text-xl md:text-2xl mb-2">{formatCurrency(project.budget)}</p>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-4 text-sm md:text-base">
                                        {project.description || 'No description provided.'}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.features?.map((feature, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                Client: {project.client || 'Not specified'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-4 h-4" />
                                                {project.likes || 0} likes
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {project.views || 0} views
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-sm"
                                                onClick={() => setSelectedProject(project)}
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                            <button 
                                                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-sm"
                                                onClick={() => handleEditProject(project)}
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button 
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 text-sm"
                                                onClick={() => {
                                                    setProjectToDelete(project._id);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Project Modal (Add/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-4 flex justify-between items-center">
                            <h2 className="text-lg md:text-xl font-bold">
                                {formData._id ? 'Edit Project' : 'Add New Project'}
                            </h2>
                            <button 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddProject} className="p-4 md:p-6 space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="Enter project title"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    >
                                        {categories.filter(c => c !== 'all').map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="completed">Completed</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="upcoming">Upcoming</option>
                                    </select>
                                </div>

                                {/* Client */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Client Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                        value={formData.client}
                                        onChange={(e) => setFormData({...formData, client: e.target.value})}
                                        placeholder="Enter client name"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        placeholder="City, State"
                                    />
                                </div>

                                {/* Year */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year
                                    </label>
                                    <input
                                        type="number"
                                        min="2000"
                                        max={new Date().getFullYear() + 5}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                        value={formData.year}
                                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                                    />
                                </div>

                                {/* Budget */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                                        placeholder="0"
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Describe the project..."
                                    />
                                </div>

                                {/* Features */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Features
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                            value={newFeature}
                                            onChange={(e) => setNewFeature(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                            placeholder="Add a feature (e.g., Smart Home, Solar Panels)"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddFeature}
                                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.features.map((feature, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                                            >
                                                {feature}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFeature(index)}
                                                    className="ml-1 text-amber-800 hover:text-amber-900"
                                                >
                                                    <XCircle className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Images */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image URLs (one per line)
                                    </label>
                                    <textarea
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-mono"
                                        value={formData.images.join('\n')}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            images: e.target.value.split('\n').map(url => url.trim()).filter(url => url)
                                        })}
                                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter one image URL per line. These images will be displayed in your project gallery.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 md:pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {formData._id ? 'Updating...' : 'Adding...'}
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            {formData._id ? 'Update Project' : 'Add Project'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this project? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setProjectToDelete(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteProject}
                                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 text-sm"
                                >
                                    Delete Project
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Project Detail Modal */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-4 flex justify-between items-center">
                            <h2 className="text-lg md:text-xl font-bold">{selectedProject.title}</h2>
                            <button 
                                onClick={() => setSelectedProject(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>
                        <div className="p-4 md:p-6">
                            {/* Image Gallery */}
                            {selectedProject.images?.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {selectedProject.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`${selectedProject.title} - ${idx + 1}`}
                                            className="w-full h-48 md:h-64 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800';
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                            
                            {/* Project Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Project Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Category:</span>
                                            <span className="font-medium">{selectedProject.category}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Client:</span>
                                            <span className="font-medium">{selectedProject.client || 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Location:</span>
                                            <span className="font-medium">{selectedProject.location || 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Year:</span>
                                            <span className="font-medium">{selectedProject.year || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[selectedProject.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {selectedProject.status?.charAt(0).toUpperCase() + selectedProject.status?.slice(1) || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Project Metrics</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Budget:</span>
                                            <span className="font-medium">{formatCurrency(selectedProject.budget)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Created:</span>
                                            <span className="font-medium">
                                                {selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Updated:</span>
                                            <span className="font-medium">
                                                {selectedProject.updatedAt ? new Date(selectedProject.updatedAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Likes:</span>
                                            <span className="font-medium">{selectedProject.likes || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Views:</span>
                                            <span className="font-medium">{selectedProject.views || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {selectedProject.description || 'No description provided.'}
                                </p>
                            </div>
                            
                            {/* Features */}
                            {selectedProject.features?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.features.map((feature, idx) => (
                                            <span key={idx} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractorPortfolioPage;