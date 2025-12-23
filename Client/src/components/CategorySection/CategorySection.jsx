import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../../services/api';
import { Search } from 'lucide-react';
import Skeleton from '../Skeleton/Skeleton';

const CategorySection = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const autoSlideRef = useRef(null);
    const carouselRef = useRef(null);

    const slideDuration = 5000;

    // Check scroll position
    const checkScroll = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
            
            // Update active dot based on scroll position
            const scrollPosition = scrollLeft;
            const cardWidth = carouselRef.current.children[0]?.clientWidth || 200;
            const gap = 16; // gap-4 = 1rem = 16px
            const visibleCards = Math.floor(clientWidth / (cardWidth + gap));
            const activeIndex = Math.floor(scrollPosition / ((cardWidth + gap) * visibleCards));
            setActiveCategory(activeIndex);
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
            if (carouselRef.current) {
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
        if (autoSlideRef.current) {
            clearInterval(autoSlideRef.current);
        }
        startAutoScroll();
    };

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                const enriched = data.map(cat => ({
                    ...cat,
                    id: cat.numericId || cat._id || cat.id,
                    color: cat.color || 'blue',
                    icon: cat.icon || '🔧',
                    image: cat.image || `https://source.unsplash.com/featured/400x400/?${encodeURIComponent(cat.name)},construction`,
                    description: cat.description || 'Explore quality products',
                    subcategories: cat.subcategories || []
                }));
                setCategories(enriched);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Failed to load categories:', err);
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
        if (autoSlideRef.current) {
            clearInterval(autoSlideRef.current);
        }
    };

    const handleMouseLeave = () => {
        startAutoScroll();
    };

    // Filter categories based on search
    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get color classes
    const getColorClasses = (color) => {
        const map = {
            blue: 'border-blue-200 hover:border-blue-300',
            gray: 'border-gray-200 hover:border-gray-300',
            yellow: 'border-yellow-200 hover:border-yellow-300',
            cyan: 'border-cyan-200 hover:border-cyan-300',
            orange: 'border-orange-200 hover:border-orange-300',
            purple: 'border-purple-200 hover:border-purple-300',
            red: 'border-red-200 hover:border-red-300',
            pink: 'border-pink-200 hover:border-pink-300'
        };
        return map[color] || map.blue;
    };

    // Loading State Component
    if (loading) {
        return (
              <section className="w-full py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton.Header />
        <Skeleton.CategoryGrid count={5} />
    </div>
</section>
        );
    }

    if (error) {
        return (
            <section className="w-full py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
                        <p className="text-gray-600">Discover products by category</p>
                    </div>
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <p className="text-red-600 text-lg mb-2">⚠️ {error}</p>
                        <p className="text-sm text-gray-500">Make sure your backend is running on port 5000</p>
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0) {
        return (
            <section className="w-full py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
                        <p className="text-gray-600">Discover products by category</p>
                    </div>
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-500">No categories available yet</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section 
            className="w-full py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with search */}
                <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Shop by Category
                        </h2>
                        <p className="text-gray-600">Discover products by category</p>
                    </div>

            
                </div>

                {/* Navigation Indicators (dots for pages) */}
                {filteredCategories.length > 5 && (
                    <div className="flex justify-center mb-6">
                        <div className="flex gap-2">
                            {[...Array(Math.ceil(filteredCategories.length / 5))].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (carouselRef.current) {
                                            const scrollAmount = carouselRef.current.clientWidth * i;
                                            carouselRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
                                            resetAutoSlide();
                                        }
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        activeCategory === i 
                                            ? "bg-blue-600 w-6" 
                                            : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}

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
                        className="overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
                        style={{
                            msOverflowStyle: "none",
                            scrollbarWidth: "none",
                        }}
                    >
                        <style jsx>{`
                            .hide-scrollbar::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>

                        <div className="flex gap-4 md:gap-6 pb-2 min-w-min mt-4">
                            {filteredCategories.map((category) => {
                                const borderColor = getColorClasses(category.color);
                                return (
                                    <Link
                                        key={category.id}
                                        to={`/category/${category.id}`}
                                        className="flex-shrink-0 w-40 sm:w-44 md:w-48 lg:w-52 xl:w-56"
                                    >
                                        {/* Category Card - REMOVED rounded-xl */}
                                        <div className={`relative overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border border-gray-100 cursor-pointer h-[330px] ${borderColor}`}>
                                            {/* Image Container */}
                                            <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://source.unsplash.com/featured/400x400/?construction,building`;
                                                    }}
                                                />
                                            </div>

                                            {/* Category Info */}
                                            <div className="p-5 text-center">
                                                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 line-clamp-1">
                                                    {category.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {category.description}
                                                </p>
                                            </div>

                                           

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        </div>
                                    </Link>
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

                {/* Empty State */}
                {filteredCategories.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                        <p className="text-gray-600">Try searching for something else</p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Clear Search
                        </button>
                    </div>
                )}

              
            </div>
        </section>
    );
};

export default CategorySection;