import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ProductsComponent from "../../components/Products/ProductsComponent";
import { 
    fetchProductsByCategory, 
    fetchCategoryDetails, 
    fetchProducts
} from '../../services/api';
import { ArrowLeft, Filter, X } from 'lucide-react';

// Skeleton Loading Component
const ProductsPageSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                            <div>
                                <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Subcategories Skeleton */}
                <div className="mb-8">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="relative bg-white group overflow-hidden flex flex-col items-center justify-center w-full animate-pulse">
                                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-200"></div>
                                <div className="p-2 w-full text-start">
                                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                                    <div className="flex flex-col gap-0.5 mb-2">
                                        <div className="h-2 bg-gray-200 rounded w-16"></div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1 justify-between mb-2">
                                        <div className="flex items-center gap-1">
                                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                                            <div className="h-3 bg-gray-200 rounded w-8"></div>
                                        </div>
                                        <div className="h-5 bg-gray-200 rounded w-8"></div>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between">
                                        <div className="h-2 bg-gray-200 rounded w-16"></div>
                                        <div className="h-5 bg-gray-200 rounded w-10"></div>
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

const ProductsPage = () => {
    const { categoryId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [category, setCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Get initial subcategory from query params
    const queryParams = new URLSearchParams(location.search);
    const initialSubcategoryId = queryParams.get('subcategory');

    // Load data - FIXED VERSION
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // 1. Fetch category details
                const categoryData = await fetchCategoryDetails(categoryId);
                setCategory(categoryData);
                
                // 2. Extract subcategories from category data directly
                // This is the KEY FIX - don't call fetchSubcategories if endpoint doesn't exist
                const subcategoriesFromCategory = categoryData.subcategories || [];
                
                // 3. Fetch all products for this category
                const allProductsData = await fetchProductsByCategory(categoryId);
                setAllProducts(allProductsData);
                setProducts(allProductsData);
                
                // 4. Calculate product count for each subcategory
                const subcategoriesWithCount = subcategoriesFromCategory.map(sub => {
                    const productCount = allProductsData.filter(product => {
                        // Match by numericId or _id
                        return product.subcategoryId === sub.numericId ||
                               product.subcategoryId === sub._id?.toString() ||
                               product.subcategory?.numericId === sub.numericId ||
                               product.subcategory?._id === sub._id;
                    }).length;
                    
                    return {
                        ...sub,
                        productCount: productCount
                    };
                });
                
                setSubcategories(subcategoriesWithCount);
                
                // 5. Extract unique brands
                const uniqueBrands = [...new Set(allProductsData
                    .filter(p => p.brand)
                    .map(p => p.brand)
                    .sort())];
                setBrands(uniqueBrands);
                
                // 6. Set initial subcategory if provided
                if (initialSubcategoryId && subcategoriesWithCount.length > 0) {
                    const sub = subcategoriesWithCount.find(s => 
                        s._id === initialSubcategoryId || 
                        s.numericId?.toString() === initialSubcategoryId
                    );
                    if (sub) {
                        setSelectedSubcategory(sub);
                        // Filter products by subcategory
                        filterProductsBySubcategory(allProductsData, sub);
                    }
                }
                
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load products. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [categoryId, initialSubcategoryId]);

    // Helper function to filter products by subcategory
    const filterProductsBySubcategory = (productsData, subcategory) => {
        const filtered = productsData.filter(product => {
            return product.subcategoryId === subcategory.numericId ||
                   product.subcategoryId === subcategory._id?.toString() ||
                   product.subcategory?.numericId === subcategory.numericId ||
                   product.subcategory?._id === subcategory._id;
        });
        setProducts(filtered);
        
        // Update brands based on filtered products
        const uniqueBrands = [...new Set(filtered
            .filter(p => p.brand)
            .map(p => p.brand)
            .sort())];
        setBrands(uniqueBrands);
        setSelectedBrand(''); // Reset brand filter
    };

    // Handle subcategory click
    const handleSubcategoryClick = (subcategory) => {
        if (selectedSubcategory && selectedSubcategory._id === subcategory._id) {
            // Clear subcategory filter
            handleSubcategoryClear();
        } else {
            // Select new subcategory
            handleSubcategorySelect(subcategory);
        }
    };

    // Handle subcategory selection
    const handleSubcategorySelect = async (subcategory) => {
        try {
            setLoading(true);
            setSelectedSubcategory(subcategory);
            
            // Filter by subcategory
            filterProductsBySubcategory(allProducts, subcategory);
            
            // Update URL
            const subcategoryId = subcategory._id || subcategory.numericId;
            navigate(`/category/${categoryId}/products?subcategory=${subcategoryId}`, { replace: true });
            
        } catch (err) {
            console.error('Error filtering subcategory:', err);
            setError('Failed to load subcategory products');
        } finally {
            setLoading(false);
        }
    };

    // Clear subcategory filter
    const handleSubcategoryClear = async () => {
        try {
            setLoading(true);
            setSelectedSubcategory(null);
            
            // Reset to all products
            setProducts(allProducts);
            
            // Reset brands
            const uniqueBrands = [...new Set(allProducts
                .filter(p => p.brand)
                .map(p => p.brand)
                .sort())];
            setBrands(uniqueBrands);
            setSelectedBrand('');
            setPriceRange({ min: '', max: '' });
            setSearchQuery('');
            setSortBy('newest');
            
            // Update URL
            navigate(`/category/${categoryId}/products`, { replace: true });
            
        } catch (err) {
            console.error('Error clearing subcategory:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    const applyFilters = () => {
        let filtered = allProducts;
        
        // Apply subcategory filter
        if (selectedSubcategory) {
            filtered = filtered.filter(product => {
                return product.subcategoryId === selectedSubcategory.numericId ||
                       product.subcategoryId === selectedSubcategory._id?.toString() ||
                       product.subcategory?.numericId === selectedSubcategory.numericId ||
                       product.subcategory?._id === selectedSubcategory._id;
            });
        }

        // Apply brand filter
        if (selectedBrand) {
            filtered = filtered.filter(product => 
                product.brand === selectedBrand
            );
        }

        // Apply price range filter
        if (priceRange.min) {
            filtered = filtered.filter(product => 
                (product.price || 0) >= parseFloat(priceRange.min)
            );
        }
        if (priceRange.max) {
            filtered = filtered.filter(product => 
                (product.price || 0) <= parseFloat(priceRange.max)
            );
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name?.toLowerCase().includes(query) ||
                product.brand?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        filtered = sortProducts(filtered, sortBy);
        
        setProducts(filtered);
    };

    // Sort products
    const sortProducts = (products, sortBy) => {
        return [...products].sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return (a.price || 0) - (b.price || 0);
                case 'price-high':
                    return (b.price || 0) - (a.price || 0);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'discount':
                    const discountA = a.discount || a.discountPercentage || 0;
                    const discountB = b.discount || b.discountPercentage || 0;
                    return discountB - discountA;
                case 'name-asc':
                    return (a.name || '').localeCompare(b.name || '');
                case 'name-desc':
                    return (b.name || '').localeCompare(a.name || '');
                default:
                    return 0;
            }
        });
    };

    // Clear all filters
    const clearAllFilters = async () => {
        setSelectedSubcategory(null);
        setSelectedBrand('');
        setPriceRange({ min: '', max: '' });
        setSearchQuery('');
        setSortBy('newest');
        
        // Reset to all products
        setProducts(allProducts);
        
        // Reset brands
        const uniqueBrands = [...new Set(allProducts
            .filter(p => p.brand)
            .map(p => p.brand)
            .sort())];
        setBrands(uniqueBrands);
        
        // Update URL
        navigate(`/category/${categoryId}/products`, { replace: true });
    };

    // Apply filters when they change
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 300);
        
        return () => clearTimeout(timer);
    }, [selectedSubcategory, selectedBrand, priceRange, searchQuery, sortBy, allProducts]);

    // Check if any filter is active
    const hasActiveFilters = () => {
        return selectedSubcategory || selectedBrand || priceRange.min || priceRange.max || searchQuery || sortBy !== 'newest';
    };

    // Transform product data for ProductsComponent
    const transformProductForComponent = (product) => {
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
            subcategory: product.subcategory?.title || product.subcategory?.name || "",
            inStock: product.inStock !== false
        };
    };

    if (loading) {
        return <ProductsPageSkeleton />;
    }

    if (error || !category) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">
                        {error || 'Category Not Found'}
                    </h2>
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const transformedProducts = products.map(transformProductForComponent);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Category Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <button 
                                onClick={() => navigate(`/category/${categoryId}`)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base mr-4 flex items-center"
                            >
                                <ArrowLeft className="inline w-4 h-4 mr-1" />
                                Back to Category
                            </button>
                            <span className="text-4xl mr-4">{category?.icon || '📦'}</span>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {selectedSubcategory 
                                        ? `${selectedSubcategory.title || selectedSubcategory.name} - ${category?.name}`
                                        : category?.name || 'Products'
                                    }
                                </h1>
                                <p className="text-gray-600 text-sm md:text-base">
                                    {selectedSubcategory 
                                        ? selectedSubcategory.description || `Browse all ${selectedSubcategory.title || selectedSubcategory.name} products`
                                        : category?.description || 'Browse our collection'
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-600 hover:text-gray-800 font-medium text-sm md:text-base"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Browse by Subcategory Section */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Subcategory</h2>
                    
                    {/* All Products Card */}
                    <div className="mb-6">
                        <div 
                            className={`bg-white rounded-lg border hover:border-blue-500 overflow-hidden group cursor-pointer transition-all duration-300 ${!selectedSubcategory ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            onClick={handleSubcategoryClear}
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-3">All {category?.name} Products</h3>
                                <p className="text-gray-600 mb-4">
                                    Browse our complete collection of {category?.name?.toLowerCase()} materials and supplies
                                </p>
                                <div className="flex items-center text-blue-600 font-medium">
                                    <span>View all products</span>
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Or browse by specific subcategory */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Or browse by specific subcategory</h3>
                        
                        {subcategories.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subcategories.map(sub => {
                                    const isActive = selectedSubcategory && (
                                        selectedSubcategory._id === sub._id ||
                                        selectedSubcategory.numericId === sub.numericId
                                    );
                                    const productCount = sub.productCount || 0;
                                    
                                    if (productCount === 0) return null;
                                    
                                    return (
                                        <div 
                                            key={sub._id || sub.numericId}
                                            className={`bg-white rounded-lg border p-4 cursor-pointer transition-all duration-300 ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                                            onClick={() => handleSubcategoryClick(sub)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900">
                                                    {sub.title || 'Subcategory'}
                                                </h4>
                                                <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                                                    {productCount} products
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {sub.description || `Browse ${sub.title} products`}
                                            </p>
                                            <div className="flex items-center text-blue-600 text-sm font-medium">
                                                <span>View products</span>
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No subcategories available for this category.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        {/* Search */}
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="🔍 Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sort and Filter Buttons */}
                        <div className="flex gap-4 items-center">
                            {/* Sort By */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="newest">Sort By</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                                <option value="discount">Best Discount</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="name-desc">Name: Z to A</option>
                            </select>

                            {/* Filter Toggle Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters() && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {selectedSubcategory && (
                                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                            Subcategory: {selectedSubcategory.title || selectedSubcategory.name}
                                            <button
                                                onClick={handleSubcategoryClear}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {selectedBrand && (
                                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                            Brand: {selectedBrand}
                                            <button
                                                onClick={() => setSelectedBrand('')}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {priceRange.min && (
                                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                            Min: ₹{priceRange.min}
                                            <button
                                                onClick={() => setPriceRange({...priceRange, min: ''})}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {priceRange.max && (
                                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                            Max: ₹{priceRange.max}
                                            <button
                                                onClick={() => setPriceRange({...priceRange, max: ''})}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {searchQuery && (
                                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                            Search: "{searchQuery}"
                                            <button
                                                onClick={() => setSearchQuery('')}
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
                                    Clear All Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter Sidebar */}
                {showFilters && (
                    <div className="mb-6 bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">FILTERS</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Selected Subcategory Display */}
                            {selectedSubcategory && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-bold text-blue-900 mb-2">SELECTED SUBCATEGORY</h4>
                                    <div className="flex items-center justify-between">
                                        <p className="text-blue-800 font-medium">
                                            {selectedSubcategory.title || selectedSubcategory.name}
                                        </p>
                                        <button
                                            onClick={handleSubcategoryClear}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Brand Filter */}
                            {brands.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3">BRAND</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="brand"
                                                id="brand-all"
                                                checked={!selectedBrand}
                                                onChange={() => setSelectedBrand('')}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <label htmlFor="brand-all" className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                All Brands ({brands.length})
                                            </label>
                                        </div>
                                        {brands.map(brand => (
                                            <div key={brand} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="brand"
                                                    id={`brand-${brand}`}
                                                    checked={selectedBrand === brand}
                                                    onChange={() => setSelectedBrand(brand)}
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
                            <div>
                                <h4 className="font-bold text-gray-900 mb-3">PRICE RANGE</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Min Price (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Max Price (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Count */}
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <p className="text-gray-600 text-sm">
                            Showing <span className="font-bold">{products.length}</span> 
                            {selectedSubcategory 
                                ? ` products in ${selectedSubcategory.title || selectedSubcategory.name}`
                                : ' products'
                            }
                        </p>
                        {selectedSubcategory && (
                            <p className="text-xs text-gray-500 mt-1">
                                Filtering by: {selectedSubcategory.title || selectedSubcategory.name}
                            </p>
                        )}
                    </div>
                    
                    {/* Clear Filters Button for mobile */}
                    {hasActiveFilters() && (
                        <button
                            onClick={clearAllFilters}
                            className="lg:hidden text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                    <ProductsComponent
                        products={transformedProducts}
                        title=""
                        categoryColor="blue"
                    />
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-4">No Products Found</h3>
                        <p className="text-gray-600 mb-6">
                            {selectedSubcategory
                                ? `No products found in "${selectedSubcategory.title || selectedSubcategory.name}" with current filters`
                                : hasActiveFilters()
                                ? 'No products match your filters'
                                : `No products available in ${category.name} category`
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {selectedSubcategory && (
                                <button
                                    onClick={handleSubcategoryClear}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg"
                                >
                                    View All {category.name}
                                </button>
                            )}
                            <button
                                onClick={clearAllFilters}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;