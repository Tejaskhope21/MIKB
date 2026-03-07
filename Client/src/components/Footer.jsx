import React from "react";
import logo from "/logo.png";

function Footer() {
  const teamMembers = [
    {
      name: "Lokesh Dwivedi",
      role: "CEO & Founder",
      image: "/CEO2.jpg",
    },
    {
      name: "Shashank Raut",
      role: "CTO & Co-Founder",
      image: "/CTO.jpg",
    },
    {
      name: "Vishal",
      role: "Lead Investor",
      image: "https://ui-avatars.com/api/?name=Vishal&background=7C3AED&color=fff&size=256&bold=true",
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 border-t border-gray-800">

      {/* WHY SHOP WITH US - light section */}
      <div className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-900">
            Why Choose InfraKarts?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-orange-50/40 transition-all duration-300 border border-gray-200 hover:border-orange-200 group">
              <svg
                className="w-14 h-14 mx-auto mb-5 text-orange-600 group-hover:text-orange-700 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2"
                />
              </svg>
              <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-orange-700 transition-colors">
                Wide Brand Selection
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Premium construction materials from trusted national & international brands
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-orange-50/40 transition-all duration-300 border border-gray-200 hover:border-orange-200 group">
              <svg
                className="w-14 h-14 mx-auto mb-5 text-orange-600 group-hover:text-orange-700 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v-1m9-5a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-orange-700 transition-colors">
                Best Market Prices
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Transparent pricing with no hidden charges
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-orange-50/40 transition-all duration-300 border border-gray-200 hover:border-orange-200 group">
              <svg
                className="w-14 h-14 mx-auto mb-5 text-orange-600 group-hover:text-orange-700 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-orange-700 transition-colors">
                Fast On-site Delivery
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Reliable & timely delivery to your construction site
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-orange-50/40 transition-all duration-300 border border-gray-200 hover:border-orange-200 group">
              <svg
                className="w-14 h-14 mx-auto mb-5 text-orange-600 group-hover:text-orange-700 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622z"
                />
              </svg>
              <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-orange-700 transition-colors">
                100% Genuine Products
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Certified authentic materials only
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <img src={logo} alt="InfraKarts" className="h-16 md:h-20 mb-5 lg:h-24" />
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your trusted marketplace for premium construction materials and building solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-orange-500 mb-5 text-lg">Quick Links</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="/" className="hover:text-orange-400 transition-colors">Home</a></li>
              <li><a href="/products" className="hover:text-orange-400 transition-colors">Products</a></li>
              <li><a href="/categories" className="hover:text-orange-400 transition-colors">Categories</a></li>
              <li><a href="/brands" className="hover:text-orange-400 transition-colors">Brands</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-orange-500 mb-5 text-lg">Contact Us</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <p>Nagpur, Maharashtra, India</p>
              <p>support@infrakarts.com</p>
              <p>+91 12345 67890</p>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-semibold text-orange-500 mb-5 text-lg">Policies</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-orange-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="/returns" className="hover:text-orange-400 transition-colors">Return Policy</a></li>
              <li><a href="/shipping" className="hover:text-orange-400 transition-colors">Shipping & Delivery</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} InfraKarts. All rights reserved.</p>
          <p className="mt-2 text-gray-600">
            Making construction easier, faster and more reliable.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;