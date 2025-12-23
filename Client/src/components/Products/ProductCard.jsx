// ProductCard.jsx - MINIMAL VERSION
import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    if (!product) return null;

    const {
        _id,
        numericId,
        name,
        brand,
        price,
        originalPrice,
        discount,
        images,
        inventory,
        unitType
    } = product;

    const productId = numericId || _id;
    const displayPrice = price || 0;
    const displayOriginalPrice = originalPrice || 0;
    const hasDiscount = discount > 0 || displayOriginalPrice > displayPrice;
    const mainImage = images?.[0] || 'https://via.placeholder.com/400x400?text=Product+Image';
    const isOutOfStock = inventory?.stock === 0;

    return (
        <Link to={`/product/${productId}`} className="block">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow h-full">
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                        src={mainImage}
                        alt={name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                    
                    {/* Discount Badge */}
                    {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                            {discount > 0 ? `${discount}% OFF` : 'SALE'}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                    {/* Brand */}
                    <div className="text-xs text-gray-500 mb-1">
                        {brand || 'Brand'}
                    </div>

                    {/* Name */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-gray-900">
                            ₹{displayPrice}
                        </span>
                        {hasDiscount && displayOriginalPrice > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                                ₹{displayOriginalPrice}
                            </span>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="text-sm">
                        {isOutOfStock ? (
                            <span className="text-red-600">Out of Stock</span>
                        ) : (
                            <span className="text-green-600">
                                In Stock: {inventory?.stock || 0}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;