// CategoryWithSubcategories.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import ProductCard from "../../components/Products/ProductCard";
import {
  ArrowLeft,
  Home,
  Grid,
  List,
  Search,
  Package,
  ChevronRight,
  Zap,
  Filter,
  X,
  Tag,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const CategoryWithSubcategories = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { subcategoryId: initialSubcategoryId, subcategoryName: initialSubcategoryName } =
    location.state || {};

  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategoryId || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [modernOnly, setModernOnly] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const [initialSubcategoryNameState] = useState(initialSubcategoryName);

  useEffect(() => {
    fetchCategoryWithSubcategories();
  }, [categoryId]);

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [selectedSubcategory, searchTerm, modernOnly, selectedBrand, minPrice, maxPrice, pagination.page]);

  const fetchCategoryWithSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/products/category/${categoryId}/with-subcategories`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load category");

      setCategory(data.category);
      setSubcategories(data.subcategories || []);

      if (data.products?.items) {
        setProducts(data.products.items);
        setPagination(data.products.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
      }

      // Try to auto-select initial subcategory
      if (initialSubcategoryId && data.subcategories?.length > 0) {
        const found = data.subcategories.find(
          (sub) => sub._id === initialSubcategoryId || sub.id === initialSubcategoryId
        );
        if (found) setSelectedSubcategory(found._id || found.id);
      }
    } catch (err) {
      setError(err.message || "Failed to load category");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (selectedSubcategory !== "all") params.append("subcategoryId", selectedSubcategory);
      if (searchTerm.trim()) params.append("search", searchTerm);
      if (modernOnly) params.append("modernOnly", "true");
      if (selectedBrand !== "all") params.append("brand", selectedBrand);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);

      const res = await fetch(
        `${API_BASE_URL}/api/products/category/${categoryId}/products?${params}`
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load products");

      setProducts(data.products?.items || []);
      setPagination(data.products?.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load products");
    }
  };

  const handleSubcategoryClick = (id) => {
    setSelectedSubcategory(id);
    setSelectedBrand("all");
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleClearFilters = () => {
    setSelectedSubcategory("all");
    setSearchTerm("");
    setModernOnly(false);
    setSelectedBrand("all");
    setMinPrice("");
    setMaxPrice("");
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((p) => ({ ...p, page: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentSub = subcategories.find(
    (sub) => sub._id === selectedSubcategory || sub.id === selectedSubcategory
  ) || (selectedSubcategory === "all" ? null : { title: initialSubcategoryNameState });

  const hasActiveFilters =
    selectedSubcategory !== "all" ||
    searchTerm ||
    modernOnly ||
    selectedBrand !== "all" ||
    minPrice ||
    maxPrice;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-6 space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-xl mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-4/5 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/5 mb-4" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 max-w-lg w-full text-center">
          <div className="text-orange-600 text-6xl mb-6">!</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {error ? "Something went wrong" : "Category not found"}
          </h2>
          <p className="text-gray-600 mb-8">{error || "The category you're looking for doesn't exist."}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition"
            >
              All Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb + Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-500 mb-4 flex-wrap gap-2">
            <button onClick={() => navigate("/")} className="hover:text-orange-600 flex items-center gap-1">
              <Home size={16} /> Home
            </button>
            <ChevronRight size={16} />
            <button onClick={() => navigate("/products")} className="hover:text-orange-600">
              Categories
            </button>
            <ChevronRight size={16} />
            <span className="text-orange-600 font-medium">{category.name}</span>
            {currentSub && (
              <>
                <ChevronRight size={16} />
                <span className="text-orange-600 font-medium">{currentSub.title}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                {currentSub ? `${currentSub.title}` : category.name}
              </h1>
              <p className="mt-1.5 text-gray-600">
                {products.length} products • {subcategories.length} subcategories
              </p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition text-gray-700 font-medium"
            >
              <ArrowLeft size={18} />
              All Categories
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Subcategories */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                Subcategories
                <span className="text-sm text-gray-500">({subcategories.length})</span>
              </h3>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                <button
                  onClick={() => handleSubcategoryClick("all")}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    selectedSubcategory === "all"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "hover:bg-orange-50 border border-transparent hover:border-orange-100"
                  }`}
                >
                  All Products
                </button>

                {subcategories.map((sub) => (
                  <button
                    key={sub._id || sub.id}
                    onClick={() => handleSubcategoryClick(sub._id || sub.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                      selectedSubcategory === (sub._id || sub.id)
                        ? "bg-orange-600 text-white shadow-sm"
                        : "hover:bg-orange-50 border border-transparent hover:border-orange-100"
                    }`}
                  >
                    {sub.title}
                    <span
                      className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        selectedSubcategory === (sub._id || sub.id)
                          ? "bg-orange-500/30 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {sub.count || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Summary */}
            {hasActiveFilters && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Active Filters</h3>
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSubcategory !== "all" && currentSub && (
                    <span className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-800 text-xs rounded-full">
                      {currentSub.title}
                      <button onClick={() => handleSubcategoryClick("all")} className="ml-1">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {modernOnly && (
                    <span className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-800 text-xs rounded-full">
                      Modern Only
                      <button onClick={() => setModernOnly(false)} className="ml-1">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {selectedBrand !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-800 text-xs rounded-full">
                      {selectedBrand}
                      <button onClick={() => setSelectedBrand("all")} className="ml-1">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-800 text-xs rounded-full">
                      ₹{minPrice || 0} – ₹{maxPrice || "∞"}
                      <button
                        onClick={() => {
                          setMinPrice("");
                          setMaxPrice("");
                        }}
                        className="ml-1"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Main */}
          <main className="lg:col-span-9">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search in this category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex border border-gray-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2.5 ${
                      viewMode === "grid" ? "bg-orange-600 text-white" : "hover:bg-orange-50"
                    } transition-colors`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2.5 ${
                      viewMode === "list" ? "bg-orange-600 text-white" : "hover:bg-orange-50"
                    } transition-colors`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-gray-400 text-7xl mb-6">📦</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">No products found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Try adjusting your filters or search term.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition shadow-sm hover:shadow"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {products.map((product) => (
                      <Link
                        key={product._id}
                        to={`/product/${product._id || product.numericId}`}
                        className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-64 flex-shrink-0">
                            <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                              <img
                                src={product.images?.[0] || "https://via.placeholder.com/400"}
                                alt={product.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                              {product.discount > 0 && (
                                <span className="absolute top-3 left-3 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                                  -{product.discount}%
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h3 className="font-semibold text-xl text-gray-900 group-hover:text-orange-700 transition-colors line-clamp-2">
                                  {product.name}
                                </h3>
                                {product.brand && (
                                  <p className="text-sm text-gray-600 mt-1">{product.brand}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                  ₹{product.price?.toLocaleString()}
                                </div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <div className="text-sm text-gray-400 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="mt-3 text-gray-600 line-clamp-3 text-sm flex-1">
                              {product.description || "No description available"}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-3 text-sm">
                              {product.tags?.includes("modern") && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                                  <Zap size={14} /> Modern
                                </span>
                              )}
                              {product.inventory?.stock > 0 && (
                                <span className="text-green-600 font-medium">In Stock</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-sm text-gray-600">
                      Showing {(pagination.page - 1) * pagination.limit + 1}–
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="px-5 py-2.5 border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-orange-50 transition"
                      >
                        Previous
                      </button>

                      {Array.from({ length: Math.min(7, pagination.pages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-xl font-medium transition ${
                              pagination.page === page
                                ? "bg-orange-600 text-white"
                                : "border border-gray-300 hover:bg-orange-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        disabled={pagination.page === pagination.pages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="px-5 py-2.5 border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-orange-50 transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryWithSubcategories;