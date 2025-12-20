import React, { useState, useEffect } from 'react';
import ProductsComponent from "../../components/Products/ProductsComponent";
import { fetchProducts, fetchCategories } from '../../services/api';

// Skeleton Loading Component - Matches ProductsComponent layout
const AllProductsSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-10 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>

                {/* Filter Bar Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 animate-pulse">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="h-12 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-12 bg-gray-200 rounded w-32"></div>
                            <div className="h-12 bg-gray-200 rounded w-32"></div>
                            <div className="h-12 bg-gray-200 rounded w-24 md:hidden"></div>
                        </div>
                    </div>
                </div>

                {/* Products Grid Skeleton - Exact match of ProductsComponent */}
                <div className="py-6">
                    {/* Header Skeleton */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="relative bg-white group overflow-hidden transition hover:shadow-lg flex flex-col items-center justify-center w-full">
                                {/* Product Image Skeleton */}
                                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-200 animate-pulse"></div>
                                
                                {/* Product Info Skeleton */}
                                <div className="p-2 w-full text-start">
                                    {/* Product Name Skeleton */}
                                    <div className="h-3 bg-gray-200 rounded mb-2 animate-pulse"></div>
                                    
                                    {/* Category Skeleton */}
                                    <div className="flex flex-col gap-0.5 mb-2">
                                        <div className="h-2 bg-gray-200 rounded w-16 animate-pulse"></div>
                                    </div>
                                    
                                    {/* Price Skeleton */}
                                    <div className="flex flex-wrap items-center gap-1 justify-between mb-2">
                                        <div className="flex items-center gap-1">
                                            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
                                        </div>
                                        <div className="h-5 bg-gray-200 rounded w-8 animate-pulse"></div>
                                    </div>
                                    
                                    {/* Brand & Free Shipping Skeleton */}
                                    <div className="mt-1 flex items-center justify-between">
                                        <div className="h-2 bg-gray-200 rounded w-16 animate-pulse"></div>
                                        <div className="h-5 bg-gray-200 rounded w-10 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Filter Skeleton - Updated to match your design
const FilterSidebarSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>

            {/* Category Filter Skeleton */}
            <div className="mb-6">
                <div className="h-5 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center animate-pulse">
                            <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Brand Filter Skeleton */}
            <div className="mb-6">
                <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center animate-pulse">
                            <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Range Filter Skeleton */}
            <div className="mb-6">
                <div className="h-5 bg-gray-200 rounded w-36 mb-3 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AllProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        brand: '',
        sortBy: 'default'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [error, setError] = useState(null);

    // Transform product data for ProductsComponent
    const transformProductForComponent = (product) => {
        const category = categories.find(c => 
            c._id === product.categoryId || 
            c.id === product.categoryId || 
            c.numericId === product.categoryId
        );
        
        // Calculate discount percentage
        const originalPrice = product.originalPrice || product.mrp || product.price || 0;
        const currentPrice = product.price || product.sellingPrice || 0;
        let discount = 0;
        
        if (originalPrice > currentPrice && originalPrice > 0) {
            discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        } else {
            discount = product.discount || product.discountPercentage || 0;
        }
        
        return {
            id: product._id || product.id || product.numericId,
            numericId: product.numericId || product._id || product.id,
            name: product.name || product.productName || "Product",
            image: product.image || (product.images && product.images[0]) || "https://placehold.co/512x512?text=No+Image",
            price: currentPrice,
            originalPrice: originalPrice,
            discount: discount,
            rating: product.rating || 4.0,
            brand: product.brand || "",
            category: category?.name || "Uncategorized",
            inStock: product.inStock !== false
        };
    };

    // Load products and categories
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch categories
                const categoriesData = await fetchCategories();
                setCategories(categoriesData);
                
                // Fetch products with initial filters
                await applyFilters();
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load products. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);

    // Apply filters when filter state changes
    const applyFilters = async (filterParams = filters) => {
        try {
            setLoading(true);
            
            // Build query params
            const params = {};
            
            if (filterParams.search) {
                params.q = filterParams.search;
            }
            
            if (filterParams.category) {
                params.category = filterParams.category;
            }
            
            if (filterParams.minPrice) {
                params.minPrice = filterParams.minPrice;
            }
            
            if (filterParams.maxPrice) {
                params.maxPrice = filterParams.maxPrice;
            }
            
            if (filterParams.brand) {
                params.brand = filterParams.brand;
            }
            
            if (filterParams.sortBy && filterParams.sortBy !== 'default') {
                params.sort = filterParams.sortBy;
            }
            
            // Add showAll to bypass status filter
            params.showAll = 'true';
            
            // Fetch products from backend
            const productsData = await fetchProducts(params);
            
            // Apply client-side sorting if needed
            let sortedProducts = [...productsData];
            
            if (filterParams.sortBy === 'price-low') {
                sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
            } else if (filterParams.sortBy === 'price-high') {
                sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
            } else if (filterParams.sortBy === 'rating') {
                sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            } else if (filterParams.sortBy === 'discount') {
                // Calculate discount for sorting
                sortedProducts.sort((a, b) => {
                    const discountA = a.discount || (a.originalPrice && a.price ? 
                        Math.round(((a.originalPrice - a.price) / a.originalPrice) * 100) : 0);
                    const discountB = b.discount || (b.originalPrice && b.price ? 
                        Math.round(((b.originalPrice - b.price) / b.originalPrice) * 100) : 0);
                    return discountB - discountA;
                });
            }
            
            setProducts(sortedProducts);
        } catch (err) {
            console.error('Error applying filters:', err);
            setError('Failed to apply filters. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (name, value) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    // Clear all filters
    const clearAllFilters = () => {
        const defaultFilters = {
            search: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            brand: '',
            sortBy: 'default'
        };
        setFilters(defaultFilters);
        applyFilters(defaultFilters);
    };

    // Get unique brands from products
    const getUniqueBrands = () => {
        const brands = new Set();
        products.forEach(product => {
            if (product.brand) {
                brands.add(product.brand);
            }
        });
        return Array.from(brands).sort();
    };

    if (loading && products.length === 0) {
        return <AllProductsSkeleton />;
    }

    // Transform products for ProductsComponent
    const transformedProducts = products.map(transformProductForComponent);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
                    <p className="text-gray-600">Browse our complete product catalog</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <p className="font-medium">Error: {error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-2 text-red-600 hover:text-red-800 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                placeholder="🔍 Search products..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Quick Filters */}
                        <div className="flex gap-4 items-center">
                            {/* Category Filter */}
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category._id || category.id} value={category._id || category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            {/* Sort By */}
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="default">Sort By</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                                <option value="discount">Best Discount</option>
                            </select>

                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filters
                            </button>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(filters.category || filters.search || filters.minPrice || filters.maxPrice || filters.brand) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {filters.search && (
                                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                            Search: "{filters.search}"
                                            <button
                                                onClick={() => handleFilterChange('search', '')}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {filters.category && (
                                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                            Category: {categories.find(c => (c._id || c.id) === filters.category)?.name}
                                            <button
                                                onClick={() => handleFilterChange('category', '')}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {filters.brand && (
                                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                            Brand: {filters.brand}
                                            <button
                                                onClick={() => handleFilterChange('brand', '')}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={clearAllFilters}
                                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Desktop Filters Sidebar */}
                    <div className="hidden lg:block lg:w-64">
                        {loading ? (
                            <FilterSidebarSkeleton />
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">FILTERS</h3>
                                    {(filters.category || filters.brand || filters.minPrice || filters.maxPrice) && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {/* Category Filter */}
                                {categories.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-bold text-gray-900 mb-3">CATEGORIES</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    id="category-all"
                                                    checked={!filters.category}
                                                    onChange={() => handleFilterChange('category', '')}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <label htmlFor="category-all" className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                    All Categories
                                                </label>
                                            </div>
                                            {categories.map(category => (
                                                <div key={category._id || category.id} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        id={`category-${category._id || category.id}`}
                                                        checked={filters.category === (category._id || category.id)}
                                                        onChange={() => handleFilterChange('category', category._id || category.id)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                    <label htmlFor={`category-${category._id || category.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                        {category.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Brand Filter */}
                                {getUniqueBrands().length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-bold text-gray-900 mb-3">BRAND</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="brand"
                                                    id="brand-all"
                                                    checked={!filters.brand}
                                                    onChange={() => handleFilterChange('brand', '')}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <label htmlFor="brand-all" className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                    All Brands
                                                </label>
                                            </div>
                                            {getUniqueBrands().map(brand => (
                                                <div key={brand} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="brand"
                                                        id={`brand-${brand}`}
                                                        checked={filters.brand === brand}
                                                        onChange={() => handleFilterChange('brand', brand)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                    <label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                        {brand}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Price Range Filter */}
                                <div className="mb-6">
                                    <h4 className="font-bold text-gray-900 mb-3">PRICE RANGE</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.minPrice}
                                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.maxPrice}
                                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Filters */}
                    {showFilters && (
                        <div className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">FILTERS</h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            {/* Category Filter */}
                            {categories.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="font-bold text-gray-900 mb-2">CATEGORY</h4>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category._id || category.id} value={category._id || category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            {/* Brand Filter */}
                            {getUniqueBrands().length > 0 && (
                                <div className="mb-4">
                                    <h4 className="font-bold text-gray-900 mb-2">BRAND</h4>
                                    <select
                                        value={filters.brand}
                                        onChange={(e) => handleFilterChange('brand', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                    >
                                        <option value="">All Brands</option>
                                        {getUniqueBrands().map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            {/* Price Range */}
                            <div className="mb-4">
                                <h4 className="font-bold text-gray-900 mb-2">PRICE RANGE</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min Price"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max Price"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowFilters(false)}
                                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                            >
                                Apply Filters
                            </button>
                        </div>
                    )}

                    {/* Products Section */}
                    <div className="flex-1">
                        {/* Products Count */}
                        <div className="mb-4 flex justify-between items-center">
                            <p className="text-gray-600 text-sm">
                                Showing <span className="font-bold">{products.length}</span> products
                            </p>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </button>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="py-6">
                                {/* Header Skeleton */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
                                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </div>

                                {/* Products Grid Skeleton */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="relative bg-white group overflow-hidden transition hover:shadow-lg flex flex-col items-center justify-center w-full">
                                            {/* Product Image Skeleton */}
                                            <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-200 animate-pulse"></div>
                                            
                                            {/* Product Info Skeleton */}
                                            <div className="p-2 w-full text-start">
                                                {/* Product Name Skeleton */}
                                                <div className="h-3 bg-gray-200 rounded mb-2 animate-pulse"></div>
                                                
                                                {/* Category Skeleton */}
                                                <div className="flex flex-col gap-0.5 mb-2">
                                                    <div className="h-2 bg-gray-200 rounded w-16 animate-pulse"></div>
                                                </div>
                                                
                                                {/* Price Skeleton */}
                                                <div className="flex flex-wrap items-center gap-1 justify-between mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
                                                    </div>
                                                    <div className="h-5 bg-gray-200 rounded w-8 animate-pulse"></div>
                                                </div>
                                                
                                                {/* Brand & Free Shipping Skeleton */}
                                                <div className="mt-1 flex items-center justify-between">
                                                    <div className="h-2 bg-gray-200 rounded w-16 animate-pulse"></div>
                                                    <div className="h-5 bg-gray-200 rounded w-10 animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : products.length > 0 ? (
                            <ProductsComponent
                                products={transformedProducts}
                                title=""
                                categoryColor="blue"
                            />
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Found</h3>
                                <p className="text-gray-600 mb-6">
                                    {filters.search 
                                        ? `No products match "${filters.search}"` 
                                        : "No products available"}
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllProductsPage;