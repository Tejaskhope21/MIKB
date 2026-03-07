import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

const brands = [
  { name: 'Ambuja Cement', src: '/ba2.jpg' },
  { name: 'ACC', src: '/ba1.jpg' },
  { name: 'Baja Electricals Ltd', src: '/bb1.jpg' },
  { name: 'Baja Tiles', src: '/bb2.jpg' },
  { name: 'CERA', src: '/bc1.jpg' },
  { name: 'Century', src: '/bc2.jpg' },
  { name: 'Dalmia', src: '/bd1.jpg' },
  { name: 'Dulux', src: '/bd2.jpg' },
  { name: 'ECOLITE', src: '/be1.jpg' },
  { name: 'ecostone', src: '/be2.jpg' },
  { name: 'Fenesta', src: '/bf1.png' },
  { name: 'Finolex', src: '/bf2.jpg' },
  { name: 'Gooreg', src: '/bg1.jpg' },
  { name: 'Goldmedal', src: '/bg2.jpg' },
  { name: 'Havells', src: '/bh1.jpg' },
  { name: 'Hardwyn', src: '/bh2.jpg' },
  { name: 'I-Len Ply', src: '/bi1.png' },
  { name: 'Icon', src: '/bi2.png' },
  { name: 'JR', src: '/bj1.jpg' },
  { name: 'Jaquar', src: '/bj2.jpg' },
  { name: 'KEL', src: '/bk1.jpg' },
  { name: 'Kankai', src: '/bk2.jpg' },
  { name: 'Lafarge', src: '/bl1.jpg' },
  { name: 'Legrand', src: '/bl2.jpg' },
  { name: 'Magicrete', src: '/bm1.jpg' },
  { name: 'Mayur', src: '/bm2.jpg' },
  { name: 'NagarJunaCement', src: '/bn1.jpg' },
  { name: 'Nippon Paint', src: '/bn2.jpg' },
  { name: 'Om Sai Tmi', src: '/bo1.jpg' },
  { name: 'ONE PLUS-1', src: '/bo2.png' },
  { name: 'Panasonic', src: '/bp1.jpg' },
  { name: 'Parasakti', src: '/bp2.jpg' },
  { name: 'QUBA', src: '/bq.png' },
  { name: 'RRKABAL', src: '/br1.jpg' },
  { name: 'RAK', src: '/br2.jpg' },
  { name: 'Sagar Cement', src: '/bs1.jpg' },
  { name: 'Sagar Cement', src: '/bs2.jpg' },
  { name: 'TATA TISON', src: '/br1.jpg' },
  { name: 'TATA CEMENT', src: '/bt2.jpg' },
  { name: 'Uniply', src: '/bu2.jpg' },
  { name: 'V-GUARD', src: '/bv1.jpg' },
  { name: 'VECTUS', src: '/bv2.png' },
  { name: 'Wipro', src: '/bw1.jpg' },
  { name: 'Weber', src: '/bw2.png' },
  { name: 'Yale', src: '/by1.png' },
  { name: 'Zuari Cement', src: '/bz1.jpg' },
];

const BrandsSection = () => {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth',
      });
    }
  };

  // Showing first 16 brands
  const visibleBrands = brands.slice(0, 16);

  return (
    <section className="bg-white py-10 px-4 md:px-8 my-8 rounded-xl shadow-sm border border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Trusted Brands
          </h2>
          <Link
            to="/products"
            className="bg-orange-600 text-white px-7 py-3 rounded-lg text-base font-medium hover:bg-orange-700 active:bg-orange-800 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            View All Brands
          </Link>
        </div>

        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-orange-50 hover:shadow-xl hover:scale-105 active:scale-95"
            aria-label="Scroll left"
          >
            <svg
              className="w-7 h-7 text-gray-700 group-hover:text-orange-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Scrollable brands container - scrollbar completely hidden */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-8 md:gap-10 pb-6 scroll-smooth px-4 sm:px-12 hide-scrollbar"
          >
            {visibleBrands.map((brand, index) => (
              <div
                key={index}
                className="flex-shrink-0 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 hover:border-orange-200/60 transition-all duration-300 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] flex items-center justify-center h-28 sm:h-32">
                  <img
                    src={brand.src}
                    alt={brand.name}
                    className="max-h-20 max-w-full object-contain transition-all duration-400 hover:brightness-110"
                    loading="lazy"
                  />
                </div>
                <p className="text-center mt-3 text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">
                  {brand.name}
                </p>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-orange-50 hover:shadow-xl hover:scale-105 active:scale-95"
            aria-label="Scroll right"
          >
            <svg
              className="w-7 h-7 text-gray-700 group-hover:text-orange-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Global scrollbar hiding styles */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;       /* IE and Edge */
          scrollbar-width: none;          /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;                  /* Chrome, Safari, Opera */
        }
      `}</style>
    </section>
  );
};

export default BrandsSection;