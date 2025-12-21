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
// export const fetchCategories = async () => {
//     try {
//         const data = await safeFetch(`${API_BASE_URL}/categories`);
//         return data.categories || data || [];
//     } catch (err) {
//         console.error('fetchCategories error:', err);
//         throw err;
//     }
// };

// Get products with optional filters
// export const fetchProducts = async (params = {}) => {
//     try {
//         const query = new URLSearchParams(params).toString();
//         const url = query ? `${API_BASE_URL}/products?${query}` : `${API_BASE_URL}/products`;
//         const data = await safeFetch(url);
//         return data.products || data || [];
//     } catch (err) {
//         console.error('fetchProducts error:', err);
//         throw err;
//     }
// };

// Get single category by numericId
// export const fetchCategoryById = async (id) => {
//     try {
//         const data = await safeFetch(`${API_BASE_URL}/categories/${id}`);
//         return data.category || data;
//     } catch (err) {
//         console.error('fetchCategoryById error:', err);
//         throw err;
//     }
// };
// -------------------------------------------------------------------------------//




// * =========================
//    SUBCATEGORY API FUNCTIONS
// ========================= */
// Update your fetchSubcategories function in api.js
export const fetchSubcategories = async (categoryId) => {
    try {
        // First try the new endpoint
        const data = await safeFetch(`${API_BASE_URL}/categories/${categoryId}/subcategories`);

        if (data.success === false && data.message.includes('Route not found')) {
            console.log('Subcategories endpoint not found, fetching category directly...');

            // Fallback: get category and extract subcategories
            const categoryData = await fetchCategoryDetails(categoryId);

            if (categoryData && categoryData.subcategories) {
                // Get product counts for each subcategory
                const allProducts = await fetchProductsByCategory(categoryId);

                const subcategoriesWithCount = categoryData.subcategories.map(sub => {
                    // Count products in this subcategory
                    const productCount = allProducts.filter(product => {
                        return product.subcategoryId === sub.numericId ||
                            product.subcategoryId === sub._id?.toString() ||
                            product.subcategory?.numericId === sub.numericId ||
                            product.subcategory?._id === sub._id;
                    }).length;

                    return {
                        _id: sub._id,
                        numericId: sub.numericId,
                        title: sub.title,
                        items: sub.items || [],
                        description: sub.description || `Browse ${sub.title} products`,
                        productCount: productCount
                    };
                });

                return subcategoriesWithCount;
            }

            return [];
        }

        return data.subcategories || data || [];
    } catch (err) {
        console.error('fetchSubcategories error:', err);
        return [];
    }
};

// Update fetchSubcategoryDetails with fallback
export const fetchSubcategoryDetails = async (categoryId, subcategoryId) => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/categories/${categoryId}/subcategories/${subcategoryId}`);

        if (data.success === false && data.message.includes('Route not found')) {
            console.log('Subcategory details endpoint not found, using fallback...');

            // Fallback: get all subcategories and find the right one
            const subcategories = await fetchSubcategories(categoryId);
            const subcategory = subcategories.find(sub =>
                sub._id === subcategoryId ||
                sub.numericId?.toString() === subcategoryId
            );

            if (subcategory) {
                return subcategory;
            }

            return {
                _id: subcategoryId,
                numericId: subcategoryId,
                title: `Subcategory ${subcategoryId}`,
                name: `Subcategory ${subcategoryId}`,
                description: `Browse products in this subcategory`,
                productCount: 0
            };
        }

        return data.subcategory || data;
    } catch (err) {
        console.error('fetchSubcategoryDetails error:', err);
        // Fallback
        const subcategories = await fetchSubcategories(categoryId);
        const subcategory = subcategories.find(sub =>
            sub._id === subcategoryId ||
            sub.numericId?.toString() === subcategoryId
        );

        return subcategory || {
            _id: subcategoryId,
            numericId: subcategoryId,
            title: `Subcategory ${subcategoryId}`,
            name: `Subcategory ${subcategoryId}`,
            description: `Browse products in this subcategory`,
            productCount: 0
        };
    }
};

// Keep your existing fetchProductsBySubcategory as it has fallback logic

export const fetchProductsBySubcategory = async (categoryId, subcategoryId, filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const url = `${API_BASE_URL}/categories/${categoryId}/subcategories/${subcategoryId}/products?${queryParams.toString()}`;

        const data = await safeFetch(url);

        if (data.success === false) {
            console.warn('fetchProductsBySubcategory failed:', data.message);
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

const fallbackProductsBySubcategory = async (categoryId, subcategoryId, filters = {}) => {
    try {
        const allProducts = await fetchProductsByCategory(categoryId);

        let filteredProducts = allProducts.filter(product => {
            return product.subcategoryId === subcategoryId ||
                product.subcategoryId?.toString() === subcategoryId ||
                product.subcategory?._id === subcategoryId ||
                product.subcategory?.id === subcategoryId ||
                product.subcategory?.numericId?.toString() === subcategoryId;
        });

        if (filters.minPrice) {
            filteredProducts = filteredProducts.filter(p =>
                (p.price || 0) >= parseFloat(filters.minPrice)
            );
        }
        if (filters.maxPrice) {
            filteredProducts = filteredProducts.filter(p =>
                (p.price || 0) <= parseFloat(filters.maxPrice)
            );
        }
        if (filters.brand) {
            filteredProducts = filteredProducts.filter(p =>
                p.brand === filters.brand
            );
        }
        if (filters.search) {
            const query = filters.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p =>
                p.name?.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.brand?.toLowerCase().includes(query)
            );
        }

        if (filters.sortBy) {
            filteredProducts = sortProducts(filteredProducts, filters.sortBy);
        }

        const brands = [...new Set(filteredProducts
            .filter(p => p.brand)
            .map(p => p.brand)
            .sort())];

        return {
            products: filteredProducts,
            total: filteredProducts.length,
            brands: brands,
            minPrice: filters.minPrice || 0,
            maxPrice: filters.maxPrice || 0,
            page: 1,
            pages: 1
        };
    } catch (err) {
        console.error('fallbackProductsBySubcategory error:', err);
        return {
            products: [],
            total: 0,
            brands: [],
            minPrice: 0,
            maxPrice: 0,
            page: 1,
            pages: 0
        };
    }
};

const sortProducts = (products, sortBy) => {
    return [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return (a.price || 0) - (b.price || 0);
            case 'price-high':
                return (b.price || 0) - (a.price || 0);
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'discount':
                const discountA = a.discount || a.discountPercentage || 0;
                const discountB = b.discount || b.discountPercentage || 0;
                return discountB - discountA;
            case 'name-asc':
                return (a.name || '').localeCompare(b.name || '');
            case 'name-desc':
                return (b.name || '').localeCompare(a.name || '');
            default:
                return 0;
        }
    });
};

// export const fetchSubcategoryDetails = async (categoryId, subcategoryId) => {
//     try {
//         const data = await safeFetch(`${API_BASE_URL}/categories/${categoryId}/subcategories/${subcategoryId}`);

//         if (data.success === false) {
//             console.warn('fetchSubcategoryDetails failed:', data.message);
//             return await fallbackSubcategoryDetails(categoryId, subcategoryId);
//         }

//         return data.subcategory || data;
//     } catch (err) {
//         console.error('fetchSubcategoryDetails error:', err);
//         return await fallbackSubcategoryDetails(categoryId, subcategoryId);
//     }
// };

const fallbackSubcategoryDetails = async (categoryId, subcategoryId) => {
    try {
        const subcategories = await fetchSubcategories(categoryId);

        const subcategory = subcategories.find(sub =>
            sub._id === subcategoryId ||
            sub.id === subcategoryId ||
            sub.numericId?.toString() === subcategoryId
        );

        if (subcategory) {
            return subcategory;
        }

        return {
            _id: subcategoryId,
            id: subcategoryId,
            numericId: subcategoryId,
            title: `Subcategory ${subcategoryId}`,
            name: `Subcategory ${subcategoryId}`,
            description: `Browse products in this subcategory`
        };
    } catch (err) {
        console.error('fallbackSubcategoryDetails error:', err);
        return {
            _id: subcategoryId,
            id: subcategoryId,
            numericId: subcategoryId,
            title: `Subcategory ${subcategoryId}`,
            name: `Subcategory ${subcategoryId}`,
            description: `Browse products in this subcategory`
        };
    }
};

/* =========================
   CATEGORY & PRODUCT API FUNCTIONS
========================= */
export const fetchProductsByCategory = async (categoryId) => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/products/category/${categoryId}?showAll=true`);
        return data.products || data || [];
    } catch (err) {
        console.error('fetchProductsByCategory error:', err);
        throw err;
    }
};

export const fetchCategoryDetails = async (categoryId) => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/categories/${categoryId}`);
        return data.category || data;
    } catch (err) {
        console.error('fetchCategoryDetails error:', err);
        throw err;
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
        throw err;
    }
};

export const fetchCategories = async () => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/categories`);
        return data.categories || data || [];
    } catch (err) {
        console.error('fetchCategories error:', err);
        throw err;
    }
};

export const fetchCategoryById = async (id) => {
    try {
        const data = await safeFetch(`${API_BASE_URL}/categories/${id}`);
        return data.category || data;
    } catch (err) {
        console.error('fetchCategoryById error:', err);
        throw err;
    }
};

/* =========================
   MATERIAL REQUIREMENT API FUNCTIONS
========================= */



export const createMaterialRequirement = async (requirementData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false,
                message: 'Authentication required. Please login.',
                error: 'No authentication token'
            };
        }

        // Prepare data for backend
        const formattedData = {
            ...requirementData,
            // Ensure phone is string
            phone: requirementData.phone.toString(),
            // Convert deliveryDate to ISO string
            deliveryDate: new Date(requirementData.deliveryDate).toISOString(),
            // Convert materials quantity to number
            materials: requirementData.materials.map(material => ({
                ...material,
                quantity: parseFloat(material.quantity) || 0
            }))
        };

        // CORRECT URL: /api/requirements
        const url = `${API_BASE_URL}/requirements`;
        const response = await safeFetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedData)
        });

        return response;
    } catch (err) {
        console.error('createMaterialRequirement error:', err);
        return {
            success: false,
            message: err.message || 'Failed to submit requirement',
            error: err.message
        };
    }
};

// Get user's material requirements
export const getUserMaterialRequirements = async (params = {}) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false,
                message: 'Authentication required',
                data: [],
                pagination: {}
            };
        }

        const { page = 1, limit = 10, status, sort = '-createdAt' } = params;

        let url = `${API_BASE_URL}/requirements/my?page=${page}&limit=${limit}&sort=${sort}`;

        if (status) {
            url += `&status=${status}`;
        }

        const response = await safeFetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response;
    } catch (err) {
        console.error('getUserMaterialRequirements error:', err);
        return {
            success: false,
            message: 'Failed to fetch requirements',
            data: [],
            pagination: {},
            error: err.message
        };
    }
};

// Get single requirement by ID
export const getMaterialRequirementById = async (requirementId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false,
                message: 'Authentication required'
            };
        }

        const url = `${API_BASE_URL}/requirements/${requirementId}`;
        const response = await safeFetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response;
    } catch (err) {
        console.error('getMaterialRequirementById error:', err);
        return {
            success: false,
            message: 'Failed to fetch requirement details',
            error: err.message
        };
    }
};

// Update material requirement
export const updateMaterialRequirement = async (requirementId, updateData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false,
                message: 'Authentication required'
            };
        }

        const formattedData = {
            ...updateData,
            // Format dates
            deliveryDate: updateData.deliveryDate ?
                new Date(updateData.deliveryDate).toISOString() : undefined,
            // Format materials
            materials: updateData.materials?.map(material => ({
                ...material,
                quantity: parseFloat(material.quantity) || 0
            }))
        };

        const url = `${API_BASE_URL}/requirements/${requirementId}`;
        const response = await safeFetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formattedData)
        });

        return response;
    } catch (err) {
        console.error('updateMaterialRequirement error:', err);
        return {
            success: false,
            message: 'Failed to update requirement',
            error: err.message
        };
    }
};

// Cancel material requirement
export const cancelMaterialRequirement = async (requirementId, reason = '') => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false,
                message: 'Authentication required'
            };
        }

        const url = `${API_BASE_URL}/requirements/${requirementId}/cancel`;
        const response = await safeFetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });

        return response;
    } catch (err) {
        console.error('cancelMaterialRequirement error:', err);
        return {
            success: false,
            message: 'Failed to cancel requirement',
            error: err.message
        };
    }
};

// Get requirement statistics
export const getRequirementStats = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false,
                message: 'Authentication required',
                data: null
            };
        }

        const url = `${API_BASE_URL}/requirements/stats/overview`;
        const response = await safeFetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response;
    } catch (err) {
        console.error('getRequirementStats error:', err);
        return {
            success: false,
            message: 'Failed to fetch statistics',
            data: null,
            error: err.message
        };
    }
};

// Submit quote for requirement (for sellers)
export const submitQuoteForRequirement = async (requirementId, quoteData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false,
                message: 'Authentication required'
            };
        }

        const url = `${API_BASE_URL}/requirements/${requirementId}/quotes`;
        const response = await safeFetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(quoteData)
        });

        return response;
    } catch (err) {
        console.error('submitQuoteForRequirement error:', err);
        return {
            success: false,
            message: 'Failed to submit quote',
            error: err.message
        };
    }
};

// Accept quote (for users)
export const acceptQuote = async (requirementId, quoteId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false,
                message: 'Authentication required'
            };
        }

        const url = `${API_BASE_URL}/requirements/${requirementId}/quotes/${quoteId}/accept`;
        const response = await safeFetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response;
    } catch (err) {
        console.error('acceptQuote error:', err);
        return {
            success: false,
            message: 'Failed to accept quote',
            error: err.message
        };
    }
};



// Helper function to validate phone
export const validatePhoneNumber = (phone) => {
    return /^[0-9]{10}$/.test(phone);
};

// Helper function to format requirement for display
export const formatRequirementForDisplay = (requirement) => {
    return {
        id: requirement._id,
        requirementNumber: requirement.requirementNumber,
        projectType: requirement.projectType,
        projectLocation: requirement.projectLocation,
        deliveryDate: new Date(requirement.deliveryDate).toLocaleDateString('en-IN'),
        budgetRange: requirement.budgetRange,
        status: requirement.status,
        urgencyLevel: requirement.urgencyLevel,
        materials: requirement.materials || [],
        totalQuantity: requirement.materials?.reduce((sum, mat) => sum + (mat.quantity || 0), 0) || 0,
        createdAt: new Date(requirement.createdAt).toLocaleDateString('en-IN'),
        quotesCount: requirement.quotes?.length || 0
    };
};

export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false,
                message: 'Authentication required',
                data: null
            };
        }

        const url = `${API_BASE_URL}/user/profile`;
        const response = await safeFetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Return the response as-is, don't try to access .data.data
        return response;
    } catch (err) {
        console.error('getUserProfile error:', err);
        return {
            success: false,
            message: 'Failed to fetch user profile',
            data: null,
            error: err.message
        };
    }
};


export const deleteMaterialRequirement = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/material-requirements/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Delete requirement error:', error);
        return {
            success: false,
            message: 'Failed to delete requirement'
        };
    }
};