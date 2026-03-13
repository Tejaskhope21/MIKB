// components/Navbar.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiShoppingCart,
  FiSearch,
  FiMenu,
  FiX,
  FiLogOut,
  FiPackage,
  FiGrid,
  FiTag,
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import logo from "/logo.png";
import { useCart } from "../context/CartContext";
import { searchAutocomplete, hasSearchResults } from "../services/api";
import "../index.css";

/* ─── Pulse Line ─────────────────────────────────────────────────── */
const PulseLine = () => (
  <svg
    viewBox="0 0 200 30"
    style={{ position:"absolute", bottom:0, left:0, width:"100%", opacity:0.07, pointerEvents:"none" }}
    preserveAspectRatio="none"
  >
    <polyline
      points="0,15 30,15 40,5 50,25 60,8 70,22 80,15 110,15 120,3 130,27 140,10 150,20 160,15 200,15"
      fill="none" stroke="#0891b2" strokeWidth="2"
    />
  </svg>
);

/* ─── Debounce ───────────────────────────────────────────────────── */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function Navbar({ user, onLogout }) {
  const [searchQuery, setSearchQuery]     = useState("");
  const [menuOpen, setMenuOpen]           = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearching, setIsSearching]     = useState(false);
  const [cartCount, setCartCount]         = useState(0);
  const [searchResults, setSearchResults] = useState({
    success: true, products: [], categories: [],
    subcategories: [], itemTypes: [], query: "", totalResults: 0,
  });

  const { getCartCount } = useCart();
  const navigate          = useNavigate();
  const searchRef         = useRef(null);
  const searchInputRef    = useRef(null);
  const profileWrapRef    = useRef(null); // wraps BOTH button + dropdown
  const closeTimer        = useRef(null);

  /* ── cart count ─────────────────────────────────────────────── */
  useEffect(() => {
    const upd = () => setCartCount(getCartCount());
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, [getCartCount]);

  /* ── search debounce ─────────────────────────────────────────── */
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.length) {
        setSearchResults({ success:true, products:[], categories:[], subcategories:[], itemTypes:[], query:"", totalResults:0 });
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchAutocomplete(query, 8);
        setSearchResults(results);
      } catch (err) {
        setSearchResults({ success:false, products:[], categories:[], subcategories:[], itemTypes:[], query, totalResults:0, error: err.message });
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      debouncedSearch(searchQuery);
      setShowAutocomplete(true);
    } else {
      setSearchResults({ success:true, products:[], categories:[], subcategories:[], itemTypes:[], query:"", totalResults:0 });
      setShowAutocomplete(false);
    }
  }, [searchQuery, debouncedSearch]);

  /* ── click outside search ────────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowAutocomplete(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── profile dropdown: open/close with safe gap ──────────────── */
  const openDropdown  = () => { clearTimeout(closeTimer.current); setDropdownOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setDropdownOpen(false), 120); };

  /* ── handlers ────────────────────────────────────────────────── */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowAutocomplete(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAutocompleteSelect = (type, item) => {
    setSearchQuery(""); setShowAutocomplete(false); setMenuOpen(false);
    switch (type) {
      case "product": {
        const id = item.numericId || item._id || item.id;
        id ? navigate(`/product/${id}`) : navigate(`/search?q=${encodeURIComponent(item.name || item.productName)}`);
        break;
      }
      case "category": {
        const id = item.numericId || item._id || item.id;
        id ? navigate(`/category/${id}`, { state:{ categoryName: item.name } }) : navigate(`/search?q=${encodeURIComponent(item.name)}`);
        break;
      }
      case "subcategory": {
        const pid = item.categoryId || item.category?._id || item.category?.id;
        const sid = item._id || item.id || item.numericId;
        pid && sid
          ? navigate(`/category/${pid}`, { state:{ categoryName: item.category?.name, subcategoryName: item.title || item.name, subcategoryId: sid } })
          : navigate(`/search?q=${encodeURIComponent(item.title || item.name)}`);
        break;
      }
      case "itemtype": {
        const cs = item.category?.slug   || item.category?.name?.toLowerCase().replace(/\s+/g,"-");
        const ss = item.subcategory?.slug || item.subcategory?.title?.toLowerCase().replace(/\s+/g,"-");
        const is = item.slug              || item.name?.toLowerCase().replace(/\s+/g,"-");
        cs && ss && is ? navigate(`/category/${cs}/${ss}/${is}`) : navigate(`/search?q=${encodeURIComponent(item.name)}`);
        break;
      }
      default: navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => { onLogout(); setDropdownOpen(false); setMenuOpen(false); };

  const profileItems = user
    ? [
        { label:"My Profile",   path:"/profile" },
        { label:"My Orders",    path:"/orders/my-orders" },
        { label:"My Addresses", path:"/profile" },
        { label:"Logout", action: handleLogout, icon:<FiLogOut size={14} style={{marginRight:8}}/> },
      ]
    : [
        { label:"Sign In",  path:"/login" },
        { label:"Sign Up",  path:"/register" },
      ];

  const getValidImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:image")) return url;
    if (url.startsWith("/")) return `http://localhost:5000${url}`;
    return `http://localhost:5000/uploads/${url}`;
  };

  const hasSuccessfulResults = hasSearchResults(searchResults);

  /* ─── CSS ──────────────────────────────────────────────────────── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap');

    :root{
      --navy:#0a2540; --navy2:#0d3060;
      --teal:#0891b2; --teal-d:#0369a1; --teal-l:#22d3ee;
      --sky:#e0f7fa;  --sky2:#f0fdfe;
      --red:#dc2626;
      --g50:#f8fafc; --g100:#f1f5f9; --g200:#e2e8f0;
      --g400:#94a3b8; --g600:#475569; --g700:#334155; --g800:#1e293b;
    }
    *{box-sizing:border-box;}
    .hc{font-family:'DM Sans',sans-serif;}

    /* ── alert bar ── */
    .hc-alert{
      background:var(--navy); color:#94a3b8;
      font-size:11.5px; letter-spacing:.04em;
      padding:5px 24px;
      display:flex; align-items:center; justify-content:space-between;
      flex-wrap:wrap; gap:4px;
    }
    .hc-alert a{color:var(--teal-l);text-decoration:none;}
    .hc-alert a:hover{text-decoration:underline;}

    /* ── main nav ── */
    .hc-nav{
      background:#fff;
      border-bottom:2px solid var(--sky);
      position:relative; overflow:visible;
    }
    .hc-nav-row{
      max-width:1440px; margin:0 auto; padding:0 20px;
      height:68px; display:flex; align-items:center; gap:16px;
    }

    /* logo */
    .hc-logo{display:flex;align-items:center;flex-shrink:0;text-decoration:none;}
    .hc-logo img{height:48px;width:auto;object-fit:contain;}
    .hc-logo-pill{
      display:inline-flex;align-items:center;gap:4px;
      background:var(--sky);color:var(--teal);
      font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
      padding:3px 8px;border-radius:20px;margin-left:8px;border:1px solid #a5f3fc;
      white-space:nowrap;
    }

    /* nav links */
    .hc-links{display:flex;align-items:center;gap:24px;flex-shrink:0;}
    .hc-links a,.hc-links button{
      color:var(--g600);text-decoration:none;background:none;border:none;
      font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;
      cursor:pointer;padding:2px 0;position:relative;transition:color .18s;
    }
    .hc-links a::after,.hc-links button::after{
      content:'';position:absolute;bottom:-2px;left:0;right:0;
      height:2px;background:var(--teal);border-radius:2px;
      transform:scaleX(0);transition:transform .18s;
    }
    .hc-links a:hover,.hc-links button:hover{color:var(--teal);}
    .hc-links a:hover::after,.hc-links button:hover::after{transform:scaleX(1);}

    /* search */
    .hc-search{position:relative;flex:1;max-width:500px;}
    .hc-search input{
      width:100%;height:42px;padding:0 46px 0 16px;
      border:1.5px solid var(--g200);border-radius:8px;
      font-family:'DM Sans',sans-serif;font-size:14px;color:var(--g800);
      background:var(--g50);outline:none;
      transition:border-color .2s,box-shadow .2s;
    }
    .hc-search input::placeholder{color:var(--g400);}
    .hc-search input:focus{
      border-color:var(--teal);background:#fff;
      box-shadow:0 0 0 3px rgba(8,145,178,.12);
    }
    .hc-search-btn{
      position:absolute;right:12px;top:50%;transform:translateY(-50%);
      background:none;border:none;cursor:pointer;color:var(--g400);
      display:flex;align-items:center;transition:color .2s;
    }
    .hc-search-btn:hover{color:var(--teal);}

    /* autocomplete */
    .hc-ac{
      position:absolute;top:calc(100% + 8px);left:0;right:0;
      background:#fff;border:1.5px solid var(--g200);border-radius:12px;
      box-shadow:0 20px 50px rgba(10,37,64,.14);z-index:200;
      max-height:480px;overflow-y:auto;
    }
    .hc-ac-label{
      padding:9px 16px 7px;font-size:10.5px;font-weight:700;
      letter-spacing:.08em;text-transform:uppercase;
      color:var(--teal);background:var(--sky2);
      border-bottom:1px solid var(--sky);
    }
    .hc-ac-row{
      width:100%;text-align:left;background:none;border:none;
      padding:10px 16px;display:flex;align-items:center;gap:12px;
      cursor:pointer;border-bottom:1px solid var(--g100);
      transition:background .12s;font-family:'DM Sans',sans-serif;
    }
    .hc-ac-row:last-child{border-bottom:none;}
    .hc-ac-row:hover{background:var(--sky2);}
    .hc-ac-row:hover .hc-ac-name{color:var(--teal);}
    .hc-ac-thumb{
      width:42px;height:42px;background:var(--sky);border-radius:8px;
      display:flex;align-items:center;justify-content:center;
      flex-shrink:0;border:1px solid #a5f3fc;
    }
    .hc-ac-thumb img{width:34px;height:34px;object-fit:contain;}
    .hc-ac-icon{
      width:34px;height:34px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
    }
    .hc-ac-icon.cat{background:#dbeafe;color:#1d4ed8;}
    .hc-ac-icon.sub{background:#dcfce7;color:#15803d;}
    .hc-ac-icon.typ{background:#ede9fe;color:#7c3aed;}
    .hc-ac-name{font-size:13.5px;font-weight:500;color:var(--g800);transition:color .12s;}
    .hc-ac-meta{font-size:11px;color:var(--g400);margin-top:2px;}
    .hc-ac-price{margin-left:auto;font-size:13px;font-weight:600;color:var(--teal);white-space:nowrap;}
    .hc-ac-badge{display:inline-block;font-size:10px;background:var(--sky);color:var(--teal);border-radius:4px;padding:2px 5px;}
    .hc-ac-verified{display:inline-flex;align-items:center;color:#15803d;font-size:10px;font-weight:600;}
    .hc-ac-foot{
      padding:11px 16px;background:var(--g50);
      border-top:1px solid var(--g200);text-align:center;
    }
    .hc-ac-foot button{
      background:none;border:none;cursor:pointer;
      color:var(--teal);font-family:'DM Sans',sans-serif;
      font-size:13px;font-weight:600;
      display:inline-flex;align-items:center;gap:6px;
    }
    .hc-ac-foot button:hover{opacity:.75;}
    .hc-ac-empty{padding:36px 16px;text-align:center;color:var(--g400);font-size:14px;}
    .hc-ac-loading{padding:28px 16px;text-align:center;color:var(--g400);font-size:14px;}

    /* actions row */
    .hc-actions{display:flex;align-items:center;gap:16px;margin-left:auto;}

    /* cart */
    .hc-cart{
      position:relative;background:none;border:none;cursor:pointer;
      color:var(--g600);display:flex;align-items:center;
      text-decoration:none;transition:color .18s;
    }
    .hc-cart:hover{color:var(--teal);}
    .hc-cart-badge{
      position:absolute;top:-6px;right:-6px;
      background:var(--red);color:#fff;
      font-size:9.5px;font-weight:700;min-width:17px;height:17px;
      border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 3px;
    }

    /* profile wrapper — THE KEY FIX: single hover zone covers button+dropdown */
    .hc-profile-wrap{position:relative;}
    .hc-profile-btn{
      display:flex;align-items:center;gap:8px;
      background:none;border:none;cursor:pointer;
      color:var(--g700);font-family:'DM Sans',sans-serif;
      font-size:14px;font-weight:500;transition:color .18s;
      padding:4px 0;
    }
    .hc-profile-btn:hover{color:var(--teal);}
    .hc-avatar{
      width:34px;height:34px;border-radius:50%;
      background:var(--sky);color:var(--teal);
      border:2px solid #a5f3fc;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:13px;flex-shrink:0;
    }

    /* dropdown — sits directly under profile-wrap, no gap */
    .hc-dd{
      position:absolute;right:0;top:100%;
      background:#fff;border:1.5px solid var(--g200);
      border-radius:12px;
      box-shadow:0 20px 50px rgba(10,37,64,.15);
      width:230px;z-index:300;overflow:hidden;
      /* NO margin-top — zero gap so mouse can travel straight down */
    }
    .hc-dd-head{
      padding:14px 16px;
      background:linear-gradient(135deg,#0a2540,#0d3060);
      color:#fff;
    }
    .hc-dd-head p:first-child{font-weight:600;font-size:14px;}
    .hc-dd-head p:last-child{font-size:11.5px;color:#94a3b8;margin-top:2px;}
    .hc-dd a,.hc-dd button{
      display:flex;align-items:center;padding:10px 16px;
      font-size:13.5px;color:var(--g700);text-decoration:none;
      background:none;border:none;width:100%;text-align:left;
      cursor:pointer;font-family:'DM Sans',sans-serif;
      transition:background .12s,color .12s;
    }
    .hc-dd a:hover,.hc-dd button:hover{background:var(--sky2);color:var(--teal);}

    /* cta */
    .hc-cta{
      background:linear-gradient(135deg,var(--teal),var(--teal-d));
      color:#fff;border:none;border-radius:8px;padding:9px 16px;
      font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;
      cursor:pointer;display:flex;align-items:center;gap:7px;
      box-shadow:0 4px 14px rgba(8,145,178,.3);
      transition:box-shadow .2s,transform .15s;white-space:nowrap;
    }
    .hc-cta:hover{box-shadow:0 6px 20px rgba(8,145,178,.45);transform:translateY(-1px);}

    /* hamburger */
    .hc-ham{background:none;border:none;cursor:pointer;color:var(--g700);display:none;}

    /* mobile menu */
    .hc-mob{background:#fff;border-top:2px solid var(--sky);padding:18px 20px 24px;}
    .hc-mob-label{
      font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
      color:var(--teal);margin:14px 0 7px;
    }
    .hc-mob-link{
      display:flex;align-items:center;justify-content:space-between;
      padding:10px 0;color:var(--g700);text-decoration:none;
      font-size:15px;font-weight:500;
      border-bottom:1px solid var(--g100);
      background:none;border-left:none;border-right:none;border-top:none;
      width:100%;text-align:left;cursor:pointer;
      font-family:'DM Sans',sans-serif;transition:color .18s;
    }
    .hc-mob-link:hover{color:var(--teal);}
    .hc-mob-cta{
      margin-top:16px;
      background:linear-gradient(135deg,var(--teal),var(--teal-d));
      color:#fff;border:none;border-radius:10px;width:100%;padding:13px;
      font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;
      cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
      box-shadow:0 4px 14px rgba(8,145,178,.28);
    }

    /* responsive */
    @media(max-width:1100px){ .hc-links.desktop{display:none;} }
    @media(max-width:900px){  .hc-search{display:none;} }
    @media(max-width:768px){
      .hc-alert{display:none;}
      .hc-links.quick{display:none;}
      .hc-cta{display:none!important;}
      .hc-ham{display:flex!important;}
    }
  `;

  const CrossIcon = () => (
    <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor">
      <path d="M4 0h2v4h4v2H6v4H4V6H0V4h4z"/>
    </svg>
  );
  const ChevronIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
    </svg>
  );
  const ArrowIcon = () => (
    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
    </svg>
  );

  return (
    <>
      <style>{css}</style>
      <header className="hc" style={{ position:"sticky", top:0, zIndex:50 }}>

        {/* ── Alert bar ─────────────────────────────────────────── */}
        <div className="hc-alert">
          <span>🏥 Trusted Medical Equipment Supplier — ISO 13485 Certified</span>
          <span>
            24/7 Support: <a href="tel:18001234567">1800-123-4567</a>
            &nbsp;|&nbsp;<a href="/track-order">Track Order</a>
            &nbsp;|&nbsp;<a href="/service-centers">Service Centers</a>
          </span>
        </div>

        {/* ── Main nav ──────────────────────────────────────────── */}
        <nav className="hc-nav">
          <PulseLine />
          <div className="hc-nav-row">

            {/* Logo */}
            <Link to="/" className="hc-logo">
              <img src={logo} alt="MediKart" />
              <span className="hc-logo-pill"><CrossIcon /> Medical</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hc-links desktop">
              <Link to="/">Home</Link>
              <Link to="/products">Products</Link>
              <Link to="/brands">Brands</Link>
            </div>

            {/* Search */}
            <div className="hc-search" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search medical equipment, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowAutocomplete(true)}
                />
                <button type="submit" className="hc-search-btn">
                  {isSearching
                    ? <AiOutlineLoading3Quarters className="animate-spin" size={17} style={{color:"var(--teal)"}}/>
                    : <FiSearch size={17}/>
                  }
                </button>

                {/* Autocomplete dropdown */}
                {showAutocomplete && (
                  <div className="hc-ac">
                    {isSearching ? (
                      <div className="hc-ac-loading">
                        <AiOutlineLoading3Quarters style={{display:"inline",marginRight:8,color:"var(--teal)"}}/>
                        Searching medical catalogue...
                      </div>
                    ) : !searchResults.success ? (
                      <div className="hc-ac-empty" style={{color:"#dc2626"}}>
                        {searchResults.error || "Search failed. Please try again."}
                      </div>
                    ) : hasSuccessfulResults ? (
                      <>
                        {searchResults.products.length > 0 && (
                          <div>
                            <div className="hc-ac-label">🩺 Equipment ({searchResults.products.length})</div>
                            {searchResults.products.map((p) => (
                              <button key={p._id||p.id||p.numericId} onClick={() => handleAutocompleteSelect("product",p)} className="hc-ac-row">
                                <div className="hc-ac-thumb">
                                  {p.images?.[0]
                                    ? <img src={getValidImageUrl(p.images[0])} alt={p.name} onError={(e)=>(e.target.src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=80&h=80&fit=crop")}/>
                                    : <FiPackage size={18} style={{color:"var(--teal)"}}/>
                                  }
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div className="hc-ac-name">{p.name||p.productName}</div>
                                  <div style={{display:"flex",gap:5,marginTop:3,flexWrap:"wrap"}}>
                                    {p.brand && <span className="hc-ac-badge">{p.brand}</span>}
                                    {p.category && <span className="hc-ac-meta">in {p.category}</span>}
                                    <span className="hc-ac-verified">✓ Certified</span>
                                  </div>
                                </div>
                                {p.price && <div className="hc-ac-price">₹{p.price.toLocaleString()}</div>}
                              </button>
                            ))}
                          </div>
                        )}

                        {searchResults.categories.length > 0 && (
                          <div>
                            <div className="hc-ac-label">📂 Categories ({searchResults.categories.length})</div>
                            {searchResults.categories.map((c) => (
                              <button key={c._id||c.id||c.numericId} onClick={() => handleAutocompleteSelect("category",c)} className="hc-ac-row">
                                <div className="hc-ac-icon cat"><FiGrid size={15}/></div>
                                <div style={{flex:1}}>
                                  <div className="hc-ac-name">{c.name}</div>
                                  <div className="hc-ac-meta">Browse all in {c.name}</div>
                                </div>
                                <ChevronIcon/>
                              </button>
                            ))}
                          </div>
                        )}

                        {searchResults.subcategories.length > 0 && (
                          <div>
                            <div className="hc-ac-label">🗂 Subcategories ({searchResults.subcategories.length})</div>
                            {searchResults.subcategories.map((s) => (
                              <button key={s._id||s.id||s.numericId} onClick={() => handleAutocompleteSelect("subcategory",s)} className="hc-ac-row">
                                <div className="hc-ac-icon sub"><FiTag size={13}/></div>
                                <div style={{flex:1}}>
                                  <div className="hc-ac-name">{s.title||s.name}</div>
                                  <div className="hc-ac-meta">in {s.category?.name||"Category"}</div>
                                </div>
                                <ChevronIcon/>
                              </button>
                            ))}
                          </div>
                        )}

                        {searchResults.itemTypes?.length > 0 && (
                          <div>
                            <div className="hc-ac-label">🔬 Item Types ({searchResults.itemTypes.length})</div>
                            {searchResults.itemTypes.map((t) => (
                              <button key={t._id||t.id||t.numericId} onClick={() => handleAutocompleteSelect("itemtype",t)} className="hc-ac-row">
                                <div className="hc-ac-icon typ"><FiGrid size={13}/></div>
                                <div style={{flex:1}}>
                                  <div className="hc-ac-name">{t.name}</div>
                                  <div className="hc-ac-meta">
                                    {t.subcategory?.title && `in ${t.subcategory.title}`}
                                    {t.category?.name && ` • ${t.category.name}`}
                                  </div>
                                </div>
                                <ChevronIcon/>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="hc-ac-foot">
                          <button onClick={() => { setShowAutocomplete(false); navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }}>
                            View all results for "{searchQuery}" <ArrowIcon/>
                          </button>
                        </div>
                      </>
                    ) : searchQuery.length > 0 ? (
                      <div className="hc-ac-empty">
                        <div style={{fontSize:28,marginBottom:8}}>🔬</div>
                        <p style={{fontWeight:600,color:"var(--g800)"}}>No results for "{searchQuery}"</p>
                        <p style={{fontSize:12,marginTop:5}}>Try different keywords or check spelling</p>
                        <button onClick={() => { setShowAutocomplete(false); navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }}
                          style={{marginTop:10,background:"none",border:"none",color:"var(--teal)",cursor:"pointer",fontWeight:600,fontFamily:"DM Sans,sans-serif"}}>
                          Search anyway →
                        </button>
                      </div>
                    ) : (
                      <div className="hc-ac-empty">Start typing to search medical equipment...</div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Right actions */}
            <div className="hc-actions">

              {/* Quick links */}
              <div className="hc-links quick">
                <button onClick={() => navigate("/contractors")}>Contractors</button>
                <button onClick={() => navigate("/seller")}>Seller</button>
                <Link to="/investors">Investors</Link>
              </div>

              {/* Cart */}
              <Link to="/cart" className="hc-cart">
                <FiShoppingCart size={22}/>
                {cartCount > 0 && (
                  <span className="hc-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
                )}
              </Link>

              {/* ── Profile dropdown ────────────────────────────── */}
              {/* 
                FIX: onMouseEnter/Leave on the WRAPPER div, not split
                between button and dropdown. The wrapper covers both,
                so moving from button → dropdown never leaves the zone.
                A 120ms close timer prevents flicker on fast mouse exits.
              */}
              <div
                className="hc-profile-wrap"
                ref={profileWrapRef}
                onMouseEnter={openDropdown}
                onMouseLeave={scheduleClose}
              >
                <button className="hc-profile-btn" onClick={() => setDropdownOpen((v) => !v)}>
                  <div className="hc-avatar">
                    {user ? user.name?.charAt(0).toUpperCase() : <FiUser size={15}/>}
                  </div>
                  <span>{user ? user.name?.split(" ")[0] : "Account"}</span>
                </button>

                {dropdownOpen && (
                  <div className="hc-dd">
                    {user && (
                      <div className="hc-dd-head">
                        <p>{user.name}</p>
                        <p>{user.email}</p>
                      </div>
                    )}
                    <div style={{padding:"5px 0"}}>
                      {profileItems.map((item, i) =>
                        item.path ? (
                          <Link key={i} to={item.path} onClick={() => setDropdownOpen(false)}>
                            {item.label}
                          </Link>
                        ) : (
                          <button key={i} onClick={item.action}>
                            {item.icon}{item.label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* ── end profile dropdown ─────────────────────────── */}

              {/* CTA */}
              <button className="hc-cta" onClick={() => navigate("/post-requirement")}>
                <CrossIcon/> Post Requirement
              </button>

              {/* Hamburger */}
              <button className="hc-ham" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
                {menuOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
              </button>
            </div>
          </div>
        </nav>

        {/* ── Mobile menu ───────────────────────────────────────── */}
        {menuOpen && (
          <div className="hc-mob">
            {/* Mobile search */}
            <div style={{position:"relative",marginBottom:4}} ref={searchRef}>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  style={{
                    width:"100%", height:42, padding:"0 44px 0 14px",
                    border:"1.5px solid var(--g200)", borderRadius:8,
                    fontFamily:"DM Sans,sans-serif", fontSize:14,
                    color:"var(--g800)", background:"var(--g50)", outline:"none",
                  }}
                  placeholder="Search medical equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowAutocomplete(true)}
                />
                <button type="submit" style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--g400)",display:"flex"}}>
                  <FiSearch size={17}/>
                </button>
              </form>

              {showAutocomplete && searchQuery.length > 0 && (
                <div className="hc-ac" style={{maxHeight:320}}>
                  {isSearching ? (
                    <div className="hc-ac-loading"><AiOutlineLoading3Quarters style={{display:"inline",marginRight:8}}/>Searching...</div>
                  ) : hasSuccessfulResults ? (
                    <div>
                      {searchResults.products.slice(0,3).map((p) => (
                        <button key={p._id||p.id} onClick={() => { handleAutocompleteSelect("product",p); setMenuOpen(false); }} className="hc-ac-row">
                          <div className="hc-ac-name">{p.name||p.productName}</div>
                        </button>
                      ))}
                      {searchResults.categories.slice(0,2).map((c) => (
                        <button key={c._id||c.id} onClick={() => { handleAutocompleteSelect("category",c); setMenuOpen(false); }} className="hc-ac-row">
                          <div className="hc-ac-name">{c.name}</div>
                        </button>
                      ))}
                      {searchResults.totalResults > 0 && (
                        <div className="hc-ac-foot">
                          <button onClick={() => { setShowAutocomplete(false); navigate(`/search?q=${encodeURIComponent(searchQuery)}`); setMenuOpen(false); }}>
                            View all {searchResults.totalResults} results
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="hc-ac-empty">No results for "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>

            <div className="hc-mob-label">Navigation</div>
            <Link to="/" className="hc-mob-link" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/products" className="hc-mob-link" onClick={() => setMenuOpen(false)}>Products</Link>
            <Link to="/brands" className="hc-mob-link" onClick={() => setMenuOpen(false)}>Brands</Link>

            <div className="hc-mob-label">Services</div>
            <button className="hc-mob-link" onClick={() => { navigate("/contractors"); setMenuOpen(false); }}>Contractors</button>
            <button className="hc-mob-link" onClick={() => { navigate("/seller"); setMenuOpen(false); }}>Seller</button>
            <Link to="/investors" className="hc-mob-link" onClick={() => setMenuOpen(false)}>Investors</Link>

            <div className="hc-mob-label">Account</div>
            <Link to="/cart" className="hc-mob-link" onClick={() => setMenuOpen(false)}>
              Cart
              {cartCount > 0 && (
                <span style={{background:"var(--red)",color:"#fff",borderRadius:12,padding:"2px 8px",fontSize:11,fontWeight:700}}>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link to="/profile" className="hc-mob-link" onClick={() => setMenuOpen(false)}>My Profile</Link>
                <Link to="/orders/my-orders" className="hc-mob-link" onClick={() => setMenuOpen(false)}>My Orders</Link>
                <button className="hc-mob-link" onClick={handleLogout} style={{gap:8}}>
                  <FiLogOut size={14}/> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hc-mob-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="hc-mob-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}

            <button className="hc-mob-cta" onClick={() => { navigate("/post-requirement"); setMenuOpen(false); }}>
              <CrossIcon/> Post Medical Requirement
            </button>
          </div>
        )}
      </header>
    </>
  );
}