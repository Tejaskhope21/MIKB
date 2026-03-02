import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API = axios.create({
    baseURL: "https://bricks-backend-qyea.onrender.com/api/v1",
  });

  const fetchPublicCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/categories/public/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicCategories();
  }, []);

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="h-8 w-64 bg-gray-200 rounded-lg mb-8 md:mb-10 animate-pulse mx-auto md:mx-0"></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6">
        {[...Array(12)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
          >
            {/* Image Skeleton */}
            <div className="aspect-square bg-gray-200 animate-pulse"></div>

            {/* Text Skeleton */}
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-700 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchPublicCategories}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-10 text-center md:text-left">
        Shop by Category
      </h2>

      {categories.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
          <div className="text-gray-400 text-5xl mb-4">📂</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            No categories found
          </h3>
          <p className="text-gray-500">
            Categories will appear here once they're available
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              onClick={() => navigate(`/category/${category._id}`)}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-indigo-200"
            >
              {/* Image Container with Shimmer Effect */}
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src={
                    category.image ||
                    "https://via.placeholder.com/300x300/e5e7eb/6b7280?text=" +
                      encodeURIComponent(category.name)
                  }
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/300x300/e5e7eb/6b7280?text=${encodeURIComponent(category.name)}`;
                  }}
                />
              </div>

              {/* Category Name with Gradient Text */}
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors duration-300 text-sm md:text-base relative inline-block">
                  {category.name}
                  <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"></span>
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Button for many categories */}
      {categories.length > 12 && (
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/categories")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            View All Categories
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
};

export default CategorySection;
