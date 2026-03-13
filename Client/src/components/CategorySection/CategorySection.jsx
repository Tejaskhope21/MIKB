import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, RefreshCw, Stethoscope, Activity, HeartPulse, Syringe, Pill, Bone, Microscope, Thermometer } from 'lucide-react';

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const [shouldCenter, setShouldCenter] = useState(false);

  const carouselRef = useRef(null);
  const categoriesContainerRef = useRef(null);
  const autoSlideRef = useRef(null);
  const navigate = useNavigate();

  const API = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
  });

  const fetchPublicCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/categories/public/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicCategories();
  }, []);

  // Check if categories should be centered
  useEffect(() => {
    const checkIfShouldCenter = () => {
      if (carouselRef.current && !loading && categories.length > 0) {
        const container = carouselRef.current;
        const containerWidth = container.offsetWidth;
        
        // Calculate total width of all category items
        let totalItemsWidth = 0;
        const items = container.children;
        
        // Get the width of each category card including gap
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemWidth = item.offsetWidth;
          // Add gap (20px between items)
          const gap = i < items.length - 1 ? 20 : 0;
          totalItemsWidth += itemWidth + gap;
        }
        
        console.log('Container width:', containerWidth, 'Total items width:', totalItemsWidth);
        
        // If total items width is less than container width, center them
        // Add a small buffer (20px) to avoid edge cases
        setShouldCenter(totalItemsWidth < containerWidth - 20);
      }
    };

    // Run after categories are loaded and rendered
    if (categories.length > 0) {
      // Multiple timeouts to ensure DOM is fully rendered
      setTimeout(checkIfShouldCenter, 100);
      setTimeout(checkIfShouldCenter, 300);
      setTimeout(checkIfShouldCenter, 500);
    }

    // Add resize listener
    window.addEventListener('resize', checkIfShouldCenter);
    
    return () => {
      window.removeEventListener('resize', checkIfShouldCenter);
    };
  }, [categories, loading]);

  // Force center for small number of categories
  useEffect(() => {
    // If there are 5 or fewer categories, always center them
    if (categories.length > 0 && categories.length <= 5) {
      setShouldCenter(true);
    }
  }, [categories]);

  // Category icons mapping for hospital equipment
  const getCategoryIcon = (categoryName) => {
    const icons = {
      'surgical': <Syringe className="w-8 h-8" style={{ color: '#0a2540' }} />,
      'diagnostic': <Microscope className="w-8 h-8" style={{ color: '#0a2540' }} />,
      'patient care': <HeartPulse className="w-8 h-8" style={{ color: '#0a2540' }} />,
      'monitoring': <Activity className="w-8 h-8" style={{ color: '#0a2540' }} />,
      'sterilization': <Thermometer className="w-8 h-8" style={{ color: '#0a2540' }} />,
      'orthopedic': <Bone className="w-8 h-8" style={{ color: '#0a2540' }} />,
      'pharmacy': <Pill className="w-8 h-8" style={{ color: '#0a2540' }} />,
      'examination': <Stethoscope className="w-8 h-8" style={{ color: '#0a2540' }} />,
    };
    
    const key = Object.keys(icons).find(k => 
      categoryName?.toLowerCase().includes(k)
    );
    return key ? icons[key] : <Stethoscope className="w-8 h-8" style={{ color: '#0a2540' }} />;
  };

  // ────────────────────────────────────────────────
  //   Scroll & Pagination Logic
  // ────────────────────────────────────────────────
  const checkScrollPosition = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;

    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const itemWidth = 240;
    const visibleItems = Math.floor(clientWidth / itemWidth);
    const scrollPerPage = visibleItems * itemWidth;
    const page = Math.round(scrollLeft / scrollPerPage);
    setActivePage(page);
  };

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
    resetAutoSlide();
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
    resetAutoSlide();
  };

  const goToPage = (pageIndex) => {
    if (!carouselRef.current) return;
    const itemWidth = 240;
    const scrollAmount = pageIndex * (itemWidth * 5);
    carouselRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    resetAutoSlide();
  };

  const startAutoSlide = () => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      if (!carouselRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      }
    }, 4500);
  };

  const resetAutoSlide = () => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    startAutoSlide();
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || loading || error) return;

    carousel.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition();
    startAutoSlide();

    return () => {
      carousel.removeEventListener('scroll', checkScrollPosition);
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [loading, error, categories.length]);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ────────────────────────────────────────────────
  //   Image Helpers
  // ────────────────────────────────────────────────
  const getPlaceholder = (name = 'Category') => {
    const text = encodeURIComponent(name.substring(0, 18));
    return `https://placehold.co/400x400/0a2540/FFFFFF?text=${text}`;
  };

  const generateSVGFallback = (name) => {
    const letter = (name?.charAt(0) || 'C').toUpperCase();
    const shortName = name?.length > 18 ? name.substring(0, 15) + '…' : name;

    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#f0f4f8"/>
        <circle cx="200" cy="180" r="90" fill="#0a2540" opacity="0.1"/>
        <text x="200" y="210" font-family="system-ui,sans-serif" font-size="140" font-weight="bold" fill="#0a2540" text-anchor="middle" dominant-baseline="middle">${letter}</text>
        <text x="200" y="290" font-family="system-ui,sans-serif" font-size="28" fill="#0a2540" text-anchor="middle">${shortName}</text>
      </svg>
    `)}`;
  };

  const handleImageError = (e, categoryName) => {
    const img = e.target;
    if (img.dataset.fallback === 'done') return;

    if (!img.dataset.fallback) {
      img.src = getPlaceholder(categoryName);
      img.dataset.fallback = 'placeholder';
    } else {
      img.src = generateSVGFallback(categoryName);
      img.dataset.fallback = 'done';
    }
  };

  const getImageSrc = (category) => {
    if (!category.image) return getPlaceholder(category.name);
    if (category.image.startsWith('http')) return category.image;
    return `http://localhost:5000${category.image.startsWith('/') ? '' : '/'}${category.image}`;
  };

  // ────────────────────────────────────────────────
  //   Render
  // ────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f8fafd' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: '#0a2540' }}>
              Medical Equipment Categories
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: '#0a2540', opacity: 0.7 }}>
              Discover our comprehensive range of hospital and medical equipment
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse" style={{ borderColor: '#0a2540', borderWidth: '1px', borderStyle: 'solid', opacity: 0.1 }}>
                <div className="aspect-square" style={{ backgroundColor: '#0a2540', opacity: 0.05 }} />
                <div className="p-4">
                  <div className="h-6 rounded w-5/6 mx-auto mb-2" style={{ backgroundColor: '#0a2540', opacity: 0.1 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20" style={{ backgroundColor: '#f8fafd' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center max-w-lg mx-auto" style={{ borderColor: '#0a2540', borderWidth: '1px', borderStyle: 'solid', opacity: 0.2 }}>
            <div className="text-6xl mb-6" style={{ color: '#0a2540' }}>🏥</div>
            <h3 className="text-2xl font-semibold mb-4" style={{ color: '#0a2540' }}>Unable to Load Categories</h3>
            <p className="mb-8" style={{ color: '#0a2540', opacity: 0.7 }}>{error}</p>
            <button
              onClick={fetchPublicCategories}
              className="inline-flex items-center gap-2 px-8 py-3 text-white font-medium rounded-xl hover:opacity-90 transition shadow-sm"
              style={{ backgroundColor: '#0a2540' }}
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: '#f8fafd' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <span 
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: '#0a2540', color: 'white', opacity: 0.9 }}
          >
            Hospital Equipment
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: '#0a2540' }}>
            Medical Equipment Categories
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#0a2540', opacity: 0.7 }}>
            Browse through our extensive collection of high-quality medical equipment and supplies
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#0a2540' }} />
            <input
              type="text"
              placeholder="Search medical categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent bg-white/80"
              style={{ 
                borderColor: '#0a2540', 
                color: '#0a2540',
                '--tw-ring-color': '#0a2540'
              }}
            />
          </div>
        </div>

        {filteredCategories.length > 6 && (
          <div className="flex justify-center mb-8 gap-2.5">
            {[...Array(Math.ceil(filteredCategories.length / 6))].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className={`transition-all duration-300 rounded-full ${
                  activePage === i
                    ? 'w-9 h-2.5'
                    : 'w-2.5 h-2.5 hover:opacity-100'
                }`}
                style={{ 
                  backgroundColor: '#0a2540',
                  opacity: activePage === i ? 1 : 0.3
                }}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div
          className="relative group"
          onMouseEnter={() => autoSlideRef.current && clearInterval(autoSlideRef.current)}
          onMouseLeave={startAutoSlide}
        >
          {canScrollLeft && !shouldCenter && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white shadow-lg rounded-full p-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1/2 hover:scale-110 active:scale-95 border"
              style={{ borderColor: '#0a2540', borderWidth: '1px' }}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-7 h-7" style={{ color: '#0a2540' }} />
            </button>
          )}

          <div
            ref={carouselRef}
            className={`flex gap-5 md:gap-6 overflow-x-auto scroll-smooth pb-6 snap-x snap-mandatory scrollbar-hide ${
              shouldCenter ? 'justify-center' : ''
            }`}
          >
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                onClick={() => navigate(`/category/${category._id}`)}
                className="flex-shrink-0 w-44 sm:w-48 md:w-56 lg:w-60 snap-start cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 active:scale-[0.98]"
              >
                <div 
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col group"
                  style={{ 
                    borderColor: '#0a2540', 
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    opacity: 0.9
                  }}
                >
                  <div className="aspect-square overflow-hidden relative" style={{ backgroundColor: '#f8fafd' }}>
                    {category.image ? (
                      <img
                        src={getImageSrc(category)}
                        alt={category.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => handleImageError(e, category.name)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        {getCategoryIcon(category.name)}
                        <span className="text-4xl font-bold mt-2" style={{ color: '#0a2540' }}>
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center flex-1 flex items-center justify-center">
                    <h3 
                      className="font-semibold group-hover:opacity-80 transition-colors text-base lg:text-lg line-clamp-2"
                      style={{ color: '#0a2540' }}
                    >
                      {category.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canScrollRight && !shouldCenter && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white shadow-lg rounded-full p-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1/2 hover:scale-110 active:scale-95 border"
              style={{ borderColor: '#0a2540', borderWidth: '1px' }}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-7 h-7" style={{ color: '#0a2540' }} />
            </button>
          )}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#0a2540', opacity: 0.1 }}
            >
              <Search className="w-12 h-12" style={{ color: '#0a2540' }} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-semibold mb-3" style={{ color: '#0a2540' }}>No Categories Found</h3>
            <p className="max-w-md mx-auto" style={{ color: '#0a2540', opacity: 0.7 }}>
              We couldn't find any medical categories matching your search. Please try different keywords.
            </p>
          </div>
        )}

        {/* View All Button */}
        {filteredCategories.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/categories')}
              className="inline-flex items-center gap-2 px-8 py-3 text-white font-medium rounded-xl hover:opacity-90 transition shadow-sm"
              style={{ backgroundColor: '#0a2540' }}
            >
              View All Categories
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;