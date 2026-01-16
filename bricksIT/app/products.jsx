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
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://bricks-backend-qyea.onrender.com';

/* ================= API FUNCTIONS ================= */
const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`);
    if (!res.ok) throw new Error('Categories fetch failed');
    const data = await res.json();
    return data.categories || data || [];
  } catch (err) {
    console.error('fetchCategories error:', err);
    return [];
  }
};

const fetchBrandsFromAPI = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/brands`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.brands || data || [];
  } catch (err) {
    console.error('fetchBrandsFromAPI error:', err);
    return [];
  }
};

const fetchCategoryWithSubcategories = async (categoryId) => {
  try {
    if (!categoryId) throw new Error('Category ID missing');

    const res = await fetch(
      `${API_BASE_URL}/api/products/category/${categoryId}/with-subcategories`
    );

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    return {
      category: data.category || { name: 'Category' },
      subcategories: data.subcategories || [],
      products: data.products?.items || [],
      pagination: data.products?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
      }
    };
  } catch (err) {
    console.error('fetchCategoryWithSubcategories error:', err);
    throw err;
  }
};

const fetchProductsByCategory = async (categoryId, params = {}) => {
  try {
    if (!categoryId) throw new Error('Category ID missing');

    const cleanedParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'all') {
        cleanedParams[key] = params[key];
      }
    });

    const query = new URLSearchParams(cleanedParams).toString();
    const url = `${API_BASE_URL}/api/products/category/${categoryId}/products?${query}`;

    console.log('Fetching category products from:', url);
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (!data.success) throw new Error(data.message || 'API error');

    return {
      products: data.products?.items || [],
      pagination: data.products?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
      }
    };
  } catch (err) {
    console.error('fetchProductsByCategory error:', err);
    throw err;
  }
};

const fetchAllProducts = async (params = {}) => {
  try {
    const cleanedParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'all') {
        cleanedParams[key] = params[key];
      }
    });

    const query = new URLSearchParams(cleanedParams).toString();
    const url = query ? `${API_BASE_URL}/api/products?${query}` : `${API_BASE_URL}/api/products`;

    console.log('Fetching all products from:', url);
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    console.log('API Response:', data);
    
    if (!data.success) throw new Error(data.message || 'API error');

    return {
      products: data.products?.items || data.products || [],
      pagination: data.products?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
      }
    };
  } catch (err) {
    console.error('fetchAllProducts error:', err);
    throw err;
  }
};

/* ================= MAIN COMPONENT ================= */
export default function AllProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get categoryId from params if navigating from category screen
  const categoryId = params.categoryId || '';
  const categoryName = params.categoryName || '';
  
  // Main states
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(categoryId || 'all');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // UI states
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Data states
  const [brands, setBrands] = useState([]);
  const [currentCategoryInfo, setCurrentCategoryInfo] = useState({ name: categoryName || 'All Products' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  /* ================= TRANSFORM PRODUCT ================= */
  const transformProduct = useCallback((product) => {
    const originalPrice = product.originalPrice || product.mrp || product.price || 0;
    const currentPrice = product.price || product.sellingPrice || product.discountedPrice || 0;

    let discount = 0;
    if (originalPrice > currentPrice && originalPrice > 0) {
      discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    const placeholderColors = ['f87171', 'fb923c', 'fbbf24', '34d399', '60a5fa', '818cf8', 'a78bfa', 'f472b6'];
    const colorIndex = Math.abs(product.name?.length || 0) % placeholderColors.length;
    const placeholderColor = placeholderColors[colorIndex];
    
    const placeholderImage = `https://via.placeholder.com/180x220/${placeholderColor}/ffffff?text=${encodeURIComponent(product.name?.substring(0, 20) || 'Product')}`;

    return {
      id: product._id || product.numericId || Math.random().toString(),
      name: product.name || 'Unnamed Product',
      image: product.image || product.images?.[0] || placeholderImage,
      price: currentPrice,
      originalPrice,
      discount,
      brand: product.brand || 'Unknown Brand',
      category: product.category || '',
      subcategory: product.subcategory || '',
    };
  }, []);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all categories
      const categories = await fetchCategories();
      setAllCategories(categories);
      
      // Load brands from API
      const apiBrands = await fetchBrandsFromAPI();
      setBrands(apiBrands);
      
      // If we have a categoryId from params, load its data
      if (categoryId && categoryId !== 'all') {
        const categoryData = await fetchCategoryWithSubcategories(categoryId);
        setCurrentCategoryInfo(categoryData.category);
        setSubcategories(categoryData.subcategories);
        
        // Set initial products
        const transformed = categoryData.products.map(transformProduct);
        setProducts(transformed);
        
        // Set pagination
        setPagination(categoryData.pagination);
        
        // Extract brands from products if not already loaded from API
        if (apiBrands.length === 0) {
          extractBrandsFromProducts(transformed);
        }
      } else {
        // Load all products if no specific category
        await loadProducts();
      }
      
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async (page = 1, isRefresh = false) => {
    if (!isRefresh && loading) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);

    try {
      // Build query params
      const params = {
        page: page,
        limit: 20,
        sortBy: sortBy,
        sortOrder: sortOrder
      };

      // Add search
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add brand filter - only if not 'all'
      if (selectedBrand && selectedBrand !== 'all') {
        params.brand = selectedBrand;
      }

      // Add price filters
      if (minPrice && !isNaN(minPrice) && minPrice !== '') {
        params.minPrice = parseInt(minPrice);
      }
      
      if (maxPrice && !isNaN(maxPrice) && maxPrice !== '') {
        params.maxPrice = parseInt(maxPrice);
      }

      let result;
      
      // Choose API endpoint based on category selection
      if (selectedCategory && selectedCategory !== 'all') {
        // Add subcategory filter if selected
        if (selectedSubcategory && selectedSubcategory !== 'all') {
          params.subcategoryId = selectedSubcategory;
        }
        
        // Load category products
        console.log('Loading category products for:', selectedCategory, 'with params:', params);
        result = await fetchProductsByCategory(selectedCategory, params);
        
        // Load subcategories if not already loaded
        if ((!subcategories || subcategories.length === 0) && page === 1) {
          try {
            const categoryData = await fetchCategoryWithSubcategories(selectedCategory);
            setSubcategories(categoryData.subcategories);
            setCurrentCategoryInfo(categoryData.category);
          } catch (err) {
            console.error('Failed to load subcategories:', err);
          }
        }
      } else {
        // Load all products
        console.log('Loading all products with params:', params);
        result = await fetchAllProducts(params);
      }

      console.log('API Result:', result);
      
      const transformed = result.products.map(transformProduct);
      
      // Update products
      if (page === 1) {
        setProducts(transformed);
      } else {
        setProducts(prev => [...prev, ...transformed]);
      }
      
      // Update pagination
      setPagination(result.pagination || {
        page: page,
        limit: 20,
        total: transformed.length,
        pages: 1
      });
      
      // Extract brands on first load if no brands loaded yet
      if (page === 1 && brands.length === 0) {
        extractBrandsFromProducts(transformed);
      }
      
    } catch (err) {
      setError('Failed to load products: ' + err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ================= EXTRACT BRANDS ================= */
  const extractBrandsFromProducts = (productList) => {
    const uniqueBrands = [...new Set(
      productList
        .map(p => p.brand)
        .filter(brand => brand && brand.trim() !== '' && brand !== 'Unknown Brand')
        .sort((a, b) => a.localeCompare(b))
    )];
    console.log('Extracted brands:', uniqueBrands);
    setBrands(uniqueBrands);
  };

  /* ================= HANDLERS ================= */
  const handleCategorySelect = (categoryId) => {
    console.log('Category selected:', categoryId);
    setSelectedCategory(categoryId);
    setSelectedSubcategory('all');
    setSubcategories([]);
    
    if (categoryId === 'all') {
      setCurrentCategoryInfo({ name: 'All Products' });
    } else {
      const selectedCat = allCategories.find(c => c._id === categoryId);
      setCurrentCategoryInfo(selectedCat || { name: 'Category' });
    }
    
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // If category is 'all', load all products immediately
    if (categoryId === 'all') {
      loadProducts(1);
    } else {
      // Load category data first
      fetchCategoryWithSubcategories(categoryId)
        .then(data => {
          setSubcategories(data.subcategories);
          setCurrentCategoryInfo(data.category);
          // Then load products for selected category
          loadProducts(1);
        })
        .catch(err => {
          console.error('Failed to load category:', err);
          // Still try to load products even if category data fails
          loadProducts(1);
        });
    }
  };

  const handleSubcategorySelect = (subcategoryId) => {
    console.log('Subcategory selected:', subcategoryId);
    setSelectedSubcategory(subcategoryId);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleBrandSelect = (brand) => {
    console.log('Brand selected:', brand);
    setSelectedBrand(brand);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    console.log('Sort changed:', newSortBy, newSortOrder);
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    console.log('Clearing all filters');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSearchTerm('');
    setSelectedBrand('all');
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
      console.log('Page change:', newPage);
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing...');
    setRefreshing(true);
    loadProducts(1, true);
  };

  const handleProductPress = (productId) => {
    if (!productId) {
      alert('Product ID not found');
      return;
    }
    
    router.push({
      pathname: '/productDetails/[id]',
      params: { id: productId }
    });
  };

  /* ================= EFFECTS ================= */
  // Load products when filters change (with debounce for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Filters changed, loading products...', {
        selectedCategory,
        selectedSubcategory,
        searchTerm,
        selectedBrand,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
      });
      loadProducts(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, selectedSubcategory, searchTerm, selectedBrand, minPrice, maxPrice, sortBy, sortOrder]);

  // Load more products when page changes
  useEffect(() => {
    if (pagination.page > 1) {
      console.log('Loading page:', pagination.page);
      loadProducts(pagination.page);
    }
  }, [pagination.page]);

  /* ================= RENDER HELPERS ================= */
  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.productCard, viewMode === 'grid' ? styles.productCardGrid : styles.productCardList]}
      onPress={() => handleProductPress(item.id)}
      activeOpacity={0.9}
    >
      <View style={styles.productImageContainer}>
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <MaterialCommunityIcons name="package-variant" size={40} color="#ccc" />
          </View>
        )}
        
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productBrand}>{item.brand || '—'}</Text>
        
        <View style={styles.productPriceRow}>
          <Text style={styles.currentPrice}>₹{Math.round(item.price)}</Text>
          {item.discount > 0 && (
            <Text style={styles.originalPrice}>₹{Math.round(item.originalPrice)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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

  /* ================= ERROR STATE ================= */
  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={60} color="#800000" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={loadInitialData}>
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
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
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentCategoryInfo.name || 'All Products'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {pagination.total > 0 ? `${pagination.total} products` : 'No products'}
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

     
      <View style={styles.searchContainer}>
       
      </View>

      {/* QUICK CATEGORY FILTERS */}
      {allCategories.length > 0 && (
        <View style={styles.quickFiltersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickFiltersScroll}
          >
            <TouchableOpacity
              style={[
                styles.quickFilter,
                selectedCategory === 'all' && styles.quickFilterActive
              ]}
              onPress={() => handleCategorySelect('all')}
            >
              <Text style={[
                styles.quickFilterText,
                selectedCategory === 'all' && styles.quickFilterTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            {allCategories.slice(0, 8).map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={[
                  styles.quickFilter,
                  selectedCategory === cat._id && styles.quickFilterActive
                ]}
                onPress={() => handleCategorySelect(cat._id)}
              >
                <Text style={[
                  styles.quickFilterText,
                  selectedCategory === cat._id && styles.quickFilterTextActive
                ]}>
                  {cat.name || cat.title}
                </Text>
              </TouchableOpacity>
            ))}
            
            {allCategories.length > 8 && (
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
            {selectedCategory === 'all' ? 'All Products' : currentCategoryInfo.name}
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
                  <TouchableOpacity onPress={() => handleSubcategorySelect('all')}>
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
            keyExtractor={(item) => item.id.toString()}
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
                    <Text style={styles.filterSectionCountText}>{allCategories.length}</Text>
                  </View>
                </View>
                
                <View style={styles.categoryGrid}>
                  <TouchableOpacity
                    style={[
                      styles.categoryChipModal,
                      selectedCategory === 'all' && styles.categoryChipModalSelected
                    ]}
                    onPress={() => handleCategorySelect('all')}
                  >
                    <Text style={[
                      styles.categoryChipModalText,
                      selectedCategory === 'all' && styles.categoryChipModalTextSelected
                    ]}>
                      All Categories
                    </Text>
                  </TouchableOpacity>
                  
                  {allCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat._id}
                      style={[
                        styles.categoryChipModal,
                        selectedCategory === cat._id && styles.categoryChipModalSelected
                      ]}
                      onPress={() => handleCategorySelect(cat._id)}
                    >
                      <Text style={[
                        styles.categoryChipModalText,
                        selectedCategory === cat._id && styles.categoryChipModalTextSelected
                      ]}>
                        {cat.name || cat.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* SUBCATEGORIES SECTION (Only show if a category is selected) */}
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
                      style={[
                        styles.subcategoryChipModal,
                        selectedSubcategory === 'all' && styles.subcategoryChipModalSelected
                      ]}
                      onPress={() => handleSubcategorySelect('all')}
                    >
                      <Text style={[
                        styles.subcategoryChipModalText,
                        selectedSubcategory === 'all' && styles.subcategoryChipModalTextSelected
                      ]}>
                        All Subcategories
                      </Text>
                    </TouchableOpacity>
                    
                    {subcategories.map((sub) => (
                      <TouchableOpacity
                        key={sub._id}
                        style={[
                          styles.subcategoryChipModal,
                          selectedSubcategory === sub._id && styles.subcategoryChipModalSelected
                        ]}
                        onPress={() => handleSubcategorySelect(sub._id)}
                      >
                        <Text style={[
                          styles.subcategoryChipModalText,
                          selectedSubcategory === sub._id && styles.subcategoryChipModalTextSelected
                        ]}>
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
                      style={[
                        styles.brandChipModal,
                        selectedBrand === 'all' && styles.brandChipModalSelected
                      ]}
                      onPress={() => handleBrandSelect('all')}
                    >
                      <Text style={[
                        styles.brandChipModalText,
                        selectedBrand === 'all' && styles.brandChipModalTextSelected
                      ]}>
                        All Brands
                      </Text>
                    </TouchableOpacity>
                    
                    {brands.map((brand) => (
                      <TouchableOpacity
                        key={brand}
                        style={[
                          styles.brandChipModal,
                          selectedBrand === brand && styles.brandChipModalSelected
                        ]}
                        onPress={() => handleBrandSelect(brand)}
                      >
                        <Text style={[
                          styles.brandChipModalText,
                          selectedBrand === brand && styles.brandChipModalTextSelected
                        ]}>
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
                    style={[
                      styles.sortOption,
                      sortBy === 'createdAt' && sortOrder === 'desc' && styles.sortOptionSelected
                    ]}
                    onPress={() => handleSortChange('createdAt', 'desc')}
                  >
                    <MaterialIcons 
                      name="new-releases" 
                      size={20} 
                      color={sortBy === 'createdAt' && sortOrder === 'desc' ? '#800000' : '#666'} 
                    />
                    <Text style={[
                      styles.sortOptionText,
                      sortBy === 'createdAt' && sortOrder === 'desc' && styles.sortOptionTextSelected
                    ]}>
                      Newest First
                    </Text>
                    {sortBy === 'createdAt' && sortOrder === 'desc' && (
                      <Ionicons name="checkmark" size={20} color="#800000" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      sortBy === 'price' && sortOrder === 'asc' && styles.sortOptionSelected
                    ]}
                    onPress={() => handleSortChange('price', 'asc')}
                  >
                    <MaterialIcons 
                      name="trending-up" 
                      size={20} 
                      color={sortBy === 'price' && sortOrder === 'asc' ? '#800000' : '#666'} 
                    />
                    <Text style={[
                      styles.sortOptionText,
                      sortBy === 'price' && sortOrder === 'asc' && styles.sortOptionTextSelected
                    ]}>
                      Price: Low to High
                    </Text>
                    {sortBy === 'price' && sortOrder === 'asc' && (
                      <Ionicons name="checkmark" size={20} color="#800000" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      sortBy === 'price' && sortOrder === 'desc' && styles.sortOptionSelected
                    ]}
                    onPress={() => handleSortChange('price', 'desc')}
                  >
                    <MaterialIcons 
                      name="trending-down" 
                      size={20} 
                      color={sortBy === 'price' && sortOrder === 'desc' ? '#800000' : '#666'} 
                    />
                    <Text style={[
                      styles.sortOptionText,
                      sortBy === 'price' && sortOrder === 'desc' && styles.sortOptionTextSelected
                    ]}>
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
}

// Keep the exact same styles as before...
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
  productImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e5e5',
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
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748b',
  },
  footerLoader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
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
  
  // Sort Options
  sortOptions: {
    marginTop: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
  },
  sortOptionTextSelected: {
    color: '#800000',
  },
  
  // Category Chips (Top)
  categoryChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipSelected: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  
  // Subcategory Items
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
  
  // Brand Items
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
});