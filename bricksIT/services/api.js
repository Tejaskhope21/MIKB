import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/* ============================
   BASE URL CONFIGURATION
============================ */
const getBaseURL = () => {
    // For development on Android emulator
    if (__DEV__) {
        if (Platform.OS === 'android') {
            // Android emulator uses 10.0.2.2 for localhost
            return 'http://10.0.2.2:5000/api';
        } else if (Platform.OS === 'ios') {
            // iOS simulator
            return 'http://localhost:5000/api';
        }
    }
    // Production or web
    return 'https://bricks-backend-qyea.onrender.com/api';
};

const API_BASE_URL = getBaseURL();

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Increased timeout for mobile
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

/* ============================
   REQUEST INTERCEPTOR
============================ */
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token from storage:', error);
        }

        // Log request for debugging
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request Interceptor Error:', error);
        return Promise.reject(error);
    }
);

/* ============================
   RESPONSE INTERCEPTOR
============================ */
api.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            try {
                await AsyncStorage.multiRemove(['token', 'userData', 'userRole']);
            } catch (storageError) {
                console.error('Error clearing storage:', storageError);
            }
        }

        // Handle network errors
        if (!error.response) {
            return Promise.reject({
                ...error,
                message: 'Network error. Please check your internet connection.',
                isNetworkError: true
            });
        }

        return Promise.reject(error);
    }
);

/* ============================
   PRODUCT API METHODS
============================ */
export const productsAPI = {
    fetchAllProducts: async (params = {}) => {
        try {
            const response = await api.get('/products', { params });
            return response.data?.products || response.data || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            // Return sample data for testing if API fails
            return getSampleProducts();
        }
    },

    fetchProductById: async (productId) => {
        try {
            const response = await api.get(`/products/${productId}`);
            return response.data?.product || response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
            // Return sample product
            return getSampleProducts().find(p => p.id === productId) || null;
        }
    },

    fetchFeaturedProducts: async () => {
        try {
            const response = await api.get('/products/featured');
            return response.data?.products || [];
        } catch (error) {
            console.error('Error fetching featured products:', error);
            return getSampleProducts().slice(0, 8);
        }
    },

    fetchBestSellers: async () => {
        try {
            const response = await api.get('/products/best-sellers');
            return response.data?.products || [];
        } catch (error) {
            console.error('Error fetching best sellers:', error);
            return getSampleProducts().slice(4, 12);
        }
    },

    searchProducts: async (query, params = {}) => {
        try {
            const response = await api.get('/products/search', {
                params: { q: query, ...params }
            });
            return response.data?.products || [];
        } catch (error) {
            console.error('Error searching products:', error);
            // Filter sample products by query
            return getSampleProducts().filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.brand.toLowerCase().includes(query.toLowerCase()) ||
                p.category.toLowerCase().includes(query.toLowerCase())
            );
        }
    },

    searchAutocomplete: async (query, limit = 8) => {
        try {
            const response = await api.get('/products/autocomplete', {
                params: { q: query, limit }
            });
            return response.data || {
                success: true,
                products: [],
                categories: [],
                subcategories: [],
                query: query,
                totalResults: 0
            };
        } catch (error) {
            console.error('Error in autocomplete:', error);
            const filtered = getSampleProducts().filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, limit);

            return {
                success: true,
                products: filtered,
                categories: [],
                subcategories: [],
                query: query,
                totalResults: filtered.length
            };
        }
    },
};

/* ============================
   CATEGORY API METHODS
============================ */
export const categoriesAPI = {
    fetchAllCategories: async () => {
        try {
            const response = await api.get('/categories');
            const data = response.data?.categories || response.data || [];
            console.log('Categories loaded:', data.length);
            return data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Return sample categories for testing
            return getSampleCategories();
        }
    },

    fetchCategoryById: async (categoryId) => {
        try {
            const response = await api.get(`/categories/${categoryId}`);
            return response.data?.category || response.data;
        } catch (error) {
            console.error('Error fetching category:', error);
            return getSampleCategories().find(c => c.id === categoryId) || null;
        }
    },

    fetchCategoryProducts: async (categoryId, params = {}) => {
        try {
            const response = await api.get(`/categories/${categoryId}/products`, { params });
            return response.data?.products || [];
        } catch (error) {
            console.error('Error fetching category products:', error);
            return getSampleProducts().filter(p => p.categoryId === categoryId);
        }
    },

    fetchSubcategories: async (categoryId) => {
        try {
            const response = await api.get(`/categories/${categoryId}/subcategories`);
            return response.data?.subcategories || [];
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            return [];
        }
    },
};

/* ============================
   AUTH API METHODS
============================ */
export const authAPI = {
    loginUser: async (credentials) => {
        try {
            // Determine endpoint based on user type
            let endpoint;
            let payload;

            if (credentials.userType === 'seller') {
                endpoint = '/auth/seller/login';
                payload = {
                    email: credentials.email,
                    password: credentials.password,
                };
            } else if (credentials.userType === 'contractor') {
                endpoint = '/contractor/auth/login';
                payload = {
                    email: credentials.email,
                    password: credentials.password,
                };
            } else {
                endpoint = '/auth/user/login';
                payload = {
                    email: credentials.email,
                    password: credentials.password,
                };
            }

            console.log('Login attempt:', { endpoint, email: credentials.email });
            const response = await api.post(endpoint, payload);

            if (response.data?.token) {
                await AsyncStorage.setItem('token', response.data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
                await AsyncStorage.setItem('userRole', response.data.user?.role || 'user');
                console.log('Login successful, token saved');
            }

            return response.data;
        } catch (error) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            // For development, return mock user
            if (__DEV__) {
                const mockUser = {
                    token: 'mock-token-123',
                    user: {
                        id: '1',
                        name: 'Test User',
                        email: credentials.email,
                        role: credentials.userType || 'user',
                        phone: '9876543210'
                    }
                };

                await AsyncStorage.setItem('token', mockUser.token);
                await AsyncStorage.setItem('userData', JSON.stringify(mockUser.user));
                await AsyncStorage.setItem('userRole', mockUser.user.role);

                return mockUser;
            }

            throw error;
        }
    },

    registerUser: async (userData, userType) => {
        try {
            const endpoint = userType === 'seller'
                ? '/auth/seller/register'
                : userType === 'contractor'
                    ? '/contractor/auth/register'
                    : '/auth/user/register';

            const response = await api.post(endpoint, userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data?.user;
        } catch (error) {
            console.error('Error fetching profile:', error);
            // For testing, return mock profile
            const userData = await AsyncStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        }
    },

    updateProfile: async (data) => {
        try {
            const response = await api.put('/user/profile', data);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            try {
                await AsyncStorage.multiRemove(['token', 'userData', 'userRole']);
                console.log('Logged out successfully');
            } catch (storageError) {
                console.error('Error clearing storage:', storageError);
            }
        }
    },
};

/* ============================
   CART API METHODS
============================ */
export const cartAPI = {
    fetchCart: async () => {
        try {
            const response = await api.get('/cart');
            return response.data?.cart || [];
        } catch (error) {
            console.error('Error fetching cart:', error);
            // For testing, return empty cart
            return [];
        }
    },

    addToCart: async (productId, quantity = 1) => {
        try {
            const response = await api.post('/cart/add', { productId, quantity });
            return response.data;
        } catch (error) {
            console.error('Error adding to cart:', error);
            // For testing, return success
            return { success: true, message: 'Added to cart' };
        }
    },

    updateCartItem: async (productId, quantity) => {
        try {
            const response = await api.put('/cart/update', { productId, quantity });
            return response.data;
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    },

    removeFromCart: async (productId) => {
        try {
            const response = await api.delete(`/cart/remove/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    },

    clearCart: async () => {
        try {
            const response = await api.delete('/cart/clear');
            return response.data;
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    },
};

/* ============================
   HELPER FUNCTIONS
============================ */
export const hasSearchResults = (results) => {
    if (!results || !results.success) return false;

    return (
        results.products?.length > 0 ||
        results.categories?.length > 0 ||
        results.subcategories?.length > 0
    );
};

export const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString('en-IN')}`;
};

export const getProductImage = (images) => {
    if (Array.isArray(images) && images.length > 0 && images[0]) {
        return images[0];
    }
    return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop';
};

/* ============================
   SAMPLE DATA FOR TESTING
============================ */
const getSampleCategories = () => [
    { id: '1', name: 'Cement', image: 'https://via.placeholder.com/150/800000/ffffff?text=Cement' },
    { id: '2', name: 'Steel', image: 'https://via.placeholder.com/150/333333/ffffff?text=Steel' },
    { id: '3', name: 'Bricks', image: 'https://via.placeholder.com/150/cc0000/ffffff?text=Bricks' },
    { id: '4', name: 'Tiles', image: 'https://via.placeholder.com/150/0066cc/ffffff?text=Tiles' },
    { id: '5', name: 'Paints', image: 'https://via.placeholder.com/150/ff9900/ffffff?text=Paints' },
    { id: '6', name: 'Plumbing', image: 'https://via.placeholder.com/150/009999/ffffff?text=Plumbing' },
];

const getSampleProducts = () => [
    {
        id: '1',
        name: 'UltraTech Cement 53 Grade',
        brand: 'UltraTech',
        price: 380,
        originalPrice: 420,
        discount: 10,
        images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop'],
        category: 'Cement',
        categoryId: '1',
        inStock: true,
        inventory: { stock: 100 },
        description: 'Premium quality 53 grade cement for construction',
        rating: 4.5
    },
    {
        id: '2',
        name: 'TATA TMT Steel Bars',
        brand: 'TATA',
        price: 65000,
        originalPrice: 68000,
        discount: 5,
        images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop'],
        category: 'Steel',
        categoryId: '2',
        inStock: true,
        inventory: { stock: 50 },
        description: 'High strength TMT steel bars',
        rating: 4.7
    },
    {
        id: '3',
        name: 'Red Clay Bricks',
        brand: 'Classic',
        price: 8,
        originalPrice: 10,
        discount: 20,
        images: ['https://images.unsplash.com/photo-1581092580497-e0d4cb184827?w=400&h=400&fit=crop'],
        category: 'Bricks',
        categoryId: '3',
        inStock: true,
        inventory: { stock: 5000 },
        description: 'High quality red clay bricks',
        rating: 4.3
    },
    {
        id: '4',
        name: 'Vitrified Floor Tiles',
        brand: 'Kajaria',
        price: 45,
        originalPrice: 50,
        discount: 10,
        images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop'],
        category: 'Tiles',
        categoryId: '4',
        inStock: true,
        inventory: { stock: 200 },
        description: 'Premium vitrified floor tiles',
        rating: 4.6
    },
    {
        id: '5',
        name: 'Asian Paints Royale',
        brand: 'Asian Paints',
        price: 2800,
        originalPrice: 3200,
        discount: 12,
        images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop'],
        category: 'Paints',
        categoryId: '5',
        inStock: true,
        inventory: { stock: 150 },
        description: 'Premium emulsion paint with smooth finish',
        rating: 4.8
    },
    {
        id: '6',
        name: 'PVC Pipes Set',
        brand: 'Finolex',
        price: 1200,
        originalPrice: 1500,
        discount: 20,
        images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop'],
        category: 'Plumbing',
        categoryId: '6',
        inStock: true,
        inventory: { stock: 80 },
        description: 'Complete PVC plumbing pipes set',
        rating: 4.4
    },
    {
        id: '7',
        name: 'Ambuja Cement',
        brand: 'Ambuja',
        price: 370,
        originalPrice: 400,
        discount: 8,
        images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop'],
        category: 'Cement',
        categoryId: '1',
        inStock: true,
        inventory: { stock: 200 },
        description: 'Quality cement for all construction needs',
        rating: 4.5
    },
    {
        id: '8',
        name: 'JSW Steel',
        brand: 'JSW',
        price: 62000,
        originalPrice: 65000,
        discount: 5,
        images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop'],
        category: 'Steel',
        categoryId: '2',
        inStock: true,
        inventory: { stock: 40 },
        description: 'Premium quality steel bars',
        rating: 4.6
    }
];

/* ============================
   LEGACY COMPATIBILITY
============================ */
export const fetchProducts = productsAPI.fetchAllProducts;
export const fetchProductById = productsAPI.fetchProductById;
export const fetchCategories = categoriesAPI.fetchAllCategories;
export const fetchProductsByCategory = categoriesAPI.fetchCategoryProducts;
export const loginUser = authAPI.loginUser;
export const registerUser = authAPI.registerUser;
export const fetchCart = cartAPI.fetchCart;
export const addToCartAPI = cartAPI.addToCart;
export const createOrder = async (orderData) => {
    try {
        const response = await api.post('/orders', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        // For testing
        return { success: true, orderId: `ORD-${Date.now()}` };
    }
};
export const fetchUserOrders = async () => {
    try {
        const response = await api.get('/orders/my-orders');
        return response.data?.orders || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};

export default api;