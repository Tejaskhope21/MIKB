import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  TextInput,
  RefreshControl,
  Modal,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchAllTrendingProducts,
  fetchTrendingCategories,
  fetchAllCategories,
  trackTrendingClick,
} from '../services/featuresApi';
import { formatPrice, getProductImage } from '../services/api';

const { width } = Dimensions.get('window');

// Product Card Component
const ProductCard = ({ item, index }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  
  const handlePress = async () => {
    try {
      await trackTrendingClick(item.id);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
    
    router.push({
      pathname: '/productDetails/[id]',
      params: { 
        id: item.id,
        fromTrending: 'true',
        name: item.name,
      },
    });
  };
  
  // Calculate discount
  const discount = item.discount || 
    (item.originalPrice > item.price ? 
      Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0);
  
  // Trending rank badge
  const getRankBadge = () => {
    if (index < 3) {
      const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
      const labels = ['#1', '#2', '#3'];
      return {
        label: labels[index],
        color: colors[index],
        textColor: index === 2 ? '#fff' : '#000'
      };
    }
    return null;
  };
  
  const rankBadge = getRankBadge();
  
  return (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ 
            uri: !imageError ? 
              (item.image || getProductImage(item.images)) : 
              'https://via.placeholder.com/300'
          }}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        
        {/* Rank Badge */}
        {rankBadge && (
          <View style={[styles.rankBadge, { backgroundColor: rankBadge.color }]}>
            <Text style={[styles.rankBadgeText, { color: rankBadge.textColor }]}>
              {rankBadge.label}
            </Text>
          </View>
        )}
        
        {/* Discount Badge */}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discount}% OFF</Text>
          </View>
        )}
        
        {/* Trending Badge */}
        <View style={styles.trendingBadge}>
          <Ionicons name="trending-up" size={12} color="#fff" />
          <Text style={styles.trendingBadgeText}>TRENDING</Text>
        </View>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productBrand} numberOfLines={1}>
          {item.brand || 'Premium Brand'}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        
        {/* Trend Stats */}
        <View style={styles.trendStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={12} color="#666" />
            <Text style={styles.statText}>{item.views?.toLocaleString() || '0'}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="trending-up" size={12} color="#800000" />
            <Text style={styles.statText}>{item.trendScore || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="cart-outline" size={12} color="#666" />
            <Text style={styles.statText}>{item.purchases?.toLocaleString() || '0'}</Text>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          {item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
          )}
        </View>
        
        {/* Stock Status */}
        <View style={styles.stockContainer}>
          {item.inStock ? (
            <>
              <Ionicons name="checkmark-circle" size={12} color="#28a745" />
              <Text style={styles.inStockText}>In Stock{item.stockQuantity ? ` (${item.stockQuantity})` : ''}</Text>
            </>
          ) : (
            <>
              <Ionicons name="close-circle" size={12} color="#dc3545" />
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </>
          )}
        </View>
        
        {/* Category */}
        {item.category && (
          <Text style={styles.categoryText}>
            <Ionicons name="cube-outline" size={12} color="#666" /> {item.category}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Category Filter Modal
const CategoryFilterModal = ({ 
  visible, 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  onClose 
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter by Category</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.categoriesList}>
            {/* All Categories Option */}
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedCategory === 'all' && styles.categoryItemSelected
              ]}
              onPress={() => onSelectCategory('all')}
            >
              <View style={styles.categoryIcon}>
                <Ionicons name="grid-outline" size={24} color="#800000" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === 'all' && styles.categoryNameSelected
                ]}>
                  All Categories
                </Text>
                <Text style={styles.categoryCount}>All trending products</Text>
              </View>
              {selectedCategory === 'all' && (
                <Ionicons name="checkmark-circle" size={20} color="#800000" />
              )}
            </TouchableOpacity>
            
            {/* Category List */}
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.categoryItemSelected
                ]}
                onPress={() => onSelectCategory(category.id)}
              >
                <View style={styles.categoryIcon}>
                  {category.image ? (
                    <Image 
                      source={{ uri: category.image }} 
                      style={styles.categoryImage} 
                    />
                  ) : (
                    <Ionicons name={category.icon || 'cube-outline'} size={24} color="#800000" />
                  )}
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={[
                    styles.categoryName,
                    selectedCategory === category.id && styles.categoryNameSelected
                  ]}>
                    {category.name}
                  </Text>
                  <Text style={styles.categoryCount}>
                    {category.count} trending products
                  </Text>
                </View>
                {selectedCategory === category.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#800000" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={onClose}
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Sort Options Modal
const SortModal = ({ visible, sortBy, onSelectSort, onClose }) => {
  const sortOptions = [
    { id: 'trending', label: 'Most Trending', icon: 'trending-up' },
    { id: 'views', label: 'Most Views', icon: 'eye' },
    { id: 'price-low', label: 'Price: Low to High', icon: 'arrow-up' },
    { id: 'price-high', label: 'Price: High to Low', icon: 'arrow-down' },
    { id: 'discount', label: 'Highest Discount', icon: 'pricetag' },
    { id: 'newest', label: 'Newest First', icon: 'time' },
  ];
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.sortModalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sortModalContainer}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.sortOption}
              onPress={() => {
                onSelectSort(option.id);
                onClose();
              }}
            >
              <View style={styles.sortOptionIcon}>
                <Ionicons 
                  name={option.icon} 
                  size={20} 
                  color={sortBy === option.id ? '#800000' : '#666'} 
                />
              </View>
              <Text style={[
                styles.sortOptionText,
                sortBy === option.id && styles.sortOptionTextSelected
              ]}>
                {option.label}
              </Text>
              {sortBy === option.id && (
                <Ionicons name="checkmark" size={20} color="#800000" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// Main Trending Screen
const TrendingScreen = () => {
  const router = useRouter();
  
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState('trending');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Load trending products
  const loadTrendingProducts = async (pageNum = 1, category = selectedCategory) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const result = await fetchAllTrendingProducts(20, category, pageNum);
      
      if (pageNum === 1) {
        setProducts(result.products);
      } else {
        setProducts(prev => [...prev, ...result.products]);
      }
      
      setTotalProducts(result.total);
      setHasMore(result.hasMore);
      setPage(pageNum);
      
      // Animate in
      if (pageNum === 1) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
      
    } catch (error) {
      console.error('Error loading trending products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };
  
  // Load categories
  const loadCategories = async () => {
    try {
      let categoriesData = await fetchTrendingCategories();
      
      // If no trending categories, fall back to all categories
      if (!categoriesData || categoriesData.length === 0) {
        categoriesData = await fetchAllCategories();
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadCategories();
    loadTrendingProducts(1);
  }, []);
  
  // Handle category change
  useEffect(() => {
    if (selectedCategory) {
      setPage(1);
      loadTrendingProducts(1, selectedCategory);
    }
  }, [selectedCategory]);
  
  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrendingProducts(1);
    loadCategories();
  }, [selectedCategory]);
  
  // Handle load more
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadTrendingProducts(page + 1);
    }
  };
  
  // Sort products
  const sortProducts = (productsToSort) => {
    const sorted = [...productsToSort];
    
    switch (sortBy) {
      case 'trending':
        return sorted.sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0));
      case 'views':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'discount':
        return sorted.sort((a, b) => {
          const discountA = a.discount || 0;
          const discountB = b.discount || 0;
          return discountB - discountA;
        });
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return sorted;
    }
  };
  
  // Filter products by search
  const filteredProducts = sortProducts(
    searchQuery.trim() 
      ? products.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : products
  );
  
  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>Trending Products</Text>
        <Text style={styles.headerSubtitle}>
          {totalProducts} products • Based on popularity
        </Text>
      </View>
    </View>
  );
  
  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={22} color="#666" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search trending products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#999"
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Ionicons name="close-circle" size={20} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Render filters
  const renderFilters = () => {
    const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name || 'All Categories';
    
    return (
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Ionicons name="filter-outline" size={18} color="#800000" />
          <Text style={styles.filterButtonText} numberOfLines={1}>
            {selectedCategoryName}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical-outline" size={18} color="#800000" />
          <Text style={styles.filterButtonText}>
            {sortBy === 'trending' ? 'Trending' :
             sortBy === 'views' ? 'Most Views' :
             sortBy === 'price-low' ? 'Price: Low to High' :
             sortBy === 'price-high' ? 'Price: High to Low' :
             sortBy === 'discount' ? 'Highest Discount' : 'Newest'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trending-up-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Trending Products</Text>
      <Text style={styles.emptyText}>
        {searchQuery 
          ? `No results found for "${searchQuery}"`
          : selectedCategory !== 'all'
            ? `No trending products in this category`
            : 'No trending products available at the moment'
        }
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory('all');
        }}
      >
        <Text style={styles.exploreButtonText}>
          {searchQuery ? 'Clear Search' : selectedCategory !== 'all' ? 'View All' : 'Refresh'}
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render footer loading
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#800000" />
        <Text style={styles.footerLoadingText}>Loading more...</Text>
      </View>
    );
  };
  
  // Render product grid
  const renderProductGrid = () => (
    <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
      <FlatList
        data={filteredProducts}
        renderItem={({ item, index }) => (
          <ProductCard item={item} index={index} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productsGrid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
        ListEmptyComponent={!loading && renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#800000']}
            tintColor="#800000"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </Animated.View>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {renderHeader()}
      
      <View style={styles.content}>
        {renderSearchBar()}
        {renderFilters()}
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#800000" />
            <Text style={styles.loadingText}>Loading trending products...</Text>
          </View>
        ) : (
          renderProductGrid()
        )}
      </View>
      
      <CategoryFilterModal
        visible={showCategoryModal}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onClose={() => setShowCategoryModal(false)}
      />
      
      <SortModal
        visible={showSortModal}
        sortBy={sortBy}
        onSelectSort={setSortBy}
        onClose={() => setShowSortModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  // Filters
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  // Products Grid
  productsContainer: {
    paddingBottom: 100,
  },
  productsGrid: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  // Product Card
  productCard: {
    width: (width - 40) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImageContainer: {
    position: 'relative',
    height: 140,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#800000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  trendingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 0, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
    height: 36,
  },
  trendStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#800000',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  inStockText: {
    fontSize: 11,
    color: '#28a745',
    fontWeight: '600',
    marginLeft: 4,
  },
  outOfStockText: {
    fontSize: 11,
    color: '#dc3545',
    fontWeight: '600',
    marginLeft: 4,
  },
  categoryText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#800000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Footer Loading
  footerLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footerLoadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  // Category Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  categoriesList: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  categoryItemSelected: {
    backgroundColor: '#f8f0f0',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  categoryNameSelected: {
    color: '#800000',
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  applyButton: {
    backgroundColor: '#800000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Sort Modal
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sortOptionIcon: {
    width: 30,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  sortOptionTextSelected: {
    color: '#800000',
    fontWeight: '600',
  },
});

export default TrendingScreen;