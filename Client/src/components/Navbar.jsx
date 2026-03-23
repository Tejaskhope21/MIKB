import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser, FiShoppingCart, FiSearch, FiMenu, FiX,
  FiLogOut, FiPackage, FiGrid, FiTag, FiChevronRight,
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import logo from "/logo.png";
import { useCart } from "../context/CartContext";
import { searchAutocomplete, hasSearchResults } from "../services/api";

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

const NAVY   = "#0a2540";
const ACCENT = "#f97316";

export default function Navbar({ user, onLogout }) {
  const [searchQuery,      setSearchQuery]      = useState("");
  const [menuOpen,         setMenuOpen]         = useState(false);
  const [dropdownOpen,     setDropdownOpen]     = useState(false);
  const [ddPos,            setDdPos]            = useState({ top: 0, right: 0 });
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearching,      setIsSearching]      = useState(false);
  const [cartCount,        setCartCount]        = useState(0);
  const [scrolled,         setScrolled]         = useState(false);
  const [searchResults,    setSearchResults]    = useState({
    success: true, products: [], categories: [],
    subcategories: [], itemTypes: [], query: "", totalResults: 0,
  });

  const { getCartCount } = useCart();
  const navigate         = useNavigate();
  const searchRef        = useRef(null);
  const profileBtnRef    = useRef(null);
  const dropdownRef      = useRef(null);

  // ── scroll shadow ──────────────────────────────────────────────────────
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // ── cart count ─────────────────────────────────────────────────────────
  useEffect(() => {
    const upd = () => setCartCount(getCartCount());
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, [getCartCount]);

  // ── recalculate dropdown position on scroll/resize ─────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    const recalc = () => {
      if (!profileBtnRef.current) return;
      const r = profileBtnRef.current.getBoundingClientRect();
      setDdPos({
        top:   r.bottom + 8,
        right: window.innerWidth - r.right,
      });
    };
    recalc();
    window.addEventListener("scroll",  recalc, { passive: true });
    window.addEventListener("resize",  recalc);
    return () => {
      window.removeEventListener("scroll", recalc);
      window.removeEventListener("resize", recalc);
    };
  }, [dropdownOpen]);

  // ── close dropdown on outside click ───────────────────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    const h = (e) => {
      const clickedBtn = profileBtnRef.current?.contains(e.target);
      const clickedDd  = dropdownRef.current?.contains(e.target);
      if (!clickedBtn && !clickedDd) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [dropdownOpen]);

  // ── close search on outside click ─────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowAutocomplete(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── search ─────────────────────────────────────────────────────────────
  const debouncedSearch = useCallback(
    debounce(async (q) => {
      if (!q.length) {
        setSearchResults({ success:true, products:[], categories:[], subcategories:[], itemTypes:[], query:"", totalResults:0 });
        setIsSearching(false); return;
      }
      setIsSearching(true);
      try {
        const res = await searchAutocomplete(q, 8);
        setSearchResults(res);
      } catch (err) {
        setSearchResults({ success:false, products:[], categories:[], subcategories:[], itemTypes:[], query:q, totalResults:0, error: err.message });
      } finally { setIsSearching(false); }
    }, 300), []
  );

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      debouncedSearch(searchQuery); setShowAutocomplete(true);
    } else {
      setSearchResults({ success:true, products:[], categories:[], subcategories:[], itemTypes:[], query:"", totalResults:0 });
      setShowAutocomplete(false);
    }
  }, [searchQuery, debouncedSearch]);

  // ── handlers ───────────────────────────────────────────────────────────
  const openProfile = () => {
    if (!profileBtnRef.current) return;
    const r = profileBtnRef.current.getBoundingClientRect();
    setDdPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    setDropdownOpen((v) => !v);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { setShowAutocomplete(false); navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }
  };

  const handleSelect = (type, item) => {
    setSearchQuery(""); setShowAutocomplete(false); setMenuOpen(false);
    switch (type) {
      case "product": { const id = item.numericId||item._id||item.id; id ? navigate(`/product/${id}`) : navigate(`/search?q=${encodeURIComponent(item.name||item.productName)}`); break; }
      case "category": { const id = item.numericId||item._id||item.id; id ? navigate(`/category/${id}`,{state:{categoryName:item.name}}) : navigate(`/search?q=${encodeURIComponent(item.name)}`); break; }
      case "subcategory": { const pid=item.categoryId||item.category?._id, sid=item._id||item.id; pid&&sid ? navigate(`/category/${pid}`,{state:{subcategoryId:sid}}) : navigate(`/search?q=${encodeURIComponent(item.title||item.name)}`); break; }
      case "itemtype": { const cs=item.category?.slug||item.category?.name?.toLowerCase().replace(/\s+/g,"-"), ss=item.subcategory?.slug||item.subcategory?.title?.toLowerCase().replace(/\s+/g,"-"), is=item.slug||item.name?.toLowerCase().replace(/\s+/g,"-"); cs&&ss&&is ? navigate(`/category/${cs}/${ss}/${is}`) : navigate(`/search?q=${encodeURIComponent(item.name)}`); break; }
      default: navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => { onLogout(); setDropdownOpen(false); setMenuOpen(false); };
  const ddGo = (path) => { setDropdownOpen(false); navigate(path); };

  const profileItems = user
    ? [ {label:"My Profile",icon:"👤",path:"/profile"}, {label:"My Orders",icon:"📦",path:"/orders/my-orders"}, {label:"My Addresses",icon:"📍",path:"/profile"}, {label:"Logout",icon:"🚪",action:handleLogout} ]
    : [ {label:"Sign In",icon:"🔑",path:"/login"}, {label:"Sign Up",icon:"✨",path:"/register"} ];

  const getImg = (url) => {
    if (!url) return null;
    if (url.startsWith("http")||url.startsWith("data:")) return url;
    return url.startsWith("/") ? `http://localhost:5000${url}` : `http://localhost:5000/uploads/${url}`;
  };

  const hasResults = hasSearchResults(searchResults);
  const navLinks = [
    {label:"Home",to:"/"},{label:"Products",to:"/products"},
    {label:"Brands",to:"/brands"},{label:"Contractors",to:"/contractors"},{label:"Investors",to:"/investors"},
  ];

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;}

        .nb-top{background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:5px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px;font-size:11.5px;color:#64748b;}
        .nb-top a{color:${NAVY};text-decoration:none;font-weight:500;transition:opacity .18s;}
        .nb-top a:hover{opacity:.7;}
        .nb-top-r{display:flex;align-items:center;gap:14px;}
        .nb-top-r span{color:#cbd5e1;}

        /* The <header> itself gets position+z-index so its stacking context
           is always above CategoryHeader regardless of DOM order             */
        .nb-header{
          position: relative;
          z-index: 9999;
        }

        .nb-nav{
          background:#fff;
          border-bottom:2px solid #e2e8f0;
          position:sticky;
          top:0;
          transition:box-shadow .25s,border-color .25s;
        }
        .nb-nav.scrolled{box-shadow:0 2px 18px rgba(10,37,64,.1);border-bottom-color:${NAVY};}

        .nb-row{max-width:1400px;margin:0 auto;padding:0 20px;height:64px;display:flex;align-items:center;gap:16px;}

        .nb-logo{display:flex;align-items:center;text-decoration:none;flex-shrink:0;}
        .nb-logo img{height:42px;width:auto;object-fit:contain;}

        .nb-links{display:flex;align-items:center;gap:2px;flex-shrink:0;}
        .nb-link{color:${NAVY};text-decoration:none;font-size:13.5px;font-weight:500;padding:6px 11px;border-radius:7px;position:relative;white-space:nowrap;transition:color .15s,background .15s;}
        .nb-link::after{content:'';position:absolute;bottom:3px;left:11px;right:11px;height:2px;background:${NAVY};border-radius:2px;transform:scaleX(0);transition:transform .2s;}
        .nb-link:hover{color:${NAVY};background:#eef2f8;}
        .nb-link:hover::after{transform:scaleX(1);}

        .nb-search{flex:1;max-width:460px;position:relative;}
        .nb-sinput{display:flex;align-items:center;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:9px;overflow:hidden;transition:border-color .2s,box-shadow .2s,background .2s;}
        .nb-sinput:focus-within{background:#fff;border-color:${NAVY};box-shadow:0 0 0 3px rgba(10,37,64,.09);}
        .nb-sinput input{flex:1;height:40px;padding:0 12px;background:transparent;border:none;outline:none;color:${NAVY};font-size:13.5px;}
        .nb-sinput input::placeholder{color:#94a3b8;}
        .nb-sbtn{width:40px;height:40px;background:none;border:none;cursor:pointer;color:#94a3b8;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:color .18s;}
        .nb-sbtn:hover{color:${NAVY};}

        /* Autocomplete — position:absolute within search div */
        .nb-ac{position:absolute;top:calc(100% + 7px);left:0;right:0;background:#fff;border:1.5px solid #e2e8f0;border-radius:13px;box-shadow:0 20px 56px rgba(10,37,64,.14);z-index:99999;max-height:480px;overflow-y:auto;}
        .nb-ac-lbl{padding:8px 14px 6px;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${NAVY};background:#f0f4f9;border-bottom:1px solid #e2e8f0;}
        .nb-ac-row{width:100%;text-align:left;background:none;border:none;border-bottom:1px solid #f1f5f9;padding:10px 14px;display:flex;align-items:center;gap:11px;cursor:pointer;transition:background .1s;}
        .nb-ac-row:last-child{border-bottom:none;}
        .nb-ac-row:hover{background:#f5f8fc;}
        .nb-ac-row:hover .nb-ac-name{color:${NAVY};}
        .nb-ac-thumb{width:38px;height:38px;border-radius:8px;background:#f1f5f9;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;}
        .nb-ac-thumb img{width:32px;height:32px;object-fit:contain;}
        .nb-ac-ico{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .nb-ac-ico.cat{background:#dbeafe;color:${NAVY};}
        .nb-ac-ico.sub{background:#dcfce7;color:#15803d;}
        .nb-ac-ico.typ{background:#ede9fe;color:#7c3aed;}
        .nb-ac-name{font-size:13px;font-weight:500;color:#1e293b;transition:color .1s;}
        .nb-ac-meta{font-size:11px;color:#94a3b8;margin-top:1px;}
        .nb-ac-price{margin-left:auto;font-size:12.5px;font-weight:700;color:${ACCENT};white-space:nowrap;}
        .nb-ac-badge{display:inline-block;font-size:10px;background:#e0ecf8;color:${NAVY};border-radius:4px;padding:1px 5px;font-weight:600;}
        .nb-ac-foot{padding:10px 14px;background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 13px 13px;text-align:center;}
        .nb-ac-foot button{background:none;border:none;cursor:pointer;color:${NAVY};font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:5px;transition:opacity .15s;}
        .nb-ac-foot button:hover{opacity:.7;}
        .nb-ac-empty{padding:28px 14px;text-align:center;color:#94a3b8;font-size:13.5px;}
        .nb-ac-spin{padding:22px 14px;text-align:center;color:#94a3b8;font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;}

        .nb-actions{display:flex;align-items:center;gap:6px;margin-left:auto;flex-shrink:0;}

        .nb-ibtn{width:38px;height:38px;border-radius:9px;background:#f1f5f9;border:1.5px solid #e2e8f0;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${NAVY};text-decoration:none;transition:background .15s,border-color .15s;position:relative;flex-shrink:0;}
        .nb-ibtn:hover{background:#e4eaf4;border-color:${NAVY};}

        .nb-badge{position:absolute;top:-5px;right:-5px;background:${ACCENT};color:#fff;font-size:9px;font-weight:800;min-width:17px;height:17px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid #fff;}

        .nb-pbtn{display:flex;align-items:center;gap:8px;padding:4px 12px 4px 5px;border-radius:9px;background:#f1f5f9;border:1.5px solid #e2e8f0;cursor:pointer;color:${NAVY};font-size:13px;font-weight:500;transition:background .15s,border-color .15s;flex-shrink:0;user-select:none;}
        .nb-pbtn:hover,.nb-pbtn.open{background:#e4eaf4;border-color:${NAVY};}
        .nb-avatar{width:28px;height:28px;border-radius:7px;background:${NAVY};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;pointer-events:none;}

        /* Profile dropdown rendered as position:fixed — escapes ALL stacking contexts */
        .nb-dd{
          position:fixed;
          background:#fff;
          border:1.5px solid #e2e8f0;
          border-radius:13px;
          box-shadow:0 20px 56px rgba(10,37,64,.22);
          width:215px;
          z-index:999999;
          overflow:hidden;
          animation:ddIn .18s ease both;
        }
        @keyframes ddIn{from{opacity:0;transform:translateY(-6px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);}}
        .nb-dd-head{padding:13px 15px;background:${NAVY};}
        .nb-dd-name{font-size:13.5px;font-weight:600;color:#fff;}
        .nb-dd-email{font-size:11px;color:rgba(255,255,255,.4);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .nb-ddi{display:flex;align-items:center;gap:9px;padding:11px 15px;font-size:13px;color:${NAVY};text-decoration:none;background:none;border:none;width:100%;text-align:left;cursor:pointer;transition:background .1s;border-bottom:1px solid #f1f5f9;}
        .nb-ddi:last-child{border-bottom:none;}
        .nb-ddi:hover{background:#eef2f8;}
        .nb-ddi-icon{font-size:14px;flex-shrink:0;pointer-events:none;}

        .nb-cta{display:flex;align-items:center;gap:6px;padding:0 16px;height:38px;border-radius:9px;background:${NAVY};color:#fff;font-size:13px;font-weight:600;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;text-decoration:none;transition:background .18s,transform .15s,box-shadow .18s;box-shadow:0 3px 10px rgba(10,37,64,.22);}
        .nb-cta:hover{background:#0d3060;transform:translateY(-1px);box-shadow:0 5px 16px rgba(10,37,64,.32);}
        .nb-cta:active{transform:translateY(0);}

        .nb-sep{width:1px;height:20px;background:#e2e8f0;flex-shrink:0;}

        .nb-rl{display:flex;align-items:center;gap:2px;flex-shrink:0;}
        .nb-rl a{padding:5px 10px;border-radius:7px;font-size:12.5px;font-weight:500;color:#64748b;text-decoration:none;border:1px solid transparent;transition:color .15s,border-color .15s,background .15s;}
        .nb-rl a:hover{color:${NAVY};border-color:#c8d5e8;background:#eef2f8;}

        .nb-mob{background:#fff;border-top:2px solid #e2e8f0;padding:14px 18px 22px;}
        .nb-msearch{display:flex;align-items:center;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:9px;overflow:hidden;margin-bottom:14px;}
        .nb-msearch:focus-within{border-color:${NAVY};}
        .nb-msearch input{flex:1;height:42px;padding:0 12px;background:transparent;border:none;outline:none;color:${NAVY};font-size:14px;}
        .nb-msearch input::placeholder{color:#94a3b8;}
        .nb-msearch button{width:42px;height:42px;background:none;border:none;cursor:pointer;color:#94a3b8;display:flex;align-items:center;justify-content:center;}
        .nb-ml{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;margin:14px 0 6px 2px;}
        .nb-mlink{display:flex;align-items:center;justify-content:space-between;padding:11px 2px;color:${NAVY};font-size:14.5px;font-weight:500;text-decoration:none;border-bottom:1px solid #f1f5f9;background:none;border-left:none;border-right:none;border-top:none;width:100%;text-align:left;cursor:pointer;transition:opacity .15s;}
        .nb-mlink:hover{opacity:.7;}
        .nb-mlink:last-child{border-bottom:none;}
        .nb-mcta{margin-top:18px;display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:13px;border-radius:11px;background:${NAVY};color:#fff;font-size:14.5px;font-weight:700;border:none;cursor:pointer;box-shadow:0 3px 12px rgba(10,37,64,.22);transition:background .18s;}
        .nb-mcta:hover{background:#0d3060;}

        @media(max-width:1100px){.nb-links{display:none;}}
        @media(max-width:860px){.nb-search{display:none;}.nb-rl{display:none;}}
        @media(max-width:640px){.nb-cta{display:none!important;}.nb-top{display:none;}}
        @media(min-width:641px){.nb-ham{display:none!important;}.nb-mob{display:none!important;}}
      `}</style>

      {/* KEY FIX: <header> gets position:relative + z-index so its stacking
          context is above CategoryHeader regardless of DOM order            */}
      <header className="nb-header">

        {/* ── Top bar ── */}
        <div className="nb-top">
          <span>🏗️ InfraKarts — India's Construction Materials Marketplace</span>
          <div className="nb-top-r">
            <a href="tel:18001234567">📞 1800-123-4567</a>
            <span>|</span>
            <a href="/track-order">Track Order</a>
            <span>|</span>
            <a href="/post-requirement">Sell on InfraKarts</a>
          </div>
        </div>

        {/* ── Main nav ── */}
        <nav className={`nb-nav${scrolled ? " scrolled" : ""}`}>
          <div className="nb-row">

            <Link to="/" className="nb-logo">
              <img src={logo} alt="InfraKarts"/>
            </Link>

            <div className="nb-links">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className="nb-link">{l.label}</Link>
              ))}
            </div>

            {/* Search */}
            <div className="nb-search" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="nb-sinput">
                  <input
                    type="text"
                    placeholder="Search products, brands, categories…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowAutocomplete(true)}
                  />
                  <button type="submit" className="nb-sbtn">
                    {isSearching
                      ? <AiOutlineLoading3Quarters size={16} style={{color:NAVY,animation:"spin 1s linear infinite"}}/>
                      : <FiSearch size={16}/>}
                  </button>
                </div>

                {showAutocomplete && (
                  <div className="nb-ac">
                    {isSearching ? (
                      <div className="nb-ac-spin"><AiOutlineLoading3Quarters size={14} style={{color:NAVY}}/>Searching catalogue…</div>
                    ) : !searchResults.success ? (
                      <div className="nb-ac-empty" style={{color:"#dc2626"}}>{searchResults.error||"Search failed."}</div>
                    ) : hasResults ? (
                      <>
                        {searchResults.products.length > 0 && (
                          <div>
                            <div className="nb-ac-lbl">Products ({searchResults.products.length})</div>
                            {searchResults.products.map((p) => (
                              <button key={p._id||p.id} onClick={()=>handleSelect("product",p)} className="nb-ac-row">
                                <div className="nb-ac-thumb">{p.images?.[0] ? <img src={getImg(p.images[0])} alt={p.name} onError={(e)=>(e.target.src="https://via.placeholder.com/32")}/> : <FiPackage size={15} style={{color:"#94a3b8"}}/>}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div className="nb-ac-name">{p.name||p.productName}</div>
                                  <div style={{display:"flex",gap:5,marginTop:2,alignItems:"center"}}>
                                    {p.brand && <span className="nb-ac-badge">{p.brand}</span>}
                                    {p.category && <span className="nb-ac-meta">in {p.category}</span>}
                                  </div>
                                </div>
                                {p.price && <div className="nb-ac-price">₹{p.price.toLocaleString()}</div>}
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.categories.length > 0 && (
                          <div>
                            <div className="nb-ac-lbl">Categories ({searchResults.categories.length})</div>
                            {searchResults.categories.map((c) => (
                              <button key={c._id||c.id} onClick={()=>handleSelect("category",c)} className="nb-ac-row">
                                <div className="nb-ac-ico cat"><FiGrid size={13}/></div>
                                <div style={{flex:1}}><div className="nb-ac-name">{c.name}</div><div className="nb-ac-meta">Browse all in {c.name}</div></div>
                                <FiChevronRight size={13} style={{color:"#94a3b8"}}/>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.subcategories.length > 0 && (
                          <div>
                            <div className="nb-ac-lbl">Subcategories ({searchResults.subcategories.length})</div>
                            {searchResults.subcategories.map((s) => (
                              <button key={s._id||s.id} onClick={()=>handleSelect("subcategory",s)} className="nb-ac-row">
                                <div className="nb-ac-ico sub"><FiTag size={12}/></div>
                                <div style={{flex:1}}><div className="nb-ac-name">{s.title||s.name}</div><div className="nb-ac-meta">in {s.category?.name||"Category"}</div></div>
                                <FiChevronRight size={13} style={{color:"#94a3b8"}}/>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.itemTypes?.length > 0 && (
                          <div>
                            <div className="nb-ac-lbl">Item Types ({searchResults.itemTypes.length})</div>
                            {searchResults.itemTypes.map((t) => (
                              <button key={t._id||t.id} onClick={()=>handleSelect("itemtype",t)} className="nb-ac-row">
                                <div className="nb-ac-ico typ"><FiGrid size={12}/></div>
                                <div style={{flex:1}}><div className="nb-ac-name">{t.name}</div><div className="nb-ac-meta">{t.subcategory?.title&&`in ${t.subcategory.title}`}{t.category?.name&&` · ${t.category.name}`}</div></div>
                                <FiChevronRight size={13} style={{color:"#94a3b8"}}/>
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="nb-ac-foot">
                          <button onClick={()=>{setShowAutocomplete(false);navigate(`/search?q=${encodeURIComponent(searchQuery)}`)}}>
                            View all results for "{searchQuery}" <FiChevronRight size={13}/>
                          </button>
                        </div>
                      </>
                    ) : searchQuery.length > 0 ? (
                      <div className="nb-ac-empty">
                        <div style={{fontSize:24,marginBottom:6}}>🔍</div>
                        <p style={{fontWeight:600,color:NAVY,margin:"0 0 4px"}}>No results for "{searchQuery}"</p>
                        <p style={{fontSize:11.5,color:"#94a3b8",margin:0}}>Try different keywords</p>
                        <button onClick={()=>{setShowAutocomplete(false);navigate(`/search?q=${encodeURIComponent(searchQuery)}`)}} style={{marginTop:10,background:"none",border:"none",color:NAVY,cursor:"pointer",fontWeight:600,fontSize:12.5}}>Search anyway →</button>
                      </div>
                    ) : null}
                  </div>
                )}
              </form>
            </div>

            {/* Right actions */}
            <div className="nb-actions">
              <div className="nb-rl">
                <Link to="/seller">Seller</Link>
                <Link to="/investors">Investors</Link>
              </div>
              <div className="nb-sep"/>

              <Link to="/cart" className="nb-ibtn" aria-label="Cart">
                <FiShoppingCart size={19}/>
                {cartCount > 0 && <span className="nb-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
              </Link>

              {/* Profile button — ref for position calculation */}
              <button
                ref={profileBtnRef}
                type="button"
                className={`nb-pbtn${dropdownOpen ? " open" : ""}`}
                onClick={openProfile}
              >
                <div className="nb-avatar">
                  {user ? user.name?.charAt(0).toUpperCase() : <FiUser size={13}/>}
                </div>
                <span style={{maxWidth:76,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {user ? user.name?.split(" ")[0] : "Account"}
                </span>
                <FiChevronRight size={13} style={{flexShrink:0,transition:"transform .2s",transform:dropdownOpen?"rotate(90deg)":"rotate(0deg)"}}/>
              </button>

              <Link to="/post-requirement" className="nb-cta">Post Requirement</Link>

              <button type="button" className="nb-ham nb-ibtn" onClick={()=>setMenuOpen((v)=>!v)} aria-label="Toggle menu">
                {menuOpen ? <FiX size={19}/> : <FiMenu size={19}/>}
              </button>
            </div>
          </div>
        </nav>

        {/* ── Mobile menu ── */}
        <div className="nb-mob" style={{display:menuOpen?"block":"none"}}>
          <form onSubmit={handleSearch}>
            <div className="nb-msearch">
              <input type="text" placeholder="Search products, brands…" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} onFocus={()=>setShowAutocomplete(true)}/>
              <button type="submit"><FiSearch size={16} style={{color:"#94a3b8"}}/></button>
            </div>
            {showAutocomplete && searchQuery.length > 0 && (
              <div className="nb-ac" style={{maxHeight:280}}>
                {isSearching ? <div className="nb-ac-spin">Searching…</div>
                : hasResults ? (
                  <div>
                    {searchResults.products.slice(0,4).map((p)=>(
                      <button key={p._id||p.id} onClick={()=>{handleSelect("product",p);setMenuOpen(false)}} className="nb-ac-row">
                        <div className="nb-ac-name">{p.name||p.productName}</div>
                        {p.price&&<div className="nb-ac-price">₹{p.price.toLocaleString()}</div>}
                      </button>
                    ))}
                    {searchResults.categories.slice(0,2).map((c)=>(
                      <button key={c._id||c.id} onClick={()=>{handleSelect("category",c);setMenuOpen(false)}} className="nb-ac-row">
                        <div className="nb-ac-name">{c.name}</div>
                      </button>
                    ))}
                    {searchResults.totalResults>0&&<div className="nb-ac-foot"><button onClick={()=>{setShowAutocomplete(false);navigate(`/search?q=${encodeURIComponent(searchQuery)}`);setMenuOpen(false)}}>View all {searchResults.totalResults} results</button></div>}
                  </div>
                ) : <div className="nb-ac-empty">No results for "{searchQuery}"</div>}
              </div>
            )}
          </form>

          <div className="nb-ml">Navigation</div>
          {navLinks.map((l)=>(
            <Link key={l.to} to={l.to} className="nb-mlink" onClick={()=>setMenuOpen(false)}>
              {l.label}<FiChevronRight size={14} style={{color:"#cbd5e1"}}/>
            </Link>
          ))}

          <div className="nb-ml">Account</div>
          <Link to="/cart" className="nb-mlink" onClick={()=>setMenuOpen(false)}>
            <span>Cart</span>
            {cartCount>0&&<span style={{background:ACCENT,color:"#fff",borderRadius:12,padding:"2px 8px",fontSize:11,fontWeight:700}}>{cartCount>99?"99+":cartCount}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="nb-mlink" onClick={()=>setMenuOpen(false)}>My Profile<FiChevronRight size={14} style={{color:"#cbd5e1"}}/></Link>
              <Link to="/orders/my-orders" className="nb-mlink" onClick={()=>setMenuOpen(false)}>My Orders<FiChevronRight size={14} style={{color:"#cbd5e1"}}/></Link>
              <button className="nb-mlink" onClick={handleLogout} style={{display:"flex",alignItems:"center",gap:8}}><FiLogOut size={13}/> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nb-mlink" onClick={()=>setMenuOpen(false)}>Sign In<FiChevronRight size={14} style={{color:"#cbd5e1"}}/></Link>
              <Link to="/register" className="nb-mlink" onClick={()=>setMenuOpen(false)}>Sign Up<FiChevronRight size={14} style={{color:"#cbd5e1"}}/></Link>
            </>
          )}
          <button className="nb-mcta" onClick={()=>{navigate("/post-requirement");setMenuOpen(false);}}>Post Requirement</button>
        </div>
      </header>

      {/* ── Profile dropdown — rendered OUTSIDE <header> as position:fixed ──
          This completely escapes every stacking context in the page.
          z-index: 999999 guarantees it is always on top of everything.     */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="nb-dd"
          style={{ top: ddPos.top, right: ddPos.right }}
        >
          {user && (
            <div className="nb-dd-head">
              <div className="nb-dd-name">{user.name}</div>
              <div className="nb-dd-email">{user.email}</div>
            </div>
          )}
          <div style={{padding:"5px 0"}}>
            {profileItems.map((item, i) => (
              <button
                key={i}
                type="button"
                className="nb-ddi"
                onClick={item.path ? () => ddGo(item.path) : item.action}
              >
                <span className="nb-ddi-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}