// pages/Contractor/PortfolioPage.jsx
import React, { useState } from 'react';
import {
    Image as ImageIcon, Plus, Edit2, Trash2,
    Eye, ThumbsUp, MessageCircle, Share2,
    Filter, Search, Grid, List, Award, MapPin
} from 'lucide-react';

const PortfolioPage = () => {
    const [projects, setProjects] = useState([
        {
            id: 1,
            title: 'Luxury Villa Construction',
            category: 'Residential',
            client: 'Mr. Sharma',
            year: '2023',
            location: 'Pune, Maharashtra',
            description: 'Complete construction of 5000 sq ft luxury villa with modern amenities',
            images: ['https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Villa+1', 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Villa+2'],
            status: 'completed',
            budget: '₹85L',
            likes: 45,
            views: 120
        },
        {
            id: 2,
            title: 'Commercial Office Complex',
            category: 'Commercial',
            client: 'ABC Corp',
            year: '2022',
            location: 'Mumbai, Maharashtra',
            description: '5-story office building with green building certification',
            images: ['https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Office+1'],
            status: 'completed',
            budget: '₹2.5Cr',
            likes: 89,
            views: 240
        },
        {
            id: 3,
            title: 'Apartment Renovation',
            category: 'Renovation',
            client: 'Mrs. Patel',
            year: '2023',
            location: 'Nagpur, Maharashtra',
            description: 'Complete interior renovation of 3BHK apartment',
            images: ['https://via.placeholder.com/400x300/96CEB4/FFFFFF?text=Renovation+1', 'https://via.placeholder.com/400x300/FFEAA7/FFFFFF?text=Renovation+2'],
            status: 'completed',
            budget: '₹15L',
            likes: 32,
            views: 98
        },
        {
            id: 4,
            title: 'Industrial Warehouse',
            category: 'Industrial',
            client: 'XYZ Industries',
            year: '2024',
            location: 'Nashik, Maharashtra',
            description: '50000 sq ft warehouse construction',
            images: ['https://via.placeholder.com/400x300/DDA0DD/FFFFFF?text=Warehouse+1'],
            status: 'in-progress',
            budget: '₹1.8Cr',
            likes: 12,
            views: 45
        }
    ]);

    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = ['all', 'residential', 'commercial', 'industrial', 'renovation', 'civil'];

    const handleAddProject = () => {
        // Add project logic
        console.log('Add new project');
    };

    const handleDeleteProject = (id) => {
        setProjects(projects.filter(project => project.id !== id));
    };

    const filteredProjects = selectedCategory === 'all'
        ? projects
        : projects.filter(project => project.category.toLowerCase() === selectedCategory);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Portfolio</h1>
                    <p className="text-gray-600">Showcase your completed and ongoing projects</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleAddProject}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-5 h-5" />
                        Add Project
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow border p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="search"
                                placeholder="Search projects..."
                                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-amber-50 text-amber-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-amber-50 text-amber-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Project Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={project.images[0]}
                                    alt={project.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {project.status}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button className="p-2 bg-white/80 rounded-full hover:bg-white">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="p-2 bg-white/80 rounded-full hover:bg-white"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Project Details */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                        {project.category}
                                    </span>
                                    <span className="text-lg font-bold text-gray-900">{project.budget}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        {project.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Award className="w-4 h-4" />
                                        Completed: {project.year}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-1 text-gray-600 hover:text-amber-600">
                                            <ThumbsUp className="w-5 h-5" />
                                            <span>{project.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-1 text-gray-600 hover:text-amber-600">
                                            <Eye className="w-5 h-5" />
                                            <span>{project.views}</span>
                                        </button>
                                        <button className="flex items-center gap-1 text-gray-600 hover:text-amber-600">
                                            <MessageCircle className="w-5 h-5" />
                                            <span>12</span>
                                        </button>
                                    </div>
                                    <button className="text-amber-600 hover:text-amber-700 font-medium">
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Project</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Client</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                                <th className="px6 py-4 text-left text-sm font-medium text-gray-900">Budget</th>
                                <th className="px6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                                <th className="px6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={project.images[0]}
                                                alt={project.title}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div>
                                                <h4 className="font-medium text-gray-900">{project.title}</h4>
                                                <p className="text-sm text-gray-500">{project.location}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-900">{project.client}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 text-sm bg-amber-50 text-amber-700 rounded-full">
                                            {project.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{project.budget}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-sm rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-gray-600 hover:text-amber-600">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-600 hover:text-amber-600">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="p-2 text-gray-600 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-600 hover:text-amber-600">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {filteredProjects.length === 0 && (
                <div className="bg-white rounded-xl shadow border p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600 mb-6">Start showcasing your work by adding your first project</p>
                    <button
                        onClick={handleAddProject}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-5 h-5" />
                        Add Your First Project
                    </button>
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;