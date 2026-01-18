// app/order-success/[id].jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://bricks-backend-qyea.onrender.com/api';

export default function OrderSuccessScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchOrderDetails();
        } else {
            // If no order ID, just show success message
            setLoading(false);
        }
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success && data.order) {
                setOrder(data.order);
            } else {
                setError(data.message || 'Failed to fetch order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleTrackOrder = () => {
        if (order?.trackingNumber) {
            // Open tracking URL or show tracking info
            Alert.alert('Track Order', `Tracking Number: ${order.trackingNumber}`);
        } else {
            Alert.alert('Info', 'Tracking information will be available soon');
        }
    };

    const handleContactSupport = () => {
        Linking.openURL('mailto:support@buildersmart.com');
    };

    const handleDownloadInvoice = () => {
        Alert.alert('Download Invoice', 'Invoice download feature will be available soon');
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#800000" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </SafeAreaView>
        );
    }

    if (error && !order) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <View style={styles.errorContent}>
                    <MaterialIcons name="error-outline" size={80} color="#ef4444" />
                    <Text style={styles.errorTitle}>Unable to Load Order</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <View style={styles.errorButtons}>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push('/orders')}
                        >
                            <Text style={styles.secondaryButtonText}>View All Orders</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push('/')}
                        >
                            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#800000" barStyle="light-content" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Success Icon */}
                <View style={styles.successIconContainer}>
                    <View style={styles.successIcon}>
                        <Ionicons name="checkmark" size={60} color="#fff" />
                    </View>
                </View>

                {/* Success Message */}
                <View style={styles.successMessage}>
                    <Text style={styles.successTitle}>Order Confirmed!</Text>
                    <Text style={styles.successSubtitle}>
                        Thank you for your purchase
                    </Text>

                    {order && (
                        <View style={styles.orderInfo}>
                            <Text style={styles.orderId}>
                                Order #{order.orderNumber || id}
                            </Text>
                            <Text style={styles.orderDate}>
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                }) : 'Today'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Next Steps */}
                <View style={styles.nextSteps}>
                    <Text style={styles.nextStepsTitle}>What's Next?</Text>

                    <View style={styles.stepsContainer}>
                        <View style={styles.step}>
                            <View style={styles.stepIcon}>
                                <MaterialIcons name="email" size={24} color="#800000" />
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Confirmation Email</Text>
                                <Text style={styles.stepDescription}>
                                    We've sent a confirmation email with your order details
                                </Text>
                            </View>
                        </View>

                        <View style={styles.step}>
                            <View style={styles.stepIcon}>
                                <MaterialIcons name="local-shipping" size={24} color="#800000" />
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Order Processing</Text>
                                <Text style={styles.stepDescription}>
                                    Your order is being processed and will be shipped soon
                                </Text>
                            </View>
                        </View>

                        <View style={styles.step}>
                            <View style={styles.stepIcon}>
                                <MaterialIcons name="schedule" size={24} color="#800000" />
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Delivery Timeline</Text>
                                <Text style={styles.stepDescription}>
                                    Expected delivery in 3-7 business days
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Order Summary */}
                {order && order.items && (
                    <View style={styles.orderSummary}>
                        <Text style={styles.orderSummaryTitle}>Order Summary</Text>

                        <View style={styles.summaryItems}>
                            {order.items.slice(0, 3).map((item, index) => (
                                <View key={index} style={styles.summaryItem}>
                                    <Text style={styles.summaryItemName} numberOfLines={1}>
                                        {item.name || 'Product'}
                                    </Text>
                                    <Text style={styles.summaryItemQuantity}>
                                        {item.quantity} × ₹{item.price?.toLocaleString() || '0'}
                                    </Text>
                                </View>
                            ))}
                            {order.items.length > 3 && (
                                <Text style={styles.moreItemsText}>
                                    +{order.items.length - 3} more items
                                </Text>
                            )}
                        </View>

                        <View style={styles.summaryTotal}>
                            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                            <Text style={styles.summaryTotalValue}>
                                ₹{order.totalAmount?.toLocaleString() || '0'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Help Section */}
                <View style={styles.helpSection}>
                    <Text style={styles.helpTitle}>Need Help?</Text>
                    <Text style={styles.helpText}>
                        If you have any questions about your order, please contact our support team
                    </Text>

                    <View style={styles.helpButtons}>
                        <TouchableOpacity
                            style={styles.helpButton}
                            onPress={handleContactSupport}
                        >
                            <Ionicons name="chatbubble-outline" size={20} color="#800000" />
                            <Text style={styles.helpButtonText}>Contact Support</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.helpButton}
                            onPress={() => router.push('/faq')}
                        >
                            <Ionicons name="help-circle-outline" size={20} color="#800000" />
                            <Text style={styles.helpButtonText}>View FAQs</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => router.push('/orders')}
                >
                    <Ionicons name="list-outline" size={20} color="#fff" />
                    <Text style={styles.primaryActionText}>View All Orders</Text>
                </TouchableOpacity>

                <View style={styles.secondaryActions}>
                    <TouchableOpacity
                        style={styles.secondaryActionButton}
                        onPress={handleTrackOrder}
                    >
                        <Ionicons name="locate-outline" size={20} color="#800000" />
                        <Text style={styles.secondaryActionText}>Track Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryActionButton}
                        onPress={() => router.push('/')}
                    >
                        <Ionicons name="home-outline" size={20} color="#800000" />
                        <Text style={styles.secondaryActionText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    errorContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContent: {
        alignItems: 'center',
        maxWidth: 300,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    errorButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#800000',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#475569',
        fontSize: 16,
        fontWeight: '500',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 150,
    },
    successIconContainer: {
        alignItems: 'center',
        marginVertical: 40,
    },
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    successMessage: {
        alignItems: 'center',
        marginBottom: 40,
    },
    successTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 18,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 20,
    },
    orderInfo: {
        backgroundColor: '#f0f9ff',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bae6fd',
        alignItems: 'center',
    },
    orderId: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0369a1',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 14,
        color: '#0c4a6e',
    },
    nextSteps: {
        marginBottom: 32,
    },
    nextStepsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 20,
    },
    stepsContainer: {
        gap: 16,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    stepIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    orderSummary: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 32,
    },
    orderSummaryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    summaryItems: {
        gap: 12,
        marginBottom: 20,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    summaryItemName: {
        fontSize: 14,
        color: '#475569',
        flex: 1,
        marginRight: 12,
    },
    summaryItemQuantity: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    moreItemsText: {
        fontSize: 14,
        color: '#64748b',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingTop: 8,
    },
    summaryTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: '#e2e8f0',
    },
    summaryTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    summaryTotalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#800000',
    },
    helpSection: {
        backgroundColor: '#f0f9ff',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bae6fd',
        marginBottom: 32,
    },
    helpTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0369a1',
        marginBottom: 8,
    },
    helpText: {
        fontSize: 14,
        color: '#0c4a6e',
        lineHeight: 20,
        marginBottom: 20,
    },
    helpButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    helpButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#bae6fd',
        gap: 8,
    },
    helpButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0369a1',
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
    primaryActionButton: {
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 8,
    },
    primaryActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryActions: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#800000',
        gap: 8,
    },
    secondaryActionText: {
        color: '#800000',
        fontSize: 16,
        fontWeight: '500',
    },
});