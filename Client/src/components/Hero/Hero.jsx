// src/components/Hero/Hero.jsx
import React, { useState, useEffect } from "react";
import b2 from "../../assets/Hero/hero1.jpg";
import b3 from "../../assets/Hero/hero2.jpg";
import b4 from "../../assets/Hero/hero3.jpg";

const heroSlides = [
  {
    imageUrl: b2,
    title: "Advanced Medical Equipment",
    subtitle: "Trusted by 500+ Hospitals Across India",
    badge: "ISO 9001 Certified",
    cta: "Explore Products",
  },
  {
    imageUrl: b3,
    title: "Surgical & Diagnostic Solutions",
    subtitle: "Precision Instruments for Better Patient Outcomes",
    badge: "24/7 After-Sales Support",
    cta: "View Catalogue",
  },
  {
    imageUrl: b4,
    title: "ICU & Critical Care Equipment",
    subtitle: "Life-Saving Technology Delivered to Your Doorstep",
    badge: "Pan India Delivery",
    cta: "Get a Quote",
  },
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      triggerSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerSlide = (getNext) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentSlide(getNext);
      setAnimating(false);
    }, 350);
  };

  const handleNext = () => triggerSlide((prev) => (prev + 1) % heroSlides.length);
  const handlePrev = () => triggerSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const goToSlide = (index) => triggerSlide(() => index);

  const slide = heroSlides[currentSlide];

  return (
    <section className="w-full bg-[#f0f4ff]">

      {/* ── Slider ── */}
      <div className="relative w-full">

        {/* Full image — object-contain so nothing is cropped */}
        <div className="w-full bg-[#f0f4ff] flex items-center justify-center">
          <img
            src={slide.imageUrl}
            alt={slide.title}
            loading="eager"
            className={`
              w-full
              object-contain object-center
              max-h-[180px] sm:max-h-[280px] md:max-h-[400px] lg:max-h-[500px] xl:max-h-[580px]
              transition-opacity duration-400
              ${animating ? "opacity-0" : "opacity-100"}
            `}
          />
        </div>

        {/* Bottom gradient for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />

        {/* ── Text Overlay ── */}
        <div
          className={`
            absolute z-20
            bottom-5 sm:bottom-7 md:bottom-10 lg:bottom-14
            left-3 sm:left-7 md:left-12 lg:left-16
            right-10 sm:right-14
            transition-all duration-400
            ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}
          `}
        >
          {/* Badge */}
          <span className="
            inline-block mb-1 sm:mb-2
            px-2 py-0.5 sm:px-3 sm:py-1
            bg-[#f97316] text-white
            text-[7px] sm:text-[10px] md:text-xs
            font-bold uppercase tracking-wider rounded-full shadow
          ">
            ✦ {slide.badge}
          </span>

          {/* Title */}
          <h1 className="
            font-extrabold text-white leading-tight drop-shadow-lg
            text-[12px] sm:text-xl md:text-3xl lg:text-[42px]
            mb-0.5 sm:mb-1.5
          ">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="
            text-white/85 font-medium
            text-[9px] sm:text-sm md:text-base lg:text-lg
            mb-2 sm:mb-3 md:mb-4
            max-w-[220px] sm:max-w-sm md:max-w-lg
          ">
            {slide.subtitle}
          </p>

          {/* CTA */}
          <a
            href="/shop"
            className="
              hidden sm:inline-flex items-center gap-1.5
              bg-[#f97316] hover:bg-orange-600
              text-white font-bold
              px-4 py-2 md:px-6 md:py-2.5
              text-xs md:text-sm
              rounded-lg shadow-xl
              transition-all duration-200 hover:scale-105
            "
          >
            {slide.cta}
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* ── Prev Arrow ── */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="
            absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 z-30
            bg-white/75 hover:bg-white text-gray-700
            w-6 h-6 sm:w-9 sm:h-9 md:w-10 md:h-10
            rounded-full flex items-center justify-center
            shadow-md transition-all duration-200
          "
        >
          <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* ── Next Arrow ── */}
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="
            absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-30
            bg-white/75 hover:bg-white text-gray-700
            w-6 h-6 sm:w-9 sm:h-9 md:w-10 md:h-10
            rounded-full flex items-center justify-center
            shadow-md transition-all duration-200
          "
        >
          <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* ── Dots ── */}
        <div className="absolute bottom-1.5 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Slide ${index + 1}`}
              className={`
                rounded-full transition-all duration-300
                ${currentSlide === index
                  ? "bg-[#f97316] w-5 h-1.5 sm:w-6 sm:h-2"
                  : "bg-white/60 hover:bg-white w-1.5 h-1.5 sm:w-2 sm:h-2"
                }
              `}
            />
          ))}
        </div>
      </div>


      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}

export default Hero;