import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from "../../components/Products/ProductCard";
import { fetchCategoryById, fetchProducts } from '../../services/api';

const Products = () => {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [allCategoryProducts, setAllCategoryProducts] = useState([]);
    const [categorySubcategories, setCategorySubcategories] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [imageIndex, setImageIndex] = useState({});
    const [loading, setLoading] = useState(true);

    // New filter states
    const [showFilters, setShowFilters] = useState(false);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Load category and products
    useEffect(() => {
        const loadCategoryAndProducts = async () => {
            try {
                setLoading(true);
                const cat = await fetchCategoryById(categoryId);
                setCategory(cat);
                setCategorySubcategories(cat.subcategories || []);

                // Fetch all products for this category for filtering counts
                const prods = await fetchProducts({
                    categoryId: cat.numericId || categoryId
                });

                setAllCategoryProducts(prods);
                setCategoryProducts(prods);
            } catch (err) {
                console.error('Error loading category:', err);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            loadCategoryAndProducts();
        }
    }, [categoryId]);

    // Apply filters and sorting
    useEffect(() => {
        if (!category || allCategoryProducts.length === 0) return;

        let filteredProducts = [...allCategoryProducts];

        // Apply subcategory filter
        if (selectedSubcategory) {
            filteredProducts = filteredProducts.filter(product =>
                product.subcategoryId === selectedSubcategory
            );
        }

        // Apply search filter
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply brand filter
        if (selectedBrands.length > 0) {
            filteredProducts = filteredProducts.filter(product =>
                selectedBrands.includes(product.brand)
            );
        }

        // Apply price range filter
        if (selectedPriceRanges.length > 0) {
            filteredProducts = filteredProducts.filter(product => {
                return selectedPriceRanges.some(range => {
                    const [min, max] = range.split('-').map(Number);
                    const price = product.price || 0;
                    return price >= min && price <= max;
                });
            });
        }

        // Apply category filter (subcategories)
        if (selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter(product =>
                selectedCategories.includes(product.subcategoryId)
            );
        }

        // Apply sorting
        const sortedProducts = [...filteredProducts].sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return (a.price || 0) - (b.price || 0);
                case 'price-high':
                    return (b.price || 0) - (a.price || 0);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'discount':
                    const discountA = a.discount || 0;
                    const discountB = b.discount || 0;
                    return discountB - discountA;
                default:
                    return 0;
            }
        });

        setCategoryProducts(sortedProducts);
    }, [allCategoryProducts, selectedSubcategory, searchTerm, selectedBrands, selectedPriceRanges, selectedCategories, sortBy, category]);

    // Get unique brands and counts from all products
    const brandCounts = {};
    const priceRangeCounts = {};

    if (allCategoryProducts.length > 0) {
        allCategoryProducts.forEach(product => {
            // Count brands
            if (product.brand) {
                brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
            }

            // Count price ranges
            const price = product.price || 0;
            const ranges = [
                { label: '300-400', min: 300, max: 400 },
                { label: '400-600', min: 400, max: 600 },
                { label: '600-800', min: 600, max: 800 },
                { label: '800-1000', min: 800, max: 1000 },
                { label: '1000-2000', min: 1000, max: 2000 },
                { label: '2000-3000', min: 2000, max: 3000 }
            ];

            ranges.forEach(range => {
                if (price >= range.min && price <= range.max) {
                    priceRangeCounts[range.label] = (priceRangeCounts[range.label] || 0) + 1;
                }
            });
        });
    }

    // Get unique brands with counts
    const brands = Object.keys(brandCounts).map(brand => ({
        name: brand,
        count: brandCounts[brand]
    })).sort((a, b) => b.count - a.count);

    // Get price ranges with counts
    const priceRanges = [
        { label: '300-400', min: 300, max: 400 },
        { label: '400-600', min: 400, max: 600 },
        { label: '600-800', min: 600, max: 800 },
        { label: '800-1000', min: 800, max: 1000 },
        { label: '1000-2000', min: 1000, max: 2000 },
        { label: '2000-3000', min: 2000, max: 3000 }
    ].map(range => ({
        label: range.label,
        count: priceRangeCounts[range.label] || 0
    }));

    // Filter handler functions
    const handleBrandChange = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand)
                ? prev.filter(b => b !== brand)
                : [...prev, brand]
        );
    };

    const handlePriceRangeChange = (range) => {
        setSelectedPriceRanges(prev =>
            prev.includes(range)
                ? prev.filter(r => r !== range)
                : [...prev, range]
        );
    };

    const handleCategoryChange = (subcategoryId) => {
        setSelectedCategories(prev =>
            prev.includes(subcategoryId)
                ? prev.filter(id => id !== subcategoryId)
                : [...prev, subcategoryId]
        );
    };

    const clearAllFilters = () => {
        setSelectedBrands([]);
        setSelectedPriceRanges([]);
        setSelectedCategories([]);
        setSelectedSubcategory(null);
        setSearchTerm('');
    };

    // Product card handlers
    const handleProductMouseEnter = (productId) => {
        setHoveredProduct(productId);
        const product = categoryProducts.find(p => p.id === productId || p.numericId === productId);
        if (product?.images && product.images.length > 1) {
            const interval = setInterval(() => {
                setImageIndex(prev => ({
                    ...prev,
                    [productId]: ((prev[productId] || 0) + 1) % product.images.length
                }));
            }, 2000);

            setImageIndex(prev => ({
                ...prev,
                [`${productId}_interval`]: interval
            }));
        }
    };

    const handleProductMouseLeave = (productId) => {
        setHoveredProduct(null);
        const intervalId = imageIndex[`${productId}_interval`];
        if (intervalId) {
            clearInterval(intervalId);
            setImageIndex(prev => {
                const newState = { ...prev };
                delete newState[`${productId}_interval`];
                return newState;
            });
        }
    };

    const handleProductClick = (product) => {
        window.location.href = `/product/${product.numericId || product.id}`;
    };

    const transformProductForCard = (product) => {
        const subcategory = categorySubcategories.find(sub =>
            sub.numericId === product.subcategoryId || sub.id === product.subcategoryId
        );

        return {
            id: product.numericId || product.id,
            productName: product.name,
            images: product.image ? [product.image] : product.images || ["https://placehold.co/512x512?text=No+Image"],
            category: category?.name || "",
            subCategory: subcategory?.title || subcategory?.name || "General",
            description: product.description || "",
            price: product.price || 0,
            originalPrice: product.originalPrice || product.price,
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            brand: product.brand || "",
            unit: product.unit || "unit",
            inStock: product.inStock !== false,
            discount: product.discount || 0,
            specs: product.specs || [],
            minOrder: product.minOrder || 1
        };
    };

    const getColorClasses = (color) => {
        const colorMap = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-700' },
            gray: { bg: 'bg-gray-50', text: 'text-gray-700' },
            yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
            cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-700' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-700' },
            red: { bg: 'bg-red-50', text: 'text-red-700' },
            pink: { bg: 'bg-pink-50', text: 'text-pink-700' }
        };
        return colorMap[color] || colorMap.blue;
    };

    const colorClass = category ? getColorClasses(category.color) : getColorClasses('blue');

    // Count active filters
    const activeFilterCount =
        (selectedSubcategory ? 1 : 0) +
        selectedBrands.length +
        selectedPriceRanges.length +
        selectedCategories.length +
        (searchTerm ? 1 : 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4 mx-auto"></div>
                    <p className="text-gray-600 text-xl">Loading products...</p>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Category Not Found</h2>
                    <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Category Header */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <span className="text-4xl mr-4">{category.icon || '🔧'}</span>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h1>
                                <p className="text-gray-600 text-sm md:text-base">{category.description || 'Explore all products in this category'}</p>
                            </div>
                        </div>
                        <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
                {/* Mobile Filter Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center justify-between w-full mb-4 bg-white p-4 rounded-lg shadow"
                >
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="font-medium">FILTERS</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </div>
                    <span className="text-gray-500">
                        {showFilters ? '▲' : '▼'}
                    </span>
                </button>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters Sidebar - LEFT SIDE */}
                    <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64`}>
                        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 lg:mb-0">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">FILTERS</h3>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Active Filters */}
                            {activeFilterCount > 0 && (
                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSubcategory && (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                                                {categorySubcategories.find(s => s.id === selectedSubcategory)?.name}
                                                <button
                                                    onClick={() => setSelectedSubcategory(null)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                        {selectedBrands.map(brand => (
                                            <span key={brand} className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                                                {brand}
                                                <button
                                                    onClick={() => handleBrandChange(brand)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        {selectedPriceRanges.map(range => (
                                            <span key={range} className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                                                ${range}
                                                <button
                                                    onClick={() => handlePriceRangeChange(range)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        {searchTerm && (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                                                Search: "{searchTerm}"
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CATEGORY Filter */}
                            {categorySubcategories.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-bold text-gray-900 mb-3 text-base">SUBCATEGORIES</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="subcategory"
                                                    id="subcat-all"
                                                    checked={!selectedSubcategory}
                                                    onChange={() => setSelectedSubcategory(null)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <label htmlFor="subcat-all" className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                    All Products
                                                </label>
                                            </div>
                                            <span className="text-gray-500 text-sm">({allCategoryProducts.length})</span>
                                        </div>
                                        {categorySubcategories.map(sub => {
                                            const isActive = selectedSubcategory === sub.id;
                                            const productCount = allCategoryProducts.filter(p =>
                                                p.subcategoryId === sub.id ||
                                                p.subcategoryId === sub.numericId
                                            ).length;
                                            return (
                                                <div key={sub.id} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="subcategory"
                                                            id={`subcat-${sub.id}`}
                                                            checked={isActive}
                                                            onChange={() => setSelectedSubcategory(isActive ? null : sub.id)}
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <label htmlFor={`subcat-${sub.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                            {sub.name}
                                                        </label>
                                                    </div>
                                                    <span className="text-gray-500 text-sm">({productCount})</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* BRAND Filter */}
                            {brands.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-bold text-gray-900 mb-3 text-base">BRAND</h4>
                                    <div className="space-y-2">
                                        {brands.map(brand => (
                                            <div key={brand.name} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`brand-${brand.name}`}
                                                        checked={selectedBrands.includes(brand.name)}
                                                        onChange={() => handleBrandChange(brand.name)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <label htmlFor={`brand-${brand.name}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                        {brand.name}
                                                    </label>
                                                </div>
                                                <span className="text-gray-500 text-sm">({brand.count})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PRICE RANGE Filter */}
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-900 mb-3 text-base">PRICE RANGE</h4>
                                <div className="space-y-2">
                                    {priceRanges.map(range => (
                                        <div key={range.label} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`price-${range.label}`}
                                                    checked={selectedPriceRanges.includes(range.label)}
                                                    onChange={() => handlePriceRangeChange(range.label)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <label htmlFor={`price-${range.label}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                    ${range.label}
                                                </label>
                                            </div>
                                            <span className="text-gray-500 text-sm">({range.count})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Section - RIGHT SIDE */}
                    <div className="flex-1">
                        {/* Search and Sort Bar */}
                        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div className="w-full md:w-1/3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="🔍 Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-700 text-sm">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="default">Default</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Highest Rated</option>
                                        <option value="discount">Best Discount</option>
                                    </select>
                                </div>
                            </div>

                            {/* Quick Subcategory Filter */}
                            {categorySubcategories.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-base font-semibold text-gray-800 mb-2">Filter by Subcategory</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedSubcategory(null)}
                                            className={`px-3 py-1.5 rounded-lg text-sm ${!selectedSubcategory
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            All Products
                                        </button>
                                        {categorySubcategories.map(sub => {
                                            const isActive = selectedSubcategory === sub.id;
                                            const productCount = allCategoryProducts.filter(p =>
                                                p.subcategoryId === sub.id ||
                                                p.subcategoryId === sub.numericId
                                            ).length;
                                            return (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => setSelectedSubcategory(isActive ? null : sub.id)}
                                                    className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm ${isActive
                                                        ? `${colorClass.bg} ${colorClass.text}`
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    {sub.name}
                                                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${isActive ? 'bg-white' : 'bg-gray-300'}`}>
                                                        {productCount}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Products Count */}
                        <div className="mb-4 px-2">
                            <p className="text-gray-600 text-sm">
                                Showing <span className="font-bold">{categoryProducts.length}</span> products
                                {activeFilterCount > 0 && (
                                    <>
                                        <button
                                            onClick={clearAllFilters}
                                            className="ml-3 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                        >
                                            Clear all filters
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Products Grid */}
                        {categoryProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {categoryProducts.map(product => (
                                    <ProductCard
                                        key={product.id || product.numericId}
                                        product={transformProductForCard(product)}
                                        hoveredProduct={hoveredProduct}
                                        imageIndex={imageIndex}
                                        handleMouseEnter={handleProductMouseEnter}
                                        handleMouseLeave={handleProductMouseLeave}
                                        handleProductClick={() => handleProductClick(product)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-6 md:p-12 text-center">
                                <div className="text-4xl md:text-6xl mb-4">📦</div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-4">No Products Found</h3>
                                <p className="text-gray-600 mb-6 text-sm md:text-base">
                                    {searchTerm
                                        ? `No products match "${searchTerm}"`
                                        : activeFilterCount > 0
                                            ? "No products match your filters"
                                            : `No products available in ${category.name} category`
                                    }
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base"
                                >
                                    {activeFilterCount > 0 ? "Clear Filters" : "View All Products"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;