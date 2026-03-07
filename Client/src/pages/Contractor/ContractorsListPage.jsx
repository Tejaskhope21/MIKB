// src/pages/ContractorsList.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  ArrowLeft,
  MapPin,
  Briefcase,
  Image as ImageIcon,
  WifiOff,
  RefreshCw,
  X,
  History,
  Star,
  CheckCircle,
} from "lucide-react";

const PRIMARY_COLOR = "rgb(234, 88, 12)"; // orange-600
const SECONDARY_COLOR = "#FFF7ED"; // orange-50

const STORAGE_KEYS = {
  CONTRACTORS_CACHE: "@contractors_cache",
  CACHE_TIMESTAMP: "@contractors_cache_timestamp",
  SEARCH_HISTORY: "@contractors_search_history",
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const API_BASE = "https://bricks-backend-qyea.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const ContractorsListPage = () => {
  const navigate = useNavigate();

  const [contractors, setContractors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking...");
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const searchTimeoutRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);

  // Force re-render FlatList-like behavior
  const listKey = useRef(`list-${Date.now()}`);

  // ────────────────────────────────────────────────
  // Cache Helpers
  // ────────────────────────────────────────────────
  const saveToCache = async (data, searchQuery = "") => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        searchQuery,
      };
      localStorage.setItem(STORAGE_KEYS.CONTRACTORS_CACHE, JSON.stringify(cacheData));
    } catch (err) {
      console.error("Cache save failed", err);
    }
  };

  const loadFromCache = async () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CONTRACTORS_CACHE);
      if (cached) {
        const { data, timestamp, searchQuery } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setIsUsingCache(true);
          return { data, searchQuery };
        } else {
          localStorage.removeItem(STORAGE_KEYS.CONTRACTORS_CACHE);
        }
      }
      return null;
    } catch (err) {
      console.error("Cache load failed", err);
      return null;
    }
  };

  // ────────────────────────────────────────────────
  // Search History
  // ────────────────────────────────────────────────
  const saveSearchHistory = async (query) => {
    if (!query.trim()) return;
    try {
      let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || "[]");
      history = history.filter((item) => item !== query);
      history.unshift(query);
      history = history.slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
      setSearchHistory(history);
    } catch (err) {
      console.error("Search history save failed", err);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      if (history) setSearchHistory(JSON.parse(history));
    } catch (err) {
      console.error("Search history load failed", err);
    }
  };

  const clearSearchHistory = async () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
      setSearchHistory([]);
    } catch (err) {
      console.error("Clear history failed", err);
    }
  };

  // ────────────────────────────────────────────────
  // Fetch Contractors
  // ────────────────────────────────────────────────
  const fetchContractors = async (loadMore = false, searchText = search) => {
    if (loadMore && !hasMore) return;

    const currentPage = loadMore ? page + 1 : 1;
    if (!loadMore) setLoading(true);

    setError(null);
    setIsUsingCache(false);

    try {
      // Try cache for initial non-search load
      if (!loadMore && !searchText.trim()) {
        const cached = await loadFromCache();
        if (cached) {
          setContractors(cached.data);
          setPage(1);
          setHasMore(false);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      let url = `/contractor-search?page=${currentPage}&limit=10`;

      if (searchText.trim()) {
        url += `&q=${encodeURIComponent(searchText.trim())}`;
        saveSearchHistory(searchText.trim());
      }

      const res = await api.get(url);

      const newContractors = res.data.contractors || res.data || [];

      if (loadMore) {
        setContractors((prev) => [...prev, ...newContractors]);
        setPage(currentPage);
      } else {
        setContractors(newContractors);
        setPage(1);

        if (!searchText.trim()) {
          saveToCache(newContractors);
        }
      }

      setHasMore(currentPage < (res.data.pages || Infinity));
      setApiStatus("connected");
    } catch (err) {
      let errorMessage = err.message || "Failed to load contractors";

      if (errorMessage.includes("Network Error") || errorMessage.includes("network")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "Request timeout. Server is slow.";
      }

      setError(errorMessage);
      setApiStatus("disconnected");

      // Fallback to cache
      if (!loadMore && !searchText.trim()) {
        const cached = await loadFromCache();
        if (cached) {
          setContractors(cached.data);
          setPage(1);
          setHasMore(false);
          setApiStatus("using cached data");
          setIsUsingCache(true);
          setError("Using cached data. Check your internet connection.");
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // Demo data in development if nothing works
      if (process.env.NODE_ENV === "development" && contractors.length === 0 && !loadMore) {
        setContractors(getDemoData());
        setHasMore(false);
        setApiStatus("demo mode");
        setIsUsingCache(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDemoData = () => [
    {
      _id: "1",
      companyName: "Quality Builders Inc.",
      contractorType: "General Contractor",
      address: { city: "Pune", state: "MH" },
      experience: 12,
      portfolio: ["project1", "project2"],
      isVerified: true,
      description: "Professional construction services",
    },
    {
      _id: "2",
      companyName: "Modern Construction Co.",
      contractorType: "Residential Specialist",
      address: { city: "Mumbai", state: "MH" },
      experience: 8,
      portfolio: ["project1", "project2", "project3"],
      isVerified: true,
      description: "Expert in modern home construction",
    },
    {
      _id: "3",
      companyName: "Elite Contractors",
      contractorType: "Commercial Contractor",
      address: { city: "Delhi", state: "DL" },
      experience: 15,
      portfolio: ["project1"],
      isVerified: false,
      description: "Specializing in commercial projects",
    },
  ];

  // ────────────────────────────────────────────────
  // Suggestions
  // ────────────────────────────────────────────────
  const fetchSuggestions = async (text) => {
    if (!text.trim()) {
      setSuggestions(
        searchHistory.length > 0
          ? searchHistory.map((item) => ({ type: "history", value: item }))
          : []
      );
      return;
    }

    try {
      const res = await api.get(
        `/contractor-search/contractor-suggestions?q=${encodeURIComponent(text)}`
      );

      const apiSuggestions = res.data || [];
      const historySuggestions = searchHistory
        .filter((item) => item.toLowerCase().includes(text.toLowerCase()))
        .map((item) => ({ type: "history", value: item }));

      setSuggestions([...historySuggestions, ...apiSuggestions.map((v) => ({ type: "api", value: v }))].slice(0, 10));
    } catch {
      const filteredHistory = searchHistory
        .filter((item) => item.toLowerCase().includes(text.toLowerCase()))
        .map((item) => ({ type: "history", value: item }));
      setSuggestions(filteredHistory.slice(0, 5));
    }
  };

  // ────────────────────────────────────────────────
  // Effects & Handlers
  // ────────────────────────────────────────────────
  useEffect(() => {
    loadSearchHistory();
    fetchContractors();
  }, []);

  const handleSearchChange = (e) => {
    const text = e.target.value;
    setSearch(text);

    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchContractors(false, text);
    }, 500);

    clearTimeout(suggestionTimeoutRef.current);
    suggestionTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  };

  const handleSuggestionPress = (suggestion) => {
    setSearch(suggestion.value);
    setSuggestions([]);
    fetchContractors(false, suggestion.value);
  };

  const clearSearch = () => {
    setSearch("");
    setSuggestions([]);
    fetchContractors(false, "");
  };

  const onRefresh = () => {
    setRefreshing(true);
    localStorage.removeItem(STORAGE_KEYS.CONTRACTORS_CACHE);
    setIsUsingCache(false);
    fetchContractors();
  };

  const loadMore = () => {
    if (!loading && hasMore && !isUsingCache) {
      fetchContractors(true);
    }
  };

  const handleContractorPress = (contractor) => {
    navigate(`/contractor/${contractor._id}`, {
      state: { name: contractor.companyName },
    });
  };

  // ────────────────────────────────────────────────
  // Render Helpers
  // ────────────────────────────────────────────────
  const renderHeader = () => (
    <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-white pt-14 pb-10 shadow-lg">
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
       

        <h1 className="text-2xl font-bold flex-1 text-center">
          Find Trusted Contractors
        </h1>

        
      </div>
    </header>
  );

  const renderContractorCard = (contractor) => (
    <div
      onClick={() => handleContractorPress(contractor)}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-orange-200 transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col relative"
    >
      {isUsingCache && (
        <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
          <WifiOff size={10} /> Offline
        </div>
      )}

      <div className="h-20 bg-gradient-to-r from-orange-600 to-orange-500 flex items-center justify-center text-white text-3xl font-bold">
        {contractor.companyName?.charAt(0)?.toUpperCase() || "C"}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 flex-1 group-hover:text-orange-600 transition-colors">
            {contractor.companyName || "Contractor"}
          </h3>
          {contractor.isVerified && (
            <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full whitespace-nowrap">
              <CheckCircle size={12} /> Verified
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-1">
          {contractor.contractorType || "Professional contractor"}
        </p>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            <span className="line-clamp-1">
              {contractor.address?.city && contractor.address?.state
                ? `${contractor.address.city}, ${contractor.address.state}`
                : "Location not listed"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase size={16} className="text-gray-400" />
            <span>{contractor.experience || 0} years experience</span>
          </div>
        </div>

        {contractor.portfolio?.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-600 mt-auto pt-4 border-t border-gray-100">
            <ImageIcon size={16} />
            <span className="font-medium">{contractor.portfolio.length} projects completed</span>
          </div>
        )}
      </div>
    </div>
  );

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
        >
          <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  // ────────────────────────────────────────────────
  // MAIN RENDER
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {renderHeader()}

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto px-5 -mt-8 relative z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search contractors by name, type, city..."
            className="w-full pl-11 pr-12 py-4 bg-white border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition text-gray-900 placeholder-gray-500"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <X size={20} className="text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-xl max-h-80 overflow-y-auto z-50">
            {search.trim() === "" && searchHistory.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Recent Searches</span>
                <button
                  onClick={() => {
                    if (window.confirm("Clear search history?")) clearSearchHistory();
                  }}
                  className="text-xs text-orange-600 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}

            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionPress(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-3 border-b border-gray-50 last:border-none transition-colors"
              >
                {suggestion.type === "history" ? (
                  <History size={16} className="text-orange-600" />
                ) : (
                  <Search size={16} className="text-gray-500" />
                )}
                <span className="flex-1 text-gray-800">{suggestion.value}</span>
                {suggestion.type === "history" && (
                  <span className="text-xs text-gray-500">history</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-5 py-8">
        {error && contractors.length === 0 && !loading ? (
          <div className="bg-white rounded-xl border border-orange-100 p-12 text-center shadow-sm">
            <WifiOff size={64} className="mx-auto text-orange-500 mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Connection Error</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>

            <button
              onClick={() => fetchContractors()}
              className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition shadow-sm"
            >
              <RefreshCw size={18} /> Retry
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            {!loading && contractors.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {contractors.length} Contractors Found
                  {search && <span className="ml-2 text-sm font-normal text-orange-600">for "{search}"</span>}
                </h2>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contractors.map((contractor) => (
                <div key={contractor._id}>{renderContractorCard(contractor)}</div>
              ))}
            </div>
          </>
        )}

        {/* Loading States */}
        {loading && contractors.length === 0 && <SkeletonLoader />}

        {loading && contractors.length > 0 && (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-orange-600/30 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Load More */}
        {!loading && hasMore && !isUsingCache && contractors.length > 0 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-white border-2 border-orange-600 text-orange-600 rounded-xl hover:bg-orange-50 transition-all duration-300 font-medium shadow-sm hover:shadow"
            >
              Load More Contractors
            </button>
          </div>
        )}

        {/* End Message */}
        {!hasMore && contractors.length > 0 && (
          <p className="text-center text-gray-500 mt-10 italic border-t border-gray-200 pt-8">
            {isUsingCache 
              ? "Showing cached data — pull to refresh for latest results" 
              : "You've reached the end of the list"}
          </p>
        )}

        {/* No Results */}
        {!loading && !error && contractors.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              No Contractors Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {search 
                ? `No contractors match "${search}". Try different keywords.`
                : "No contractors available at the moment."}
            </p>
            {search && (
              <button
                onClick={clearSearch}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorsListPage;