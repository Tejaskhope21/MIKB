import React, { useState, useRef } from 'react';

const SkuFilterDropdown = ({ skuId, onSkuIdChange, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="bg-white border border-gray-300 hover:border-gray-400 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-barcode mr-2 text-gray-400"></i>
        SKU ID
        {skuId && (
          <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-72 transition-all duration-200 ease-out opacity-0 translate-y-2 animate-dropdown">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Search SKU ID
            </label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                value={skuId}
                onChange={(e) => onSkuIdChange(e.target.value)}
                placeholder="Enter SKU ID (e.g., SKU-CEMENT-001)"
                aria-label="Search SKU ID"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              onApply();
              setIsOpen(false);
            }}
            aria-label="Apply SKU filter"
          >
            Apply Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default SkuFilterDropdown;