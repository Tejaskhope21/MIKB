import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
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
  ShieldCheck,
  Clock3,
  Calendar,
  Info,
  Ruler,
  Weight,
  Palette,
  Layers,
  Building2,
  Factory,
  Store,
  Home,
  Building,
  Warehouse,
  CreditCard,
  RefreshCw,
  MessageCircle,
  Phone,
  Mail,
  Download,
  Printer,
  Eye,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  X,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  FileText,
  Settings,
  BarChart,
  DollarSign,
  Percent,
  Shield as ShieldIcon,
  Gift,
  Tag,
  TruckIcon,
  CalendarDays,
  Users as UsersIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  Share as ShareIcon,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Send,
  AlertTriangle
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  const [imageLoaded, setImageLoaded] = useState({});
  const [showNotification, setShowNotification] = useState({ show: false, message: "", type: "" });

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
      setQuantity(productData.inventory?.moq || 1);

      if (productData.categoryId) {
        fetchCategory(productData.categoryId);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.response?.data?.message || err.message || "Failed to load product");
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

      const response = await axios.get(`${API_URL}/products/category/${categoryId}?limit=4`);
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
      inStock: product.status === "published" && (product.inventory?.stock || 0) > 0,
    };

    addToCart(cartProduct, quantity);
    openCart();
    showToast(`${product.name} added to cart`, "success");
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
      inStock: product.status === "published" && (product.inventory?.stock || 0) > 0,
    };

    addToCart(cartProduct, quantity);
    navigate("/checkout");
  };

  const showToast = (message, type = "success") => {
    setShowNotification({ show: true, message, type });
    setTimeout(() => setShowNotification({ show: false, message: "", type: "" }), 3000);
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "https://via.placeholder.com/600x600?text=Product+Image";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
    if (imageUrl.startsWith("/")) return `${API_URL}${imageUrl}`;
    return imageUrl;
  };

  const handleImageLoad = (index) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${product.name}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(product.name)}`,
    };
    
    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!", "success");
      setShowShareModal(false);
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank");
      setShowShareModal(false);
    }
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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

  if (loading) return <SkeletonLoader />;

  if (error || (!loading && !product)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h2>
          <p className="text-gray-600 mb-8">
            {error || "The product you're looking for doesn't exist or has been removed."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
            >
              Go Back
            </button>
            <Link
              to="/products"
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isInStock = product.status === "published" && (product.inventory?.stock || 0) > 0;
  const minOrder = product.inventory?.moq || 1;
  const stockQuantity = product.inventory?.stock || 0;
  const discount = product.discount || 0;
  const hasDiscount = discount > 0;
  const images = product.images?.length ? product.images : ["placeholder"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Toast Notification */}
      {showNotification.show && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            showNotification.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white`}>
            {showNotification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{showNotification.message}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 flex-wrap gap-2">
            <Link to="/" className="hover:text-orange-600 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
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
            <span className="text-gray-900 font-medium truncate max-w-[300px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-5">
            {/* Main Image */}
            <div
              className={`relative aspect-square rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-lg transition-all duration-500 ${
                zoomImage ? "cursor-zoom-out scale-105" : "cursor-zoom-in"
              }`}
              onClick={() => setZoomImage(!zoomImage)}
            >
              {!imageLoaded[selectedImage] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
              )}
              <img
                src={getImageUrl(images[selectedImage])}
                alt={product.name}
                className={`w-full h-full object-contain p-8 transition-all duration-700 ${
                  zoomImage ? "scale-150" : "scale-100"
                }`}
                onLoad={() => handleImageLoad(selectedImage)}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x600?text=Product+Image";
                  handleImageLoad(selectedImage);
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    {discount}% OFF
                  </span>
                )}
                {!isInStock && (
                  <span className="bg-gray-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    OUT OF STOCK
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWishlisted(!isWishlisted);
                    showToast(isWishlisted ? "Removed from wishlist" : "Added to wishlist", "success");
                  }}
                  className={`p-3 rounded-full bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 ${
                    isWishlisted ? "text-red-500 scale-110" : "text-gray-600 hover:text-red-500"
                  }`}
                >
                  <HeartIcon className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareModal(true);
                  }}
                  className="p-3 rounded-full bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 text-gray-600 hover:text-orange-600"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Zoom Indicator */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                {zoomImage ? <ZoomOut className="w-3 h-3" /> : <ZoomIn className="w-3 h-3" />}
                {zoomImage ? "Zoom Out" : "Zoom In"}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                      selectedImage === idx
                        ? "border-orange-500 shadow-lg scale-105"
                        : "border-gray-200 hover:border-gray-300 hover:scale-105"
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
          <div className="space-y-6">
            {/* Category & Brand */}
            <div className="flex flex-wrap gap-2">
              {category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-full text-xs font-medium border border-orange-200">
                  <Tag className="w-3.5 h-3.5" />
                  {category.name}
                </span>
              )}
              {product.brand && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  <Building2 className="w-3.5 h-3.5" />
                  {product.brand}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Stock & Rating */}
            <div className="flex flex-wrap items-center gap-4">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isInStock
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {isInStock ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {isInStock ? `In Stock (${stockQuantity} units)` : "Out of Stock"}
              </div>

              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {product.rating} • {stockQuantity.toLocaleString()} units
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">
                ₹{product.price?.toLocaleString() || "0"}
              </span>
              {hasDiscount && product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-base font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-500">
              per {product.unitType?.toLowerCase() || "piece"}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Package, label: "Min. Order", value: `${minOrder} ${product.unitType || "pcs"}`, color: "blue" },
                { icon: Clock3, label: "Lead Time", value: product.leadTime || "2-5 days", color: "orange" },
                { icon: Award, label: "Grade", value: product.grade || "Premium", color: "purple" },
                { icon: TruckIcon, label: "MOQ", value: minOrder, color: "green" },
              ].map((stat, idx) => (
                <div key={idx} className={`bg-gradient-to-br from-${stat.color}-50 to-white p-3 rounded-xl border border-${stat.color}-100`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600 mb-1`} />
                  <div className="text-xs text-gray-500">{stat.label}</div>
                  <div className="font-semibold text-gray-900 text-sm mt-0.5">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="inline-flex border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(minOrder, quantity - 1))}
                      disabled={quantity <= minOrder || !isInStock}
                      className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold"
                    >
                      −
                    </button>
                    <div className="w-16 flex items-center justify-center text-lg font-semibold border-x border-gray-300 bg-white">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                      disabled={!isInStock || quantity >= stockQuantity}
                      className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-base font-medium text-gray-700">
                    Total: <span className="text-xl font-bold text-orange-600">₹{(product.price * quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md ${
                    isInStock
                      ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md ${
                    isInStock
                      ? "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-gray-950 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  Buy Now
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
              {[
                { icon: ShieldCheck, label: "Secure Payment", desc: "SSL Encrypted" },
                { icon: Truck, label: "Fast Delivery", desc: "Pan India" },
                { icon: CheckCircle, label: "Quality Assured", desc: "Premium Grade" },
                { icon: RefreshCw, label: "Easy Returns", desc: "7 Days Policy" },
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <badge.icon className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900 text-xs">{badge.label}</div>
                    <div className="text-[10px] text-gray-500">{badge.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Need help with this product?</div>
                    <div className="text-xs text-gray-600">Our experts are here to assist you</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Call
                  </button>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: "overview", label: "Overview", icon: Info },
                { id: "specifications", label: "Specifications", icon: Settings },
                { id: "features", label: "Features", icon: Award },
                { id: "applications", label: "Applications", icon: Building2 },
                { id: "documents", label: "Documents", icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-all duration-300 border-b-2 ${
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

          <div className="p-6 lg:p-8">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Product Overview</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || "No detailed description available for this product."}
                </p>
                
                {product.keyHighlights && product.keyHighlights.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    {product.keyHighlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {product.warranty && (
                    <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-6 h-6 text-orange-600" />
                        <h4 className="font-bold text-gray-900">Warranty</h4>
                      </div>
                      <p className="text-gray-700">{product.warranty}</p>
                    </div>
                  )}
                  <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock3 className="w-6 h-6 text-green-600" />
                      <h4 className="font-bold text-gray-900">Lead Time</h4>
                    </div>
                    <p className="text-gray-700">{product.leadTime || "Standard lead time applies"}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="space-y-6">
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
                    ["Dimensions", product.dimensions || "N/A"],
                    ["Finish", product.finish || "N/A"],
                    ["Certification", product.certification || "ISO 9001:2015"],
                    ...(product.technicalSpecs ? Object.entries(product.technicalSpecs) : []),
                  ].map(([key, value], index) => (
                    <div key={index} className="flex flex-col sm:flex-row px-6 py-4 hover:bg-white/50 transition-colors">
                      <div className="sm:w-1/3 font-semibold text-gray-700">{key}</div>
                      <div className="sm:w-2/3 text-gray-600 mt-1 sm:mt-0">
                        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Key Features</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {(product.features || []).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {(!product.features || product.features.length === 0) && (
                    <p className="text-gray-500 col-span-2 text-center py-8">No specific features listed.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "applications" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Applications</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(product.application || []).map((app, index) => (
                    <div key={index} className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-100 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-semibold text-gray-900">{app}</span>
                      </div>
                      <p className="text-sm text-gray-600">Ideal for commercial and industrial use</p>
                    </div>
                  ))}
                  {(!product.application || product.application.length === 0) && (
                    <p className="text-gray-500 col-span-3 text-center py-8">No application details available.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Product Documents</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-8 h-8 text-orange-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Technical Datasheet</div>
                        <div className="text-xs text-gray-500">PDF • 2.3 MB</div>
                      </div>
                    </div>
                    <button className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <Printer className="w-8 h-8 text-orange-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Installation Guide</div>
                        <div className="text-xs text-gray-500">PDF • 1.8 MB</div>
                      </div>
                    </div>
                    <button className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-7 h-7 text-orange-600" />
                  Similar Products
                </h2>
                <p className="text-gray-600 mt-2">You might also like these products</p>
              </div>
              {category && (
                <Link
                  to={`/products/category/${category._id}`}
                  className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 transition-colors group"
                >
                  View all in {category.name}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                          <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                            {related.discount}% OFF
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
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
                        <div className="text-sm text-gray-500 mt-2">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShareIcon className="w-5 h-5 text-orange-600" />
                Share this Product
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleShare("copy")}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Copy Link
              </button>

              <button
                onClick={() => handleShare("twitter")}
                className="w-full py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Twitter className="w-5 h-5" />
                Share on X (Twitter)
              </button>

              <button
                onClick={() => handleShare("facebook")}
                className="w-full py-3 bg-[#4267B2] hover:bg-[#365899] text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Facebook className="w-5 h-5" />
                Share on Facebook
              </button>

              <button
                onClick={() => handleShare("linkedin")}
                className="w-full py-3 bg-[#0077B5] hover:bg-[#006699] text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Linkedin className="w-5 h-5" />
                Share on LinkedIn
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: `Check out ${product.name}`,
                      url: window.location.href,
                    });
                    setShowShareModal(false);
                  }
                }}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Share via...
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-up {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailsPage;