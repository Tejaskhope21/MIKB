import React, { useEffect, useState } from "react";
import {
  fetchHotDeals,
  trackHotDealView,
  trackHotDealClick
} from "../../services/productdealApi";
import { Link } from "react-router-dom";

const HotDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const res = await fetchHotDeals();
      setDeals(res.data || []);
    } catch (error) {
      console.error("Failed to load hot deals");
    } finally {
      setLoading(false);
    }
  };

  // Track views when products appear
  useEffect(() => {
    deals.forEach((product) => {
      trackHotDealView(product._id);
    });
  }, [deals]);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!deals.length) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
          {/* <div className="text-gray-400 text-5xl mb-4">🔥</div> */}
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No hot deals available</h3>
          <p className="text-gray-500">Check back later for amazing deals!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-lg text-2xl">🔥</span>
            Hot Deals
          </h2>
          <p className="text-gray-600 mt-2">Limited time offers! Don't miss out</p>
        </div>
        <Link
          to="/deals"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-lg group"
        >
          View All Deals
          <svg 
            className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {deals.map((product) => (
          <div
            key={product._id}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-200"
          >
            {/* Product Image Container */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Discount Badge */}
              {product.discount && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                    {product.discount}% OFF
                  </div>
                </div>
              )}
              
              {/* Timer Badge (optional) */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">
                  🔥 Limited Time
                </div>
              </div>

              {/* Product Image */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={product.images?.[0] || "/placeholder.png"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-5">
              {/* Category/Brand */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {product.category || "Special Offer"}
                </span>
                <span className="text-xs font-semibold text-gray-700">
                  ⭐ {product.rating || "4.5"}
                </span>
              </div>

              {/* Product Name */}
              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-red-600 transition-colors">
                {product.name}
              </h3>

              {/* Brand */}
              {product.brand && (
                <p className="text-sm text-gray-600 mb-3">
                  Brand: <span className="font-semibold">{product.brand}</span>
                </p>
              )}

              {/* Price Section */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg line-through text-gray-400">
                      ₹{product.originalPrice}
                    </span>
                    <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                      Save ₹{product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-5">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{product.rating || "4.5"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>{product.sold || "100+"} sold</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => trackHotDealClick(product._id)}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                View Hot Deal
              </button>

              {/* Quick Info */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    In stock
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2a1 1 0 00-.293-.707L18 8.586V6a1 1 0 00-1-1h-1V3a1 1 0 00-1-1H8a1 1 0 00-1 1v2H6a1 1 0 00-1 1v2.586L3.293 11.293A1 1 0 003 12v2z" />
                    </svg>
                    Free shipping
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Countdown Banner (Optional) */}
      <div className="mt-12 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6 text-center">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h3 className="text-xl font-bold text-gray-900">Don't Miss These Deals!</h3>
            <p className="text-gray-600">Offers end soon. Shop now before they're gone.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 bg-white px-4 py-2 rounded-lg shadow">24</div>
              <div className="text-xs text-gray-500 mt-1">Hours</div>
            </div>
            <div className="text-2xl text-gray-300">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 bg-white px-4 py-2 rounded-lg shadow">59</div>
              <div className="text-xs text-gray-500 mt-1">Minutes</div>
            </div>
            <div className="text-2xl text-gray-300">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 bg-white px-4 py-2 rounded-lg shadow">59</div>
              <div className="text-xs text-gray-500 mt-1">Seconds</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotDeals;