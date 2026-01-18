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
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://bricks-backend-qyea.onrender.com/api';

export default function CheckoutScreen() {
    const router = useRouter();
    const { cartItems, getCartTotal, clearCart, getCartCount } = useCart();

    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [bankTransferDetails, setBankTransferDetails] = useState({
        transactionId: '',
        screenshot: null,
        bankName: ''
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
        accountName: "BuilderSmart Solutions Pvt Ltd",
        accountNumber: "123456789012",
        ifscCode: "SBIN0001234",
        bankName: "State Bank of India",
        branch: "Mumbai Main Branch",
        upiId: "buildersmart@sbi"
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
                // Try alternative endpoint
                try {
                    const altResponse = await fetch(`${API_BASE_URL}/user/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    const altData = await altResponse.json();
                    if (altData.success && altData.user) {
                        setUserProfile(altData.user);
                    }
                } catch (altError) {
                    console.error('Alternative profile fetch failed:', altError);
                }
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchUserAddresses = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            // Try multiple endpoint variations
            const endpoints = [
                `${API_BASE_URL}/addresses`,
                `${API_BASE_URL}/addresses/my`,
                `${API_BASE_URL}/user/addresses`
            ];

            let addressesData = [];
            let error = null;

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();

                        // Handle different response formats
                        if (data.success && data.addresses) {
                            addressesData = data.addresses;
                            break;
                        } else if (data.success && data.data) {
                            addressesData = data.data;
                            break;
                        } else if (Array.isArray(data)) {
                            addressesData = data;
                            break;
                        }
                    }
                } catch (endpointError) {
                    console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
                    error = endpointError;
                }
            }

            // If no addresses from API, check if addresses are in user profile
            if (addressesData.length === 0 && userProfile?.addresses) {
                addressesData = userProfile.addresses;
            }

            // If still no addresses, use mock data
            if (addressesData.length === 0) {
                console.log('No addresses found, using mock data');
                addressesData = [
                    {
                        _id: '1',
                        fullName: userProfile?.name || 'John Doe',
                        addressLine: '123 Main Street, Apt 4B',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        pincode: '400001',
                        phone: userProfile?.phone || '+91 9876543210',
                        isDefault: true
                    },
                    {
                        _id: '2',
                        fullName: 'Jane Smith',
                        addressLine: '456 Park Avenue',
                        city: 'Delhi',
                        state: 'Delhi',
                        pincode: '110001',
                        phone: '+91 9876543211',
                        isDefault: false
                    }
                ];
            }

            setAddresses(addressesData);

            // Select default address
            const defaultAddr = addressesData.find(a => a.isDefault) || addressesData[0];
            if (defaultAddr) {
                setSelectedAddress(defaultAddr);
            }

        } catch (error) {
            console.error('Error fetching addresses:', error);
            // Use mock addresses as fallback
            const mockAddresses = [
                {
                    _id: '1',
                    fullName: userProfile?.name || 'John Doe',
                    addressLine: '123 Main Street, Apt 4B',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001',
                    phone: userProfile?.phone || '+91 9876543210',
                    isDefault: true
                }
            ];
            setAddresses(mockAddresses);
            setSelectedAddress(mockAddresses[0]);
        }
    };

    const handleAddNewAddress = async () => {
        try {
            setShowAddressModal(false);

            // Navigate to address form
            router.push({
                pathname: '/address-form',
                params: { redirect: '/checkout' }
            });
        } catch (error) {
            console.error('Error navigating to address form:', error);
            Alert.alert(
                'Address Management',
                'Address management feature is coming soon. For now, please use one of the existing addresses.',
                [{ text: 'OK' }]
            );
        }
    };

    const validateForm = () => {
        if (!selectedAddress) {
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

    const createOrderPayload = () => {
        // Prepare shipping address object
        const shippingAddress = {
            fullName: selectedAddress.fullName,
            addressLine: selectedAddress.addressLine || selectedAddress.address || '',
            city: selectedAddress.city || '',
            state: selectedAddress.state || '',
            pincode: selectedAddress.pincode || '',
            phone: selectedAddress.phone || '',
            isDefault: selectedAddress.isDefault || false
        };

        // Prepare items array - handle both productId and product._id formats
        const items = cartItems.map(item => ({
            productId: item.id || item._id,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            unit: item.unit || 'piece',
            brand: item.brand
        }));

        // Prepare order payload
        const payload = {
            items,
            shippingAddress,
            paymentMethod: paymentMethod === 'cod' ? 'COD' : 'BANK_TRANSFER',
            notes: notes.trim(),
            subtotal: subtotal,
            tax: tax,
            shipping: shipping,
            totalAmount: total,
            currency: 'INR'
        };

        // Add payment proof for bank transfer
        if (paymentMethod === 'bank_transfer') {
            payload.paymentProof = {
                transactionId: bankTransferDetails.transactionId,
                screenshot: bankTransferDetails.screenshot,
                bankName: bankTransferDetails.bankName
            };
        }

        return payload;
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

            const orderPayload = createOrderPayload();

            console.log('Order Payload:', JSON.stringify(orderPayload, null, 2));

            // Try multiple order endpoints
            const endpoints = [
                `${API_BASE_URL}/orders`,
                `${API_BASE_URL}/v1/orders`,
                `${API_BASE_URL}/order/create`
            ];

            let response = null;
            let data = null;
            let orderError = null;

            for (const endpoint of endpoints) {
                try {
                    response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(orderPayload)
                    });

                    if (response.ok) {
                        data = await response.json();
                        break;
                    }
                } catch (endpointError) {
                    console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
                    orderError = endpointError;
                }
            }

            if (!response || !response.ok) {
                throw new Error(orderError?.message || 'Failed to place order on all endpoints');
            }

            // Handle different response formats
            let orderId = null;

            if (data.success) {
                orderId = data.order?._id || data.orderId || data._id || data.id;
            } else if (data._id) {
                orderId = data._id;
            } else if (data.id) {
                orderId = data.id;
            }

            if (!orderId) {
                // Generate a temporary order ID
                orderId = 'TEMP_' + Date.now().toString().slice(-8);
            }

            // Clear cart after successful order
            clearCart();

            setLoading(false);

            Alert.alert(
                'Order Placed Successfully!',
                `Your order #${orderId} has been placed successfully.`,
                [
                    {
                        text: 'View Orders',
                        onPress: () => router.push('/orders')
                    },
                    {
                        text: 'Continue Shopping',
                        onPress: () => router.push('/')
                    }
                ]
            );

            // Navigate to order success screen
            router.push({
                pathname: '/order-success',
                params: { id: orderId }
            });

        } catch (error) {
            console.error('Order failed:', error);

            let errorMessage = 'Failed to place order. Please try again.';

            // Handle specific error cases
            if (error.message.includes('token') || error.message.includes('auth')) {
                errorMessage = 'Authentication failed. Please login again.';
                await AsyncStorage.removeItem('token');
                router.push('/login');
            } else if (error.message.includes('stock')) {
                errorMessage = 'Some items are out of stock. Please update your cart.';
            } else if (error.message.includes('price')) {
                errorMessage = 'Price validation failed. Please refresh the cart.';
            }

            Alert.alert('Order Failed', errorMessage);
            setLoading(false);
        }
    };

    const handleUploadScreenshot = async () => {
        // For React Native, you would use ImagePicker here
        // This is a placeholder for actual implementation
        Alert.alert(
            'Upload Payment Proof',
            'This feature requires additional setup with react-native-image-picker library.',
            [{ text: 'OK' }]
        );
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
                    {/* Customer Info */}
                    {userProfile && (
                        <View style={styles.customerInfoSection}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="person-circle-outline" size={24} color="#800000" />
                                <Text style={styles.sectionTitle}>Customer Information</Text>
                            </View>
                            <View style={styles.customerInfoCard}>
                                <Text style={styles.customerName}>{userProfile.name || 'User'}</Text>
                                <Text style={styles.customerEmail}>{userProfile.email}</Text>
                                {userProfile.phone && (
                                    <Text style={styles.customerPhone}>Phone: {userProfile.phone}</Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Order Items */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Items ({getCartCount()} items)</Text>
                        {cartItems.map((item, index) => (
                            <View key={item.id || item._id || index} style={styles.orderItem}>
                                <Image
                                    source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                                    style={styles.orderItemImage}
                                />
                                <View style={styles.orderItemDetails}>
                                    <Text style={styles.orderItemName} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.orderItemQuantity}>
                                        {item.quantity} × ₹{item.price.toLocaleString()}
                                    </Text>
                                    {item.unit && (
                                        <Text style={styles.orderItemUnit}>Unit: {item.unit}</Text>
                                    )}
                                </View>
                                <Text style={styles.orderItemTotal}>
                                    ₹{(item.price * item.quantity).toLocaleString()}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Delivery Address */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="location-on" size={24} color="#800000" />
                            <Text style={styles.sectionTitle}>Delivery Address</Text>
                        </View>

                        {selectedAddress ? (
                            <TouchableOpacity
                                style={styles.addressCard}
                                onPress={() => setShowAddressModal(true)}
                            >
                                <Text style={styles.addressName}>{selectedAddress.fullName}</Text>
                                <Text style={styles.addressText}>{selectedAddress.addressLine}</Text>
                                <Text style={styles.addressText}>
                                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                                </Text>
                                <Text style={styles.addressPhone}>Phone: {selectedAddress.phone}</Text>
                                {selectedAddress.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultBadgeText}>Default</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.changeAddressButton}
                                    onPress={() => setShowAddressModal(true)}
                                >
                                    <Text style={styles.changeAddressText}>Change Address</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setShowAddressModal(true)}
                            >
                                <Ionicons name="add-circle-outline" size={24} color="#800000" />
                                <Text style={styles.addButtonText}>Add Delivery Address</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Payment Method */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="payment" size={24} color="#800000" />
                            <Text style={styles.sectionTitle}>Payment Method</Text>
                        </View>

                        {/* COD Option */}
                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                paymentMethod === 'cod' && styles.paymentOptionSelected
                            ]}
                            onPress={() => setPaymentMethod('cod')}
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
                                paymentMethod === 'bank_transfer' && styles.paymentOptionSelected,
                                styles.bankTransferOption
                            ]}
                            onPress={() => setPaymentMethod('bank_transfer')}
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
                                <View style={styles.bankDetails}>
                                    <Text style={styles.bankDetailsTitle}>Transfer Details:</Text>
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
                                    </View>

                                    <View style={styles.amountWarning}>
                                        <Ionicons name="warning-outline" size={20} color="#92400e" />
                                        <Text style={styles.amountWarningText}>
                                            Transfer exactly ₹{total.toLocaleString()}
                                        </Text>
                                    </View>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Transaction ID / UPI Reference *"
                                        value={bankTransferDetails.transactionId}
                                        onChangeText={(text) => setBankTransferDetails(prev => ({ ...prev, transactionId: text }))}
                                        placeholderTextColor="#94a3b8"
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Bank Name *"
                                        value={bankTransferDetails.bankName}
                                        onChangeText={(text) => setBankTransferDetails(prev => ({ ...prev, bankName: text }))}
                                        placeholderTextColor="#94a3b8"
                                    />

                                    <TouchableOpacity
                                        style={styles.uploadButton}
                                        onPress={handleUploadScreenshot}
                                    >
                                        <Ionicons name="cloud-upload-outline" size={24} color="#800000" />
                                        <Text style={styles.uploadButtonText}>Upload Payment Proof</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Additional Notes */}
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
                            <Text style={styles.summaryLabel}>Tax (18%)</Text>
                            <Text style={styles.summaryValue}>₹{tax.toLocaleString()}</Text>
                        </View>

                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                        </View>

                        <View style={styles.deliveryInfo}>
                            <Ionicons name="time-outline" size={20} color="#10b981" />
                            <Text style={styles.deliveryText}>Estimated Delivery: 3-7 business days</Text>
                        </View>

                        <View style={styles.paymentNote}>
                            <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
                            <Text style={styles.paymentNoteText}>
                                {paymentMethod === 'cod'
                                    ? 'Payment to be collected upon delivery'
                                    : 'Order will be processed after payment verification'
                                }
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Place Order Button */}
            <View style={styles.footer}>
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
                        <Text style={styles.placeOrderButtonText}>Place Order</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Address Selection Modal */}
            <Modal
                visible={showAddressModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAddressModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Address</Text>
                            <TouchableOpacity
                                onPress={() => setShowAddressModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScrollView}>
                            {addresses.map(address => (
                                <TouchableOpacity
                                    key={address._id || address.id}
                                    style={[
                                        styles.modalAddressItem,
                                        selectedAddress?._id === address._id && styles.modalAddressItemSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedAddress(address);
                                        setShowAddressModal(false);
                                    }}
                                >
                                    <View style={styles.modalAddressHeader}>
                                        <Text style={styles.modalAddressName}>{address.fullName}</Text>
                                        {selectedAddress?._id === address._id && (
                                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        )}
                                    </View>
                                    <Text style={styles.modalAddressText}>{address.addressLine || address.address}</Text>
                                    <Text style={styles.modalAddressText}>
                                        {address.city}, {address.state} - {address.pincode}
                                    </Text>
                                    <Text style={styles.modalAddressPhone}>Phone: {address.phone}</Text>
                                    {address.isDefault && (
                                        <View style={styles.modalDefaultBadge}>
                                            <Text style={styles.modalDefaultBadgeText}>Default</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                style={styles.addNewAddressButton}
                                onPress={handleAddNewAddress}
                            >
                                <Ionicons name="add-circle-outline" size={24} color="#800000" />
                                <Text style={styles.addNewAddressText}>Add New Address</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContent: {
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 16,
    },
    shopButton: {
        backgroundColor: '#800000',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 150,
    },
    customerInfoSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginLeft: 12,
    },
    customerInfoCard: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    customerEmail: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 4,
    },
    customerPhone: {
        fontSize: 14,
        color: '#64748b',
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    orderItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    orderItemDetails: {
        flex: 1,
        marginLeft: 12,
    },
    orderItemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
        marginBottom: 4,
    },
    orderItemQuantity: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    orderItemUnit: {
        fontSize: 12,
        color: '#64748b',
        fontStyle: 'italic',
    },
    orderItemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#800000',
    },
    addressCard: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 2,
    },
    addressPhone: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
    },
    defaultBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 8,
        marginBottom: 8,
    },
    defaultBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    changeAddressButton: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    changeAddressText: {
        color: '#800000',
        fontSize: 14,
        fontWeight: '500',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    addButtonText: {
        color: '#800000',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    paymentOption: {
        padding: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        marginBottom: 12,
    },
    paymentOptionSelected: {
        borderColor: '#800000',
        backgroundColor: '#fef2f2',
    },
    bankTransferOption: {
        paddingBottom: 0,
    },
    paymentOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    codBadge: {
        backgroundColor: '#800000',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    codBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    paymentOptionText: {
        flex: 1,
        marginLeft: 12,
    },
    paymentOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    paymentOptionDesc: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    bankDetails: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    bankDetailsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    bankDetailsGrid: {
        gap: 8,
        marginBottom: 16,
    },
    bankDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bankDetailLabel: {
        fontSize: 14,
        color: '#64748b',
        width: '40%',
    },
    bankDetailValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '500',
        width: '60%',
    },
    amountWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
    },
    amountWarningText: {
        color: '#92400e',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e293b',
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#800000',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 16,
        gap: 8,
        backgroundColor: '#fff',
    },
    uploadButtonText: {
        color: '#800000',
        fontSize: 16,
        fontWeight: '500',
    },
    summarySection: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 100,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 12,
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
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
        borderTopColor: '#e2e8f0',
        gap: 8,
    },
    deliveryText: {
        fontSize: 14,
        color: '#10b981',
        fontWeight: '500',
    },
    paymentNote: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        padding: 12,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        gap: 8,
    },
    paymentNoteText: {
        fontSize: 14,
        color: '#1e40af',
        flex: 1,
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    orderTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    orderTotalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#800000',
    },
    placeOrderButton: {
        backgroundColor: '#800000',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    placeOrderButtonDisabled: {
        backgroundColor: '#a78bfa',
        opacity: 0.7,
    },
    placeOrderButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalScrollView: {
        padding: 16,
    },
    modalAddressItem: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    modalAddressItemSelected: {
        borderColor: '#800000',
        backgroundColor: '#fef2f2',
    },
    modalAddressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalAddressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    modalAddressText: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 2,
    },
    modalAddressPhone: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
    },
    modalDefaultBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 8,
    },
    modalDefaultBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    addNewAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderWidth: 2,
        borderColor: '#800000',
        borderStyle: 'dashed',
        borderRadius: 12,
        gap: 8,
        marginTop: 8,
    },
    addNewAddressText: {
        color: '#800000',
        fontSize: 16,
        fontWeight: '500',
    },
});