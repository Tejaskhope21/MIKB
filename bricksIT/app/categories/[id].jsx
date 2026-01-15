// app/(tabs)/categories/[id].jsx - UPDATED without modern filter
import React, { useState, useEffect } from 'react';
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
  TextInput as RNTextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ProductCard from '../../components/Products/ProductCard';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://bricks-backend-qyea.onrender.com';

export default function CategoryProductsScreen() {
  const router = useRouter();

  // ✅ PARAMS FROM URL
  const {
    id,
    name,
    subcategoryId,
    subcategoryName,
  } = useLocalSearchParams();

  const categoryId = id;
  const categoryName = name;

  console.log('Category Params:', {
    categoryId,
    categoryName,
    subcategoryId,
    subcategoryName,
  });

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // State for all features
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  const [initialSubcategory] = useState(subcategoryName);

  /* ================= FETCH CATEGORY ================= */
  const fetchCategoryWithSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!categoryId) throw new Error('Category ID missing');

      const res = await fetch(
        `${API_BASE_URL}/api/products/category/${categoryId}/with-subcategories`
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setCategory(data.category || { name: categoryName });
      setSubcategories(data.subcategories || []);
      
      if (data.products && data.products.items) {
        setProducts(data.products.items);
        setPagination(data.products.pagination || {
          page: 1,
          limit: 20,
          total: data.products.items.length,
          pages: 1
        });
      }

      // Set initial subcategory if provided
      if (subcategoryId && data.subcategories?.length > 0) {
        let foundSubcategory = data.subcategories.find(sub =>
          sub._id === subcategoryId || sub.id === subcategoryId
        );
        
        if (!foundSubcategory) {
          foundSubcategory = data.subcategories.find(sub =>
            sub.title === subcategoryName
          );
        }
        
        if (foundSubcategory) {
          setSelectedSubcategory(foundSubcategory._id || foundSubcategory.id);
        }
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
      setCategory({ name: categoryName || 'Category' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    if (!categoryId) return;

    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (selectedSubcategory && selectedSubcategory !== 'all') {
        params.append('subcategoryId', selectedSubcategory);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm);
      }

      if (selectedBrand && selectedBrand !== 'all') {
        params.append('brand', selectedBrand);
      }

      if (minPrice) {
        params.append('minPrice', minPrice);
      }

      if (maxPrice) {
        params.append('maxPrice', maxPrice);
      }

      const res = await fetch(
        `${API_BASE_URL}/api/products/category/${categoryId}/products?${params}`
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setProducts(data.products?.items || []);
      setPagination(data.products?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  /* ================= EXTRACT BRANDS ================= */
  useEffect(() => {
    if (products.length > 0) {
      const uniqueBrands = [...new Set(
        products
          .map(p => p.brand)
          .filter(brand => brand && brand.trim() !== '')
          .sort((a, b) => a.localeCompare(b))
      )];
      setBrands(uniqueBrands);
    } else {
      setBrands([]);
    }
  }, [products]);

  /* ================= EFFECTS ================= */
  useEffect(() => {
    if (categoryId) fetchCategoryWithSubcategories();
  }, [categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [selectedSubcategory, searchTerm, selectedBrand, minPrice, maxPrice, pagination.page]);

  /* ================= HANDLERS ================= */
  const onRefresh = () => {
    setRefreshing(true);
    fetchCategoryWithSubcategories();
  };

  const handleSubcategoryClick = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    setSelectedBrand('all');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setSelectedSubcategory('all');
    setSearchTerm('');
    setSelectedBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getCurrentSubcategory = () => {
    if (selectedSubcategory === 'all') {
      if (initialSubcategory && selectedSubcategory === 'all') {
        return { title: initialSubcategory };
      }
      return null;
    }
    return subcategories.find(sub =>
      sub._id === selectedSubcategory || sub.id === selectedSubcategory
    );
  };

  const getProductStats = () => {
    const prices = products.map(p => p.price).filter(p => p > 0);
    const minPriceValue = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPriceValue = prices.length > 0 ? Math.max(...prices) : 0;

    const brandCounts = {};
    products.forEach(product => {
      if (product.brand) {
        brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
      }
    });

    return {
      total: products.length,
      withDiscount: products.filter(p => p.discount > 0 || (p.originalPrice && p.originalPrice > p.price)).length,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
      brandCounts: brandCounts
    };
  };

  const currentSubcategory = getCurrentSubcategory();
  const productStats = getProductStats();
  const totalSubcategories = subcategories.length;
  const totalCategoryProducts = subcategories.reduce((sum, sub) => sum + (sub.count || 0), 0);
  const hasActiveFilters = selectedSubcategory !== 'all' || searchTerm || selectedBrand !== 'all' || minPrice || maxPrice;

  /* ================= RENDER HELPERS ================= */
  const renderProductItem = ({ item }) => (
    <ProductCard
      product={item}
      viewMode={viewMode}
      onPress={() =>
        router.push({
          pathname: '/productDetails/[id]',
          params: { id: item._id },
        })
      }
    />
  );

  const renderSubcategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.subcategoryItem,
        (selectedSubcategory === item._id || selectedSubcategory === item.id) && styles.subcategoryItemSelected
      ]}
      onPress={() => handleSubcategoryClick(item._id || item.id)}
    >
      <Text style={[
        styles.subcategoryText,
        (selectedSubcategory === item._id || selectedSubcategory === item.id) && styles.subcategoryTextSelected
      ]}>
        {item.title}
      </Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{item.count || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderBrandItem = ({ item }) => {
    const productCount = productStats.brandCounts[item] || 0;
    const isSelected = selectedBrand === item;
    
    return (
      <TouchableOpacity
        style={[
          styles.brandItem,
          isSelected && styles.brandItemSelected
        ]}
        onPress={() => handleBrandChange(item)}
      >
        <Text style={[
          styles.brandText,
          isSelected && styles.brandTextSelected
        ]}>
          {item}
        </Text>
        <View style={[
          styles.brandCountBadge,
          isSelected && styles.brandCountBadgeSelected
        ]}>
          <Text style={[
            styles.brandCountText,
            isSelected && styles.brandCountTextSelected
          ]}>
            {productCount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={60} color="#800000" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={fetchCategoryWithSubcategories}>
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/')}>
              <Text style={styles.secondaryButtonText}>Go Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ================= CATEGORY NOT FOUND ================= */
  if (!category) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.notFoundContainer}>
          <MaterialCommunityIcons name="package-variant" size={60} color="#800000" />
          <Text style={styles.errorTitle}>Category Not Found</Text>
          <Text style={styles.errorText}>The requested category does not exist.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/')}>
            <Text style={styles.primaryButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ================= MAIN RENDER ================= */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#800000" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
      <TouchableOpacity
  onPress={() => router.replace('/(tabs)')}
  style={styles.backButton}
>
  <Ionicons name="arrow-back" size={24} color="#fff" />
</TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentSubcategory
              ? `${currentSubcategory.title} in ${category.name}`
              : category.name
            }
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentSubcategory
              ? `${productStats.total} products`
              : `${totalCategoryProducts} total products`
            }
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

   

      {/* QUICK FILTERS BAR */}
      {subcategories.length > 0 && (
        <View style={styles.quickFiltersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickFiltersScroll}
          >
            <TouchableOpacity
              style={[
                styles.quickFilter,
                selectedSubcategory === 'all' && styles.quickFilterActive
              ]}
              onPress={() => handleSubcategoryClick('all')}
            >
              <Text style={[
                styles.quickFilterText,
                selectedSubcategory === 'all' && styles.quickFilterTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            {subcategories.slice(0, 8).map((sub) => (
              <TouchableOpacity
                key={sub._id || sub.id}
                style={[
                  styles.quickFilter,
                  selectedSubcategory === (sub._id || sub.id) && styles.quickFilterActive
                ]}
                onPress={() => handleSubcategoryClick(sub._id || sub.id)}
              >
                <Text style={[
                  styles.quickFilterText,
                  selectedSubcategory === (sub._id || sub.id) && styles.quickFilterTextActive
                ]}>
                  {sub.title}
                </Text>
                <View style={[
                  styles.quickFilterBadge,
                  selectedSubcategory === (sub._id || sub.id) && styles.quickFilterBadgeActive
                ]}>
                  <Text style={[
                    styles.quickFilterBadgeText,
                    selectedSubcategory === (sub._id || sub.id) && styles.quickFilterBadgeTextActive
                  ]}>
                    {sub.count || 0}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {subcategories.length > 8 && (
              <TouchableOpacity
                style={styles.viewAllFilter}
                onPress={() => setShowFiltersModal(true)}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#800000" />
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* RESULTS HEADER */}
      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.resultsTitle}>
            {currentSubcategory
              ? currentSubcategory.title
              : 'All Products'
            }
          </Text>
          <Text style={styles.resultsCount}>
            Showing {products.length} of {pagination.total} products
          </Text>
        </View>
        
     
      </View>

      {/* ACTIVE FILTERS BAR */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersBar}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.activeFiltersScroll}
          >
            <View style={styles.activeFiltersContent}>
              {selectedSubcategory !== 'all' && currentSubcategory && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>{currentSubcategory.title}</Text>
                  <TouchableOpacity onPress={() => handleSubcategoryClick('all')}>
                    <Ionicons name="close" size={16} color="#800000" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedBrand !== 'all' && (
                <View style={[styles.activeFilterTag, styles.brandTag]}>
                  <Text style={styles.activeFilterText}>Brand: {selectedBrand}</Text>
                  <TouchableOpacity onPress={() => setSelectedBrand('all')}>
                    <Ionicons name="close" size={16} color="#7c3aed" />
                  </TouchableOpacity>
                </View>
              )}
              {minPrice && (
                <View style={[styles.activeFilterTag, styles.priceTag]}>
                  <Text style={styles.activeFilterText}>Min: ₹{minPrice}</Text>
                  <TouchableOpacity onPress={() => setMinPrice('')}>
                    <Ionicons name="close" size={16} color="#059669" />
                  </TouchableOpacity>
                </View>
              )}
              {maxPrice && (
                <View style={[styles.activeFilterTag, styles.priceTag]}>
                  <Text style={styles.activeFilterText}>Max: ₹{maxPrice}</Text>
                  <TouchableOpacity onPress={() => setMaxPrice('')}>
                    <Ionicons name="close" size={16} color="#059669" />
                  </TouchableOpacity>
                </View>
              )}
              {searchTerm && (
                <View style={[styles.activeFilterTag, styles.searchTag]}>
                  <Text style={styles.activeFilterText}>Search: "{searchTerm}"</Text>
                  <TouchableOpacity onPress={() => setSearchTerm('')}>
                    <Ionicons name="close" size={16} color="#4b5563" />
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
                onRefresh={onRefresh}
                colors={['#800000']}
              />
            }
            contentContainerStyle={[
              styles.productsContainer,
              viewMode === 'grid' ? styles.gridContainer : styles.listContainer
            ]}
            showsVerticalScrollIndicator={false}
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
                : 'There are no products available in this category yet.'
              }
            </Text>
            <View style={styles.emptyStateButtons}>
              {hasActiveFilters && (
                <TouchableOpacity style={styles.primaryButton} onPress={handleClearFilters}>
                  <Text style={styles.primaryButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
                <Text style={styles.secondaryButtonText}>Back to Categories</Text>
              </TouchableOpacity>
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
              
              {/* SUBCATEGORIES */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Text style={styles.filterSectionTitle}>Categories</Text>
                  <View style={styles.filterSectionCountBadge}>
                    <Text style={styles.filterSectionCountText}>{totalSubcategories}</Text>
                  </View>
                </View>
                
                <Text style={styles.filterSectionDescription}>
                  Select a subcategory to filter products
                </Text>

                {/* ALL PRODUCTS */}
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedSubcategory === 'all' && styles.filterOptionSelected
                  ]}
                  onPress={() => handleSubcategoryClick('all')}
                >
                  <View style={styles.filterOptionIcon}>
                    <MaterialIcons 
                      name="category" 
                      size={20} 
                      color={selectedSubcategory === 'all' ? '#800000' : '#666'} 
                    />
                  </View>
                  <View style={styles.filterOptionContent}>
                    <Text style={[
                      styles.filterOptionText,
                      selectedSubcategory === 'all' && styles.filterOptionTextSelected
                    ]}>
                      All Products
                    </Text>
                    <Text style={styles.filterOptionDescription}>
                      Browse all products in this category
                    </Text>
                  </View>
                  <View style={styles.filterOptionBadge}>
                    <Text style={styles.filterOptionBadgeText}>{totalCategoryProducts}</Text>
                  </View>
                </TouchableOpacity>

                {/* SUBCATEGORIES LIST */}
                <FlatList
                  data={subcategories}
                  renderItem={renderSubcategoryItem}
                  keyExtractor={(item) => item._id || item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.subcategoriesList}
                />
              </View>

              {/* BRANDS FILTER */}
              {brands.length > 0 && (
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Text style={styles.filterSectionTitle}>Brands</Text>
                    <View style={styles.filterSectionCountBadge}>
                      <Text style={styles.filterSectionCountText}>{brands.length}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.filterSectionDescription}>
                    Filter products by brand
                  </Text>

                  {/* ALL BRANDS */}
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      selectedBrand === 'all' && styles.filterOptionSelected
                    ]}
                    onPress={() => handleBrandChange('all')}
                  >
                    <View style={styles.filterOptionIcon}>
                      <MaterialIcons 
                        name="branding-watermark" 
                        size={20} 
                        color={selectedBrand === 'all' ? '#800000' : '#666'} 
                      />
                    </View>
                    <View style={styles.filterOptionContent}>
                      <Text style={[
                        styles.filterOptionText,
                        selectedBrand === 'all' && styles.filterOptionTextSelected
                      ]}>
                        All Brands
                      </Text>
                      <Text style={styles.filterOptionDescription}>
                        Show products from all brands
                      </Text>
                    </View>
                    <View style={styles.filterOptionBadge}>
                      <Text style={styles.filterOptionBadgeText}>{brands.length}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* BRANDS LIST */}
                  <FlatList
                    data={brands}
                    renderItem={renderBrandItem}
                    keyExtractor={(item) => item}
                    scrollEnabled={false}
                    contentContainerStyle={styles.brandsList}
                  />
                </View>
              )}

              {/* PRICE RANGE */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Text style={styles.filterSectionTitle}>Price Range</Text>
                  <TouchableOpacity 
                    onPress={() => setShowPriceFilter(!showPriceFilter)}
                    style={styles.priceToggleButton}
                  >
                    <Ionicons 
                      name={showPriceFilter ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.filterSectionDescription}>
                  Set minimum and maximum price
                </Text>

                {showPriceFilter && (
                  <View style={styles.priceInputContainer}>
                    <View style={styles.priceInputWrapper}>
                      <Text style={styles.priceLabel}>Minimum Price</Text>
                      <View style={styles.priceInput}>
                        <Text style={styles.priceSymbol}>₹</Text>
                        <RNTextInput
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
                        <RNTextInput
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

              {/* PRODUCT STATS */}
              {products.length > 0 && (
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Text style={styles.filterSectionTitle}>Product Stats</Text>
                    <MaterialIcons name="insights" size={20} color="#666" />
                  </View>
                  
                  <View style={styles.statsContainer}>
                    <View style={styles.statRow}>
                      <View style={styles.statItem}>
                        <View style={[styles.statIcon, styles.totalStatIcon]}>
                          <MaterialIcons name="inventory" size={18} color="#800000" />
                        </View>
                        <View style={styles.statContent}>
                          <Text style={styles.statLabel}>Total Products</Text>
                          <Text style={styles.statValue}>{productStats.total}</Text>
                        </View>
                      </View>
                      
                      {productStats.withDiscount > 0 && (
                        <View style={styles.statItem}>
                          <View style={[styles.statIcon, styles.discountStatIcon]}>
                            <MaterialIcons name="local-offer" size={18} color="#059669" />
                          </View>
                          <View style={styles.statContent}>
                            <Text style={styles.statLabel}>On Discount</Text>
                            <Text style={[styles.statValue, styles.discountStat]}>{productStats.withDiscount}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.statRow}>
                      {productStats.minPrice > 0 && productStats.maxPrice > 0 && (
                        <View style={styles.statItem}>
                          <View style={[styles.statIcon, styles.priceStatIcon]}>
                            <MaterialIcons name="currency-rupee" size={18} color="#7c3aed" />
                          </View>
                          <View style={styles.statContent}>
                            <Text style={styles.statLabel}>Price Range</Text>
                            <Text style={styles.statValue}>
                              ₹{productStats.minPrice} - ₹{productStats.maxPrice}
                            </Text>
                          </View>
                        </View>
                      )}
                      
                      {brands.length > 0 && (
                        <View style={styles.statItem}>
                          <View style={[styles.statIcon, styles.brandStatIcon]}>
                            <MaterialIcons name="business" size={18} color="#d97706" />
                          </View>
                          <View style={styles.statContent}>
                            <Text style={styles.statLabel}>Brands</Text>
                            <Text style={styles.statValue}>{brands.length}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* MODAL FOOTER */}
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
                  fetchProducts();
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
  errorContainer: {
    alignItems: 'center',
    padding: 40,
    maxWidth: 300,
  },
  notFoundContainer: {
    alignItems: 'center',
    padding: 40,
    maxWidth: 300,
  },
  
  // Header
  header: {
    backgroundColor: '#800000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 6,
  },
  quickFilterTextActive: {
    color: '#fff',
  },
  quickFilterBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  quickFilterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickFilterBadgeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  quickFilterBadgeTextActive: {
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
  resultsControls: {
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
  brandTag: {
    backgroundColor: '#f3e8ff',
    borderColor: '#ddd6fe',
  },
  priceTag: {
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
  },
  searchTag: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
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
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748b',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
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
  filterSectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
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
  
  // Filter Options
  filterOption: {
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
  filterOptionSelected: {
    backgroundColor: '#80000010',
    borderWidth: 1,
    borderColor: '#800000',
  },
  filterOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterOptionContent: {
    flex: 1,
  },
  filterOptionText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
    marginBottom: 2,
  },
  filterOptionTextSelected: {
    color: '#800000',
  },
  filterOptionDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  filterOptionBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 40,
    alignItems: 'center',
  },
  filterOptionBadgeText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  
  // Subcategories
  subcategoriesList: {
    paddingTop: 8,
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subcategoryItemSelected: {
    backgroundColor: '#80000010',
    borderWidth: 1,
    borderColor: '#800000',
  },
  subcategoryText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  subcategoryTextSelected: {
    color: '#800000',
  },
  countBadge: {
    backgroundColor: '#800000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 30,
    alignItems: 'center',
  },
  countText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  
  // Brands
  brandsList: {
    paddingTop: 8,
  },
  brandItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  brandItemSelected: {
    backgroundColor: '#80000010',
    borderWidth: 1,
    borderColor: '#800000',
  },
  brandText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  brandTextSelected: {
    color: '#800000',
  },
  brandCountBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 30,
    alignItems: 'center',
  },
  brandCountBadgeSelected: {
    backgroundColor: '#800000',
  },
  brandCountText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  brandCountTextSelected: {
    color: '#fff',
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
  
  // Stats
  statsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  totalStatIcon: {
    backgroundColor: '#fee2e2',
  },
  discountStatIcon: {
    backgroundColor: '#d1fae5',
  },
  priceStatIcon: {
    backgroundColor: '#ede9fe',
  },
  brandStatIcon: {
    backgroundColor: '#fef3c7',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  discountStat: {
    color: '#059669',
  },
});