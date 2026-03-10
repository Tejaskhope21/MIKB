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

  const [activeFilters, setActiveFilters] = useState({});

  const API = axios.create({
    baseURL: "http://localhost:5000/api/v1",
  });

  // Sync filters → URL
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

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

      const allItemTypes = foundCategory.subCategories?.flatMap((sub) => sub.items || []) || [];
      setItemTypes(allItemTypes);
    } catch (err) {
      console.error("Failed to fetch category data:", err);
      setError("Failed to load category structure");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { ...activeFilters };

      const res = await API.get(`/products/category/${categoryId}`, { params });
      const fetchedProducts = res.data.products || [];

      setProducts(fetchedProducts);

      if (fetchedProducts.length > 0) {
        const uniqueBrands = [...new Set(fetchedProducts.map((p) => p.brand).filter(Boolean))];
        setBrands(uniqueBrands);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubCategoryChange = (subCategoryId) => {
    setFilters((prev) => ({
      ...prev,
      subCategoryId,
      itemTypeId: "", // reset item type
    }));

    if (!subCategoryId) {
      const allItemTypes = categoryData?.subCategories?.flatMap((sub) => sub.items || []) || [];
      setItemTypes(allItemTypes);
      return;
    }

    const selectedSub = categoryData?.subCategories?.find((sub) => sub._id === subCategoryId);
    setItemTypes(selectedSub?.items || []);
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
  };

  const clearFilters = () => {
    const cleared = {
      subCategoryId: "",
      itemTypeId: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(cleared);
    setActiveFilters(cleared);

    const allItemTypes = categoryData?.subCategories?.flatMap((sub) => sub.items || []) || [];
    setItemTypes(allItemTypes);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchCategoryData();
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) fetchProducts();
  }, [activeFilters, categoryId]);

  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== "");

  // ────────────────────────────────────────────────
  //                   RENDER
  // ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {categoryData?.name || "Products"}
          </h1>
          {categoryData?.description && (
            <p className="mt-3 text-lg text-gray-600 max-w-3xl">{categoryData.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ─── FILTER SIDEBAR ─── */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:sticky lg:top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Sub Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                  value={filters.subCategoryId}
                  onChange={(e) => handleSubCategoryChange(e.target.value)}
                >
                  <option value="">All Subcategories</option>
                  {subCategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.title || sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Type</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  value={filters.itemTypeId}
                  onChange={(e) => setFilters({ ...filters, itemTypeId: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-7">
                <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={applyFilters}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Apply Filters
              </button>

              {/* Active filters tags */}
              {hasActiveFilters && (
                <div className="mt-6 pt-5 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Active filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.subCategoryId && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-800 border border-orange-100">
                        {subCategories.find((s) => s._id === activeFilters.subCategoryId)?.name}
                      </span>
                    )}
                    {activeFilters.itemTypeId && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-800 border border-orange-100">
                        {itemTypes.find((i) => i._id === activeFilters.itemTypeId)?.name}
                      </span>
                    )}
                    {activeFilters.brand && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-800 border border-orange-100">
                        {activeFilters.brand}
                      </span>
                    )}
                    {(activeFilters.minPrice || activeFilters.maxPrice) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-800 border border-orange-100">
                        ₹{activeFilters.minPrice || "0"} – ₹{activeFilters.maxPrice || "∞"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ─── MAIN PRODUCTS ─── */}
          <main className="lg:col-span-9">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {products.length} {products.length === 1 ? "Product" : "Products"}
                {hasActiveFilters && (
                  <span className="ml-2 text-base font-normal text-orange-600">(filtered)</span>
                )}
              </h2>

              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm whitespace-nowrap">Sort by:</span>
                <select className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Best Selling</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
                  >
                    <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-4/5" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/5" />
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white border border-red-100 rounded-2xl p-10 text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{error}</h3>
                <button
                  onClick={fetchProducts}
                  className="mt-4 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <div className="text-gray-400 text-6xl mb-6">📦</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "No products match your current filters. Try adjusting them."
                    : "This category might be empty or coming soon."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-7">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                      <img
                        src={
                          product.images?.[0] ||
                          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                            -{product.discount}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-gray-500">{product.brand || "—"}</span>
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium text-gray-700">{product.rating}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2 min-h-[2.75rem] group-hover:text-orange-700 transition-colors mb-2">
                        {product.name}
                      </h3>

                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{product.price?.toLocaleString() || "—"}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <>
                            <span className="text-base text-gray-400 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                            </span>
                          </>
                        )}
                      </div>

                      <button className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group-hover:scale-[1.02]">
                        View Details
                      </button>
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