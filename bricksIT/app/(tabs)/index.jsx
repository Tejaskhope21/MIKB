// app/(tabs)/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import API functions directly
import {
  fetchAllCategories,
  fetchFeaturedProducts,
  formatPrice,
  getProductImage,
} from '../../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hero images
  const heroImages = [
    { id: 1, image: require('../../assets/images/b2.jpg'), title: 'Premium Building Materials' },
    { id: 2, image: require('../../assets/images/b3.jpg'), title: 'Trusted Brands' },
    { id: 3, image: require('../../assets/images/b4.jpg'), title: 'Fast Delivery' },
  ];

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch categories and products
      const [categoriesData, productsData] = await Promise.all([
        fetchAllCategories(),
        fetchFeaturedProducts(),
      ]);

      // Set categories
      const cats = categoriesData && categoriesData.length > 0
        ? categoriesData
        : [
          { _id: '1', name: 'Cement', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400' },
          { _id: '2', name: 'Steel', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400' },
          { _id: '3', name: 'Bricks', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400' },
        ];

      setCategories(cats.map(cat => ({
        id: cat._id || `cat-${Math.random()}`,
        _id: cat._id,
        name: cat.name || 'Category',
        image: cat.image || `https://via.placeholder.com/80/cccccc/ffffff?text=${(cat.name || '?').charAt(0)}`,
      })));

      // Handle products using the logic from the first code
      const transformedProducts = (productsData || []).map(product => ({
        id: product._id,
        _id: product._id,
        name: product.name,
        brand: product.brand || 'Brand',
        price: Number(product.price) || 0,
        originalPrice: Number(product.originalPrice || product.price),
        image: product.image || getProductImage(product.images),
        inStock: product.inStock !== false,
        rating: Number(product.rating) || 4.0,
      }));

      // Fallback if no products
      if (transformedProducts.length === 0) {
        const fallbackProducts = [
          {
            id: '1',
            _id: '1',
            name: 'UltraTech Cement 53 Grade',
            brand: 'UltraTech',
            price: 380,
            originalPrice: 420,
            image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
            inStock: true,
            category: 'Cement',
            rating: 4.5,
          },
          {
            id: '2',
            _id: '2',
            name: 'TATA Tiscon TMT Steel Bars',
            brand: 'TATA',
            price: 65000,
            originalPrice: 68000,
            image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
            inStock: true,
            category: 'Steel',
            rating: 4.7,
          },
        ];
        setFeaturedProducts(fallbackProducts);
      } else {
        setFeaturedProducts(transformedProducts);
      }

    } catch (error) {
      console.error('Error loading home data:', error);
      // Load sample data on error
      const sampleCategories = [
        { id: '1', _id: '1', name: 'Cement', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400' },
        { id: '2', _id: '2', name: 'Steel', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400' },
        { id: '3', _id: '3', name: 'Bricks', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400' },
      ];

      const sampleProducts = [
        {
          id: '1',
          _id: '1',
          name: 'UltraTech Cement 53 Grade',
          brand: 'UltraTech',
          price: 380,
          originalPrice: 420,
          image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
          inStock: true,
          category: 'Cement',
          rating: 4.5,
        },
        {
          id: '2',
          _id: '2',
          name: 'TATA Tiscon TMT Steel Bars',
          brand: 'TATA',
          price: 65000,
          originalPrice: 68000,
          image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
          inStock: true,
          category: 'Steel',
          rating: 4.7,
        },
      ];

      setCategories(sampleCategories);
      setFeaturedProducts(sampleProducts);
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

  // ✅ FIXED ROUTE HERE - Using productDetails instead of just product
  const handleProductPress = (product) => {
    router.push({
      pathname: '/productDetails/[id]',
      params: { id: product.id },
    });
  };

  const handleCategoryPress = (category) => {
    router.push(`/categories/${category.id}`);
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
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
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // ✅ USING THE UPDATED RENDER PRODUCT ITEM LOGIC FROM FIRST CODE
  const renderProductItem = ({ item }) => {
    const discount =
      item.originalPrice > item.price
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage} 
          resizeMode="cover"
        />

        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}

        <View style={styles.productInfo}>
          <Text numberOfLines={1} style={styles.productBrand}>{item.brand}</Text>
          <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
            {item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.originalPrice)}
              </Text>
            )}
          </View>

          {/* Added stock and rating info from second code */}
          <View style={styles.stockRatingContainer}>
            {item.inStock ? (
              <View style={styles.stockBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#28a745" />
                <Text style={styles.inStockText}>In Stock</Text>
              </View>
            ) : (
              <View style={styles.stockBadge}>
                <Ionicons name="close-circle" size={12} color="#dc3545" />
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#ffc107" />
              <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.0'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navbarTitle}>BricksIT</Text>
        <View style={styles.navbarIcons}>
          <TouchableOpacity style={styles.navbarIcon} onPress={() => router.push('/search')}>
            <Ionicons name="search-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navbarIcon} onPress={() => router.push('/cart')}>
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
        {/* Hero Carousel */}
        <View style={styles.heroContainer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {heroImages.map((image) => (
              <View key={image.id} style={styles.heroSlide}>
                <Image source={image.image} style={styles.heroImage} />
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroTitle}>{image.title}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchPlaceholder}>Search building materials...</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity
              onPress={() => router.push('/categories')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color="#800000" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={categories}
            renderItem={({ item }) => {
              // Truncate name to 10 letters and add ellipsis if longer
              const displayName = item.name.length > 10 
                ? item.name.substring(0, 10) + '...' 
                : item.name;
              
              return (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => router.push({
                    pathname: '/categories/[id]',
                    params: { 
                      id: item._id,
                      name: item.name 
                    }
                  })}
                  style={styles.categoryItem}
                >
                  <View style={styles.categoryImageContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {displayName}
                  </Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          />
        </View>

        {/* Featured Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={featuredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productsGrid}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/post-requirement')}
          >
            <Ionicons name="document-text-outline" size={28} color="#800000" />
            <Text style={styles.actionText}>Post Requirement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/contractors')}
          >
            <Ionicons name="construct-outline" size={28} color="#800000" />
            <Text style={styles.actionText}>Find Contractors</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Space */}
        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  navbar: {
    backgroundColor: '#800000',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  heroContainer: {
    height: 200,
  },
  heroSlide: {
    width: width,
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a'
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
  categoriesList: {
    paddingHorizontal: 16
  },
  categoryItem: {
    width: 100,
    alignItems: 'center',
    marginRight: 16
  },
  categoryCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 16
  },
  categoryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#f0f0f0'
  },
  categoryImage: {
    width: '100%',
    height: '100%'
  },
  categoryName: {
    fontSize: 13,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600'
  },
  productsGrid: {
    justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  productCard: {
    flex: 1,
    maxWidth: (width - 56) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  productImageContainer: {
    position: 'relative',
    height: 160
  },
  productImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700'
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  outOfStockOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  productInfo: {
    padding: 12,
    flex: 1
  },
  productBrand: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500'
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 16
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#800000',
    marginRight: 4
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through'
  },
  stockRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 6
  },
  inStockText: {
    fontSize: 10,
    color: '#28a745',
    fontWeight: '600'
  },
  outOfStockText: {
    fontSize: 10,
    color: '#dc3545',
    fontWeight: '600'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500'
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginHorizontal: 8
  },
  actionText: {
    marginTop: 8,
    fontSize: 13,
    color: '#800000',
    fontWeight: '600',
    textAlign: 'center'
  },
  footerSpace: {
    height: 100
  },
});

export default HomeScreen;