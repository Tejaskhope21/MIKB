// components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiShoppingCart, FiSearch, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import logo from "/BricksKart.png";
import { useCart } from '../context/CartContext';
import "../index.css"

export default function Navbar({ user, onLogout }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);
    const dropdownRef = useRef(null);
    const profileButtonRef = useRef(null);

    useEffect(() => {
        setCartCount(getCartCount());
    }, [getCartCount]);

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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log("Searching for:", searchQuery);
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        onLogout();
        setDropdownOpen(false);
        setMenuOpen(false);
    };

    const profileItems = user ? [
        { label: "My Profile", path: "/profile" },
        { label: "My Orders", path: "/orders" },
        { label: "My Addresses", path: "/profile?tab=addresses" },
        { label: "Logout", action: handleLogout, icon: <FiLogOut className="mr-2" /> }
    ] : [
        { label: "Sign In", path: "/login" },
        { label: "Sign Up", path: "/register" }
    ];

    return (
        <header className="sticky top-0 z-100 bg-[#800000] shadow-lg"> {/* Changed from z-50 to z-100 */}
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
                    <div className="hidden md:flex items-center space-x-8 text-white mx-8">
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

                    {/* Search Bar (Desktop) */}
                    <div className="hidden lg:flex flex-1 max-w-lg mx-4">
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products, brands, categories..."
                                    className="w-full h-12 px-4 pr-12 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    <FiSearch size={20} />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Side Icons */}
                    <div className="hidden md:flex items-center space-x-6 text-white">
                        <Link to="/login" className="hover:text-gray-300 transition-colors font-medium">
                            Sell
                        </Link>
                        <Link to="/investor" className="hover:text-gray-300 transition-colors font-medium">
                            Investors
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
                                    className="absolute top-full right-0 mt-2 bg-white text-gray-800 shadow-lg rounded-sm border w-60 z-100" // Changed from z-50 to z-100
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
                                                        className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors font-medium"
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ) : (
                                                    <button
                                                        key={index}
                                                        onClick={item.action}
                                                        className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center font-medium"
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

                        {/* Cart with Counter */}
                        <Link to="/cart" className="relative hover:text-gray-300 transition-colors">
                            <FiShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Post Requirement Button */}
                        <button
                            onClick={() => navigate('/post-requirement')}
                            className="bg-white text-[#800000] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-sm"
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
                    <div className="md:hidden bg-[#800000] border-t border-gray-600 px-4 py-4 space-y-4" style={{ zIndex: 100 }}>
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full h-12 px-4 pr-12 rounded-lg bg-white text-gray-900 border-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                                >
                                    <FiSearch size={20} />
                                </button>
                            </div>
                        </form>

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

                            {user && (
                                <>
                                    <Link to="/profile" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                        My Profile
                                    </Link>
                                    <Link to="/orders" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                        My Orders
                                    </Link>
                                </>
                            )}

                            <Link to="/login" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                Become a Supplier
                            </Link>
                            <Link to="/investor" className="block py-2 hover:text-gray-300 font-medium" onClick={() => setMenuOpen(false)}>
                                Investor Relations
                            </Link>

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

                            <Link to="/cart" className="block py-2 hover:text-gray-300 flex items-center gap-2 font-medium" onClick={() => setMenuOpen(false)}>
                                Cart
                                {cartCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            <button
                                onClick={() => {
                                    navigate('/post-requirement');
                                    setMenuOpen(false);
                                }}
                                className="w-full bg-white text-[#800000] py-3 rounded-lg font-medium mt-4 shadow-sm"
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