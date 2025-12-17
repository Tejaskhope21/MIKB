import React from "react";

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            Brick's Kart Seller Portal
          </h1>
          <p className="text-gray-300 text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional platform for building materials sellers
          </p>
          <div className="mt-8 md:mt-12 border-t border-gray-700 pt-8 md:pt-12">
            <p className="text-gray-400 text-sm md:text-base mb-4">Your dashboard is ready</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <div className="px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-orange-400 font-semibold">Manage Products</div>
              </div>
              <div className="px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-green-400 font-semibold">Track Orders</div>
              </div>
              <div className="px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-blue-400 font-semibold">View Analytics</div>
              </div>
              <div className="px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-purple-400 font-semibold">Get Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;