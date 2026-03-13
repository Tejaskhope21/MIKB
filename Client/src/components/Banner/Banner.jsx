import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const banners = [
  {
    id: 1,
    category: "Hospital & Medical Furniture",
    title: "Healthcare Furniture Built for Comfort & Care",
    subtitle: "Premium hospital beds, examination tables, patient chairs, and medical storage solutions",
    buttonText: "Explore Medical Range",
    link: "/category/medical-furniture",
    accent: "#0ea5e9",
    bgColor: "#0a2540",
    tagline: "Medical Grade · Infection Control",
    stat1: { value: "200+", label: "Products" },
    stat2: { value: "ISO", label: "Certified" },
  },
  {
    id: 2,
    category: "Office Furniture",
    title: "Ergonomic Workspaces for Modern Professionals",
    subtitle: "Executive desks, ergonomic chairs, filing systems, and complete office setups",
    buttonText: "Shop Office Collection",
    link: "/category/office-furniture",
    accent: "#10b981",
    bgColor: "#0a2540",
    tagline: "Ergonomic · Premium Finish",
    stat1: { value: "150+", label: "Designs" },
    stat2: { value: "5 Yr", label: "Warranty" },
  },
  {
    id: 3,
    category: "School & Educational Furniture",
    title: "Creating Better Learning Environments",
    subtitle: "Classroom desks, lecture hall seating, library furniture, and laboratory tables",
    buttonText: "View Education Range",
    link: "/category/school-furniture",
    accent: "#f59e0b",
    bgColor: "#0a2540",
    tagline: "Durable · Child-Safe",
    stat1: { value: "100+", label: "Schools" },
    stat2: { value: "BIFMA", label: "Standard" },
  },
];

function Banner() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("next");
  const [progress, setProgress] = useState(0);

  const goTo = useCallback(
    (index, dir = "next") => {
      if (animating) return;
      setDirection(dir);
      setAnimating(true);
      setProgress(0);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 400);
    },
    [animating]
  );

  const goNext = useCallback(() => {
    goTo((current + 1) % banners.length, "next");
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + banners.length) % banners.length, "prev");
  }, [current, goTo]);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / 45, 100));
    }, 100);
    const timer = setTimeout(goNext, 4500);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [current, goNext]);

  const banner = banners[current];

  // Simple animations
  const fadeIn = {
    animation: animating 
      ? 'none' 
      : 'fadeInUp 0.5s ease forwards'
  };

  // Get icon based on category
  const getCategoryIcon = (category) => {
    if (category.includes("Hospital")) {
      return (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="16" y="20" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="24" y="28" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M32 20 L32 12 M28 12 L36 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="44" r="2" fill="currentColor" />
          <path d="M20 40 L24 40 M40 40 L44 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    } else if (category.includes("Office")) {
      return (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="24" width="36" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="24" y="16" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M20 48 L20 56 M44 48 L44 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 52 L44 52" stroke="currentColor" strokeWidth="2" />
          <circle cx="32" cy="32" r="2" fill="currentColor" />
          <path d="M28 40 L36 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    } else {
      return (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="20" width="28" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="28" y="44" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M18 30 L46 30" stroke="currentColor" strokeWidth="2" />
          <circle cx="32" cy="26" r="2" fill="currentColor" />
          <path d="M24 20 L24 12 M40 20 L40 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
  };

  return (
    <section className="w-full relative overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .progress-bar {
          animation: slideProgress 4.5s linear forwards;
        }
      `}</style>

      {/* Static background */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: banner.bgColor }}
      >
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Slide content */}
      <div
        className="relative z-10 w-full flex items-center"
        style={{ minHeight: "clamp(260px, 44vw, 520px)" }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-14 flex flex-col lg:flex-row items-center gap-6 lg:gap-0">

          {/* Left: Text content */}
          <div className="flex-1 text-left">

            {/* Tagline */}
            <div
              className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1 rounded-full border text-xs font-medium"
              style={{
                borderColor: `${banner.accent}40`,
                color: banner.accent,
                backgroundColor: `${banner.accent}10`,
                ...fadeIn,
                animationDelay: "0.1s"
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: banner.accent }}
              />
              {banner.tagline}
            </div>

            {/* Category */}
            <p
              className="text-white/60 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1"
              style={{ ...fadeIn, animationDelay: "0.15s" }}
            >
              {banner.category}
            </p>

            {/* Title */}
            <h2
              className="text-white font-bold leading-tight mb-3 sm:mb-4"
              style={{
                fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                maxWidth: "800px",
                ...fadeIn,
                animationDelay: "0.2s"
              }}
            >
              {banner.title}
            </h2>

            {/* Subtitle */}
            <p
              className="text-white/70 mb-5 sm:mb-7 max-w-lg text-sm sm:text-base"
              style={{ ...fadeIn, animationDelay: "0.25s" }}
            >
              {banner.subtitle}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-8" style={{ ...fadeIn, animationDelay: "0.3s" }}>
              {[banner.stat1, banner.stat2].map((s, i) => (
                <div key={i}>
                  <div
                    className="font-bold text-xl sm:text-2xl"
                    style={{ color: banner.accent }}
                  >
                    {s.value}
                  </div>
                  <div className="text-white/40 text-xs uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
              <div className="w-px h-8 bg-white/20" />
              <div>
                <div className="text-white/40 text-xs">Trusted by</div>
                <div className="text-white/80 text-xs font-semibold">
                  {banner.category.includes("Hospital") ? "500+ Hospitals" : 
                   banner.category.includes("Office") ? "1000+ Companies" : 
                   "300+ Schools"}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div style={{ ...fadeIn, animationDelay: "0.35s" }}>
              <Link to={banner.link}>
                <button
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: banner.accent }}
                >
                  {banner.buttonText}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </Link>
            </div>
          </div>

          {/* Right: Furniture Icon */}
          <div
            className="flex-shrink-0 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 text-white/80"
            style={{ 
              color: banner.accent,
              ...fadeIn,
              animationDelay: "0.4s"
            }}
          >
            {getCategoryIcon(banner.category)}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative z-20 flex items-center justify-between px-6 sm:px-10 lg:px-16 pb-5 gap-4">

        {/* Progress indicators */}
        <div className="flex items-center gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => goTo(i, i > current ? "next" : "prev")}
              aria-label={`Slide ${i + 1}`}
              className="rounded-full overflow-hidden relative transition-all duration-300"
              style={{
                width: i === current ? "2rem" : "0.4rem",
                height: "0.4rem",
                backgroundColor: i === current ? `${banner.accent}30` : "rgba(255,255,255,0.2)",
              }}
            >
              {i === current && (
                <span
                  className="absolute left-0 top-0 h-full progress-bar"
                  style={{
                    backgroundColor: banner.accent,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Counter */}
        <span className="text-white/30 text-xs">
          {String(current + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
        </span>

        {/* Navigation arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="w-8 h-8 rounded-lg flex items-center justify-center border text-white/60 hover:text-white transition-colors"
            style={{ borderColor: `${banner.accent}40` }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button
            onClick={goNext}
            aria-label="Next"
            className="w-8 h-8 rounded-lg flex items-center justify-center border text-white/60 hover:text-white transition-colors"
            style={{ borderColor: `${banner.accent}40` }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 h-full w-1 z-20"
        style={{ backgroundColor: banner.accent }}
      />
    </section>
  );
}

export default Banner;