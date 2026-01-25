import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
  TextInput,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://bricks-backend-qyea.onrender.com';

export default function AllProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isFirstRender = useRef(true);

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(params.categoryId || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // UI states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [currentCategoryInfo, setCurrentCategoryInfo] = useState({
    name: params.categoryName || 'All Products',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  /* ================= API FUNCTIONS ================= */
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const fetchCategoryDetails = async (categoryId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/products/category/${categoryId}/with-subcategories`
      );
      const data = await res.json();
      setSubcategories(data.subcategories || []);
      setCurrentCategoryInfo(data.category || { name: 'Category' });
      
      // Extract brands from category products
      if (data.products?.items) {
        extractBrandsFromProducts(data.products.items);
      }
    } catch (err) {
      console.error('Fetch category details error:', err);
    }
  };

  const fetchAllBrands = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/brands`);
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || data || []);
      }
    } catch (err) {
      console.error('Fetch brands error:', err);
    }
  };

  const extractBrandsFromProducts = (productList) => {
    const uniqueBrands = [...new Set(
      productList
        .map(p => p.brand)
        .filter(brand => brand && brand.trim() !== '' && brand !== 'Unknown Brand')
        .sort((a, b) => a.localeCompare(b))
    )];
    setBrands(prev => {
      const combined = [...new Set([...prev, ...uniqueBrands])];
      return combined.sort((a, b) => a.localeCompare(b));
    });
  };

  const fetchProducts = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    
    try {
      let query = new URLSearchParams();

      // Add pagination
      query.append('page', pagination.page);
      query.append('limit', pagination.limit);
      query.append('sortBy', sortBy);
      query.append('sortOrder', sortOrder);

      // Add search
      if (searchTerm.trim()) {
        query.append('search', searchTerm.trim());
      }

      // Only apply filters when NOT "all"
      if (selectedCategory !== 'all') {
        if (selectedSubcategory !== 'all') {
          query.append('subcategoryId', selectedSubcategory);
        }
        if (selectedBrand !== 'all') {
          query.append('brand', selectedBrand);
        }
      } else if (selectedBrand !== 'all') {
        // Apply brand filter even when category is "all"
        query.append('brand', selectedBrand);
      }

      // Add price filters
      if (minPrice && !isNaN(minPrice) && minPrice !== '') {
        query.append('minPrice', parseInt(minPrice));
      }
      
      if (maxPrice && !isNaN(maxPrice) && maxPrice !== '') {
        query.append('maxPrice', parseInt(maxPrice));
      }

      const url = selectedCategory === 'all'
        ? `${API_BASE_URL}/api/products?${query}`
        : `${API_BASE_URL}/api/products/category/${selectedCategory}/products?${query}`;

      console.log('Fetching from:', url);

      const res = await fetch(url);
      const data = await res.json();

      const productsList = data.products?.items || data.products || [];
      setProducts(productsList);
      
      // Update pagination
      setPagination(data.products?.pagination || {
        page: pagination.page,
        limit: 20,
        total: productsList.length,
        pages: 1
      });

      // Extract brands from products
      if (productsList.length > 0 && brands.length === 0) {
        extractBrandsFromProducts(productsList);
      }

    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchCategories(),
        fetchAllBrands(),
        fetchProducts()
      ]);
    };
    init();
  }, []);

  /* ================= FILTER EFFECT ================= */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
    
    fetchProducts();

    if (selectedCategory === 'all') {
      setSubcategories([]);
      setCurrentCategoryInfo({ name: 'All Products' });
    } else {
      fetchCategoryDetails(selectedCategory);
    }
  }, [selectedCategory, selectedSubcategory, selectedBrand, minPrice, maxPrice, sortBy, sortOrder, searchTerm]);

  /* ================= PAGE CHANGE EFFECT ================= */
  useEffect(() => {
    if (pagination.page > 1) {
      fetchProducts();
    }
  }, [pagination.page]);

  /* ================= HANDLERS ================= */
  const handleCategorySelect = (categoryId) => {
    if (categoryId === 'all') {
      setSelectedCategory('all');
      setSelectedSubcategory('all');
      setSelectedBrand('all');
      setSubcategories([]);
      setCurrentCategoryInfo({ name: 'All Products' });
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory('all');
      setSelectedBrand('all');
      
      const selectedCat = categories.find(c => c._id === categoryId);
      setCurrentCategoryInfo(selectedCat || { name: 'Category' });
    }
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedBrand('all');
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setSubcategories([]);
    setCurrentCategoryInfo({ name: 'All Products' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProducts(true);
  };

  const handleProductPress = (productId) => {
    router.push({
      pathname: '/productDetails/[id]',
      params: { id: productId }
    });
  };

  /* ================= RENDER HELPERS ================= */
  const renderProductItem = ({ item }) => {
    const originalPrice = item.originalPrice || item.mrp || item.price || 0;
    const currentPrice = item.price || item.sellingPrice || item.discountedPrice || 0;
    let discount = 0;
    
    if (originalPrice > currentPrice && originalPrice > 0) {
      discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    return (
      <TouchableOpacity 
        style={[styles.productCard, viewMode === 'grid' ? styles.productCardGrid : styles.productCardList]}
        onPress={() => handleProductPress(item._id)}
        activeOpacity={0.9}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={{ uri: item.image || item.images?.[0] }} 
            style={styles.productImage}
            resizeMode="cover"
          />
          
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productBrand}>{item.brand || '—'}</Text>
          
          <View style={styles.productPriceRow}>
            <Text style={styles.currentPrice}>₹{Math.round(currentPrice)}</Text>
            {discount > 0 && (
              <Text style={styles.originalPrice}>₹{Math.round(originalPrice)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* ================= CHECK ACTIVE FILTERS ================= */
  const hasActiveFilters = selectedCategory !== 'all' || 
                          selectedSubcategory !== 'all' || 
                          searchTerm.trim() !== '' || 
                          selectedBrand !== 'all' || 
                          minPrice !== '' || 
                          maxPrice !== '' || 
                          sortBy !== 'createdAt' || 
                          sortOrder !== 'desc';

  /* ================= LOADING STATE ================= */
  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
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

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentCategoryInfo.name}
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => setShowFiltersModal(true)} 
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
        >
          <MaterialIcons name="filter-list" size={24} color="#fff" />
          {hasActiveFilters && <View style={styles.filterIndicator} />}
        </TouchableOpacity>
      </View>

      {/* QUICK CATEGORY FILTERS */}
      {categories.length > 0 && (
        <View style={styles.quickFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFiltersScroll}>
            <TouchableOpacity
              style={[styles.quickFilter, selectedCategory === 'all' && styles.quickFilterActive]}
              onPress={() => handleCategorySelect('all')}
            >
              <Text style={[styles.quickFilterText, selectedCategory === 'all' && styles.quickFilterTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            
            {categories.slice(0, 8).map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={[styles.quickFilter, selectedCategory === cat._id && styles.quickFilterActive]}
                onPress={() => handleCategorySelect(cat._id)}
              >
                <Text style={[styles.quickFilterText, selectedCategory === cat._id && styles.quickFilterTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
            
            {categories.length > 8 && (
              <TouchableOpacity style={styles.viewAllFilter} onPress={() => setShowFiltersModal(true)}>
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#800000" />
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      

      {/* ACTIVE FILTERS BAR */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
            <View style={styles.activeFiltersContent}>
              {selectedCategory !== 'all' && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>{currentCategoryInfo.name}</Text>
                  <TouchableOpacity onPress={() => handleCategorySelect('all')}>
                    <Ionicons name="close" size={16} color="#800000" />
                  </TouchableOpacity>
                </View>
              )}
              
              {selectedSubcategory !== 'all' && (
                <View style={[styles.activeFilterTag, styles.subcategoryTag]}>
                  <Text style={styles.activeFilterText}>
                    {subcategories.find(s => s._id === selectedSubcategory)?.title || 'Subcategory'}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedSubcategory('all')}>
                    <Ionicons name="close" size={16} color="#800000" />
                  </TouchableOpacity>
                </View>
              )}
              
              {selectedBrand !== 'all' && (
                <View style={[styles.activeFilterTag, styles.brandTag]}>
                  <Text style={styles.activeFilterText}>Brand: {selectedBrand}</Text>
                  <TouchableOpacity onPress={() => setSelectedBrand('all')}>
                    <Ionicons name="close" size={16} color="#800000" />
                  </TouchableOpacity>
                </View>
              )}
              
              {minPrice && (
                <View style={[styles.activeFilterTag, styles.priceTag]}>
                  <Text style={styles.activeFilterText}>Min: ₹{minPrice}</Text>
                  <TouchableOpacity onPress={() => setMinPrice('')}>
                    <Ionicons name="close" size={16} color="#800000" />
                  </TouchableOpacity>
                </View>
              )}
              
              {maxPrice && (
                <View style={[styles.activeFilterTag, styles.priceTag]}>
                  <Text style={styles.activeFilterText}>Max: ₹{maxPrice}</Text>
                  <TouchableOpacity onPress={() => setMaxPrice('')}>
                    <Ionicons name="close" size={16} color="#800000" />
                  </TouchableOpacity>
                </View>
              )}
              
              {(sortBy !== 'createdAt' || sortOrder !== 'desc') && (
                <View style={[styles.activeFilterTag, styles.sortTag]}>
                  <Text style={styles.activeFilterText}>
                    Sort: {sortBy === 'price' ? (sortOrder === 'asc' ? 'Price Low to High' : 'Price High to Low') : 'Newest'}
                  </Text>
                  <TouchableOpacity onPress={() => { setSortBy('createdAt'); setSortOrder('desc'); }}>
                    <Ionicons name="close" size={16} color="#800000" />
                  </TouchableOpacity>
                </View>
              )}
              
              <TouchableOpacity onPress={handleClearFilters} style={styles.clearAllButton}>
                <Text style={styles.clearAllText}>Clear All</Text>
                <Ionicons name="close-circle" size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* MAIN CONTENT */}
      <View style={styles.mainContent}>
        {/* PRODUCTS LIST */}
        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                colors={['#800000']}
              />
            }
            onEndReached={() => {
              if (!loading && pagination.page < pagination.pages) {
                handlePageChange(pagination.page + 1);
              }
            }}
            onEndReachedThreshold={0.5}
            contentContainerStyle={[
              styles.productsContainer,
              viewMode === 'grid' ? styles.gridContainer : styles.listContainer
            ]}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              loading && products.length > 0 ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#800000" />
                  <Text style={styles.footerLoaderText}>Loading more products...</Text>
                </View>
              ) : null
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <MaterialCommunityIcons name="package-variant-closed" size={80} color="#ccc" />
            </View>
            <Text style={styles.emptyStateTitle}>No Products Found</Text>
            <Text style={styles.emptyStateText}>
              {hasActiveFilters
                ? 'No products match your filters. Try changing your search criteria.'
                : 'There are no products available at the moment.'
              }
            </Text>
            <View style={styles.emptyStateButtons}>
              {hasActiveFilters && (
                <TouchableOpacity style={styles.primaryButton} onPress={handleClearFilters}>
                  <Text style={styles.primaryButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* PAGINATION */}
        {pagination.pages > 1 && products.length > 0 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              onPress={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              style={[styles.pageButton, pagination.page === 1 && styles.pageButtonDisabled]}
            >
              <Ionicons name="chevron-back" size={20} color={pagination.page === 1 ? '#ccc' : '#666'} />
              <Text style={[styles.pageButtonText, pagination.page === 1 && styles.pageButtonTextDisabled]}>
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
              <Text style={[styles.pageButtonText, pagination.page === pagination.pages && styles.pageButtonTextDisabled]}>
                Next
              </Text>
              <Ionicons name="chevron-forward" size={20} color={pagination.page === pagination.pages ? '#ccc' : '#666'} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* FILTERS MODAL */}
      <Modal
        visible={showFiltersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* MODAL HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Products</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity onPress={handleClearFilters} style={styles.modalClearButton}>
                  <Text style={styles.modalClearText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowFiltersModal(false)} style={styles.modalCloseButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* CATEGORIES SECTION */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Text style={styles.filterSectionTitle}>Categories</Text>
                  <View style={styles.filterSectionCountBadge}>
                    <Text style={styles.filterSectionCountText}>{categories.length}</Text>
                  </View>
                </View>
                
                <View style={styles.categoryGrid}>
                  <TouchableOpacity
                    style={[styles.categoryChipModal, selectedCategory === 'all' && styles.categoryChipModalSelected]}
                    onPress={() => handleCategorySelect('all')}
                  >
                    <Text style={[styles.categoryChipModalText, selectedCategory === 'all' && styles.categoryChipModalTextSelected]}>
                      All Categories
                    </Text>
                  </TouchableOpacity>
                  
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat._id}
                      style={[styles.categoryChipModal, selectedCategory === cat._id && styles.categoryChipModalSelected]}
                      onPress={() => handleCategorySelect(cat._id)}
                    >
                      <Text style={[styles.categoryChipModalText, selectedCategory === cat._id && styles.categoryChipModalTextSelected]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* SUBCATEGORIES SECTION */}
              {selectedCategory !== 'all' && subcategories.length > 0 && (
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Text style={styles.filterSectionTitle}>Subcategories</Text>
                    <View style={styles.filterSectionCountBadge}>
                      <Text style={styles.filterSectionCountText}>{subcategories.length}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.subcategoryGrid}>
                    <TouchableOpacity
                      style={[styles.subcategoryChipModal, selectedSubcategory === 'all' && styles.subcategoryChipModalSelected]}
                      onPress={() => setSelectedSubcategory('all')}
                    >
                      <Text style={[styles.subcategoryChipModalText, selectedSubcategory === 'all' && styles.subcategoryChipModalTextSelected]}>
                        All Subcategories
                      </Text>
                    </TouchableOpacity>
                    
                    {subcategories.map((sub) => (
                      <TouchableOpacity
                        key={sub._id}
                        style={[styles.subcategoryChipModal, selectedSubcategory === sub._id && styles.subcategoryChipModalSelected]}
                        onPress={() => setSelectedSubcategory(sub._id)}
                      >
                        <Text style={[styles.subcategoryChipModalText, selectedSubcategory === sub._id && styles.subcategoryChipModalTextSelected]}>
                          {sub.title}
                        </Text>
                        {sub.count && (
                          <View style={styles.subcategoryCountBadge}>
                            <Text style={styles.subcategoryCountText}>{sub.count}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* BRANDS SECTION */}
              {brands.length > 0 && (
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Text style={styles.filterSectionTitle}>Brands</Text>
                    <View style={styles.filterSectionCountBadge}>
                      <Text style={styles.filterSectionCountText}>{brands.length}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.brandGrid}>
                    <TouchableOpacity
                      style={[styles.brandChipModal, selectedBrand === 'all' && styles.brandChipModalSelected]}
                      onPress={() => setSelectedBrand('all')}
                    >
                      <Text style={[styles.brandChipModalText, selectedBrand === 'all' && styles.brandChipModalTextSelected]}>
                        All Brands
                      </Text>
                    </TouchableOpacity>
                    
                    {brands.map((brand) => (
                      <TouchableOpacity
                        key={brand}
                        style={[styles.brandChipModal, selectedBrand === brand && styles.brandChipModalSelected]}
                        onPress={() => setSelectedBrand(brand)}
                      >
                        <Text style={[styles.brandChipModalText, selectedBrand === brand && styles.brandChipModalTextSelected]}>
                          {brand}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* PRICE RANGE SECTION */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Text style={styles.filterSectionTitle}>Price Range</Text>
                  <TouchableOpacity onPress={() => setShowPriceFilter(!showPriceFilter)} style={styles.priceToggleButton}>
                    <Ionicons name={showPriceFilter ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {showPriceFilter && (
                  <View style={styles.priceInputContainer}>
                    <View style={styles.priceInputWrapper}>
                      <Text style={styles.priceLabel}>Minimum Price</Text>
                      <View style={styles.priceInput}>
                        <Text style={styles.priceSymbol}>₹</Text>
                        <TextInput
                          value={minPrice}
                          onChangeText={setMinPrice}
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
                          value={maxPrice}
                          onChangeText={setMaxPrice}
                          placeholder="10000"
                          keyboardType="numeric"
                          style={styles.priceInputField}
                          placeholderTextColor="#999"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* SORTING SECTION */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Text style={styles.filterSectionTitle}>Sort By</Text>
                </View>
                
                <View style={styles.sortOptions}>
                  <TouchableOpacity
                    style={[styles.sortOption, sortBy === 'createdAt' && sortOrder === 'desc' && styles.sortOptionSelected]}
                    onPress={() => handleSortChange('createdAt', 'desc')}
                  >
                    <MaterialIcons name="new-releases" size={20} color={sortBy === 'createdAt' && sortOrder === 'desc' ? '#800000' : '#666'} />
                    <Text style={[styles.sortOptionText, sortBy === 'createdAt' && sortOrder === 'desc' && styles.sortOptionTextSelected]}>
                      Newest First
                    </Text>
                    {sortBy === 'createdAt' && sortOrder === 'desc' && (
                      <Ionicons name="checkmark" size={20} color="#800000" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.sortOption, sortBy === 'price' && sortOrder === 'asc' && styles.sortOptionSelected]}
                    onPress={() => handleSortChange('price', 'asc')}
                  >
                    <MaterialIcons name="trending-up" size={20} color={sortBy === 'price' && sortOrder === 'asc' ? '#800000' : '#666'} />
                    <Text style={[styles.sortOptionText, sortBy === 'price' && sortOrder === 'asc' && styles.sortOptionTextSelected]}>
                      Price: Low to High
                    </Text>
                    {sortBy === 'price' && sortOrder === 'asc' && (
                      <Ionicons name="checkmark" size={20} color="#800000" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.sortOption, sortBy === 'price' && sortOrder === 'desc' && styles.sortOptionSelected]}
                    onPress={() => handleSortChange('price', 'desc')}
                  >
                    <MaterialIcons name="trending-down" size={20} color={sortBy === 'price' && sortOrder === 'desc' ? '#800000' : '#666'} />
                    <Text style={[styles.sortOptionText, sortBy === 'price' && sortOrder === 'desc' && styles.sortOptionTextSelected]}>
                      Price: High to Low
                    </Text>
                    {sortBy === 'price' && sortOrder === 'desc' && (
                      <Ionicons name="checkmark" size={20} color="#800000" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* MODAL FOOTER */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.modalButton, styles.secondaryButton]} onPress={() => setShowFiltersModal(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.primaryButton]} onPress={() => {
                setShowFiltersModal(false);
                fetchProducts();
              }}>
                <Text style={styles.primaryButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  
  // Center states
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f8fafc' 
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748b',
  },
  
  // Header - INCREASED HEIGHT
  header: {
    backgroundColor: '#800000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 35,
    paddingTop: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 85,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
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
  clearSearchButton: {
    padding: 4,
  },
  
  // Quick Filters
  quickFiltersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  quickFiltersScroll: {
    paddingLeft: 16,
  },
  quickFilter: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickFilterActive: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  quickFilterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  quickFilterTextActive: {
    color: '#fff',
  },
  viewAllFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#800000',
    fontWeight: '500',
    marginRight: 4,
  },
  
  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 13,
    color: '#64748b',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  viewToggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  viewToggleActive: {
    backgroundColor: '#800000',
  },
  
  // Active Filters Bar
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
    fontSize: 13,
    color: '#334155',
    marginRight: 6,
  },
  subcategoryTag: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd',
  },
  brandTag: {
    backgroundColor: '#f3e8ff',
    borderColor: '#ddd6fe',
  },
  priceTag: {
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
  },
  sortTag: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
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
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
    marginRight: 6,
  },
  
  // Main Content
  mainContent: {
    flex: 1,
  },
  productsContainer: {
    paddingBottom: 20,
  },
  gridContainer: {
    paddingHorizontal: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  
  // Product Card
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginBottom: 12,
  },
  productCardGrid: {
    flex: 1,
    marginHorizontal: 6,
    maxWidth: width / 2 - 16,
  },
  productCardList: {
    marginHorizontal: 16,
  },
  productImageContainer: {
    height: 180,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#800000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
    lineHeight: 18,
    minHeight: 36,
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#800000',
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 300,
  },
  emptyStateButtons: {
    flexDirection: 'row',
    gap: 12,
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
  
  // Loading & Error States
  footerLoader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: '#800000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 15,
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
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
    marginTop: 24,
    marginBottom: 8,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  filterSectionCountBadge: {
    backgroundColor: '#80000010',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#80000020',
  },
  filterSectionCountText: {
    fontSize: 13,
    color: '#800000',
    fontWeight: '600',
  },
  priceToggleButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  
  // Category Grid in Modal
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  categoryChipModal: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipModalSelected: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  categoryChipModalText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryChipModalTextSelected: {
    color: '#fff',
  },
  
  // Subcategory Grid in Modal
  subcategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  subcategoryChipModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  subcategoryChipModalSelected: {
    backgroundColor: '#80000010',
    borderColor: '#800000',
  },
  subcategoryChipModalText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  subcategoryChipModalTextSelected: {
    color: '#800000',
  },
  subcategoryCountBadge: {
    backgroundColor: '#800000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 24,
    alignItems: 'center',
  },
  subcategoryCountText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  
  // Brand Grid in Modal
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  brandChipModal: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  brandChipModalSelected: {
    backgroundColor: '#80000010',
    borderColor: '#800000',
  },
  brandChipModalText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  brandChipModalTextSelected: {
    color: '#800000',
  },
  
  // Price Range
  priceInputContainer: {
    marginTop: 12,
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
  
  // Sort Options - TEXT ALIGNED PROPERLY
  sortOptions: {
    marginTop: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sortOptionSelected: {
    backgroundColor: '#80000010',
    borderWidth: 1,
    borderColor: '#800000',
  },
  sortOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
    marginLeft: 12,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  sortOptionTextSelected: {
    color: '#800000',
  },
});