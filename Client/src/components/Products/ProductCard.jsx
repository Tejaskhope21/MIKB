import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProductCard({
  product,
  hoveredProduct, // assuming you pass this from parent if needed for shared hover
  handleMouseEnter,
  handleMouseLeave,
  handleProductClick,
}) {
  const navigate = useNavigate();
  const productId = product?.id || product?._id || "";
  const productName = product?.productName || "Unnamed Product";
  const productImages =
    product?.images && product.images.length > 0
      ? product.images
      : ["https://placehold.co/512x512?text=Image+Not+Available"];
  const productSubcategory = product?.subCategory || "General";
  const productCategory = product?.category || "";
  const productPrice = Number(product?.price) || 0;
  const originalPrice = Number(product?.originalPrice) || 0;
  const [isInWishlist, setIsInWishlist] = useState(false);

  const discountPercentage =
    originalPrice && productPrice
      ? Math.round(((originalPrice - productPrice) / originalPrice) * 100)
      : 0;

  // For hover image switch: if multiple images, switch to second on hover
  const currentImageIndex = hoveredProduct === productId && productImages.length > 1 ? 1 : 0;

  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/512x512?text=Image+Not+Available";
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    // ... your existing wishlist code
  };

  return (
    <div
      className="relative bg-white overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col w-full max-w-xs mx-auto cursor-pointer group"
      onMouseEnter={() => handleMouseEnter(productId)}
      onMouseLeave={() => handleMouseLeave(productId)}
      onClick={() => handleProductClick(product)}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[3/4] bg-gray-100">
        {productImages.length > 1 ? (
          productImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={productName}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out ${index === currentImageIndex ? "scale-100" : "scale-110 opacity-0"
                }`}
              onError={handleImageError}
            />
          ))
        ) : (
          <img
            src={productImages[0]}
            alt={productName}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}

        {/* Discount Badge - Rounded like screenshot */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      {/* Product Info - Always visible (like screenshot) */}
      <div className="p-4 flex flex-col gap-2 bg-white">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
          {productName}
        </h3>
        <p className="text-xs text-gray-500">{productSubcategory}</p>
        <p className="text-xs text-gray-500">{productCategory}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">₹{productPrice}</span>
            {originalPrice > productPrice && (
              <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
            )}
          </div>

          {/* Green Rating Badge like screenshot */}
          <div className="flex items-center bg-green-600 text-white text-xs px-2 py-1 rounded">
            <span className="text-xs">Free Delivery</span>
          </div>
        </div>

        {/* Mobile discount % */}
        {discountPercentage > 0 && (
          <div className="mt-1 text-xs text-green-600 font-medium">
            {discountPercentage}% off
          </div>
        )}
      </div>

      {/* Hover Overlay - Bottom slide up with Wishlist */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/95 backdrop-blur p-4 border-t">
        <button
          onClick={handleWishlistToggle}
          className={`w-full py-2 rounded-md text-sm font-medium border ${isInWishlist
            ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
            : "bg-white text-gray-700 border-gray-400 hover:bg-gray-100"
            }`}
        >
          {isInWishlist ? "♥ Remove from Wishlist" : "♥ Add to Wishlist"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;