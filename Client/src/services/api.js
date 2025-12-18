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