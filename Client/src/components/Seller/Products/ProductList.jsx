import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Edit, Trash2, Eye, Download, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

// Define API URL - use environment variable or fallback
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://bricks-backend-qyea.onrender.com/api';

// Or if you're using Vite, use this:
// const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-backend-qyea.onrender.com/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        category: '',
        sort: 'newest',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 1,
        currentPage: 1
    });
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Build query params
            const queryParams = new URLSearchParams();
            queryParams.append('page', filters.page.toString());
            queryParams.append('limit', filters.limit.toString());

            if (filters.search) queryParams.append('search', filters.search);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.sort) queryParams.append('sort', filters.sort);

            const response = await axios.get(`${API_URL}/seller/products?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setProducts(response.data.products);
                setPagination(response.data.pagination || {
                    total: response.data.total || 0,
                    pages: Math.ceil((response.data.total || 0) / filters.limit),
                    currentPage: filters.page
                });
            } else {
                throw new Error(response.data.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);

            // Handle authentication errors
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                alert('Session expired. Please login again.');
                return;
            }

            alert(error.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setCategories(response.data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                alert('Product deleted successfully');
                fetchProducts();
            } else {
                throw new Error(response.data.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert(error.response?.data?.message || 'Failed to delete product');
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedProducts.length === 0) {
            alert('Please select products first');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            if (action === 'delete') {
                if (!window.confirm(`Delete ${selectedProducts.length} selected products?`)) return;

                // Delete products one by one
                const deletePromises = selectedProducts.map(productId =>
                    axios.delete(`${API_URL}/products/${productId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                );

                await Promise.all(deletePromises);

                alert(`${selectedProducts.length} products deleted successfully`);
                setSelectedProducts([]);
                fetchProducts();

            } else if (action === 'publish' || action === 'draft') {
                const status = action === 'publish' ? 'published' : 'draft';

                const response = await axios.put(`${API_URL}/products/bulk/update`, {
                    productIds: selectedProducts,
                    updates: { status }
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.success) {
                    alert(`${selectedProducts.length} products updated to ${status}`);
                    setSelectedProducts([]);
                    fetchProducts();
                } else {
                    throw new Error(response.data.message || 'Failed to update products');
                }
            }
        } catch (error) {
            console.error('Error performing bulk action:', error);
            alert(error.response?.data?.message || 'Failed to perform bulk action');
        }
    };

    const exportProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/seller/products/export`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            // Handle different export formats
            if (response.data.downloadUrl) {
                // If backend provides a download URL
                window.open(`${API_URL}${response.data.downloadUrl}`, '_blank');
            } else {
                // Create downloadable file
                const dataStr = JSON.stringify(response.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.json`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting products:', error);
            alert('Failed to export products');
        }
    };

    const handleEditProduct = (productId) => {
        navigate(`/seller/products/edit/${productId}`);
    };

    const handleViewProduct = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleAddProduct = () => {
        navigate('/seller/products/add');
    };

    const calculateDiscount = (originalPrice, price) => {
        if (!originalPrice || originalPrice <= price) return 0;
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    const getStockStatus = (stock, lowThreshold) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
        if (stock <= lowThreshold) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
        return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'out_of_stock': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setFilters({ ...filters, page: newPage });
        }
    };

    const renderPagination = () => {
        const pages = [];
        const totalPages = pagination.pages;
        const currentPage = filters.page;

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    <p className="text-gray-600">Manage your products inventory</p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                    <button
                        onClick={exportProducts}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                        disabled={loading}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={handleAddProduct}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name || cat.title}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        More Filters
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                            value={filters.sort}
                            onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center">
                            <span className="text-blue-700 font-medium">
                                {selectedProducts.length} product(s) selected
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleBulkAction('publish')}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Publish Selected
                            </button>
                            <button
                                onClick={() => handleBulkAction('draft')}
                                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Move to Draft
                            </button>
                            <button
                                onClick={() => handleBulkAction('delete')}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete Selected
                            </button>
                            <button
                                onClick={() => setSelectedProducts([])}
                                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length > 0 && selectedProducts.length === products.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedProducts(products.map(p => p._id));
                                            } else {
                                                setSelectedProducts([]);
                                            }
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                                            <p className="text-gray-500">Loading products...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search className="w-12 h-12 text-gray-400 mb-3" />
                                            <p className="text-gray-500 text-lg mb-2">No products found</p>
                                            <p className="text-gray-400 text-sm mb-4">
                                                {filters.search || filters.status || filters.category
                                                    ? 'Try adjusting your filters'
                                                    : 'Get started by adding your first product'}
                                            </p>
                                            {!filters.search && !filters.status && !filters.category && (
                                                <button
                                                    onClick={handleAddProduct}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Your First Product
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const stockStatus = getStockStatus(product.inventory?.stock, product.inventory?.lowStockThreshold);
                                    const discount = calculateDiscount(product.originalPrice, product.price);

                                    return (
                                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedProducts([...selectedProducts, product._id]);
                                                        } else {
                                                            setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-12 w-12 flex-shrink-0">
                                                        <img
                                                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                                            src={product.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random`}
                                                            alt={product.name}
                                                            onError={(e) => {
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random`;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {product.numericId}
                                                        </div>
                                                        {product.brand && (
                                                            <div className="text-xs text-gray-400">
                                                                Brand: {product.brand}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                    {product.categoryId?.name || product.categoryId?.title || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    ₹{product.price?.toLocaleString('en-IN')}
                                                </div>
                                                {discount > 0 && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm text-gray-500 line-through">
                                                            ₹{product.originalPrice?.toLocaleString('en-IN')}
                                                        </span>
                                                        <span className="text-xs font-medium bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                                            {discount}% OFF
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                                        {stockStatus.text}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {product.inventory?.stock || 0} units
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(product.status)}`}>
                                                    {product.status?.replace('_', ' ') || 'draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewProduct(product.numericId || product._id)}
                                                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditProduct(product._id)}
                                                        className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {products.length > 0 && pagination.pages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-700">
                                Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                                {Math.min(filters.page * filters.limit, pagination.total)} of{' '}
                                {pagination.total} products
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(filters.page - 1)}
                                    disabled={filters.page === 1}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {renderPagination().map((pageNum, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : null}
                                        disabled={pageNum === '...'}
                                        className={`min-w-[40px] px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${pageNum === '...'
                                            ? 'border-transparent cursor-default'
                                            : filters.page === pageNum
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(filters.page + 1)}
                                    disabled={filters.page === pagination.pages}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">Show:</span>
                                <select
                                    value={filters.limit}
                                    onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value), page: 1 })}
                                    className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            {products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-sm text-gray-500">Total Products</div>
                        <div className="text-2xl font-bold text-gray-800">{pagination.total}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-sm text-gray-500">Published</div>
                        <div className="text-2xl font-bold text-green-600">
                            {products.filter(p => p.status === 'published').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-sm text-gray-500">Out of Stock</div>
                        <div className="text-2xl font-bold text-red-600">
                            {products.filter(p => p.status === 'out_of_stock').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-sm text-gray-500">Total Stock Value</div>
                        <div className="text-2xl font-bold text-blue-600">
                            ₹{products.reduce((sum, p) => sum + (p.price * (p.inventory?.stock || 0)), 0).toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;