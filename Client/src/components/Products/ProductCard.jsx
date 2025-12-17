import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProductCard({
  product,
  hoveredProduct,
  imageIndex,
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
      : ["https://placehold.co/512x512?text=No+Image"];
  const productSubcategory = product?.subCategory || "General";
  const productCategory = product?.category || "";
  const productDescription = product?.description || "";
  const productPrice = Number(product?.price) || 0;
  const originalPrice = Number(product?.originalPrice) || 0;
  const ratingValue = product?.rating || 0;
  const reviewCount = product?.reviews || 0;
  const [isInWishlist, setIsInWishlist] = useState(false);

  const discountPercentage =
    originalPrice && productPrice
      ? Math.round(((originalPrice - productPrice) / originalPrice) * 100)
      : 0;

  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/512x512?text=Image+Not+Available";
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/user-login");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/wishlist/toggle",
        { productId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsInWishlist(response.data.isInWishlist);
      alert(
        response.data.isInWishlist
          ? "Added to wishlist!"
          : "Removed from wishlist!"
      );
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  return (
    <div
      className="relative bg-white group overflow-hidden transition hover:shadow-lg flex flex-col items-center justify-center w-full cursor-pointer"
      onMouseEnter={() => handleMouseEnter(productId)}
      onMouseLeave={() => handleMouseLeave(productId)}
      onClick={() => handleProductClick(product)}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        {productImages.length > 1 ? (
          <div className="relative w-full h-full">
            {productImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={productName}
                className={`w-full h-full object-cover absolute top-0 left-0 transition-all duration-500 ${index === (imageIndex[productId] || 0)
                  ? "translate-x-0 opacity-100 z-10"
                  : "translate-x-full opacity-0 z-0"
                  }`}
                onError={handleImageError}
              />
            ))}
          </div>
        ) : (
          <img
            src={productImages[0]}
            alt={productName}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
      </div>

      {/* Hover Overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex opacity-0 group-hover:opacity-100 transition">
        <div className="w-full bg-white/90 p-2 rounded-md flex flex-col gap-1 pointer-events-auto">
          <button
            onClick={handleWishlistToggle}
            className={`border border-gray-400 px-2 py-1 rounded-md text-xs font-medium w-fit ${isInWishlist
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            {isInWishlist ? "♥ Remove from Wishlist" : "♥ Add to Wishlist"}
          </button>
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-medium text-gray-800 line-clamp-1">
              {productName}
            </h3>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-900">
                ₹{productPrice}
              </span>
              {originalPrice > productPrice && (
                <span className="text-[10px] line-through text-gray-500">
                  ₹{originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-2 w-full text-start group-hover:opacity-0 transition-opacity">
        <h3 className="text-xs font-medium text-gray-800 line-clamp-1 mb-1">
          {productName}
        </h3>

        <div className="flex flex-col gap-0.5 mb-2">
          {productCategory && (
            <p className="text-[10px] text-gray-500 line-clamp-1">
              {productCategory}
            </p>
          )}
          <p className="text-[10px] text-gray-500 line-clamp-1">
            {productSubcategory}
          </p>
          <span className="text-[10px] text-gray-500 line-clamp-1 hidden sm:block">
            {productDescription}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-gray-900">
              ₹{productPrice}
            </span>
            {originalPrice > productPrice && (
              <span className="text-[10px] line-through text-gray-500 hidden sm:inline">
                ₹{originalPrice}
              </span>
            )}
          </div>
          {ratingValue > 0 && (
            <span className="text-[10px] bg-green-500 text-white px-1 py-0.5 rounded flex items-center gap-0.5">
              {ratingValue} ★ ({reviewCount})
            </span>
          )}
        </div>

        {/* Mobile-only */}
        {originalPrice > productPrice && (
          <div className="sm:hidden mt-1 flex items-center justify-between">
            <span className="text-[10px] text-gray-500 line-through">
              ₹{originalPrice}
            </span>
            <span className="text-[10px] text-green-600 font-medium">
              {discountPercentage}% off
            </span>
          </div>
        )}
      </div>

      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {discountPercentage}% OFF
        </div>
      )}
    </div>
  );
}

export default ProductCard;