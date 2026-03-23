import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

const NAVY = "#0a2540";

const CategoryHeader = () => {
  const [categories,   setCategories]   = useState([]);
  const [activeCatId,  setActiveCatId]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const navRef     = useRef(null);
  const closeTimer = useRef(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(
          "http://localhost:5000/api/categories/public/categories",
          { headers: { Accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "API error");
        setCategories(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error("Categories:", err);
        setError("Failed to load navigation. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Close on outside click ────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveCatId(null);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Hover helpers (delayed close prevents gap flicker) ────────────────
  const openCat = useCallback((id) => {
    clearTimeout(closeTimer.current);
    setActiveCatId(id);
  }, []);

  const scheduleCatClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveCatId(null), 120);
  }, []);

  const cancelCatClose = useCallback(() => {
    clearTimeout(closeTimer.current);
  }, []);

  const closeNow = () => {
    clearTimeout(closeTimer.current);
    setActiveCatId(null);
  };

  const toSlug = (str = "") =>
    str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // ── Error State ──────────────────────────────────────────────────────────
  if (error) return (
    <nav style={{ 
      background: "#fff", 
      borderBottom: "2px solid #e2e8f0", 
      padding: "12px 20px", 
      textAlign: "center", 
      color: "#dc2626", 
      fontSize: 13 
    }}>
      {error}
    </nav>
  );

  // ── Loading State ─────────────────────────────────────────────────────────
  if (loading) return (
    <nav style={{ background: "#fff", borderBottom: "2px solid #e2e8f0" }}>
      <div style={{ 
        maxWidth: 1400, 
        margin: "0 auto", 
        padding: "0 20px", 
        height: 48, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        gap: 24
      }}>
        {[90, 130, 110, 150, 120, 100, 140].map((w, i) => (
          <div 
            key={i} 
            style={{ 
              width: w, 
              height: 10, 
              background: "#e2e8f0", 
              borderRadius: 5, 
              flexShrink: 0, 
              animation: "pulse 1.5s ease-in-out infinite", 
              animationDelay: `${i * 0.1}s` 
            }}
          />
        ))}
      </div>
    </nav>
  );

  // ── Empty State (No Categories) ─────────────────────────────────────────
  if (!categories.length) return (
    <nav style={{ 
      background: "#fff", 
      borderBottom: "2px solid #e2e8f0"
    }}>
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "0 20px",
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <p style={{
          color: "#94a3b8",
          fontSize: 13,
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <span style={{ fontSize: 16 }}>📦</span>
          No categories available
        </p>
      </div>
    </nav>
  );

  const activeCategory = categories.find((c) => c._id === activeCatId) || null;

  return (
    <>
      <style>{`
        @keyframes pulse { 
          0%, 100% { opacity: 1; } 
          50% { opacity: 0.4; } 
        }

        /* nav strip */
        .ch-nav {
          background: #fff;
          border-bottom: 2px solid #e2e8f0;
          position: relative;
          z-index: 200;
        }
        .ch-nav.has-dropdown {
          border-bottom-color: ${NAVY};
        }

        /* scrollable strip */
        .ch-strip {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .ch-strip::-webkit-scrollbar { display: none; }

        /* Center content when few items */
        .ch-strip-center {
          justify-content: center;
        }

        /* category tab */
        .ch-tab {
          display: flex;
          align-items: center;
          height: 48px;
          padding: 0 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          white-space: nowrap;
          text-decoration: none;
          color: #475569;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: color .15s, border-color .15s;
          flex-shrink: 0;
        }
        .ch-tab:hover {
          color: ${NAVY};
          border-bottom-color: #cbd5e1;
        }
        .ch-tab.active {
          color: ${NAVY};
          font-weight: 700;
          border-bottom-color: ${NAVY};
        }

        /* mega dropdown */
        .ch-mega {
          position: absolute;
          left: 0; right: 0;
          top: 100%;
          background: #fff;
          border-top: 2px solid ${NAVY};
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 16px 48px rgba(10,37,64,.14);
          z-index: 199;
        }
        .ch-mega-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 24px;
        }
        .ch-mega-grid {
          display: grid;
          gap: 24px 32px;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
        .ch-sub-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: ${NAVY};
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
          text-decoration: none;
          display: block;
          transition: opacity .15s;
        }
        .ch-sub-title:hover { opacity: 0.7; }
        .ch-item-link {
          display: block;
          font-size: 12.5px;
          color: #475569;
          text-decoration: none;
          padding: 3px 0;
          line-height: 1.5;
          transition: color .12s, padding-left .12s;
        }
        .ch-item-link:hover {
          color: ${NAVY};
          padding-left: 4px;
        }
        .ch-mega-footer {
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
          padding: 10px 24px;
        }
        .ch-mega-footer-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ch-view-all {
          font-size: 13px;
          font-weight: 600;
          color: ${NAVY};
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: opacity .15s;
        }
        .ch-view-all:hover { opacity: 0.7; }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ch-tab {
            padding: 0 12px;
            font-size: 11px;
          }
          .ch-mega-inner {
            padding: 20px 16px;
          }
          .ch-mega-grid {
            gap: 20px 24px;
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          }
        }
      `}</style>

      <nav
        ref={navRef}
        className={`ch-nav${activeCatId ? " has-dropdown" : ""}`}
      >
        {/* ── Category strip ── */}
        <div className={`ch-strip ${categories.length <= 5 ? 'ch-strip-center' : ''}`}>
          {categories.map((cat) => {
            if (!cat?._id || !cat?.name) return null;
            const isActive = activeCatId === cat._id;
            return (
              <Link
                key={cat._id}
                to={`/category/${toSlug(cat.name)}`}
                className={`ch-tab${isActive ? " active" : ""}`}
                onMouseEnter={() => openCat(cat._id)}
                onMouseLeave={scheduleCatClose}
                onClick={closeNow}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* ── Mega dropdown ── */}
        {activeCatId && activeCategory &&
         Array.isArray(activeCategory.subCategories) &&
         activeCategory.subCategories.length > 0 && (
          <div
            className="ch-mega"
            onMouseEnter={cancelCatClose}
            onMouseLeave={scheduleCatClose}
          >
            <div className="ch-mega-inner">
              <div className="ch-mega-grid">
                {activeCategory.subCategories.map((sub) => {
                  if (!sub?._id) return null;
                  const subName = sub.name || sub.title || "Unnamed";
                  const catSlug = toSlug(activeCategory.name);
                  const subSlug = toSlug(subName);

                  return (
                    <div key={sub._id}>
                      <Link
                        to={`/category/${catSlug}/${subSlug}`}
                        className="ch-sub-title"
                        onClick={closeNow}
                      >
                        {subName}
                      </Link>
                      {Array.isArray(sub.items) && sub.items.length > 0 ? (
                        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                          {sub.items.map((item) => {
                            if (!item?._id || !item?.name) return null;
                            return (
                              <li key={item._id}>
                                <Link
                                  to={`/category/${catSlug}/${subSlug}/${toSlug(item.name)}`}
                                  className="ch-item-link"
                                  onClick={closeNow}
                                >
                                  {item.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p style={{ 
                          fontSize: 11, 
                          color: "#94a3b8", 
                          fontStyle: "italic", 
                          margin: 0,
                          padding: "4px 0"
                        }}>
                          No items available
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="ch-mega-footer">
              <div className="ch-mega-footer-inner">
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  {activeCategory.subCategories.length} subcategories in{" "}
                  <strong style={{ color: NAVY }}>{activeCategory.name}</strong>
                </span>
                <Link
                  to={`/category/${toSlug(activeCategory.name)}`}
                  className="ch-view-all"
                  onClick={closeNow}
                >
                  View all in {activeCategory.name} →
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default CategoryHeader;