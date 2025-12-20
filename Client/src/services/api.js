// src/api/api.js

const API_BASE_URL = 'http://localhost:5000/api'; // Make sure your backend runs on port 5000

const safeFetch = async (url, options = {}) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText || response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Check your internet or server.');
        }
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Cannot reach the server. Is the backend running on http://localhost:5000?');
        }
        throw error;
    }
};


// NEW: Search autocomplete for products, categories, and subcategories
export const searchAutocomplete = async (query, limit = 8) => {
    try {
        if (!query || query.trim().length < 1) {
            return {
                success: true,
                products: [],
                categories: [],
                subcategories: [],
                query: '',
                totalResults: 0
            };
        }
        
        const url = `${API_BASE_URL}/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`;
        const data = await safeFetch(url);
        
        // Return the data as-is if it has success: false
        if (data.success === false) {
            console.warn('Search autocomplete failed:', data.error);
            return {
                success: false,
                products: [],
                categories: [],
                subcategories: [],
                query: query,
                totalResults: 0,
                error: data.error || 'Search failed'
            };
        }
        
        // Return the full response from backend
        return {
            success: true,
            products: data.products || [],
            categories: data.categories || [],
            subcategories: data.subcategories || [],
            query: data.query || query,
            totalResults: data.totalResults || 0
        };
    } catch (err) {
        console.error('searchAutocomplete error:', err);
        // Return structured error response instead of throwing
        return {
            success: false,
            products: [],
            categories: [],
            subcategories: [],
            query: query,
            totalResults: 0,
            error: err.message || 'Network error. Please check your connection.'
        };
    }
};

// NEW: Get trending search suggestions
export const getSearchSuggestions = async () => {
    try {
        const url = `${API_BASE_URL}/search/suggestions`;
        const data = await safeFetch(url);
        
        if (data.success === false) {
            console.warn('Get search suggestions failed:', data.error);
            return {
                success: false,
                trendingSearches: [],
                popularCategories: [],
                error: data.error
            };
        }
        
        return {
            success: true,
            trendingSearches: data.trendingSearches || [],
            popularCategories: data.popularCategories || []
        };
    } catch (err) {
        console.error('getSearchSuggestions error:', err);
        return {
            success: false,
            trendingSearches: [],
            popularCategories: [],
            error: err.message
        };
    }
};

// NEW: Full search with pagination and filters
export const searchProducts = async (query, params = {}) => {
    try {
        if (!query || query.trim().length === 0) {
            return {
                success: true,
                products: [],
                total: 0,
                page: 1,
                pages: 0,
                filters: {},
                query: ''
            };
        }
        
        const searchParams = {
            q: query,
            ...params
        };
        
        const queryString = new URLSearchParams(searchParams).toString();
        const url = `${API_BASE_URL}/search?${queryString}`;
        const data = await safeFetch(url);
        
        if (data.success === false) {
            console.warn('Search products failed:', data.error);
            return {
                success: false,
                products: [],
                total: 0,
                page: 1,
                pages: 0,
                filters: {},
                query: query,
                error: data.error
            };
        }
        
        return {
            success: true,
            products: data.products || [],
            total: data.total || 0,
            page: data.page || 1,
            pages: data.pages || 0,
            filters: data.filters || {},
            query: data.query || query
        };
    } catch (err) {
        console.error('searchProducts error:', err);
        return {
            success: false,
            products: [],
            total: 0,
            page: 1,
            pages: 0,
            filters: {},
            query: query,
            error: err.message || 'Network error'
        };
    }
};

// NEW: Check if search returned results
export const hasSearchResults = (searchData) => {
    return searchData.success && 
           (searchData.products.length > 0 || 
            searchData.categories.length > 0 || 
            searchData.subcategories.length > 0);
};

// NEW: Format search result for display
export const formatSearchResult = (item, type) => {
    switch (type) {
        case 'product':
            return {
                id: item._id || item.id || item.numericId,
                name: item.name || item.productName,
                price: item.price || item.sellingPrice,
                image: item.images?.[0],
                brand: item.brand,
                categoryName: item.categoryName,
                type: 'product'
            };
        case 'category':
            return {
                id: item._id || item.id || item.numericId,
                name: item.name,
                description: item.description,
                icon: item.icon,
                type: 'category'
            };
        case 'subcategory':
            return {
                id: item._id || item.id || item.numericId,
                name: item.title || item.name,
                categoryName: item.categoryName,
                type: 'subcategory'
            };
        default:
            return item;
    }
};
// Get all categories
export const fetchCategories = async () => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/categories`);
        return data.categories || data || [];
    } catch (err) {
        console.error('fetchCategories error:', err);
        throw err;
    }
};

// Get products with optional filters
export const fetchProducts = async (params = {}) => {
    try {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${API_BASE_URL}/products?${query}` : `${API_BASE_URL}/products`;
        const data = await safeFetch(url);
        return data.products || data || [];
    } catch (err) {
        console.error('fetchProducts error:', err);
        throw err;
    }
};

// Get single category by numericId
export const fetchCategoryById = async (id) => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/categories/${id}`);
        return data.category || data;
    } catch (err) {
        console.error('fetchCategoryById error:', err);
        throw err;
    }
};

// Add these API functions to your services/api.js

