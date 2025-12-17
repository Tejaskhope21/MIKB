import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full shadow-lg bg-gray-900 text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo with Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
            </div>
            <Link to="/">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-white">Brick's Kart</h1>
                <p className="text-xs text-gray-300">Seller Portal</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Seller Actions */}
            <div className="flex items-center space-x-4">
              <Link to="/seller-login">
                <button className="px-5 py-2.5 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-gray-800 rounded-lg transition">
                  Login
                </button>
              </Link>
              
              <Link to="/seller-register">
                <button className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition shadow-lg">
                  Start Selling
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-2xl text-white hover:text-orange-400 transition"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-gray-800 border-t border-gray-700">
          <div className="container mx-auto px-4 py-6">
            {/* Mobile Buttons */}
            <div className="flex flex-col space-y-3">
              <Link to="/seller-login" onClick={() => setIsOpen(false)}>
                <button className="w-full py-3 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-gray-700 rounded-lg transition font-medium">
                  Login
                </button>
              </Link>
              
              <Link to="/seller-register" onClick={() => setIsOpen(false)}>
                <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition font-medium">
                  Start Selling
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;