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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import API
import {
  productsAPI,
  categoriesAPI,
  formatPrice,
  getProductImage
} from '../../services/api';

// Import Components
import Navbar from '../../components/Navbar';
import HeroCarousel from '../../components/Common/HeroCarousel';
import SearchBar from '../../components/Common/SearchBar';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hero images for carousel
  const heroImages = [
    { id: 1, image: require('../../assets/images/b2.jpg'), title: 'Premium Building Materials' },
    { id: 2, image: require('../../assets/images/b3.jpg'), title: 'Trusted Brands' },
    { id: 3, image: require('../../assets/images/b4.jpg'), title: 'Fast Delivery' },
  ];

  // Load all data
  const loadData = async () => {
    try {
      // Load categories
      const categoriesData = await categoriesAPI.fetchAllCategories();
      setCategories(categoriesData);

      // Load products
      const productsData = await productsAPI.fetchAllProducts({ limit: 12 });

      const transformedProducts = productsData.map(product => ({
        id: product.numericId || product._id || product.id,
        name: product.name || "Building Material",
        brand: product.brand || "Premium Brand",
        price: product.price || 0,
        originalPrice: product.originalPrice || product.price,
        discount: product.discount || 0,
        image: getProductImage(product.images),
        inStock: product.inventory?.stock > 0 || false,
        category: product.categoryId?.name || 'Construction',
        rating: product.rating || 4.0,
        description: product.description || '',
      }));

      setFeaturedProducts(transformedProducts);
    } catch (error) {
      console.error("Error loading home data:", error);
      Alert.alert(
        "Connection Error",
        "Unable to load data. Please check your internet connection.",
        [{ text: "Retry", onPress: loadData }]
      );

      // Load sample data as fallback
      loadSampleData();
    }
  };

  const loadSampleData = () => {
    const sampleCategories = [
      { id: '1', name: 'Cement', image: 'https://via.placeholder.com/150/800000/ffffff?text=C' },
      { id: '2', name: 'Steel', image: 'https://via.placeholder.com/150/333333/ffffff?text=S' },
      { id: '3', name: 'Bricks', image: 'https://via.placeholder.com/150/cc0000/ffffff?text=B' },
      { id: '4', name: 'Tiles', image: 'https://via.placeholder.com/150/0066cc/ffffff?text=T' },
      { id: '5', name: 'Paints', image: 'https://via.placeholder.com/150/ff9900/ffffff?text=P' },
      { id: '6', name: 'Plumbing', image: 'https://via.placeholder.com/150/009999/ffffff?text=P' },
    ];

    const sampleProducts = Array.from({ length: 8 }, (_, i) => ({
      id: `sample-${i + 1}`,
      name: `Premium Construction Material ${i + 1}`,
      brand: ['UltraTech', 'Ambuja', 'Jindal', 'Kajaria'][i % 4],
      price: Math.floor(Math.random() * 5000) + 500,
      originalPrice: Math.floor(Math.random() * 7000) + 1000,
      discount: Math.random() > 0.3 ? Math.floor(Math.random() * 40) + 10 : 0,
      image: `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&${i}`,
      inStock: true,
      category: ['Cement', 'Steel', 'Bricks', 'Tiles'][i % 4],
      rating: 3.8 + Math.random() * 1.2,
    }));

    setCategories(sampleCategories);
    setFeaturedProducts(sampleProducts);
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('Category', {
      categoryId: category.id,
      categoryName: category.name
    });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryImageContainer}>
        <Image
          source={{ uri: item.image || `https://via.placeholder.com/150?text=${item.name.charAt(0)}` }}
          style={styles.categoryImage}
        />
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => {
    const discount = item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.productImage}
            defaultSource={require('../../assets//images/b2.jpg')}
          />
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productBrand} numberOfLines={1}>
            {item.brand}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              {formatPrice(item.price)}
            </Text>
            {item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.originalPrice)}
              </Text>
            )}
          </View>

          {item.inStock ? (
            <Text style={styles.inStockText}>In Stock</Text>
          ) : (
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          )}
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
      <Navbar />

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
        <HeroCarousel images={heroImages} />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CategoriesMain')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories.slice(0, 6)}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productsGrid}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PostRequirement')}
          >
            <Icon name="document-text" size={24} color="#800000" />
            <Text style={styles.actionText}>Post Requirement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ContractorDashboard')}
          >
            <Icon name="construct" size={24} color="#800000" />
            <Text style={styles.actionText}>Contractors</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SellerDashboard')}
          >
            <Icon name="storefront" size={24} color="#800000" />
            <Text style={styles.actionText}>Sell</Text>
          </TouchableOpacity>
        </View>

        {/* Why Choose Us Section */}
        <View style={[styles.section, styles.whyChooseSection]}>
          <Text style={styles.sectionTitle}>Why Choose BricksIT?</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Icon name="shield-checkmark" size={32} color="#800000" />
              <Text style={styles.featureTitle}>100% Authentic</Text>
              <Text style={styles.featureDescription}>
                Certified and genuine materials only
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="time" size={32} color="#800000" />
              <Text style={styles.featureTitle}>Fast Delivery</Text>
              <Text style={styles.featureDescription}>
                Quick delivery to your construction site
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="cash" size={32} color="#800000" />
              <Text style={styles.featureTitle}>Best Prices</Text>
              <Text style={styles.featureDescription}>
                Competitive pricing with no hidden charges
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="headset" size={32} color="#800000" />
              <Text style={styles.featureTitle}>24/7 Support</Text>
              <Text style={styles.featureDescription}>
                Expert support for all your queries
              </Text>
            </View>
          </View>
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
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAllText: {
    color: '#800000',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  categoryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  productsGrid: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productCard: {
    width: (width - 40) / 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 8,
  },
  productBrand: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  inStockText: {
    fontSize: 11,
    color: '#28a745',
  },
  outOfStockText: {
    fontSize: 11,
    color: '#dc3545',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#800000',
    fontWeight: '500',
  },
  whyChooseSection: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  featureItem: {
    width: '50%',
    alignItems: 'center',
    padding: 16,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  footerSpace: {
    height: 80,
  },
});

export default HomeScreen;