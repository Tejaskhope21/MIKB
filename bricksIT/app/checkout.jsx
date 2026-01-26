// app/checkout.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
    Image,
    Modal,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://bricks-backend-qyea.onrender.com/api';

export default function CheckoutScreen() {
    const router = useRouter();
    const { cartItems, getCartTotal, clearCart, getCartCount } = useCart();

    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [bankTransferDetails, setBankTransferDetails] = useState({
        transactionId: '',
        screenshot: null,
        bankName: '',
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: ''
    });
    const [notes, setNotes] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    // Price calculations
    const subtotal = getCartTotal();
    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal > 5000 ? 0 : 150;
    const total = subtotal + tax + shipping;

    // Bank details
    const bankDetails = {
        accountName: "Tejas Khope",
        accountNumber: "970318210000861",
        ifscCode: "BKID0009703",
        bankName: "Bank of India",
        branch: "Mumbai Main Branch",
        upiId: "khopetejas6-1@oksbi"
    };

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (userToken) {
            fetchUserProfile();
        }
    }, [userToken]);

    useEffect(() => {
        if (userProfile) {
            fetchUserAddresses();
        }
    }, [userProfile]);

    const loadUserData = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert(
                    'Login Required',
                    'Please login to proceed to checkout',
                    [
                        { text: 'Cancel', onPress: () => router.back() },
                        { text: 'Login', onPress: () => router.push('/login') }
                    ]
                );
                return;
            }
            setUserToken(token);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success && data.user) {
                setUserProfile(data.user);
            } else {
                console.error('Failed to fetch user profile:', data.message);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchUserAddresses = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            const userAddresses = data.user?.addresses || [];

            setAddresses(userAddresses);

            if (userAddresses.length > 0) {
                const defaultAddr = userAddresses.find(a => a.isDefault) || userAddresses[0];
                setSelectedAddressId(defaultAddr._id);
            }
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
            if (err.response?.status === 401) {
                router.push('/login');
            }
        }
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
    };

    const handleFileUpload = async () => {
        // For React Native, you would use ImagePicker or DocumentPicker here
        Alert.alert(
            'Upload Payment Proof',
            'This feature requires react-native-image-picker or react-native-document-picker setup.',
            [{ text: 'OK' }]
        );
    };

    const validateForm = () => {
        if (!selectedAddressId) {
            Alert.alert('Address Required', 'Please select a delivery address');
            return false;
        }

        if (paymentMethod === 'bank_transfer') {
            if (!bankTransferDetails.transactionId.trim()) {
                Alert.alert('Transaction ID Required', 'Please enter transaction ID / UPI reference');
                return false;
            }
            if (!bankTransferDetails.bankName.trim()) {
                Alert.alert('Bank Name Required', 'Please enter bank name');
                return false;
            }
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Authentication Error', 'Please login again');
                router.push('/login');
                return;
            }

            const selectedAddrObj = addresses.find(a => a._id === selectedAddressId);
            if (!selectedAddrObj) {
                Alert.alert('Address Error', 'Selected address not found');
                setLoading(false);
                return;
            }

            const shippingAddress = {
                address: selectedAddrObj.addressLine || selectedAddrObj.address || '',
                city: selectedAddrObj.city || '',
                state: selectedAddrObj.state || '',
                pincode: selectedAddrObj.pincode || '',
                fullName: selectedAddrObj.fullName || '',
                phone: selectedAddrObj.phone || ''
            };

            const payload = {
                items: cartItems.map(item => ({
                    productId: item.id || item._id,
                    quantity: item.quantity
                })),
                shippingAddress,
                paymentMethod: paymentMethod === 'cod' ? 'COD' : 'BANK_TRANSFER',
                notes: notes.trim()
            };

            if (paymentMethod === 'bank_transfer') {
                payload.paymentProof = {
                    transactionId: bankTransferDetails.transactionId,
                    screenshot: bankTransferDetails.screenshot,
                    userBankDetails: {
                        bankName: bankTransferDetails.bankName,
                        accountName: bankTransferDetails.accountName,
                        accountNumber: bankTransferDetails.accountNumber,
                        ifscCode: bankTransferDetails.ifscCode,
                        upiId: bankTransferDetails.upiId,
                        transactionTime: new Date().toLocaleString('en-IN')
                    },
                    companyBankDetails: {
                        accountName: bankDetails.accountName,
                        accountNumber: bankDetails.accountNumber,
                        ifscCode: bankDetails.ifscCode,
                        upiId: bankDetails.upiId,
                        bankName: bankDetails.bankName,
                        branch: bankDetails.branch
                    },
                    amount: total
                };
            }

            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error ${response.status}`);
            }

            const data = await response.json();
            
            // Extract order ID
            let orderId = data._id || data.id || data.order?._id || data.orderId;
            if (!orderId) {
                orderId = 'TEMP_' + Date.now().toString().slice(-8);
            }

            // Clear cart after successful order
            clearCart();

            // Navigate to order success
            router.push(`/order-success/${orderId}`);

        } catch (error) {
            console.error('Order failed:', error);
            Alert.alert(
                'Order Failed',
                error.message || 'Failed to place order. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (!userToken) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#800000" />
                <Text style={styles.loadingText}>Checking authentication...</Text>
            </SafeAreaView>
        );
    }

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer}>
                <View style={styles.emptyContent}>
                    <Ionicons name="cart-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => router.push('/')}
                    >
                        <Text style={styles.shopButtonText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#800000" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Delivery Address Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="location-outline" size={28} color="#800000" />
                            <Text style={styles.sectionTitle}>Delivery Address</Text>
                        </View>

                        {addresses.length === 0 ? (
                            <View style={styles.noAddressContainer}>
                                <Text style={styles.noAddressText}>No saved addresses</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/profile?tab=addresses')}
                                    style={styles.addAddressLink}
                                >
                                    <Text style={styles.addAddressLinkText}>Add Address</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <View style={styles.addressGrid}>
                                    {addresses.map(addr => (
                                        <TouchableOpacity
                                            key={addr._id}
                                            style={[
                                                styles.addressCard,
                                                selectedAddressId === addr._id && styles.addressCardSelected
                                            ]}
                                            onPress={() => setSelectedAddressId(addr._id)}
                                        >
                                            <View style={styles.addressCardHeader}>
                                                <Text style={styles.addressName}>{addr.fullName}</Text>
                                                {selectedAddressId === addr._id && (
                                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                                )}
                                            </View>
                                            {addr.isDefault && (
                                                <View style={styles.defaultBadge}>
                                                    <Text style={styles.defaultBadgeText}>Default</Text>
                                                </View>
                                            )}
                                            <Text style={styles.addressText}>
                                                {addr.addressLine || addr.address}
                                            </Text>
                                            <Text style={styles.addressText}>
                                                {addr.city}, {addr.state} - {addr.pincode}
                                            </Text>
                                            <Text style={styles.addressPhone}>Phone: {addr.phone}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TouchableOpacity
                                    onPress={() => router.push('/profile?tab=addresses')}
                                    style={styles.addNewAddressLink}
                                >
                                    <Ionicons name="add-circle-outline" size={24} color="#800000" />
                                    <Text style={styles.addNewAddressLinkText}>Add New Address</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Payment Method Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <FontAwesome name="credit-card" size={28} color="#800000" />
                            <Text style={styles.sectionTitle}>Payment Method</Text>
                        </View>

                        {/* COD Option */}
                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                paymentMethod === 'cod' && styles.paymentOptionSelected
                            ]}
                            onPress={() => handlePaymentMethodChange('cod')}
                        >
                            <View style={styles.paymentOptionHeader}>
                                <View style={styles.codBadge}>
                                    <Text style={styles.codBadgeText}>COD</Text>
                                </View>
                                <View style={styles.paymentOptionText}>
                                    <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                                    <Text style={styles.paymentOptionDesc}>
                                        Pay with cash when you receive your order
                                    </Text>
                                </View>
                                {paymentMethod === 'cod' && (
                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Bank Transfer Option */}
                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                paymentMethod === 'bank_transfer' && styles.paymentOptionSelected
                            ]}
                            onPress={() => handlePaymentMethodChange('bank_transfer')}
                        >
                            <View style={styles.paymentOptionHeader}>
                                <MaterialIcons name="account-balance" size={24} color="#3b82f6" />
                                <View style={styles.paymentOptionText}>
                                    <Text style={styles.paymentOptionTitle}>Bank Transfer / UPI</Text>
                                    <Text style={styles.paymentOptionDesc}>Direct bank or UPI payment</Text>
                                </View>
                                {paymentMethod === 'bank_transfer' && (
                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                )}
                            </View>

                            {paymentMethod === 'bank_transfer' && (
                                <View style={styles.bankTransferDetails}>
                                    {/* Company Bank Details */}
                                    <View style={styles.companyBankDetails}>
                                        <Text style={styles.bankDetailsTitle}>Transfer to Company Account</Text>
                                        <View style={styles.bankDetailsGrid}>
                                            <View style={styles.bankDetailRow}>
                                                <Text style={styles.bankDetailLabel}>Account Name:</Text>
                                                <Text style={styles.bankDetailValue}>{bankDetails.accountName}</Text>
                                            </View>
                                            <View style={styles.bankDetailRow}>
                                                <Text style={styles.bankDetailLabel}>Account No:</Text>
                                                <Text style={styles.bankDetailValue}>{bankDetails.accountNumber}</Text>
                                            </View>
                                            <View style={styles.bankDetailRow}>
                                                <Text style={styles.bankDetailLabel}>IFSC:</Text>
                                                <Text style={styles.bankDetailValue}>{bankDetails.ifscCode}</Text>
                                            </View>
                                            <View style={styles.bankDetailRow}>
                                                <Text style={styles.bankDetailLabel}>UPI ID:</Text>
                                                <Text style={styles.bankDetailValue}>{bankDetails.upiId}</Text>
                                            </View>
                                            <View style={styles.bankDetailRow}>
                                                <Text style={styles.bankDetailLabel}>Bank:</Text>
                                                <Text style={styles.bankDetailValue}>{bankDetails.bankName}</Text>
                                            </View>
                                            <View style={styles.bankDetailRow}>
                                                <Text style={styles.bankDetailLabel}>Branch:</Text>
                                                <Text style={styles.bankDetailValue}>{bankDetails.branch}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.amountWarning}>
                                            <Ionicons name="warning-outline" size={20} color="#92400e" />
                                            <Text style={styles.amountWarningText}>
                                                Transfer exactly ₹{total.toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* User Payment Details */}
                                    <Text style={styles.userDetailsTitle}>Your Payment Details (Optional)</Text>
                                    
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Transaction ID / UPI Reference *"
                                        value={bankTransferDetails.transactionId}
                                        onChangeText={(text) => setBankTransferDetails(prev => ({ ...prev, transactionId: text }))}
                                        placeholderTextColor="#94a3b8"
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Your Bank Name *"
                                        value={bankTransferDetails.bankName}
                                        onChangeText={(text) => setBankTransferDetails(prev => ({ ...prev, bankName: text }))}
                                        placeholderTextColor="#94a3b8"
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Your Account Name (Optional)"
                                        value={bankTransferDetails.accountName}
                                        onChangeText={(text) => setBankTransferDetails(prev => ({ ...prev, accountName: text }))}
                                        placeholderTextColor="#94a3b8"
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Your Account Number (Optional)"
                                        value={bankTransferDetails.accountNumber}
                                        onChangeText={(text) => setBankTransferDetails(prev => ({ ...prev, accountNumber: text }))}
                                        placeholderTextColor="#94a3b8"
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Your IFSC Code (Optional)"
                                        value={bankTransferDetails.ifscCode}
                                        onChangeText={(text) => setBankTransferDetails(prev => ({ ...prev, ifscCode: text }))}
                                        placeholderTextColor="#94a3b8"
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Your UPI ID (Optional)"
                                        value={bankTransferDetails.upiId}
                                        onChangeText={(text) => setBankTransferDetails(prev => ({ ...prev, upiId: text }))}
                                        placeholderTextColor="#94a3b8"
                                    />

                                    {/* Upload Section */}
                                    <TouchableOpacity
                                        style={styles.uploadSection}
                                        onPress={handleFileUpload}
                                    >
                                        {bankTransferDetails.screenshot ? (
                                            <View style={styles.imagePreviewContainer}>
                                                <Image 
                                                    source={{ uri: bankTransferDetails.screenshot }} 
                                                    style={styles.imagePreview}
                                                />
                                                <TouchableOpacity
                                                    style={styles.removeImageButton}
                                                    onPress={() => setBankTransferDetails(prev => ({ ...prev, screenshot: null }))}
                                                >
                                                    <Text style={styles.removeImageText}>Remove Image</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <>
                                                <Ionicons name="cloud-upload-outline" size={48} color="#9ca3af" />
                                                <Text style={styles.uploadText}>Upload payment proof (screenshot)</Text>
                                                <TouchableOpacity style={styles.chooseFileButton}>
                                                    <Text style={styles.chooseFileText}>Choose File</Text>
                                                </TouchableOpacity>
                                                <Text style={styles.fileSizeText}>Max 5MB (PNG, JPG, JPEG)</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Additional Notes Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Any special delivery instructions..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Order Summary */}
                    <View style={styles.summarySection}>
                        <Text style={styles.summaryTitle}>Order Summary</Text>

                        {/* Cart Items */}
                        <ScrollView style={styles.cartItemsScroll} nestedScrollEnabled={true}>
                            {cartItems.map((item, index) => (
                                <View key={item.id || item._id || index} style={styles.cartItem}>
                                    <View style={styles.cartItemInfo}>
                                        <Text style={styles.cartItemName} numberOfLines={2}>
                                            {item.name}
                                        </Text>
                                        <Text style={styles.cartItemQuantity}>
                                            {item.quantity} × ₹{item.price.toLocaleString()}
                                        </Text>
                                    </View>
                                    <Text style={styles.cartItemTotal}>
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>

                        {/* Price Breakdown */}
                        <View style={styles.priceBreakdown}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Shipping</Text>
                                <Text style={styles.summaryValue}>
                                    {shipping === 0 ? 'Free' : `₹${shipping}`}
                                </Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>GST (18%)</Text>
                                <Text style={styles.summaryValue}>₹{tax.toLocaleString()}</Text>
                            </View>

                            <View style={[styles.summaryRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                            </View>
                        </View>

                        {/* Delivery Info */}
                        <View style={styles.deliveryInfo}>
                            <Ionicons name="time-outline" size={24} color="#10b981" />
                            <Text style={styles.deliveryText}>Estimated Delivery: 3-7 hours</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer with Place Order Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.backToCartButton}
                    onPress={() => router.push('/cart')}
                >
                    <Text style={styles.backToCartText}>← Back to Cart</Text>
                </TouchableOpacity>
                <View style={styles.orderTotal}>
                    <Text style={styles.orderTotalLabel}>Total:</Text>
                    <Text style={styles.orderTotalAmount}>₹{total.toLocaleString()}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.placeOrderButtonText}>
                            Place Order
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6c757d',
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContent: {
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#343a40',
        marginTop: 12,
    },
    shopButton: {
        backgroundColor: '#800000',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
        marginTop: 12,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    header: {
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 12,
        elevation: 2,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 140,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginLeft: 8,
    },
    noAddressContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    noAddressText: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 8,
    },
    addAddressLink: {
        padding: 4,
    },
    addAddressLinkText: {
        color: '#800000',
        fontSize: 14,
        fontWeight: '600',
    },
    addressGrid: {
        gap: 8,
        marginBottom: 12,
    },
    addressCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1.5,
        borderColor: '#dee2e6',
    },
    addressCardSelected: {
        borderColor: '#800000',
        backgroundColor: '#ffeaea',
    },
    addressCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    addressName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    addressText: {
        fontSize: 13,
        color: '#495057',
        marginBottom: 2,
        lineHeight: 18,
    },
    addressPhone: {
        fontSize: 13,
        color: '#6c757d',
        marginTop: 4,
    },
    defaultBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#28a745',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 6,
    },
    defaultBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '500',
    },
    addNewAddressLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 6,
    },
    addNewAddressLinkText: {
        color: '#800000',
        fontSize: 14,
        fontWeight: '600',
    },
    paymentOption: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1.5,
        borderColor: '#dee2e6',
        marginBottom: 8,
    },
    paymentOptionSelected: {
        borderColor: '#800000',
        backgroundColor: '#ffeaea',
    },
    paymentOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    codBadge: {
        backgroundColor: '#800000',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    codBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    paymentOptionText: {
        flex: 1,
        marginLeft: 10,
    },
    paymentOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    paymentOptionDesc: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 2,
    },
    bankTransferDetails: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#dee2e6',
    },
    companyBankDetails: {
        backgroundColor: '#e7f1ff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    bankDetailsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 8,
    },
    bankDetailsGrid: {
        gap: 6,
        marginBottom: 12,
    },
    bankDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bankDetailLabel: {
        fontSize: 12,
        color: '#495057',
        fontWeight: '500',
        flex: 1,
    },
    bankDetailValue: {
        fontSize: 12,
        color: '#212529',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    amountWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        padding: 8,
        borderRadius: 6,
        gap: 6,
    },
    amountWarningText: {
        color: '#856404',
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    userDetailsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 8,
        marginTop: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#212529',
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    uploadSection: {
        borderWidth: 1.5,
        borderColor: '#adb5bd',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    uploadText: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 8,
        marginBottom: 12,
        textAlign: 'center',
    },
    chooseFileButton: {
        backgroundColor: '#800000',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6,
    },
    chooseFileText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    fileSizeText: {
        fontSize: 10,
        color: '#adb5bd',
        marginTop: 6,
    },
    imagePreviewContainer: {
        alignItems: 'center',
    },
    imagePreview: {
        width: 160,
        height: 160,
        borderRadius: 6,
        marginBottom: 8,
    },
    removeImageButton: {
        padding: 6,
    },
    removeImageText: {
        color: '#dc3545',
        fontSize: 14,
        fontWeight: '500',
    },
    summarySection: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 80,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 16,
    },
    cartItemsScroll: {
        maxHeight: 160,
        marginBottom: 16,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    cartItemInfo: {
        flex: 1,
        marginRight: 8,
    },
    cartItemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#212529',
        marginBottom: 2,
    },
    cartItemQuantity: {
        fontSize: 12,
        color: '#6c757d',
    },
    cartItemTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212529',
    },
    priceBreakdown: {
        borderTopWidth: 1,
        borderTopColor: '#dee2e6',
        paddingTop: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6c757d',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#212529',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#dee2e6',
        paddingTop: 10,
        marginTop: 6,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#800000',
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#dee2e6',
        gap: 6,
    },
    deliveryText: {
        fontSize: 14,
        color: '#28a745',
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#dee2e6',
        padding: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backToCartButton: {
        marginBottom: 8,
    },
    backToCartText: {
        color: '#6c757d',
        fontSize: 14,
        fontWeight: '500',
    },
    orderTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    orderTotalAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#800000',
    },
    placeOrderButton: {
        backgroundColor: '#800000',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    placeOrderButtonDisabled: {
        backgroundColor: '#a00000',
        opacity: 0.7,
    },
    placeOrderButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});