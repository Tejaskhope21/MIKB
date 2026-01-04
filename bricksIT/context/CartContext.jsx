// context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const cartJson = await AsyncStorage.getItem('cart');
            const items = cartJson ? JSON.parse(cartJson) : [];
            setCartItems(items);
        } catch (error) {
            console.error('Error loading cart:', error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        try {
            const cartJson = await AsyncStorage.getItem('cart');
            const cart = cartJson ? JSON.parse(cartJson) : [];

            const existingIndex = cart.findIndex(item =>
                item.id === product.id || item._id === product._id
            );

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
            setCartItems(cart);
            return { success: true };
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        try {
            if (newQuantity < 1) {
                return await removeFromCart(productId);
            }

            const cartJson = await AsyncStorage.getItem('cart');
            const cart = cartJson ? JSON.parse(cartJson) : [];

            const itemIndex = cart.findIndex(item =>
                item.id === productId || item._id === productId
            );

            if (itemIndex > -1) {
                cart[itemIndex].quantity = newQuantity;
                await AsyncStorage.setItem('cart', JSON.stringify(cart));
                setCartItems(cart);
                return { success: true };
            }

            return { success: false, message: 'Item not found in cart' };
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const cartJson = await AsyncStorage.getItem('cart');
            const cart = cartJson ? JSON.parse(cartJson) : [];

            const updatedCart = cart.filter(item =>
                item.id !== productId && item._id !== productId
            );

            await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
            setCartItems(updatedCart);
            return { success: true };
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            await AsyncStorage.removeItem('cart');
            setCartItems([]);
            return { success: true };
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + ((item.price || 0) * (item.quantity || 1));
        }, 0);
    };

    const value = {
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartCount,
        getCartTotal,
        refreshCart: loadCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};