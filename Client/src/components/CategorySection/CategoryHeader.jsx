// src/components/CategoryHeader.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const CategoryHeader = () => {
  const [categories, setCategories] = useState([]);
  const [activeCatId, setActiveCatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuRef = useRef(null);
  // Track which category is active for mega dropdown
  const activeCategory = categories.find((c) => c._id === activeCatId) || null;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/categories/public/categories",
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

  /* ── helpers ─────────────────────────────────────────────────── */
  const toSlug = (str = "") =>
    str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  /* ── states ───────────────────────────────────────────────────── */
  if (error) {
    return (
      <nav className="bg-white border-b-2 border-cyan-100 py-4 text-center">
        <p className="text-red-500 font-medium text-sm">{error}</p>
        <small className="text-slate-400 text-xs mt-1 block">
          (check backend is running &amp; network tab)
        </small>
      </nav>
    );
  }

  if (loading) {
    return (
      <nav className="bg-white border-b-2 border-cyan-100">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-12 flex items-center justify-start sm:justify-center gap-6 overflow-hidden animate-pulse">
            {[90, 130, 110, 150, 120, 100, 140].map((w, i) => (
              <div
                key={i}
                className="h-3 flex-shrink-0 bg-cyan-100 rounded-full"
                style={{ width: w }}
              />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  if (categories.length === 0) {
    return (
      <nav className="bg-white border-b-2 border-cyan-100 py-4 text-center text-slate-400 text-sm">
        No categories available
      </nav>
    );
  }

  /* ── render ───────────────────────────────────────────────────── */
  return (
    /* KEY FIX: `relative` lives on the <nav>, NOT on each <li>.
       The mega panel is absolutely positioned inside the nav so it
       always spans the full nav width regardless of which tab is active. */
    <nav
      className="bg-white border-b-2 border-cyan-100 relative z-50 shadow-sm"
      ref={menuRef}
      onMouseLeave={() => setActiveCatId(null)}
    >
      {/* ── Scrollable tab bar ──────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul
          className="flex items-center gap-0 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => {
            if (!cat?._id || !cat?.name) return null;
            const isActive = activeCatId === cat._id;

            return (
              <li
                key={cat._id}
                className="flex-shrink-0"
                onMouseEnter={() => setActiveCatId(cat._id)}
              >
                <Link
                  to={`/category/${toSlug(cat.name)}`}
                  className={`
                    flex items-center h-12 px-4 lg:px-5
                    text-xs font-semibold tracking-widest uppercase
                    whitespace-nowrap transition-all duration-150
                    border-b-2 -mb-[2px]
                    ${isActive
                      ? "text-cyan-600 border-cyan-500"
                      : "text-slate-500 border-transparent hover:text-cyan-600 hover:border-cyan-300"
                    }
                  `}
                >
                  {cat.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Mega dropdown — anchored to nav, NOT to li ──────────── */}
      {activeCatId &&
        activeCategory &&
        Array.isArray(activeCategory.subCategories) &&
        activeCategory.subCategories.length > 0 && (
          <div
            /* Positioned absolutely inside the nav → always starts at
               the nav's left edge and spans its full width */
            className="absolute left-0 right-0 top-full z-50
                       bg-white border-t-2 border-cyan-500
                       shadow-2xl rounded-b-xl overflow-hidden"
          >
            {/* Inner content — max-width centred */}
            <div className="max-w-screen-xl mx-auto px-6 sm:px-8 lg:px-10">
              <div
                className="
                  grid gap-x-8 gap-y-6 py-8
                  grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                  lg:grid-cols-5 xl:grid-cols-6
                "
              >
                {activeCategory.subCategories.map((sub) => {
                  const subName = sub.name || sub.title || "Unnamed";
                  if (!sub?._id) return null;
                  const subSlug = toSlug(subName);
                  const catSlug = toSlug(activeCategory.name);

                  return (
                    <div key={sub._id} className="min-w-0">
                      {/* Subcategory heading */}
                      <h3 className="font-bold text-cyan-700 uppercase text-xs tracking-wide border-b border-cyan-100 pb-2 mb-3">
                        <Link
                          to={`/category/${catSlug}/${subSlug}`}
                          className="hover:text-cyan-500 transition-colors"
                        >
                          {subName}
                        </Link>
                      </h3>

                      {/* Items */}
                      {Array.isArray(sub.items) && sub.items.length > 0 ? (
                        <ul className="space-y-1.5">
                          {sub.items.map((item) => {
                            if (!item?._id || !item?.name) return null;
                            const itemSlug = toSlug(item.name);

                            return (
                              <li key={item._id}>
                                <Link
                                  to={`/category/${catSlug}/${subSlug}/${itemSlug}`}
                                  className="
                                    text-xs text-slate-500 leading-relaxed
                                    hover:text-cyan-600 hover:underline
                                    transition-colors block py-0.5
                                  "
                                >
                                  {item.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-300 italic">
                          No items available
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-cyan-100 bg-cyan-50 px-6 sm:px-8 lg:px-10 py-3">
              <div className="max-w-screen-xl mx-auto flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing{" "}
                  <span className="text-cyan-600 font-semibold">
                    {activeCategory.subCategories.length}
                  </span>{" "}
                  subcategories
                </p>
                <Link
                  to={`/category/${toSlug(activeCategory.name)}`}
                  className="
                    text-xs font-semibold text-cyan-600
                    hover:text-cyan-800 flex items-center gap-1
                    transition-colors
                  "
                >
                  View all in {activeCategory.name}
                  <span className="ml-0.5">→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
    </nav>
  );
};

export default CategoryHeader;