import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { categories, products } from '../../data/buildersmartData';
import ProductCard from "../../components/Products/ProductCard"; // Import your ProductCard component

const Products = () => {
    const { categoryId } = useParams();
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [imageIndex, setImageIndex] = useState({});

    // Convert categoryId to number
    const categoryIdNum = parseInt(categoryId);

    // Get category details
    const category = categories?.find(c => c.id === categoryIdNum);

    // Get subcategories from category
    const categorySubcategories = category?.subcategories || [];

    // Filter products by categoryId
    let categoryProducts = products?.filter(product =>
        product.categoryId === categoryIdNum
    ) || [];

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

    // Product card handlers
    const handleMouseEnter = (productId) => {
        setHoveredProduct(productId);
        // Start image rotation for product with multiple images
        const product = categoryProducts.find(p => p.id === productId);
        if (product?.images && product.images.length > 1) {
            const interval = setInterval(() => {
                setImageIndex(prev => ({
                    ...prev,
                    [productId]: ((prev[productId] || 0) + 1) % product.images.length
                }));
            }, 2000); // Change image every 2 seconds

            // Store interval ID for cleanup
            setImageIndex(prev => ({
                ...prev,
                [`${productId}_interval`]: interval
            }));
        }
    };

    const handleMouseLeave = (productId) => {
        setHoveredProduct(null);
        // Clear interval when mouse leaves
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
        // Navigate to product details page
        window.location.href = `/product/${product.id}`;
    };

    const handleImageError = (e) => {
        e.target.src = "https://placehold.co/512x512?text=Image+Not+Available";
    };

    // Transform product data to match ProductCard format
    const transformProductForCard = (product) => {
        const subcategory = categorySubcategories.find(sub => sub.id === product.subcategoryId);

        return {
            id: product.id,
            productName: product.name,
            images: product.image ? [product.image] : ["https://placehold.co/512x512?text=No+Image"],
            category: category?.name || "",
            subCategory: subcategory?.name || "General",
            description: product.description || "",
            price: product.price || 0,
            originalPrice: product.originalPrice || product.price,
            rating: product.rating || 0,
            reviews: 0, // You might want to add review count to your product data
            brand: product.brand || "",
            unit: product.unit || "unit",
            inStock: product.inStock !== false,
            discount: product.discount || 0,
            specs: product.specs || [],
            minOrder: product.minOrder || 1
        };
    };

    if (!category) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Category Not Found</h2>
                    <a href="/" className="text-blue-600 hover:text-blue-800 font-semibold">
                        ← Back to Home
                    </a>
                </div>
            </div>
        );
    }

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

    const colorClass = getColorClasses(category.color);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Category Header */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <span className="text-4xl mr-4">{category.icon}</span>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h1>
                                <p className="text-gray-600 text-sm md:text-base">{category.description}</p>
                            </div>
                        </div>
                        <a
                            href="/"
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
                        >
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
                {/* Filters */}
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

                    {/* Subcategories */}
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
                                    const productCount = categoryProducts.filter(p => p.subcategoryId === sub.id).length;
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
                        {selectedSubcategory && (
                            <>
                                {' '}in{' '}
                                <span className="font-bold">
                                    {categorySubcategories.find(s => s.id === selectedSubcategory)?.name}
                                </span>
                                <button
                                    onClick={() => setSelectedSubcategory(null)}
                                    className="ml-3 text-blue-600 hover:text-blue-800 text-xs"
                                >
                                    Clear filter
                                </button>
                            </>
                        )}
                    </p>
                </div>

                {/* Products Grid */}
                {categoryProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                        {categoryProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={transformProductForCard(product)}
                                hoveredProduct={hoveredProduct}
                                imageIndex={imageIndex}
                                handleMouseEnter={handleMouseEnter}
                                handleMouseLeave={handleMouseLeave}
                                handleProductClick={handleProductClick}
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
                                : selectedSubcategory
                                    ? `No products in this subcategory`
                                    : `No products available in ${category.name} category`
                            }
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedSubcategory(null);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base"
                        >
                            View All Products
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;