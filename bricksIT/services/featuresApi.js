// services/api.js

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Hot Deals API
export const fetchHotDeals = async (limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/deals/?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.success) {
      // Transform the data to match frontend structure
      return data.products.map(product => ({
        id: product._id,
        _id: product._id,
        name: product.name,
        brand: product.brand || 'Brand',
        price: product.discount && product.discount > 0 
          ? calculateDiscountedPrice(product.price, product.discount)
          : Number(product.price) || 0,
        originalPrice: Number(product.price) || 0,
        // discount: product.discount || 0,
        images: product.images ,
        inStock: product.inStock !== false,
        // rating: Number(product.rating) || 4.0,
        category: product.category,
        hotDeal: product.hotDeal || {},
        // Add hot deal specific properties
        expiresAt: product.hotDeal?.expiresAt,
        priority: product.hotDeal?.priority || 0,
        views: product.hotDeal?.views || 0,
        clicks: product.hotDeal?.clicks || 0,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching hot deals:', error);
    return [];
  }
};

// Track hot deal view
export const trackHotDealView = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/deals/view/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to track view');
    }
  } catch (error) {
    console.error('Error tracking hot deal view:', error);
  }
};

// Track hot deal click
export const trackHotDealClick = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/deals/click/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to track click');
    }
  } catch (error) {
    console.error('Error tracking hot deal click:', error);
  }
};

// Utility function to calculate discounted price
const calculateDiscountedPrice = (price, discount) => {
  const originalPrice = Number(price) || 0;
  const discountPercent = Number(discount) || 0;
  const discountAmount = originalPrice * (discountPercent / 100);
  return Math.max(0, originalPrice - discountAmount);
};

// Update the formatPrice function to handle discounted prices
export const formatPrice = (price) => {
  const numPrice = Number(price);
  if (isNaN(numPrice)) return '₹0';
  
  if (numPrice >= 100000) {
    return `₹${(numPrice / 100000).toFixed(1)}L`;
  } else if (numPrice >= 1000) {
    return `₹${(numPrice / 1000).toFixed(1)}K`;
  }
  return `₹${numPrice.toLocaleString('en-IN')}`;
};


// Trending Products API - Exact same format as hot deals
export const fetchTrendingProducts = async (limit = 8) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trending?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.success) {
      // Transform the data to match frontend structure
      return data.products.map(product => ({
        id: product._id,
        _id: product._id,
        name: product.name,
        brand: product.brand || 'Brand',
        price: Number(product.price) || 0,
        originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
        discount: product.discount || 0,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        images: product.images || [],
        inStock: product.inStock !== false,
        // rating: Number(product.rating) || 4.0,
        category: product.category,
        trending: product.trending || {},
        // Add trending specific properties
        trendScore: product.trending?.score || 0,
        views: product.trending?.views || 0,
        clicks: product.trending?.clicks || 0,
        purchases: product.trending?.purchases || 0,
        // reviewCount: product.reviews?.length || 0,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return [];
  }
};

export const trackTrendingView = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trending/view/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to track trending view');
    }
  } catch (error) {
    console.error('Error tracking trending view:', error);
  }
};

export const trackTrendingClick = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trending/click/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to track trending click');
    }
  } catch (error) {
    console.error('Error tracking trending click:', error);
  }
};



/* ===============================
   SAFE FETCH (RN compatible)
================================ */
const safeFetch = async (url) => {
  const res = await fetch(url);

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Request failed');
  }
  return data;
};

/* ===============================
   SEARCH AUTOCOMPLETE
================================ */
export const searchAutocomplete = async (query, limit = 8) => {
  try {
    if (!query || query.trim().length < 1) {
      return {
        success: true,
        products: [],
        categories: [],
        subcategories: [],
        query: '',
        totalResults: 0,
      };
    }

    const url = `${API_BASE_URL}/search/autocomplete?q=${encodeURIComponent(
      query
    )}&limit=${limit}`;

    const data = await safeFetch(url);

    if (data.success === false) {
      console.warn('Search autocomplete failed:', data.error);
      return {
        success: false,
        products: [],
        categories: [],
        subcategories: [],
        query,
        totalResults: 0,
        error: data.error || 'Search failed',
      };
    }

    return {
      success: true,
      products: data.products || [],
      categories: data.categories || [],
      subcategories: data.subcategories || [],
      query: data.query || query,
      totalResults: data.totalResults || 0,
    };
  } catch (err) {
    console.error('searchAutocomplete error:', err);
    return {
      success: false,
      products: [],
      categories: [],
      subcategories: [],
      query,
      totalResults: 0,
      error: err.message || 'Network error',
    };
  }
};

/* ===============================
   CHECK RESULTS
================================ */
export const hasSearchResults = (searchData) => {
  return (
    searchData.success &&
    (searchData.products?.length > 0 ||
      searchData.categories?.length > 0 ||
      searchData.subcategories?.length > 0)
  );
};

/* ===============================
   TRENDING PRODUCTS WITH FILTERS
================================ */
export const fetchAllTrendingProducts = async (limit = 20, category = '') => {
  try {
    let url = `${API_BASE_URL}/trending/all?limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.success) {
      // Transform the data to match frontend structure
      return data.products.map(product => ({
        id: product._id,
        _id: product._id,
        name: product.name,
        brand: product.brand || 'Brand',
        price: Number(product.price) || 0,
        originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
        discount: product.discount || 0,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        images: product.images || [],
        inStock: product.inStock !== false,
        category: product.category,
        subcategory: product.subcategory,
        trending: product.trending || {},
        trendScore: product.trending?.score || 0,
        views: product.trending?.views || 0,
        clicks: product.trending?.clicks || 0,
        purchases: product.trending?.purchases || 0,
        createdAt: product.createdAt || new Date().toISOString(),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching all trending products:', error);
    return [];
  }
};

/* ===============================
   GET TRENDING CATEGORIES
================================ */
export const fetchTrendingCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/trending/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.success) {
      return data.categories.map(cat => ({
        id: cat._id,
        _id: cat._id,
        name: cat.name,
        image: cat.image || `https://via.placeholder.com/80/cccccc/ffffff?text=${(cat.name || '?').charAt(0)}`,
        count: cat.count || 0,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching trending categories:', error);
    return [];
  }
};