import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser, FiShoppingCart, FiSearch, FiMenu, FiX,
  FiLogOut, FiPackage, FiGrid, FiTag, FiChevronRight,
  FiPhone, FiMapPin, FiShoppingBag, FiHeart, FiHome,
  FiBriefcase, FiStar, FiSettings, FiUserPlus, FiEdit2,
  FiTruck, FiAlertCircle, FiAward, FiLock, FiTarget , FiInfo
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import logo from "../assets/logo.png";
import { useCart } from "../context/CartContext";
import { searchAutocomplete, hasSearchResults } from "../services/api";

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export default function Navbar({ user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ddPos, setDdPos] = useState({ top: 0, right: 0 });
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [searchResults, setSearchResults] = useState({
    success: true, products: [], categories: [],
    subcategories: [], itemTypes: [], query: "", totalResults: 0,
  });

  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const profileBtnRef = useRef(null);
  const dropdownRef = useRef(null);

  // scroll shadow
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // cart count
  useEffect(() => {
    const upd = () => setCartCount(getCartCount());
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, [getCartCount]);

  // recalculate dropdown position
  useEffect(() => {
    if (!dropdownOpen) return;
    const recalc = () => {
      if (!profileBtnRef.current) return;
      const r = profileBtnRef.current.getBoundingClientRect();
      setDdPos({
        top: r.bottom + 8,
        right: window.innerWidth - r.right,
      });
    };
    recalc();
    window.addEventListener("scroll", recalc, { passive: true });
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc);
      window.removeEventListener("resize", recalc);
    };
  }, [dropdownOpen]);

  // close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const h = (e) => {
      const clickedBtn = profileBtnRef.current?.contains(e.target);
      const clickedDd = dropdownRef.current?.contains(e.target);
      if (!clickedBtn && !clickedDd) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [dropdownOpen]);

  // close search on outside click
  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowAutocomplete(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // search
  const debouncedSearch = useCallback(
    debounce(async (q) => {
      if (!q.length) {
        setSearchResults({ success: true, products: [], categories: [], subcategories: [], itemTypes: [], query: "", totalResults: 0 });
        setIsSearching(false); return;
      }
      setIsSearching(true);
      try {
        const res = await searchAutocomplete(q, 8);
        setSearchResults(res);
      } catch (err) {
        setSearchResults({ success: false, products: [], categories: [], subcategories: [], itemTypes: [], query: q, totalResults: 0, error: err.message });
      } finally { setIsSearching(false); }
    }, 300), []
  );

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      debouncedSearch(searchQuery); setShowAutocomplete(true);
    } else {
      setSearchResults({ success: true, products: [], categories: [], subcategories: [], itemTypes: [], query: "", totalResults: 0 });
      setShowAutocomplete(false);
    }
  }, [searchQuery, debouncedSearch]);

  // handlers
  const openProfile = () => {
    if (!profileBtnRef.current) return;
    const r = profileBtnRef.current.getBoundingClientRect();
    setDdPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    setDropdownOpen((v) => !v);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { setShowAutocomplete(false); navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }
  };

  const handleSelect = (type, item) => {
    setSearchQuery(""); setShowAutocomplete(false); setMenuOpen(false);
    switch (type) {
      case "product": {
        const id = item.numericId || item._id || item.id;
        id ? navigate(`/product/${id}`) : navigate(`/search?q=${encodeURIComponent(item.name || item.productName)}`);
        break;
      }
      case "category": {
        const id = item.numericId || item._id || item.id;
        id ? navigate(`/category/${id}`, { state: { categoryName: item.name } }) : navigate(`/search?q=${encodeURIComponent(item.name)}`);
        break;
      }
      case "subcategory": {
        const pid = item.categoryId || item.category?._id, sid = item._id || item.id;
        pid && sid ? navigate(`/category/${pid}`, { state: { subcategoryId: sid } }) : navigate(`/search?q=${encodeURIComponent(item.title || item.name)}`);
        break;
      }
      case "itemtype": {
        const cs = item.category?.slug || item.category?.name?.toLowerCase().replace(/\s+/g, "-"),
          ss = item.subcategory?.slug || item.subcategory?.title?.toLowerCase().replace(/\s+/g, "-"),
          is = item.slug || item.name?.toLowerCase().replace(/\s+/g, "-");
        cs && ss && is ? navigate(`/category/${cs}/${ss}/${is}`) : navigate(`/search?q=${encodeURIComponent(item.name)}`);
        break;
      }
      default: navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => { onLogout(); setDropdownOpen(false); setMenuOpen(false); };
  const ddGo = (path) => { setDropdownOpen(false); navigate(path); };

  const profileItems = user
    ? [
      { label: "My Profile", icon: <FiUser size={16} />, path: "/profile" },
      { label: "My Orders", icon: <FiShoppingBag size={16} />, path: "/orders/my-orders" },
      { label: "My Addresses", icon: <FiMapPin size={16} />, path: "/profile" },
      { label: "Wishlist", icon: <FiHeart size={16} />, path: "/wishlist" },
      { label: "Settings", icon: <FiSettings size={16} />, path: "/settings" },
      { label: "Logout", icon: <FiLogOut size={16} />, action: handleLogout }
    ]
    : [
      { label: "Sign In", icon: <FiLock size={16} />, path: "/login" },
      { label: "Sign Up", icon: <FiUserPlus size={16} />, path: "/register" }
    ];

  const getImg = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return url.startsWith("/") ? `http://localhost:5000${url}` : `http://localhost:5000/uploads/${url}`;
  };

  const hasResults = hasSearchResults(searchResults);


const navLinks = [
  { label: "Home", to: "/", icon: <FiHome size={16} /> },
  { label: "Products", to: "/products", icon: <FiPackage size={16} /> },
  { label: "About Us", to: "/aboutus", icon: <FiInfo size={16} /> },
];

  return (
    <>
      {/* Global styles for animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease;
        }
        .animate-spin-slow {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <header className="relative z-[9999]">
        {/* Main Navigation */}
        <nav className={`bg-white border-b-2 transition-all duration-300 sticky top-0 z-50 ${scrolled ? 'border-navy-700 shadow-md' : 'border-gray-200'}`}>
          <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 hover:scale-105 transition-transform duration-200">
              <img src={logo} alt="InfraKarts" className="h-14 w-auto object-contain" />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-gray-700 hover:text-navy-700 font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 relative after:content-[''] after:absolute after:bottom-1 after:left-4 after:right-4 after:h-0.5 after:bg-orange-500 after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
                >
                  {l.icon}
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-[560px] relative" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:bg-white focus-within:border-navy-700 focus-within:shadow-md transition-all duration-200">
                  <input
                    type="text"
                    placeholder="Search products, brands, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowAutocomplete(true)}
                    className="flex-1 h-12 px-4 bg-transparent border-none outline-none text-gray-800 text-sm placeholder:text-gray-400"
                  />
                  <button type="submit" className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-navy-700 transition-colors duration-200">
                    {isSearching
                      ? <AiOutlineLoading3Quarters size={18} className="animate-spin-slow" />
                      : <FiSearch size={18} />}
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {showAutocomplete && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-[99999] max-h-[500px] overflow-y-auto">
                    {isSearching ? (
                      <div className="py-6 px-4 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                        <AiOutlineLoading3Quarters size={14} className="animate-spin-slow" />
                        Searching catalogue...
                      </div>
                    ) : !searchResults.success ? (
                      <div className="py-8 px-4 text-center text-red-500">
                        <FiAlertCircle size={24} className="mx-auto mb-2" />
                        <p>{searchResults.error || "Search failed."}</p>
                      </div>
                    ) : hasResults ? (
                      <>
                        {/* Products */}
                        {searchResults.products.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600 flex items-center gap-1.5">
                              <FiPackage size={12} />
                              Products ({searchResults.products.length})
                            </div>
                            {searchResults.products.map((p) => (
                              <button
                                key={p._id || p.id}
                                onClick={() => handleSelect("product", p)}
                                className="w-full text-left border-b border-gray-100 p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150"
                              >
                                <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {p.images?.[0] ? (
                                    <img src={getImg(p.images[0])} alt={p.name} className="w-9 h-9 object-contain" onError={(e) => (e.target.src = "https://via.placeholder.com/36")} />
                                  ) : (
                                    <FiPackage size={16} className="text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-800">{p.name || p.productName}</div>
                                  <div className="flex gap-1.5 mt-0.5 items-center">
                                    {p.brand && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p.brand}</span>}
                                    {p.category && <span className="text-xs text-gray-400">in {p.category}</span>}
                                  </div>
                                </div>
                                {p.price && <div className="text-sm font-bold text-orange-500 whitespace-nowrap">₹{p.price.toLocaleString()}</div>}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Categories */}
                        {searchResults.categories.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600 flex items-center gap-1.5">
                              <FiGrid size={12} />
                              Categories ({searchResults.categories.length})
                            </div>
                            {searchResults.categories.map((c) => (
                              <button
                                key={c._id || c.id}
                                onClick={() => handleSelect("category", c)}
                                className="w-full text-left border-b border-gray-100 p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150"
                              >
                                <div className="w-9 h-9 rounded-full bg-blue-50 text-navy-700 flex items-center justify-center flex-shrink-0">
                                  <FiGrid size={14} />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800">{c.name}</div>
                                  <div className="text-xs text-gray-400">Browse all in {c.name}</div>
                                </div>
                                <FiChevronRight size={14} className="text-gray-300" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Subcategories */}
                        {searchResults.subcategories.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600 flex items-center gap-1.5">
                              <FiTag size={12} />
                              Subcategories ({searchResults.subcategories.length})
                            </div>
                            {searchResults.subcategories.map((s) => (
                              <button
                                key={s._id || s.id}
                                onClick={() => handleSelect("subcategory", s)}
                                className="w-full text-left border-b border-gray-100 p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150"
                              >
                                <div className="w-9 h-9 rounded-full bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
                                  <FiTag size={13} />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800">{s.title || s.name}</div>
                                  <div className="text-xs text-gray-400">in {s.category?.name || "Category"}</div>
                                </div>
                                <FiChevronRight size={14} className="text-gray-300" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Item Types */}
                        {searchResults.itemTypes?.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600 flex items-center gap-1.5">
                              <FiStar size={12} />
                              Item Types ({searchResults.itemTypes.length})
                            </div>
                            {searchResults.itemTypes.map((t) => (
                              <button
                                key={t._id || t.id}
                                onClick={() => handleSelect("itemtype", t)}
                                className="w-full text-left border-b border-gray-100 p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150"
                              >
                                <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                                  <FiTarget size={13} />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800">{t.name}</div>
                                  <div className="text-xs text-gray-400">
                                    {t.subcategory?.title && `in ${t.subcategory.title}`}
                                    {t.category?.name && ` · ${t.category.name}`}
                                  </div>
                                </div>
                                <FiChevronRight size={14} className="text-gray-300" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* View All Link */}
                        <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl text-center">
                          <button
                            onClick={() => { setShowAutocomplete(false); navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }}
                            className="text-navy-700 font-semibold text-sm inline-flex items-center gap-1.5 hover:text-orange-500 transition-all duration-200 hover:gap-2"
                          >
                            View all results for "{searchQuery}"
                            <FiChevronRight size={14} />
                          </button>
                        </div>
                      </>
                    ) : searchQuery.length > 0 ? (
                      <div className="py-8 px-4 text-center">
                        <FiSearch size={32} className="mx-auto mb-3 text-gray-300" />
                        <p className="font-semibold text-gray-700 mb-1">No results for "{searchQuery}"</p>
                        <p className="text-xs text-gray-400 mb-3">Try different keywords or browse categories</p>
                        <button
                          onClick={() => { setShowAutocomplete(false); navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }}
                          className="text-navy-700 font-semibold text-sm hover:text-orange-500 transition-colors"
                        >
                          Search anyway →
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 ml-auto flex-shrink-0">
              <div className="w-px h-8 bg-gray-200" />

              {/* Cart */}
              <Link to="/cart" className="relative w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-navy-700 transition-all duration-200">
                <FiShoppingCart size={20} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-extrabold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Profile Button */}
              <button
                ref={profileBtnRef}
                type="button"
                className={`flex items-center gap-2.5 py-1.5 pl-2 pr-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-navy-700 transition-all duration-200 ${dropdownOpen ? 'bg-gray-100 border-navy-700' : ''}`}
                onClick={openProfile}
              >
                <div className="w-8.5 h-8.5 rounded-xl bg-navy-700 text-white flex items-center justify-center font-bold text-sm">
                  {user ? user.name?.charAt(0).toUpperCase() : <FiUser size={14} />}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {user ? user.name?.split(" ")[0] : "Account"}
                </span>
                <FiChevronRight
                  size={14}
                  className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-90' : ''}`}
                />
              </button>

              {/* CTA Button */}
              <Link to="/post-requirement" className="hidden sm:flex items-center gap-2 px-6 h-11 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg">
                <FiEdit2 size={16} />
                Post Requirement
              </Link>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="lg:hidden w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-navy-700 transition-all duration-200"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`lg:hidden bg-white border-t-2 border-gray-200 p-5 max-h-[calc(100vh-120px)] overflow-y-auto ${menuOpen ? 'block' : 'hidden'}`}>
          <form onSubmit={handleSearch}>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl mb-5 focus-within:border-navy-700 focus-within:shadow-md transition-all duration-200">
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowAutocomplete(true)}
                className="flex-1 h-12 px-4 bg-transparent border-none outline-none text-gray-800 text-sm"
              />
              <button type="submit" className="w-12 h-12 flex items-center justify-center text-gray-400">
                <FiSearch size={18} />
              </button>
            </div>
            {showAutocomplete && searchQuery.length > 0 && (
              <div className="mb-4 max-h-80 overflow-y-auto border border-gray-200 rounded-xl shadow-lg">
                {isSearching ? (
                  <div className="py-4 px-3 text-center text-gray-400 text-sm">Searching...</div>
                ) : hasResults ? (
                  <>
                    {searchResults.products.slice(0, 4).map((p) => (
                      <button
                        key={p._id || p.id}
                        onClick={() => { handleSelect("product", p); setMenuOpen(false); }}
                        className="w-full text-left border-b border-gray-100 p-3 flex justify-between items-center hover:bg-gray-50"
                      >
                        <span className="text-sm font-medium text-gray-800">{p.name || p.productName}</span>
                        {p.price && <span className="text-sm font-bold text-orange-500">₹{p.price.toLocaleString()}</span>}
                      </button>
                    ))}
                    {searchResults.categories.slice(0, 2).map((c) => (
                      <button
                        key={c._id || c.id}
                        onClick={() => { handleSelect("category", c); setMenuOpen(false); }}
                        className="w-full text-left border-b border-gray-100 p-3 hover:bg-gray-50"
                      >
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                      </button>
                    ))}
                    {searchResults.totalResults > 0 && (
                      <div className="p-3 bg-gray-50 text-center">
                        <button
                          onClick={() => { setShowAutocomplete(false); navigate(`/search?q=${encodeURIComponent(searchQuery)}`); setMenuOpen(false); }}
                          className="text-navy-700 font-semibold text-sm"
                        >
                          View all {searchResults.totalResults} results
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-6 px-3 text-center text-gray-400">No results for "{searchQuery}"</div>
                )}
              </div>
            )}
          </form>

          <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mt-4 mb-2 flex items-center gap-1.5">
            <FiGrid size={12} />
            Navigation
          </div>
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center justify-between py-3 text-gray-700 text-sm font-medium border-b border-gray-100 hover:text-navy-700 transition-all duration-200 hover:pl-1"
              onClick={() => setMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                {l.icon}
                {l.label}
              </span>
              <FiChevronRight size={14} className="text-gray-300" />
            </Link>
          ))}

          <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mt-4 mb-2 flex items-center gap-1.5">
            <FiUser size={12} />
            Account
          </div>
          <Link
            to="/cart"
            className="flex items-center justify-between py-3 text-gray-700 text-sm font-medium border-b border-gray-100 hover:text-navy-700 transition-all duration-200 hover:pl-1"
            onClick={() => setMenuOpen(false)}
          >
            <span className="flex items-center gap-2">
              <FiShoppingCart size={14} />
              Cart
            </span>
            {cartCount > 0 && (
              <span className="bg-orange-500 text-white rounded-full px-2 py-0.5 text-[11px] font-bold">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="flex items-center justify-between py-3 text-gray-700 text-sm font-medium border-b border-gray-100 hover:text-navy-700 transition-all duration-200 hover:pl-1" onClick={() => setMenuOpen(false)}>
                <span className="flex items-center gap-2"><FiUser size={14} />My Profile</span>
                <FiChevronRight size={14} className="text-gray-300" />
              </Link>
              <Link to="/orders/my-orders" className="flex items-center justify-between py-3 text-gray-700 text-sm font-medium border-b border-gray-100 hover:text-navy-700 transition-all duration-200 hover:pl-1" onClick={() => setMenuOpen(false)}>
                <span className="flex items-center gap-2"><FiShoppingBag size={14} />My Orders</span>
                <FiChevronRight size={14} className="text-gray-300" />
              </Link>
              <Link to="/wishlist" className="flex items-center justify-between py-3 text-gray-700 text-sm font-medium border-b border-gray-100 hover:text-navy-700 transition-all duration-200 hover:pl-1" onClick={() => setMenuOpen(false)}>
                <span className="flex items-center gap-2"><FiHeart size={14} />Wishlist</span>
                <FiChevronRight size={14} className="text-gray-300" />
              </Link>
              <button className="flex items-center justify-between w-full py-3 text-gray-700 text-sm font-medium border-b border-gray-100 hover:text-navy-700 transition-all duration-200 hover:pl-1" onClick={handleLogout}>
                <span className="flex items-center gap-2"><FiLogOut size={14} />Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center justify-between py-3 text-gray-700 text-sm font-medium border-b border-gray-100 hover:text-navy-700 transition-all duration-200 hover:pl-1" onClick={() => setMenuOpen(false)}>
                <span className="flex items-center gap-2"><FiLock size={14} />Sign In</span>
                <FiChevronRight size={14} className="text-gray-300" />
              </Link>
              <Link to="/register" className="flex items-center justify-between py-3 text-gray-700 text-sm font-medium border-b border-gray-100 hover:text-navy-700 transition-all duration-200 hover:pl-1" onClick={() => setMenuOpen(false)}>
                <span className="flex items-center gap-2"><FiUserPlus size={14} />Sign Up</span>
                <FiChevronRight size={14} className="text-gray-300" />
              </Link>
            </>
          )}
          <button
            className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all duration-200 shadow-md"
            onClick={() => { navigate("/post-requirement"); setMenuOpen(false); }}
          >
            <FiEdit2 size={16} />
            Post Requirement
          </button>
        </div>
      </header>

      {/* Profile Dropdown */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 rounded-2xl shadow-2xl w-64 z-[999999] overflow-hidden animate-slideDown"
          style={{ top: ddPos.top, right: ddPos.right }}
        >
          {user && (
            <div className="px-5 py-4 bg-navy-700">
              <div className="text-sm font-semibold text-white mb-1">{user.name}</div>
              <div className="text-[11px] text-white/60 truncate">{user.email}</div>
            </div>
          )}
          <div className="py-1">
            {profileItems.map((item, i) => (
              <button
                key={i}
                type="button"
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-navy-700 transition-all duration-150 hover:pl-6"
                onClick={item.path ? () => ddGo(item.path) : item.action}
              >
                <span className="flex items-center justify-center w-5">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}