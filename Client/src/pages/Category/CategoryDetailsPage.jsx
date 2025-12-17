import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { buildersmartData } from '../../data/buildersmartData';

const CategoryDetailsPage = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [compareProducts, setCompareProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [loading, setLoading] = useState(true);

    const { categories, products } = buildersmartData;

    // Convert categoryId to number
    const categoryIdNum = parseInt(categoryId);

    // Get category details
    const category = categories?.find(c => c.id === categoryIdNum);

    // Get subcategories from category
    const categorySubcategories = category?.subcategories || [];

    // Filter products by categoryId - FIXED
    let categoryProducts = products?.filter(product =>
        product.categoryId === categoryIdNum
    ) || [];

    useEffect(() => {
        // If category not found, redirect
        if (!category) {
            const timer = setTimeout(() => {
                navigate('/categories');
            }, 2000);
            return () => clearTimeout(timer);
        }
        setLoading(false);
    }, [category, navigate]);

    // Apply subcategory filter
    if (selectedSubcategory) {
        categoryProducts = categoryProducts.filter(product =>
            product.subcategoryId === selectedSubcategory
        );
    }

    // Apply search filter
    if (searchTerm) {
        categoryProducts = categoryProducts.filter(product =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Apply sorting
    categoryProducts = [...categoryProducts].sort((a, b) => {
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

    const handleAddToCompare = (product) => {
        if (compareProducts.length < 4 && !compareProducts.find(p => p.id === product.id)) {
            setCompareProducts([...compareProducts, product]);
        }
    };

    const handleRemoveFromCompare = (productId) => {
        setCompareProducts(compareProducts.filter(p => p.id !== productId));
    };

    const handleClearCompare = () => {
        setCompareProducts([]);
    };

    const getProductCountBySubcategory = (subcategoryId) => {
        return categoryProducts.filter(p => p.subcategoryId === subcategoryId).length;
    };

    const getTotalProductsInCategory = () => {
        return products?.filter(p => p.categoryId === categoryIdNum).length || 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading category details...</p>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-3xl font-bold text-gray-700 mb-4">Category Not Found</h2>
                    <p className="text-gray-600 mb-6">Redirecting to categories page...</p>
                    <Link to="/categories" className="text-blue-600 hover:text-blue-800 font-semibold">
                        ← Go to Categories
                    </Link>
                </div>
            </div>
        );
    }

    const getColorClasses = (color) => {
        const colorMap = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
            gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', hover: 'hover:bg-gray-100' },
            yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', hover: 'hover:bg-yellow-100' },
            cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', hover: 'hover:bg-cyan-100' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', hover: 'hover:bg-orange-100' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
            red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', hover: 'hover:bg-red-100' },
            pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', hover: 'hover:bg-pink-100' }
        };
        return colorMap[color] || colorMap.blue;
    };

    const colorClass = getColorClasses(category.color);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Category Banner */}
            <div className="relative h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700"></div>
                <div className="absolute inset-0 opacity-20 bg-pattern"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="max-w-7xl mx-auto">
                        <Link to="/categories" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                            ← Back to Categories
                        </Link>
                        <div className="flex items-center">
                            <span className="text-5xl mr-6">{category.icon}</span>
                            <div>
                                <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
                                <p className="text-lg">{category.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compare Bar */}
            {compareProducts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-blue-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-800">
                                📊 Compare Products ({compareProducts.length}/4)
                            </h3>
                            <div className="flex gap-2 mt-2 md:mt-0">
                                <button
                                    onClick={handleClearCompare}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                                >
                                    Clear All
                                </button>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm">
                                    Compare Now
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {compareProducts.map(product => (
                                <div
                                    key={product.id}
                                    className="flex items-center bg-blue-100 border border-blue-300 rounded-full px-3 py-1"
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-6 h-6 rounded-full mr-2 object-cover"
                                    />
                                    <span className="text-sm font-medium text-blue-800 truncate max-w-[120px]">
                                        {product.name}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveFromCompare(product.id)}
                                        className="ml-1 text-blue-800 hover:text-red-600 text-sm"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    {/* Search and Sort */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="w-full md:w-1/3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="🔍 Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-700 font-medium">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                                <option value="default">Default</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                                <option value="discount">Best Discount</option>
                            </select>
                        </div>
                    </div>

                    {/* Subcategories Filter */}
                    {categorySubcategories.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Filter by Subcategory</h3>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setSelectedSubcategory(null)}
                                    className={`px-4 py-2 rounded-lg border-2 ${!selectedSubcategory
                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                        : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    All ({getTotalProductsInCategory()})
                                </button>
                                {categorySubcategories.map(sub => {
                                    const isActive = selectedSubcategory === sub.id;
                                    const count = getProductCountBySubcategory(sub.id);
                                    return (
                                        <button
                                            key={sub.id}
                                            onClick={() => setSelectedSubcategory(isActive ? null : sub.id)}
                                            className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 ${isActive
                                                ? `${colorClass.bg} border-blue-500 text-blue-700`
                                                : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {sub.name}
                                            <span className={`px-2 py-1 text-xs rounded-full ${isActive ? 'bg-white text-blue-700' : 'bg-gray-200 text-gray-700'
                                                }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Product Count */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600">
                                Showing <span className="font-bold">{categoryProducts.length}</span> of <span className="font-bold">{getTotalProductsInCategory()}</span> products
                            </span>
                            {selectedSubcategory && (
                                <button
                                    onClick={() => setSelectedSubcategory(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Clear filter
                                </button>
                            )}
                        </div>
                        <div className={`${colorClass.bg} ${colorClass.text} px-3 py-1 rounded-lg text-sm font-semibold`}>
                            {category.name}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {categoryProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryProducts.map(product => {
                            const discountPercent = product.discount || 0;
                            const subcategory = categorySubcategories.find(sub => sub.id === product.subcategoryId);

                            return (
                                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                                    {/* Product Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={product.image || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop"}
                                            alt={product.name}
                                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                        />
                                        {discountPercent > 0 && (
                                            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                {discountPercent}% OFF
                                            </div>
                                        )}
                                        {product.inStock === false && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white font-bold bg-red-500 px-4 py-2 rounded-lg">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                        {/* Subcategory Badge */}
                                        <div className="absolute bottom-3 left-3">
                                            <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                                                {subcategory?.name || "Product"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-5">
                                        {/* Brand and Rating */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`${colorClass.bg} ${colorClass.text} px-3 py-1 rounded-full text-xs font-semibold`}>
                                                {product.brand || "Brand"}
                                            </span>
                                            <div className="flex items-center">
                                                <div className="text-yellow-400">
                                                    {'★'.repeat(Math.floor(product.rating || 0))}
                                                    {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                                                </div>
                                                <span className="text-gray-600 text-sm ml-1">({product.rating || 0})</span>
                                            </div>
                                        </div>

                                        {/* Product Name */}
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                            {product.name || "Product Name"}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {product.description || "Product description"}
                                        </p>

                                        {/* Specifications */}
                                        {product.specs && product.specs.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {product.specs.slice(0, 2).map((spec, index) => (
                                                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                        {spec}
                                                    </span>
                                                ))}
                                                {product.specs.length > 2 && (
                                                    <span className="text-gray-500 text-xs self-center">
                                                        +{product.specs.length - 2} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    ₹{(product.price || 0).toLocaleString()}
                                                </span>
                                                <span className="text-gray-500">/{product.unit || "unit"}</span>
                                            </div>
                                            {product.originalPrice && (
                                                <div className="text-gray-500 line-through text-sm">
                                                    ₹{product.originalPrice.toLocaleString()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Min Order */}
                                        <div className="text-sm text-gray-500 mb-4">
                                            📦 Min. Order: {product.minOrder || 1} {product.unit || "unit"}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={() => handleAddToCompare(product)}
                                                disabled={compareProducts.length >= 4 || compareProducts.find(p => p.id === product.id)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition ${compareProducts.find(p => p.id === product.id)
                                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                                    : compareProducts.length >= 4
                                                        ? 'bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed'
                                                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {compareProducts.find(p => p.id === product.id) ? 'Added' : 'Compare'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-6">📦</div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-4">
                            {searchTerm ? "No Products Found" : "No Products Available"}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm
                                ? `No products match "${searchTerm}" in ${category.name}`
                                : selectedSubcategory
                                    ? `No products available in this subcategory`
                                    : `No products available in ${category.name} category yet`
                            }
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedSubcategory(null);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                            >
                                View All Products
                            </button>
                            <Link
                                to="/categories"
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition"
                            >
                                Browse Other Categories
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryDetailsPage;