import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp, FaDollarSign } from 'react-icons/fa';
import ProductCard from '../../components/Products/ProductCard';
import { fetchCategoryById, fetchProducts } from '../../services/api';
import { BrandProductsSkeleton } from './BrandProductsSkeleton';

const BrandProducts = () => {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    brand: '',
    rating: 0,
    sortBy: 'newest',
    inStock: false,
    onSale: false
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    brand: false,
    rating: false,
    sort: true
  });

  useEffect(() => {
    fetchBrandData();
  }, [brandId]);

  // Sync local filters when parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const fetchBrandData = async () => {
    try {
      setLoading(true);
      const [brandData, productsData] = await Promise.all([
        fetchCategoryById(brandId),
        fetchProducts(brandId, filters)
      ]);
      setBrand(brandData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching brand data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Don't fetch here, will be triggered by useEffect on filters change
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    if (window.innerWidth < 768) {
      setIsMobileFilterOpen(false);
    }
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      brand: '',
      rating: 0,
      sortBy: 'newest',
      inStock: false,
      onSale: false
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLocalFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const ratingOptions = [4, 3, 2, 1].map(rating => ({
    value: rating,
    label: `${rating}+ Stars`,
    stars: '⭐'.repeat(rating)
  }));

  // Active filters count
  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'minPrice' && value > 0) return count + 1;
    if (key === 'maxPrice' && value < 1000) return count + 1;
    if (value && value !== '' && value !== 0 && value !== false && key !== 'sortBy') return count + 1;
    return count;
  }, 0);

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex justify-between items-center w-full py-2 text-left"
      >
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {expandedSections[sectionKey] ? (
          <FaChevronUp className="text-gray-500" />
        ) : (
          <FaChevronDown className="text-gray-500" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );

  // Custom Slider Component
  const Slider = ({ min, max, step, value, onChange }) => {
    const handleMinChange = (e) => {
      const newMin = Math.min(parseInt(e.target.value), value[1]);
      onChange([newMin, value[1]]);
    };

    const handleMaxChange = (e) => {
      const newMax = Math.max(parseInt(e.target.value), value[0]);
      onChange([value[0], newMax]);
    };

    const minPercent = ((value[0] - min) / (max - min)) * 100;
    const maxPercent = ((value[1] - min) / (max - min)) * 100;

    return (
      <div className="relative h-2">
        {/* Track */}
        <div className="absolute w-full h-full bg-gray-200 rounded-full"></div>
        
        {/* Selected Range */}
        <div 
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        ></div>
        
        {/* Min Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleMinChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto"
        />
        
        {/* Max Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={handleMaxChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto"
        />
      </div>
    );
  };

  if (loading) {
    return <BrandProductsSkeleton />;
  }

  if (!brand) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-600">Brand not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {brand.logo && (
            <img 
              src={brand.logo} 
              alt={`${brand.name} logo`}
              className="w-20 h-20 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{brand.name}</h1>
            <p className="text-gray-600 mt-2">{brand.description}</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-gray-100 rounded-full">
            {products.length} Products
          </span>
          <span className="px-3 py-1 bg-gray-100 rounded-full">
            Since {brand.established}
          </span>
          {brand.country && (
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              {brand.country}
            </span>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg w-full justify-center"
        >
          <FaFilter />
          <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
        </button>
      </div>

      {/* Mobile Filter Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              <div className="space-y-6">
                {/* Sort By */}
                <FilterSection title="Sort By" sectionKey="sort">
                  <div className="space-y-2">
                    {sortOptions.map(option => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="sortBy"
                          value={option.value}
                          checked={localFilters.sortBy === option.value}
                          onChange={(e) => handleLocalFilterChange('sortBy', e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="group-hover:text-blue-600">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Categories */}
                {brand.categories && brand.categories.length > 0 && (
                  <FilterSection title="Categories" sectionKey="category">
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value=""
                          checked={localFilters.category === ''}
                          onChange={(e) => handleLocalFilterChange('category', e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="group-hover:text-blue-600">All Categories</span>
                      </label>
                      {brand.categories.map((category, index) => (
                        <label key={index} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={localFilters.category === category}
                            onChange={(e) => handleLocalFilterChange('category', e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="group-hover:text-blue-600">
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>
                )}

                {/* Price Range */}
                <FilterSection title="Price Range" sectionKey="price">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">${localFilters.minPrice}</span>
                      <span className="text-sm text-gray-600">${localFilters.maxPrice}</span>
                    </div>
                    <Slider
                      min={0}
                      max={1000}
                      step={10}
                      value={[localFilters.minPrice, localFilters.maxPrice]}
                      onChange={([min, max]) => {
                        handleLocalFilterChange('minPrice', min);
                        handleLocalFilterChange('maxPrice', max);
                      }}
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Min</label>
                        <div className="relative">
                          <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="number"
                            min="0"
                            max={localFilters.maxPrice}
                            value={localFilters.minPrice}
                            onChange={(e) => handleLocalFilterChange('minPrice', parseInt(e.target.value) || 0)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Max</label>
                        <div className="relative">
                          <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="number"
                            min={localFilters.minPrice}
                            max="5000"
                            value={localFilters.maxPrice}
                            onChange={(e) => handleLocalFilterChange('maxPrice', parseInt(e.target.value) || 1000)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </FilterSection>

                {/* Rating */}
                <FilterSection title="Rating" sectionKey="rating">
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        value="0"
                        checked={localFilters.rating === 0}
                        onChange={(e) => handleLocalFilterChange('rating', parseInt(e.target.value))}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="group-hover:text-blue-600">All Ratings</span>
                    </label>
                    {ratingOptions.map(rating => (
                      <label key={rating.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="rating"
                          value={rating.value}
                          checked={localFilters.rating === rating.value}
                          onChange={(e) => handleLocalFilterChange('rating', parseInt(e.target.value))}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500">{rating.stars}</span>
                          <span className="group-hover:text-blue-600 text-gray-600">{rating.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Additional Filters */}
                <FilterSection title="More Filters" sectionKey="more">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.inStock}
                        onChange={(e) => handleLocalFilterChange('inStock', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>In Stock Only</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.onSale}
                        onChange={(e) => handleLocalFilterChange('onSale', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>On Sale</span>
                    </label>
                  </div>
                </FilterSection>
              </div>
              <div className="sticky bottom-0 bg-white pt-4 border-t mt-6">
                <div className="flex gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Applying...' : `Apply Filters`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block w-64 space-y-6">
          {/* Sort By */}
          <FilterSection title="Sort By" sectionKey="sort">
            <div className="space-y-2">
              {sortOptions.map(option => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="sortBy"
                    value={option.value}
                    checked={localFilters.sortBy === option.value}
                    onChange={(e) => handleLocalFilterChange('sortBy', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="group-hover:text-blue-600">{option.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Categories */}
          {brand.categories && brand.categories.length > 0 && (
            <FilterSection title="Categories" sectionKey="category">
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={localFilters.category === ''}
                    onChange={(e) => handleLocalFilterChange('category', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="group-hover:text-blue-600">All Categories</span>
                </label>
                {brand.categories.map((category, index) => (
                  <label key={index} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={localFilters.category === category}
                      onChange={(e) => handleLocalFilterChange('category', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="group-hover:text-blue-600">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Price Range */}
          <FilterSection title="Price Range" sectionKey="price">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">${localFilters.minPrice}</span>
                <span className="text-sm text-gray-600">${localFilters.maxPrice}</span>
              </div>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={[localFilters.minPrice, localFilters.maxPrice]}
                onChange={([min, max]) => {
                  handleLocalFilterChange('minPrice', min);
                  handleLocalFilterChange('maxPrice', max);
                }}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Min</label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="number"
                      min="0"
                      max={localFilters.maxPrice}
                      value={localFilters.minPrice}
                      onChange={(e) => handleLocalFilterChange('minPrice', parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Max</label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="number"
                      min={localFilters.minPrice}
                      max="5000"
                      value={localFilters.maxPrice}
                      onChange={(e) => handleLocalFilterChange('maxPrice', parseInt(e.target.value) || 1000)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Rating */}
          <FilterSection title="Rating" sectionKey="rating">
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  value="0"
                  checked={localFilters.rating === 0}
                  onChange={(e) => handleLocalFilterChange('rating', parseInt(e.target.value))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="group-hover:text-blue-600">All Ratings</span>
              </label>
              {ratingOptions.map(rating => (
                <label key={rating.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    value={rating.value}
                    checked={localFilters.rating === rating.value}
                    onChange={(e) => handleLocalFilterChange('rating', parseInt(e.target.value))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">{rating.stars}</span>
                    <span className="group-hover:text-blue-600 text-gray-600">{rating.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Additional Filters */}
          <FilterSection title="More Filters" sectionKey="more">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.inStock}
                  onChange={(e) => handleLocalFilterChange('inStock', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span>In Stock Only</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.onSale}
                  onChange={(e) => handleLocalFilterChange('onSale', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span>On Sale</span>
              </label>
            </div>
          </FilterSection>

          <div className="space-y-3">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Applying...' : 'Apply Filters'}
            </button>
            <button
              onClick={handleResetFilters}
              className="w-full py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Reset Filters
            </button>
          </div>

          {activeFiltersCount > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">{activeFiltersCount}</span> active filter(s)
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 self-center mr-2">Active filters:</span>
                {Object.entries(filters)
                  .filter(([key, value]) => {
                    if (key === 'sortBy') return false;
                    if (key === 'minPrice' && value === 0) return false;
                    if (key === 'maxPrice' && value === 1000) return false;
                    return value && value !== '' && value !== 0 && value !== false;
                  })
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      <span>
                        {key === 'category' && `Category: ${value}`}
                        {key === 'minPrice' && `Min: $${value}`}
                        {key === 'maxPrice' && `Max: $${value}`}
                        {key === 'rating' && `Rating: ${value}+`}
                        {key === 'inStock' && 'In Stock'}
                        {key === 'onSale' && 'On Sale'}
                      </span>
                      <button
                        onClick={() => {
                          const defaultValues = {
                            category: '',
                            minPrice: 0,
                            maxPrice: 1000,
                            rating: 0,
                            inStock: false,
                            onSale: false
                          };
                          setFilters(prev => ({ ...prev, [key]: defaultValues[key] }));
                          setLocalFilters(prev => ({ ...prev, [key]: defaultValues[key] }));
                        }}
                        className="hover:text-blue-900"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  ))}
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-red-600 hover:text-red-800 ml-2"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-500">
                No products found for this brand
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandProducts;