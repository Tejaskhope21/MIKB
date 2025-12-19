import React from 'react';

export const BrandProductsSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Brand Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-6 bg-gray-300 rounded-full w-24"></div>
          <div className="h-6 bg-gray-300 rounded-full w-24"></div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="h-12 bg-gray-300 rounded mb-8"></div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-gray-300 rounded-lg h-64"></div>
        ))}
      </div>
    </div>
  );
};

export default BrandProductsSkeleton;