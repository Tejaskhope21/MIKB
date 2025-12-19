import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../../services/api';

const CategorySection = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const autoSlideRef = useRef(null);
    const carouselRef = useRef(null);

    const slidesToShow = 4;
    const slideDuration = 4000;

    // Check scroll position
    const checkScroll = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    // Scroll handlers
    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
            resetAutoSlide();
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
            resetAutoSlide();
        }
    };

    // Auto scroll function
    const startAutoScroll = () => {
        if (autoSlideRef.current) {
            clearInterval(autoSlideRef.current);
        }

        autoSlideRef.current = setInterval(() => {
            if (carouselRef.current && !isPaused) {
                const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;

                if (scrollLeft >= scrollWidth - clientWidth - 10) {
                    // Reached the end, scroll back to start
                    carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
                } else {
                    // Scroll to the right
                    carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
                }
            }
        }, slideDuration);
    };

    // Reset auto slide timer
    const resetAutoSlide = () => {
        startAutoScroll();
    };

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                const enriched = data.map(cat => ({
                    ...cat,
                    id: cat.numericId || cat.id,
                    color: cat.color || 'blue',
                    icon: cat.icon || '🛠️',
                    image: cat.image || 'https://placehold.co/400x400?text=Category',
                    description: cat.description || 'Explore products in this category',
                    subcategories: cat.subcategories || []
                }));
                setCategories(enriched);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    // Set up scroll event listener and auto scroll
    useEffect(() => {
        if (loading || error || categories.length === 0) return;

        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener("scroll", checkScroll);
            checkScroll();
        }

        startAutoScroll();

        return () => {
            if (carousel) {
                carousel.removeEventListener("scroll", checkScroll);
            }
            if (autoSlideRef.current) {
                clearInterval(autoSlideRef.current);
            }
        };
    }, [loading, error, categories.length]);

    // Handle mouse enter/leave for pausing
    const handleMouseEnter = () => {
        setIsPaused(true);
        if (autoSlideRef.current) {
            clearInterval(autoSlideRef.current);
        }
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
        startAutoScroll();
    };

    const getColorClasses = (color) => {
        const map = {
            blue: { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', text: 'text-blue-800', border: 'border-blue-200', hover: 'hover:from-blue-100 hover:to-blue-200' },
            gray: { bg: 'bg-gradient-to-br from-gray-50 to-gray-100', text: 'text-gray-800', border: 'border-gray-200', hover: 'hover:from-gray-100 hover:to-gray-200' },
            yellow: { bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', hover: 'hover:from-yellow-100 hover:to-yellow-200' },
            cyan: { bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200', hover: 'hover:from-cyan-100 hover:to-cyan-200' },
            orange: { bg: 'bg-gradient-to-br from-orange-50 to-orange-100', text: 'text-orange-800', border: 'border-orange-200', hover: 'hover:from-orange-100 hover:to-orange-200' },
            purple: { bg: 'bg-gradient-to-br from-purple-50 to-purple-100', text: 'text-purple-800', border: 'border-purple-200', hover: 'hover:from-purple-100 hover:to-purple-200' },
            red: { bg: 'bg-gradient-to-br from-red-50 to-red-100', text: 'text-red-800', border: 'border-red-200', hover: 'hover:from-red-100 hover:to-red-200' },
            pink: { bg: 'bg-gradient-to-br from-pink-50 to-pink-100', text: 'text-pink-800', border: 'border-pink-200', hover: 'hover:from-pink-100 hover:to-pink-200' }
        };
        return map[color] || map.blue;
    };

    if (loading) {
        return (
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
                        <p className="text-gray-600">Find all construction materials in one place</p>
                    </div>
                    <div className="py-20 text-center text-gray-600">Loading categories...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
                        <p className="text-gray-600">Find all construction materials in one place</p>
                    </div>
                    <div className="py-20 text-center">
                        <p className="text-red-600 text-lg mb-2">⚠️ {error}</p>
                        <p className="text-sm text-gray-500">Make sure your backend is running on port 5000</p>
                    </div>
                </div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
                        <p className="text-gray-600">Find all construction materials in one place</p>
                    </div>
                    <div className="py-20 text-center text-gray-500">No categories available</div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="w-full py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
                    <p className="text-gray-600">Find all construction materials in one place</p>
                </div>

                {/* Carousel Container */}
                <div className="relative group">
                    {/* Left Navigation Button */}
                    {canScrollLeft && (
                        <button
                            onClick={scrollLeft}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 -ml-4"
                            aria-label="Scroll left"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {/* Category Carousel */}
                    <div
                        ref={carouselRef}
                        className="overflow-x-auto scroll-smooth pb-4"
                        style={{
                            msOverflowStyle: "none",
                            scrollbarWidth: "none",
                        }}
                    >
                        <style>{`
                            .scroll-hide::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>

                        <div className="flex gap-6 pb-2 min-w-min scroll-hide">
                            {categories.map((category) => {
                                const color = getColorClasses(category.color);
                                return (
                                    <div key={category.id} className="flex-shrink-0 w-64">
                                        <Link
                                            to={`/products/category/${category.id}`}
                                            className={`block shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 rounded-xl overflow-hidden cursor-pointer ${color.bg} ${color.border} ${color.hover}`}
                                        >
                                            {/* Category Card */}
                                            <div className="relative overflow-hidden">
                                                {/* Image Container */}
                                                <div className="aspect-square flex items-center justify-center">
                                                    <img
                                                        src={category.image}
                                                        alt={category.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                                        loading="lazy"
                                                    />
                                                </div>

                                                {/* Category Info */}
                                                <div className="p-5 text-center">
                                                    <div className="flex items-center justify-center mb-3">
                                                        <span className="text-2xl mr-3">{category.icon}</span>
                                                        <h3 className={`text-lg font-bold ${color.text}`}>{category.name}</h3>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="text-sm text-gray-500">
                                                            {category.subcategories?.length || 0} subcategories
                                                        </span>
                                                        <span className={`${color.text} font-bold text-lg`}>→</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Navigation Button */}
                    {canScrollRight && (
                        <button
                            onClick={scrollRight}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 -mr-4"
                            aria-label="Scroll right"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* View All Button */}
                <div className="text-center mt-10">
                    <Link to="/products">
                        <button className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all hover:shadow-md hover:scale-105">
                            View All Products
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CategorySection;