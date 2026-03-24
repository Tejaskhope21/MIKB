import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RefreshCw, Stethoscope, Activity, HeartPulse, Syringe, Pill, Bone, Microscope, Thermometer } from 'lucide-react';

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const [shouldCenter, setShouldCenter] = useState(false);

  const carouselRef = useRef(null);
  const autoSlideRef = useRef(null);
  const navigate = useNavigate();

  const API = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
  });

  // Fetch categories
  const fetchPublicCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/categories/public/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Unable to load categories. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicCategories();
  }, []);

  // Check if categories should be centered
  useEffect(() => {
    const checkCentering = () => {
      if (carouselRef.current && !loading && categories.length > 0) {
        const container = carouselRef.current;
        const containerWidth = container.offsetWidth;
        
        let totalItemsWidth = 0;
        const items = container.children;
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemWidth = item.offsetWidth;
          const gap = i < items.length - 1 ? 24 : 0;
          totalItemsWidth += itemWidth + gap;
        }
        
        setShouldCenter(totalItemsWidth < containerWidth - 20);
      }
    };

    if (categories.length > 0) {
      [100, 300, 500].forEach(delay => setTimeout(checkCentering, delay));
    }

    window.addEventListener('resize', checkCentering);
    return () => window.removeEventListener('resize', checkCentering);
  }, [categories, loading]);

  // Force center for small number of categories
  useEffect(() => {
    if (categories.length > 0 && categories.length <= 5) {
      setShouldCenter(true);
    }
  }, [categories]);

  // Category icons mapping
  const getCategoryIcon = (categoryName) => {
    const icons = {
      'surgical': <Syringe className="w-8 h-8" strokeWidth={1.5} />,
      'diagnostic': <Microscope className="w-8 h-8" strokeWidth={1.5} />,
      'patient care': <HeartPulse className="w-8 h-8" strokeWidth={1.5} />,
      'monitoring': <Activity className="w-8 h-8" strokeWidth={1.5} />,
      'sterilization': <Thermometer className="w-8 h-8" strokeWidth={1.5} />,
      'orthopedic': <Bone className="w-8 h-8" strokeWidth={1.5} />,
      'pharmacy': <Pill className="w-8 h-8" strokeWidth={1.5} />,
      'examination': <Stethoscope className="w-8 h-8" strokeWidth={1.5} />,
    };
    
    const matchedKey = Object.keys(icons).find(key => 
      categoryName?.toLowerCase().includes(key)
    );
    
    return matchedKey ? icons[matchedKey] : <Stethoscope className="w-8 h-8" strokeWidth={1.5} />;
  };

  // Scroll and pagination handlers
  const checkScrollPosition = () => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const itemWidth = 128;
    const visibleItems = Math.floor(clientWidth / itemWidth);
    const scrollPerPage = visibleItems * itemWidth;
    const page = Math.round(scrollLeft / scrollPerPage);
    setActivePage(page);
  };

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -280, behavior: 'smooth' });
    resetAutoSlide();
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 280, behavior: 'smooth' });
    resetAutoSlide();
  };

  const goToPage = (pageIndex) => {
    if (!carouselRef.current) return;
    
    const itemWidth = 128;
    const scrollAmount = pageIndex * (itemWidth * 5);
    carouselRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    resetAutoSlide();
  };

  // Auto-slide functionality
  const startAutoSlide = () => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    
    autoSlideRef.current = setInterval(() => {
      if (!carouselRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 20;
      
      if (isAtEnd) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollBy({ left: 280, behavior: 'smooth' });
      }
    }, 5000);
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

  // Image helpers
  const getImageSrc = (category) => {
    if (!category.image) return null;
    if (category.image.startsWith('http')) return category.image;
    return `http://localhost:5000${category.image.startsWith('/') ? '' : '/'}${category.image}`;
  };

  const getPlaceholderImage = (categoryName) => {
    const letter = (categoryName?.charAt(0) || 'C').toUpperCase();
    const shortName = categoryName?.length > 18 ? categoryName.substring(0, 15) + '…' : categoryName;

    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#f8fafc"/>
        <circle cx="200" cy="200" r="180" fill="#0a2540" opacity="0.05"/>
        <text x="200" y="220" font-family="system-ui,sans-serif" font-size="140" font-weight="bold" fill="#0a2540" text-anchor="middle" dominant-baseline="middle">${letter}</text>
        <text x="200" y="300" font-family="system-ui,sans-serif" font-size="28" fill="#0a2540" text-anchor="middle">${shortName}</text>
      </svg>
    `)}`;
  };

  const handleImageError = (e, categoryName) => {
    const img = e.target;
    if (img.dataset.fallback === 'done') return;

    if (!img.dataset.fallback) {
      img.src = `https://placehold.co/400x400/0a2540/FFFFFF?text=${encodeURIComponent(categoryName?.substring(0, 18) || 'Category')}`;
      img.dataset.fallback = 'placeholder';
    } else {
      img.src = getPlaceholderImage(categoryName);
      img.dataset.fallback = 'done';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-12" style={{ backgroundColor: '#f8fafd' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ backgroundColor: '#0a2540', color: 'white' }}>
              Shop by Category
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" style={{ color: '#0a2540' }}>
              Explore  Equipment Categories
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: '#0a2540', opacity: 0.7 }}>
              Explore our comprehensive range of professional equipment
            </p>
          </div>
          <div className="flex justify-center gap-6 flex-wrap">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-28 h-28 rounded-full" style={{ backgroundColor: '#0a2540', opacity: 0.1 }} />
                <div className="h-3 w-20 rounded mx-auto mt-3" style={{ backgroundColor: '#0a2540', opacity: 0.1 }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12" style={{ backgroundColor: '#f8fafd' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center max-w-lg mx-auto border" style={{ borderColor: '#0a254020' }}>
            <div className="text-5xl mb-4" style={{ color: '#0a2540' }}>🏥</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#0a2540' }}>Unable to Load Categories</h3>
            <p className="mb-6 text-sm" style={{ color: '#0a2540', opacity: 0.7 }}>{error}</p>
            <button
              onClick={fetchPublicCategories}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-white font-medium rounded-xl hover:opacity-90 transition shadow-sm"
              style={{ backgroundColor: '#0a2540' }}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 overflow-hidden" style={{ backgroundColor: '#f8fafd' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div 
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ backgroundColor: '#0a2540', color: 'white' }}
          >
            Shop by Category
          </div>
          <h2 
            className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
            style={{ color: '#0a2540' }}
          >
            Explore Equipment Categories
          </h2>
          <p 
            className="text-base max-w-2xl mx-auto"
            style={{ color: '#0a2540', opacity: 0.7 }}
          >
            Explore our comprehensive range of professional equipment
          </p>
        </div>

        {/* Pagination Dots */}
        {categories.length > 6 && (
          <div className="flex justify-center mb-6 gap-2">
            {[...Array(Math.ceil(categories.length / 6))].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: activePage === i ? '24px' : '6px',
                  height: activePage === i ? '6px' : '6px',
                  backgroundColor: '#0a2540',
                  opacity: activePage === i ? 1 : 0.3
                }}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Carousel Container */}
        <div
          className="relative group"
          onMouseEnter={() => autoSlideRef.current && clearInterval(autoSlideRef.current)}
          onMouseLeave={startAutoSlide}
        >
          {/* Left Navigation Button */}
          {canScrollLeft && !shouldCenter && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1/2 hover:scale-110 active:scale-95 border hover:shadow-xl"
              style={{ borderColor: '#0a254020' }}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#0a2540' }} />
            </button>
          )}

          {/* Categories Carousel */}
          <div
            ref={carouselRef}
            className={`flex gap-5 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory ${
              shouldCenter ? 'justify-center' : ''
            }`}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {categories.map((category) => (
              <div
                key={category._id}
                onClick={() => navigate(`/category/${category._id}`)}
                className="flex-shrink-0 w-28 snap-start cursor-pointer group/category"
              >
                <div className="flex flex-col items-center">
                  {/* Circular Category Card */}
                  <div className="relative">
                    <div 
                      className="w-28 h-28 rounded-full bg-white shadow-md transition-all duration-300 overflow-hidden border group-hover/category:shadow-lg group-hover/category:scale-105"
                      style={{ borderColor: '#0a254010' }}
                    >
                      {category.image ? (
                        <img
                          src={getImageSrc(category)}
                          alt={category.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, category.name)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br" style={{ background: 'linear-gradient(135deg, #f8fafd 0%, #ffffff 100%)' }}>
                          <div style={{ color: '#0a2540' }}>
                            {getCategoryIcon(category.name)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Category Name */}
                  <h3 
                    className="mt-2 text-center font-medium text-xs px-1 transition-colors duration-200 group-hover/category:font-semibold"
                    style={{ color: '#0a2540' }}
                  >
                    {category.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Right Navigation Button */}
          {canScrollRight && !shouldCenter && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1/2 hover:scale-110 active:scale-95 border hover:shadow-xl"
              style={{ borderColor: '#0a254020' }}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" style={{ color: '#0a2540' }} />
            </button>
          )}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-8">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#0a2540', opacity: 0.1 }}
            >
              <Stethoscope className="w-10 h-10" style={{ color: '#0a2540' }} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#0a2540' }}>
              No Categories Available
            </h3>
            <p className="text-sm max-w-md mx-auto" style={{ color: '#0a2540', opacity: 0.7 }}>
              Categories are being updated. Please check back soon.
            </p>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Hide Styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default CategorySection;