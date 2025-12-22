import React from 'react';
import { Link } from 'react-router-dom';

const ProductsComponent = ({
    products = [],
    title = "Trending Products",
    categoryColor = "blue"
}) => {
    const getColorClasses = (color) => {
        const map = {
            blue: 'text-blue-600',
            gray: 'text-gray-600',
            yellow: 'text-yellow-600',
            cyan: 'text-cyan-600',
            orange: 'text-orange-600',
            purple: 'text-purple-600',
            red: 'text-red-600',
            pink: 'text-pink-600'
        };
        return map[color] || map.blue;
    };

    return (
        <div className="py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <Link to="/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                    See all
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5  gap-2 sm:gap-3">
                    {products.map((product) => {
                        const discountPercent = product.discount || 0;
                        const transformedProduct = {
                            id: product.numericId || product.id,
                            productName: product.name,
                            images: product.image ? [product.image] : ["https://placehold.co/512x512?text=No+Image"],
                            price: product.price || 0,
                            originalPrice: product.originalPrice || product.price,
                            rating: product.rating || 0,
                            brand: product.brand || "",
                            inStock: product.inStock !== false
                        };

                        return (
                            <div
                                key={transformedProduct.id}
                                className="relative bg-white group overflow-hidden transition hover:shadow-lg flex flex-col items-center justify-center w-full cursor-pointer"
                                onClick={() => window.location.href = `/product/${transformedProduct.id}`}
                            >
                                {/* Product Image */}
                                <div className="relative w-full aspect-[3/4] overflow-hidden">
                                    <img
                                        src={transformedProduct.images[0]}
                                        alt={transformedProduct.productName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.src = "https://placehold.co/512x512?text=Image+Not+Available"}
                                    />
                                </div>

                                {/* Discount Badge */}
                                {discountPercent > 0 && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {discountPercent}% OFF
                                    </div>
                                )}

                                {/* Product Info */}
                                <div className="p-2 w-full text-start">
                                    <h3 className="text-xs font-medium text-gray-800 line-clamp-1 mb-1">
                                        {transformedProduct.productName}
                                    </h3>

                                    <div className="flex flex-col gap-0.5 mb-2">
                                        <p className="text-[10px] text-gray-500 line-clamp-1">
                                            {product.category || "Product"}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1 justify-between">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold text-gray-900">
                                                ₹{transformedProduct.price}
                                            </span>
                                            {transformedProduct.originalPrice > transformedProduct.price && (
                                                <span className="text-[10px] line-through text-gray-500">
                                                    ₹{transformedProduct.originalPrice}
                                                </span>
                                            )}
                                        </div>
                                        {transformedProduct.rating > 0 && (
                                            <span className="text-[10px] bg-green-500 text-white px-1 py-0.5 rounded flex items-center gap-0.5">
                                                {transformedProduct.rating} ★
                                            </span>
                                        )}
                                    </div>

                                    {/* Brand */}
                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500">
                                            {transformedProduct.brand?.substring(0, 12) || 'Generic'}
                                        </span>

                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">No products available</p>
                </div>
            )}
        </div>
    );
};

export default ProductsComponent;