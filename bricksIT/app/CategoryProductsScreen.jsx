// CategoryProductsScreen.js - UPDATED
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ProductCard from "../components/Products/ProductCard";

const { width } = Dimensions.get("window");
const API_BASE_URL = "https://bricks-backend-qyea.onrender.com";

const CategoryProductsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get category data from navigation params
  const { categoryId, categoryName, subcategoryId, subcategoryName } =
    route.params || {};

  console.log("Category Params:", {
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

  const [selectedSubcategory, setSelectedSubcategory] = useState(
    subcategoryId || "all",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [modernOnly, setModernOnly] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  // Filter states
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [showSubcategoryFilter, setShowSubcategoryFilter] = useState(false);

  // Fetch category data
  const fetchCategoryWithSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!categoryId) {
        throw new Error("Category ID is required");
      }

      console.log("Fetching category:", categoryId);

      const response = await fetch(
        `${API_BASE_URL}/api/products/category/${categoryId}/with-subcategories`,
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch category: HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("API Result:", result);

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch data");
      }

      // Set category data
      setCategory(result.category || { name: categoryName || "Category" });

      // Process subcategories
      const processedSubcategories = result.subcategories || [];
      console.log("Subcategories:", processedSubcategories);
      setSubcategories(processedSubcategories);

      // Set initial products if available
      if (result.products && result.products.items) {
        console.log("Initial products:", result.products.items.length);
        setProducts(result.products.items);
        setPagination(
          result.products.pagination || {
            page: 1,
            limit: 20,
            total: result.products.items.length,
            pages: 1,
          },
        );
      }

      // Handle initial subcategory selection
      if (subcategoryId && processedSubcategories.length > 0) {
        let foundSubcategory = processedSubcategories.find(
          (sub) => sub._id === subcategoryId || sub.id === subcategoryId,
        );

        if (!foundSubcategory) {
          foundSubcategory = processedSubcategories.find(
            (sub) => sub.title === subcategoryName,
          );
        }

        if (foundSubcategory) {
          console.log("Found subcategory:", foundSubcategory);
          setSelectedSubcategory(foundSubcategory._id || foundSubcategory.id);
        }
      }
    } catch (err) {
      console.error("Error fetching category:", err);
      setError(err.message || "Failed to load category data");

      // Fallback: Create a mock category if API fails
      if (categoryName) {
        setCategory({ name: categoryName });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch products based on filters
  const fetchProducts = async () => {
    try {
      if (!categoryId) return;

      console.log("Fetching products with filters:", {
        categoryId,
        selectedSubcategory,
        searchTerm,
        modernOnly,
        selectedBrand,
        minPrice,
        maxPrice,
        page: pagination.page,
      });

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (selectedSubcategory && selectedSubcategory !== "all") {
        params.append("subcategoryId", selectedSubcategory);
      }

      if (searchTerm.trim()) {
        params.append("search", searchTerm);
      }

      if (modernOnly) {
        params.append("modernOnly", "true");
      }

      if (selectedBrand && selectedBrand !== "all") {
        params.append("brand", selectedBrand);
      }

      if (minPrice) {
        params.append("minPrice", minPrice);
      }

      if (maxPrice) {
        params.append("maxPrice", maxPrice);
      }

      const url = `${API_BASE_URL}/api/products/category/${categoryId}/products?${params}`;
      console.log("Fetch URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Products result:", result);

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch products");
      }

      setProducts(result.products?.items || []);
      setPagination(
        result.products?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 1,
        },
      );
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products");
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategoryWithSubcategories();
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      fetchProducts();
    }
  }, [
    selectedSubcategory,
    searchTerm,
    modernOnly,
    selectedBrand,
    minPrice,
    maxPrice,
    pagination.page,
  ]);

  useEffect(() => {
    if (products.length > 0) {
      const uniqueBrands = [
        ...new Set(
          products
            .map((p) => p.brand)
            .filter((brand) => brand && brand.trim() !== "")
            .sort((a, b) => a.localeCompare(b)),
        ),
      ];
      setBrands(uniqueBrands);
    } else {
      setBrands([]);
    }
  }, [products]);

  const handleSubcategoryClick = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    setSelectedBrand("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
    setShowSubcategoryFilter(false);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setShowBrandFilter(false);
  };

  const handleClearFilters = () => {
    setSelectedSubcategory("all");
    setSearchTerm("");
    setModernOnly(false);
    setSelectedBrand("all");
    setMinPrice("");
    setMaxPrice("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const toggleModernFilter = () => {
    setModernOnly(!modernOnly);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategoryWithSubcategories();
  };

  const getCurrentSubcategory = () => {
    if (selectedSubcategory === "all") {
      if (subcategoryName && selectedSubcategory === "all") {
        return { title: subcategoryName };
      }
      return null;
    }
    return subcategories.find(
      (sub) =>
        sub._id === selectedSubcategory || sub.id === selectedSubcategory,
    );
  };

  const getProductStats = () => {
    const modernProducts = products.filter(
      (p) =>
        p.tags?.includes("modern") ||
        p.name?.toLowerCase().includes("modern") ||
        p.description?.toLowerCase().includes("modern"),
    );

    const prices = products.map((p) => p.price).filter((p) => p > 0);
    const minPriceValue = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPriceValue = prices.length > 0 ? Math.max(...prices) : 0;

    const brandCounts = {};
    products.forEach((product) => {
      if (product.brand) {
        brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
      }
    });

    return {
      total: products.length,
      modernCount: modernProducts.length,
      withDiscount: products.filter(
        (p) => p.discount > 0 || (p.originalPrice && p.originalPrice > p.price),
      ).length,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
      brandCounts: brandCounts,
    };
  };

  const currentSubcategory = getCurrentSubcategory();
  const productStats = getProductStats();
  const hasActiveFilters =
    selectedSubcategory !== "all" ||
    searchTerm ||
    modernOnly ||
    selectedBrand !== "all" ||
    minPrice ||
    maxPrice;

  const renderProductItem = ({ item }) => (
    <ProductCard
      product={item}
      viewMode={viewMode}
      onPress={() =>
        navigation.navigate("ProductDetail", {
          productId: item._id || item.numericId,
          productName: item.name,
        })
      }
    />
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Subcategories */}
            {subcategories.length > 0 && (
              <View style={styles.filterSection}>
                <TouchableOpacity
                  style={styles.filterHeader}
                  onPress={() =>
                    setShowSubcategoryFilter(!showSubcategoryFilter)
                  }
                >
                  <Text style={styles.filterTitle}>Subcategories</Text>
                  <Ionicons
                    name={showSubcategoryFilter ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#800000"
                  />
                </TouchableOpacity>

                {showSubcategoryFilter && (
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        selectedSubcategory === "all" &&
                          styles.filterOptionSelected,
                      ]}
                      onPress={() => handleSubcategoryClick("all")}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedSubcategory === "all" &&
                            styles.filterOptionTextSelected,
                        ]}
                      >
                        All Products
                      </Text>
                      <Text style={styles.filterCount}>
                        {productStats.total}
                      </Text>
                    </TouchableOpacity>

                    {subcategories.map((subcat) => (
                      <TouchableOpacity
                        key={subcat._id || subcat.id}
                        style={[
                          styles.filterOption,
                          (selectedSubcategory === subcat._id ||
                            selectedSubcategory === subcat.id) &&
                            styles.filterOptionSelected,
                        ]}
                        onPress={() =>
                          handleSubcategoryClick(subcat._id || subcat.id)
                        }
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            (selectedSubcategory === subcat._id ||
                              selectedSubcategory === subcat.id) &&
                              styles.filterOptionTextSelected,
                          ]}
                        >
                          {subcat.title}
                        </Text>
                        <Text style={styles.filterCount}>
                          {subcat.count || 0}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Brands */}
            {brands.length > 0 && (
              <View style={styles.filterSection}>
                <TouchableOpacity
                  style={styles.filterHeader}
                  onPress={() => setShowBrandFilter(!showBrandFilter)}
                >
                  <Text style={styles.filterTitle}>Brands</Text>
                  <Ionicons
                    name={showBrandFilter ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#800000"
                  />
                </TouchableOpacity>

                {showBrandFilter && (
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        selectedBrand === "all" && styles.filterOptionSelected,
                      ]}
                      onPress={() => handleBrandChange("all")}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedBrand === "all" &&
                            styles.filterOptionTextSelected,
                        ]}
                      >
                        All Brands
                      </Text>
                      <Text style={styles.filterCount}>{brands.length}</Text>
                    </TouchableOpacity>

                    {brands.map((brand) => (
                      <TouchableOpacity
                        key={brand}
                        style={[
                          styles.filterOption,
                          selectedBrand === brand &&
                            styles.filterOptionSelected,
                        ]}
                        onPress={() => handleBrandChange(brand)}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            selectedBrand === brand &&
                              styles.filterOptionTextSelected,
                          ]}
                        >
                          {brand}
                        </Text>
                        <Text style={styles.filterCount}>
                          {productStats.brandCounts[brand] || 0}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Price Range */}
            <View style={styles.filterSection}>
              <TouchableOpacity
                style={styles.filterHeader}
                onPress={() => setShowPriceFilter(!showPriceFilter)}
              >
                <Text style={styles.filterTitle}>Price Range</Text>
                <Ionicons
                  name={showPriceFilter ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#800000"
                />
              </TouchableOpacity>

              {showPriceFilter && (
                <View style={styles.filterOptions}>
                  <View style={styles.priceInputContainer}>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Min"
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="numeric"
                    />
                    <Text style={styles.priceSeparator}>-</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Max"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Modern Filter */}
            <View style={styles.filterSection}>
              <TouchableOpacity
                style={styles.filterOption}
                onPress={toggleModernFilter}
              >
                <View
                  style={[
                    styles.checkbox,
                    modernOnly && styles.checkboxSelected,
                  ]}
                >
                  {modernOnly && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.filterOptionText}>Modern Designs Only</Text>
                {modernOnly && (
                  <Text style={styles.filterCount}>
                    {productStats.modernCount}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.filterButton, styles.clearButton]}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, styles.applyButton]}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#800000" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Loading Products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !category) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#800000" barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCategoryWithSubcategories}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: "#666", marginTop: 10 },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
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
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentSubcategory
              ? currentSubcategory.title
              : category?.name || categoryName || "Products"}
          </Text>
          {products.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {products.length} {products.length === 1 ? "product" : "products"}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButtonHeader}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#fff" />
          {hasActiveFilters && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#999"
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Active Filters */}
      {hasActiveFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersContainer}
        >
          <View style={styles.activeFilters}>
            {selectedSubcategory !== "all" && currentSubcategory && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>
                  {currentSubcategory.title}
                </Text>
                <TouchableOpacity onPress={() => handleSubcategoryClick("all")}>
                  <Ionicons name="close" size={14} color="#800000" />
                </TouchableOpacity>
              </View>
            )}
            {modernOnly && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>Modern Only</Text>
                <TouchableOpacity onPress={toggleModernFilter}>
                  <Ionicons name="close" size={14} color="#800000" />
                </TouchableOpacity>
              </View>
            )}
            {selectedBrand !== "all" && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>{selectedBrand}</Text>
                <TouchableOpacity onPress={() => setSelectedBrand("all")}>
                  <Ionicons name="close" size={14} color="#800000" />
                </TouchableOpacity>
              </View>
            )}
            {minPrice && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>Min: ₹{minPrice}</Text>
                <TouchableOpacity onPress={() => setMinPrice("")}>
                  <Ionicons name="close" size={14} color="#800000" />
                </TouchableOpacity>
              </View>
            )}
            {maxPrice && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>Max: ₹{maxPrice}</Text>
                <TouchableOpacity onPress={() => setMaxPrice("")}>
                  <Ionicons name="close" size={14} color="#800000" />
                </TouchableOpacity>
              </View>
            )}
            {searchTerm && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>
                  Search: {searchTerm}
                </Text>
                <TouchableOpacity onPress={() => setSearchTerm("")}>
                  <Ionicons name="close" size={14} color="#800000" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* View Toggle */}
      <View style={styles.viewToggleContainer}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === "grid" && styles.viewToggleButtonActive,
            ]}
            onPress={() => setViewMode("grid")}
          >
            <Ionicons
              name="grid"
              size={20}
              color={viewMode === "grid" ? "#800000" : "#666"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === "list" && styles.viewToggleButtonActive,
            ]}
            onPress={() => setViewMode("list")}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewMode === "list" ? "#800000" : "#666"}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Text style={styles.filterText}>
            Filter{" "}
            {hasActiveFilters &&
              `(${Object.keys(productStats.brandCounts).length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      {products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) =>
            item._id || item.numericId || Math.random().toString()
          }
          key={viewMode === "grid" ? "grid" : "list"}
          numColumns={viewMode === "grid" ? 2 : 1}
          contentContainerStyle={[
            styles.productsContainer,
            viewMode === "grid" && styles.gridContainer,
          ]}
          columnWrapperStyle={viewMode === "grid" ? styles.columnWrapper : null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#800000"]}
            />
          }
          ListFooterComponent={
            pagination.pages > 1 ? (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    pagination.page === 1 && styles.pageButtonDisabled,
                  ]}
                  onPress={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      pagination.page === 1 && styles.pageButtonTextDisabled,
                    ]}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>
                  Page {pagination.page} of {pagination.pages}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    pagination.page === pagination.pages &&
                      styles.pageButtonDisabled,
                  ]}
                  onPress={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(pagination.pages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.pages}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      pagination.page === pagination.pages &&
                        styles.pageButtonTextDisabled,
                    ]}
                  >
                    Next
                  </Text>
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
              colors={["#800000"]}
            />
          }
        >
          <View style={styles.emptyContent}>
            <Ionicons name="cube-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptyText}>
              {hasActiveFilters
                ? "No products match your filters. Try changing your search criteria."
                : "There are no products available in this category yet."}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearAllButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* Filter Modal */}
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#800000",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  filterButtonHeader: {
    padding: 8,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffcc00",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  activeFiltersContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  activeFilters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeFilterTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#800000",
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    color: "#800000",
  },
  viewToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  viewToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewToggleButtonActive: {
    backgroundColor: "rgba(128, 0, 0, 0.1)",
  },
  filterText: {
    color: "#800000",
    fontSize: 14,
    fontWeight: "500",
  },
  productsContainer: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  gridContainer: {
    paddingHorizontal: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  pageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#800000",
    borderRadius: 6,
  },
  pageButtonDisabled: {
    backgroundColor: "#ccc",
  },
  pageButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  pageButtonTextDisabled: {
    color: "#666",
  },
  pageInfo: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  clearAllButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#800000",
    borderRadius: 8,
  },
  clearAllButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#800000",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    maxHeight: "70%",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#f0f0f0",
  },
  clearButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: "#800000",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // Filter Section Styles
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  filterOptions: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  filterOptionSelected: {
    backgroundColor: "rgba(128, 0, 0, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  filterOptionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  filterOptionTextSelected: {
    color: "#800000",
    fontWeight: "600",
  },
  filterCount: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#800000",
    borderColor: "#800000",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  priceSeparator: {
    fontSize: 16,
    color: "#666",
  },
});

export default CategoryProductsScreen;
