import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

const AllProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // States
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    subCategoryId: searchParams.get("subCategoryId") || "",
    itemTypeId: searchParams.get("itemTypeId") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  const [activeFilters, setActiveFilters] = useState({});

  // Sync filters → URL
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories/public/categories");
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setCategories(data);

      if (data.length > 0) {
        // Auto-select first category or try to match from URL
        const initialCat =
          data.find((c) => c._id === searchParams.get("categoryId")) ||
          data[0];
        setSelectedCategory(initialCat);
        setSubCategories(initialCat.subCategories || []);
        setItemTypes(
          initialCat.subCategories?.flatMap((s) => s.items || []) || []
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    }
  };

  // Fetch products
  const fetchProducts = async (categoryId) => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get(
        categoryId ? `/products/category/${categoryId}` : "/products/public",
        { params: activeFilters }
      );

      const data = Array.isArray(res.data?.products)
        ? res.data.products
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setProducts(data);

      // Extract unique brands
      const uniqueBrands = [
        ...new Set(data.map((p) => p.brand).filter(Boolean)),
      ].sort();
      setBrands(uniqueBrands);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Category selection
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSubCategories(category.subCategories || []);
    setItemTypes(category.subCategories?.flatMap((s) => s.items || []) || []);

    // Reset filters on category change
    const resetFilters = {
      subCategoryId: "",
      itemTypeId: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(resetFilters);
    setActiveFilters(resetFilters);
  };

  // Subcategory change → update item types
  const handleSubCategoryChange = (subCategoryId) => {
    setFilters((prev) => ({
      ...prev,
      subCategoryId,
      itemTypeId: "", // reset item type
    }));

    if (!subCategoryId) {
      setItemTypes(
        selectedCategory?.subCategories?.flatMap((s) => s.items || []) || []
      );
      return;
    }

    const sub = selectedCategory?.subCategories?.find(
      (s) => s._id === subCategoryId
    );
    setItemTypes(sub?.items || []);
  };

  // Apply current filters
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
    setItemTypes(
      selectedCategory?.subCategories?.flatMap((s) => s.items || []) || []
    );
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when category or active filters change
  useEffect(() => {
    if (selectedCategory?._id) {
      fetchProducts(selectedCategory._id);
    }
  }, [selectedCategory, activeFilters]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Helper to get category icon
  const getCategoryIcon = (categoryName) => {
    if (categoryName?.toLowerCase().includes("hospital") || categoryName?.toLowerCase().includes("medical")) {
      return "🏥";
    } else if (categoryName?.toLowerCase().includes("office")) {
      return "💼";
    } else if (categoryName?.toLowerCase().includes("school")) {
      return "📚";
    }
    return "📦";
  };

  // Skeleton loader
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-4/5" />
            <div className="h-4 bg-gray-100 rounded w-3/5" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== "");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {selectedCategory?.name || "All Products"}
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl">
                Discover premium furniture solutions for healthcare, office, and educational environments
              </p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-blue-800">
                {products.length} products available
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs - IMPROVED VISIBILITY */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Browse by Category:</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCategory?._id === cat._id;
              const icon = getCategoryIcon(cat.name);
              
              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`
                    flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300
                    ${isSelected 
                      ? 'bg-[#0a2540] text-white shadow-lg scale-105' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                    }
                  `}
                  style={{
                    minWidth: '200px',
                    boxShadow: isSelected ? '0 10px 25px -5px rgba(10,37,64,0.3)' : 'none'
                  }}
                >
                  <span className="text-2xl">{icon}</span>
                  <div className="text-left">
                    <div className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {cat.name}
                    </div>
                    <div className={`text-xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                      {isSelected ? 'Currently viewing' : 'Click to browse'}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="ml-auto bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
                  >
                    <span>Clear all</span>
                  </button>
                )}
              </div>

              {/* Sub Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Category
                </label>
                <select
                  value={filters.subCategoryId}
                  onChange={(e) => handleSubCategoryChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:border-transparent transition"
                >
                  <option value="">All Sub Categories</option>
                  {subCategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name || sub.title}
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
                  value={filters.itemTypeId}
                  onChange={(e) =>
                    setFilters({ ...filters, itemTypeId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:border-transparent transition"
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
                  value={filters.brand}
                  onChange={(e) =>
                    setFilters({ ...filters, brand: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:border-transparent transition"
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
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:border-transparent transition"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={applyFilters}
                className="w-full bg-[#0a2540] hover:bg-[#0a1a30] text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Apply Filters
              </button>

              {/* Active filters tags */}
              {hasActiveFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Active Filters:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.subCategoryId && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                        {
                          subCategories.find(
                            (s) => s._id === activeFilters.subCategoryId
                          )?.name
                        }
                      </span>
                    )}
                    {activeFilters.itemTypeId && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                        {
                          itemTypes.find(
                            (i) => i._id === activeFilters.itemTypeId
                          )?.name
                        }
                      </span>
                    )}
                    {activeFilters.brand && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                        {activeFilters.brand}
                      </span>
                    )}
                    {(activeFilters.minPrice || activeFilters.maxPrice) && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                        ₹{activeFilters.minPrice || "0"} – ₹
                        {activeFilters.maxPrice || "∞"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Products Area */}
          <main className="lg:col-span-9">
            {/* Results info & sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {products.length} Products
                  {hasActiveFilters && (
                    <span className="ml-3 text-sm font-normal text-blue-600">
                      (filtered)
                    </span>
                  )}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm">Sort by:</span>
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2540]">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <SkeletonLoader />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {error}
                </h3>
                <button
                  onClick={() => fetchProducts(selectedCategory?._id)}
                  className="mt-4 px-8 py-3 bg-[#0a2540] text-white font-medium rounded-lg hover:bg-[#0a1a30] transition shadow-sm"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-gray-400 text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "Try adjusting your filters or clear them to see more results."
                    : "This category might be empty or still loading."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-8 py-3 bg-[#0a2540] text-white font-medium rounded-lg hover:bg-[#0a1a30] transition shadow-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-[#0a2540]/30 transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={
                          product.images?.[0] ||
                          `https://placehold.co/400x300/${product.category?.toLowerCase().includes('hospital') ? '0a2540' : '4b5563'}/ffffff?text=${product.category || 'Product'}`
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/400x300/0a2540/ffffff?text=${product.category || 'Product'}`;
                        }}
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            -{product.discount}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {product.brand || (
                            product.category?.toLowerCase().includes('hospital') ? 'Medical Grade' :
                            product.category?.toLowerCase().includes('office') ? 'Office Pro' :
                            product.category?.toLowerCase().includes('school') ? 'EduCraft' : 'Standard'
                          )}
                        </span>
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm font-medium text-gray-700">
                              {product.rating}
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-[#0a2540] transition-colors min-h-[3rem]">
                        {product.name}
                      </h3>

                      <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{product.price?.toLocaleString() || "—"}
                        </span>
                        {product.originalPrice && (
                          <>
                            <span className="text-lg text-gray-400 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              Save{" "}
                              {Math.round(
                                ((product.originalPrice - product.price) /
                                  product.originalPrice) *
                                  100
                              )}
                              %
                            </span>
                          </>
                        )}
                      </div>

                      <button className="w-full bg-[#0a2540] hover:bg-[#0a1a30] text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md group-hover:scale-[1.02]">
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

export default AllProductsPage;