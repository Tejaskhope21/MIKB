import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    id: 1,
    eyebrow: "Hospital & Medical Furniture",
    title: "Comfort & Care,",
    titleAccent: "Engineered for Healing",
    description:
      "Premium hospital beds, examination tables, medical cabinets, and patient chairs designed for healthcare environments.",
    cta: { label: "Explore Hospital", to: "/products" },
    ghost: { label: "View Catalog", to: "/products" },
    accent: "#f97316",
    geoLine: "#0f3060",
    geoFill: "#0d2d55",
  },
  {
    id: 2,
    eyebrow: "Office Furniture",
    title: "Work Smarter,",
    titleAccent: "Work in Comfort",
    description:
      "Ergonomic chairs, height-adjustable desks, modular workstations, and executive furniture for modern offices.",
    cta: { label: "Shop Office", to: "/products" },
    ghost: { label: "Get Quote", to: "/post-requirement" },
    accent: "#fb923c",
    geoLine: "#0e2e58",
    geoFill: "#0c2b50",
  },
  {
    id: 3,
    eyebrow: "School Furniture",
    title: "Create Better",
    titleAccent: "Learning Spaces",
    description:
      "Durable desks, ergonomic chairs, smart classrooms, library furniture, and cafeteria solutions for schools.",
    cta: { label: "Browse School", to: "/products" },
    ghost: { label: "For Institutions", to: "/contractors" },
    accent: "#fdba74",
    geoLine: "#0f3262",
    geoFill: "#0e2f5a",
  },
];

const BG = "#0a2540";
const AUTOPLAY = 5000;

// ── Geometric SVG backgrounds ─────────────────────────────────────────────────
function SlideBg({ slide }) {
  const { accent, geoLine, geoFill, id } = slide;

  if (id === 1) return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="grid1" width="56" height="56" patternUnits="userSpaceOnUse">
          <path d="M 56 0 L 0 0 0 56" fill="none" stroke={geoLine} strokeWidth="0.7"/>
        </pattern>
        <radialGradient id="rg1" cx="78%" cy="50%" r="52%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={BG} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={BG}/>
      <rect width="100%" height="100%" fill="url(#grid1)"/>
      <rect width="100%" height="100%" fill="url(#rg1)"/>
      {/* Right card block */}
      <rect x="67%" y="7%" width="28%" height="86%" rx="8" fill={geoFill}/>
      <rect x="69%" y="11%" width="24%" height="78%" rx="6" fill="none" stroke={accent} strokeWidth="0.9" strokeOpacity="0.3"/>
      {/* Corner accents */}
      <circle cx="69%" cy="11%" r="5" fill={accent} fillOpacity="0.65"/>
      <circle cx="93%" cy="89%" r="5" fill={accent} fillOpacity="0.65"/>
      <circle cx="93%" cy="11%" r="3" fill={accent} fillOpacity="0.25"/>
      <circle cx="69%" cy="89%" r="3" fill={accent} fillOpacity="0.25"/>
      {/* Inner lines */}
      <line x1="69%" y1="30%" x2="93%" y2="30%" stroke={geoLine} strokeWidth="0.6"/>
      <line x1="69%" y1="55%" x2="93%" y2="55%" stroke={geoLine} strokeWidth="0.6"/>
      <line x1="69%" y1="75%" x2="93%" y2="75%" stroke={geoLine} strokeWidth="0.6"/>
      {/* Horizontal rules */}
      <line x1="0" y1="33%" x2="64%" y2="33%" stroke={geoLine} strokeWidth="0.6"/>
      <line x1="0" y1="66%" x2="64%" y2="66%" stroke={geoLine} strokeWidth="0.6"/>
      {/* Diagonal */}
      <line x1="52%" y1="0" x2="100%" y2="100%" stroke={geoLine} strokeWidth="0.5"/>
    </svg>
  );

  if (id === 2) return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="dots2" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1.3" fill={geoLine}/>
        </pattern>
        <radialGradient id="rg2" cx="74%" cy="48%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.16"/>
          <stop offset="100%" stopColor={BG} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={BG}/>
      <rect width="100%" height="100%" fill="url(#dots2)"/>
      <rect width="100%" height="100%" fill="url(#rg2)"/>
      {/* Large diamond */}
      <polygon points="78%,8% 96%,35% 96%,65% 78%,92% 60%,65% 60%,35%"
        fill={geoFill} stroke={geoLine} strokeWidth="1"/>
      <polygon points="78%,16% 91%,37% 91%,63% 78%,84% 65%,63% 65%,37%"
        fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.28"/>
      {/* Center dot */}
      <circle cx="78%" cy="50%" r="8" fill={accent} fillOpacity="0.35"/>
      <circle cx="78%" cy="50%" r="3" fill={accent} fillOpacity="0.7"/>
      {/* Left accent bar */}
      <rect x="0" y="0" width="3" height="100%" fill={accent} fillOpacity="0.55"/>
      {/* Top & bottom rules */}
      <line x1="3" y1="18%" x2="58%" y2="18%" stroke={geoLine} strokeWidth="0.6"/>
      <line x1="3" y1="82%" x2="58%" y2="82%" stroke={geoLine} strokeWidth="0.6"/>
    </svg>
  );

  // Slide 3
  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="hatch3" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 40 L40 0" stroke={geoLine} strokeWidth="0.6" fill="none"/>
        </pattern>
        <radialGradient id="rg3" cx="76%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.14"/>
          <stop offset="100%" stopColor={BG} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={BG}/>
      <rect width="100%" height="100%" fill="url(#hatch3)"/>
      <rect width="100%" height="100%" fill="url(#rg3)"/>
      {/* Concentric circles */}
      <circle cx="80%" cy="50%" r="200" fill={geoFill}/>
      <circle cx="80%" cy="50%" r="200" fill="none" stroke={geoLine} strokeWidth="1"/>
      <circle cx="80%" cy="50%" r="145" fill="none" stroke={geoLine} strokeWidth="0.6" strokeDasharray="5 9"/>
      <circle cx="80%" cy="50%" r="90"  fill="none" stroke={accent} strokeWidth="0.9" strokeOpacity="0.3"/>
      <circle cx="80%" cy="50%" r="42"  fill={accent} fillOpacity="0.1"/>
      <circle cx="80%" cy="50%" r="14"  fill={accent} fillOpacity="0.4"/>
      {/* Cross lines */}
      <line x1="0" y1="50%" x2="100%" y2="50%" stroke={geoLine} strokeWidth="0.5"/>
      <line x1="80%" y1="0" x2="80%" y2="100%" stroke={geoLine} strokeWidth="0.5"/>
    </svg>
  );
}

// ── Main Hero ──
export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [paused, setPaused]   = useState(false);
  const lockRef = useRef(false);

  const goTo = useCallback((next) => {
    if (lockRef.current || next === current) return;
    lockRef.current = true;
    setExiting(true);
    setTimeout(() => {
      setCurrent(next);
      setExiting(false);
      setTimeout(() => { lockRef.current = false; }, 120);
    }, 360);
  }, [current]);

  const goNext = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const goPrev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(goNext, AUTOPLAY);
    return () => clearInterval(t);
  }, [goNext, paused]);

  const slide = SLIDES[current];

  return (
    <>
      <style>{`
        @keyframes heroBgIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes heroProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .hero-bg-in { animation: heroBgIn 0.6s ease both; }
      `}</style>

      <section
        className="w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* ── Slider ── */}
        <div
          className="relative overflow-hidden"
          style={{ background: BG }}
        >
          {/* Geometric background */}
          <div key={`bg-${current}`} className="absolute inset-0 hero-bg-in">
            <SlideBg slide={slide} />
          </div>

          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
            style={{ background: `linear-gradient(to top, ${BG}, transparent)` }}
          />

          {/* ── Content ── */}
          <div
            className="relative z-20 py-12 md:py-16 lg:py-20"
            style={{
              transition: "opacity 0.36s ease, transform 0.36s ease",
              opacity:   exiting ? 0 : 1,
              transform: exiting ? "translateY(16px)" : "translateY(0)",
            }}
          >
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
              <div style={{ maxWidth: 560 }}>

                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <span className="block h-px w-6 flex-shrink-0" style={{ background: slide.accent }}/>
                  <span
                    className="text-xs sm:text-sm font-semibold uppercase tracking-widest"
                    style={{ color: slide.accent }}
                  >
                    {slide.eyebrow}
                  </span>
                </div>

                {/* Heading */}
                <h1
                  className="font-extrabold leading-tight mb-2 sm:mb-3"
                  style={{
                    color: "#ffffff",
                    fontSize: "clamp(1.5rem, 4vw, 3rem)",
                    letterSpacing: "-0.015em",
                    lineHeight: 1.1,
                  }}
                >
                  {slide.title}
                  <br />
                  <span style={{ color: slide.accent }}>{slide.titleAccent}</span>
                </h1>

                {/* Description */}
                <p
                  className="text-sm sm:text-base leading-relaxed mb-4 sm:mb-5"
                  style={{ color: "rgba(255,255,255,0.55)", maxWidth: 430 }}
                >
                  {slide.description}
                </p>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={slide.cta.to}
                    className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
                    style={{ background: slide.accent, color: "#0a2540" }}
                  >
                    {slide.cta.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </Link>

                  <Link
                    to={slide.ghost.to}
                    className="inline-flex items-center gap-2 font-medium text-sm px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.14)",
                    }}
                  >
                    {slide.ghost.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Slide counter (desktop top-right) ── */}
          <div className="hidden sm:flex absolute top-5 right-6 z-30 items-center gap-3">
            <span
              className="font-bold text-2xl tabular-nums"
              style={{ color: slide.accent, lineHeight: 1 }}
            >
              0{current + 1}
            </span>
            <div className="flex flex-col gap-1">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="rounded-sm transition-all duration-300"
                  style={{
                    width:  i === current ? 24 : 14,
                    height: 2,
                    background: i === current ? slide.accent : "rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
              / 0{SLIDES.length}
            </span>
          </div>

          {/* ── Arrows ── */}
          {[
            { pos: "left-3 sm:left-5",  fn: goPrev, d: "M15 19l-7-7 7-7" },
            { pos: "right-3 sm:right-5", fn: goNext, d: "M9 5l7 7-7 7" },
          ].map(({ pos, fn, d }) => (
            <button
              key={d}
              onClick={fn}
              className={`absolute ${pos} top-1/2 -translate-y-1/2 z-30
                w-8 h-8 rounded-full flex items-center justify-center
                transition-all duration-200 hover:scale-110 active:scale-95`}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.13)",
                color: "#fff",
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d}/>
              </svg>
            </button>
          ))}

          {/* ── Mobile dots ── */}
          <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width:  i === current ? 18 : 6,
                  height: 6,
                  background: i === current ? slide.accent : "rgba(255,255,255,0.22)",
                }}
              />
            ))}
          </div>

          {/* ── Progress bar ── */}
          {!paused && (
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px] z-30"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                key={`p-${current}`}
                className="h-full origin-left"
                style={{
                  background: slide.accent,
                  animation: `heroProgress ${AUTOPLAY}ms linear forwards`,
                }}
              />
            </div>
          )}
        </div>

      </section>
    </>
  );
}