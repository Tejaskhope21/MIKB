import React from 'react';

// Skeleton Card Component - NO rounded borders anywhere
export const SkeletonCard = ({ className = '' }) => {
    return (
        <div className={`relative overflow-hidden bg-white shadow-lg border border-gray-200 cursor-pointer h-[330px] animate-pulse ${className}`}>
            {/* Image Container */}
            <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="w-full h-full bg-gray-300"></div>
            </div>

            {/* Content Container - NO rounded */}
            <div className="p-5 text-center">
                <div className="h-5 bg-gray-300 w-4/5 mx-auto mb-3"></div>
                <div className="h-4 bg-gray-300 w-full mx-auto"></div>
            </div>

            {/* Badges - NO rounded-full or rounded */}
            <div className="absolute top-3 right-3 bg-gray-300 w-16 h-7"></div>
            <div className="absolute top-3 left-3 bg-gray-300 w-9 h-9"></div>
        </div>
    );
};

// Skeleton Text Component - NO rounded
export const SkeletonText = ({ lines = 1, width = 'full', height = 'h-4', className = '' }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
                <div
                    key={index}
                    className={`bg-gray-300 animate-pulse ${height} ${width === 'full' ? 'w-full' : width}`}
                ></div>
            ))}
        </div>
    );
};

// Skeleton Search Bar Component - NO rounded-lg
export const SkeletonSearch = ({ className = '' }) => {
    return (
        <div className={`relative w-full lg:w-auto lg:min-w-[330px] animate-pulse ${className}`}>
            <div className="w-full h-14 bg-gray-200"></div>
        </div>
    );
};

// Skeleton Button Component - NO rounded-lg
export const SkeletonButton = ({ width = 'w-32', height = 'h-10', className = '' }) => {
    return (
        <div className={`bg-gray-300 animate-pulse ${width} ${height} ${className}`}></div>
    );
};

// Skeleton Category Grid Component
export const SkeletonCategoryGrid = ({ count = 5, className = '' }) => {
    return (
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
};

// Skeleton Header Component
export const SkeletonHeader = ({ className = '' }) => {
    return (
        <div className={`flex flex-col lg:flex-row justify-between items-center mb-10 gap-4 ${className}`}>
            <div className="animate-pulse">
                <div className="h-9 bg-gray-200 w-56 mb-3"></div>
                <div className="h-5 bg-gray-200 w-36"></div>
            </div>
            <SkeletonSearch />
        </div>
    );
};

// Main Skeleton Component
const Skeleton = {
    Card: SkeletonCard,
    Text: SkeletonText,
    Search: SkeletonSearch,
    Button: SkeletonButton,
    CategoryGrid: SkeletonCategoryGrid,
    Header: SkeletonHeader,
};

export default Skeleton;