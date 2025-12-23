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
    Share2,
    TrendingUp,
    Award,
    Users,
    Globe,
    Check,
    ArrowRight,
    Zap,
    Battery,
    ShieldCheck,
    Clock3,
    Calendar
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-backend-qyea.onrender.com/api';

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
    const [activeTab, setActiveTab] = useState('overview');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [zoomImage, setZoomImage] = useState(false);

    // Skeleton loading states
    const [loading, setLoading] = useState(true);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [error, setError] = useState(null);

    // Fetch product data
    useEffect(() => {
        fetchProductData();
    }, [productId]);

    // Fetch related products
    useEffect(() => {
        if (product?.categoryId) {
            fetchRelatedProducts();
        }
    }, [product?.categoryId]);

    const fetchProductData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try multiple endpoints for product fetching
            const endpoints = [
                `${API_URL}/products/by-numeric-id/${productId}`,
                `${API_URL}/products/${productId}`,
                `${API_URL}/products/slug/${productId}`
            ];

            let productData = null;

            for (const endpoint of endpoints) {
                try {
                    const response = await axios.get(endpoint);
                    if (response.data.success && response.data.product) {
                        productData = response.data.product;
                        break;
                    }
                } catch (err) {
                    continue;
                }
            }

            if (!productData) {
                throw new Error('Product not found');
            }

            setProduct(productData);

            // Fetch category data
            if (productData.categoryId) {
                fetchCategory(productData.categoryId);
            }

        } catch (err) {
            console.error('Error fetching product:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategory = async (categoryId) => {
        try {
            const id = categoryId._id || categoryId;
            const response = await axios.get(`${API_URL}/categories/${id}`);
            if (response.data.success && response.data.category) {
                setCategory(response.data.category);
            }
        } catch (err) {
            console.error('Error fetching category:', err);
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

            const response = await axios.get(`${API_URL}/products/category/${categoryId}?limit=4`);
            if (response.data.success) {
                const products = response.data.products || [];
                const filtered = products.filter(p => p._id !== product._id);
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
        showNotification(`${product.name} added to cart`);
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

    const showNotification = (message) => {
        // Implement your toast notification here
        alert(message); // Temporary
    };

    // Image handling function
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://via.placeholder.com/600x400?text=Product+Image';

        // Check if it's a full URL
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        // Check if it's a relative path starting with /
        if (imageUrl.startsWith('/')) {
            return `${API_URL}${imageUrl}`;
        }

        // Otherwise, assume it's already a full URL or needs base URL
        return imageUrl;
    };

    // Skeleton Loader
    const SkeletonLoader = () => (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-4 w-1/4 bg-gray-200 rounded mb-8"></div>
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="h-[500px] bg-gray-200 rounded-2xl"></div>
                            <div className="grid grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="h-12 bg-gray-200 rounded-lg w-3/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-20 bg-gray-200 rounded-xl"></div>
                            <div className="h-32 bg-gray-200 rounded-xl"></div>
                            <div className="h-12 bg-gray-200 rounded-xl w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Error State
    if (error || (!loading && !product)) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h2>
                    <p className="text-gray-600 mb-8">{error || "The product you're looking for doesn't exist."}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Go Back
                        </button>
                        <Link
                            to="/products"
                            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                        >
                            Browse Products
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <SkeletonLoader />;

    // Product details
    const isInStock = product.status === 'published' && (product.inventory?.stock || 0) > 0;
    const minOrder = product.inventory?.moq || 1;
    const stockQuantity = product.inventory?.stock || 0;
    const discount = product.discount || 0;
    const hasDiscount = discount > 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Breadcrumb */}
            <div className="border-b border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm">
                        <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link to="/products" className="text-gray-500 hover:text-blue-600 transition-colors">
                            Products
                        </Link>
                        {category && (
                            <>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <Link
                                    to={`/products/category/${category._id || category.numericId}`}
                                    className="text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    {category.name}
                                </Link>
                            </>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium truncate max-w-xs">
                            {product.name}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div>
                        {/* Main Image */}
                        <div
                            className={`relative h-[500px] rounded-2xl border border-gray-200 bg-white overflow-hidden ${zoomImage ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                            onClick={() => setZoomImage(!zoomImage)}
                        >
                            <img
                                src={getImageUrl(product.images?.[selectedImage])}
                                alt={product.name}
                                className={`w-full h-full object-contain p-4 transition-transform duration-500 ${zoomImage ? 'scale-150' : 'scale-100'}`}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/600x400?text=Product+Image';
                                }}
                            />

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {hasDiscount && (
                                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold">
                                        {discount}% OFF
                                    </div>
                                )}
                                {!isInStock && (
                                    <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                        OUT OF STOCK
                                    </div>
                                )}
                            </div>

                            {/* Image Actions */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsWishlisted(!isWishlisted);
                                    }}
                                    className={`p-3 rounded-full backdrop-blur-sm ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:text-red-500'} transition-colors`}
                                >
                                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowShareModal(true);
                                    }}
                                    className="p-3 rounded-full backdrop-blur-sm bg-white/80 text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-3 mt-6 overflow-x-auto pb-4">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${selectedImage === index
                                            ? 'border-blue-500 ring-2 ring-blue-100'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/80x80?text=Thumbnail';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        {/* Category & Brand */}
                        <div className="flex flex-wrap gap-3">
                            {category && (
                                <span className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    {category.name}
                                </span>
                            )}
                            {product.brand && (
                                <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                    {product.brand}
                                </span>
                            )}
                        </div>

                        {/* Product Title */}
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            {product.name}
                        </h1>

                        {/* Stock Status */}
                        <div className="flex items-center gap-4">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isInStock
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                                }`}>
                                {isInStock ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">In Stock</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="font-medium">Out of Stock</span>
                                    </>
                                )}
                            </div>
                            {isInStock && (
                                <span className="text-gray-600">
                                    {stockQuantity.toLocaleString()} units available
                                </span>
                            )}
                        </div>

                        {/* Price Section */}
                        <div className="space-y-4">
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-bold text-gray-900">
                                    ₹{product.price.toLocaleString()}
                                </span>
                                {hasDiscount && product.originalPrice && (
                                    <>
                                        <span className="text-2xl text-gray-400 line-through">
                                            ₹{product.originalPrice.toLocaleString()}
                                        </span>
                                        <span className="text-lg font-bold text-green-600">
                                            Save {discount}%
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="text-gray-600">
                                per {product.unitType || 'piece'}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="text-sm text-gray-500 mb-1">Min. Order</div>
                                <div className="font-bold text-gray-900">{minOrder} {product.unitType || 'pcs'}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="text-sm text-gray-500 mb-1">Delivery</div>
                                <div className="font-bold text-gray-900">{product.deliveryTime || '2-5 days'}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="text-sm text-gray-500 mb-1">Quality</div>
                                <div className="font-bold text-gray-900">{product.grade || 'Premium'}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="text-sm text-gray-500 mb-1">MOQ</div>
                                <div className="font-bold text-gray-900">{minOrder} units</div>
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-4">
                            <div className="font-medium text-gray-900">Quantity</div>
                            <div className="flex items-center gap-4">
                                <div className="inline-flex border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(minOrder, quantity - 1))}
                                        disabled={quantity <= minOrder || !isInStock}
                                        className="px-4 py-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="text"
                                        value={quantity}
                                        readOnly
                                        className="w-20 text-center text-lg font-medium border-x border-gray-300"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                                        disabled={!isInStock || quantity >= stockQuantity}
                                        className="px-4 py-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-lg">
                                    Total: <span className="font-bold">₹{(product.price * quantity).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={!isInStock}
                                className={`flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${isInStock
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={!isInStock}
                                className={`flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all ${isInStock
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <Zap className="w-5 h-5" />
                                Buy Now
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                <ShieldCheck className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="font-medium text-gray-900">Secure Payment</div>
                                    <div className="text-sm text-gray-600">SSL Encrypted</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                <Truck className="w-5 h-5 text-green-600" />
                                <div>
                                    <div className="font-medium text-gray-900">Free Shipping</div>
                                    <div className="text-sm text-gray-600">Over ₹10,000</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-100">
                        <div className="flex">
                            {[
                                { id: 'overview', label: 'Overview', icon: Package },
                                { id: 'specifications', label: 'Specifications', icon: TrendingUp },
                                { id: 'features', label: 'Features', icon: Award },
                                { id: 'applications', label: 'Applications', icon: Globe }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-8 py-4 font-medium transition-colors ${activeTab === tab.id
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-gray-900">Product Overview</h3>
                                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                                    {product.description || 'No description available.'}
                                </div>
                                <div className="grid md:grid-cols-2 gap-6 mt-8">
                                    {product.warranty && (
                                        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Shield className="w-6 h-6 text-blue-600" />
                                                <h4 className="font-bold text-gray-900">Warranty</h4>
                                            </div>
                                            <p className="text-gray-700">{product.warranty}</p>
                                        </div>
                                    )}
                                    <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Clock3 className="w-6 h-6 text-green-600" />
                                            <h4 className="font-bold text-gray-900">Lead Time</h4>
                                        </div>
                                        <p className="text-gray-700">{product.leadTime || 'Standard lead time applies'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'specifications' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-gray-900">Technical Specifications</h3>
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="divide-y divide-gray-100">
                                        {[
                                            ['Material', product.materialType || 'N/A'],
                                            ['Grade', product.grade || 'N/A'],
                                            ['Brand', product.brand || 'N/A'],
                                            ['Unit Type', product.unitType || 'Piece'],
                                            ['Color', product.color || 'N/A'],
                                            ['Size', product.size || 'N/A'],
                                            ['Weight', product.weight || 'N/A'],
                                            ...(product.technicalSpecs ? Object.entries(product.technicalSpecs) : [])
                                        ].map(([key, value], index) => (
                                            <div key={index} className="flex items-center px-6 py-4 hover:bg-gray-50/50">
                                                <div className="w-1/3 text-gray-700 font-medium">{key}</div>
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
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-gray-900">Key Features</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {(product.features || []).map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'applications' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-gray-900">Applications</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(product.application || []).map((app, index) => (
                                        <div key={index} className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="font-medium text-gray-900">{app}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Ideal for commercial and industrial use</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Similar Products</h2>
                                <p className="text-gray-600 mt-2">Products you might be interested in</p>
                            </div>
                            {category && (
                                <Link
                                    to={`/products/category/${category._id}`}
                                    className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                                >
                                    View all in {category.name}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {loadingRelated ? (
                                // Loading skeleton for related products
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))
                            ) : (
                                relatedProducts.map((relatedProduct) => (
                                    <div key={relatedProduct._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                        <Link to={`/product/${relatedProduct._id}`}>
                                            <div className="relative h-48 overflow-hidden bg-gray-100">
                                                <img
                                                    src={getImageUrl(relatedProduct.images?.[0])}
                                                    alt={relatedProduct.name}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/400x300?text=Product';
                                                    }}
                                                />
                                                {relatedProduct.discount > 0 && (
                                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                        {relatedProduct.discount}% OFF
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                                    {relatedProduct.name}
                                                </h3>
                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        ₹{relatedProduct.price?.toLocaleString() || '0'}
                                                    </span>
                                                    {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                                                        <span className="text-sm text-gray-500 line-through">
                                                            ₹{relatedProduct.originalPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Min. order: {relatedProduct.inventory?.moq || 1} {relatedProduct.unitType || 'pcs'}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
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
                                className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium transition-colors"
                            >
                                Copy Link
                            </button>
                            <button
                                onClick={() => {
                                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out ${product.name}`)}`, '_blank');
                                    setShowShareModal(false);
                                }}
                                className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                            >
                                Share on Twitter
                            </button>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="w-full p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors mt-4"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailsPage;