// components/Navbar.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiShoppingCart,
  FiSearch,
  FiMenu,
  FiX,
  FiLogOut,
  FiPackage,
  FiGrid,
  FiTag,
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import logo from "/logo.png";
import { useCart } from "../context/CartContext";
import { searchAutocomplete, hasSearchResults } from "../services/api";
import "../index.css";

export default function Navbar({ user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({
    success: true,
    products: [],
    categories: [],
    subcategories: [],
    itemTypes: [],
    query: "",
    totalResults: 0,
  });
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartCount());
    };
    updateCartCount();

    const interval = setInterval(updateCartCount, 1000);
    return () => clearInterval(interval);
  }, [getCartCount]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 1) {
        setSearchResults({
          success: true,
          products: [],
          categories: [],
          subcategories: [],
          itemTypes: [],
          query: "",
          totalResults: 0,
        });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchAutocomplete(query, 8);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults({
          success: false,
          products: [],
          categories: [],
          subcategories: [],
          itemTypes: [],
          query: query,
          totalResults: 0,
          error: error.message || "Search failed",
        });
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [],
  );

  // Handle search input changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      debouncedSearch(searchQuery);
      setShowAutocomplete(true);
    } else {
      setSearchResults({
        success: true,
        products: [],
        categories: [],
        subcategories: [],
        itemTypes: [],
        query: "",
        totalResults: 0,
      });
      setShowAutocomplete(false);
    }
  }, [searchQuery, debouncedSearch]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      setShowAutocomplete(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Enhanced navigation handler for search results
  const handleAutocompleteSelect = (type, item) => {
    setSearchQuery("");
    setShowAutocomplete(false);
    setMenuOpen(false); // Close mobile menu on select

    console.log("Navigating to:", type, item);

    switch (type) {
      case "product":
        // Navigate to product details page
        const productId = item.numericId || item._id || item.id;
        if (productId) {
          navigate(`/product/${productId}`);
        } else {
          // Fallback to search
          navigate(
            `/search?q=${encodeURIComponent(item.name || item.productName)}`,
          );
        }
        break;

      case "category":
        // Navigate to category page using categoryId
        const categoryId = item.numericId || item._id || item.id;
        const categorySlug =
          item.slug || item.name?.toLowerCase().replace(/\s+/g, "-");

        if (categoryId) {
          navigate(`/category/${categoryId}`, {
            state: { categoryName: item.name },
          });
        } else if (categorySlug) {
          navigate(`/category/${categorySlug}`);
        } else {
          navigate(`/search?q=${encodeURIComponent(item.name)}`);
        }
        break;

      case "subcategory":
        // Navigate to category page with subcategory filter
        // First get parent category
        const subcategoryId = item._id || item.id || item.numericId;
        const subcategorySlug =
          item.slug || item.title?.toLowerCase().replace(/\s+/g, "-");
        const parentCategoryId =
          item.categoryId ||
          item.category?._id ||
          item.category?.id ||
          item.category?.numericId;
        const parentCategorySlug =
          item.category?.slug ||
          item.category?.name?.toLowerCase().replace(/\s+/g, "-");

        if (parentCategoryId && subcategoryId) {
          // Navigate to category page with subcategory filter
          navigate(`/category/${parentCategoryId}`, {
            state: {
              categoryName: item.category?.name || "Category",
              subcategoryName: item.title || item.name,
              subcategoryId: subcategoryId,
            },
          });
        } else if (parentCategorySlug) {
          // Use slug-based navigation
          navigate(`/category/${parentCategorySlug}`, {
            state: {
              subcategorySlug: subcategorySlug,
              subcategoryName: item.title || item.name,
            },
          });
        } else {
          // Fallback to search
          navigate(`/search?q=${encodeURIComponent(item.title || item.name)}`);
        }
        break;

      case "itemtype":
        // Navigate to item type page with full path
        const itemTypeId = item._id || item.id || item.numericId;
        const itemTypeSlug =
          item.slug || item.name?.toLowerCase().replace(/\s+/g, "-");
        const parentSubcategoryId =
          item.subCategoryId ||
          item.subcategory?._id ||
          item.subcategory?.id ||
          item.subcategory?.numericId;
        const parentSubcategorySlug =
          item.subcategory?.slug ||
          item.subcategory?.title?.toLowerCase().replace(/\s+/g, "-");
        const grandParentCategoryId =
          item.categoryId ||
          item.category?._id ||
          item.category?.id ||
          item.category?.numericId;
        const grandParentCategorySlug =
          item.category?.slug ||
          item.category?.name?.toLowerCase().replace(/\s+/g, "-");

        // Try to navigate using slugs first
        if (grandParentCategorySlug && parentSubcategorySlug && itemTypeSlug) {
          navigate(
            `/category/${grandParentCategorySlug}/${parentSubcategorySlug}/${itemTypeSlug}`,
          );
        }
        // Fallback to ID-based navigation
        else if (grandParentCategoryId && parentSubcategoryId && itemTypeId) {
          // You might need to adjust this based on your actual routes
          navigate(`/category/${grandParentCategoryId}`, {
            state: {
              subcategoryId: parentSubcategoryId,
              itemTypeId: itemTypeId,
              itemTypeName: item.name,
            },
          });
        } else {
          navigate(`/search?q=${encodeURIComponent(item.name)}`);
        }
        break;

      default:
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    onLogout();
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const profileItems = user
    ? [
        { label: "My Profile", path: "/profile" },
        { label: "My Orders", path: "/orders/my-orders" },
        { label: "My Addresses", path: "/profile" },
        {
          label: "Logout",
          action: handleLogout,
          icon: <FiLogOut className="mr-2" />,
        },
      ]
    : [
        { label: "Sign In", path: "/login" },
        { label: "Sign Up", path: "/register" },
      ];

  // Helper to get valid image URL
  const getValidImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    if (imageUrl.startsWith("http") || imageUrl.startsWith("data:image")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
      return `https://bricks-backend-qyea.onrender.com${imageUrl}`;
    }

    return `https://bricks-backend-qyea.onrender.com/uploads/${imageUrl}`;
  };

  // Check if we have successful search results
  const hasSuccessfulResults = hasSearchResults(searchResults);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="w-full">
        {/* Top Navbar */}
        <nav className="h-20 px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center h-full">
            <img
              src={logo}
              alt="InfraKarts"
              className="h-[160px] w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Center */}
          <div className="hidden lg:flex items-center gap-10 text-gray-800 text-base font-medium mx-8">
            <Link
              to="/"
              className="hover:text-orange-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="hover:text-orange-600 transition-colors"
            >
              Products
            </Link>
            <Link
              to="/brands"
              className="hover:text-orange-600 transition-colors"
            >
              Brands
            </Link>
          </div>

          {/* Search Bar (Desktop) with Autocomplete */}
          <div
            className="hidden lg:flex flex-1 max-w-2xl mx-6 relative"
            ref={searchRef}
          >
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, brands, categories..."
                  className="w-full h-11 px-5 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm text-gray-900 placeholder-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowAutocomplete(true)}
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors"
                >
                  <FiSearch size={20} />
                </button>

                {/* Autocomplete Dropdown */}
                {showAutocomplete && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-xl border border-gray-200 z-50 max-h-[520px] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-8 text-center text-gray-500">
                        <AiOutlineLoading3Quarters
                          className="animate-spin inline-block mr-2 text-orange-600"
                          size={24}
                        />
                        Searching...
                      </div>
                    ) : !searchResults.success ? (
                      <div className="p-8 text-center text-red-600">
                        {searchResults.error ||
                          "Search failed. Please try again."}
                      </div>
                    ) : hasSuccessfulResults ? (
                      <>
                        {/* Products Section */}
                        {searchResults.products.length > 0 && (
                          <div className="border-b border-gray-100">
                            <div className="px-5 py-3 bg-gray-50 text-sm font-semibold text-gray-700">
                              Products ({searchResults.products.length})
                            </div>
                            {searchResults.products.map((product) => (
                              <button
                                key={
                                  product._id || product.id || product.numericId
                                }
                                onClick={() =>
                                  handleAutocompleteSelect("product", product)
                                }
                                className="w-full text-left px-5 py-3 hover:bg-orange-50 flex items-center gap-4 group border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 border border-gray-200">
                                  {product.images?.[0] ? (
                                    <img
                                      src={getValidImageUrl(product.images[0])}
                                      alt={product.name}
                                      className="w-10 h-10 object-contain"
                                      onError={(e) =>
                                        (e.target.src =
                                          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop")
                                      }
                                    />
                                  ) : (
                                    <FiPackage
                                      className="text-gray-400"
                                      size={24}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate group-hover:text-orange-600">
                                    {product.name || product.productName}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {product.brand && (
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {product.brand}
                                      </span>
                                    )}
                                    {product.category && (
                                      <span className="text-xs text-gray-500">
                                        in {product.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {product.price && (
                                  <div className="text-sm font-semibold text-orange-600 whitespace-nowrap">
                                    ₹{product.price.toLocaleString()}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Categories Section */}
                        {searchResults.categories.length > 0 && (
                          <div className="border-b border-gray-100">
                            <div className="px-5 py-3 bg-gray-50 text-sm font-semibold text-gray-700">
                              Categories ({searchResults.categories.length})
                            </div>
                            {searchResults.categories.map((category) => (
                              <button
                                key={
                                  category._id ||
                                  category.id ||
                                  category.numericId
                                }
                                onClick={() =>
                                  handleAutocompleteSelect("category", category)
                                }
                                className="w-full text-left px-5 py-3 hover:bg-orange-50 flex items-center gap-4 group border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                  <FiGrid className="text-blue-500" size={20} />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 group-hover:text-orange-600">
                                    {category.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Browse all products in {category.name}
                                  </div>
                                </div>
                                <svg
                                  className="w-5 h-5 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Subcategories Section */}
                        {searchResults.subcategories.length > 0 && (
                          <div className="border-b border-gray-100">
                            <div className="px-5 py-3 bg-gray-50 text-sm font-semibold text-gray-700">
                              Subcategories (
                              {searchResults.subcategories.length})
                            </div>
                            {searchResults.subcategories.map((subcategory) => (
                              <button
                                key={
                                  subcategory._id ||
                                  subcategory.id ||
                                  subcategory.numericId
                                }
                                onClick={() =>
                                  handleAutocompleteSelect(
                                    "subcategory",
                                    subcategory,
                                  )
                                }
                                className="w-full text-left px-5 py-3 hover:bg-orange-50 flex items-center gap-4 group border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                  <FiTag className="text-green-500" size={16} />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 group-hover:text-orange-600">
                                    {subcategory.title || subcategory.name}
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-gray-500">
                                      in{" "}
                                      {subcategory.category?.name || "Category"}
                                    </span>
                                  </div>
                                </div>
                                <svg
                                  className="w-5 h-5 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Item Types Section */}
                        {searchResults.itemTypes &&
                          searchResults.itemTypes.length > 0 && (
                            <div className="border-b border-gray-100">
                              <div className="px-5 py-3 bg-gray-50 text-sm font-semibold text-gray-700">
                                Item Types ({searchResults.itemTypes.length})
                              </div>
                              {searchResults.itemTypes.map((itemType) => (
                                <button
                                  key={
                                    itemType._id ||
                                    itemType.id ||
                                    itemType.numericId
                                  }
                                  onClick={() =>
                                    handleAutocompleteSelect(
                                      "itemtype",
                                      itemType,
                                    )
                                  }
                                  className="w-full text-left px-5 py-3 hover:bg-orange-50 flex items-center gap-4 group border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                  <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FiGrid
                                      className="text-purple-500"
                                      size={16}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 group-hover:text-orange-600">
                                      {itemType.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {itemType.subcategory?.title &&
                                        `in ${itemType.subcategory.title}`}
                                      {itemType.category?.name &&
                                        ` • ${itemType.category.name}`}
                                    </div>
                                  </div>
                                  <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </button>
                              ))}
                            </div>
                          )}

                        {/* View all results */}
                        {(searchResults.totalResults > 0 ||
                          searchQuery.length > 0) && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50 text-center">
                            <button
                              onClick={() => {
                                setShowAutocomplete(false);
                                navigate(
                                  `/search?q=${encodeURIComponent(searchQuery)}`,
                                );
                              }}
                              className="text-orange-600 font-medium hover:underline py-2 inline-flex items-center justify-center gap-2"
                            >
                              View all results for "{searchQuery}"
                              <svg
                                className="w-4 h-4"
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
                      </>
                    ) : searchQuery.length > 0 ? (
                      <div className="p-10 text-center">
                        <div className="text-gray-400 text-4xl mb-4">🔍</div>
                        <p className="text-gray-600 font-medium">
                          No results found for
                        </p>
                        <p className="text-gray-800 font-semibold mt-2 text-lg">
                          "{searchQuery}"
                        </p>
                        <p className="text-gray-500 text-sm mt-3">
                          Try different keywords or check spelling
                        </p>
                        <button
                          onClick={() => {
                            setShowAutocomplete(false);
                            navigate(
                              `/search?q=${encodeURIComponent(searchQuery)}`,
                            );
                          }}
                          className="mt-4 text-orange-600 font-medium hover:underline"
                        >
                          Search anyway →
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        Start typing to search products, categories, or
                        subcategories...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center gap-6 text-gray-800">
            {/* Quick Links */}
            <button
              onClick={() => navigate("/contractors")}
              className="hover:text-orange-600 transition-colors font-medium cursor-pointer"
            >
              Contractors
            </button>
            <button
              onClick={() => navigate("/seller")}
              className="hover:text-orange-600 transition-colors font-medium cursor-pointer"
            >
              Seller
            </button>
            <Link
              to="/investors"
              className="hover:text-orange-600 transition-colors font-medium"
            >
              Investors
            </Link>

            {/* Cart with Counter */}
            <Link
              to="/cart"
              className="relative hover:text-orange-600 transition-colors"
            >
              <FiShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                ref={profileButtonRef}
                className="flex items-center gap-2.5 hover:text-orange-600 transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onMouseEnter={() => setDropdownOpen(true)}
              >
                <div className="w-9 h-9 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center font-semibold border border-gray-300">
                  {user ? (
                    user.name?.charAt(0).toUpperCase()
                  ) : (
                    <FiUser size={18} />
                  )}
                </div>
                <span className="font-medium">
                  {user ? user.name?.split(" ")[0] : "Account"}
                </span>
              </button>
              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-2 w-64 bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden z-50"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  {user && (
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  )}
                  <div className="py-2">
                    {profileItems.map((item, index) =>
                      item.path ? (
                        <Link
                          key={index}
                          to={item.path}
                          onClick={() => setDropdownOpen(false)}
                          className="block px-5 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <button
                          key={index}
                          onClick={item.action}
                          className="w-full text-left px-5 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center"
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Post Requirement Button */}
            <button
              onClick={() => navigate("/post-requirement")}
              className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm"
            >
              Post Requirement
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-800"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-5 py-6 space-y-5">
            {/* Mobile Search */}
            <div className="relative mb-4" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full h-11 px-4 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowAutocomplete(true)}
                  />
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <FiSearch size={20} />
                  </button>
                </div>
              </form>

              {/* Mobile Autocomplete */}
              {showAutocomplete && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-xl border border-gray-200 z-50 max-h-[400px] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <AiOutlineLoading3Quarters className="animate-spin inline-block mr-2 text-orange-600" />
                      Searching...
                    </div>
                  ) : hasSuccessfulResults ? (
                    <div className="py-2">
                      {/* Mobile Products */}
                      {searchResults.products.length > 0 && (
                        <div className="border-b border-gray-100">
                          <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
                            Products
                          </div>
                          {searchResults.products.slice(0, 3).map((product) => (
                            <button
                              key={
                                product._id || product.id || product.numericId
                              }
                              onClick={() => {
                                handleAutocompleteSelect("product", product);
                                setMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-800 truncate hover:text-orange-600">
                                {product.name || product.productName}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Mobile Categories */}
                      {searchResults.categories.length > 0 && (
                        <div className="border-b border-gray-100">
                          <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
                            Categories
                          </div>
                          {searchResults.categories
                            .slice(0, 2)
                            .map((category) => (
                              <button
                                key={
                                  category._id ||
                                  category.id ||
                                  category.numericId
                                }
                                onClick={() => {
                                  handleAutocompleteSelect(
                                    "category",
                                    category,
                                  );
                                  setMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-800 hover:text-orange-600">
                                  {category.name}
                                </div>
                              </button>
                            ))}
                        </div>
                      )}

                      {/* View all results button */}
                      {searchResults.totalResults > 0 && (
                        <button
                          onClick={() => {
                            setShowAutocomplete(false);
                            navigate(
                              `/search?q=${encodeURIComponent(searchQuery)}`,
                            );
                            setMenuOpen(false);
                          }}
                          className="w-full text-center text-orange-600 font-medium py-3 border-t border-gray-200 hover:bg-orange-50"
                        >
                          View all {searchResults.totalResults} results
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col gap-4 text-gray-800 font-medium">
              <Link
                to="/"
                className="hover:text-orange-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="hover:text-orange-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/brands"
                className="hover:text-orange-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Brands
              </Link>

              <button
                onClick={() => {
                  navigate("/contractors");
                  setMenuOpen(false);
                }}
                className="text-left hover:text-orange-600 transition-colors"
              >
                Contractors
              </button>
              <button
                onClick={() => {
                  navigate("/seller");
                  setMenuOpen(false);
                }}
                className="text-left hover:text-orange-600 transition-colors"
              >
                Seller
              </button>
              <Link
                to="/investors"
                className="hover:text-orange-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Investors
              </Link>

              <Link
                to="/cart"
                className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Cart
                {cartCount > 0 && (
                  <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="hover:text-orange-600 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders/my-orders"
                    className="hover:text-orange-600 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left flex items-center gap-2 hover:text-orange-600 transition-colors"
                  >
                    <FiLogOut /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hover:text-orange-600 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="hover:text-orange-600 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  navigate("/post-requirement");
                  setMenuOpen(false);
                }}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm mt-2"
              >
                Post Requirement
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}