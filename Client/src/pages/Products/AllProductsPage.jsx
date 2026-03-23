import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ShoppingBag, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Star,
  Eye,
  Heart,
  Sliders,
  Building2,
  Briefcase,
  GraduationCap,
  Hospital,
  Truck,
  Package,
  TrendingUp,
  DollarSign,
  Zap,
  Award,
  Shield,
  Clock
} from "lucide-react";

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

const AllProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = All Products
  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const [filters, setFilters] = useState({
    subCategoryId: searchParams.get("subCategoryId") || "",
    itemTypeId:    searchParams.get("itemTypeId")    || "",
    brand:         searchParams.get("brand")         || "",
    minPrice:      searchParams.get("minPrice")      || "",
    maxPrice:      searchParams.get("maxPrice")      || "",
  });

  const [activeFilters, setActiveFilters] = useState({
    subCategoryId: searchParams.get("subCategoryId") || "",
    itemTypeId:    searchParams.get("itemTypeId")    || "",
    brand:         searchParams.get("brand")         || "",
    minPrice:      searchParams.get("minPrice")      || "",
    maxPrice:      searchParams.get("maxPrice")      || "",
  });

  // ─── Sync filters → URL ────────────────────────────────────────────
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    if (selectedCategory) params.categoryId = selectedCategory._id;
    setSearchParams(params, { replace: true });
  }, [filters, selectedCategory]);

  // ─── Fetch categories ──────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories/public/categories");
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setCategories(data);
    } catch (err) {
      console.error("Categories fetch failed:", err);
    }
  };

  // ─── Fetch products ────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      Object.entries(activeFilters).forEach(([k, v]) => { if (v) params[k] = v; });

      const url = selectedCategory
        ? `/products/category/${selectedCategory._id}`
        : "/products/public";

      const res = await API.get(url, { params });

      const data = Array.isArray(res.data?.products)
        ? res.data.products
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setProducts(data);

      const uniqueBrands = [
        ...new Set(data.map((p) => p.brand).filter(Boolean)),
      ].sort();
      setBrands(uniqueBrands);
    } catch (err) {
      console.error("Products fetch failed:", err);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Category tab click ────────────────────────────────────────────
  const handleCategoryClick = (category) => {
    if (selectedCategory?._id === category._id) {
      setSelectedCategory(null);
      setSubCategories([]);
      setItemTypes([]);
    } else {
      setSelectedCategory(category);
      setSubCategories(category.subCategories || []);
      setItemTypes(category.subCategories?.flatMap((s) => s.items || []) || []);
    }

    const reset = { subCategoryId: "", itemTypeId: "", brand: "", minPrice: "", maxPrice: "" };
    setFilters(reset);
    setActiveFilters(reset);
  };

  // ─── "All Products" tab ────────────────────────────────────────────
  const handleAllProductsClick = () => {
    setSelectedCategory(null);
    setSubCategories([]);
    setItemTypes([]);
    const reset = { subCategoryId: "", itemTypeId: "", brand: "", minPrice: "", maxPrice: "" };
    setFilters(reset);
    setActiveFilters(reset);
  };

  // ─── Subcategory change ────────────────────────────────────────────
  const handleSubCategoryChange = (subCategoryId) => {
    setFilters((prev) => ({ ...prev, subCategoryId, itemTypeId: "" }));

    if (!subCategoryId) {
      setItemTypes(selectedCategory?.subCategories?.flatMap((s) => s.items || []) || []);
      return;
    }
    const sub = selectedCategory?.subCategories?.find((s) => s._id === subCategoryId);
    setItemTypes(sub?.items || []);
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
    setShowFilters(false);
  };

  const clearFilters = () => {
    const reset = { subCategoryId: "", itemTypeId: "", brand: "", minPrice: "", maxPrice: "" };
    setFilters(reset);
    setActiveFilters(reset);
    setItemTypes(selectedCategory?.subCategories?.flatMap((s) => s.items || []) || []);
  };

  const removeFilter = (filterKey) => {
    const updatedFilters = { ...activeFilters };
    delete updatedFilters[filterKey];
    setActiveFilters(updatedFilters);
    
    const updatedFilterState = { ...filters };
    delete updatedFilterState[filterKey];
    setFilters(updatedFilterState);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    // Sort logic can be added here
  };

  const handleProductClick = (productId) => navigate(`/product/${productId}`);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, activeFilters]);

  // ─── Helpers ──────────────────────────────────────────────────────
  const getCategoryIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("hospital") || n.includes("medical")) return <Hospital className="w-5 h-5" />;
    if (n.includes("office")) return <Briefcase className="w-5 h-5" />;
    if (n.includes("school")) return <GraduationCap className="w-5 h-5" />;
    return <Building2 className="w-5 h-5" />;
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== "");

  // ─── Skeleton ─────────────────────────────────────────────────────
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
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

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {selectedCategory?.name || "All Products"}
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl text-sm">
                Discover premium furniture solutions for healthcare, office, and educational environments
              </p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {products.length} products available
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Category Tabs */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Browse by Category
          </h2>
          <div className="flex flex-wrap gap-3">

            {/* "All Products" tab */}
            <button
              onClick={handleAllProductsClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium
                ${!selectedCategory
                  ? "bg-[#0a2540] text-white shadow-md" 
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>All Products</span>
              {!selectedCategory && (
                <span className="ml-1 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">Active</span>
              )}
            </button>

            {/* Dynamic category tabs */}
            {categories.map((cat) => {
              const isSelected = selectedCategory?._id === cat._id;
              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium
                    ${isSelected
                      ? "bg-[#0a2540] text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                >
                  {getCategoryIcon(cat.name)}
                  <span>{cat.name}</span>
                  {isSelected && (
                    <span className="ml-1 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">Active</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Filters Sidebar (Desktop) ── */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>

              {/* Sub Category */}
              {selectedCategory && subCategories.length > 0 && (
                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    Sub Category
                  </label>
                  <select
                    value={filters.subCategoryId}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2540]"
                  >
                    <option value="">All Sub Categories</option>
                    {subCategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>{sub.name || sub.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Item Type */}
              {itemTypes.length > 0 && (
                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    Item Type
                  </label>
                  <select
                    value={filters.itemTypeId}
                    onChange={(e) => setFilters({ ...filters, itemTypeId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2540]"
                  >
                    <option value="">All Item Types</option>
                    {itemTypes.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Brand */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Brand
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2540]"
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number" placeholder="Min" value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2540]"
                  />
                  <input
                    type="number" placeholder="Max" value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2540]"
                  />
                </div>
              </div>

              <button
                onClick={applyFilters}
                className="w-full bg-[#0a2540] hover:bg-[#0a1a30] text-white font-medium py-2.5 rounded-lg transition-all duration-300 text-sm"
              >
                Apply Filters
              </button>

              {/* Active filter tags */}
              {hasActiveFilters && (
                <div className="mt-5 pt-5 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Active Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.subCategoryId && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                        {subCategories.find((s) => s._id === activeFilters.subCategoryId)?.name}
                        <button onClick={() => removeFilter("subCategoryId")} className="hover:text-blue-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {activeFilters.itemTypeId && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                        {itemTypes.find((i) => i._id === activeFilters.itemTypeId)?.name}
                        <button onClick={() => removeFilter("itemTypeId")} className="hover:text-blue-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {activeFilters.brand && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                        {activeFilters.brand}
                        <button onClick={() => removeFilter("brand")} className="hover:text-blue-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {(activeFilters.minPrice || activeFilters.maxPrice) && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                        ₹{activeFilters.minPrice || "0"} – ₹{activeFilters.maxPrice || "∞"}
                        <button onClick={() => { removeFilter("minPrice"); removeFilter("maxPrice"); }} className="hover:text-blue-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ── Products Grid ── */}
          <main className="lg:col-span-9">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-700 text-sm">Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {Object.values(activeFilters).filter(v => v).length}
                    </span>
                  )}
                </div>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {/* Mobile Filters Panel */}
              {showFilters && (
                <div className="mt-3 bg-white rounded-lg border border-gray-200 p-4">
                  {selectedCategory && subCategories.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Sub Category</label>
                      <select
                        value={filters.subCategoryId}
                        onChange={(e) => handleSubCategoryChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                      >
                        <option value="">All Sub Categories</option>
                        {subCategories.map((sub) => (
                          <option key={sub._id} value={sub._id}>{sub.name || sub.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {itemTypes.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Item Type</label>
                      <select
                        value={filters.itemTypeId}
                        onChange={(e) => setFilters({ ...filters, itemTypeId: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                      >
                        <option value="">All Item Types</option>
                        {itemTypes.map((item) => (
                          <option key={item._id} value={item._id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      value={filters.brand}
                      onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    >
                      <option value="">All Brands</option>
                      {brands.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Price Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} className="border border-gray-300 rounded-lg p-2 text-sm" />
                      <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} className="border border-gray-300 rounded-lg p-2 text-sm" />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={applyFilters} className="flex-1 bg-[#0a2540] text-white py-2 rounded-lg text-sm font-medium">Apply</button>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">Clear</button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Results info & sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  {products.length} Products
                  {hasActiveFilters && (
                    <span className="ml-2 text-xs font-normal text-blue-600">(filtered)</span>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-xs">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2540]"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {loading ? (
              <SkeletonLoader />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <Zap className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{error}</h3>
                <button
                  onClick={fetchProducts}
                  className="mt-3 px-6 py-2 bg-[#0a2540] text-white font-medium rounded-lg hover:bg-[#0a1a30] transition text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm">
                  {hasActiveFilters
                    ? "Try adjusting your filters or clear them to see more results."
                    : "No products available right now."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-[#0a2540] text-white font-medium rounded-lg hover:bg-[#0a1a30] transition text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 hover:border-[#0a2540]/30 transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={product.images?.[0] || `https://placehold.co/400x300/0a2540/ffffff?text=${encodeURIComponent(product.name || "Product")}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/400x300/0a2540/ffffff?text=Product`;
                        }}
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                            -{product.discount}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {product.brand || "Standard"}
                        </span>
                        {product.rating && (
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-[#0a2540] transition-colors min-h-[2.5rem]">
                        {product.name}
                      </h3>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price?.toLocaleString() || "—"}
                        </span>
                        {product.originalPrice && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                            <span className="text-xs font-medium text-green-600">
                              Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </span>
                          </>
                        )}
                      </div>

                      <button className="w-full bg-[#0a2540] hover:bg-[#0a1a30] text-white font-medium py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md text-sm">
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