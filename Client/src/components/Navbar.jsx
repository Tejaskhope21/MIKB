import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiShoppingCart, FiSearch, FiMenu, FiX } from "react-icons/fi";
import logo from "/BricksKart.png";
import { useCart } from '../context/CartContext';
import Profile from "./Profile";

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { getCartCount } = useCart();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log("Searching for:", searchQuery);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-[#800000]">
            <div className="w-full">
                {/* Top Navbar */}
                <nav className="h-[80px] px-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center h-full">
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-[70px] w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation Center - REMOVED CATEGORIES */}
                    <div className="hidden md:flex items-center space-x-8 text-white mx-8">
                        <Link to="/" className="hover:text-gray-300 transition-colors">
                            Home
                        </Link>
                        <Link to="/brands" className="hover:text-gray-300 transition-colors">
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
                                    className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <Link to="/sellerhome" className="hover:text-gray-300 transition-colors">
                            Sell
                        </Link>
                        <Link to="/investor" className="hover:text-gray-300 transition-colors">
                            Investors
                        </Link>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                className="flex items-center gap-2 hover:text-gray-300 transition-colors"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <FiUser size={20} />
                                <span>Profile</span>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 bg-white text-gray-800 shadow-lg rounded-lg border w-60 z-50">
                                    <Profile />
                                </div>
                            )}
                        </div>

                        {/* Cart with Counter */}
                        <Link to="/cart" className="relative hover:text-gray-300 transition-colors">
                            <FiShoppingCart size={22} />
                            {getCartCount() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {getCartCount()}
                                </span>
                            )}
                        </Link>

                        {/* Post Requirement Button */}
                        <button className="bg-white text-[#800000] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                            Post Requirement
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
                    </button>
                </nav>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden bg-[#800000] border-t border-gray-600 px-4 py-4 space-y-4">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full h-12 px-4 pr-12 rounded-lg bg-white text-gray-900"
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

                        {/* Mobile Links - REMOVED CATEGORIES */}
                        <div className="space-y-3 text-white">
                            <Link to="/" className="block py-2 hover:text-gray-300" onClick={() => setMenuOpen(false)}>
                                Home
                            </Link>
                            <Link to="/brands" className="block py-2 hover:text-gray-300" onClick={() => setMenuOpen(false)}>
                                Brands
                            </Link>
                            <Link to="/sellerhome" className="block py-2 hover:text-gray-300" onClick={() => setMenuOpen(false)}>
                                Become a Supplier
                            </Link>
                            <Link to="/investor" className="block py-2 hover:text-gray-300" onClick={() => setMenuOpen(false)}>
                                Investor Relations
                            </Link>
                            <Link to="/profile" className="block py-2 hover:text-gray-300" onClick={() => setMenuOpen(false)}>
                                Profile
                            </Link>
                            <Link to="/cart" className="block py-2 hover:text-gray-300 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                                Cart
                                {getCartCount() > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                        {getCartCount()}
                                    </span>
                                )}
                            </Link>
                            <button className="w-full bg-white text-[#800000] py-3 rounded-lg font-medium mt-4">
                                Post Requirement
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}