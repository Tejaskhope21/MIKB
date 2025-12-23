// SubcategoryProductsPage.jsx - CLEAN VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../../components/Products/ProductCard';
import {
    ArrowLeft,
    Home,
    Package,
    Grid,
    List,
    Search,
    ChevronRight,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    Zap
} from 'lucide-react';

const API_BASE_URL = 'https://bricks-backend-qyea.onrender.com';

const SubcategoryProductsPage = () => {
    const { categoryId, subcategoryId } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [subcategory, setSubcategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        materialType: 'all',
        brand: 'all',
        modernOnly: false
    });
    const [availableBrands, setAvailableBrands] = useState([]);

    useEffect(() => {
        fetchSubcategoryProducts();
    }, [categoryId, subcategoryId, searchTerm, sortBy, sortOrder, filters]);

    const fetchSubcategoryProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            let result;
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/products/category/${categoryId}/subcategory/${subcategoryId}/products`
                );

                if (response.ok) {
                    result = await response.json();
                } else {
                    await fetchCategoryProductsWithFilter();
                    return;
                }
            } catch {
                await fetchCategoryProductsWithFilter();
                return;
            }

            if (!result.success) {
                throw new Error(result.message || 'Failed to load products');
            }

            setCategory(result.category);
            setSubcategory(result.subcategory);
            setProducts(result.products.items || []);

            const brands = [...new Set(result.products.items.map(p => p.brand).filter(Boolean))];
            setAvailableBrands(brands);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryProductsWithFilter = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/products/category/${categoryId}?limit=100`
            );

            if (!response.ok) throw new Error('Failed to fetch category products');

            const result = await response.json();

            if (!result.success) throw new Error(result.message || 'Failed to load products');

            const filteredProducts = result.products.filter(product =>
                product.subcategoryId?.toString() === subcategoryId
            );

            let finalProducts = [...filteredProducts];

            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                finalProducts = finalProducts.filter(product =>
                    product.name?.toLowerCase().includes(term) ||
                    product.description?.toLowerCase().includes(term) ||
                    product.brand?.toLowerCase().includes(term)
                );
            }

            if (filters.minPrice) {
                finalProducts = finalProducts.filter(product =>
                    product.price >= parseFloat(filters.minPrice)
                );
            }
            if (filters.maxPrice) {
                finalProducts = finalProducts.filter(product =>
                    product.price <= parseFloat(filters.maxPrice)
                );
            }

            if (filters.materialType !== 'all') {
                finalProducts = finalProducts.filter(product =>
                    product.materialType === filters.materialType
                );
            }

            if (filters.brand !== 'all') {
                finalProducts = finalProducts.filter(product =>
                    product.brand === filters.brand
                );
            }

            if (filters.modernOnly) {
                finalProducts = finalProducts.filter(product =>
                    product.tags?.includes('modern') ||
                    product.name?.toLowerCase().includes('modern') ||
                    product.description?.toLowerCase().includes('modern') ||
                    product.category?.toLowerCase().includes('modern')
                );
            }

            finalProducts.sort((a, b) => {
                let aValue, bValue;

                switch (sortBy) {
                    case 'price':
                        aValue = a.price || 0;
                        bValue = b.price || 0;
                        break;
                    case 'name':
                        aValue = a.name?.toLowerCase() || '';
                        bValue = b.name?.toLowerCase() || '';
                        break;
                    case 'discount':
                        aValue = a.discount || 0;
                        bValue = b.discount || 0;
                        break;
                    case 'createdAt':
                    default:
                        aValue = new Date(a.createdAt || 0).getTime();
                        bValue = new Date(b.createdAt || 0).getTime();
                        break;
                }

                return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
            });

            setProducts(finalProducts);

            const brands = [...new Set(filteredProducts.map(p => p.brand).filter(Boolean))];
            setAvailableBrands(brands);

            await fetchCategoryInfo();

        } catch (err) {
            setError('Failed to load products. ' + err.message);
        }
    };

    const fetchCategoryInfo = async () => {
        try {
            const categoryResponse = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`);
            if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                if (categoryData.success) {
                    setCategory(categoryData.category);

                    if (categoryData.category?.subcategories) {
                        const subcat = categoryData.category.subcategories.find(s =>
                            s._id?.toString() === subcategoryId ||
                            s.id?.toString() === subcategoryId
                        );
                        if (subcat) {
                            setSubcategory({
                                title: subcat.title || subcat.name,
                                numericId: subcat.numericId,
                                items: subcat.items || []
                            });
                        }
                    }
                }
            }
        } catch (err) {
            // Continue without category info
        }
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilters({
            minPrice: '',
            maxPrice: '',
            materialType: 'all',
            brand: 'all',
            modernOnly: false
        });
        setSortBy('createdAt');
        setSortOrder('desc');
    };

    const handleApplyFilters = () => {
        setShowFilters(false);
    };

    const handleBackToCategory = () => {
        navigate(`/category/${categoryId}`);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const getProductStats = () => {
        const stats = {
            total: products.length,
            withDiscount: products.filter(p => p.discount > 0 || (p.originalPrice && p.originalPrice > p.price)).length,
            averagePrice: 0,
            minPrice: Infinity,
            maxPrice: 0,
            uniqueBrands: availableBrands.length
        };

        if (products.length > 0) {
            const prices = products.map(p => p.price).filter(p => p > 0);
            if (prices.length > 0) {
                stats.averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
                stats.minPrice = Math.min(...prices);
                stats.maxPrice = Math.max(...prices);
            }
        }

        return stats;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="h-8 bg-gray-300 rounded w-64 animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-lg border animate-pulse">
                                <div className="h-48 bg-gray-300"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={fetchSubcategoryProducts}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={handleBackToCategory}
                            className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Back to Category
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const productStats = getProductStats();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 flex-wrap">
                        <button
                            onClick={handleGoHome}
                            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Home
                        </button>
                        <ChevronRight className="w-4 h-4" />
                        {category && (
                            <button
                                onClick={handleBackToCategory}
                                className="hover:text-blue-600 transition-colors"
                            >
                                {category.name}
                            </button>
                        )}
                        <ChevronRight className="w-4 h-4" />
                        <div className="flex items-center gap-2">
                            <span className="text-blue-600 font-medium">
                                {subcategory?.title || 'Subcategory Products'}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {productStats.total} products
                            </span>
                        </div>
                    </div>

                    {/* Main Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {subcategory?.title || 'Subcategory Products'}
                                {category && <span className="text-gray-600"> in {category.name}</span>}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Package className="w-4 h-4" />
                                    {productStats.total} products found
                                </span>
                                {productStats.withDiscount > 0 && (
                                    <span className="flex items-center gap-1 text-green-600">
                                        <TrendingUp className="w-4 h-4" />
                                        {productStats.withDiscount} with discounts
                                    </span>
                                )}
                                {productStats.uniqueBrands > 0 && (
                                    <span className="text-sm text-gray-500">
                                        {productStats.uniqueBrands} brands
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBackToCategory}
                                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Category
                            </button>
                        </div>
                    </div>

                    {/* Subcategory Description */}
                    {subcategory?.items && subcategory.items.length > 0 && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
                            <p className="text-sm text-gray-700 mb-2 font-medium">
                                This subcategory includes:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {subcategory.items.map((item, index) => (
                                    <span
                                        key={index}
                                        className="text-xs bg-white text-gray-700 px-3 py-1.5 rounded-full border border-gray-200"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Filters */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Product Stats */}
                        <div className="bg-white rounded-lg border p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-gray-500" />
                                <h3 className="font-semibold text-gray-800">Product Stats</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Products Found</span>
                                    <span className="font-bold text-lg text-blue-600">
                                        {productStats.total}
                                    </span>
                                </div>
                                {productStats.withDiscount > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">With Discount</span>
                                        <span className="font-medium text-green-600">
                                            {productStats.withDiscount}
                                        </span>
                                    </div>
                                )}
                                {productStats.minPrice < Infinity && productStats.maxPrice > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Price Range</span>
                                        <span className="font-medium">
                                            ₹{productStats.minPrice} - ₹{productStats.maxPrice}
                                        </span>
                                    </div>
                                )}
                                {productStats.uniqueBrands > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Brands</span>
                                        <span className="font-medium">
                                            {productStats.uniqueBrands}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Search Filter */}
                        <div className="bg-white rounded-lg border p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-4">Search</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div className="bg-white rounded-lg border p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-4">Sort By</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Newest First', value: 'createdAt', order: 'desc' },
                                    { label: 'Oldest First', value: 'createdAt', order: 'asc' },
                                    { label: 'Price: Low to High', value: 'price', order: 'asc' },
                                    { label: 'Price: High to Low', value: 'price', order: 'desc' },
                                    { label: 'Name: A to Z', value: 'name', order: 'asc' },
                                    { label: 'Name: Z to A', value: 'name', order: 'desc' },
                                    { label: 'Discount: High to Low', value: 'discount', order: 'desc' }
                                ].map((option) => (
                                    <button
                                        key={`${option.value}-${option.order}`}
                                        onClick={() => {
                                            setSortBy(option.value);
                                            setSortOrder(option.order);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${sortBy === option.value && sortOrder === option.order
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        <div className="bg-white rounded-lg border p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800">Filters</h3>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-1 text-sm text-blue-600"
                                >
                                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    {showFilters ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            {showFilters && (
                                <div className="space-y-4">
                                    {/* Modern Filter */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="modernOnly"
                                                checked={filters.modernOnly}
                                                onChange={(e) => setFilters({ ...filters, modernOnly: e.target.checked })}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="modernOnly" className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                                                <Zap className="w-4 h-4 text-yellow-500" />
                                                Modern Designs Only
                                            </label>
                                        </div>
                                        {filters.modernOnly && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price Range
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.minPrice}
                                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.maxPrice}
                                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Material Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Material Type
                                        </label>
                                        <select
                                            value={filters.materialType}
                                            onChange={(e) => setFilters({ ...filters, materialType: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="all">All Materials</option>
                                            <option value="cement">Cement</option>
                                            <option value="steel">Steel</option>
                                            <option value="bricks">Bricks</option>
                                            <option value="sand">Sand</option>
                                            <option value="tiles">Tiles</option>
                                            <option value="paint">Paint</option>
                                            <option value="wood">Wood</option>
                                        </select>
                                    </div>

                                    {/* Brand Filter */}
                                    {availableBrands.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Brand
                                            </label>
                                            <select
                                                value={filters.brand}
                                                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            >
                                                <option value="all">All Brands</option>
                                                {availableBrands.map(brand => (
                                                    <option key={brand} value={brand}>{brand}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Filter Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleClearFilters}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Clear All
                                        </button>
                                        <button
                                            onClick={handleApplyFilters}
                                            className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Results Header */}
                        <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    {/* <h2 className="text-lg font-semibold text-gray-800">
                                        Products in "{subcategory?.title || 'Subcategory'}"
                                    </h2> */}
                                    <p className="text-sm text-gray-600 mt-1">
                                        Showing {products.length} products
                                        {searchTerm && ` for "${searchTerm}"`}
                                        {filters.modernOnly && ' • Modern designs only'}
                                        {filters.minPrice && ` • Price from ₹${filters.minPrice}`}
                                        {filters.maxPrice && ` to ₹${filters.maxPrice}`}
                                        {filters.materialType !== 'all' && ` • Material: ${filters.materialType}`}
                                        {filters.brand !== 'all' && ` • Brand: ${filters.brand}`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`px-3 py-2 transition-colors ${viewMode === 'grid'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Grid className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`px-3 py-2 transition-colors ${viewMode === 'list'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Display */}
                        {products.length > 0 ? (
                            viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map(product => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                            onMouseEnter={() => { }}
                                            onMouseLeave={() => { }}
                                            onClick={() => { }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {products.map(product => (
                                        <div key={product._id} className="bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                            <Link to={`/product/${product.numericId || product._id}`}>
                                                <div className="flex flex-col md:flex-row p-4 md:p-6">
                                                    <div className="md:w-1/4 mb-4 md:mb-0">
                                                        <img
                                                            src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                                                            alt={product.name}
                                                            className="w-full h-48 md:h-40 object-cover rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="md:w-3/4 md:pl-6">
                                                        <div className="flex flex-col md:flex-row md:items-start justify-between">
                                                            <div>
                                                                <h3 className="font-bold text-lg text-gray-900 mb-1">
                                                                    {product.name}
                                                                </h3>
                                                                <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
                                                                <p className="text-gray-500 text-sm line-clamp-2">
                                                                    {product.description}
                                                                </p>
                                                            </div>
                                                            <div className="mt-2 md:mt-0 text-right">
                                                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                                                    ₹{product.price}
                                                                </div>
                                                                {product.originalPrice > product.price && (
                                                                    <div className="text-sm text-gray-500 line-through">
                                                                        ₹{product.originalPrice}
                                                                    </div>
                                                                )}
                                                                {product.discount > 0 && (
                                                                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium mt-1">
                                                                        {product.discount}% OFF
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                                                            <span>Unit: {product.unitType || 'piece'}</span>
                                                            {product.inventory?.stock > 0 && (
                                                                <span className="text-green-600">
                                                                    In Stock: {product.inventory.stock}
                                                                </span>
                                                            )}
                                                            {product.grade && (
                                                                <span className="bg-gray-100 px-2 py-1 rounded">
                                                                    {product.grade}
                                                                </span>
                                                            )}
                                                            {product.materialType && (
                                                                <span className="text-blue-600">
                                                                    {product.materialType}
                                                                </span>
                                                            )}
                                                            {(product.tags?.includes('modern') ||
                                                                product.name?.toLowerCase().includes('modern')) && (
                                                                    <span className="flex items-center gap-1 text-yellow-600">
                                                                        <Zap className="w-3 h-3" />
                                                                        Modern
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <div className="text-6xl mb-6">📦</div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                                    No Products Found
                                </h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    {searchTerm || Object.values(filters).some(v =>
                                        (typeof v === 'string' ? v !== '' && v !== 'all' : v !== false)
                                    )
                                        ? 'No products match your filters. Try changing your search criteria.'
                                        : 'There are no products available in this subcategory yet.'
                                    }
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                    <button
                                        onClick={handleBackToCategory}
                                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Back to Category
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubcategoryProductsPage;