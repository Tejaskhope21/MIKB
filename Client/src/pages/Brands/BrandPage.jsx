import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Search } from 'lucide-react';

// Brands List (your original list)
const brands = [
  { name: 'Ambuja Cement', src: '/ba2.jpg' },
  { name: 'ACC', src: '/ba1.jpg' },
  { name: 'Baja Electricals Ltd', src: 'bb1.jpg' },
  { name: 'Baja Tiles', src: '/bb2.jpg' },
  { name: 'CERA', src: '/bc1.jpg' },
  { name: 'Century', src: '/bc2.jpg' },
  { name: 'Dalmia', src: '/bd1.jpg' },
  { name: 'Dulux', src: '/bd2.jpg' },
  { name: 'ECOLITE', src: '/be1.jpg' },
  { name: 'ecostone', src: '/be2.jpg' },
  { name: 'Fenesta', src: '/bf1.png' },
  { name: 'Finolex', src: '/bf2.jpg' },
  { name: 'Gooreg', src: '/bg1.jpg' },
  { name: 'Goldmedal', src: '/bg2.jpg' },
  { name: 'Havells', src: '/bh1.jpg' },
  { name: 'Hardwyn', src: '/bh2.jpg' },
  { name: 'I-Len Ply', src: '/bi1.png' },
  { name: 'Icon', src: '/bi2.png' },
  { name: 'JR', src: '/bj1.jpg' },
  { name: 'Jaquar', src: '/bj2.jpg' },
  { name: 'KEL', src: '/bk1.jpg' },
  { name: 'Kankai', src: '/bk2.jpg' },
  { name: 'Lafarge', src: '/bl1.jpg' },
  { name: 'Legrand', src: '/bl2.jpg' },
  { name: 'Magicrete', src: '/bm1.jpg' },
  { name: 'Mayur', src: '/bm2.jpg' },
  { name: 'NagarJunaCement', src: '/bn1.jpg' },
  { name: 'Nippon Paint', src: '/bn2.jpg' },
  { name: 'Om Sai Tmi', src: '/bo1.jpg' },
  { name: 'ONE PLUS-1', src: '/bo2.png' },
  { name: 'Panasonic', src: '/bp1.jpg' },
  { name: 'Parasakti', src: '/bp2.jpg' },
  { name: 'QUBA', src: '/bq.png' },
  { name: 'RRKABAL', src: '/br1.jpg' },
  { name: 'RAK', src: '/br2.jpg' },
  { name: 'Sagar Cement', src: '/bs1.jpg' },
  { name: 'TATA TISON', src: '/br1.jpg' },
  { name: 'TATA CEMENT', src: '/bt2.jpg' },
  { name: 'Uniply', src: '/bu2.jpg' },
  { name: 'V-GUARD', src: '/bv1.jpg' },
  { name: 'VECTUS', src: '/bv2.png' },
  { name: 'Wipro', src: '/bw1.jpg' },
  { name: 'Weber', src: '/bw2.png' },
  { name: 'Yale', src: '/by1.png' },
  { name: 'Zuari Cement', src: '/bz1.jpg' },
];

// Static Products Data (Sample for each brand)
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
  {
    _id: '2',
    details: {
      productName: 'ACC Concrete+ Cement',
      description: 'Water resistant cement',
      brand: 'ACC',
      sellingPrice: 380,
      mrp: 420,
      rating: 4.3,
      reviews: 89
    },
    category: 'Cement',
    subCategory: 'OPC Cement',
    images: ['https://placehold.co/512x512/EF4444/FFFFFF?text=ACC+Cement']
  },
  {
    _id: '3',
    details: {
      productName: 'Havells LED Bulb 9W',
      description: 'Energy saving LED bulb',
      brand: 'Havells',
      sellingPrice: 150,
      mrp: 200,
      rating: 4.7,
      reviews: 250
    },
    category: 'Electrical',
    subCategory: 'Lighting',
    images: ['https://placehold.co/512x512/10B981/FFFFFF?text=Havells+Bulb']
  },
  {
    _id: '4',
    details: {
      productName: 'Jaquar Bath Fitting',
      description: 'Premium bathroom fitting',
      brand: 'Jaquar',
      sellingPrice: 1200,
      mrp: 1500,
      rating: 4.8,
      reviews: 180
    },
    category: 'Bathroom',
    subCategory: 'Fittings',
    images: ['https://placehold.co/512x512/8B5CF6/FFFFFF?text=Jaquar+Fitting']
  },
  {
    _id: '5',
    details: {
      productName: 'Dulux Weather Shield',
      description: 'Exterior wall paint',
      brand: 'Dulux',
      sellingPrice: 2800,
      mrp: 3500,
      rating: 4.4,
      reviews: 95
    },
    category: 'Paint',
    subCategory: 'Exterior Paint',
    images: ['https://placehold.co/512x512/F59E0B/FFFFFF?text=Dulux+Paint']
  },
  {
    _id: '6',
    details: {
      productName: 'Finolex Wires 90m',
      description: 'Fire resistant electrical wires',
      brand: 'Finolex',
      sellingPrice: 850,
      mrp: 1000,
      rating: 4.6,
      reviews: 140
    },
    category: 'Electrical',
    subCategory: 'Wires',
    images: ['https://placehold.co/512x512/EC4899/FFFFFF?text=Finolex+Wires']
  },
  {
    _id: '7',
    details: {
      productName: 'CERA Sanitaryware',
      description: 'Modern bathroom sanitaryware',
      brand: 'CERA',
      sellingPrice: 4500,
      mrp: 5500,
      rating: 4.5,
      reviews: 110
    },
    category: 'Bathroom',
    subCategory: 'Sanitaryware',
    images: ['https://placehold.co/512x512/06B6D4/FFFFFF?text=CERA+Sanitary']
  },
  {
    _id: '8',
    details: {
      productName: 'Legrand Switch',
      description: 'Modular electrical switch',
      brand: 'Legrand',
      sellingPrice: 180,
      mrp: 220,
      rating: 4.7,
      reviews: 210
    },
    category: 'Electrical',
    subCategory: 'Switches',
    images: ['https://placehold.co/512x512/84CC16/FFFFFF?text=Legrand+Switch']
  },
  {
    _id: '9',
    details: {
      productName: 'Nippon Paint Interior',
      description: 'Interior wall paint',
      brand: 'Nippon Paint',
      sellingPrice: 2400,
      mrp: 3000,
      rating: 4.4,
      reviews: 130
    },
    category: 'Paint',
    subCategory: 'Interior Paint',
    images: ['https://placehold.co/512x512/F97316/FFFFFF?text=Nippon+Paint']
  },
  {
    _id: '10',
    details: {
      productName: 'V-Guard Voltage Stabilizer',
      description: 'Voltage stabilizer for home',
      brand: 'V-GUARD',
      sellingPrice: 2200,
      mrp: 2800,
      rating: 4.6,
      reviews: 175
    },
    category: 'Electrical',
    subCategory: 'Stabilizers',
    images: ['https://placehold.co/512x512/6366F1/FFFFFF?text=V-Guard+Stabilizer']
  },
  {
    _id: '11',
    details: {
      productName: 'Wipro LED Panel Light',
      description: 'Ceiling LED panel light',
      brand: 'Wipro',
      sellingPrice: 650,
      mrp: 800,
      rating: 4.5,
      reviews: 160
    },
    category: 'Electrical',
    subCategory: 'Lighting',
    images: ['https://placehold.co/512x512/14B8A6/FFFFFF?text=Wipro+Light']
  },
  {
    _id: '12',
    details: {
      productName: 'Panasonic Exhaust Fan',
      description: 'Bathroom exhaust fan',
      brand: 'Panasonic',
      sellingPrice: 1200,
      mrp: 1500,
      rating: 4.3,
      reviews: 90
    },
    category: 'Electrical',
    subCategory: 'Fans',
    images: ['https://placehold.co/512x512/8B5CF6/FFFFFF?text=Panasonic+Fan']
  },
  {
    _id: '13',
    details: {
      productName: 'Baja Tiles Ceramic',
      description: 'Ceramic floor tiles',
      brand: 'Baja Tiles',
      sellingPrice: 45,
      mrp: 60,
      rating: 4.2,
      reviews: 85
    },
    category: 'Tiles',
    subCategory: 'Floor Tiles',
    images: ['https://placehold.co/512x512/EF4444/FFFFFF?text=Baja+Tiles']
  },
  {
    _id: '14',
    details: {
      productName: 'Century Plywood',
      description: 'Waterproof plywood',
      brand: 'Century',
      sellingPrice: 120,
      mrp: 150,
      rating: 4.4,
      reviews: 110
    },
    category: 'Plywood',
    subCategory: 'Commercial Ply',
    images: ['https://placehold.co/512x512/10B981/FFFFFF?text=Century+Plywood']
  },
  {
    _id: '15',
    details: {
      productName: 'Dalmia Cement 50kg',
      description: 'Premium quality cement',
      brand: 'Dalmia',
      sellingPrice: 360,
      mrp: 410,
      rating: 4.3,
      reviews: 95
    },
    category: 'Cement',
    subCategory: 'OPC Cement',
    images: ['https://placehold.co/512x512/F59E0B/FFFFFF?text=Dalmia+Cement']
  }
];

const BrandsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [openFilter, setOpenFilter] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortOption, setSortOption] = useState("Relevance");
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageIndex, setImageIndex] = useState({});
  const [intervals, setIntervals] = useState({});
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [products, setProducts] = useState(staticProducts);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Brand filtering logic
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allLetters = [...new Set(brands.map(brand => brand.name[0].toUpperCase()))].sort();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setSelectedLetter(null);
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setSearchTerm('');
  };

  const clearBrandFilters = () => {
    setSearchTerm('');
    setSelectedLetter(null);
  };

  const displayBrands = selectedLetter
    ? brands.filter(brand => brand.name[0].toUpperCase() === selectedLetter)
    : filteredBrands;

  const displayGrouped = displayBrands.reduce((acc, brand) => {
    const letter = brand.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(brand);
    return acc;
  }, {});

  const displayLetters = Object.keys(displayGrouped).sort();

  // ------------------ FILTER BY SELECTED BRAND ------------------
  useEffect(() => {
    if (selectedBrand) {
      // Filter static products by selected brand
      const brandProducts = staticProducts.filter(item => {
        const brand = item.details?.brand || "";
        return brand.toLowerCase() === selectedBrand.toLowerCase();
      });
      setProducts(brandProducts);
    } else {
      // Reset to all products when no brand selected
      setProducts(staticProducts);
    }
  }, [selectedBrand]);

  // ------------------ FLATTEN PRODUCTS ------------------
  const homeProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.map((item) => {
      const details = item.details || {};

      const sellingPrice =
        Number(details.sellingPrice) || Number(details.price) || 0;
      const mrp =
        Number(details.mrp) || Number(details.originalPrice) || sellingPrice;

      const discount =
        mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

      return {
        ...item,
        id: item._id || item.id,
        productName: details.productName || "Unnamed Product",
        description: details.description || "No description available",
        brand: details.brand || "Unknown Brand",
        category: item.category || "Uncategorized",
        subCategory: item.subCategory || "Unspecified",
        price: sellingPrice,
        originalPrice: mrp,
        rating: Number(details.rating) || 0,
        reviews: Number(details.reviews) || 0,
        discountPercentage: discount,
        images:
          item.images && item.images.length > 0
            ? item.images
            : ["https://placehold.co/512x512?text=No+Image"],
      };
    });
  }, [products]);

  // ------------------ PRICE RANGE CALCULATION ------------------
  const minPrice = useMemo(() => {
    if (homeProducts.length === 0) return 0;
    return Math.min(...homeProducts.map((p) => p.price || 0));
  }, [homeProducts]);

  const maxPrice = useMemo(() => {
    if (homeProducts.length === 0) return 10000;
    return Math.max(...homeProducts.map((p) => p.price || 0));
  }, [homeProducts]);

  // Update price range when products change
  useEffect(() => {
    if (homeProducts.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [homeProducts, minPrice, maxPrice]);

  // ------------------ FILTER OPTIONS ------------------
  const filterOptions = useMemo(() => {
    if (homeProducts.length === 0) {
      return {
        Brand: [],
        Category: [],
        Subcategory: [],
        Price: ["Price Range"],
        Rating: ["4★ & above", "3★ & above", "2★ & above"],
        Discount: [
          "10% and above",
          "20% and above",
          "30% and above",
          "40% and above",
          "50% and above",
          "60% and above",
          "70% and above",
        ],
      };
    }

    const categories = [
      ...new Set(homeProducts.map((p) => p.category).filter(Boolean)),
    ];
    const subcategories = [
      ...new Set(homeProducts.map((p) => p.subCategory).filter(Boolean)),
    ];
    const brandsList = [
      ...new Set(homeProducts.map((p) => p.brand).filter(Boolean)),
    ];

    return {
      Brand: brandsList,
      Category: categories,
      Subcategory: subcategories,
      Price: ["Price Range"],
      Rating: ["4★ & above", "3★ & above", "2★ & above"],
      Discount: [
        "10% and above",
        "20% and above",
        "30% and above",
        "40% and above",
        "50% and above",
        "60% and above",
        "70% and above",
      ],
    };
  }, [homeProducts]);

  // ------------------ FILTER HANDLERS ------------------
  const toggleFilter = (name) => {
    setOpenFilter(openFilter === name ? null : name);
  };

  const handleFilterChange = (filterName, option) => {
    setSelectedFilters((prev) => {
      const current = prev[filterName] || [];
      return {
        ...prev,
        [filterName]: current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option],
      };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setPriceRange([minPrice, maxPrice]);
  };

  // ------------------ FILTER PRODUCTS ------------------
  const filteredProducts = useMemo(() => {
    return homeProducts.filter((product) => {
      const price = product.price || 0;
      if (price < priceRange[0] || price > priceRange[1]) return false;

      return Object.entries(selectedFilters).every(([filterName, values]) => {
        if (values.length === 0) return true;

        if (filterName === "Category") return values.includes(product.category);
        if (filterName === "Subcategory")
          return values.includes(product.subCategory);
        if (filterName === "Brand") return values.includes(product.brand);

        if (filterName === "Rating") {
          const rating = product.rating || 0;
          return values.some((val) => {
            if (val === "4★ & above" && rating >= 4) return true;
            if (val === "3★ & above" && rating >= 3) return true;
            if (val === "2★ & above" && rating >= 2) return true;
            return false;
          });
        }

        if (filterName === "Discount") {
          const discount = product.discountPercentage || 0;
          return values.some((val) => {
            const threshold = parseInt(val.match(/\d+/)[0]);
            return discount >= threshold;
          });
        }

        return true;
      });
    });
  }, [homeProducts, selectedFilters, priceRange]);

  // ------------------ SORT PRODUCTS ------------------
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const aPrice = a.price || 0;
      const bPrice = b.price || 0;
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;

      switch (sortOption) {
        case "Price: Low to High":
          return aPrice - bPrice;
        case "Price: High to Low":
          return bPrice - aPrice;
        case "Rating":
          return bRating - aRating;
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortOption]);

  // ------------------ IMAGE HOVER HANDLERS ------------------
  const handleMouseEnter = (id) => {
    setHoveredProduct(id);
    setImageIndex((prev) => ({ ...prev, [id]: 0 }));

    const productImages = homeProducts.find((p) => p.id === id)?.images;
    if (!productImages || productImages.length <= 1) return;

    const interval = setInterval(() => {
      setImageIndex((prev) => ({
        ...prev,
        [id]: (prev[id] + 1) % productImages.length,
      }));
    }, 1200);

    setIntervals((prev) => ({ ...prev, [id]: interval }));
  };

  const handleMouseLeave = (id) => {
    if (intervals[id]) {
      clearInterval(intervals[id]);
    }
    setHoveredProduct(null);
    setIntervals((prev) => {
      const newIntervals = { ...prev };
      delete newIntervals[id];
      return newIntervals;
    });
  };

  // ------------------ PRODUCT CLICK ------------------
  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  // Brand Products View
  if (selectedBrand) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <button
            onClick={() => setSelectedBrand(null)}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Brands
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{selectedBrand} Products</h1>
          <p className="text-gray-600 mb-8">{sortedProducts.length} products available</p>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-xl text-gray-600 mb-4">No products found for {selectedBrand}</p>
                <p className="text-gray-500 mb-6">This is static demo data. In a real application, products would be fetched from a database.</p>
                <button
                  onClick={() => setSelectedBrand(null)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Browse Other Brands
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <FilterSidebar
                filterOptions={filterOptions}
                openFilter={openFilter}
                toggleFilter={toggleFilter}
                selectedFilters={selectedFilters}
                handleFilterChange={handleFilterChange}
                sortOption={sortOption}
                setSortOption={setSortOption}
                clearAllFilters={clearAllFilters}
                homeProducts={homeProducts}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
              <div className="w-full">
                <ProductGrid
                  sortedProducts={sortedProducts}
                  hoveredProduct={hoveredProduct}
                  imageIndex={imageIndex}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                  handleProductClick={handleProductClick}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Brands List View
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Brands
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our complete range of trusted home improvement and building material brands
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-6 py-4 text-lg rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
            {(searchTerm || selectedLetter) && (
              <button
                onClick={clearBrandFilters}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-center mt-4 text-gray-600">
              Showing {filteredBrands.length} of {brands.length} brands
            </p>
          )}
        </div>

        {/* Alphabet Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={clearBrandFilters}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${!selectedLetter && !searchTerm ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All Brands
          </button>
          {allLetters.map(letter => (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedLetter === letter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Brands Grid */}
        {displayLetters.length > 0 ? (
          <div className="space-y-16">
            {displayLetters.map(letter => (
              <div key={letter}>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                  <span className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl">
                    {letter}
                  </span>
                  Brands starting with "{letter}"
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 md:gap-8">
                  {displayGrouped[letter].map((brand) => (
                    <div
                      key={brand.name}
                      onClick={() => setSelectedBrand(brand.name)}
                      className="group block transform transition-all duration-300 hover:-translate-y-3 cursor-pointer"
                    >
                      <div className="bg-white shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 rounded-none">
                        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                          <img
                            src={brand.src}
                            alt={brand.name}
                            className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=' + brand.name; }}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-6 text-center">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3 line-clamp-2">
                            {brand.name}
                          </h3>
                          <span className="inline-flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                            View Products
                            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-medium text-gray-900 mb-3">No brands found</h3>
            <button onClick={clearBrandFilters} className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
              View All Brands
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// FilterSidebar Component (You need to implement this)
const FilterSidebar = ({
  filterOptions,
  openFilter,
  toggleFilter,
  selectedFilters,
  handleFilterChange,
  sortOption,
  setSortOption,
  clearAllFilters,
  homeProducts,
  priceRange,
  setPriceRange,
  minPrice,
  maxPrice
}) => {
  // Implement your filter sidebar UI here
  return (
    <div className="w-full md:w-64">
      {/* Filter sidebar implementation */}
    </div>
  );
};

// ProductGrid Component (You need to implement this)
const ProductGrid = ({
  sortedProducts,
  hoveredProduct,
  imageIndex,
  handleMouseEnter,
  handleMouseLeave,
  handleProductClick
}) => {
  // Implement your product grid UI here
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedProducts.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
          {/* Product card implementation */}
        </div>
      ))}
    </div>
  );
};

export default BrandsPage;