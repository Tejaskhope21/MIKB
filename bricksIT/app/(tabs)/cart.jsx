import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCart } from '../../context/CartContext';

export default function CartScreen() {
    const router = useRouter();
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
    } = useCart();

    const [loading, setLoading] = useState(false);

    const calculateItemTotal = (item) => {
        return item.price * item.quantity;
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            Alert.alert('Cart Empty', 'Add some items to cart first');
            return;
        }

        // Check if user is logged in
        // You can implement your auth check here
        const isLoggedIn = true; // Replace with actual auth check

        if (isLoggedIn) {
            router.push('/checkout');
        } else {
            Alert.alert(
                'Login Required',
                'Please login to proceed to checkout',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => router.push('/login') }
                ]
            );
        }
    };

    const handleRemoveItem = (item) => {
        Alert.alert(
            'Remove Item',
            `Remove ${item.name} from cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => removeFromCart(item.id)
                }
            ]
        );
    };

    const calculateOrderSummary = () => {
        const subtotal = getCartTotal();
        const tax = Math.round(subtotal * 0.18);
        const shipping = subtotal > 5000 ? 0 : 150;
        const total = subtotal + tax + shipping;

        return { subtotal, tax, shipping, total };
    };

    const { subtotal, tax, shipping, total } = calculateOrderSummary();

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#800000" barStyle="light-content" />
            
            {/* New Header with #800000 background */}
            <View style={styles.newHeader}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                
                <View style={styles.headerCenter}>
                    <Text style={styles.newHeaderTitle}>My Cart</Text>
                    {cartItems.length > 0 && (
                        <Text style={styles.itemCount}>{getCartCount()} items</Text>
                    )}
                </View>
                
                {cartItems.length > 0 && (
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                'Clear Cart',
                                'Are you sure you want to clear your cart?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Clear',
                                        style: 'destructive',
                                        onPress: clearCart
                                    },
                                ]
                            );
                        }}
                        style={styles.clearAllButton}
                    >
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptySubtitle}>Add some products to get started</Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => router.push('/')}
                    >
                        <Text style={styles.shopButtonText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <ScrollView
                        style={styles.cartList}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.cartListContent}
                    >
                        {cartItems.map((item) => (
                            <View key={item.id} style={styles.cartItem}>
                                <Image
                                    source={{ uri: item.image || 'https://via.placeholder.com/100' }}
                                    style={styles.itemImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemName} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.itemUnit}>Unit: {item.unit}</Text>
                                    <Text style={styles.itemPrice}>₹{item.price?.toLocaleString()}</Text>

                                    <View style={styles.quantityContainer}>
                                        <TouchableOpacity
                                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                            style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Ionicons
                                                name="remove"
                                                size={18}
                                                color={item.quantity <= 1 ? "#ccc" : "#333"}
                                            />
                                        </TouchableOpacity>
                                        <Text style={styles.quantity}>{item.quantity}</Text>
                                        <TouchableOpacity
                                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                            style={styles.quantityButton}
                                        >
                                            <Ionicons name="add" size={18} color="#333" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.itemActions}>
                                    <Text style={styles.itemTotal}>
                                        ₹{calculateItemTotal(item).toLocaleString()}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveItem(item)}
                                        style={styles.removeButton}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.footer}>
                        <View style={styles.summary}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal ({getCartCount()} items)</Text>
                                <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Shipping</Text>
                                <Text style={styles.summaryValue}>
                                    {shipping === 0 ? 'Free' : `₹${shipping}`}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tax (18%)</Text>
                                <Text style={styles.summaryValue}>₹{tax.toLocaleString()}</Text>
                            </View>
                            <View style={[styles.summaryRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={handleCheckout}
                        >
                            <Text style={styles.checkoutButtonText}>
                                Proceed to Checkout ({cartItems.length} items)
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={() => router.push('/')}
                        >
                            <Text style={styles.continueButtonText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // New Header Styles
    newHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#800000',
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingTop: 50, // Extra padding for status bar
    },
    backButton: {
        padding: 4,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 12,
    },
    newHeaderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    itemCount: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    clearAllButton: {
        padding: 4,
    },
    // Rest of the styles remain the same
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    shopButton: {
        backgroundColor: '#800000',
        borderRadius: 8,
        paddingHorizontal: 32,
        paddingVertical: 12,
        marginTop: 24,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartList: {
        flex: 1,
    },
    cartListContent: {
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 12,
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        lineHeight: 18,
    },
    itemUnit: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    quantityButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonDisabled: {
        backgroundColor: '#f5f5f5',
    },
    quantity: {
        marginHorizontal: 12,
        fontSize: 16,
        fontWeight: '500',
        minWidth: 20,
        textAlign: 'center',
    },
    itemActions: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#800000',
    },
    removeButton: {
        padding: 4,
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    summary: {
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#800000',
    },
    checkoutButton: {
        backgroundColor: '#800000',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    continueButton: {
        borderWidth: 1,
        borderColor: '#800000',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#800000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});