import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from "../../context/CartContext";
import ProductsComponent from '../../components/Products/ProductsComponent';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductDetailsPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart, openCart } = useCart();

    // State management
    const [product, setProduct] = useState(null);
    const [category, setCategory] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [error, setError] = useState(null);

    // Fetch product data when productId changes
    useEffect(() => {
        fetchProductData();
    }, [productId]);

    // Fetch related products when product category is available
    useEffect(() => {
        if (product?.categoryId) {
            fetchRelatedProducts();
        }
    }, [product?.categoryId]);

    const fetchProductData = async () => {
        try {
            setLoading(true);
            setError(null);

            let productData = null;

            // Try multiple methods to find the product
            // Method 1: Try as numericId first (since your URLs likely use numericId)
            try {
                const numericIdResponse = await axios.get(`${API_URL}/products/by-numeric-id/${productId}`);
                if (numericIdResponse.data.success && numericIdResponse.data.product) {
                    productData = numericIdResponse.data.product;
                }
            } catch (numericIdErr) {
                // Endpoint might not exist, continue to next method
                console.log('Numeric ID endpoint not available, trying other methods...');
            }

            // Method 2: Try as regular ID (could be _id or numericId)
            if (!productData) {
                try {
                    const productResponse = await axios.get(`${API_URL}/products/${productId}`);
                    if (productResponse.data.success && productResponse.data.product) {
                        productData = productResponse.data.product;
                    }
                } catch (productErr) {
                    console.log('Regular ID fetch failed:', productErr.message);
                }
            }

            // Method 3: Try fetching all products and filtering
            if (!productData) {
                try {
                    const allProductsResponse = await axios.get(`${API_URL}/products`);
                    if (allProductsResponse.data.success) {
                        const allProducts = allProductsResponse.data.products || [];

                        // Try to find by numericId
                        productData = allProducts.find(p =>
                            p.numericId === parseInt(productId) ||
                            p._id === productId
                        );

                        if (!productData) {
                            // Try case-insensitive name match as last resort
                            productData = allProducts.find(p =>
                                p.name.toLowerCase().includes(productId.toLowerCase())
                            );
                        }
                    }
                } catch (allProductsErr) {
                    console.log('Fetch all products failed:', allProductsErr.message);
                }
            }

            if (!productData) {
                throw new Error('Product not found');
            }

            setProduct(productData);

            // Fetch category if available
            if (productData.categoryId) {
                try {
                    // Check if categoryId is an object or string
                    const categoryIdToFetch = productData.categoryId._id || productData.categoryId;

                    const categoryResponse = await axios.get(`${API_URL}/categories/${categoryIdToFetch}`);
                    if (categoryResponse.data.success && categoryResponse.data.category) {
                        setCategory(categoryResponse.data.category);
                    }
                } catch (categoryError) {
                    console.error('Error fetching category:', categoryError.message);
                    // If categoryId is already populated, use it directly
                    if (productData.categoryId && typeof productData.categoryId === 'object') {
                        setCategory(productData.categoryId);
                    }
                }
            }

        } catch (err) {
            console.error('Error fetching product:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async () => {
        try {
            setLoadingRelated(true);

            // Get category ID for filtering
            const categoryId = product.categoryId?._id || product.categoryId;

            if (!categoryId) {
                setRelatedProducts([]);
                return;
            }

            // Fetch products by category, excluding current product
            const response = await axios.get(`${API_URL}/products/category/${categoryId}`);

            if (response.data.success) {
                const products = response.data.products || [];

                // Filter out current product and limit to 4
                const filtered = products
                    .filter(p => {
                        const isCurrentProduct =
                            p._id === product._id ||
                            p.numericId === product.numericId ||
                            p._id === productId ||
                            p.numericId === parseInt(productId);
                        return !isCurrentProduct;
                    })
                    .slice(0, 4);

                setRelatedProducts(filtered);
            }
        } catch (err) {
            console.error('Error fetching related products:', err);
            setRelatedProducts([]);
        } finally {
            setLoadingRelated(false);
        }
    };

    // Event handlers
    const handleAddToCart = () => {
        if (!product) return;

        // Prepare product data for cart
        const cartProduct = {
            id: product.numericId || product._id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            image: product.images?.[0] || '',
            unit: product.unitType || 'piece',
            minOrder: product.inventory?.moq || 1,
            inStock: (product.status === 'published' || product.inStock === true) &&
                (product.inventory?.stock || product.quantity || 0) > 0
        };

        addToCart(cartProduct, quantity);
        openCart();
        alert(`Added ${quantity} ${cartProduct.unit}(s) of ${product.name} to cart!`);
    };

    const handleBuyNow = () => {
        if (!product) return;

        const cartProduct = {
            id: product.numericId || product._id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            image: product.images?.[0] || '',
            unit: product.unitType || 'piece',
            minOrder: product.inventory?.moq || 1,
            inStock: (product.status === 'published' || product.inStock === true) &&
                (product.inventory?.stock || product.quantity || 0) > 0
        };

        addToCart(cartProduct, quantity);
        navigate('/cart');
    };

    // Color mapping utility
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

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700">Loading Product...</h2>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
                    <div className="space-y-4">
                        <Link to="/" className="block text-blue-600 hover:text-blue-800 font-semibold">
                            ← Back to Home
                        </Link>
                        <Link to="/products" className="block text-blue-600 hover:text-blue-800 font-semibold">
                            Browse All Products →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const colorClass = category ? getColorClasses(category.color) : getColorClasses('blue');
    const isInStock = (product.status === 'published' || product.inStock === true) &&
        (product.inventory?.stock || product.quantity || 0) > 0;
    const minOrder = product.inventory?.moq || product.minOrder || 1;
    const discount = product.discount || 0;
    const stockQuantity = product.inventory?.stock || product.quantity || 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb Navigation */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center text-sm text-gray-600 flex-wrap">
                        <Link to="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <Link to="/products" className="hover:text-blue-600">Products</Link>
                        {category && (
                            <>
                                <span className="mx-2">/</span>
                                <Link
                                    to={`/products/category/${category._id || category.numericId}`}
                                    className="hover:text-blue-600"
                                >
                                    {category.name}
                                </Link>
                            </>
                        )}
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium truncate max-w-xs md:max-w-md">
                            {product.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="md:flex">
                        {/* Left Column - Product Images */}
                        <div className="md:w-1/2 p-6">
                            {/* Main Image */}
                            <div className="mb-6">
                                <div className="relative h-96 rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={product.images?.[selectedImage] || product.image || 'https://via.placeholder.com/600x400?text=Product+Image'}
                                        alt={product.name}
                                        className="w-full h-full object-contain bg-white p-4"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/600x400?text=Product+Image';
                                        }}
                                    />
                                    {discount > 0 && (
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-lg shadow-lg">
                                                <div className="font-bold text-2xl">{discount}%</div>
                                                <div className="text-sm">OFF</div>
                                            </div>
                                        </div>
                                    )}
                                    {!isInStock && (
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg">
                                                <div className="font-bold text-sm">OUT OF STOCK</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnail Images */}
                            {product.images && product.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-4">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${selectedImage === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/80x80?text=Image';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Product Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {product.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column - Product Details */}
                        <div className="md:w-1/2 p-6">
                            {/* Category & Brand */}
                            <div className="flex items-center gap-3 mb-4">
                                {category && (
                                    <Link
                                        to={`/products/category/${category._id || category.numericId}`}
                                        className={`${colorClass.bg} ${colorClass.text} px-4 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition`}
                                    >
                                        {category.icon && <span className="mr-1">{category.icon}</span>}
                                        {category.name}
                                    </Link>
                                )}
                                {product.brand && (
                                    <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold text-sm">
                                        {product.brand}
                                    </div>
                                )}
                            </div>

                            {/* Product Name */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

                            {/* Stock Status */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center text-green-600 font-medium">
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {isInStock ? 'In Stock' : 'Out of Stock'}
                                </div>
                                {product.rating && (
                                    <div className="flex items-center">
                                        <div className="flex text-yellow-400 text-lg mr-2">
                                            {'★'.repeat(Math.floor(product.rating))}
                                            {'☆'.repeat(5 - Math.floor(product.rating))}
                                        </div>
                                        <span className="text-gray-700 font-bold">{product.rating}</span>
                                    </div>
                                )}
                            </div>

                            {/* Price Section */}
                            <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-end gap-4 mb-2">
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-bold text-gray-900">
                                            ₹{product.price.toLocaleString()}
                                        </span>
                                        <span className="text-gray-500 text-xl ml-2">/{product.unitType || 'piece'}</span>
                                    </div>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <>
                                            <span className="text-gray-500 text-xl line-through">
                                                ₹{product.originalPrice.toLocaleString()}
                                            </span>
                                            {discount > 0 && (
                                                <span className="text-green-600 font-bold text-xl">
                                                    Save {discount}%
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="text-gray-600">
                                    Min. Order: {minOrder} {product.unitType || 'piece'}(s)
                                </div>
                                {stockQuantity > 0 && (
                                    <div className="text-gray-600 mt-1">
                                        Available: {stockQuantity} {product.unitType || 'piece'}(s)
                                    </div>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            <div className="mb-8">
                                <label className="block text-gray-700 font-medium mb-3 text-lg">Quantity:</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(minOrder, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={quantity <= minOrder || !isInStock}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min={minOrder}
                                            max={stockQuantity}
                                            value={quantity}
                                            onChange={(e) => {
                                                const value = Math.max(
                                                    minOrder,
                                                    Math.min(stockQuantity, parseInt(e.target.value) || minOrder)
                                                );
                                                setQuantity(value);
                                            }}
                                            className="w-20 text-center text-xl font-bold border-x border-gray-300 py-3"
                                            disabled={!isInStock}
                                        />
                                        <button
                                            onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                                            className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!isInStock || quantity >= stockQuantity}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-gray-600 text-lg">
                                        {product.unitType || 'piece'}(s)
                                    </span>
                                </div>
                                <div className="text-gray-500 text-sm mt-2">
                                    Minimum order quantity is {minOrder} {product.unitType || 'piece'}(s)
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!isInStock}
                                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center ${isInStock
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={!isInStock}
                                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center ${isInStock
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Buy Now
                                </button>
                            </div>

                            {/* Product Info Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {(product.warranty?.duration || product.warranty) && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center text-blue-600 mb-2">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <span className="font-medium">Warranty</span>
                                        </div>
                                        <span className="text-gray-700">
                                            {product.warranty.duration || product.warranty}
                                        </span>
                                    </div>
                                )}

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center text-green-600 mb-2">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="font-medium">Delivery</span>
                                    </div>
                                    <span className="text-gray-700">
                                        {product.deliveryTime || 'Standard Delivery'}
                                    </span>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="flex items-center text-purple-600 mb-2">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <span className="font-medium">Stock</span>
                                    </div>
                                    <span className="text-gray-700">{stockQuantity} units</span>
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <div className="flex items-center text-yellow-600 mb-2">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">Support</span>
                                    </div>
                                    <span className="text-gray-700">24/7 Available</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Information Tabs */}
                    <div className="border-t border-gray-200">
                        <div className="px-6">
                            {/* Tab Navigation */}
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`px-6 py-4 font-medium text-lg ${activeTab === 'description'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Description
                                </button>
                                <button
                                    onClick={() => setActiveTab('specifications')}
                                    className={`px-6 py-4 font-medium text-lg ${activeTab === 'specifications'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Specifications
                                </button>
                                {(product.features || product.application) && (
                                    <button
                                        onClick={() => setActiveTab('features')}
                                        className={`px-6 py-4 font-medium text-lg ${activeTab === 'features'
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Features
                                    </button>
                                )}
                            </div>

                            {/* Tab Content */}
                            <div className="py-8">
                                {activeTab === 'description' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h3>
                                        <div className="prose max-w-none">
                                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                                {product.description || 'No description available.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'specifications' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
                                        <div className="bg-gray-50 rounded-xl overflow-hidden">
                                            <table className="w-full">
                                                <tbody>
                                                    <tr className="bg-white">
                                                        <td className="px-6 py-4 text-gray-700 font-medium border-r border-gray-200 w-1/3">
                                                            Material Type
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            {product.materialType || 'Not specified'}
                                                        </td>
                                                    </tr>

                                                    <tr className="bg-gray-50">
                                                        <td className="px-6 py-4 text-gray-700 font-medium border-r border-gray-200">
                                                            Grade
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            {product.grade || 'Not specified'}
                                                        </td>
                                                    </tr>

                                                    {product.technicalSpecs && Object.entries(product.technicalSpecs).map(([key, value], index) => {
                                                        if (value === undefined || value === null || value === false) return null;

                                                        const label = key
                                                            .replace(/([A-Z])/g, ' $1')
                                                            .replace(/^./, str => str.toUpperCase());

                                                        return (
                                                            <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <td className="px-6 py-4 text-gray-700 font-medium border-r border-gray-200">
                                                                    {label}
                                                                </td>
                                                                <td className="px-6 py-4 text-gray-600">
                                                                    {typeof value === 'boolean' ? 'Yes' : value}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}

                                                    <tr className={Object.keys(product.technicalSpecs || {}).filter(k => product.technicalSpecs[k]).length % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-6 py-4 text-gray-700 font-medium border-r border-gray-200">
                                                            Brand
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            {product.brand || 'Not specified'}
                                                        </td>
                                                    </tr>

                                                    <tr className={Object.keys(product.technicalSpecs || {}).filter(k => product.technicalSpecs[k]).length % 2 === 1 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-6 py-4 text-gray-700 font-medium border-r border-gray-200">
                                                            Unit Type
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            {product.unitType || 'piece'}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'features' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Features</h3>

                                        {product.features && product.features.length > 0 && (
                                            <div className="mb-8">
                                                <h4 className="text-xl font-bold text-gray-900 mb-4">Key Features</h4>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {product.features.map((feature, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="text-gray-700">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {product.application && product.application.length > 0 && (
                                            <div className="mb-8">
                                                <h4 className="text-xl font-bold text-gray-900 mb-4">Application Areas</h4>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {product.application.map((app, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <svg className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                            </svg>
                                                            <span className="text-gray-700">{app}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {product.certifications && product.certifications.length > 0 && (
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900 mb-4">Certifications</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {product.certifications.map((cert, index) => (
                                                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                            {cert}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {(relatedProducts.length > 0 || loadingRelated) && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                            {category && (
                                <Link
                                    to={`/products/category/${category._id || category.numericId}`}
                                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                                >
                                    View All
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            )}
                        </div>

                        {loadingRelated ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading related products...</p>
                            </div>
                        ) : (
                            <ProductsComponent
                                title=""
                                showFilters={false}
                                categoryColor="blue"
                                products={relatedProducts}
                                hideTitle={true}
                                gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsPage;