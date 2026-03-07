// src/components/CategoryHeader.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const CategoryHeader = () => {
  const [categories, setCategories] = useState([]);
  const [activeCatId, setActiveCatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://bricks-backend-qyea.onrender.com/api/categories/public/categories",
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }

        const json = await res.json();

        if (!json.success) {
          throw new Error(json.message || "API response was not successful");
        }

        const data = Array.isArray(json.data) ? json.data : [];
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load navigation menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveCatId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (error) {
    return (
      <nav className="bg-white border-b py-5 text-center text-red-600 font-medium">
        {error}
        <br />
        <small className="text-gray-500 text-sm mt-1 block">
          (check backend is running & network tab)
        </small>
      </nav>
    );
  }

  if (loading) {
    return (
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-center gap-8 md:gap-12 animate-pulse">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-5 w-20 md:w-28 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  if (categories.length === 0) {
    return (
      <nav className="bg-white border-b py-5 text-center text-gray-600">
        No categories available
      </nav>
    );
  }

  return (
    <nav
      className="bg-white border-b border-gray-200 relative z-50"
      ref={menuRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center justify-center gap-6 md:gap-9 lg:gap-11 text-sm md:text-base font-medium text-gray-800">
          {categories.map((cat) => {
            if (!cat?._id || !cat?.name) return null;

            const catSlug = cat.name
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");

            return (
              <li
                key={cat._id}
                className="relative group"
                onMouseEnter={() => setActiveCatId(cat._id)}
                onMouseLeave={() => setActiveCatId(null)}
              >
                <Link
                  to={`/category/${catSlug}`}
                  className="py-4 md:py-5 block px-2 hover:text-[#f97316] transition-colors uppercase tracking-wide whitespace-nowrap"
                >
                  {cat.name}
                </Link>

                {activeCatId === cat._id &&
                  Array.isArray(cat.subCategories) &&
                  cat.subCategories.length > 0 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-screen max-w-7xl bg-white shadow-2xl border-t border-gray-200">
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-6 md:gap-8 px-6 md:px-10 py-8">
                        {cat.subCategories.map((sub) => {
                          const subName = sub.name || sub.title || "Unnamed";
                          if (!sub?._id) return null;

                          const subSlug = subName
                            .toLowerCase()
                            .trim()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, "");

                          return (
                            <div
                              key={sub._id}
                              className="min-w-[140px] space-y-3"
                            >
                              <h3 className="font-bold text-gray-900 uppercase text-xs sm:text-sm tracking-wide">
                                <Link
                                  to={`/category/${catSlug}/${subSlug}`}
                                  className="hover:text-[#f97316] transition-colors"
                                >
                                  {subName}
                                </Link>
                              </h3>

                              {Array.isArray(sub.items) &&
                              sub.items.length > 0 ? (
                                <ul className="space-y-1.5 text-sm text-gray-700">
                                  {sub.items.map((item) => {
                                    if (!item?._id || !item?.name) return null;

                                    const itemSlug = item.name
                                      .toLowerCase()
                                      .trim()
                                      .replace(/\s+/g, "-")
                                      .replace(/[^a-z0-9-]/g, "");

                                    return (
                                      <li key={item._id}>
                                        <Link
                                          to={`/category/${catSlug}/${subSlug}/${itemSlug}`}
                                          className="hover:text-[#f97316] hover:underline transition-colors block py-0.5 text-gray-600"
                                        >
                                          {item.name}
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p className="text-xs text-gray-500 italic">
                                  No items available
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-gray-100 px-6 md:px-10 py-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">
                            Showing {cat.subCategories.length} subcategories
                          </p>
                          <Link
                            to={`/category/${catSlug}`}
                            className="text-sm text-[#f97316] hover:text-orange-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            View all in {cat.name}
                            <span className="ml-1">→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryHeader;