import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/buildersmartData';

const CategorySection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const autoSlideRef = useRef(null);
    const carouselRef = useRef(null);

    // Slider configuration
    const slidesToShow = 4;
    const slideDuration = 4000;
    const totalSlides = Math.ceil(categories.length / slidesToShow);

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
        carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" });
        resetAutoSlide();
    };

    const scrollRight = () => {
        carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" });
        resetAutoSlide();
    };

    // Auto slide functionality
    useEffect(() => {
        if (isPaused || totalSlides <= 1) return;

        autoSlideRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
            );
        }, slideDuration);

        return () => {
            if (autoSlideRef.current) {
                clearInterval(autoSlideRef.current);
            }
        };
    }, [currentIndex, totalSlides, isPaused]);

    // Handle scroll events and initial check
    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener("scroll", checkScroll);
            checkScroll();
            return () => carousel.removeEventListener("scroll", checkScroll);
        }
    }, []);

    // Auto-scroll horizontally
    useEffect(() => {
        const interval = setInterval(() => {
            if (carouselRef.current && !isPaused) {
                const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
                if (scrollLeft >= scrollWidth - clientWidth - 10) {
                    carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
                } else {
                    carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isPaused]);

    // Navigation functions
    const goToSlide = (index) => {
        setCurrentIndex(index);
        resetAutoSlide();
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.clientWidth * index;
            carouselRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
        }
    };

    const resetAutoSlide = () => {
        if (autoSlideRef.current) {
            clearInterval(autoSlideRef.current);
        }
        autoSlideRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
            );
        }, slideDuration);
    };

    return (
        <div 
            className="w-full py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
                    <p className="text-gray-600">Find all construction materials in one place</p>
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center mb-6">
                    <div className="flex gap-2">
                        {[...Array(totalSlides)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    currentIndex === i ? "bg-blue-600 w-6" : "bg-gray-300 hover:bg-gray-400"
                                }`}
                            />
                        ))}
                    </div>
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
                        <style jsx>{`
                            div::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>

                        <div className="flex gap-6 pb-2 min-w-min">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex-shrink-0 w-64"
                                >
                                    <Link
                                        to={`/products/category/${category.id}`}
                                        className="block bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 cursor-pointer"
                                    >
                                        {/* Simple Category Card */}
                                        <div className="relative overflow-hidden">
                                            {/* Image Container */}
                                            <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
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
                                                    <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-sm text-gray-500">
                                                        {category.subcategories?.length || 0} subcategories
                                                    </span>
                                                    <span className="text-blue-600 font-bold text-lg">→</span>
                                                </div>
                                            </div>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        </div>
                                    </Link>
                                </div>
                            ))}
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
                {/* <div className="text-center mt-10">
                    <Link to="/allcategory">
                        <button className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all hover:shadow-md hover:scale-105">
                            View All Categories
                        </button>
                    </Link>
                </div> */}
            </div>
        </div>
    );
};

export default CategorySection;