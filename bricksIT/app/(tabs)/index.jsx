// screens/HomeScreen.jsx
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Banner from '../../components/Banner/Banner';

// Import local images directly
import hero1 from '../../assets/BannerImages/hero1.png';
import hero2 from '../../assets/BannerImages/hero2.png';
import hero3 from '../../assets/BannerImages/hero3.png';

// Import logo
import logoImage from '../../assets/images/logo2.png';

// Import API functions
import {
  fetchAllCategories,
  formatPrice,
  getProductImage,
} from '../../services/api';
import {
  fetchHotDeals,
  trackHotDealView,
  trackHotDealClick,
  fetchTrendingProducts,
  trackTrendingView,
  trackTrendingClick,
} from '../../services/featuresApi';

const { width } = Dimensions.get('window');

/* =========================
   HERO COMPONENT (Embedded in HomeScreen)
========================= */
const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const autoScrollRef = useRef(null);

  // Your images
  const heroSlides = [
    { id: '1', image: hero1 },
    { id: '2', image: hero2 },
    { id: '3', image: hero3 },
  ];

  useEffect(() => {
    // Auto scroll every 4 seconds
    autoScrollRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % heroSlides.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (width - 20),
        animated: true,
      });
    }, 4000);

    return () => clearInterval(autoScrollRef.current);
  }, [currentIndex]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (width - 20));
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * (width - 20),
      animated: true,
    });
  };

  return (
    <View style={heroStyles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={heroStyles.scrollView}
      >
        {heroSlides.map((slide) => (
          <View key={slide.id} style={heroStyles.slide}>
            <Image 
              source={slide.image} 
              style={heroStyles.image} 
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={heroStyles.pagination}>
        {heroSlides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              heroStyles.dot,
              currentIndex === index && heroStyles.activeDot,
            ]}
            onPress={() => scrollToIndex(index)}
          />
        ))}
      </View>
    </View>
  );
};

const heroStyles = StyleSheet.create({
  container: {
    height: 180,
    position: 'relative',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flex: 1,
    borderRadius: 8,
  },
  slide: {
    width: width - 20,
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
});

/* =========================
   HOT DEAL ITEM COMPONENT
========================= */
const HotDealCard = memo(({ item, onPress }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (item.id) {
      trackHotDealView(item.id);
    }
  }, [item.id]);

  const handlePress = async () => {
    if (item.id) {
      await trackHotDealClick(item.id);
    }
    onPress(item);
  };

  const discount = item.discount || 
    (item.originalPrice && item.price ? 
      Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0);

  return (
    <TouchableOpacity 
      style={styles.hotDealCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.hotDealImageContainer}>
        <Image
          source={{ 
            uri: !imageError ? (item.image || getProductImage(item.images)) : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
          }}
          style={styles.hotDealImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <View style={styles.hotDealBadge}>
            <Text style={styles.hotDealBadgeText}>{discount}% OFF</Text>
          </View>
        )}

        {/* Hot Deal Badge */}
        <View style={styles.hotTag}>
          <Text style={styles.hotTagText}>HOT DEAL</Text>
        </View>
      </View>

      <View style={styles.hotDealInfo}>
        <Text style={styles.hotDealBrand} numberOfLines={1}>
          {item.brand || 'Premium Brand'}
        </Text>
        <Text style={styles.hotDealName} numberOfLines={2}>
          {item.name || 'Hot Deal Product'}
        </Text>

        <View style={styles.hotDealPriceRow}>
          <Text style={styles.hotDealPrice}>
            {formatPrice(item.price || 0)}
          </Text>
          {item.originalPrice > item.price && (
            <Text style={styles.hotDealOriginal}>
              {formatPrice(item.originalPrice)}
            </Text>
          )}
        </View>

        {/* Stock Status */}
        <View style={styles.stockContainer}>
          {item.inStock !== false ? (
            <>
              <Ionicons name="checkmark-circle" size={12} color="#28a745" />
              <Text style={styles.inStockText}>In Stock</Text>
            </>
          ) : (
            <>
              <Ionicons name="close-circle" size={12} color="#dc3545" />
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

/* =========================
   TRENDING PRODUCT CARD COMPONENT
========================= */
const TrendingProductCard = memo(({ item, onPress, index }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (item.id) {
      trackTrendingView(item.id);
    }
  }, [item.id]);

  const handlePress = async () => {
    if (item.id) {
      await trackTrendingClick(item.id);
    }
    onPress(item);
  };

  // Determine trending badge based on index
  const getTrendingBadge = () => {
    if (index === 0) return { label: '#1 TRENDING', color: '#FFD700', textColor: '#000' };
    if (index === 1) return { label: '#2 TRENDING', color: '#C0C0C0', textColor: '#000' };
    if (index === 2) return { label: '#3 TRENDING', color: '#CD7F32', textColor: '#fff' };
    if (index < 6) return { label: 'TRENDING', color: '#800000', textColor: '#fff' };
    return null;
  };

  const trendingBadge = getTrendingBadge();
  const discount = item.discount || 
    (item.originalPrice && item.price ? 
      Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0);

  return (
    <TouchableOpacity 
      style={styles.trendingCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.trendingImageContainer}>
        <Image
          source={{ 
            uri: !imageError ? (item.image || getProductImage(item.images)) : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
          }}
          style={styles.trendingImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        
        {/* Trending Badge */}
        {trendingBadge && (
          <View style={[styles.trendingBadge, { backgroundColor: trendingBadge.color }]}>
            <Text style={[styles.trendingBadgeText, { color: trendingBadge.textColor }]}>
              {trendingBadge.label}
            </Text>
          </View>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <View style={styles.trendingDiscountBadge}>
            <Text style={styles.trendingDiscountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.trendingInfo}>
        <Text style={styles.trendingBrand} numberOfLines={1}>
          {item.brand || 'Brand'}
        </Text>
        <Text style={styles.trendingName} numberOfLines={2}>
          {item.name || 'Product Name'}
        </Text>

        <View style={styles.trendingPriceRow}>
          <Text style={styles.trendingPrice}>
            {formatPrice(item.price || 0)}
          </Text>
          {item.originalPrice > item.price && (
            <Text style={styles.trendingOriginal}>
              {formatPrice(item.originalPrice)}
            </Text>
          )}
        </View>

        {/* Stock & Stats */}
        <View style={styles.trendingStatsContainer}>
          <View style={styles.stockContainer}>
            {item.inStock !== false ? (
              <>
                <Ionicons name="checkmark-circle" size={12} color="#28a745" />
                <Text style={styles.inStockText}>In Stock</Text>
              </>
            ) : (
              <>
                <Ionicons name="close-circle" size={12} color="#dc3545" />
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </>
            )}
          </View>
          
          {/* Trend Indicator */}
          <View style={styles.trendIndicator}>
            <Ionicons name="trending-up" size={12} color="#800000" />
            <Text style={styles.trendText}>Trending</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

/* =========================
   HOME SCREEN
========================= */
const HomeScreen = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [categoriesData, hotDealsData, trendingData] = await Promise.all([
        fetchAllCategories(),
        fetchHotDeals(12), // Fetch 12 hot deals
        fetchTrendingProducts(8), // Fetch 8 trending products
      ]);

      // Process categories
      if (categoriesData && Array.isArray(categoriesData)) {
        const processedCategories = categoriesData.map(cat => ({
          _id: cat._id,
          name: cat.name || 'Category',
          image: cat.image || `https://via.placeholder.com/80/cccccc/ffffff?text=${(cat.name || '?').charAt(0)}`,
        }));
        setCategories(processedCategories);
      }

      // Process hot deals
      if (hotDealsData && Array.isArray(hotDealsData)) {
        const processedHotDeals = hotDealsData.map(deal => ({
          id: deal._id || deal.id,
          _id: deal._id || deal.id,
          name: deal.name,
          brand: deal.brand || '',
          price: Number(deal.price) || 0,
          originalPrice: Number(deal.originalPrice || 0),
          discount: deal.discount || 0,
          image: deal.image || getProductImage(deal.images),
          inStock: deal.inStock !== false,
          rating: Number(deal.rating) || 0,
          description: deal.description || '',
        }));
        setHotDeals(processedHotDeals);
      }

      // Process trending products
      if (trendingData && Array.isArray(trendingData)) {
        const processedTrending = trendingData.map(product => ({
          id: product.id || product._id,
          _id: product._id || product.id,
          name: product.name,
          brand: product.brand || '',
          price: Number(product.price) || 0,
          originalPrice: Number(product.originalPrice || 0),
          discount: product.discount || 0,
          image: product.image || getProductImage(product.images),
          images: product.images || [],
          inStock: product.inStock !== false,
          description: product.description || '',
          reviewCount: product.reviewCount || 0,
          trendScore: product.trendScore || 0,
          category: product.category,
        }));
        setTrendingProducts(processedTrending);
      }

    } catch (error) {
      console.error('Error loading home data:', error);
      // Only set empty arrays on error
      setCategories([]);
      setHotDeals([]);
      setTrendingProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleHotDealPress = async (product) => {
    if (product.id) {
      await trackHotDealClick(product.id);
    }
    
    router.push({
      pathname: '/productDetails/[id]',
      params: { 
        id: product.id, 
        fromDeals: 'true'
      },
    });
  };

  const handleTrendingPress = async (product) => {
    if (product.id) {
      await trackTrendingClick(product.id);
    }
    
    router.push({
      pathname: '/productDetails/[id]',
      params: { 
        id: product.id, 
        fromTrending: 'true'
      },
    });
  };

  const handleCategoryPress = (category) => {
    router.push({
      pathname: '/categories/[id]',
      params: { 
        id: category._id,
        name: category.name 
      }
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={styles.loadingText}>Loading BricksIT...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. NAVBAR */}
      <View style={styles.navbar}>
        {/* Logo instead of "BricksIT" text */}
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => router.push('/')}
        >
          <Image
            source={logoImage}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.navbarIcons}>
          <TouchableOpacity onPress={() => router.push('/search')} style={styles.navbarIcon}>
            <Ionicons name="search-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.navbarIcon}>
            <Ionicons name="cart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#800000']}
            tintColor="#800000"
          />
        }
      >
        {/* 2. HERO CAROUSEL - Embedded Hero component */}
        <Hero />

        {/* 3. CATEGORIES SECTION */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <TouchableOpacity
                onPress={() => router.push('/categories')}
                style={styles.seeAllButton}
              >
                {/* <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color="#800000" /> */}
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categories.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryImageContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* 4. HOT DEALS SECTION */}
        {hotDeals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.hotDealsTitleContainer}>
                <View style={styles.fireIcon}>
                  {/* <Ionicons name="flame" size={20} color="#ff6b35" /> */}
                </View>
                <Text style={styles.sectionTitle}>Hot Deals</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/hot-deals')}
                style={styles.seeAllButton}
              >
                {/* <Text style={styles.seeAllText}>View All</Text> */}
                {/* <Ionicons name="chevron-forward" size={16} color="#800000" /> */}
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionSubtitle}>Limited time offers with exclusive discounts</Text>

            <FlatList
              data={hotDeals}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hotDealsList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <HotDealCard item={item} onPress={handleHotDealPress} />
              )}
            />
          </View>
        )}

        {/* 5. BANNER COMPONENT */}
        <Banner />

        {/* 6. TRENDING PRODUCTS SECTION */}
        {trendingProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.trendingTitleContainer}>
                <View style={styles.trendingIcon}>
                  <Ionicons name="trending-up" size={20} color="#800000" />
                </View>
                <Text style={styles.sectionTitle}>Trending Now</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/trending')}
                style={styles.seeAllButton}
              >
                {/* <Text style={styles.seeAllText}>View All</Text> */}
                {/* <Ionicons name="chevron-forward" size={16} color="#800000" /> */}
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionSubtitle}>Most popular products this week</Text>

            <View style={styles.trendingGrid}>
              {trendingProducts.slice(0, 4).map((item, index) => (
                <TrendingProductCard 
                  key={item.id} 
                  item={item} 
                  index={index}
                  onPress={handleTrendingPress} 
                />
              ))}
            </View>
          </View>
        )}

        {/* 7. ACTION BUTTONS SECTION */}
        <View style={styles.actionSection}>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('notfound')}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="document-text-outline" size={28} color="#800000" />
              </View>
              <Text style={styles.actionText}>Post Requirement</Text>
              <Text style={styles.actionSubtext}>Tell us what you need</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('contractorsListScreen')}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="construct-outline" size={28} color="#800000" />
              </View>
              <Text style={styles.actionText}>Find Contractors</Text>
              <Text style={styles.actionSubtext}>Hire trusted professionals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Space */}
        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
};

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  // 1. NAVBAR STYLES - UPDATED FOR LOGO
  navbar: {
    backgroundColor: '#800000',
    paddingTop: 50,
    paddingHorizontal: 1,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingEnd: 20,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 40,
  },
  logo: {
    width: 120,
    height: 90,
    maxWidth: 120,
  },
  navbarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  navbarIcons: {
    flexDirection: 'row',
  },
  navbarIcon: {
    marginLeft: 16,
  },
  
  scrollView: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
    fontWeight: '500'
  },
  
  // SECTION COMMON STYLES
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  hotDealsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fireIcon: {
    marginRight: 8,
  },
  trendingIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  seeAllText: {
    color: '#800000',
    fontSize: 14,
    fontWeight: '600'
  },
  
  // 3. CATEGORIES STYLES
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    width: 100,
    alignItems: 'center',
    marginRight: 16,
  },
  categoryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: 13,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600'
  },
  
  // 4. HOT DEALS STYLES
  hotDealsList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  hotDealCard: {
    width: 170,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ffe6e6',
    overflow: 'hidden',
  },
  hotDealImageContainer: {
    position: 'relative',
    height: 140,
  },
  hotDealImage: {
    width: '100%',
    height: '100%',
  },
  hotDealBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  hotDealBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  hotTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff6b35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hotTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  hotDealInfo: {
    padding: 12,
  },
  hotDealBrand: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  hotDealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 18,
  },
  hotDealPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotDealPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#800000',
    marginRight: 6,
  },
  hotDealOriginal: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  
  // 6. TRENDING PRODUCTS STYLES
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  trendingCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  trendingImageContainer: {
    position: 'relative',
    height: 140,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  trendingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  trendingDiscountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#800000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendingDiscountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  trendingInfo: {
    padding: 12,
  },
  trendingBrand: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  trendingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 18,
  },
  trendingPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#800000',
    marginRight: 6,
  },
  trendingOriginal: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  trendingStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 10,
    color: '#800000',
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // 7. ACTION BUTTONS SECTION
  actionSection: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  actionButton: {
    alignItems: 'center',
    width: '45%',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffe6e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffe6e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#800000',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // COMMON STOCK STYLES
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inStockText: {
    fontSize: 11,
    color: '#28a745',
    fontWeight: '600',
  },
  outOfStockText: {
    fontSize: 11,
    color: '#dc3545',
    fontWeight: '600',
  },
  
  // FOOTER
  footerSpace: {
    height: 100,
  },
});

export default HomeScreen;