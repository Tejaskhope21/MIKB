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
    badge: "ISO 13485 Certified",
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
  const goToSlide  = (index) => triggerSlide(() => index);

  const slide = heroSlides[currentSlide];

  return (
    <section className="w-full" style={{ background: "#f0fdfe" }}>

      {/* ── Slider ── */}
      <div className="relative w-full">

        {/* Image */}
        <div
          className="w-full flex items-center justify-center"
          style={{ background: "linear-gradient(160deg, #f0fdfe 0%, #e0f7fa 100%)" }}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            loading="eager"
            className={`
              w-full object-contain object-center
              max-h-[180px] sm:max-h-[280px] md:max-h-[400px]
              lg:max-h-[500px] xl:max-h-[580px]
              transition-opacity duration-400
              ${animating ? "opacity-0" : "opacity-100"}
            `}
          />
        </div>

        {/* Gradient overlay — deep navy instead of black */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(10,37,64,0.78) 0%, rgba(10,37,64,0.18) 50%, transparent 100%)",
          }}
        />

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
          {/* Badge — teal medical style */}
          <span
            className="
              inline-flex items-center gap-1 mb-1 sm:mb-2
              px-2 py-0.5 sm:px-3 sm:py-1
              text-[7px] sm:text-[10px] md:text-xs
              font-bold uppercase tracking-wider rounded-full shadow-md
            "
            style={{
              background: "rgba(8, 145, 178, 0.92)",
              color: "#fff",
              border: "1px solid rgba(34,211,238,0.5)",
              backdropFilter: "blur(4px)",
            }}
          >
            {/* Medical cross */}
            <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M4 0h2v4h4v2H6v4H4V6H0V4h4z"/>
            </svg>
            {slide.badge}
          </span>

          {/* Title */}
          <h1
            className="
              font-extrabold text-white leading-tight drop-shadow-lg
              text-[12px] sm:text-xl md:text-3xl lg:text-[42px]
              mb-0.5 sm:mb-1.5
            "
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p
            className="
              font-medium
              text-[9px] sm:text-sm md:text-base lg:text-lg
              mb-2 sm:mb-3 md:mb-4
              max-w-[220px] sm:max-w-sm md:max-w-lg
            "
            style={{ color: "rgba(224, 247, 250, 0.9)" }}
          >
            {slide.subtitle}
          </p>

          {/* CTA — teal gradient */}
          <a
            href="/shop"
            className="
              hidden sm:inline-flex items-center gap-1.5
              text-white font-bold
              px-4 py-2 md:px-6 md:py-2.5
              text-xs md:text-sm
              rounded-lg shadow-xl
              transition-all duration-200 hover:scale-105
            "
            style={{
              background: "linear-gradient(135deg, #0891b2, #0369a1)",
              boxShadow: "0 4px 18px rgba(8,145,178,0.45)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 24px rgba(8,145,178,0.6)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 18px rgba(8,145,178,0.45)")}
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
            w-6 h-6 sm:w-9 sm:h-9 md:w-10 md:h-10
            rounded-full flex items-center justify-center
            shadow-md transition-all duration-200
          "
          style={{
            background: "rgba(255,255,255,0.85)",
            color: "#0891b2",
            border: "1.5px solid rgba(8,145,178,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.borderColor = "#0891b2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.85)";
            e.currentTarget.style.borderColor = "rgba(8,145,178,0.2)";
          }}
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
            w-6 h-6 sm:w-9 sm:h-9 md:w-10 md:h-10
            rounded-full flex items-center justify-center
            shadow-md transition-all duration-200
          "
          style={{
            background: "rgba(255,255,255,0.85)",
            color: "#0891b2",
            border: "1.5px solid rgba(8,145,178,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.borderColor = "#0891b2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.85)";
            e.currentTarget.style.borderColor = "rgba(8,145,178,0.2)";
          }}
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
              className="rounded-full transition-all duration-300"
              style={{
                background:
                  currentSlide === index
                    ? "#0891b2"
                    : "rgba(255,255,255,0.55)",
                width:
                  currentSlide === index
                    ? window.innerWidth < 640 ? 20 : 24
                    : window.innerWidth < 640 ? 6 : 8,
                height: window.innerWidth < 640 ? 6 : 8,
                border: currentSlide === index ? "none" : "1px solid rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Trust bar below slider ── */}
      <div
        style={{
          background: "#fff",
          borderTop: "2px solid #e0f7fa",
          borderBottom: "2px solid #e0f7fa",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(16px, 4vw, 48px)",
          flexWrap: "wrap",
        }}
      >
        {[
          { icon: "🏥", label: "500+ Hospitals Served" },
          { icon: "🚚", label: "Pan India Delivery" },
          { icon: "🔬", label: "ISO 13485 Certified" },
          { icon: "📞", label: "24/7 Support" },
          { icon: "✅", label: "Genuine Products" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: "clamp(10px, 1.5vw, 13px)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              color: "#475569",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "clamp(13px, 2vw, 17px)" }}>{item.icon}</span>
            {item.label}
            {i < 4 && (
              <span
                style={{
                  width: 1,
                  height: 14,
                  background: "#e0f7fa",
                  marginLeft: "clamp(8px, 2vw, 24px)",
                  display: "inline-block",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}

export default Hero;