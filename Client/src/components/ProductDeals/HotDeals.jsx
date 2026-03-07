import React, { useEffect, useState } from "react";
import {
  fetchHotDeals,
  trackHotDealView,
  trackHotDealClick
} from "../../services/productdealApi";
import { Link, useNavigate } from "react-router-dom";

const HotDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);

      const res = await fetchHotDeals();
      const data = res?.data || [];

      setDeals(data);

      // Track views
      data.forEach((product) => {
        if (product?._id) {
          trackHotDealView(product._id);
        }
      });

    } catch (error) {
      console.error("Failed to load hot deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (id) => {
    trackHotDealClick(id);
    navigate(`/product/${id}`);
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!deals.length) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h3 className="text-2xl font-semibold mb-4">
          No hot deals available right now
        </h3>

        <Link
          to="/products"
          className="px-6 py-3 bg-orange-600 text-white rounded-lg"
        >
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold">🔥 Hot Deals</h2>
          <p className="text-gray-500">
            Limited-time offers – grab them before they're gone
          </p>
        </div>

        <Link
          to="/deals"
          className="px-6 py-2 bg-orange-600 text-white rounded-lg"
        >
          View All
        </Link>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

        {deals.slice(0, 8).map((product) => (

          <div
            key={product._id}
            onClick={() => handleClick(product._id)}
            className="bg-white rounded-xl shadow hover:shadow-xl border cursor-pointer transition overflow-hidden"
          >

            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute m-3 bg-red-600 text-white px-3 py-1 text-sm rounded">
                {product.discount}% OFF
              </div>
            )}

            {/* Image */}
            <div className="h-48 bg-gray-100">
              <img
                src={product?.images?.[0] || "/placeholder-product.jpg"}
                alt={product?.name}
                className="w-full h-full object-cover hover:scale-105 transition"
              />
            </div>

            {/* Content */}
            <div className="p-5">

              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">

                <span className="text-xl font-bold">
                  ₹{product.price?.toLocaleString()}
                </span>

                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(product._id);
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg"
              >
                View Deal
              </button>

            </div>
          </div>

        ))}

      </div>

      {/* Bottom Banner */}
      <div className="mt-16 bg-orange-50 border border-orange-200 rounded-xl p-10 text-center">

        <h3 className="text-2xl font-bold mb-3">
          These Deals Won’t Last Long
        </h3>

        <p className="text-gray-600 mb-6">
          Grab your favorite products before the offer ends.
        </p>

        <Link
          to="/deals"
          className="px-8 py-3 bg-orange-600 text-white rounded-lg"
        >
          Shop Hot Deals
        </Link>

      </div>

    </section>
  );
};

export default HotDeals;