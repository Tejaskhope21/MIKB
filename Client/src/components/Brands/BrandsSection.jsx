import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

const brands = [
  { name: 'Ambuja Cement', src: '/ba2.jpg' },
  { name: 'ACC', src: '/ba1.jpg' },
  { name: 'Baja Electricals Ltd', src: 'bb1.jpg' },
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

  // Show more than 8 if you want — here showing first 12 for better visibility
  const visibleBrands = brands.slice(0, 12);

  return (
    <section className="bg-white py-8 px-4 md:px-8 shadow-sm my-8 rounded-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Brands</h2>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition"
          >
            View All
          </Link>
        </div>

        {/* Horizontal carousel with smooth scrolling and hidden scrollbar */}
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-xl"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-10 pb-4 scrollbar-hide scroll-smooth mx-12"
            style={{
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* IE and Edge */
            }}
          >
            {/* Extra CSS for Webkit browsers (Chrome, Safari) */}
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {visibleBrands.map((brand, index) => (
              <div key={index} className="flex-shrink-0">
                <img
                  src={brand.src}
                  alt={brand.name}
                  className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-110 filter grayscale-0 hover:grayscale-0"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-xl"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;