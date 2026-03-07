import React, { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

/* ===============================
   AXIOS INSTANCE
================================ */
const API = axios.create({
  baseURL: "https://bricks-backend-qyea.onrender.com/api/v1",
});

/* ===============================
   COMPONENT
================================ */
const ItemTypeProducts = () => {
  const { categorySlug, subCategorySlug, itemTypeSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ids, setIds] = useState({
    categoryId: "",
    subCategoryId: "",
    itemTypeId: "",
  });

  const [categoryData, setCategoryData] = useState(null);
  const [subCategoryData, setSubCategoryData] = useState(null);
  const [itemTypeData, setItemTypeData] = useState(null);

  /* ===============================
     FILTER STATE
  ================================ */
  const [filters, setFilters] = useState({
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  const [activeFilters, setActiveFilters] = useState({});

  /* ===============================
     SYNC FILTERS → URL
  ================================ */
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  /* ===============================
     RESOLVE IDS FROM SLUGS
  ================================ */
  const resolveIds = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/categories/public/categories");
      const categories = res.data?.data || [];

      const category = categories.find((c) => c.slug === categorySlug);
      if (!category) return setError("Category not found");

      const subCategory = category.subCategories?.find(
        (sc) => sc.slug === subCategorySlug,
      );
      if (!subCategory) return setError("Subcategory not found");

      const itemType = subCategory.items?.find(
        (it) => it.slug === itemTypeSlug,
      );
      if (!itemType) return setError("Item type not found");

      setIds({
        categoryId: category._id,
        subCategoryId: subCategory._id,
        itemTypeId: itemType._id,
      });

      setCategoryData(category);
      setSubCategoryData(subCategory);
      setItemTypeData(itemType);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    }
  };

  /* ===============================
     FETCH PRODUCTS
  ================================ */
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await API.get("/products/public", {
        params: {
          ...ids,
          ...activeFilters,
        },
      });

      const list = res.data?.products || [];
      setProducts(list);

      setBrands([...new Set(list.map((p) => p.brand).filter(Boolean))]);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     HANDLERS
  ================================ */
  const applyFilters = () => {
    setActiveFilters({ ...filters });
  };

  const clearFilters = () => {
    const clearedFilters = {
      brand: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  /* ===============================
     EFFECTS
  ================================ */
  useEffect(() => {
    resolveIds();
  }, [categorySlug, subCategorySlug, itemTypeSlug]);

  useEffect(() => {
    if (ids.itemTypeId) fetchProducts();
  }, [ids, activeFilters]);

  /* ===============================
     SKELETON LOADER
  ================================ */
  const SkeletonLoader = () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, index) => (
        <div
          key={index}
          className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden"
        >
          <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  /* ===============================
     CHECK ACTIVE FILTERS
  ================================ */
  const hasActiveFilters = Object.values(activeFilters).some(
    (value) => value !== "",
  );

  /* ===============================
     UI STATES
  ================================ */
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-12 text-center rounded-xl">
            <div className="text-orange-600 text-5xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{error}</h3>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg hover:shadow-md transition-all"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* BREADCRUMB */}
        <nav className="flex items-center text-sm text-gray-600 mb-8 flex-wrap">
          <Link
            to="/"
            className="hover:text-orange-600 transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link
            to={`/category/${ids.categoryId}`}
            className="hover:text-orange-600 transition-colors capitalize"
          >
            {categoryData?.name || categorySlug?.replace(/-/g, " ")}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium capitalize">
            {subCategoryData?.name || subCategorySlug?.replace(/-/g, " ")}
          </span>
          <span className="mx-2">›</span>
          <span className="font-bold text-orange-600 capitalize">
            {itemTypeData?.name || itemTypeSlug?.replace(/-/g, " ")}
          </span>
        </nav>

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3 capitalize">
            {itemTypeData?.name || itemTypeSlug?.replace(/-/g, " ")}
          </h1>
          {itemTypeData?.description && (
            <p className="text-gray-600 max-w-3xl">
              {itemTypeData.description}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* FILTER SIDEBAR */}
          <aside className="lg:col-span-3">
            <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* BRAND FILTER */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  className="w-full border border-gray-300 p-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition rounded-lg"
                  value={filters.brand}
                  onChange={(e) =>
                    setFilters({ ...filters, brand: e.target.value })
                  }
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRICE RANGE */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Price Range
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Minimum Price"
                    className="w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition rounded-lg"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Maximum Price"
                    className="w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition rounded-lg"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* APPLY BUTTON */}
              <button
                onClick={applyFilters}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
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

              {/* ACTIVE FILTERS DISPLAY */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Active Filters:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.brand && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        Brand: {activeFilters.brand}
                      </span>
                    )}
                    {(activeFilters.minPrice || activeFilters.maxPrice) && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        Price: ₹{activeFilters.minPrice || "0"} - ₹
                        {activeFilters.maxPrice || "∞"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="lg:col-span-9">
            {/* RESULTS HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {products.length} Products Found
                  {hasActiveFilters && (
                    <span className="ml-2 text-sm font-normal text-orange-600">
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
                <select className="border border-gray-300 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-lg">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Best Selling</option>
                </select>
              </div>
            </div>

            {/* PRODUCTS GRID */}
            {loading ? (
              <SkeletonLoader />
            ) : products.length === 0 ? (
              <div className="bg-white p-12 text-center border border-gray-200 rounded-xl">
                <div className="text-gray-400 text-5xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters
                    ? "No products match your filters. Try adjusting them."
                    : "No products available in this category."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium hover:shadow-md transition-all rounded-lg inline-flex items-center gap-2"
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
                    className="group bg-white shadow-sm hover:shadow-xl border border-gray-200 hover:border-orange-200 transition-all duration-300 cursor-pointer rounded-xl overflow-hidden"
                  >
                    {/* PRODUCT IMAGE */}
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
                          <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            -{product.discount}% OFF
                          </span>
                        </div>
                      )}
                      {product.isNew && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            NEW
                          </span>
                        </div>
                      )}
                    </div>

                    {/* PRODUCT INFO */}
                    <div className="p-5">
                      {/* RATING & CATEGORY */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {product.category || itemTypeData?.name}
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

                      {/* PRODUCT NAME */}
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[3.5rem]">
                        {product.name}
                      </h3>

                      {/* BRAND */}
                      {product.brand && (
                        <p className="text-sm text-gray-600 mb-3">
                          Brand:{" "}
                          <span className="font-semibold">{product.brand}</span>
                        </p>
                      )}

                      {/* PRICE */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{product.price?.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-lg line-through text-gray-400">
                            ₹{product.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {product.originalPrice && (
                        <div className="text-sm font-bold text-green-600 mb-3">
                          Save ₹{(product.originalPrice - product.price).toLocaleString()}
                        </div>
                      )}

                      {/* VIEW DETAILS BUTTON */}
                      <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
                        View Details
                      </button>

                      {/* QUICK INFO */}
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

export default ItemTypeProducts;