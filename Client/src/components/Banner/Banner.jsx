import React from "react";
import { Link } from "react-router-dom"; // Import from react-router-dom
import b1 from "/offer4.gif";
import b2 from "/offer5.gif";
import b3 from "/offer6.gif";

function Banner() {
  const banners = [
    {
      id: 1,
      image: b1,
      alt: "Electrical Promotion",
      category: "Electrical",
      title: "Deals Of The Day",
      buttonText: "Shop Now",
      bgColor: "from-blue-600/90 to-blue-800/90",
      link: "/category/electricals", // Matches your category slug
    },
    {
      id: 2,
      image: b2,
      alt: "Hardware & Fixtures Promotion",
      category: "Hardware & Fixtures",
      title: "Deals Of The Day",
      buttonText: "Shop Now",
      bgColor: "from-red-600/90 to-red-800/90",
      link: "/category/hardware", // Matches your "Hardware" slug
    },
    {
      id: 3,
      image: b3,
      alt: "Plumbing Promotion",
      category: "Plumbing",
      title: "Deals Of The Day",
      buttonText: "Shop Now",
      bgColor: "from-green-600/90 to-green-800/90",
      link: "/category/plumbing", // Matches your "Plumbing" slug
    },
  ];

  return (
    <section className="w-full bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
        {banners.map((banner) => (
          <div key={banner.id} className="w-full relative overflow-hidden">
            {/* Banner Image */}
            <div className="w-full h-[150px] sm:h-[180px] md:h-[200px] lg:h-[280px]">
              <img
                src={banner.image}
                alt={banner.alt}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Dark Overlay for Better Text Readability */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 md:p-6">
              {/* Top Content */}
              <div className="text-left">
                <div className="text-white text-sm sm:text-base md:text-lg font-semibold mb-1 drop-shadow-md">
                  {banner.category}
                </div>
                <div className="text-white text-base sm:text-lg md:text-xl font-bold drop-shadow-lg">
                  {banner.title}
                </div>
              </div>

              {/* Shop Now Button with Link */}
              <div className="text-left">
                <Link to={banner.link}>
                  <button
                    className={`
                      px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5
                      bg-gradient-to-r ${banner.bgColor}
                      text-white font-bold text-sm sm:text-base md:text-lg
                      rounded-lg
                      shadow-lg
                      hover:shadow-2xl
                      transition-all duration-300
                      transform hover:scale-105 active:scale-95
                      inline-flex items-center gap-2
                    `}
                  >
                    {banner.buttonText}
                    <span className="text-lg">→</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Banner;