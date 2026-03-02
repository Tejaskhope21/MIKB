import React, { useEffect, useState } from "react";
import {
  fetchTrendingProducts,
  trackTrendingView,
  trackTrendingClick
} from "../../services/productdealApi";
import { Link } from "react-router-dom";

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      setLoading(true);
      const res = await fetchTrendingProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.error("Failed to load trending products");
    } finally {
      setLoading(false);
    }
  };

  // Track views automatically
  useEffect(() => {
    products.forEach((product) => {
      trackTrendingView(product._id);
    });
  }, [products]);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 w-56 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
          <div className="h-8 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse relative">
                <div className="absolute top-4 left-4 w-16 h-6 bg-gray-300 rounded-full"></div>
              </div>
              <div className="p-5 space-y-4">
                <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
                <div className="h-7 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-11 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16 border-2 border-dashed border-blue-100 rounded-2xl bg-blue-50">
          <div className="text-blue-400 text-5xl mb-4">📈</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No trending products found</h3>
          <p className="text-gray-500">Trending products will appear here</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
           
            <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
          </div>
          <p className="text-gray-600">Products everyone is talking about this week</p>
        </div>
        <Link
          to="/trending"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg group"
        >
          Explore All
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 relative"
          >
            {/* Trend Badge */}
            {product.isTrending && (
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  Trending
                </div>
              </div>
            )}

            {/* Rank Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-white/90 backdrop-blur-sm text-gray-800 font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                #{products.indexOf(product) + 1}
              </div>
            </div>

            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Product Info */}
            <div className="p-5">
              {/* Category */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {product.category || "Popular"}
                </span>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">{product.rating || "4.5"}</span>
                  <span className="text-xs text-gray-500">({product.reviews || "120"})</span>
                </div>
              </div>

              {/* Product Name */}
              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[56px] group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>

              {/* Brand */}
              {product.brand && (
                <p className="text-sm text-gray-600 mb-3">
                  By <span className="font-semibold text-gray-800">{product.brand}</span>
                </p>
              )}

              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg line-through text-gray-400">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                      Save ₹{product.originalPrice - product.price}
                    </span>
                    {product.discount && (
                      <span className="text-xs font-medium text-gray-500">
                        • {product.discount}% off
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Popularity Indicator */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Popularity</span>
                  <span className="font-semibold">{product.popularityScore || "95"}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                    style={{ width: `${product.popularityScore || 95}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => trackTrendingClick(product._id)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group/btn"
              >
                <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>

              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="text-xs">
                    <div className="font-semibold text-gray-900">{product.sold || "1K+"}</div>
                    <div className="text-gray-500">Sold</div>
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-gray-900">{product.inStock || "Yes"}</div>
                    <div className="text-gray-500">In Stock</div>
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-gray-900">{product.delivery || "2 days"}</div>
                    <div className="text-gray-500">Delivery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Banner */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{products.length}</div>
            <div className="text-gray-700 font-medium">Trending Products</div>
            <div className="text-sm text-gray-500">Updated daily</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {Math.round(products.reduce((acc, p) => acc + (p.rating || 4.5), 0) / products.length * 10) / 10}
            </div>
            <div className="text-gray-700 font-medium">Average Rating</div>
            <div className="text-sm text-gray-500">Based on customer reviews</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {products.reduce((acc, p) => acc + (p.sold || 0), 0).toLocaleString()}+
            </div>
            <div className="text-gray-700 font-medium">Total Sold</div>
            <div className="text-sm text-gray-500">This month</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;