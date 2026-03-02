import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state - initialized from URL
  const [filters, setFilters] = useState({
    subCategoryId: searchParams.get("subCategoryId") || "",
    itemTypeId: searchParams.get("itemTypeId") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  // Active filters for API calls
  const [activeFilters, setActiveFilters] = useState({});

  const API = axios.create({
    baseURL: "https://bricks-backend-qyea.onrender.com/api/v1",
  });

  // Sync filters → URL when filters change
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch category structure (subcategories + item types)
  const fetchCategoryData = async () => {
    try {
      const res = await API.get("/categories/public/categories");
      const allCategories = res.data.data || [];

      const foundCategory = allCategories.find((c) => c._id === categoryId);
      if (!foundCategory) {
        setError("Category not found");
        return;
      }

      setCategoryData(foundCategory);
      setSubCategories(foundCategory.subCategories || []);

      // Show all item types initially
      const allItemTypes =
        foundCategory.subCategories?.flatMap((sub) => sub.items || []) || [];
      setItemTypes(allItemTypes);
    } catch (err) {
      console.error("Failed to fetch category data:", err);
      setError("Failed to load category filters");
    }
  };

  // Fetch products based on current filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { ...activeFilters };

      const res = await API.get(`/products/category/${categoryId}`, { params });

      const fetchedProducts = res.data.products || [];
      setProducts(fetchedProducts);

      // Extract unique brands
      if (fetchedProducts.length > 0) {
        const uniqueBrands = [
          ...new Set(fetchedProducts.map((p) => p.brand).filter(Boolean)),
        ];
        setBrands(uniqueBrands);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle subcategory selection → filter item types
  const handleSubCategoryChange = (subCategoryId) => {
    setFilters((prev) => ({
      ...prev,
      subCategoryId,
      itemTypeId: "", // reset item type when subcategory changes
    }));

    if (!subCategoryId) {
      // Show all item types from all subcategories
      const allItemTypes =
        categoryData?.subCategories?.flatMap((sub) => sub.items || []) || [];
      setItemTypes(allItemTypes);
      return;
    }

    const selectedSub = categoryData?.subCategories?.find(
      (sub) => sub._id === subCategoryId,
    );

    setItemTypes(selectedSub?.items || []);
  };

  // Apply filters
  const applyFilters = () => {
    setActiveFilters({ ...filters });
  };

  const clearFilters = () => {
    const clearedFilters = {
      subCategoryId: "",
      itemTypeId: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
    };

    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);

    setItemTypes(
      categoryData?.subCategories?.flatMap((sub) => sub.items || []) || [],
    );
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Initial load
  useEffect(() => {
    fetchCategoryData();
  }, [categoryId]);

  // Re-fetch products when active filters or category changes
  useEffect(() => {
    if (categoryId) {
      fetchProducts();
    }
  }, [activeFilters, categoryId]);

  // Check if any filter is active
  const hasActiveFilters = Object.values(activeFilters).some(
    (value) => value !== "",
  );

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {categoryData?.name || "Products"}
          </h1>
          {categoryData?.description && (
            <p className="text-gray-600 max-w-3xl">
              {categoryData.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FILTER SIDEBAR */}
          <aside className="lg:col-span-3">
            <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-medium text-[#800000] hover:text-[#600000] transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Sub Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Category
                </label>
                <select
                  className="w-full border border-gray-300 p-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition rounded-lg"
                  value={filters.subCategoryId}
                  onChange={(e) => handleSubCategoryChange(e.target.value)}
                >
                  <option value="">All Sub Categories</option>
                  {subCategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.title || sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Type
                </label>
                <select
                  className="w-full border border-gray-300 p-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition rounded-lg"
                  value={filters.itemTypeId}
                  onChange={(e) =>
                    setFilters({ ...filters, itemTypeId: e.target.value })
                  }
                  disabled={!filters.subCategoryId && itemTypes.length === 0}
                >
                  <option value="">All Item Types</option>
                  {itemTypes.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  className="w-full border border-gray-300 p-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition rounded-lg"
                  value={filters.brand}
                  onChange={(e) =>
                    setFilters({ ...filters, brand: e.target.value })
                  }
                >
                  <option value="">All Brands</option>
                  {brands.map((brandName) => (
                    <option key={brandName} value={brandName}>
                      {brandName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    className="w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition rounded-lg"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    className="w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition rounded-lg"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={applyFilters}
                className="w-full bg-[#800000] hover:bg-[#600000] text-white font-medium py-3 rounded-lg hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Apply Filters
              </button>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Active Filters:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.subCategoryId && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        Sub Category:{" "}
                        {subCategories.find(
                          (s) => s._id === activeFilters.subCategoryId,
                        )?.name || "Selected"}
                      </span>
                    )}
                    {activeFilters.itemTypeId && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        Item Type:{" "}
                        {itemTypes.find(
                          (i) => i._id === activeFilters.itemTypeId,
                        )?.name || "Selected"}
                      </span>
                    )}
                    {activeFilters.brand && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        Brand: {activeFilters.brand}
                      </span>
                    )}
                    {(activeFilters.minPrice || activeFilters.maxPrice) && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        Price: ₹{activeFilters.minPrice || "0"} - ₹
                        {activeFilters.maxPrice || "∞"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* PRODUCTS MAIN CONTENT */}
          <main className="lg:col-span-9">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {products.length} Products Found
                  {hasActiveFilters && (
                    <span className="ml-2 text-sm font-normal text-[#800000]">
                      (Filtered Results)
                    </span>
                  )}
                </h2>
                {Object.values(filters).some((v) => v) && !hasActiveFilters && (
                  <p className="text-gray-500 text-sm mt-1">
                    Filters selected - Click "Apply Filters" to update results
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm">Sort by:</span>
                <select className="border border-gray-300 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent rounded-lg">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Best Selling</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <SkeletonLoader />
            ) : error ? (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 p-8 text-center rounded-xl">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {error}
                </h3>
                <button
                  onClick={fetchProducts}
                  className="mt-4 px-5 py-2 bg-[#800000] hover:bg-[#600000] text-white font-medium hover:shadow-md transition-all rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white p-12 text-center border border-gray-200 rounded-xl">
                <div className="text-gray-400 text-5xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters
                    ? "No products match your filters. Try adjusting them."
                    : "Try adjusting your filters or browse other categories"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 px-6 py-3 bg-[#800000] hover:bg-[#600000] text-white font-medium hover:shadow-md transition-all rounded-lg inline-flex items-center gap-2"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="group bg-white shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#800000]/20 transition-all duration-300 cursor-pointer rounded-xl overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={
                          product.images?.[0] ||
                          "https://via.placeholder.com/400x400/cccccc/ffffff?text=Product"
                        }
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.discount && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-[#800000] text-white text-xs font-bold px-3 py-1 rounded">
                            -{product.discount}% OFF
                          </span>
                        </div>
                      )}
                      {product.isNew && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">
                            NEW
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      {/* Category/Brand */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">
                          {product.category || categoryData?.name}
                        </span>
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-700">
                              {product.rating}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-[#800000] transition-colors h-14">
                        {product.name}
                      </h3>

                      {/* Brand */}
                      {product.brand && (
                        <p className="text-sm text-gray-600 mb-3">
                          Brand:{" "}
                          <span className="font-semibold">{product.brand}</span>
                        </p>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-lg line-through text-gray-400">
                            ₹{product.originalPrice}
                          </span>
                        )}
                        {product.originalPrice && (
                          <span className="text-sm font-bold text-green-600">
                            Save ₹{product.originalPrice - product.price}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button className="w-full bg-[#800000] hover:bg-[#600000] text-white font-medium py-3 rounded-lg hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
                        View Details
                      </button>

                      {/* Quick Info */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            In Stock
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a1 1 0 00-.293-.707L18 8.586V6a1 1 0 00-1-1h-1V3a1 1 0 00-1-1H8a1 1 0 00-1 1v2H6a1 1 0 00-1 1v2.586L3.293 11.293A1 1 0 003 12v2z" />
                            </svg>
                            Free Shipping
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;
