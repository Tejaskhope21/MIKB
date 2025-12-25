// components/Navbar.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiShoppingCart, FiSearch, FiMenu, FiX, FiLogOut, FiPackage, FiGrid, FiTag } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import logo from "/BricksKart.png";
import { useCart } from '../context/CartContext';
import { searchAutocomplete, hasSearchResults } from '../services/api';
import "../index.css"

export default function Navbar({ user, onLogout }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchResults, setSearchResults] = useState({
        success: true,
        products: [],
        categories: [],
        subcategories: [],
        query: '',
        totalResults: 0
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
                    query: '',
                    totalResults: 0
                });
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchAutocomplete(query, 8);
                setSearchResults(results);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults({
                    success: false,
                    products: [],
                    categories: [],
                    subcategories: [],
                    query: query,
                    totalResults: 0,
                    error: error.message || 'Search failed'
                });
            } finally {
                setIsSearching(false);
            }
        }, 300),
        []
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
                query: '',
                totalResults: 0
            });
            setShowAutocomplete(false);
        }
    }, [searchQuery, debouncedSearch]);

    // Close autocomplete when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }

            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowAutocomplete(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
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

    // Fixed navigation to match your route structure
    const handleAutocompleteSelect = (type, item) => {
        setSearchQuery('');
        setShowAutocomplete(false);
        setMenuOpen(false); // Close mobile menu on select

        switch (type) {
            case 'product':
                // Use numericId or _id for product
                const productId = item.numericId || item._id || item.id;
                navigate(`/product/${productId}`);
                break;
            case 'category':
                // Navigate to category page - use numericId or _id
                const categoryId = item.numericId || item._id || item.id;
                navigate(`/products/category/${categoryId}`, {
                    state: { categoryName: item.name }
                });
                break;
            case 'subcategory':
                // Handle subcategory navigation
                const subcategoryId = item._id || item.id || item.numericId;
                const categoryIdForSub = item.categoryId || item.category?._id || item.category?.id || item.category?.numericId;

                if (categoryIdForSub) {
                    // Navigate to category page with subcategory filter
                    navigate(`/products/category/${categoryIdForSub}`, {
                        state: {
                            categoryName: item.category?.name || 'Category',
                            subcategoryName: item.title || item.name,
                            filter: item.title || item.name
                        }
                    });
                } else {
                    // Fallback to search
                    navigate(`/search?q=${encodeURIComponent(item.title || item.name)}`);
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

    const profileItems = user ? [
        { label: "My Profile", path: "/profile" },
        { label: "My Orders", path: "/orders/my-orders" },
        { label: "My Addresses", path: "/profile" },
        { label: "Logout", action: handleLogout, icon: <FiLogOut className="mr-2" /> }
    ] : [
        { label: "Sign In", path: "/login" },
        { label: "Sign Up", path: "/register" }
    ];

    // Helper to get valid image URL
    const getValidImageUrl = (imageUrl) => {
        if (!imageUrl) return null;

        if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image')) {
            return imageUrl;
        }

        if (imageUrl.startsWith('/')) {
            return `http://localhost:5001${imageUrl}`;
        }

        return `http://localhost:5001/uploads/${imageUrl}`;
    };

    // Check if we have successful search results
    const hasSuccessfulResults = hasSearchResults(searchResults);

    return (
        <header className="sticky top-0 z-50 bg-[#800000] shadow-lg">
            <div className="w-full">
                {/* Top Navbar */}
                <nav className="h-[80px] px-4 md:px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center h-full">
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-[70px] w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation Center */}
                    <div className="hidden lg:flex items-center space-x-8 text-white mx-8">
                        <Link to="/" className="hover:text-gray-300 transition-colors font-medium">
                            Home
                        </Link>
                        <Link to="/products" className="hover:text-gray-300 transition-colors font-medium">
                            Products
                        </Link>
                        <Link to="/brands" className="hover:text-gray-300 transition-colors font-medium">
                            Brands
                        </Link>
                    </div>

                    {/* Search Bar (Desktop) with Autocomplete */}
                    <div className="hidden lg:flex flex-1 max-w-xl mx-4 relative" ref={searchRef}>
                        <form onSubmit={handleSearch} className="w-full relative">
                            <div className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search products, brands, categories..."
                                    className="w-full h-12 px-4 pr-12 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowAutocomplete(true)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    <FiSearch size={20} />
                                </button>

                                {/* Autocomplete Dropdown */}
                                {showAutocomplete && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-2xl rounded-lg border border-gray-300 z-[9999] max-h-[500px] overflow-y-auto">
                                        {isSearching ? (
                                            <div className="p-6 text-center text-gray-500">
                                                <AiOutlineLoading3Quarters className="animate-spin inline-block mr-2 text-[#800000]" />
                                                Searching...
                                            </div>
                                        ) : !searchResults.success ? (
                                            <div className="p-6 text-center text-red-500">
                                                {searchResults.error || 'Search failed. Please try again.'}
                                            </div>
                                        ) : hasSuccessfulResults ? (
                                            <>
                                                {/* Products Section */}
                                                {searchResults.products.length > 0 && (
                                                    <div className="border-b border-gray-100">
                                                        <div className="px-4 py-3 bg-gray-50 text-gray-700 text-sm font-semibold">
                                                            Products ({searchResults.products.length})
                                                        </div>
                                                        {searchResults.products.map((product) => (
                                                            <button
                                                                key={product._id || product.id || product.numericId}
                                                                onClick={() => handleAutocompleteSelect('product', product)}
                                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 group border-b border-gray-50 last:border-b-0"
                                                            >
                                                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 border border-gray-200">
                                                                    {product.images?.[0] ? (
                                                                        <img
                                                                            src={getValidImageUrl(product.images[0])}
                                                                            alt={product.name}
                                                                            className="w-10 h-10 object-contain"
                                                                            onError={(e) => e.target.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop"}
                                                                        />
                                                                    ) : (
                                                                        <FiPackage className="text-gray-400" size={20} />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-gray-800 truncate group-hover:text-[#800000]">
                                                                        {product.name || product.productName}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        {product.brand && (
                                                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                                                {product.brand}
                                                                            </span>
                                                                        )}
                                                                        {product.materialType && (
                                                                            <span className="text-xs text-gray-500">
                                                                                in {product.materialType}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {product.price && (
                                                                    <div className="text-sm font-semibold text-[#800000] whitespace-nowrap">
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
                                                        <div className="px-4 py-3 bg-gray-50 text-gray-700 text-sm font-semibold">
                                                            Categories ({searchResults.categories.length})
                                                        </div>
                                                        {searchResults.categories.map((category) => (
                                                            <button
                                                                key={category._id || category.id || category.numericId}
                                                                onClick={() => handleAutocompleteSelect('category', category)}
                                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 group border-b border-gray-50 last:border-b-0"
                                                            >
                                                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <FiGrid className="text-blue-500" size={20} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-800 group-hover:text-[#800000]">
                                                                        {category.name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        Browse all products in this category
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Subcategories Section */}
                                                {/* {searchResults.subcategories.length > 0 && (
                                                    <div className="border-b border-gray-100 last:border-b-0">
                                                        <div className="px-4 py-3 bg-gray-50 text-gray-700 text-sm font-semibold">
                                                            Subcategories ({searchResults.subcategories.length})
                                                        </div>
                                                        {searchResults.subcategories.map((subcategory) => {
                                                            const categoryName = subcategory.category?.name || 'Category';
                                                            const subcategoryName = subcategory.title || subcategory.name;
                                                            return (
                                                                <button
                                                                    key={subcategory._id || subcategory.id || subcategory.numericId}
                                                                    onClick={() => handleAutocompleteSelect('subcategory', subcategory)}
                                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 group border-b border-gray-50 last:border-b-0"
                                                                >
                                                                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                                        <FiTag className="text-green-500" size={16} />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-gray-800 group-hover:text-[#800000]">
                                                                            {subcategoryName}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-xs text-gray-500">
                                                                                in {categoryName}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )} */}

                                                {/* View all results */}
                                                {(searchResults.totalResults > 0 || searchQuery.length > 0) && (
                                                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                                                        <button
                                                            onClick={() => {
                                                                setShowAutocomplete(false);
                                                                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                                            }}
                                                            className="w-full text-center text-[#800000] font-medium hover:underline py-2 flex items-center justify-center gap-2"
                                                        >
                                                            View all results for "{searchQuery}"
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : searchQuery.length > 0 ? (
                                            <div className="p-8 text-center">
                                                <div className="text-gray-400 text-4xl mb-4">🔍</div>
                                                <p className="text-gray-600 font-medium">No results found for</p>
                                                <p className="text-gray-800 font-semibold mt-2 text-lg">"{searchQuery}"</p>
                                                <p className="text-gray-500 text-sm mt-3">Try different keywords or check spelling</p>
                                                <button
                                                    onClick={() => {
                                                        setShowAutocomplete(false);
                                                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                                    }}
                                                    className="mt-4 text-[#800000] font-medium hover:underline"
                                                >
                                                    Search anyway →
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center text-gray-500">
                                                Start typing to search products, categories, or subcategories...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Right Side Icons */}
                    <div className="hidden md:flex items-center space-x-6 text-white">
                        <button
                            onClick={() => navigate('/contractors')}
                            className="hover:text-gray-300 transition-colors font-medium cursor-pointer"
                        >
                            Contractors
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="hover:text-gray-300 transition-colors font-medium cursor-pointer"
                        >
                            Seller
                        </button>
                        <Link to="/investors" className="hover:text-gray-300 transition-colors font-medium">
                            Investors
                        </Link>

                        {/* Cart with Counter */}
                        <Link to="/cart" className="relative hover:text-gray-300 transition-colors">
                            <FiShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                ref={profileButtonRef}
                                className="flex items-center gap-2 hover:text-gray-300 transition-colors"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                onMouseEnter={() => setDropdownOpen(true)}
                            >
                                <div className="w-8 h-8 bg-white text-[#800000] rounded-full flex items-center justify-center font-semibold">
                                    {user ? (
                                        user.name?.charAt(0).toUpperCase()
                                    ) : (
                                        <FiUser size={16} />
                                    )}
                                </div>
                                <span className="font-medium">{user ? user.name?.split(' ')[0] : 'Profile'}</span>
                            </button>
                            {dropdownOpen && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute top-full right-0 mt-2 bg-white text-gray-800 shadow-lg rounded-sm border w-60 z-50"
                                    onMouseEnter={() => setDropdownOpen(true)}
                                    onMouseLeave={() => setDropdownOpen(false)}
                                >
                                    <div className="p-4">
                                        {user && (
                                            <div className="mb-4 pb-4 border-b">
                                                <p className="font-semibold text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            {profileItems.map((item, index) => (
                                                item.path ? (
                                                    <Link
                                                        key={index}
                                                        to={item.path}
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors font-medium hover:text-[#800000]"
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ) : (
                                                    <button
                                                        key={index}
                                                        onClick={item.action}
                                                        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center font-medium hover:text-[#800000]"
                                                    >
                                                        {item.icon}
                                                        {item.label}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Post Requirement Button */}
                        <button
                            onClick={() => navigate('/post-requirement')}
                            className="bg-white text-[#800000] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-sm hover:shadow"
                        >
                            Post Requirement
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                    >
                        {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
                    </button>
                </nav>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden bg-[#800000] border-t border-gray-600 px-4 py-4 space-y-4">
                        {/* Mobile Search */}
                        <div className="relative mb-4" ref={searchRef}>
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="w-full h-12 px-4 pr-12 rounded-lg bg-white text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setShowAutocomplete(true)}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                                    >
                                        <FiSearch size={20} />
                                    </button>
                                </div>
                            </form>

                            {/* Mobile Autocomplete */}
                            {showAutocomplete && searchQuery.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-2xl rounded-lg border border-gray-300 z-50 max-h-[400px] overflow-y-auto">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <AiOutlineLoading3Quarters className="animate-spin inline-block mr-2" />
                                            Searching...
                                        </div>
                                    ) : hasSuccessfulResults ? (
                                        <div className="py-2">
                                            {/* Mobile Products */}
                                            {searchResults.products.length > 0 && (
                                                <div className="border-b border-gray-100">
                                                    <div className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-semibold">
                                                        Products
                                                    </div>
                                                    {searchResults.products.slice(0, 3).map((product) => (
                                                        <button
                                                            key={product._id || product.id || product.numericId}
                                                            onClick={() => {
                                                                handleAutocompleteSelect('product', product);
                                                                setMenuOpen(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="font-medium text-gray-800 truncate">
                                                                {product.name || product.productName}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Mobile Categories */}
                                            {searchResults.categories.length > 0 && (
                                                <div className="border-b border-gray-100">
                                                    <div className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-semibold">
                                                        Categories
                                                    </div>
                                                    {searchResults.categories.slice(0, 2).map((category) => (
                                                        <button
                                                            key={category._id || category.id || category.numericId}
                                                            onClick={() => {
                                                                handleAutocompleteSelect('category', category);
                                                                setMenuOpen(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="font-medium text-gray-800">
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
                                                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                                        setMenuOpen(false);
                                                    }}
                                                    className="w-full text-center text-[#800000] font-medium py-3 border-t border-gray-200"
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
                        <div className="space-y-3 text-white">
                            <Link to="/" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                Home
                            </Link>
                            <Link to="/products" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                Products
                            </Link>
                            <Link to="/brands" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                Brands
                            </Link>

                            <button
                                onClick={() => {
                                    navigate('/sell');
                                    setMenuOpen(false);
                                }}
                                className="block py-2 hover:text-gray-300 font-medium w-full text-left"
                            >
                                Sell
                            </button>
                            <Link to="/investors" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                Investors
                            </Link>

                            {user && (
                                <>
                                    <Link to="/profile" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                        My Profile
                                    </Link>
                                    <Link to="/orders" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                        My Orders
                                    </Link>
                                    <Link to="/profile/addresses" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                        My Addresses
                                    </Link>
                                </>
                            )}

                            {!user ? (
                                <>
                                    <Link to="/login" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                        Sign Up
                                    </Link>
                                </>
                            ) : (
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left py-2 text-white hover:text-gray-300 flex items-center font-medium"
                                >
                                    <FiLogOut className="mr-2" />
                                    Logout
                                </button>
                            )}

                            <Link to="/cart" className=" py-2 hover:text-gray-300 flex items-center gap-2 font-medium" onClick={() => setMenuOpen(false)}>
                                Cart
                                {cartCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            <button
                                onClick={() => {
                                    navigate('/post-requirement');
                                    setMenuOpen(false);
                                }}
                                className="w-full bg-white text-[#800000] py-3 rounded-lg font-medium mt-4 shadow-sm hover:bg-gray-100"
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