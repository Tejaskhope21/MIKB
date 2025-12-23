import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    getUserMaterialRequirements,
    getMaterialRequirementById,
    updateMaterialRequirement,
    cancelMaterialRequirement,
    createMaterialRequirement,
    deleteMaterialRequirement,
    validatePhoneNumber
} from '../../services/api';

const MaterialRequirementsDashboard = () => {
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLoading, setUserLoading] = useState(true);
    const [error, setError] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    
    // States for modals and forms
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    
    // Form states
    const [formData, setFormData] = useState({
        projectType: '',
        projectLocation: '',
        deliveryDate: '',
        budgetRange: '',
        company: '',
        phone: '',
        materials: [
            { id: 1, type: '', quantity: '', unit: 'units', specification: '' }
        ],
        additionalNotes: '',
        urgencyLevel: 'medium',
        siteVisitRequired: false
    });
    
    // Filters
    const [filters, setFilters] = useState({
        status: '',
        projectType: '',
        search: '',
        sortBy: '-createdAt'
    });

    const materialCategories = [
        'Cement',
        'Steel/Rebar',
        'Bricks/Blocks',
        'Aggregates (Sand, Stone)',
        'Ready Mix Concrete',
        'Tiles (Floor, Wall)',
        'Sanitaryware',
        'Paints & Coatings',
        'Electrical Items',
        'Plumbing Materials',
        'Doors & Windows',
        'Hardware & Fittings',
        'Other'
    ];

    const unitOptions = [
        'MT', 'KG', 'Ton', 'Cubic Meter', 'Square Feet', 'Number', 'Set', 'Bag', 'units'
    ];

    const projectTypes = [
        'Residential Building',
        'Commercial Complex',
        'Industrial Project',
        'Infrastructure (Road/Bridge)',
        'Renovation/Remodeling',
        'Individual House',
        'Apartment Complex',
        'Other'
    ];

    const budgetRanges = [
        'Under ₹1 Lakh',
        '₹1-5 Lakh',
        '₹5-10 Lakh',
        '₹10-25 Lakh',
        '₹25-50 Lakh',
        '₹50 Lakh - 1 Cr',
        'Above ₹1 Cr'
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
        { value: 'accepted', label: 'Accepted', color: 'bg-purple-100 text-purple-800' },
        { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    ];

    // Urgency levels with brown colors
    const urgencyLevels = [
        { value: 'low', label: 'Low', color: 'bg-amber-50 text-amber-800 border border-amber-200' },
        { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-900 border border-amber-300' },
        { value: 'high', label: 'High', color: 'bg-amber-600 text-white border border-amber-700' },
        { value: 'urgent', label: 'Urgent', color: 'bg-red-600 text-white border border-red-700' }
    ];

    // Mock data for demonstration
    const mockRequirements = [
        {
            _id: '1',
            requirementNumber: 'REQ-176630873167-36DF',
            projectType: 'Individual House',
            projectLocation: 'Nagpur',
            deliveryDate: '2025-01-07',
            budgetRange: '₹50 Lakh - 1 Cr',
            materials: [
                { type: 'Cement', quantity: '12000', unit: 'units', specification: '' }
            ],
            status: 'cancelled',
            urgencyLevel: 'urgent',
            createdAt: '2025-12-21',
            additionalNotes: '',
            siteVisitRequired: false
        },
        {
            _id: '2',
            requirementNumber: 'REQ-176630873168-37DG',
            projectType: 'Commercial Complex',
            projectLocation: 'Mumbai',
            deliveryDate: '2025-02-15',
            budgetRange: 'Above ₹1 Cr',
            materials: [
                { type: 'Steel/Rebar', quantity: '50', unit: 'MT', specification: 'TMT Grade 500' },
                { type: 'Cement', quantity: '500', unit: 'Bags', specification: 'OPC 53 Grade' }
            ],
            status: 'pending',
            urgencyLevel: 'high',
            createdAt: '2025-12-20',
            additionalNotes: 'Need quick delivery',
            siteVisitRequired: true
        },
        {
            _id: '3',
            requirementNumber: 'REQ-176630873169-38DH',
            projectType: 'Residential Building',
            projectLocation: 'Delhi',
            deliveryDate: '2025-03-30',
            budgetRange: '₹25-50 Lakh',
            materials: [
                { type: 'Bricks/Blocks', quantity: '10000', unit: 'Number', specification: 'Clay Bricks' },
                { type: 'Tiles (Floor, Wall)', quantity: '500', unit: 'Square Feet', specification: 'Ceramic' }
            ],
            status: 'in-progress',
            urgencyLevel: 'medium',
            createdAt: '2025-12-19',
            additionalNotes: '',
            siteVisitRequired: false
        }
    ];

    // Fetch user info and requirements on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            setUserLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    setUserInfo({
                        name: localStorage.getItem('userName') || 'User',
                        email: localStorage.getItem('userEmail') || '',
                        phone: localStorage.getItem('userPhone') || ''
                    });
                } else {
                    navigate('/login');
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
            } finally {
                setUserLoading(false);
            }
        };

        fetchUserData();
        fetchRequirements();
    }, [navigate]);

    // Fetch requirements
    const fetchRequirements = async () => {
        setLoading(true);
        setError('');
        try {
            // Simulate API delay
            setTimeout(() => {
                setRequirements(mockRequirements);
                setLoading(false);
            }, 800);
            
        } catch (err) {
            console.error('Error fetching requirements:', err);
            setError('An error occurred while fetching requirements');
            setLoading(false);
        }
    };

    // Handle create new requirement
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setActionLoading(true);
        try {
            // For demo, simulate API call
            setTimeout(() => {
                const newRequirement = {
                    _id: Date.now().toString(),
                    requirementNumber: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                    ...formData,
                    materials: formData.materials.map(({ id, ...rest }) => rest),
                    status: 'pending',
                    createdAt: new Date().toISOString().split('T')[0]
                };
                
                setRequirements([newRequirement, ...requirements]);
                alert('Requirement created successfully!');
                setShowCreateModal(false);
                resetForm();
                setActionLoading(false);
            }, 1000);

        } catch (err) {
            console.error('Create error:', err);
            setError('Failed to create requirement');
            setActionLoading(false);
        }
    };

    // Handle update requirement
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRequirement || !validateForm()) return;

        setActionLoading(true);
        try {
            // For demo, simulate update
            setTimeout(() => {
                const updateData = {
                    ...formData,
                    materials: formData.materials.map(({ id, ...rest }) => rest)
                };
                const updatedRequirements = requirements.map(req =>
                    req._id === selectedRequirement._id 
                        ? { ...req, ...updateData }
                        : req
                );
                setRequirements(updatedRequirements);
                alert('Requirement updated successfully!');
                setShowEditModal(false);
                resetForm();
                setActionLoading(false);
            }, 1000);

        } catch (err) {
            console.error('Update error:', err);
            setError('Failed to update requirement');
            setActionLoading(false);
        }
    };

    // Handle cancel requirement
    const handleCancelRequirement = async (requirementId) => {
        if (!window.confirm('Are you sure you want to cancel this requirement? This action cannot be undone.')) return;

        setActionLoading(true);
        try {
            // For demo, simulate cancellation
            setTimeout(() => {
                const updatedRequirements = requirements.map(req =>
                    req._id === requirementId 
                        ? { ...req, status: 'cancelled' }
                        : req
                );
                setRequirements(updatedRequirements);
                alert('Requirement cancelled successfully!');
                setActionLoading(false);
            }, 1000);

        } catch (err) {
            console.error('Cancel error:', err);
            setError('Failed to cancel requirement');
            setActionLoading(false);
        }
    };

    // Handle delete requirement
    const handleDeleteRequirement = async (requirementId) => {
        if (deleteConfirmText !== 'DELETE') {
            setError('Please type DELETE in the confirmation box');
            return;
        }

        setActionLoading(true);
        try {
            // For demo, simulate deletion
            setTimeout(() => {
                const updatedRequirements = requirements.filter(req => req._id !== requirementId);
                setRequirements(updatedRequirements);
                setShowDeleteModal(false);
                setDeleteConfirmText('');
                setSelectedRequirement(null);
                alert('Requirement deleted successfully!');
                setActionLoading(false);
            }, 1000);

        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete requirement');
            setActionLoading(false);
        }
    };

    // Form validation
    const validateForm = () => {
        if (!formData.projectType) {
            setError('Project type is required');
            return false;
        }
        if (!formData.projectLocation) {
            setError('Project location is required');
            return false;
        }
        if (!formData.deliveryDate) {
            setError('Delivery date is required');
            return false;
        }
        if (!formData.budgetRange) {
            setError('Budget range is required');
            return false;
        }
        
        const phoneStr = String(formData.phone || '').trim();
        if (phoneStr && !validatePhoneNumber(phoneStr)) {
            setError('Valid 10-digit phone number is required');
            return false;
        }

        for (const material of formData.materials) {
            if (!material.type) {
                setError('All materials must have a type selected');
                return false;
            }
            const quantity = parseFloat(material.quantity);
            if (isNaN(quantity) || quantity <= 0) {
                setError('All materials must have a valid quantity greater than 0');
                return false;
            }
        }

        return true;
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            projectType: '',
            projectLocation: '',
            deliveryDate: '',
            budgetRange: '',
            company: '',
            phone: userInfo?.phone || '',
            materials: [
                { id: 1, type: '', quantity: '', unit: 'units', specification: '' }
            ],
            additionalNotes: '',
            urgencyLevel: 'medium',
            siteVisitRequired: false
        });
        setError('');
    };

    // Open edit modal with requirement data
    const openEditModal = (requirement) => {
        setSelectedRequirement(requirement);
        setFormData({
            projectType: requirement.projectType || '',
            projectLocation: requirement.projectLocation || '',
            deliveryDate: requirement.deliveryDate ? new Date(requirement.deliveryDate).toISOString().split('T')[0] : '',
            budgetRange: requirement.budgetRange || '',
            company: requirement.company || '',
            phone: requirement.phone || userInfo?.phone || '',
            materials: requirement.materials?.map((mat, idx) => ({
                id: idx + 1,
                type: mat.type || '',
                quantity: mat.quantity || '',
                unit: mat.unit || 'units',
                specification: mat.specification || ''
            })) || [{ id: 1, type: '', quantity: '', unit: 'units', specification: '' }],
            additionalNotes: requirement.additionalNotes || '',
            urgencyLevel: requirement.urgencyLevel || 'medium',
            siteVisitRequired: requirement.siteVisitRequired || false
        });
        setShowEditModal(true);
    };

    // Open delete modal
    const openDeleteModal = (requirement) => {
        setSelectedRequirement(requirement);
        setDeleteConfirmText('');
        setShowDeleteModal(true);
    };

    // Material row handlers
    const handleMaterialChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.map(material =>
                material.id === id ? { ...material, [field]: value } : material
            )
        }));
    };

    const addMaterialRow = () => {
        const newId = formData.materials.length + 1;
        setFormData(prev => ({
            ...prev,
            materials: [...prev.materials, { id: newId, type: '', quantity: '', unit: 'units', specification: '' }]
        }));
    };

    const removeMaterialRow = (id) => {
        if (formData.materials.length > 1) {
            setFormData(prev => ({
                ...prev,
                materials: prev.materials.filter(material => material.id !== id)
            }));
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option?.color || 'bg-gray-100 text-gray-800';
    };

    // Get status label
    const getStatusLabel = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option?.label || status;
    };

    // Get urgency color
    const getUrgencyColor = (urgency) => {
        const option = urgencyLevels.find(opt => opt.value === urgency);
        return option?.color || 'bg-gray-100 text-gray-800';
    };

    // Get urgency label
    const getUrgencyLabel = (urgency) => {
        const option = urgencyLevels.find(opt => opt.value === urgency);
        return option?.label || urgency;
    };

    // Format date to match screenshot (DD/MM/YYYY)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Format delivery date (DD/MM/YYYY)
    const formatDeliveryDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Calculate estimated total for display
    const calculateEstimatedTotal = (materials) => {
        const quantity = materials?.reduce((sum, material) => {
            const qty = parseFloat(material.quantity) || 0;
            return sum + qty;
        }, 0) || 0;

        if (quantity === 0) return 'N/A';
        return `${quantity.toLocaleString('en-IN')} ${materials?.[0]?.unit || 'units'}`;
    };

    // Handle submit requirement navigation
    const handleSubmitRequirement = () => {
        navigate('/material-requirement');
    };

    // Loading skeleton for table rows
    const TableRowSkeleton = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-amber-200 rounded w-24"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-28"></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-amber-200 rounded w-16"></div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-3">
                    <div className="h-6 bg-gray-200 rounded w-10"></div>
                    <div className="h-6 bg-gray-200 rounded w-10"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
            </td>
        </tr>
    );

    // Loading skeleton for stats cards
    const StatsCardSkeleton = () => (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
        </div>
    );

    // Loading skeleton for filters
    const FiltersSkeleton = () => (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i}>
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex justify-end space-x-3">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
        </div>
    );

    // Loading skeleton for header
    const HeaderSkeleton = () => (
        <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
    );

    // Loading state
    if (userLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <HeaderSkeleton />
                    <FiltersSkeleton />
                    
                    {/* Stats Summary Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <StatsCardSkeleton key={i} />
                        ))}
                    </div>
                    
                    {/* Table Skeleton */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[...Array(6)].map((_, i) => (
                                            <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="h-4 bg-gray-300 rounded w-24"></div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {[...Array(3)].map((_, i) => (
                                        <TableRowSkeleton key={i} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Submit New Requirement</h1>
                            <p className="mt-1 text-gray-600">Manage and track all your material requirements</p>
                            <p className="mt-1 text-sm text-gray-500 italic">Delivery date is required</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Submit New Requirement
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    {loading ? (
                        <FiltersSkeleton />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                                    <select
                                        value={filters.projectType}
                                        onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    >
                                        <option value="">All Types</option>
                                        {projectTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        placeholder="Search requirements..."
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    >
                                        <option value="-createdAt">Newest First</option>
                                        <option value="createdAt">Oldest First</option>
                                        <option value="urgencyLevel">Urgency</option>
                                        <option value="projectType">Project Type</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end space-x-3">
                                <button
                                    onClick={fetchRequirements}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    onClick={() => setFilters({
                                        status: '',
                                        projectType: '',
                                        search: '',
                                        sortBy: '-createdAt'
                                    })}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Horizontal Line */}
                <div className="mb-6">
                    <hr className="border-t border-gray-300" />
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <StatsCardSkeleton key={i} />
                        ))
                    ) : (
                        <>
                            <div className="bg-white rounded-lg shadow p-4">
                                <h3 className="text-lg font-semibold text-gray-900">Total Requirements</h3>
                                <p className="text-3xl font-bold text-amber-600 mt-2">{requirements.length}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-4">
                                <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">
                                    {requirements.filter(r => r.status === 'pending').length}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-4">
                                <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    {requirements.filter(r => r.status === 'in-progress').length}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-4">
                                <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {requirements.filter(r => r.status === 'completed').length}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Requirements List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    {loading ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[...Array(6)].map((_, i) => (
                                            <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="h-4 bg-gray-300 rounded w-24"></div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {[...Array(3)].map((_, i) => (
                                        <TableRowSkeleton key={i} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : requirements.length === 0 ? (
                        <div className="p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No requirements found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new requirement.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
                                >
                                    Create New Requirement
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            REQUIREMENT ID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            PROJECT DETAILS
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            MATERIALS
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            STATUS
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            CREATED
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requirements.map((requirement) => (
                                        <tr key={requirement._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {requirement.requirementNumber}
                                                </div>
                                                <div className="text-sm font-medium text-amber-600">
                                                    {requirement.budgetRange}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {requirement.projectType}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {requirement.projectLocation}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium">
                                                    Delivery: {formatDeliveryDate(requirement.deliveryDate)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {requirement.materials?.length || 0} Items
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {calculateEstimatedTotal(requirement.materials)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col space-y-1">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(requirement.status)}`}>
                                                        {getStatusLabel(requirement.status)}
                                                    </span>
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyColor(requirement.urgencyLevel)}`}>
                                                        {getUrgencyLabel(requirement.urgencyLevel).toUpperCase()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(requirement.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequirement(requirement);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        View
                                                    </button>
                                                    {requirement.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => openEditModal(requirement)}
                                                                className="text-green-600 hover:text-green-800 font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelRequirement(requirement._id)}
                                                                className="text-amber-600 hover:text-amber-800 font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => openDeleteModal(requirement)}
                                                        className="text-red-600 hover:text-red-800 font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Requirement Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Create New Requirement</h3>
                            <p className="text-sm text-gray-500 mt-1">Fill in all required fields</p>
                        </div>
                        <div className="px-6 py-4">
                            <form onSubmit={handleCreateSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Type *
                                        </label>
                                        <select
                                            value={formData.projectType}
                                            onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                                            required
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        >
                                            <option value="">Select project type</option>
                                            {projectTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Location *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.projectLocation}
                                            onChange={(e) => setFormData({...formData, projectLocation: e.target.value})}
                                            required
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            placeholder="Enter site address"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Delivery Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.deliveryDate}
                                            onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Budget Range *
                                        </label>
                                        <select
                                            value={formData.budgetRange}
                                            onChange={(e) => setFormData({...formData, budgetRange: e.target.value})}
                                            required
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        >
                                            <option value="">Select budget range</option>
                                            {budgetRanges.map(range => (
                                                <option key={range} value={range}>{range}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Urgency Level *
                                        </label>
                                        <select
                                            value={formData.urgencyLevel}
                                            onChange={(e) => setFormData({...formData, urgencyLevel: e.target.value})}
                                            required
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        >
                                            {urgencyLevels.map(level => (
                                                <option key={level.value} value={level.value}>{level.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                                
                                {/* Materials Table */}
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-medium text-gray-900">Materials Required *</h4>
                                        <button
                                            type="button"
                                            onClick={addMaterialRow}
                                            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                                        >
                                            + Add Material
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border border-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Specifications</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.materials.map((material) => (
                                                    <tr key={material.id} className="border-t border-gray-200">
                                                        <td className="px-3 py-2">
                                                            <select
                                                                value={material.type}
                                                                onChange={(e) => handleMaterialChange(material.id, 'type', e.target.value)}
                                                                required
                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                            >
                                                                <option value="">Select Material</option>
                                                                {materialCategories.map(cat => (
                                                                    <option key={cat} value={cat}>{cat}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="number"
                                                                value={material.quantity}
                                                                onChange={(e) => handleMaterialChange(material.id, 'quantity', e.target.value)}
                                                                required
                                                                min="1"
                                                                step="1"
                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                                placeholder="0"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <select
                                                                value={material.unit}
                                                                onChange={(e) => handleMaterialChange(material.id, 'unit', e.target.value)}
                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                            >
                                                                {unitOptions.map(unit => (
                                                                    <option key={unit} value={unit}>{unit}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="text"
                                                                value={material.specification}
                                                                onChange={(e) => handleMaterialChange(material.id, 'specification', e.target.value)}
                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                                placeholder="Optional specifications"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {formData.materials.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeMaterialRow(material.id)}
                                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        value={formData.additionalNotes}
                                        onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                                        rows="3"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        placeholder="Any additional information or specifications..."
                                    />
                                </div>
                                
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-medium disabled:opacity-50"
                                    >
                                        {actionLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating...
                                            </>
                                        ) : 'Create Requirement'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedRequirement && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-red-600">Delete Requirement</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                ID: {selectedRequirement?.requirementNumber}
                            </p>
                        </div>
                        <div className="px-6 py-4">
                            <div className="mb-4">
                                <p className="text-sm text-gray-700 mb-2">
                                    Are you sure you want to delete this requirement? This action cannot be undone.
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedRequirement.projectType} - {selectedRequirement.projectLocation}
                                </p>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type <span className="font-bold">DELETE</span> to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="Type DELETE here"
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmText('');
                                        setSelectedRequirement(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteRequirement(selectedRequirement._id)}
                                    disabled={actionLoading || deleteConfirmText !== 'DELETE'}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : 'Delete Requirement'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Requirement Details Modal */}
            {showDetailsModal && selectedRequirement && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Requirement Details</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    ID: {selectedRequirement.requirementNumber}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="px-6 py-4">
                            <div className="space-y-6">
                                {/* Project Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Project Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Project Type</p>
                                            <p className="text-sm font-medium">{selectedRequirement.projectType}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Location</p>
                                            <p className="text-sm font-medium">{selectedRequirement.projectLocation}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Delivery Date</p>
                                            <p className="text-sm font-medium">{formatDeliveryDate(selectedRequirement.deliveryDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Budget Range</p>
                                            <p className="text-sm font-medium">{selectedRequirement.budgetRange}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Materials List */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Materials Required</h4>
                                    <div className="space-y-2">
                                        {selectedRequirement.materials?.map((material, index) => (
                                            <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                                                <div>
                                                    <p className="text-sm font-medium">{material.type}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {material.specification && `${material.specification} • `}
                                                        Quantity: {material.quantity} {material.unit}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {material.quantity} {material.unit}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 text-sm text-gray-500">
                                        Total: {calculateEstimatedTotal(selectedRequirement.materials)}
                                    </div>
                                </div>
                                
                                {/* Status Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Status Information</h4>
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequirement.status)}`}>
                                                Status: {getStatusLabel(selectedRequirement.status)}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(selectedRequirement.urgencyLevel)}`}>
                                                Urgency: {getUrgencyLabel(selectedRequirement.urgencyLevel)}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            Created: {formatDate(selectedRequirement.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Additional Notes */}
                                {selectedRequirement.additionalNotes && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h4>
                                        <p className="text-sm text-gray-700">{selectedRequirement.additionalNotes}</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => openDeleteModal(selectedRequirement)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                                >
                                    Delete Requirement
                                </button>
                                {selectedRequirement.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowDetailsModal(false);
                                                openEditModal(selectedRequirement);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to cancel this requirement?')) {
                                                    handleCancelRequirement(selectedRequirement._id);
                                                    setShowDetailsModal(false);
                                                }
                                            }}
                                            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-medium"
                                        >
                                            Cancel Requirement
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialRequirementsDashboard;