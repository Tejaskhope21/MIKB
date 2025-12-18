import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Filter,
  ChevronDown,
  Clock,
  TrendingUp,
  History,
  Loader2,
  Check,
} from "lucide-react";

const SearchBar = ({
  placeholder = "Search...",
  value = "",
  onChange,
  onSearch,
  onClear,
  size = "md",
  variant = "default",
  showFilters = false,
  showRecentSearches = false,
  showSuggestions = false,
  debounceTime = 300,
  autoFocus = false,
  disabled = false,
  loading = false,
  className = "",
  filters = [],
  recentSearches = [],
  suggestions = [],
  maxSuggestions = 5,
  maxRecentSearches = 5,
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const searchRef = useRef(null);
  const filterRef = useRef(null);

  // Size configurations
  const sizeConfig = {
    sm: {
      input: "h-9 px-3 text-sm",
      button: "h-9 w-9",
      icon: "h-4 w-4",
      dropdown: "text-sm",
    },
    md: {
      input: "h-10 px-4",
      button: "h-10 w-10",
      icon: "h-5 w-5",
      dropdown: "text-sm",
    },
    lg: {
      input: "h-12 px-4 text-base",
      button: "h-12 w-12",
      icon: "h-5 w-5",
      dropdown: "text-base",
    },
  };

  // Variant configurations
  const variantConfig = {
    default: {
      container: "border border-gray-300 bg-white",
      input: "bg-transparent text-gray-900",
      button: "bg-gray-100 text-gray-600 hover:bg-gray-200",
      focused: "border-blue-500 ring-2 ring-blue-100",
    },
    filled: {
      container: "border border-gray-200 bg-gray-50",
      input: "bg-transparent text-gray-900",
      button: "bg-gray-200 text-gray-600 hover:bg-gray-300",
      focused: "border-blue-500 bg-white ring-2 ring-blue-100",
    },
    outline: {
      container: "border-2 border-gray-200 bg-transparent",
      input: "bg-transparent text-gray-900",
      button: "bg-gray-100 text-gray-600 hover:bg-gray-200",
      focused: "border-blue-500 ring-2 ring-blue-100",
    },
    minimal: {
      container: "border-0 bg-gray-100",
      input: "bg-transparent text-gray-900",
      button: "bg-gray-200 text-gray-600 hover:bg-gray-300",
      focused: "bg-white shadow-md",
    },
  };

  const sizes = sizeConfig[size] || sizeConfig.md;
  const variants = variantConfig[variant] || variantConfig.default;

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== value) {
        onChange?.(searchValue);
      }
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [searchValue, debounceTime, onChange, value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim() && !disabled) {
      onSearch?.(searchValue.trim(), activeFilter);
      setShowDropdown(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setSearchValue("");
    setActiveFilter(null);
    onClear?.();
    onChange?.("");
    searchRef.current?.focus();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion);
    onChange?.(suggestion);
    onSearch?.(suggestion, activeFilter);
    setShowDropdown(false);
  };

  // Handle recent search click
  const handleRecentSearchClick = (search) => {
    setSearchValue(search);
    onChange?.(search);
    onSearch?.(search, activeFilter);
    setShowDropdown(false);
  };

  // Handle filter select
  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);
    setFilterOpen(false);
    onSearch?.(searchValue, filter);
  };

  // Handle key down
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
      setFilterOpen(false);
    }
    if (e.key === "Enter" && !e.shiftKey) {
      handleSearch(e);
    }
  };

  const displaySuggestions = suggestions.slice(0, maxSuggestions);
  const displayRecentSearches = recentSearches.slice(0, maxRecentSearches);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSearch}>
        <div
          className={`flex items-center rounded-lg transition-all duration-200 ${
            variants.container
          } ${isFocused ? variants.focused : ""} ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {/* Search icon */}
          <div className="pl-3">
            {loading ? (
              <Loader2 className={`${sizes.icon} text-gray-400 animate-spin`} />
            ) : (
              <Search className={`${sizes.icon} text-gray-400`} />
            )}
          </div>

          {/* Search input */}
          <input
            ref={(input) => {
              if (autoFocus && input) input.focus();
            }}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (showSuggestions || showRecentSearches) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            onClick={() => {
              if (showSuggestions || showRecentSearches) {
                setShowDropdown(true);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={`flex-1 ${sizes.input} ${variants.input} border-0 focus:outline-none focus:ring-0 placeholder-gray-500 ${
              disabled ? "cursor-not-allowed" : ""
            }`}
            aria-label="Search input"
          />

          {/* Filter button */}
          {showFilters && filters.length > 0 && (
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                disabled={disabled}
                className={`flex items-center space-x-1 px-3 py-1 border-l border-gray-300 ${
                  sizes.input
                } ${variants.button} ${
                  disabled ? "cursor-not-allowed" : "cursor-pointer"
                } ${activeFilter ? "text-blue-600" : "text-gray-600"}`}
                aria-label="Open filters"
              >
                <Filter className={sizes.icon} />
                {activeFilter && (
                  <span className="text-xs font-medium">
                    {activeFilter.label}
                  </span>
                )}
                <ChevronDown className={`h-3 w-3 ${filterOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Filter dropdown */}
              {filterOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filter by
                    </div>
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => handleFilterSelect(filter)}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${
                          activeFilter?.id === filter.id
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        <div className="flex items-center">
                          {filter.icon && <filter.icon className="h-4 w-4 mr-2" />}
                          <span>{filter.label}</span>
                        </div>
                        {activeFilter?.id === filter.id && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                    {activeFilter && (
                      <>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          type="button"
                          onClick={() => setActiveFilter(null)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Clear filter
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clear button */}
          {searchValue && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className={`${sizes.button} flex items-center justify-center text-gray-400 hover:text-gray-600 ${
                disabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              aria-label="Clear search"
            >
              <X className={sizes.icon} />
            </button>
          )}

          {/* Search button */}
          <button
            type="submit"
            onClick={handleSearch}
            disabled={disabled || !searchValue.trim()}
            className={`${sizes.button} flex items-center justify-center rounded-r-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors`}
            aria-label="Perform search"
          >
            <Search className={sizes.icon} />
          </button>
        </div>
      </form>

      {/* Dropdown with suggestions and recent searches */}
      {showDropdown && (showSuggestions || showRecentSearches) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {showRecentSearches && displayRecentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                <History className="h-3 w-3 mr-2" />
                Recent Searches
              </div>
              {displayRecentSearches.map((search, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && displaySuggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                <TrendingUp className="h-3 w-3 mr-2" />
                Popular Searches
              </div>
              {displaySuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="border-t border-gray-200 py-2">
            <div className="px-4 py-1 text-xs text-gray-500">
              Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to search or{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}

      {/* Active filter badge */}
      {activeFilter && (
        <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
            <Filter className="h-3 w-3 mr-1" />
            {activeFilter.label}
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className="ml-2 text-blue-600 hover:text-blue-800"
              aria-label="Remove filter"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;