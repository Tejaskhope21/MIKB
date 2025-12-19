import React, { useState } from 'react';

const BrandCard = ({ brand }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 p-6 h-full flex flex-col items-center text-center group">
      {/* Brand Logo with loading state */}
      <div className="w-20 h-20 mb-4 flex items-center justify-center">
        {brand.logo && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg"></div>
            )}
            <img 
              src={brand.logo} 
              alt={`${brand.name} logo`}
              className={`w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 ${!imageLoaded ? 'hidden' : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-3xl font-bold text-gray-400">
              {brand.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {/* Rest of the component remains the same */}
      <h3 className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
        {brand.name}
      </h3>
      
      {brand.shortDescription && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {brand.shortDescription}
        </p>
      )}
      
      <div className="mt-auto">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
          {brand.productCount || '0'} products
        </span>
      </div>
    </div>
  );
};

export default BrandCard;