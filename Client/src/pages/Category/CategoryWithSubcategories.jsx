// CategoryWithSubcategories.jsx - UPDATED with dynamic brand fetching
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'; // Added Link import
import ProductCard from '../../components/Products/ProductCard';
import {
    ArrowLeft,
    Home,
    Grid,
    List,
    Search,
    Package,
    TrendingUp,
    ChevronRight,
    Zap,
    Filter,
    X,
    Tag,
    IndianRupee,
    ChevronDown,
    ChevronUp,
    RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'https://bricks-backend-qyea.onrender.com';

const CategoryWithSubcategories = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [category, setCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get subcategory from navigation state (when coming from CategoryHeader)
    const { subcategoryId: initialSubcategoryId, subcategoryName: initialSubcategoryName } = location.state || {};

    const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategoryId || 'all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [modernOnly, setModernOnly] = useState(false);
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
    });

    // Store the initial subcategory name from navigation
    const [initialSubcategory] = useState(initialSubcategoryName);

    useEffect(() => {
        fetchCategoryWithSubcategories();
    }, [categoryId]);

    useEffect(() => {
        if (category) {
            fetchProducts();
        }
    }, [selectedSubcategory, searchTerm, modernOnly, selectedBrand, minPrice, maxPrice, pagination.page]);

    // Extract brands from current products
    useEffect(() => {
        if (products.length > 0) {
            extractBrandsFromProducts();
        } else {
            setBrands([]);
        }
    }, [products]);

    const extractBrandsFromProducts = () => {
        const uniqueBrands = [...new Set(
            products
                .map(p => p.brand)
                .filter(brand => brand && brand.trim() !== '')
                .sort((a, b) => a.localeCompare(b))
        )];
        setBrands(uniqueBrands);
    };

    const fetchCategoryWithSubcategories = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${API_BASE_URL}/api/products/category/${categoryId}/with-subcategories`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch data');
            }

            setCategory(result.category);

            // Process subcategories
            const processedSubcategories = result.subcategories || [];
            setSubcategories(processedSubcategories);

            if (result.products && result.products.items) {
                setProducts(result.products.items);
                setPagination(result.products.pagination || {
                    page: 1,
                    limit: 20,
                    total: result.products.items.length,
                    pages: 1
                });
            }

            // If we came with a subcategoryId from CategoryHeader, find the matching subcategory
            if (initialSubcategoryId && processedSubcategories.length > 0) {
                // First try to find by _id
                let foundSubcategory = processedSubcategories.find(sub =>
                    sub._id === initialSubcategoryId ||
                    sub.id === initialSubcategoryId
                );

                // If not found by ID, try to find by title (for generated IDs)
                if (!foundSubcategory) {
                    foundSubcategory = processedSubcategories.find(sub =>
                        sub.title === initialSubcategoryName
                    );
                }

                if (foundSubcategory) {
                    // Use the actual subcategory ID
                    setSelectedSubcategory(foundSubcategory._id || foundSubcategory.id);
                }
            }

        } catch (err) {
            setError(err.message || 'Failed to load category data');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            if (!category) return;

            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            if (selectedSubcategory && selectedSubcategory !== 'all') {
                params.append('subcategoryId', selectedSubcategory);
            }

            if (searchTerm.trim()) {
                params.append('search', searchTerm);
            }

            if (modernOnly) {
                params.append('modernOnly', 'true');
            }

            if (selectedBrand && selectedBrand !== 'all') {
                params.append('brand', selectedBrand);
            }

            if (minPrice) {
                params.append('minPrice', minPrice);
            }

            if (maxPrice) {
                params.append('maxPrice', maxPrice);
            }

            const response = await fetch(
                `${API_BASE_URL}/api/products/category/${categoryId}/products?${params}`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch products');
            }

            setProducts(result.products.items || []);
            setPagination(result.products.pagination || {
                page: 1,
                limit: 20,
                total: 0,
                pages: 1
            });

        } catch (err) {
            setError(err.message || 'Failed to load products');
        }
    };

    const handleSubcategoryClick = (subcategoryId) => {
        setSelectedSubcategory(subcategoryId);
        setSelectedBrand('all'); // Reset brand when changing subcategory
        setPagination(prev => ({ ...prev, page: 1 }));
        // Clear the initial subcategory state when user manually selects
        if (initialSubcategory) {
            window.history.replaceState({}, '');
        }
    };

    const handleClearFilters = () => {
        setSelectedSubcategory('all');
        setSearchTerm('');
        setModernOnly(false);
        setSelectedBrand('all');
        setMinPrice('');
        setMaxPrice('');
        setPagination(prev => ({ ...prev, page: 1 }));
        // Clear the initial subcategory state
        if (initialSubcategory) {
            window.history.replaceState({}, '');
        }
    };

    const toggleModernFilter = () => {
        setModernOnly(!modernOnly);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleBrandChange = (brand) => {
        setSelectedBrand(brand);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleBackToCategories = () => {
        navigate('/products');
    };

    const getCurrentSubcategory = () => {
        if (selectedSubcategory === 'all') {
            // If we have an initial subcategory name but selected 'all', still show the name
            if (initialSubcategory && selectedSubcategory === 'all') {
                return { title: initialSubcategory };
            }
            return null;
        }
        return subcategories.find(sub =>
            sub._id === selectedSubcategory ||
            sub.id === selectedSubcategory
        );
    };

    const getProductStats = () => {
        const modernProducts = products.filter(p =>
            p.tags?.includes('modern') ||
            p.name?.toLowerCase().includes('modern') ||
            p.description?.toLowerCase().includes('modern')
        );

        const prices = products.map(p => p.price).filter(p => p > 0);
        const minPriceValue = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPriceValue = prices.length > 0 ? Math.max(...prices) : 0;

        // Count products by brand for current selection
        const brandCounts = {};
        products.forEach(product => {
            if (product.brand) {
                brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
            }
        });

        return {
            total: products.length,
            modernCount: modernProducts.length,
            withDiscount: products.filter(p => p.discount > 0 || (p.originalPrice && p.originalPrice > p.price)).length,
            minPrice: minPriceValue,
            maxPrice: maxPriceValue,
            brandCounts: brandCounts
        };
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
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-12 bg-gray-300 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-3">
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
                            onClick={fetchCategoryWithSubcategories}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Category Not Found</h2>
                    <p className="text-gray-600 mb-6">The requested category does not exist.</p>
                    <button
                        onClick={handleGoHome}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const currentSubcategory = getCurrentSubcategory();
    const productStats = getProductStats();
    const totalSubcategories = subcategories.length;
    const totalCategoryProducts = subcategories.reduce((sum, sub) => sum + (sub.count || 0), 0);

    // Check if any filters are active
    const hasActiveFilters = selectedSubcategory !== 'all' || searchTerm || modernOnly || selectedBrand !== 'all' || minPrice || maxPrice;

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
                        <button
                            onClick={handleBackToCategories}
                            className="hover:text-blue-600 transition-colors"
                        >
                            Categories
                        </button>
                        <ChevronRight className="w-4 h-4" />
                        <div className="flex items-center gap-2">
                            <span className="text-blue-600 font-medium">
                                {category.name}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {totalSubcategories} subcategories
                            </span>
                        </div>
                        {currentSubcategory && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-blue-600 font-medium">
                                    {currentSubcategory.title}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Main Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {currentSubcategory
                                    ? `${currentSubcategory.title} in ${category.name}`
                                    : category.name
                                }
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Package className="w-4 h-4" />
                                    {currentSubcategory
                                        ? `${productStats.total} products in ${currentSubcategory.title}`
                                        : `${totalCategoryProducts} total products`
                                    }
                                </span>
                                {!currentSubcategory && (
                                    <span className="flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4" />
                                        {totalSubcategories} subcategories
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBackToCategories}
                                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                All Categories
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Filters */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Subcategories List */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Subcategories</h2>
                                <span className="text-sm text-gray-500">{totalSubcategories}</span>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {/* All Products Option */}
                                <button
                                    onClick={() => handleSubcategoryClick('all')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${selectedSubcategory === 'all'
                                            ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm'
                                            : 'text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">All Products</span>
                                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                            {totalCategoryProducts}
                                        </span>
                                    </div>
                                </button>

                                {/* Subcategories List */}
                                {subcategories.map((subcat) => (
                                    <button
                                        key={subcat._id || subcat.id}
                                        onClick={() => handleSubcategoryClick(subcat._id || subcat.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${(selectedSubcategory === subcat._id || selectedSubcategory === subcat.id)
                                                ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm'
                                                : 'text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{subcat.title}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${subcat.count === 0 ? 'bg-gray-100 text-gray-500' :
                                                    subcat.count <= 2 ? 'bg-yellow-100 text-yellow-800' :
                                                        subcat.count <= 5 ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'
                                                }`}>
                                                {subcat.count || 0}
                                            </span>
                                        </div>
                                        {subcat.items && subcat.items.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                Includes: {subcat.items.slice(0, 2).join(', ')}
                                                {subcat.items.length > 2 && '...'}
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Brand Filter */}
                        {brands.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-gray-500" />
                                        BRANDS
                                        <span className="text-xs font-normal text-gray-500">
                                            ({brands.length})
                                        </span>
                                    </h3>
                                    {selectedBrand !== 'all' && (
                                        <button
                                            onClick={() => handleBrandChange('all')}
                                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            Reset
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                                    <button
                                        onClick={() => handleBrandChange('all')}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex justify-between items-center ${selectedBrand === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <span>All Brands</span>
                                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                            {brands.length}
                                        </span>
                                    </button>

                                    {brands.map((brand) => {
                                        const productCount = productStats.brandCounts[brand] || 0;
                                        const isSelected = selectedBrand === brand;

                                        return (
                                            <button
                                                key={brand}
                                                onClick={() => handleBrandChange(brand)}
                                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex justify-between items-center ${isSelected
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <span className="truncate">{brand}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${isSelected
                                                        ? 'bg-blue-500 text-white'
                                                        : productCount <= 2
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : productCount <= 5
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {productCount}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedBrand !== 'all' && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">
                                                Selected: <span className="font-medium">{selectedBrand}</span>
                                            </span>
                                            <span className="text-sm font-medium text-blue-600">
                                                {productStats.brandCounts[selectedBrand] || 0} products
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Price Range Filter */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5 text-gray-500" />
                                    PRICE RANGE
                                </h3>
                                <button
                                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {showPriceFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>

                            {showPriceFilter && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Min Price
                                            </label>
                                            <input
                                                type="number"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                                placeholder="Min"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Max Price
                                            </label>
                                            <input
                                                type="number"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                placeholder="Max"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {productStats.minPrice > 0 && productStats.maxPrice > 0 && (
                                        <div className="text-xs text-gray-500">
                                            Current range: ₹{productStats.minPrice} - ₹{productStats.maxPrice}
                                        </div>
                                    )}

                                    {(minPrice || maxPrice) && (
                                        <button
                                            onClick={() => {
                                                setMinPrice('');
                                                setMaxPrice('');
                                                setPagination(prev => ({ ...prev, page: 1 }));
                                            }}
                                            className="w-full text-sm text-blue-600 hover:text-blue-800 py-1"
                                        >
                                            Clear Price Filter
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modern Filter */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-500" />
                                DESIGN FILTER
                            </h3>

                            <button
                                onClick={toggleModernFilter}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${modernOnly
                                        ? 'bg-yellow-50 text-yellow-800 border-yellow-200 shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${modernOnly ? 'bg-yellow-500' : 'bg-gray-100'
                                        }`}>
                                        <Zap className={`w-3 h-3 ${modernOnly ? 'text-white' : 'text-gray-400'}`} />
                                    </div>
                                    <span className="font-medium">Modern Designs Only</span>
                                </div>
                                {modernOnly && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                            {productStats.modernCount} found
                                        </span>
                                        <X className="w-3 h-3 ml-1" />
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Active Filters Summary */}
                        {hasActiveFilters && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-800">Active Filters</h3>
                                    <button
                                        onClick={handleClearFilters}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedSubcategory !== 'all' && currentSubcategory && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                                            {currentSubcategory.title}
                                            <button
                                                onClick={() => handleSubcategoryClick('all')}
                                                className="hover:text-blue-900"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {modernOnly && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
                                            Modern Only
                                            <button
                                                onClick={toggleModernFilter}
                                                className="hover:text-yellow-900"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {selectedBrand !== 'all' && (
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
                                            {selectedBrand}
                                            <button
                                                onClick={() => setSelectedBrand('all')}
                                                className="hover:text-purple-900"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {minPrice && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                                            Min: ₹{minPrice}
                                            <button
                                                onClick={() => setMinPrice('')}
                                                className="hover:text-green-900"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {maxPrice && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                                            Max: ₹{maxPrice}
                                            <button
                                                onClick={() => setMaxPrice('')}
                                                className="hover:text-green-900"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {searchTerm && (
                                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center gap-1">
                                            Search: "{searchTerm}"
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="hover:text-gray-900"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Product Stats */}
                        {products.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gray-500" />
                                    Product Stats
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Showing</span>
                                        <span className="font-bold text-blue-600">
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
                                    {productStats.modernCount > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Modern Designs</span>
                                            <span className="font-medium text-yellow-600 flex items-center gap-1">
                                                <Zap className="w-3 h-3" />
                                                {productStats.modernCount}
                                            </span>
                                        </div>
                                    )}
                                    {productStats.minPrice > 0 && productStats.maxPrice > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Price Range</span>
                                            <span className="font-medium">
                                                ₹{productStats.minPrice} - ₹{productStats.maxPrice}
                                            </span>
                                        </div>
                                    )}
                                    {brands.length > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Available Brands</span>
                                            <span className="font-medium">
                                                {brands.length}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Top Bar with Search and View Toggle */}
                        <div className="mb-6">
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                {/* Search Bar */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search products by name, brand, or description..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* View Mode Toggle */}
                                <div className="flex items-center gap-3">
                                    <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`px-3 py-2.5 transition-colors ${viewMode === 'grid'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Grid className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`px-3 py-2.5 transition-colors ${viewMode === 'list'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {currentSubcategory
                                            ? `Products in ${currentSubcategory.title}`
                                            : 'All Products in Category'
                                        }
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Showing {products.length} of {pagination.total} products
                                        {searchTerm && ` • Search: "${searchTerm}"`}
                                        {modernOnly && ' • Modern designs only'}
                                        {selectedBrand !== 'all' && ` • Brand: ${selectedBrand}`}
                                        {selectedSubcategory !== 'all' && currentSubcategory && ` • Subcategory: ${currentSubcategory.title}`}
                                        {minPrice && ` • Min Price: ₹${minPrice}`}
                                        {maxPrice && ` • Max Price: ₹${maxPrice}`}
                                    </p>
                                </div>
                                {products.length > 0 && (
                                    <div className="text-sm text-gray-500">
                                        Page {pagination.page} of {pagination.pages}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Products Display */}
                        {products.length > 0 ? (
                            <>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {products.map(product => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {products.map(product => (
                                            <div key={product._id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
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
                                                                {(product.tags?.includes('modern') ||
                                                                    product.name?.toLowerCase().includes('modern')) && (
                                                                        <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                                                            <Zap className="w-3 h-3" />
                                                                            Modern Design
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-600">
                                            Page {pagination.page} of {pagination.pages} •{' '}
                                            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                            {pagination.total} products
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 1}
                                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors flex items-center gap-1"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Previous
                                            </button>

                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                                    let pageNum;
                                                    if (pagination.pages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (pagination.page <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (pagination.page >= pagination.pages - 2) {
                                                        pageNum = pagination.pages - 4 + i;
                                                    } else {
                                                        pageNum = pagination.page - 2 + i;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${pagination.page === pageNum
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'border border-gray-300 hover:border-gray-400'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.pages}
                                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors flex items-center gap-1"
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <div className="text-6xl mb-6">📦</div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                                    No Products Found
                                </h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    {hasActiveFilters
                                        ? 'No products match your filters. Try changing your search criteria.'
                                        : 'There are no products available in this category yet.'
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
                                        onClick={handleBackToCategories}
                                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Back to Categories
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

export default CategoryWithSubcategories;