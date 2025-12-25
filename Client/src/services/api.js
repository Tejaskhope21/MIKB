// src/api/api.js

// Dynamic API Base URL - works for both local development and production
const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
        (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1')
        ? 'https://bricks-backend-qyea.onrender.com/api'
        : 'https://bricks-backend-qyea.onrender.com/api';

// Helper: Safe fetch with timeout, error handling, and clear messages
const safeFetch = async (url, options = {}) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

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
            throw new Error('Request timed out. Please check your connection.');
        }
        if (error.message.includes('Failed to fetch')) {
            throw new Error(`Cannot connect to server at ${API_BASE_URL}. Is the backend running?`);
        }
        throw error;
    }
};

/* =========================
   SEARCH API FUNCTIONS
========================= */

// Search autocomplete (products, categories, subcategories)
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

        if (data.success === false) {
            console.warn('Search autocomplete failed:', data.error);
            return {
                success: false,
                products: [],
                categories: [],
                subcategories: [],
                query,
                totalResults: 0,
                error: data.error || 'Search failed'
            };
        }

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
        return {
            success: false,
            products: [],
            categories: [],
            subcategories: [],
            query,
            totalResults: 0,
            error: err.message || 'Network error'
        };
    }
};

// Get trending search suggestions
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

// Full product search with filters and pagination
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

        const searchParams = { q: query, ...params };
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
                query,
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
            query,
            error: err.message || 'Network error'
        };
    }
};

// Utility: Check if search has results
export const hasSearchResults = (searchData) => {
    return searchData.success &&
        (searchData.products?.length > 0 ||
            searchData.categories?.length > 0 ||
            searchData.subcategories?.length > 0);
};

// Utility: Format search result for display
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

/* =========================
   CATEGORY & PRODUCT API
========================= */

export const fetchCategories = async () => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/categories`);
        return data.categories || data || [];
    } catch (err) {
        console.error('fetchCategories error:', err);
        return [];
    }
};

export const fetchCategoryDetails = async (categoryId) => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/categories/${categoryId}`);
        return data.category || data || null;
    } catch (err) {
        console.error('fetchCategoryDetails error:', err);
        return null;
    }
};

export const fetchProductsByCategory = async (categoryId) => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/products/category/${categoryId}?showAll=true`);
        return data.products || data || [];
    } catch (err) {
        console.error('fetchProductsByCategory error:', err);
        return [];
    }
};

export const fetchProducts = async (params = {}) => {
    try {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${API_BASE_URL}/products?${query}` : `${API_BASE_URL}/products`;
        const data = await safeFetch(url);
        return data.products || data || [];
    } catch (err) {
        console.error('fetchProducts error:', err);
        return [];
    }
};

/* =========================
   SUBCATEGORY API FUNCTIONS
========================= */

export const fetchSubcategories = async (categoryId) => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/categories/${categoryId}/subcategories`);

        if (data.success === false && data.message?.includes('Route not found')) {
            console.log('Subcategories endpoint not found, using fallback...');
            const categoryData = await fetchCategoryDetails(categoryId);
            const allProducts = await fetchProductsByCategory(categoryId);

            if (categoryData?.subcategories) {
                return categoryData.subcategories.map(sub => {
                    const productCount = allProducts.filter(p =>
                        p.subcategoryId === sub.numericId ||
                        p.subcategoryId?.toString() === sub._id ||
                        p.subcategory?.numericId === sub.numericId ||
                        p.subcategory?._id === sub._id
                    ).length;

                    return {
                        _id: sub._id,
                        numericId: sub.numericId,
                        title: sub.title,
                        description: sub.description || `Browse ${sub.title} products`,
                        productCount
                    };
                });
            }
            return [];
        }

        return data.subcategories || data || [];
    } catch (err) {
        console.error('fetchSubcategories error:', err);
        return [];
    }
};

export const fetchSubcategoryDetails = async (categoryId, subcategoryId) => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/categories/${categoryId}/subcategories/${subcategoryId}`);

        if (data.success === false && data.message?.includes('Route not found')) {
            const subcategories = await fetchSubcategories(categoryId);
            return subcategories.find(s =>
                s._id === subcategoryId || s.numericId?.toString() === subcategoryId
            ) || { title: `Subcategory ${subcategoryId}`, productCount: 0 };
        }

        return data.subcategory || data;
    } catch (err) {
        console.error('fetchSubcategoryDetails error:', err);
        const subcategories = await fetchSubcategories(categoryId);
        return subcategories.find(s =>
            s._id === subcategoryId || s.numericId?.toString() === subcategoryId
        ) || { title: `Subcategory ${subcategoryId}`, productCount: 0 };
    }
};

const sortProducts = (products, sortBy) => {
    return [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price-low': return (a.price || 0) - (b.price || 0);
            case 'price-high': return (b.price || 0) - (a.price || 0);
            case 'rating': return (b.rating || 0) - (a.rating || 0);
            case 'discount':
                return (b.discount || b.discountPercentage || 0) - (a.discount || a.discountPercentage || 0);
            case 'name-asc': return (a.name || '').localeCompare(b.name || '');
            case 'name-desc': return (b.name || '').localeCompare(a.name || '');
            default: return 0;
        }
    });
};

const fallbackProductsBySubcategory = async (categoryId, subcategoryId, filters = {}) => {
    try {
        const allProducts = await fetchProductsByCategory(categoryId);
        let filtered = allProducts.filter(p =>
            p.subcategoryId === subcategoryId ||
            p.subcategoryId?.toString() === subcategoryId ||
            p.subcategory?._id === subcategoryId ||
            p.subcategory?.numericId?.toString() === subcategoryId
        );

        // Apply filters
        if (filters.minPrice) filtered = filtered.filter(p => (p.price || 0) >= parseFloat(filters.minPrice));
        if (filters.maxPrice) filtered = filtered.filter(p => (p.price || 0) <= parseFloat(filters.maxPrice));
        if (filters.brand) filtered = filtered.filter(p => p.brand === filters.brand);
        if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q)
            );
        }
        if (filters.sortBy) filtered = sortProducts(filtered, filters.sortBy);

        const brands = [...new Set(filtered.map(p => p.brand).filter(Boolean).sort())];

        return {
            products: filtered,
            total: filtered.length,
            brands,
            minPrice: filters.minPrice || 0,
            maxPrice: filters.maxPrice || 0,
            page: 1,
            pages: 1
        };
    } catch (err) {
        console.error('fallbackProductsBySubcategory error:', err);
        return { products: [], total: 0, brands: [], page: 1, pages: 0 };
    }
};

export const fetchProductsBySubcategory = async (categoryId, subcategoryId, filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') queryParams.append(k, v);
        });

        const url = `${API_BASE_URL}/categories/${categoryId}/subcategories/${subcategoryId}/products?${queryParams}`;
        const data = await safeFetch(url);

        if (data.success === false) {
            return await fallbackProductsBySubcategory(categoryId, subcategoryId, filters);
        }

        return {
            products: data.products || [],
            total: data.total || 0,
            brands: data.brands || [],
            minPrice: data.minPrice || 0,
            maxPrice: data.maxPrice || 0,
            page: data.page || 1,
            pages: data.pages || 1
        };
    } catch (err) {
        console.error('fetchProductsBySubcategory error:', err);
        return await fallbackProductsBySubcategory(categoryId, subcategoryId, filters);
    }
};

/* =========================
   MATERIAL REQUIREMENT API
========================= */

export const createMaterialRequirement = async (requirementData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return { success: false, message: 'Authentication required. Please login.' };
        }

        const formattedData = {
            ...requirementData,
            phone: requirementData.phone.toString(),
            deliveryDate: new Date(requirementData.deliveryDate).toISOString(),
            materials: requirementData.materials.map(m => ({
                ...m,
                quantity: parseFloat(m.quantity) || 0
            }))
        };

        const response = await safeFetch(`${API_BASE_URL}/requirements`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formattedData)
        });

        return response;
    } catch (err) {
        console.error('createMaterialRequirement error:', err);
        return { success: false, message: err.message || 'Failed to submit requirement' };
    }
};

export const getUserMaterialRequirements = async (params = {}) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: 'Authentication required', data: [] };

        const { page = 1, limit = 10, status, sort = '-createdAt' } = params;
        let url = `${API_BASE_URL}/requirements/my?page=${page}&limit=${limit}&sort=${sort}`;
        if (status) url += `&status=${status}`;

        return await safeFetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    } catch (err) {
        console.error('getUserMaterialRequirements error:', err);
        return { success: false, message: 'Failed to fetch requirements', data: [] };
    }
};

export const getMaterialRequirementById = async (requirementId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: 'Authentication required' };

        return await safeFetch(`${API_BASE_URL}/requirements/${requirementId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (err) {
        console.error('getMaterialRequirementById error:', err);
        return { success: false, message: 'Failed to fetch requirement' };
    }
};

export const updateMaterialRequirement = async (requirementId, updateData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: 'Authentication required' };

        const formattedData = {
            ...updateData,
            deliveryDate: updateData.deliveryDate ? new Date(updateData.deliveryDate).toISOString() : undefined,
            materials: updateData.materials?.map(m => ({ ...m, quantity: parseFloat(m.quantity) || 0 }))
        };

        return await safeFetch(`${API_BASE_URL}/requirements/${requirementId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formattedData)
        });
    } catch (err) {
        console.error('updateMaterialRequirement error:', err);
        return { success: false, message: 'Failed to update requirement' };
    }
};

export const cancelMaterialRequirement = async (requirementId, reason = '') => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: 'Authentication required' };

        return await safeFetch(`${API_BASE_URL}/requirements/${requirementId}/cancel`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ reason })
        });
    } catch (err) {
        console.error('cancelMaterialRequirement error:', err);
        return { success: false, message: 'Failed to cancel requirement' };
    }
};

export const deleteMaterialRequirement = async (id) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: 'Authentication required' };

        return await safeFetch(`${API_BASE_URL}/requirements/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (err) {
        console.error('deleteMaterialRequirement error:', err);
        return { success: false, message: 'Failed to delete requirement' };
    }
};

export const getRequirementStats = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: 'Authentication required' };

        return await safeFetch(`${API_BASE_URL}/requirements/stats/overview`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (err) {
        console.error('getRequirementStats error:', err);
        return { success: false, message: 'Failed to fetch stats' };
    }
};

export const submitQuoteForRequirement = async (requirementId, quoteData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: 'Authentication required' };

        return await safeFetch(`${API_BASE_URL}/requirements/${requirementId}/quotes`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(quoteData)
        });
    } catch (err) {
        console.error('submitQuoteForRequirement error:', err);
        return { success: false, message: 'Failed to submit quote' };
    }
};

export const acceptQuote = async (requirementId, quoteId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: 'Authentication required' };

        return await safeFetch(`${API_BASE_URL}/requirements/${requirementId}/quotes/${quoteId}/accept`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (err) {
        console.error('acceptQuote error:', err);
        return { success: false, message: 'Failed to accept quote' };
    }
};

/* =========================
   USER PROFILE
========================= */

export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: 'Authentication required' };

        return await safeFetch(`${API_BASE_URL}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (err) {
        console.error('getUserProfile error:', err);
        return { success: false, message: 'Failed to fetch profile' };
    }
};

/* =========================
   HELPERS
========================= */

export const validatePhoneNumber = (phone) => /^[0-9]{10}$/.test(phone);

export const formatRequirementForDisplay = (requirement) => ({
    id: requirement._id,
    requirementNumber: requirement.requirementNumber,
    projectType: requirement.projectType,
    projectLocation: requirement.projectLocation,
    deliveryDate: new Date(requirement.deliveryDate).toLocaleDateString('en-IN'),
    budgetRange: requirement.budgetRange,
    status: requirement.status,
    urgencyLevel: requirement.urgencyLevel,
    materials: requirement.materials || [],
    totalQuantity: requirement.materials?.reduce((sum, m) => sum + (m.quantity || 0), 0) || 0,
    createdAt: new Date(requirement.createdAt).toLocaleDateString('en-IN'),
    quotesCount: requirement.quotes?.length || 0
});

