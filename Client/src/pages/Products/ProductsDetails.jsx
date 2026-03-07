import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ProductsComponent from "../../components/Products/ProductsComponent";
import axios from "axios";
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
  Calendar,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://bricks-backend-qyea.onrender.com/api";

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
  const [activeTab, setActiveTab] = useState("overview");
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
        `${API_URL}/products/slug/${productId}`,
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
        throw new Error("Product not found");
      }

      setProduct(productData);

      // Fetch category data
      if (productData.categoryId) {
        fetchCategory(productData.categoryId);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load product",
      );
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
      console.error("Error fetching category:", err);
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

      const response = await axios.get(
        `${API_URL}/products/category/${categoryId}?limit=4`,
      );
      if (response.data.success) {
        const products = response.data.products || [];
        const filtered = products.filter((p) => p._id !== product._id);
        setRelatedProducts(filtered);
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
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
      image: product.images?.[0] || "",
      unit: product.unitType || "piece",
      minOrder: product.inventory?.moq || 1,
      sellerId: product.sellerId,
      inStock:
        product.status === "published" && (product.inventory?.stock || 0) > 0,
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
      image: product.images?.[0] || "",
      unit: product.unitType || "piece",
      minOrder: product.inventory?.moq || 1,
      sellerId: product.sellerId,
      inStock:
        product.status === "published" && (product.inventory?.stock || 0) > 0,
    };

    addToCart(cartProduct, quantity);
    navigate("/checkout");
  };

  const showNotification = (message) => {
    // Implement your toast notification here
    alert(message); // Temporary
  };

  // Image handling function
  const getImageUrl = (imageUrl) => {
    if (!imageUrl)
      return "https://via.placeholder.com/600x400?text=Product+Image";

    // Check if it's a full URL
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // Check if it's a relative path starting with /
    if (imageUrl.startsWith("/")) {
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
                  <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded-xl w-3/4"></div>
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
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-orange-50 rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Go Back
            </button>
            <Link
              to="/products"
              className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition shadow-sm hover:shadow"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <SkeletonLoader />;

  // Product details
  const isInStock =
    product.status === "published" && (product.inventory?.stock || 0) > 0;
  const minOrder = product.inventory?.moq || 1;
  const stockQuantity = product.inventory?.stock || 0;
  const discount = product.discount || 0;
  const hasDiscount = discount > 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 flex-wrap gap-2">
            <Link to="/" className="hover:text-orange-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/products" className="hover:text-orange-600 transition-colors">
              Products
            </Link>
            {category && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link
                  to={`/products/category/${category._id || category.numericId}`}
                  className="hover:text-orange-600 transition-colors capitalize"
                >
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[180px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div
              className={`relative aspect-[4/3] lg:aspect-square rounded-2xl border border-gray-200 bg-white overflow-hidden cursor-zoom-in ${
                zoomImage ? "cursor-zoom-out scale-110" : ""
              } transition-transform duration-300`}
              onClick={() => setZoomImage(!zoomImage)}
            >
              <img
                src={getImageUrl(product.images?.[selectedImage])}
                alt={product.name}
                className="w-full h-full object-contain p-6 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x600?text=Product";
                }}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="bg-orange-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    {discount}% OFF
                  </span>
                )}
                {!isInStock && (
                  <span className="bg-gray-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg">
                    OUT OF STOCK
                  </span>
                )}
              </div>

              {/* Wishlist & Share */}
              <div className="absolute top-4 right-4 flex flex-col gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWishlisted(!isWishlisted);
                  }}
                  className={`p-3 rounded-full bg-white/90 shadow-sm hover:bg-white transition ${
                    isWishlisted ? "text-red-500" : "text-gray-600 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareModal(true);
                  }}
                  className="p-3 rounded-full bg-white/90 shadow-sm hover:bg-white transition text-gray-600 hover:text-orange-600"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all snap-center ${
                      selectedImage === idx
                        ? "border-orange-500 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80?text=Img";
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
                <span className="inline-flex items-center px-4 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                  {category.name}
                </span>
              )}
              {product.brand && (
                <span className="inline-flex items-center px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {product.brand}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Stock & Rating */}
            <div className="flex flex-wrap items-center gap-6">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  isInStock
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {isInStock ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                {isInStock ? "In Stock" : "Out of Stock"}
              </div>

              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-700">
                    {product.rating} • {stockQuantity.toLocaleString()} units
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold text-gray-900">
                ₹{product.price?.toLocaleString() || "0"}
              </span>

              {hasDiscount && product.originalPrice && (
                <>
                  <span className="text-2xl text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {discount}% off
                  </span>
                </>
              )}
            </div>

            <div className="text-gray-600 text-lg">
              per {product.unitType?.toLowerCase() || "piece"}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500">Min. Order</div>
                <div className="font-bold text-gray-900 mt-1">
                  {minOrder} {product.unitType || "pcs"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500">Lead Time</div>
                <div className="font-bold text-gray-900 mt-1">
                  {product.leadTime || "2-5 days"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500">Grade</div>
                <div className="font-bold text-gray-900 mt-1">
                  {product.grade || "Premium"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500">MOQ</div>
                <div className="font-bold text-gray-900 mt-1">{minOrder}</div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="inline-flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(minOrder, quantity - 1))}
                      disabled={quantity <= minOrder || !isInStock}
                      className="px-5 py-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      −
                    </button>
                    <div className="w-16 flex items-center justify-center text-lg font-medium border-x border-gray-300">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                      disabled={!isInStock || quantity >= stockQuantity}
                      className="px-5 py-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-lg font-medium">
                    Total: <span className="font-bold">₹{(product.price * quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className={`flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm ${
                    isInStock
                      ? "bg-orange-600 hover:bg-orange-700 text-white hover:shadow-md"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                  className={`flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm ${
                    isInStock
                      ? "bg-orange-700 hover:bg-orange-800 text-white hover:shadow-md"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Zap className="w-6 h-6" />
                  Buy Now
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <ShieldCheck className="w-6 h-6 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900 text-sm">Secure Payment</div>
                  <div className="text-xs text-gray-500">SSL Encrypted</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Truck className="w-6 h-6 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900 text-sm">Fast Delivery</div>
                  <div className="text-xs text-gray-500">2-5 days</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                <CheckCircle className="w-6 h-6 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900 text-sm">Quality Assured</div>
                  <div className="text-xs text-gray-500">Premium Grade</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: Package },
                { id: "specifications", label: "Specifications", icon: TrendingUp },
                { id: "features", label: "Features", icon: Award },
                { id: "applications", label: "Applications", icon: Globe },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-orange-600 text-orange-600"
                        : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Overview</h3>
                <p className="leading-relaxed">
                  {product.description || "No detailed description available for this product."}
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-10">
                  {product.warranty && (
                    <div className="p-6 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-6 h-6 text-orange-600" />
                        <h4 className="font-bold text-gray-900">Warranty</h4>
                      </div>
                      <p className="text-gray-700">{product.warranty}</p>
                    </div>
                  )}
                  <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock3 className="w-6 h-6 text-green-600" />
                      <h4 className="font-bold text-gray-900">Lead Time</h4>
                    </div>
                    <p className="text-gray-700">
                      {product.leadTime || "Standard lead time applies"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900">Technical Specifications</h3>
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
                  {[
                    ["Material", product.materialType || "N/A"],
                    ["Grade", product.grade || "N/A"],
                    ["Brand", product.brand || "N/A"],
                    ["Unit Type", product.unitType || "Piece"],
                    ["Color", product.color || "N/A"],
                    ["Size", product.size || "N/A"],
                    ["Weight", product.weight || "N/A"],
                    ...(product.technicalSpecs
                      ? Object.entries(product.technicalSpecs)
                      : []),
                  ].map(([key, value], index) => (
                    <div
                      key={index}
                      className="flex px-6 py-4 hover:bg-white/50 transition-colors"
                    >
                      <div className="w-1/3 font-medium text-gray-700">{key}</div>
                      <div className="w-2/3 text-gray-600">
                        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900">Key Features</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {(product.features || []).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {(!product.features || product.features.length === 0) && (
                    <p className="text-gray-500 col-span-2">No specific features listed.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "applications" && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900">Applications</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(product.application || []).map((app, index) => (
                    <div
                      key={index}
                      className="p-5 bg-orange-50 rounded-xl border border-orange-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">{app}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Suitable for commercial and industrial projects
                      </p>
                    </div>
                  ))}
                  {(!product.application || product.application.length === 0) && (
                    <p className="text-gray-500 col-span-3">No application details available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Similar Products
                </h2>
                <p className="text-gray-600 mt-2">
                  You might also like these products
                </p>
              </div>
              {category && (
                <Link
                  to={`/products/category/${category._id}`}
                  className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 transition-colors"
                >
                  View all in {category.name}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingRelated
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-64 bg-gray-200 rounded-2xl mb-4"></div>
                      <div className="h-5 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))
                : relatedProducts.map((related) => (
                    <Link
                      key={related._id}
                      to={`/product/${related._id}`}
                      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-300"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                        <img
                          src={getImageUrl(related.images?.[0])}
                          alt={related.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400?text=Product";
                          }}
                        />
                        {related.discount > 0 && (
                          <span className="absolute top-3 left-3 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                            {related.discount}% OFF
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.75rem] group-hover:text-orange-700 transition-colors">
                          {related.name}
                        </h3>
                        <div className="flex items-baseline gap-2 mt-3">
                          <span className="text-xl font-bold text-gray-900">
                            ₹{related.price?.toLocaleString() || "0"}
                          </span>
                          {related.originalPrice && related.originalPrice > related.price && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{related.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Min. order: {related.inventory?.moq || 1} {related.unitType || "pcs"}
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-5">Share this Product</h3>
            <div className="space-y-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showNotification("Link copied!");
                  setShowShareModal(false);
                }}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                <Link className="w-5 h-5" /> Copy Link
              </button>

              <button
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      window.location.href
                    )}&text=${encodeURIComponent(`Check out ${product.name}`)}`,
                    "_blank"
                  );
                  setShowShareModal(false);
                }}
                className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" /> Share on X (Twitter)
              </button>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition mt-2"
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