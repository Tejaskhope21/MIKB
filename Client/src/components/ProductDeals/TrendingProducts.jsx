import React, { useEffect, useState } from "react";
import {
  fetchTrendingProducts,
  trackTrendingView,
  trackTrendingClick
} from "../../services/productdealApi";

import { Link, useNavigate } from "react-router-dom";

const TrendingProducts = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {

      setLoading(true);

      const res = await fetchTrendingProducts();

      const productsArray = res?.products || [];

      setProducts(productsArray);

      productsArray.forEach((product) => {
        if (product?._id) {
          trackTrendingView(product._id);
        }
      });

    } catch (error) {
      console.error("Failed to load trending products:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8">Trending Products</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {[...Array(8)].map((_, i) => (

            <div
              key={i}
              className="bg-gray-200 h-80 rounded-xl animate-pulse"
            />

          ))}

        </div>
      </section>
    );
  }

  /* ================= EMPTY ================= */

  if (!products.length) {
    return (
      <section className="text-center py-16">

        <h3 className="text-2xl font-semibold">
          No trending products available
        </h3>

        <Link
          to="/products"
          className="mt-6 inline-block px-6 py-3 bg-orange-600 text-white rounded-lg"
        >
          Browse Products
        </Link>

      </section>
    );
  }

  /* ================= MAIN UI ================= */

  return (

    <section className="max-w-7xl mx-auto py-12 px-4">

      <div className="flex justify-between items-center mb-10">

        <h2 className="text-3xl font-bold">
          Trending Products
        </h2>

        <Link
          to="/trending"
          className="bg-orange-600 text-white px-6 py-2 rounded-lg"
        >
          View All
        </Link>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {products.slice(0, 8).map((product, index) => (

          <div
            key={product._id}
            className="bg-white rounded-xl shadow hover:shadow-xl border cursor-pointer overflow-hidden relative"
            onClick={() => {
              trackTrendingClick(product._id);
              navigate(`/product/${product._id}`);
            }}
          >

            {/* Rank Badge */}

            <div className="absolute top-3 right-3 bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
              #{index + 1}
            </div>

            {/* Image */}

            <img
              src={product.images?.[0] || "/placeholder-product.jpg"}
              alt={product.name}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">

              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {product.name}
              </h3>

              <p className="text-gray-600 text-sm mb-2">
                {product.brand || "Brand"}
              </p>

              <div className="flex gap-2 items-center">

                <span className="text-xl font-bold">
                  ₹{product.price?.toLocaleString()}
                </span>

                {product.originalPrice && (

                  <span className="line-through text-gray-400">
                    ₹{product.originalPrice}
                  </span>

                )}

              </div>

              <button
                className="mt-4 w-full bg-orange-600 text-white py-2 rounded-lg"
                onClick={(e) => {

                  e.stopPropagation();

                  trackTrendingClick(product._id);

                  navigate(`/product/${product._id}`);

                }}
              >
                View Details
              </button>

            </div>

          </div>

        ))}

      </div>

    </section>

  );
};

export default TrendingProducts;