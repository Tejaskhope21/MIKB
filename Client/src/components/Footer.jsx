import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white mt-12">
      {/* WHY SHOP WITH US - light section */}
      <div className="py-8 border-b" style={{ backgroundColor: "#f8fafd", borderColor: "#0A254010" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: "#0A2540" }}>
            Why Choose MIKB?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-5 rounded-xl transition-all duration-300 group" style={{ backgroundColor: "#ffffff", borderColor: "#0A254010", borderWidth: "1px" }}>
              <svg
                className="w-12 h-12 mx-auto mb-4 transition-colors"
                style={{ color: "#0A2540" }}
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
              <h4 className="font-bold text-base mb-2 transition-colors group-hover:opacity-80" style={{ color: "#0A2540" }}>
                Wide Brand Selection
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "#0A254080" }}>
                Premium construction materials from trusted brands
              </p>
            </div>

            <div className="text-center p-5 rounded-xl transition-all duration-300 group" style={{ backgroundColor: "#ffffff", borderColor: "#0A254010", borderWidth: "1px" }}>
              <svg
                className="w-12 h-12 mx-auto mb-4 transition-colors"
                style={{ color: "#0A2540" }}
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
              <h4 className="font-bold text-base mb-2 transition-colors group-hover:opacity-80" style={{ color: "#0A2540" }}>
                Best Market Prices
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "#0A254080" }}>
                Transparent pricing with no hidden charges
              </p>
            </div>

            <div className="text-center p-5 rounded-xl transition-all duration-300 group" style={{ backgroundColor: "#ffffff", borderColor: "#0A254010", borderWidth: "1px" }}>
              <svg
                className="w-12 h-12 mx-auto mb-4 transition-colors"
                style={{ color: "#0A2540" }}
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
              <h4 className="font-bold text-base mb-2 transition-colors group-hover:opacity-80" style={{ color: "#0A2540" }}>
                Fast On-site Delivery
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "#0A254080" }}>
                Reliable & timely delivery to your site
              </p>
            </div>

            <div className="text-center p-5 rounded-xl transition-all duration-300 group" style={{ backgroundColor: "#ffffff", borderColor: "#0A254010", borderWidth: "1px" }}>
              <svg
                className="w-12 h-12 mx-auto mb-4 transition-colors"
                style={{ color: "#0A2540" }}
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
              <h4 className="font-bold text-base mb-2 transition-colors group-hover:opacity-80" style={{ color: "#0A2540" }}>
                100% Genuine Products
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "#0A254080" }}>
                Certified authentic materials only
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER CONTENT - Dark section with white text */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <img src={logo} alt="MIKB" className="h-16 md:h-20 mb-4" />
            <p className="text-white/70 text-xs leading-relaxed">
              Your trusted marketplace for premium construction materials and building solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm text-white">Quick Links</h3>
            <ul className="space-y-2 text-white/70 text-xs">
              <li>
                <button onClick={() => navigate("/")} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/products")} className="hover:text-white transition-colors">
                  Products
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/aboutus")} className="hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/contact")} className="hover:text-white transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold mb-4 text-sm text-white">Contact Us</h3>
            <div className="space-y-2 text-white/70 text-xs">
              <p>Nagpur, Maharashtra, India</p>
              <p>support@MIKB.com</p>
              <p>+91 12345 67890</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Designer Credit */}
        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: "#ffffff20" }}>
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} MIKB. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-white/50">
            Designed & Developed by{' '}
            <a 
              href="https://ssinfotech.co" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              SS Infotech
            </a>
          </p>
          <p className="mt-1 text-xs text-white/40">
            Making construction easier, faster and more reliable.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;