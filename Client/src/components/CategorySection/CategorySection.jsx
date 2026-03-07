import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, RefreshCw } from 'lucide-react';

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activePage, setActivePage] = useState(0);

  const carouselRef = useRef(null);
  const autoSlideRef = useRef(null);
  const navigate = useNavigate();

  const API = axios.create({
    baseURL: 'https://bricks-backend-qyea.onrender.com/api/v1',
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
    return `https://placehold.co/400x400/f3f4f6/6b7280?text=${text}`;
  };

  const generateSVGFallback = (name) => {
    const letter = (name?.charAt(0) || 'C').toUpperCase();
    const shortName = name?.length > 18 ? name.substring(0, 15) + '…' : name;

    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#f3f4f6"/>
        <circle cx="200" cy="180" r="90" fill="#d1d5db" opacity="0.4"/>
        <text x="200" y="210" font-family="system-ui,sans-serif" font-size="140" font-weight="bold" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">${letter}</text>
        <text x="200" y="290" font-family="system-ui,sans-serif" font-size="28" fill="#9ca3af" text-anchor="middle">${shortName}</text>
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
    return `https://bricks-backend-qyea.onrender.com${category.image.startsWith('/') ? '' : '/'}${category.image}`;
  };

  // ────────────────────────────────────────────────
  //   Render
  // ────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gray-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-12 w-80 bg-gray-200 rounded-xl animate-pulse mb-12 mx-auto" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-5/6 mx-auto mb-2" />
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
      <section className="py-20 bg-gray-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center max-w-lg mx-auto">
            <div className="text-amber-500 text-6xl mb-6">!</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Something went wrong</h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={fetchPublicCategories}
              className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 active:bg-orange-800 transition shadow-sm"
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
    <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-12 gap-5">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Explore Categories
          </h2>
        </div>

        {filteredCategories.length > 6 && (
          <div className="flex justify-center mb-8 gap-2.5">
            {[...Array(Math.ceil(filteredCategories.length / 6))].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className={`transition-all duration-300 rounded-full ${
                  activePage === i
                    ? 'bg-orange-600 w-9 h-2.5'
                    : 'bg-gray-300 hover:bg-gray-400 w-2.5 h-2.5'
                }`}
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
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white shadow-lg rounded-full p-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1/2 hover:scale-110 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-7 h-7 text-gray-700" />
            </button>
          )}

          <div
            ref={carouselRef}
            className="flex gap-5 md:gap-6 overflow-x-auto scroll-smooth pb-6 snap-x snap-mandatory scrollbar-hide"
          >
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                onClick={() => navigate(`/category/${category._id}`)}
                className="flex-shrink-0 w-44 sm:w-48 md:w-56 lg:w-60 snap-start cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 active:scale-[0.98]"
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200/60 h-full flex flex-col">
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
                    <img
                      src={getImageSrc(category)}
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => handleImageError(e, category.name)}
                    />
                  </div>
                  <div className="p-4 text-center flex-1 flex items-center justify-center">
                    <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors text-base lg:text-lg line-clamp-2">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white shadow-lg rounded-full p-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1/2 hover:scale-110 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-7 h-7 text-gray-700" />
            </button>
          )}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" strokeWidth={1.5} />
            <h3 className="text-2xl font-medium text-gray-700 mb-3">No categories found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any categories matching your search or the data might still be loading.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;