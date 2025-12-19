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


const BrandsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
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

  // Handle brand click - navigate to brand products page
  const handleBrandClick = (brandName) => {
    // Convert brand name to slug for URL
    const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    navigate(`/products`, { state: { brandName } });
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
              className="w-full pl-12 pr-6 py-4 text-lg rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
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
            className={`px-4 py-2 rounded-lg font-medium transition-all ${!selectedLetter && !searchTerm ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All Brands
          </button>
          {allLetters.map(letter => (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedLetter === letter ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'}`}
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
                  <span className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-xl">
                    {letter}
                  </span>
                  Brands starting with "{letter}"
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 md:gap-8">
                  {displayGrouped[letter].map((brand) => (
                    <div
                      key={brand.name}
                      onClick={() => handleBrandClick(brand.name)}
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
                          <span className="inline-flex items-center text-teal-600 font-medium text-sm group-hover:text-teal-700 transition-colors">
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
            <button 
              onClick={clearBrandFilters} 
              className="px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View All Brands
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;