import React, { useState, useEffect } from "react";
// import hero1 from"../../../src/assets/images/hero 1.jpg";
// import hero2 from "../../../src/assets/images/hero 2.jpg";
import b1 from "/b1.jpg"
import b2 from "/b2.jpg"
import b3 from "/b3.jpg"
import b4 from "/b4.jpg"
import b5 from "/b5.jpg"
import b6 from "/b6.png"
function Hero() {
  const heroSlides = [
    // {
    //   imageUrl: b1,

    // },
    {
      imageUrl: b2,

    },
    {
      imageUrl: b3,

    },
    {
      imageUrl: b4,

    },
    {
      imageUrl: b5,

    },
    // {
    //   imageUrl: b6,

    // },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatic slide transition
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Manual slide navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="w-full bg-[#fce4f6] text-black mt-0">
      {/* Hero Slider Section */}
      <div className="relative w-full flex items-center justify-end">
        {/* Background image */}
        <figure className="w-full relative">
          <img
            src={heroSlides[currentSlide].imageUrl}
            alt={`${heroSlides[currentSlide].title} banner`}
            className="w-full object-contain"
            loading="lazy"
          />
          {/* Navigation Buttons */}
          <button
            onClick={goToPrevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/70 text-purple-700 p-2 rounded-full hover:bg-white transition"
            aria-label="Previous slide"
          >
            &larr;
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/70 text-purple-700 p-2 rounded-full hover:bg-white transition"
            aria-label="Next slide"
          >
            &rarr;
          </button>
          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-white" : "bg-white/50"
                  } hover:bg-white/80 transition`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </figure>

        {/* Text Content */}
        <div className="absolute right-4 sm:right-8 md:right-12 lg:right-24 text-left text-white space-y-4 max-w-[90%] md:max-w-xl">
          <h1
            className="font-bold drop-shadow-md 
              text-[14px] sm:text-[16px] md:text-[33px] lg:text-[45px] xl:text-[50px]"
          >
            {heroSlides[currentSlide].title}
          </h1>
          <p className="font-medium drop-shadow-md text-[13px] sm:text-[14px] md:text-[26px] lg:text-[30px] xl:text-[32px]">
            {heroSlides[currentSlide].subtitle}
          </p>
          {/* <a
            href="/shop"
            aria-label="Navigate to shop"
            className="mt-2 bg-white text-purple-700 font-semibold px-6 py-3 text-base sm:text-lg md:text-xl rounded-xl shadow-md hover:bg-pink-100 transition hidden sm:inline-block"
          >
            {heroSlides[currentSlide].buttonText}
          </a> */}
        </div>
      </div>

      {/* Feature Strip */}
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 bg-white py-4 px-2 md:px-8 text-gray-700 text-[9px] sm:text-[11px] md:text-[13px] lg:text-[17px] xl:text-[16px] border-y border-gray-200">
        {/* <div className="flex items-center gap-2">
          <span role="img" aria-label="Return truck">🚚</span>
          7 Days Easy Return
        </div>
        <span className="hidden sm:inline">|</span>
        <div className="flex items-center gap-2">
          <span role="img" aria-label="Cash">💰</span>
          Cash on Delivery
        </div>
        <span className="hidden sm:inline">|</span>
        <div className="flex items-center gap-2">
          <span role="img" aria-label="Fire deal">🔥</span>
          Lowest Prices
        </div> */}
      </div>
    </section>
  );
}

export default Hero;