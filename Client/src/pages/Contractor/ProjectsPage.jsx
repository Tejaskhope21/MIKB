import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Briefcase, Calendar, Users, DollarSign,
    TrendingUp, Clock, CheckCircle, AlertCircle,
    Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2
} from 'lucide-react';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedProject, setSelectedProject] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-backend-qyea.onrender.com/api';

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            // Mock data - replace with API call
            const mockProjects = [
                {
                    _id: '1',
                    title: 'Residential Villa Construction',
                    client: 'Mr. Rajesh Sharma',
                    status: 'active',
                    priority: 'high',
                    progress: 75,
                    budget: 4500000,
                    startDate: '2024-11-15',
                    endDate: '2025-03-15',
                    teamSize: 8,
                    location: 'Mumbai, Maharashtra',
                    description: 'Complete villa construction with modern amenities',
                    milestones: [
                        { title: 'Foundation Complete', completed: true, date: '2024-12-01' },
                        { title: 'Structure Complete', completed: true, date: '2025-01-15' },
                        { title: 'Interior Work', completed: false, date: '2025-02-28' },
                        { title: 'Final Handover', completed: false, date: '2025-03-15' }
                    ]
                },
                {
                    _id: '2',
                    title: 'Commercial Office Complex',
                    client: 'ABC Corporation',
                    status: 'planning',
                    priority: 'medium',
                    progress: 20,
                    budget: 12000000,
                    startDate: '2025-01-01',
                    endDate: '2025-06-30',
                    teamSize: 15,
                    location: 'Bangalore, Karnataka',
                    description: '3-story office building with parking facility'
                },
                {
                    _id: '3',
                    title: 'Luxury Apartment Renovation',
                    client: 'Mrs. Priya Patel',
                    status: 'active',
                    priority: 'high',
                    progress: 90,
                    budget: 1200000,
                    startDate: '2024-10-01',
                    endDate: '2025-02-28',
                    teamSize: 5,
                    location: 'Pune, Maharashtra'
                },
                {
                    _id: '4',
                    title: 'Industrial Factory Shed',
                    client: 'XYZ Industries Ltd.',
                    status: 'completed',
                    priority: 'low',
                    progress: 100,
                    budget: 8500000,
                    startDate: '2024-08-01',
                    endDate: '2025-01-15',
                    teamSize: 12,
                    location: 'Chennai, Tamil Nadu'
                },
                {
                    _id: '5',
                    title: 'School Building Construction',
                    client: 'Government School Board',
                    status: 'active',
                    priority: 'high',
                    progress: 60,
                    budget: 3500000,
                    startDate: '2024-12-01',
                    endDate: '2025-04-30',
                    teamSize: 10,
                    location: 'Hyderabad, Telangana'
                }
            ];
            setProjects(mockProjects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-800';
            case 'planning': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'on-hold': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        planning: projects.filter(p => p.status === 'planning').length,
        totalBudget: projects.reduce((sum, p) => sum + p.budget, 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
                    <p className="text-gray-600">Manage and track all your construction projects</p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Total Projects</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
                        </div>
                        <Briefcase className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +3 this month
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Active Projects</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.active}</p>
                        </div>
                        <Clock className="w-10 h-10 text-amber-600" />
                    </div>
                    <p className="text-sm text-gray-600">Currently in progress</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Total Budget</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">₹{(stats.totalBudget / 100000).toFixed(1)}L</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-sm text-green-600">Active budget</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Team Size</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">50</p>
                        </div>
                        <Users className="w-10 h-10 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600">Across all projects</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search projects by name, client, or location..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="planning">Planning</option>
                            <option value="on-hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </select>
                        <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            More Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No projects found. Try different search terms.
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{project.title}</div>
                                                <div className="text-sm text-gray-500">{project.location}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{project.client}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                                </span>
                                                <span className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`}></span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${project.progress >= 80 ? 'bg-green-500' :
                                                            project.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${project.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium">{project.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold">₹{(project.budget / 100000).toFixed(1)}L</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>{new Date(project.endDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Project Overview */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                                <p className="text-gray-600">{selectedProject.client} • {selectedProject.location}</p>
                            </div>
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-semibold">{selectedProject.status}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Budget</p>
                                <p className="font-semibold">₹{(selectedProject.budget / 100000).toFixed(1)}L</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Progress</p>
                                <p className="font-semibold">{selectedProject.progress}%</p>
                            </div>
                        </div>
                        {/* Add more project details here */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;