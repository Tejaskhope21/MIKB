import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Share,
  Alert,
  Linking,
  Platform,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import ProductCard from "../../components/Products/ProductCard";
import { useCart } from "../../context/CartContext";

const { width, height } = Dimensions.get("window");
const API_BASE_URL = "http://localhost:5000";

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addToCart, openCart } = useCart();

  // State management
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);

  // Animation for bottom buttons
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 100],
    extrapolate: "clamp",
  });

  // Fetch product data
  useEffect(() => {
    if (id) {
      fetchProductData();
    }
  }, [id]);

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
        `${API_BASE_URL}/api/products/by-numeric-id/${id}`,
        `${API_BASE_URL}/api/products/${id}`,
      ];

      let productData = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          const data = await response.json();
          if (data.success && data.product) {
            productData = data.product;
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
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategory = async (categoryId) => {
    try {
      const id = categoryId._id || categoryId;
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`);
      const data = await response.json();
      if (data.success && data.category) {
        setCategory(data.category);
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

      const response = await fetch(
        `${API_BASE_URL}/api/products/category/${categoryId}?limit=4`,
      );
      const data = await response.json();
      if (data.success) {
        const products = data.products?.items || data.products || [];
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchProductData();
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

    Alert.alert(
      "Added to Cart",
      `${product.name} (${quantity} ${product.unitType || "piece"}) added to cart`,
      [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => router.push("/cart") },
      ],
    );
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
    router.push("/checkout");
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://yourapp.com/product/${id}`;
      await Share.share({
        message: `Check out ${product.name} on Bricks.com\n\n${shareUrl}`,
        title: product.name,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share product");
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl)
      return "https://via.placeholder.com/600x400?text=Product+Image";

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
      return `${API_BASE_URL}${imageUrl}`;
    }

    return imageUrl;
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <SafeAreaView style={styles.skeletonContainer}>
      <ScrollView>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonDetails}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonPrice} />
            <View style={styles.skeletonDescription} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // Error State
  if (error || (!loading && !product)) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <MaterialCommunityIcons
            name="package-variant"
            size={80}
            color="#800000"
          />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorText}>
            {error || "The product you're looking for doesn't exist."}
          </Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/products")}
            >
              <Text style={styles.primaryButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
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
  const totalPrice = (product.price * quantity).toLocaleString();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#800000" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name.length > 25
            ? product.name.substring(0, 25) + "..."
            : product.name}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setIsWishlisted(!isWishlisted)}
            style={styles.headerIcon}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={24}
              color={isWishlisted ? "#ff4757" : "#fff"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowShareModal(true)}
            style={styles.headerIcon}
          >
            <Ionicons name="share-social-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#800000"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Images */}
        <View style={styles.imageSection}>
          {/* Main Image */}
          <TouchableOpacity
            style={styles.mainImageContainer}
            onPress={() => setZoomImage(!zoomImage)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: getImageUrl(product.images?.[selectedImage]) }}
              style={[styles.mainImage, zoomImage && styles.zoomedImage]}
              resizeMode="contain"
              onError={() => {
                // Fallback image
              }}
            />

            {/* Badges */}
            <View style={styles.imageBadges}>
              {hasDiscount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discount}% OFF</Text>
                </View>
              )}
              {!isInStock && (
                <View style={styles.outOfStockBadge}>
                  <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailsContainer}
            >
              {product.images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  style={[
                    styles.thumbnail,
                    selectedImage === index && styles.thumbnailSelected,
                  ]}
                >
                  <Image
                    source={{ uri: getImageUrl(img) }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Category & Brand */}
          <View style={styles.tagsContainer}>
            {category && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{category.name}</Text>
              </View>
            )}
            {product.brand && (
              <View style={[styles.tag, styles.brandTag]}>
                <Text style={styles.tagText}>{product.brand}</Text>
              </View>
            )}
          </View>

          {/* Product Title */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <View
              style={[
                styles.stockBadge,
                isInStock ? styles.inStock : styles.outOfStock,
              ]}
            >
              <Ionicons
                name={isInStock ? "checkmark-circle" : "close-circle"}
                size={20}
                color={isInStock ? "#10b981" : "#ef4444"}
              />
              <Text
                style={[
                  styles.stockText,
                  isInStock ? styles.inStockText : styles.outOfStockText,
                ]}
              >
                {isInStock ? "In Stock" : "Out of Stock"}
              </Text>
            </View>
            {isInStock && (
              <Text style={styles.stockQuantity}>
                {stockQuantity.toLocaleString()} units available
              </Text>
            )}
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ₹{product.price.toLocaleString()}
              </Text>
              {hasDiscount && product.originalPrice && (
                <>
                  <Text style={styles.originalPrice}>
                    ₹{product.originalPrice.toLocaleString()}
                  </Text>
                  <View style={styles.discountContainer}>
                    <Text style={styles.saveText}>{discount}% off</Text>
                  </View>
                </>
              )}
            </View>
            <Text style={styles.unitText}>
              per {product.unitType || "piece"}
            </Text>
          </View>

          {/* Delivery Info */}
          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryItem}>
              <Ionicons name="location-outline" size={20} color="#800000" />
              <Text style={styles.deliveryText}>
                Deliver to{" "}
                <Text style={styles.deliveryHighlight}>Your Location</Text>
              </Text>
            </View>
            <View style={styles.deliveryItem}>
              <Ionicons name="time-outline" size={20} color="#800000" />
              <Text style={styles.deliveryText}>
                Delivery by {product.deliveryTime || "3-7 hours"}
              </Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Min. Order</Text>
              <Text style={styles.statValue}>
                {minOrder} {product.unitType || "pcs"}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Quality</Text>
              <Text style={styles.statValue}>{product.grade || "Premium"}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Material</Text>
              <Text style={styles.statValue}>
                {product.materialType || "Standard"}
              </Text>
            </View>
          </View>

          {/* Quantity Selector - Now inside the bottom bar */}

          {/* Product Details Tabs */}
          <View style={styles.tabsContainer}>
            {/* Tab Navigation */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabNavigation}
            >
              {[
                {
                  id: "overview",
                  label: "Overview",
                  icon: "information-circle-outline",
                },
                {
                  id: "specifications",
                  label: "Specifications",
                  icon: "stats-chart-outline",
                },
                { id: "features", label: "Features", icon: "star-outline" },
                {
                  id: "applications",
                  label: "Applications",
                  icon: "grid-outline",
                },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[
                    styles.tabButton,
                    activeTab === tab.id && styles.tabButtonActive,
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={20}
                    color={activeTab === tab.id ? "#800000" : "#64748b"}
                  />
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === tab.id && styles.tabButtonTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {activeTab === "overview" && (
                <View style={styles.overviewContent}>
                  <Text style={styles.tabTitle}>Product Overview</Text>
                  <Text style={styles.description}>
                    {product.description || "No description available."}
                  </Text>

                  <View style={styles.overviewFeatures}>
                    {product.warranty && (
                      <View style={styles.featureCard}>
                        <View
                          style={[
                            styles.featureIcon,
                            { backgroundColor: "#dbeafe" },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="shield-check"
                            size={24}
                            color="#3b82f6"
                          />
                        </View>
                        <Text style={styles.featureTitle}>Warranty</Text>
                        <Text style={styles.featureText}>
                          {product.warranty}
                        </Text>
                      </View>
                    )}

                    <View style={styles.featureCard}>
                      <View
                        style={[
                          styles.featureIcon,
                          { backgroundColor: "#d1fae5" },
                        ]}
                      >
                        <Feather name="clock" size={24} color="#10b981" />
                      </View>
                      <Text style={styles.featureTitle}>Lead Time</Text>
                      <Text style={styles.featureText}>
                        {product.leadTime || "Standard lead time applies"}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {activeTab === "specifications" && (
                <View style={styles.specsContent}>
                  <Text style={styles.tabTitle}>Technical Specifications</Text>
                  <View style={styles.specsList}>
                    {[
                      ["Material", product.materialType || "N/A"],
                      ["Grade", product.grade || "N/A"],
                      ["Brand", product.brand || "N/A"],
                      ["Unit Type", product.unitType || "Piece"],
                      ["Color", product.color || "N/A"],
                      ["Size", product.size || "N/A"],
                      ["Weight", product.weight || "N/A"],
                    ].map(([key, value], index) => (
                      <View key={index} style={styles.specItem}>
                        <Text style={styles.specKey}>{key}</Text>
                        <Text style={styles.specValue}>
                          {typeof value === "boolean"
                            ? value
                              ? "Yes"
                              : "No"
                            : value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {activeTab === "features" && (
                <View style={styles.featuresContent}>
                  <Text style={styles.tabTitle}>Key Features</Text>
                  <View style={styles.featuresList}>
                    {(product.features || []).map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <View style={styles.featureIconSmall}>
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#10b981"
                          />
                        </View>
                        <Text style={styles.featureTextItem}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {activeTab === "applications" && (
                <View style={styles.applicationsContent}>
                  <Text style={styles.tabTitle}>Applications</Text>
                  <View style={styles.applicationsGrid}>
                    {(product.application || []).map((app, index) => (
                      <View key={index} style={styles.applicationCard}>
                        <View style={styles.applicationDot} />
                        <Text style={styles.applicationTitle}>{app}</Text>
                        <Text style={styles.applicationDescription}>
                          Ideal for commercial and industrial use
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustBadges}>
            <View style={styles.trustBadge}>
              <MaterialCommunityIcons
                name="shield-check"
                size={24}
                color="#3b82f6"
              />
              <View style={styles.trustBadgeContent}>
                <Text style={styles.trustBadgeTitle}>Secure Payment</Text>
                <Text style={styles.trustBadgeSubtitle}>SSL Encrypted</Text>
              </View>
            </View>

            <View style={styles.trustBadge}>
              <Feather name="truck" size={24} color="#10b981" />
              <View style={styles.trustBadgeContent}></View>
            </View>
          </View>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedProducts}>
            <View style={styles.relatedHeader}>
              <View>
                <Text style={styles.relatedTitle}>Similar Products</Text>
                <Text style={styles.relatedSubtitle}>
                  Products you might be interested in
                </Text>
              </View>

              {category && (
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      `/categories/${category._id}?name=${category.name}`,
                    )
                  }
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>View all</Text>
                  <Ionicons name="arrow-forward" size={16} color="#800000" />
                </TouchableOpacity>
              )}
            </View>

            {loadingRelated ? (
              <ActivityIndicator
                size="large"
                color="#800000"
                style={{ marginVertical: 20 }}
              />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.relatedScroll}
              >
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct}
                    viewMode="grid"
                    style={styles.relatedCard}
                    onPress={() =>
                      router.push({
                        pathname: "/product/[id]",
                        params: { id: relatedProduct._id },
                      })
                    }
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Bottom Spacer for fixed buttons */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Fixed Bottom Action Bar - Like Flipkart */}
      <Animated.View
        style={[styles.bottomBar, { transform: [{ translateY }] }]}
      >
        {/* Quantity Selector in Bottom Bar */}
        <View style={styles.bottomQuantitySection}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityButtons}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(minOrder, quantity - 1))}
              disabled={quantity <= minOrder || !isInStock}
              style={[
                styles.quantityButton,
                (quantity <= minOrder || !isInStock) &&
                  styles.quantityButtonDisabled,
              ]}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityValue}>{quantity}</Text>
            </View>

            <TouchableOpacity
              onPress={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
              disabled={!isInStock || quantity >= stockQuantity}
              style={[
                styles.quantityButton,
                (!isInStock || quantity >= stockQuantity) &&
                  styles.quantityButtonDisabled,
              ]}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bottomTotalPrice}>₹{totalPrice}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomActionButtons}>
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={!isInStock}
            style={[
              styles.bottomAddToCartButton,
              !isInStock && styles.buttonDisabled,
            ]}
          >
            <Ionicons name="cart-outline" size={24} color="#fff" />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.bottomButtonText}>ADD TO CART</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBuyNow}
            disabled={!isInStock}
            style={[
              styles.bottomBuyNowButton,
              !isInStock && styles.buttonDisabled,
            ]}
          >
            <Ionicons name="flash-outline" size={24} color="#fff" />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.bottomButtonText}>BUY NOW</Text>
              <Text style={styles.bottomButtonSubtext}>Secure Payment</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Product</Text>

            <TouchableOpacity
              onPress={() => {
                handleShare();
                setShowShareModal(false);
              }}
              style={styles.shareOption}
            >
              <Text style={styles.shareOptionText}>Share via...</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.alert("Copied", "Link copied to clipboard!");
                setShowShareModal(false);
              }}
              style={styles.shareOption}
            >
              <Text style={styles.shareOptionText}>Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowShareModal(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom bar
  },

  // Header
  header: {
    backgroundColor: "#800000",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerIcon: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  // Image Section
  imageSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  mainImageContainer: {
    height: 300,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    overflow: "hidden",
    marginBottom: 16,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  zoomedImage: {
    transform: [{ scale: 1.5 }],
  },
  imageBadges: {
    position: "absolute",
    top: 12,
    left: 12,
    gap: 8,
  },
  discountBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  outOfStockBadge: {
    backgroundColor: "#1f2937",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  outOfStockText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  thumbnailsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  thumbnailSelected: {
    borderColor: "#800000",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },

  // Product Info
  productInfo: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  brandTag: {
    backgroundColor: "#e2e8f0",
  },
  tagText: {
    color: "#1e40af",
    fontSize: 12,
    fontWeight: "500",
  },
  productTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
    lineHeight: 30,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  inStock: {
    backgroundColor: "#d1fae5",
  },
  outOfStock: {
    backgroundColor: "#fee2e2",
  },
  stockText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inStockText: {
    color: "#065f46",
  },
  outOfStockText: {
    color: "#991b1b",
  },
  stockQuantity: {
    fontSize: 14,
    color: "#64748b",
  },
  priceSection: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
  },
  originalPrice: {
    fontSize: 18,
    color: "#94a3b8",
    textDecorationLine: "line-through",
  },
  discountContainer: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  unitText: {
    fontSize: 14,
    color: "#64748b",
  },
  deliveryInfo: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  deliveryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: "#475569",
  },
  deliveryHighlight: {
    color: "#800000",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },

  // Bottom Fixed Action Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    padding: 22,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomQuantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  bottomTotalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#800000",
  },
  quantityButtons: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    overflow: "hidden",
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    color: "#475569",
    fontWeight: "bold",
  },
  quantityDisplay: {
    width: 48,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  bottomActionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  bottomAddToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#800000",
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
  },
  bottomBuyNowButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextContainer: {
    alignItems: "center",
  },
  bottomButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  bottomButtonSubtext: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 11,
    marginTop: 2,
  },

  // Tabs
  tabsContainer: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  tabNavigation: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 16,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#800000",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  tabButtonTextActive: {
    color: "#800000",
  },
  tabContent: {
    padding: 20,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
    marginBottom: 24,
  },
  overviewFeatures: {
    flexDirection: "row",
    gap: 16,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  specsList: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  specItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  specKey: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  specValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
  },
  featureIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  featureTextItem: {
    flex: 1,
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  applicationsGrid: {
    gap: 12,
  },
  applicationCard: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  applicationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0ea5e9",
    marginBottom: 12,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369a1",
    marginBottom: 8,
  },
  applicationDescription: {
    fontSize: 14,
    color: "#0c4a6e",
    lineHeight: 20,
  },

  // Trust Badges
  trustBadges: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  trustBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  trustBadgeContent: {
    flex: 1,
  },
  trustBadgeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  trustBadgeSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },

  // Related Products
  relatedProducts: {
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  relatedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  relatedSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: "#800000",
    fontWeight: "500",
  },
  relatedScroll: {
    flexDirection: "row",
    gap: 12,
  },
  relatedCard: {
    width: width * 0.65,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  shareOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  shareOptionText: {
    fontSize: 16,
    color: "#3b82f6",
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "500",
  },

  // Skeleton Loader
  skeletonContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  skeletonHeader: {
    height: 60,
    backgroundColor: "#e2e8f0",
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonImage: {
    height: 300,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonDetails: {
    gap: 12,
  },
  skeletonTitle: {
    height: 32,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    width: "80%",
  },
  skeletonPrice: {
    height: 40,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    width: "40%",
  },
  skeletonDescription: {
    height: 100,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
  },

  // Error State
  errorContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContent: {
    alignItems: "center",
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  errorButtons: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#800000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "500",
  },
});
