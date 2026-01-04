// services/api.js - FIXED VERSION
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://bricks-backend-qyea.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.log('Error getting token:', error);
    }
    return config;
});

// Sample data
const sampleCategories = [
    { _id: '1', name: 'Cement', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400' },
    { _id: '2', name: 'Steel', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400' },
    { _id: '3', name: 'Bricks', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400' },
    { _id: '4', name: 'Tiles', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400' },
    { _id: '5', name: 'Paints', image: 'https://images.unsplash.com/photo-1545006397-ffe42fa2db97?w=400' },
    { _id: '6', name: 'Plumbing', image: 'https://images.unsplash.com/photo-1628793320654-4a54f8f7bb05?w=400' },
];

const sampleProducts = [
    {
        _id: '1',
        name: 'UltraTech Cement 53 Grade',
        brand: 'UltraTech',
        price: 380,
        originalPrice: 420,
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        category: 'Cement',
        inStock: true,
        rating: 4.5,
    },
    {
        _id: '2',
        name: 'TATA Tiscon TMT Steel Bars',
        brand: 'TATA',
        price: 65000,
        originalPrice: 68000,
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
        category: 'Steel',
        inStock: true,
        rating: 4.7,
    },
    {
        _id: '3',
        name: 'Red Clay Bricks',
        brand: 'Premium Bricks',
        price: 8,
        originalPrice: 10,
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
        category: 'Bricks',
        inStock: true,
        rating: 4.2,
    },
    {
        _id: '4',
        name: 'Kajaria Vitrified Tiles',
        brand: 'Kajaria',
        price: 55,
        originalPrice: 65,
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
        category: 'Tiles',
        inStock: true,
        rating: 4.6,
    },
];

// Helper functions
export const getProductImage = (images) => {
    if (Array.isArray(images) && images.length > 0) {
        return images[0];
    }
    return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400';
};

export const formatPrice = (price) => {
    const num = Number(price) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
};

// Categories API
export const fetchAllCategories = async () => {
    try {
        const response = await api.get('/v1/categories');
        return response.data.categories || response.data || sampleCategories;
    } catch (error) {
        console.warn('Categories API error, using fallback');
        return sampleCategories;
    }
};

export const fetchCategoryById = async (id) => {
    try {
        const response = await api.get(`/v1/categories/${id}`);
        return response.data.category || response.data || null;
    } catch (error) {
        console.error('Fetch category error:', error);
        return null;
    }
};

// Products API
export const fetchFeaturedProducts = async () => {
    try {
        const response = await api.get('/v1/products');
        const data = response.data.products || response.data || [];
        // Return first 8 products as featured
        return data.slice(0, 8);
    } catch (error) {
        console.warn('Products API error, using fallback');
        return sampleProducts;
    }
};

export const fetchAllProducts = async (params = {}) => {
    try {
        const response = await api.get('/v1/products', { params });
        return response.data.products || response.data || sampleProducts;
    } catch (error) {
        console.error('Fetch products error:', error);
        return sampleProducts;
    }
};

export const fetchProductById = async (id) => {
    try {
        const response = await api.get(`/v1/products/${id}`);
        return response.data.product || response.data || sampleProducts[0];
    } catch (error) {
        console.error('Fetch product by ID error:', error);
        return sampleProducts[0];
    }
};

export const fetchProductsByCategory = async (categoryId) => {
    try {
        const response = await api.get(`/v1/products/category/${categoryId}`);
        return response.data.products || response.data || [];
    } catch (error) {
        console.error('Fetch products by category error:', error);
        return sampleProducts;
    }
};

export const searchProducts = async (query) => {
    try {
        const response = await api.get('/v1/search', { params: { q: query } });
        return response.data.products || response.data || [];
    } catch (error) {
        console.error('Search products error:', error);
        return [];
    }
};

// Cart API (local storage)
export const fetchCart = async () => {
    try {
        const cartJson = await AsyncStorage.getItem('cart');
        return cartJson ? JSON.parse(cartJson) : [];
    } catch (error) {
        console.warn('Fetch cart error:', error.message);
        return [];
    }
};

export const addToCart = async (product, quantity = 1) => {
    try {
        const cartJson = await AsyncStorage.getItem('cart');
        const cart = cartJson ? JSON.parse(cartJson) : [];

        const existingIndex = cart.findIndex(item => item.id === product.id || item._id === product._id);

        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id || product._id,
                _id: product._id || product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                image: product.image || product.images?.[0],
                quantity: quantity,
                inStock: product.inStock,
                category: product.category
            });
        }

        await AsyncStorage.setItem('cart', JSON.stringify(cart));
        return { success: true, cart };
    } catch (error) {
        console.error('Add to cart error:', error);
        throw error;
    }
};

export const updateCartItem = async (productId, quantity) => {
    try {
        if (quantity < 1) {
            return await removeFromCart(productId);
        }

        const cartJson = await AsyncStorage.getItem('cart');
        const cart = cartJson ? JSON.parse(cartJson) : [];

        const itemIndex = cart.findIndex(item => item.id === productId || item._id === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity = quantity;
            await AsyncStorage.setItem('cart', JSON.stringify(cart));
            return { success: true, cart };
        }

        return { success: false, message: 'Item not found in cart' };
    } catch (error) {
        console.error('Update cart error:', error);
        throw error;
    }
};

export const removeFromCart = async (productId) => {
    try {
        const cartJson = await AsyncStorage.getItem('cart');
        const cart = cartJson ? JSON.parse(cartJson) : [];

        const updatedCart = cart.filter(item => item.id !== productId && item._id !== productId);
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
        return { success: true, cart: updatedCart };
    } catch (error) {
        console.error('Remove from cart error:', error);
        throw error;
    }
};

export const clearCart = async () => {
    try {
        await AsyncStorage.removeItem('cart');
        return { success: true, cart: [] };
    } catch (error) {
        console.error('Clear cart error:', error);
        throw error;
    }
};

// Auth API
export const login = async (email, password) => {
    try {
        const response = await api.post('/v1/auth/login', { email, password });

        if (response.data.success && response.data.token) {
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(response.data.user || {}));
        }

        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('cart');
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// For backward compatibility (to fix the import errors)
export const categoriesAPI = { fetchAllCategories, fetchCategoryById };
export const productsAPI = {
    fetchFeaturedProducts,
    fetchAllProducts,
    fetchProductById,
    fetchProductsByCategory,
    searchProducts
};
export const cartAPI = {
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
export const authAPI = { login, logout };