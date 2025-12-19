// BrandProducts.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import ProductCard from "../../components/Products/ProductCard";
import Skeleton from '../../components/Skeleton/Skeleton';

// Static Products Data (Same as in your original code)
const staticProducts = [
  {
    _id: '1',
    details: {
      productName: 'Ambuja Cement 50kg Bag',
      description: 'Premium grade cement for construction',
      brand: 'Ambuja Cement',
      sellingPrice: 350,
      mrp: 400,
      rating: 4.5,
      reviews: 120
    },
    category: 'Cement',
    subCategory: 'PPC Cement',
    images: ['https://placehold.co/512x512/3B82F6/FFFFFF?text=Ambuja+Cement']
  },
  // ... (Add all your static products here)
];

const Pages = () => {
  const { brandName } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageIndex, setImageIndex] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

  // Decode brand name from URL
  const decodedBrandName = decodeURIComponent(brandName);

  // Load products for this brand
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [brandName]);

  // Filter products by brand
  const brandProducts = useMemo(() => {
    if (!decodedBrandName) return [];
    return staticProducts.filter(product => 
      product.details?.brand?.toLowerCase() === decodedBrandName.toLowerCase()
    );
  }, [decodedBrandName]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let filtered = [...brandProducts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.details.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.details.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price range filter
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter(product => {
        return selectedPriceRanges.some(range => {
          const [min, max] = range.split('-').map(Number);
          const price = product.details.sellingPrice || 0;
          return price >= min && price <= max;
        });
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => (a.details.sellingPrice || 0) - (b.details.sellingPrice || 0));
      case 'price-high':
        return filtered.sort((a, b) => (b.details.sellingPrice || 0) - (a.details.sellingPrice || 0));
      case 'rating':
        return filtered.sort((a, b) => (b.details.rating || 0) - (a.details.rating || 0));
      default:
        return filtered;
    }
  }, [brandProducts, searchTerm, selectedPriceRanges, sortBy]);

  // Get unique categories and subcategories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(brandProducts.map(p => p.category))].filter(Boolean);
    return uniqueCategories;
  }, [brandProducts]);

  const subcategories = useMemo(() => {
    const uniqueSubcategories = [...new Set(brandProducts.map(p => p.subCategory))].filter(Boolean);
    return uniqueSubcategories;
  }, [brandProducts]);

  // Price ranges
  const priceRanges = [
    { label: '0-500', min: 0, max: 500 },
    { label: '500-1000', min: 500, max: 1000 },
    { label: '1000-2000', min: 1000, max: 2000 },
    { label: '2000-5000', min: 2000, max: 5000 }
  ];

  const handleProductMouseEnter = (productId) => {
    setHoveredProduct(productId);
    const product = filteredProducts.find(p => p._id === productId);
    if (product?.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setImageIndex(prev => ({
          ...prev,
          [productId]: ((prev[productId] || 0) + 1) % product.images.length
        }));
      }, 2000);

      setImageIndex(prev => ({
        ...prev,
        [`${productId}_interval`]: interval
      }));
    }
  };

  const handleProductMouseLeave = (productId) => {
    setHoveredProduct(null);
    const intervalId = imageIndex[`${productId}_interval`];
    if (intervalId) {
      clearInterval(intervalId);
      setImageIndex(prev => {
        const newState = { ...prev };
        delete newState[`${productId}_interval`];
        return newState;
      });
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  const transformProductForCard = (product) => {
    return {
      id: product._id,
      productName: product.details.productName,
      images: product.images || ["https://placehold.co/512x512?text=No+Image"],
      category: product.category || "",
      subCategory: product.subCategory || "General",
      description: product.details.description || "",
      price: product.details.sellingPrice || 0,
      originalPrice: product.details.mrp || product.details.sellingPrice,
      rating: product.details.rating || 0,
      reviews: product.details.reviews || 0,
      brand: product.details.brand || "",
      unit: "unit",
      inStock: true,
      discount: product.details.mrp > product.details.sellingPrice ? 
        Math.round(((product.details.mrp - product.details.sellingPrice) / product.details.mrp) * 100) : 0,
      specs: [],
      minOrder: 1
    };
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedPriceRanges([]);
    setSelectedSubcategory(null);
    setSortBy('default');
  };

  // Count active filters
  const activeFilterCount =
    (selectedSubcategory ? 1 : 0) +
    selectedPriceRanges.length +
    (searchTerm ? 1 : 0);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <div className="h-7 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar Skeleton */}
            <div className="lg:w-64">
              <Skeleton.FilterSidebar />
            </div>

            {/* Products Section Skeleton */}
            <div className="flex-1">
              <Skeleton.HeaderBar />
              
              {/* Products Count Skeleton */}
              <div className="mb-4 px-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>

              {/* Products Grid Skeleton */}
              <Skeleton.ProductGrid count={8} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/brands')}
                className="mr-4 text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {decodedBrandName} Products
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  {filteredProducts.length} products available
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/brands')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
            >
              ← Back to All Brands
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-between w-full mb-4 bg-white p-4 rounded-lg shadow"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium">FILTERS</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <span className="text-gray-500">
            {showFilters ? '▲' : '▼'}
          </span>
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64`}>
            <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 lg:mb-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">FILTERS</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search in Brand Products */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Subcategory Filter */}
              {subcategories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3 text-base">SUBCATEGORIES</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="subcategory"
                          id="subcat-all"
                          checked={!selectedSubcategory}
                          onChange={() => setSelectedSubcategory(null)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="subcat-all" className="ml-2 text-sm text-gray-700 cursor-pointer">
                          All Products
                        </label>
                      </div>
                      <span className="text-gray-500 text-sm">({filteredProducts.length})</span>
                    </div>
                    {subcategories.map(sub => {
                      const isActive = selectedSubcategory === sub;
                      const productCount = filteredProducts.filter(p => p.subCategory === sub).length;
                      return (
                        <div key={sub} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="subcategory"
                              id={`subcat-${sub}`}
                              checked={isActive}
                              onChange={() => setSelectedSubcategory(isActive ? null : sub)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`subcat-${sub}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                              {sub}
                            </label>
                          </div>
                          <span className="text-gray-500 text-sm">({productCount})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 text-base">PRICE RANGE</h4>
                <div className="space-y-2">
                  {priceRanges.map(range => {
                    const productCount = filteredProducts.filter(p => 
                      (p.details.sellingPrice || 0) >= range.min && 
                      (p.details.sellingPrice || 0) <= range.max
                    ).length;
                    return (
                      <div key={range.label} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`price-${range.label}`}
                            checked={selectedPriceRanges.includes(range.label)}
                            onChange={() => {
                              setSelectedPriceRanges(prev =>
                                prev.includes(range.label)
                                  ? prev.filter(r => r !== range.label)
                                  : [...prev, range.label]
                              );
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`price-${range.label}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                            ₹{range.label}
                          </label>
                        </div>
                        <span className="text-gray-500 text-sm">({productCount})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Search and Sort Bar */}
            <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="w-full md:w-1/3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="🔍 Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 text-sm">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Count */}
            <div className="mb-4 px-2">
              <p className="text-gray-600 text-sm">
                Showing <span className="font-bold">{filteredProducts.length}</span> products
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="ml-3 text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </p>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={transformProductForCard(product)}
                    hoveredProduct={hoveredProduct}
                    imageIndex={imageIndex}
                    handleMouseEnter={handleProductMouseEnter}
                    handleMouseLeave={handleProductMouseLeave}
                    handleProductClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 md:p-12 text-center">
                <div className="text-4xl md:text-6xl mb-4">📦</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-4">No Products Found</h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                  {searchTerm
                    ? `No products match "${searchTerm}" for ${decodedBrandName}`
                    : `No products available for ${decodedBrandName}`
                  }
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pages;