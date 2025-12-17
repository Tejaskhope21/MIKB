import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/buildersmartData';

const CategorySection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const autoSlideRef = useRef(null);

    // Slider configuration
    const slidesToShow = 4;
    const slideDuration = 4000; // 4 seconds
    const totalSlides = Math.ceil(categories.length / slidesToShow);

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

    // Navigation functions
    const goToSlide = (index) => {
        setCurrentIndex(index);
        resetAutoSlide();
    };

    const goToPrevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
        );
        resetAutoSlide();
    };

    const goToNextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
        );
        resetAutoSlide();
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

    const getColorClasses = (color) => {
        const colorMap = {
            blue: { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', text: 'text-blue-800', border: 'border-blue-200', hover: 'hover:from-blue-100 hover:to-blue-200' },
            gray: { bg: 'bg-gradient-to-br from-gray-50 to-gray-100', text: 'text-gray-800', border: 'border-gray-200', hover: 'hover:from-gray-100 hover:to-gray-200' },
            yellow: { bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', hover: 'hover:from-yellow-100 hover:to-yellow-200' },
            cyan: { bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200', hover: 'hover:from-cyan-100 hover:to-cyan-200' },
            orange: { bg: 'bg-gradient-to-br from-orange-50 to-orange-100', text: 'text-orange-800', border: 'border-orange-200', hover: 'hover:from-orange-100 hover:to-orange-200' },
            purple: { bg: 'bg-gradient-to-br from-purple-50 to-purple-100', text: 'text-purple-800', border: 'border-purple-200', hover: 'hover:from-purple-100 hover:to-purple-200' },
            red: { bg: 'bg-gradient-to-br from-red-50 to-red-100', text: 'text-red-800', border: 'border-red-200', hover: 'hover:from-red-100 hover:to-red-200' },
            pink: { bg: 'bg-gradient-to-br from-pink-50 to-pink-100', text: 'text-pink-800', border: 'border-pink-200', hover: 'hover:from-pink-100 hover:to-pink-200' }
        };
        return colorMap[color] || colorMap.blue;
    };

    // Get categories for current slide
    const startIndex = currentIndex * slidesToShow;
    const visibleCategories = categories.slice(startIndex, startIndex + slidesToShow);

    return (
        <div 
            className="py-12 bg-gray-50"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Browse by Category</h2>
                    <p className="text-gray-600">Find all construction materials in one place</p>
                </div>

                {/* Slider Container */}
                <div className="relative">
                    {/* Navigation Arrows */}
                    {totalSlides > 1 && (
                        <>
                            <button
                                onClick={goToPrevSlide}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300"
                                aria-label="Previous slide"
                            >
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <button
                                onClick={goToNextSlide}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300"
                                aria-label="Next slide"
                            >
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Categories Grid */}
                    <div className="overflow-hidden">
                        <div 
                            className="flex transition-all duration-500 ease-out"
                            style={{
                                transform: `translateX(-${currentIndex * 100}%)`,
                            }}
                        >
                            {Array.from({ length: totalSlides }).map((_, slideIndex) => {
                                const slideCategories = categories.slice(
                                    slideIndex * slidesToShow,
                                    slideIndex * slidesToShow + slidesToShow
                                );
                                
                                return (
                                    <div
                                        key={slideIndex}
                                        className="w-full flex-shrink-0"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {slideCategories.map((category) => {
                                                const colorClass = getColorClasses(category.color);

                                                return (
                                                    <Link
                                                        key={category.id}
                                                        to={`/products/category/${category.id}`}
                                                        className={`block ${colorClass.bg} ${colorClass.border} border-2 rounded-xl overflow-hidden ${colorClass.hover} transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg`}
                                                    >
                                                        <div className="h-40 overflow-hidden">
                                                            <img
                                                                src={category.image}
                                                                alt={category.name}
                                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                                            />
                                                        </div>
                                                        <div className="p-4">
                                                            <div className="flex items-center mb-2">
                                                                <span className="text-2xl mr-2">{category.icon}</span>
                                                                <h3 className={`text-lg font-bold ${colorClass.text}`}>{category.name}</h3>
                                                            </div>
                                                            <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-500">
                                                                    {category.subcategories.length} subcategories
                                                                </span>
                                                                <span className={`${colorClass.text} font-bold`}>→</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dots Navigation */}
                    {totalSlides > 1 && (
                        <div className="flex justify-center items-center mt-8 space-x-2">
                            {Array.from({ length: totalSlides }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`transition-all duration-300 rounded-full ${
                                        currentIndex === index
                                            ? 'bg-blue-600 w-8 h-2'
                                            : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                >
                                    <span className="sr-only">Slide {index + 1}</span>
                                </button>
                            ))}
                        </div>
                    )}

                   
                </div>

                <div className="text-center mt-8">
                    
                </div>
            </div>
        </div>
    );
};

export default CategorySection;