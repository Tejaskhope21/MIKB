import React from "react";
import { 
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaHeadset
} from "react-icons/fa";

const SellerFooter = () => {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12">
          
          {/* Company Info */}
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Brick's Kart</h2>
                <p className="text-gray-300 text-sm">Seller Portal</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed text-sm">
              Professional building materials marketplace platform for sellers. 
              Manage your business efficiently with our comprehensive seller tools.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <FaHeadset className="mr-2 text-orange-400" />
              Contact Support
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FaPhone className="text-green-400 mt-1" />
                <div>
                  <p className="font-semibold">Support</p>
                  <p className="text-gray-300">1800-123-4567</p>
                  <p className="text-sm text-gray-400">9 AM - 9 PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FaEnvelope className="text-orange-400 mt-1" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-gray-300">support@brickskart.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-blue-400 mt-1" />
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-gray-300">Mumbai, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <FaShieldAlt className="mr-2 text-blue-400" />
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-orange-400 transition block py-1">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-300 hover:text-orange-400 transition block py-1">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/seller-agreement" className="text-gray-300 hover:text-orange-400 transition block py-1">
                  Seller Agreement
                </a>
              </li>
              <li>
                <a href="/refund" className="text-gray-300 hover:text-orange-400 transition block py-1">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2023 Brick's Kart Seller Portal. All rights reserved.
            </div>
            
            <div className="text-gray-400 text-sm">
              <span className="text-orange-400">v1.0.0</span> • Last updated: Dec 2023
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SellerFooter;