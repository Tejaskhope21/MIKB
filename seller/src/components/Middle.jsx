// Middle.js
import React from "react";
import { 
  FaShieldAlt, 
  FaChartLine, 
  FaTruck, 
  FaUsers, 
  FaWallet, 
  FaHeadset 
} from "react-icons/fa";

const Middle = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Sell with <span className="text-orange-500">Brick's Kart</span>?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="group relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <FaShieldAlt className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="pt-4">
              <h3 className="text-xl font-bold mb-3 text-center">Secure Platform</h3>
              <p className="text-gray-300 text-center">
                Enterprise-grade security with encrypted transactions and data protection. Your business is safe with us.
              </p>
              <div className="mt-4 text-sm text-orange-400 font-semibold text-center">
                ISO 27001 Certified
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <FaChartLine className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="pt-4">
              <h3 className="text-xl font-bold mb-3 text-center">Business Growth</h3>
              <p className="text-gray-300 text-center">
                Access to nationwide buyers with advanced analytics and insights to optimize your sales strategy.
              </p>
              <div className="mt-4 text-sm text-green-400 font-semibold text-center">
                50K+ Active Buyers
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <FaTruck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="pt-4">
              <h3 className="text-xl font-bold mb-3 text-center">Logistics Support</h3>
              <p className="text-gray-300 text-center">
                Integrated logistics with real-time tracking and competitive shipping rates across India.
              </p>
              <div className="mt-4 text-sm text-blue-400 font-semibold text-center">
                Pan-India Delivery
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="group relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <FaUsers className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="pt-4">
              <h3 className="text-xl font-bold mb-3 text-center">Dedicated Support</h3>
              <p className="text-gray-300 text-center">
                24/7 seller support with account managers and technical assistance for seamless operations.
              </p>
              <div className="mt-4 text-sm text-purple-400 font-semibold text-center">
                Premium Support
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="group relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                <FaWallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="pt-4">
              <h3 className="text-xl font-bold mb-3 text-center">Fast Payments</h3>
              <p className="text-gray-300 text-center">
                Weekly settlements with transparent fee structure. No hidden charges or commission surprises.
              </p>
              <div className="mt-4 text-sm text-yellow-400 font-semibold text-center">
                7-Day Settlement
              </div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="group relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/10">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <FaHeadset className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="pt-4">
              <h3 className="text-xl font-bold mb-3 text-center">Easy Onboarding</h3>
              <p className="text-gray-300 text-center">
                Quick registration, easy product listing, and intuitive dashboard designed for your convenience.
              </p>
              <div className="mt-4 text-sm text-teal-400 font-semibold text-center">
                15-Min Setup
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">10K+</div>
              <div className="text-gray-300">Active Sellers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">₹500Cr+</div>
              <div className="text-gray-300">Annual GMV</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">98%</div>
              <div className="text-gray-300">Seller Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-500 mb-2">24/7</div>
              <div className="text-gray-300">Support Available</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-300 text-lg mb-6">
            Ready to grow your building materials business?
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-orange-500/30">
            Start Selling Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Middle;