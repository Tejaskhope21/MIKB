// app/(tabs)/all-products.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Import your API functions
import { fetchCategories, fetchProducts, formatPrice } from '../services/api';

const { width } = Dimensions.get('window');

const AllProductsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = params.categoryId;
  const categoryName = params.name;

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: categoryId || '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'default',
  });

  // Modal states
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(true);
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  // Load categories
  const loadCategories = async () => {
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData || []);
      return categoriesData;
    } catch (err) {
      console.error('Error loading categories:', err);
      return [];
    }
  };

  // Load products with filters
  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = {
        page,
        limit: pagination.limit,
      };

      // Add filters
      if (filters.search) queryParams.search = filters.search;
      if (filters.category) queryParams.category = filters.category;
      if (filters.brand) queryParams.brand = filters.brand;
      if (filters.minPrice) queryParams.minPrice = filters.minPrice;
      if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
      if (filters.sortBy !== 'default') queryParams.sort = filters.sortBy;

      // Fetch products
      const productsData = await fetchProducts(queryParams);

      // Handle response structure
      if (Array.isArray(productsData)) {
        setProducts(productsData);
        setPagination({
          page: 1,
          limit: 20,
          total: productsData.length,
          pages: 1,
        });

        // Extract unique brands
        const uniqueBrands = [...new Set(
          productsData
            .map(p => p.brand)
            .filter(brand => brand && brand.trim() !== '')
            .sort((a, b) => a.localeCompare(b))
        )];
        setBrands(uniqueBrands);
      } else if (productsData.items && productsData.pagination) {
        setProducts(productsData.items || []);
        setPagination(productsData.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 1,
        });

        // Extract unique brands
        const uniqueBrands = [...new Set(
          (productsData.items || [])
            .map(p => p.brand)
            .filter(brand => brand && brand.trim() !== '')
            .sort((a, b) => a.localeCompare(b))
        )];
        setBrands(uniqueBrands);
      } else {
        setProducts([]);
        setBrands([]);
      }

    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      await loadCategories();
      await loadProducts();
    };
    initializeData();
  }, []);

  // Reload when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadProducts(1);
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: categoryId || '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'default',
    });
    setShowFiltersModal(false);
  };

  // Handle product press
  const handleProductPress = (product) => {
    router.push({
      pathname: '/productDetails/[id]',
      params: { id: product._id || product.id },
    });
  };

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      loadProducts(newPage);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = filters.search || 
    (filters.category && filters.category !== categoryId) || 
    filters.brand || 
    filters.minPrice || 
    filters.maxPrice;

  // Render product item
  const renderProductItem = ({ item }) => {
    const discount = item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
          {item.inStock === false && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productBrand} numberOfLines={1}>
            {item.brand || 'Unknown Brand'}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name || 'Unnamed Product'}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
            {item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.originalPrice)}
              </Text>
            )}
          </View>

          <View style={styles.productMeta}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.0'}</Text>
            </View>
            <Text style={styles.categoryTag}>
              {item.category || 'Uncategorized'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render category filter item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        filters.category === item._id && styles.filterOptionSelected
      ]}
      onPress={() => handleFilterChange('category', item._id)}
    >
      <View style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          filters.category === item._id && styles.checkboxSelected
        ]}>
          {filters.category === item._id && (
            <Ionicons name="checkmark" size={14} color="#fff" />
          )}
        </View>
      </View>
      <Text style={[
        styles.filterOptionText,
        filters.category === item._id && styles.filterOptionTextSelected
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render brand filter item
  const renderBrandItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        filters.brand === item && styles.filterOptionSelected
      ]}
      onPress={() => handleFilterChange('brand', item)}
    >
      <View style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          filters.brand === item && styles.checkboxSelected
        ]}>
          {filters.brand === item && (
            <Ionicons name="checkmark" size={14} color="#fff" />
          )}
        </View>
      </View>
      <Text style={[
        styles.filterOptionText,
        filters.brand === item && styles.filterOptionTextSelected
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#800000" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {categoryName ? categoryName : 'All Products'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#800000" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {categoryName ? categoryName : 'All Products'}
        </Text>
        <TouchableOpacity 
          onPress={() => setShowFiltersModal(true)} 
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
        >
          <MaterialIcons 
            name="filter-list" 
            size={24} 
            color="#fff" 
          />
          {hasActiveFilters && <View style={styles.filterIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInner}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search products..."
            value={filters.search}
            onChangeText={(text) => handleFilterChange('search', text)}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
          {filters.search ? (
            <TouchableOpacity onPress={() => handleFilterChange('search', '')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortOptions}>
          {['default', 'price-low', 'price-high', 'discount', 'rating', 'newest'].map((sort) => (
            <TouchableOpacity
              key={sort}
              style={[styles.sortButton, filters.sortBy === sort && styles.sortButtonActive]}
              onPress={() => handleFilterChange('sortBy', sort)}
            >
              <Text style={[
                styles.sortButtonText,
                filters.sortBy === sort && styles.sortButtonTextActive
              ]}>
                {sort === 'default' ? 'Default' : 
                 sort === 'price-low' ? 'Price: Low to High' :
                 sort === 'price-high' ? 'Price: High to Low' :
                 sort === 'discount' ? 'Best Discount' :
                 sort === 'rating' ? 'Top Rated' : 'Newest'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Active Filters Bar */}
      {hasActiveFilters ? (
        <View style={styles.activeFiltersBar}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.activeFiltersScroll}
          >
            <View style={styles.activeFiltersContent}>
              {filters.category && categories.find(c => c._id === filters.category) ? (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>
                    {categories.find(c => c._id === filters.category).name}
                  </Text>
                  <TouchableOpacity onPress={() => handleFilterChange('category', '')}>
                    <Ionicons name="close" size={16} color="#800000" />
                  </TouchableOpacity>
                </View>
              ) : null}
              
              {filters.brand ? (
                <View style={[styles.activeFilterTag, styles.brandTag]}>
                  <Text style={styles.activeFilterText}>{filters.brand}</Text>
                  <TouchableOpacity onPress={() => handleFilterChange('brand', '')}>
                    <Ionicons name="close" size={16} color="#7c3aed" />
                  </TouchableOpacity>
                </View>
              ) : null}
              
              {filters.minPrice ? (
                <View style={[styles.activeFilterTag, styles.priceTag]}>
                  <Text style={styles.activeFilterText}>Min: ₹{filters.minPrice}</Text>
                  <TouchableOpacity onPress={() => handleFilterChange('minPrice', '')}>
                    <Ionicons name="close" size={16} color="#059669" />
                  </TouchableOpacity>
                </View>
              ) : null}
              
              {filters.maxPrice ? (
                <View style={[styles.activeFilterTag, styles.priceTag]}>
                  <Text style={styles.activeFilterText}>Max: ₹{filters.maxPrice}</Text>
                  <TouchableOpacity onPress={() => handleFilterChange('maxPrice', '')}>
                    <Ionicons name="close" size={16} color="#059669" />
                  </TouchableOpacity>
                </View>
              ) : null}
              
              <TouchableOpacity onPress={clearAllFilters} style={styles.clearAllButton}>
                <Text style={styles.clearAllText}>Clear All</Text>
                <Ionicons name="close-circle" size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      ) : null}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {products.length} of {pagination.total} products
        </Text>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={40} color="#800000" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => loadProducts()}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Products Grid */}
      <View style={styles.mainContent}>
        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id || item.id}
            numColumns={2}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={['#800000']}
                tintColor="#800000"
              />
            }
            contentContainerStyle={styles.productsContainer}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              pagination.pages > 1 ? (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    onPress={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    style={[styles.pageButton, pagination.page === 1 && styles.pageButtonDisabled]}
                  >
                    <Ionicons 
                      name="chevron-back" 
                      size={20} 
                      color={pagination.page === 1 ? '#ccc' : '#666'} 
                    />
                    <Text style={[
                      styles.pageButtonText, 
                      pagination.page === 1 && styles.pageButtonTextDisabled
                    ]}>
                      Previous
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.pageNumbers}>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      if (pageNum < 1 || pageNum > pagination.pages) return null;

                      return (
                        <TouchableOpacity
                          key={pageNum}
                          onPress={() => handlePageChange(pageNum)}
                          style={[
                            styles.pageNumberButton,
                            pagination.page === pageNum && styles.pageNumberButtonActive
                          ]}
                        >
                          <Text style={[
                            styles.pageNumberText,
                            pagination.page === pageNum && styles.pageNumberTextActive
                          ]}>
                            {pageNum}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    onPress={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    style={[styles.pageButton, pagination.page === pagination.pages && styles.pageButtonDisabled]}
                  >
                    <Text style={[
                      styles.pageButtonText, 
                      pagination.page === pagination.pages && styles.pageButtonTextDisabled
                    ]}>
                      Next
                    </Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={pagination.page === pagination.pages ? '#ccc' : '#666'} 
                    />
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#800000']}
                tintColor="#800000"
              />
            }
          >
            <View style={styles.emptyContent}>
              <MaterialCommunityIcons name="package-variant-closed" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptyText}>
                {filters.search 
                  ? `No products match "${filters.search}"` 
                  : "No products available in this category."}
              </Text>
              {hasActiveFilters ? (
                <TouchableOpacity style={styles.primaryButton} onPress={clearAllFilters}>
                  <Text style={styles.primaryButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity onPress={clearAllFilters} style={styles.modalClearButton}>
                  <Text style={styles.modalClearText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowFiltersModal(false)} 
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              
              {/* Categories Filter */}
              {categories.length > 0 ? (
                <View style={styles.filterSection}>
                  <TouchableOpacity
                    style={styles.filterSectionHeader}
                    onPress={() => setShowCategoryFilter(!showCategoryFilter)}
                  >
                    <Text style={styles.filterSectionTitle}>Categories</Text>
                    <Ionicons 
                      name={showCategoryFilter ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>

                  {showCategoryFilter ? (
                    <View style={styles.filterOptions}>
                      <TouchableOpacity
                        style={[
                          styles.filterOption,
                          !filters.category && styles.filterOptionSelected
                        ]}
                        onPress={() => handleFilterChange('category', '')}
                      >
                        <View style={styles.checkboxContainer}>
                          <View style={[
                            styles.checkbox,
                            !filters.category && styles.checkboxSelected
                          ]}>
                            {!filters.category ? (
                              <Ionicons name="checkmark" size={14} color="#fff" />
                            ) : null}
                          </View>
                        </View>
                        <Text style={[
                          styles.filterOptionText,
                          !filters.category && styles.filterOptionTextSelected
                        ]}>
                          All Categories
                        </Text>
                      </TouchableOpacity>

                      <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item._id}
                        scrollEnabled={false}
                        contentContainerStyle={styles.filterList}
                      />
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* Brands Filter */}
              {brands.length > 0 ? (
                <View style={styles.filterSection}>
                  <TouchableOpacity
                    style={styles.filterSectionHeader}
                    onPress={() => setShowBrandFilter(!showBrandFilter)}
                  >
                    <Text style={styles.filterSectionTitle}>Brands</Text>
                    <Ionicons 
                      name={showBrandFilter ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>

                  {showBrandFilter ? (
                    <View style={styles.filterOptions}>
                      <TouchableOpacity
                        style={[
                          styles.filterOption,
                          !filters.brand && styles.filterOptionSelected
                        ]}
                        onPress={() => handleFilterChange('brand', '')}
                      >
                        <View style={styles.checkboxContainer}>
                          <View style={[
                            styles.checkbox,
                            !filters.brand && styles.checkboxSelected
                          ]}>
                            {!filters.brand ? (
                              <Ionicons name="checkmark" size={14} color="#fff" />
                            ) : null}
                          </View>
                        </View>
                        <Text style={[
                          styles.filterOptionText,
                          !filters.brand && styles.filterOptionTextSelected
                        ]}>
                          All Brands
                        </Text>
                      </TouchableOpacity>

                      <FlatList
                        data={brands}
                        renderItem={renderBrandItem}
                        keyExtractor={(item) => item}
                        scrollEnabled={false}
                        contentContainerStyle={styles.filterList}
                      />
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* Price Range Filter */}
              <View style={styles.filterSection}>
                <TouchableOpacity
                  style={styles.filterSectionHeader}
                  onPress={() => setShowPriceFilter(!showPriceFilter)}
                >
                  <Text style={styles.filterSectionTitle}>Price Range</Text>
                  <Ionicons 
                    name={showPriceFilter ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>

                {showPriceFilter ? (
                  <View style={styles.filterOptions}>
                    <View style={styles.priceInputContainer}>
                      <View style={styles.priceInputWrapper}>
                        <Text style={styles.priceLabel}>Minimum Price</Text>
                        <View style={styles.priceInput}>
                          <Text style={styles.priceSymbol}>₹</Text>
                          <TextInput
                            value={filters.minPrice}
                            onChangeText={(text) => handleFilterChange('minPrice', text)}
                            placeholder="0"
                            keyboardType="numeric"
                            style={styles.priceInputField}
                            placeholderTextColor="#999"
                          />
                        </View>
                      </View>
                      
                      <View style={styles.priceSeparatorContainer}>
                        <View style={styles.priceSeparatorLine} />
                        <Text style={styles.priceSeparator}>to</Text>
                        <View style={styles.priceSeparatorLine} />
                      </View>
                      
                      <View style={styles.priceInputWrapper}>
                        <Text style={styles.priceLabel}>Maximum Price</Text>
                        <View style={styles.priceInput}>
                          <Text style={styles.priceSymbol}>₹</Text>
                          <TextInput
                            value={filters.maxPrice}
                            onChangeText={(text) => handleFilterChange('maxPrice', text)}
                            placeholder="100000"
                            keyboardType="numeric"
                            style={styles.priceInputField}
                            placeholderTextColor="#999"
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.secondaryButton]} 
                onPress={() => setShowFiltersModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.primaryButton]} 
                onPress={() => {
                  setShowFiltersModal(false);
                  loadProducts(1);
                }}
              >
                <Text style={styles.primaryButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  
  // Header
  header: {
    backgroundColor: '#800000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffd700',
    borderWidth: 1,
    borderColor: '#800000',
  },
  
  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    padding: 0,
  },
  
  // Sort
  sortContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sortLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sortButtonActive: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  
  // Active Filters
  activeFiltersBar: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  activeFiltersScroll: {
    paddingLeft: 16,
  },
  activeFiltersContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilterText: {
    fontSize: 12,
    color: '#334155',
    marginRight: 6,
  },
  brandTag: {
    backgroundColor: '#f3e8ff',
    borderColor: '#ddd6fe',
  },
  priceTag: {
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearAllText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
    marginRight: 6,
  },
  
  // Results
  resultsHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748b',
  },
  
  // Main Content
  mainContent: {
    flex: 1,
  },
  productsContainer: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  
  // Product Card
  productCard: {
    flex: 1,
    maxWidth: (width - 56) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  outOfStockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#800000',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  categoryTag: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    marginHorizontal: 4,
  },
  pageButtonTextDisabled: {
    color: '#cbd5e1',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageNumberButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  pageNumberButtonActive: {
    backgroundColor: '#800000',
  },
  pageNumberText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  pageNumberTextActive: {
    color: '#fff',
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: '#800000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalClearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fee2e2',
  },
  modalClearText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  
  // Filter Sections
  filterSection: {
    marginTop: 20,
    marginBottom: 8,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  filterOptions: {
    paddingTop: 12,
  },
  
  // Filter Options
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  filterOptionSelected: {
    backgroundColor: 'rgba(128, 0, 0, 0.1)',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
  },
  filterOptionTextSelected: {
    color: '#800000',
    fontWeight: '500',
  },
  filterList: {
    paddingTop: 4,
  },
  
  // Price Range
  priceInputContainer: {
    marginTop: 8,
  },
  priceInputWrapper: {
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 8,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f8fafc',
  },
  priceSymbol: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
    marginRight: 8,
  },
  priceInputField: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  priceSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  priceSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  priceSeparator: {
    fontSize: 14,
    color: '#64748b',
    marginHorizontal: 12,
    fontWeight: '500',
  },
});

export default AllProductsScreen;