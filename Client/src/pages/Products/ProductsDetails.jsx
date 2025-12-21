import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from "../../context/CartContext";
import ProductsComponent from '../../components/Products/ProductsComponent';
import axios from 'axios';
import {
    ShoppingCart,
    Package,
    Shield,
    Truck,
    Clock,
    Star,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Heart,
    Share2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-com-backend.vercel.app/api';

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
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // Skeleton loading states
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

            // Method 1: Try numericId endpoint
            try {
                const numericIdResponse = await axios.get(`${API_URL}/products/by-numeric-id/${productId}`);
                if (numericIdResponse.data.success && numericIdResponse.data.product) {
                    productData = numericIdResponse.data.product;
                }
            } catch (numericIdErr) {
                console.log('Numeric ID endpoint not available, trying other methods...');
            }

            // Method 2: Try regular ID endpoint
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

            // Method 3: Try fetching all products
            if (!productData) {
                try {
                    const allProductsResponse = await axios.get(`${API_URL}/products`);
                    if (allProductsResponse.data.success) {
                        const allProducts = allProductsResponse.data.products || [];

                        productData = allProducts.find(p =>
                            p.numericId === parseInt(productId) ||
                            p._id === productId ||
                            p.slug === productId
                        );

                        if (!productData) {
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
                    const categoryIdToFetch = productData.categoryId._id || productData.categoryId;
                    const categoryResponse = await axios.get(`${API_URL}/categories/${categoryIdToFetch}`);

                    if (categoryResponse.data.success && categoryResponse.data.category) {
                        setCategory(categoryResponse.data.category);
                    }
                } catch (categoryError) {
                    console.error('Error fetching category:', categoryError.message);
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
            const categoryId = product.categoryId?._id || product.categoryId;

            if (!categoryId) {
                setRelatedProducts([]);
                return;
            }

            const response = await axios.get(`${API_URL}/products/category/${categoryId}`);

            if (response.data.success) {
                const products = response.data.products || [];
                const filtered = products
                    .filter(p => p._id !== product._id)
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

    const handleAddToCart = () => {
        if (!product) return;

        const cartProduct = {
            id: product._id,
            numericId: product.numericId,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            image: product.images?.[0] || '',
            unit: product.unitType || 'piece',
            minOrder: product.inventory?.moq || 1,
            sellerId: product.sellerId,
            inStock: product.status === 'published' && (product.inventory?.stock || 0) > 0
        };

        addToCart(cartProduct, quantity);
        openCart();

        // Toast notification would be better here
        showNotification(`${quantity} ${cartProduct.unit}(s) of ${product.name} added to cart`);
    };

    const handleBuyNow = () => {
        if (!product) return;

        const cartProduct = {
            id: product._id,
            numericId: product.numericId,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            image: product.images?.[0] || '',
            unit: product.unitType || 'piece',
            minOrder: product.inventory?.moq || 1,
            sellerId: product.sellerId,
            inStock: product.status === 'published' && (product.inventory?.stock || 0) > 0
        };

        addToCart(cartProduct, quantity);
        navigate('/checkout');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `Check out ${product.name} on Bricks.com`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            setShowShareModal(true);
        }
    };

    const showNotification = (message) => {
        // You can integrate a toast notification library here
        alert(message); // Temporary solution
    };

    // Skeleton Loading Component
    const SkeletonLoader = () => (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb Skeleton */}
            <div className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center">
                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                {i < 3 && <div className="mx-2 h-4 w-4 bg-gray-200 rounded"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="md:flex">
                        {/* Image Gallery Skeleton */}
                        <div className="md:w-1/2 p-8">
                            <div className="mb-6">
                                <div className="relative h-[500px] rounded-xl overflow-hidden bg-gray-200 animate-pulse"></div>
                            </div>
                            <div className="flex gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-20 h-20 rounded-lg bg-gray-200 animate-pulse"></div>
                                ))}
                            </div>
                        </div>

                        {/* Product Info Skeleton */}
                        <div className="md:w-1/2 p-8">
                            <div className="flex gap-3 mb-6">
                                <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                            </div>

                            <div className="h-12 w-3/4 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                                <div className="h-10 w-40 bg-gray-300 rounded-lg mb-4 animate-pulse"></div>
                                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            <div className="mb-8">
                                <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-40 bg-gray-200 rounded-xl animate-pulse"></div>
                                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>

                            <div className="flex gap-4 mb-8">
                                <div className="flex-1 h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                                <div className="flex-1 h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tabs Skeleton */}
                    <div className="border-t border-gray-200 px-8 pt-8">
                        <div className="flex gap-8 mb-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                        <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Error state
    if (error || (!loading && !product)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Product Not Found</h2>
                    <p className="text-gray-600 mb-8">{error || "The product you're looking for doesn't exist or has been removed."}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition duration-200"
                        >
                            Go Back
                        </button>
                        <Link
                            to="/products"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return <SkeletonLoader />;
    }

    // Calculate product details
    const isInStock = product.status === 'published' && (product.inventory?.stock || 0) > 0;
    const minOrder = product.inventory?.moq || 1;
    const discount = product.discount || 0;
    const stockQuantity = product.inventory?.stock || 0;
    const rating = product.rating || 4.5;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Enhanced Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center text-sm" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            <li>
                                <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <li>
                                <Link to="/products" className="text-gray-500 hover:text-blue-600 transition-colors">
                                    Products
                                </Link>
                            </li>
                            {category && (
                                <>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                    <li>
                                        <Link
                                            to={`/products/category/${category._id || category.numericId}`}
                                            className="text-gray-500 hover:text-blue-600 transition-colors"
                                        >
                                            {category.name}
                                        </Link>
                                    </li>
                                </>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <li className="text-gray-900 font-medium truncate max-w-xs">
                                {product.name}
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="md:flex">
                        {/* Left Column - Enhanced Image Gallery */}
                        <div className="md:w-1/2 p-6 md:p-8">
                            {/* Main Image with Zoom Effect */}
                            <div className="mb-6">
                                <div className="relative h-[500px] rounded-xl overflow-hidden border border-gray-200 group">
                                    <img
                                        src={product.images?.[selectedImage] || 'https://via.placeholder.com/600x400?text=Product+Image'}
                                        alt={product.name}
                                        className="w-full h-full object-contain bg-white p-8 group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/600x400?text=Product+Image';
                                        }}
                                    />

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {discount > 0 && (
                                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg">
                                                <div className="font-bold text-lg">{discount}% OFF</div>
                                            </div>
                                        )}
                                        {!isInStock && (
                                            <div className="bg-gray-800/90 text-white px-4 py-2 rounded-lg">
                                                <div className="font-bold text-sm">OUT OF STOCK</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons on Image */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                                        <button
                                            onClick={() => setIsWishlisted(!isWishlisted)}
                                            className={`p-2 rounded-full ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-600 hover:text-red-500'} shadow-lg transition-colors`}
                                        >
                                            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="p-2 rounded-full bg-white/90 text-gray-600 hover:text-blue-600 shadow-lg transition-colors"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail Gallery */}
                            {product.images && product.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-4">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all duration-200 ${selectedImage === index
                                                ? 'border-blue-500 ring-2 ring-blue-100 scale-105'
                                                : 'border-gray-200 hover:border-gray-300'
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
                        </div>

                        {/* Right Column - Enhanced Product Details */}
                        <div className="md:w-1/2 p-6 md:p-8">
                            {/* Category & Brand */}
                            <div className="flex items-center gap-3 mb-6">
                                {category && (
                                    <Link
                                        to={`/products/category/${category._id || category.numericId}`}
                                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium text-sm hover:bg-blue-100 transition-colors"
                                    >
                                        {category.icon && <span>{category.icon}</span>}
                                        {category.name}
                                    </Link>
                                )}
                                {product.brand && (
                                    <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-medium text-sm">
                                        {product.brand}
                                    </div>
                                )}
                            </div>

                            {/* Product Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                {product.name}
                            </h1>

                            {/* Rating & Stock Status */}
                            <div className="flex items-center gap-6 mb-8">
                                <div className="flex items-center">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="ml-2 text-gray-700 font-bold">{rating}</span>
                                    <span className="ml-1 text-gray-500">({product.reviewCount || 0} reviews)</span>
                                </div>
                                <div className={`flex items-center ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                                    {isInStock ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-1" />
                                            <span className="font-medium">In Stock</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-5 h-5 mr-1" />
                                            <span className="font-medium">Out of Stock</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                                <div className="flex items-end gap-4 mb-4">
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-bold text-gray-900">
                                            ₹{product.price.toLocaleString()}
                                        </span>
                                        <span className="text-gray-500 text-lg ml-2">/{product.unitType || 'piece'}</span>
                                    </div>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <>
                                            <span className="text-gray-400 text-xl line-through">
                                                ₹{product.originalPrice.toLocaleString()}
                                            </span>
                                            <span className="text-green-600 font-bold text-lg bg-green-50 px-3 py-1 rounded-full">
                                                Save {discount}%
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="text-gray-600">
                                        <Package className="inline w-4 h-4 mr-2" />
                                        Min. Order: <span className="font-semibold">{minOrder} {product.unitType || 'piece'}(s)</span>
                                    </div>
                                    {stockQuantity > 0 && (
                                        <div className="text-gray-600">
                                            Available: <span className="font-semibold">{stockQuantity.toLocaleString()} units</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="mb-8">
                                <label className="block text-gray-700 font-medium mb-4 text-lg">Select Quantity</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(minOrder, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 text-xl font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
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
                                            className="w-20 text-center text-xl font-bold border-x border-gray-200 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={!isInStock}
                                        />
                                        <button
                                            onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                                            className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 text-xl font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                            disabled={!isInStock || quantity >= stockQuantity}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-gray-600">
                                            Total: <span className="font-bold text-xl text-gray-900">₹{(product.price * quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!isInStock}
                                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center ${isInStock
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <ShoppingCart className="w-6 h-6 mr-3" />
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={!isInStock}
                                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center ${isInStock
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Package className="w-6 h-6 mr-3" />
                                    Buy Now
                                </button>
                            </div>

                            {/* Product Highlights */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {product.warranty && (
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                                        <div className="flex items-center text-blue-700 mb-2">
                                            <Shield className="w-5 h-5 mr-2" />
                                            <span className="font-semibold">Warranty</span>
                                        </div>
                                        <span className="text-gray-800">
                                            {product.warranty.duration || product.warranty}
                                        </span>
                                    </div>
                                )}

                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                                    <div className="flex items-center text-green-700 mb-2">
                                        <Truck className="w-5 h-5 mr-2" />
                                        <span className="font-semibold">Delivery</span>
                                    </div>
                                    <span className="text-gray-800">
                                        {product.deliveryTime || '2-5 Business Days'}
                                    </span>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                                    <div className="flex items-center text-purple-700 mb-2">
                                        <Package className="w-5 h-5 mr-2" />
                                        <span className="font-semibold">Stock Status</span>
                                    </div>
                                    <span className="text-gray-800 font-medium">
                                        {stockQuantity.toLocaleString()} units
                                    </span>
                                </div>

                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl">
                                    <div className="flex items-center text-amber-700 mb-2">
                                        <Clock className="w-5 h-5 mr-2" />
                                        <span className="font-semibold">Support</span>
                                    </div>
                                    <span className="text-gray-800">24/7 Available</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Information Tabs */}
                    <div className="border-t border-gray-100">
                        <div className="px-6 md:px-8">
                            {/* Tab Navigation */}
                            <div className="flex border-b border-gray-100">
                                {['description', 'specifications', 'features'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-4 font-medium text-lg capitalize transition-colors ${activeTab === tab
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="py-8">
                                {activeTab === 'description' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h3>
                                        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                                            <p>{product.description || 'No description available.'}</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'specifications' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 overflow-hidden">
                                            <div className="divide-y divide-gray-100">
                                                {[
                                                    ['Material Type', product.materialType || 'Not specified'],
                                                    ['Grade', product.grade || 'Not specified'],
                                                    ['Brand', product.brand || 'Not specified'],
                                                    ['Unit Type', product.unitType || 'piece'],
                                                    ...(product.technicalSpecs ? Object.entries(product.technicalSpecs).filter(([_, value]) => value) : [])
                                                ].map(([label, value], index) => (
                                                    <div key={index} className="flex items-center px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                                        <div className="w-1/3 text-gray-700 font-medium">{label}</div>
                                                        <div className="w-2/3 text-gray-600">
                                                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'features' && (
                                    <div className="space-y-8">
                                        {product.features && product.features.length > 0 && (
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900 mb-4">Key Features</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {product.features.map((feature, index) => (
                                                        <div key={index} className="flex items-start p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100">
                                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                                            <span className="text-gray-700">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {product.application && product.application.length > 0 && (
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900 mb-4">Application Areas</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {product.application.map((app, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium"
                                                        >
                                                            {app}
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

                {/* Related Products Section */}
                {(relatedProducts.length > 0 || loadingRelated) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                                <p className="text-gray-600 mt-2">Similar products you might like</p>
                            </div>
                            {category && (
                                <Link
                                    to={`/products/category/${category._id || category.numericId}`}
                                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center group"
                                >
                                    View All
                                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>

                        {loadingRelated ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-gray-100 rounded-xl animate-pulse h-64"></div>
                                ))}
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

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Share Product</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    showNotification('Link copied to clipboard!');
                                    setShowShareModal(false);
                                }}
                                className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                            >
                                Copy Link
                            </button>
                            <button
                                onClick={() => {
                                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out ${product.name}`)}`, '_blank');
                                    setShowShareModal(false);
                                }}
                                className="w-full p-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                            >
                                Share on Twitter
                            </button>
                        </div>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full mt-4 p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailsPage;