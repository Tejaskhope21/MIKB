import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FileText, DollarSign, Clock, CheckCircle, XCircle,
    AlertCircle, Search, Filter, Download, Send, Eye,
    Edit, Archive, TrendingUp, Calendar, User, Phone,
    MapPin, Plus
} from 'lucide-react';

const QuotesPage = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedQuote, setSelectedQuote] = useState(null);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            // Mock data - replace with API call
            const mockQuotes = [
                {
                    _id: '1',
                    quoteNumber: 'QT-2024-001',
                    clientName: 'Mr. Rajesh Sharma',
                    clientEmail: 'rajesh@example.com',
                    clientPhone: '+91 9876543210',
                    projectType: 'Residential Villa',
                    location: 'Mumbai, Maharashtra',
                    status: 'pending',
                    amount: 4500000,
                    validity: '2024-12-31',
                    createdAt: '2024-11-15',
                    items: [
                        { name: 'Foundation Work', quantity: 1, unit: 'site', rate: 500000, amount: 500000 },
                        { name: 'Structure & RCC', quantity: 1, unit: 'site', rate: 1500000, amount: 1500000 },
                        { name: 'Interior Finishing', quantity: 1, unit: 'site', rate: 1200000, amount: 1200000 },
                        { name: 'Landscaping', quantity: 1, unit: 'site', rate: 800000, amount: 800000 },
                        { name: 'Electrical & Plumbing', quantity: 1, unit: 'site', rate: 500000, amount: 500000 }
                    ],
                    notes: 'Includes GST and all materials. Payment terms: 30% advance, 40% during construction, 30% on completion.'
                },
                {
                    _id: '2',
                    quoteNumber: 'QT-2024-002',
                    clientName: 'ABC Corporation',
                    clientEmail: 'projects@abccorp.com',
                    clientPhone: '+91 9876543211',
                    projectType: 'Commercial Office',
                    location: 'Bangalore, Karnataka',
                    status: 'approved',
                    amount: 12000000,
                    validity: '2025-01-31',
                    createdAt: '2024-11-10',
                    items: [
                        { name: 'Building Structure', quantity: 1, unit: 'site', rate: 5000000, amount: 5000000 },
                        { name: 'Interior Work', quantity: 1, unit: 'site', rate: 4000000, amount: 4000000 },
                        { name: 'Electrical System', quantity: 1, unit: 'site', rate: 1500000, amount: 1500000 },
                        { name: 'HVAC System', quantity: 1, unit: 'site', rate: 1500000, amount: 1500000 }
                    ]
                },
                {
                    _id: '3',
                    quoteNumber: 'QT-2024-003',
                    clientName: 'Mrs. Priya Patel',
                    clientEmail: 'priya@example.com',
                    clientPhone: '+91 9876543212',
                    projectType: 'Apartment Renovation',
                    location: 'Pune, Maharashtra',
                    status: 'rejected',
                    amount: 1200000,
                    validity: '2024-12-15',
                    createdAt: '2024-11-05'
                },
                {
                    _id: '4',
                    quoteNumber: 'QT-2024-004',
                    clientName: 'XYZ Industries',
                    clientEmail: 'purchase@xyzind.com',
                    clientPhone: '+91 9876543213',
                    projectType: 'Industrial Shed',
                    location: 'Chennai, Tamil Nadu',
                    status: 'pending',
                    amount: 8500000,
                    validity: '2025-02-28',
                    createdAt: '2024-11-01'
                },
                {
                    _id: '5',
                    quoteNumber: 'QT-2024-005',
                    clientName: 'Government School',
                    clientEmail: 'admin@school.edu',
                    clientPhone: '+91 9876543214',
                    projectType: 'School Building',
                    location: 'Hyderabad, Telangana',
                    status: 'approved',
                    amount: 3500000,
                    validity: '2025-03-31',
                    createdAt: '2024-10-25'
                }
            ];
            setQuotes(mockQuotes);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'expired': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            case 'expired': return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch = quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.projectType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: quotes.length,
        pending: quotes.filter(q => q.status === 'pending').length,
        approved: quotes.filter(q => q.status === 'approved').length,
        rejected: quotes.filter(q => q.status === 'rejected').length,
        totalAmount: quotes.reduce((sum, q) => sum + q.amount, 0),
        approvedAmount: quotes.filter(q => q.status === 'approved').reduce((sum, q) => sum + q.amount, 0)
    };

    const handleSendQuote = (quoteId) => {
        // Implement send quote functionality
        console.log('Sending quote:', quoteId);
    };

    const handleDownloadQuote = (quoteId) => {
        // Implement download quote functionality
        console.log('Downloading quote:', quoteId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Quotes</h1>
                    <p className="text-gray-600">Manage and track your project quotations</p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Quote
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Total Quotes</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
                        </div>
                        <FileText className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">All time</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Pending Approval</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pending}</p>
                        </div>
                        <Clock className="w-10 h-10 text-yellow-600" />
                    </div>
                    <p className="text-sm text-gray-600">Awaiting response</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Approved Value</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">₹{(stats.approvedAmount / 100000).toFixed(1)}L</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +₹25L this month
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Conversion Rate</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">
                                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                            </p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600">Quote to project</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by quote number, client, or project..."
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
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="expired">Expired</option>
                        </select>
                        <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            More Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Quotes Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote Details</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredQuotes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No quotes found. Try different search terms.
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotes.map((quote) => (
                                    <tr key={quote._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{quote.quoteNumber}</div>
                                                <div className="text-sm text-gray-500">{quote.projectType}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Created: {new Date(quote.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium">{quote.clientName}</div>
                                                <div className="text-sm text-gray-500">{quote.clientEmail}</div>
                                                <div className="text-sm text-gray-500">{quote.clientPhone}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(quote.status)}`}>
                                                    {getStatusIcon(quote.status)}
                                                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-lg">₹{(quote.amount / 100000).toFixed(1)}L</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>{new Date(quote.validity).toLocaleDateString()}</span>
                                                </div>
                                                <div className={`text-xs ${new Date(quote.validity) < new Date() ? 'text-red-600' : 'text-gray-500'}`}>
                                                    {Math.ceil((new Date(quote.validity) - new Date()) / (1000 * 60 * 60 * 24))} days left
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    onClick={() => setSelectedQuote(quote)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    onClick={() => handleSendQuote(quote._id)}
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                                    onClick={() => handleDownloadQuote(quote._id)}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                                    <Edit className="w-4 h-4" />
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

            {/* Quote Detail Modal */}
            {selectedQuote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">Quote {selectedQuote.quoteNumber}</h2>
                                <p className="text-gray-600">{selectedQuote.projectType}</p>
                            </div>
                            <button
                                onClick={() => setSelectedQuote(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-3">Client Details</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span>{selectedQuote.clientName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span>{selectedQuote.clientEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span>{selectedQuote.clientPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>{selectedQuote.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-3">Quote Details</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedQuote.status)}`}>
                                            {selectedQuote.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Amount:</span>
                                        <span className="font-bold">₹{(selectedQuote.amount / 100000).toFixed(1)}L</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Validity Until:</span>
                                        <span>{new Date(selectedQuote.validity).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Created:</span>
                                        <span>{new Date(selectedQuote.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedQuote.items && (
                            <div className="mb-8">
                                <h3 className="font-semibold mb-4">Quote Items</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 text-left">Item</th>
                                                <th className="px-4 py-2 text-left">Quantity</th>
                                                <th className="px-4 py-2 text-left">Unit</th>
                                                <th className="px-4 py-2 text-left">Rate</th>
                                                <th className="px-4 py-2 text-left">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedQuote.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">{item.name}</td>
                                                    <td className="px-4 py-2">{item.quantity}</td>
                                                    <td className="px-4 py-2">{item.unit}</td>
                                                    <td className="px-4 py-2">₹{item.rate.toLocaleString()}</td>
                                                    <td className="px-4 py-2">₹{item.amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="font-bold">
                                                <td colSpan="4" className="px-4 py-2 text-right">Total:</td>
                                                <td className="px-4 py-2">₹{selectedQuote.amount.toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4">
                            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Download PDF
                            </button>
                            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Send to Client
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuotesPage;