// app/orders/index.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Modal,
    Dimensions,
    SafeAreaView,
    RefreshControl,
    Platform,
    StatusBar,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { ordersAPI } from '../services/userApi';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const OrdersScreen = () => {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            
            // Real API call
            const data = await ordersAPI.fetchUserOrders();
            
            // Transform API response to match frontend structure
            const transformedOrders = data.map(order => {
                // Handle address - check if it's an object or string
                let deliveryAddress = '';
                if (order.shippingAddress) {
                    if (typeof order.shippingAddress === 'string') {
                        deliveryAddress = order.shippingAddress;
                    } else if (typeof order.shippingAddress === 'object') {
                        // Format address object
                        deliveryAddress = [
                            order.shippingAddress.addressLine1,
                            order.shippingAddress.addressLine2,
                            order.shippingAddress.city,
                            order.shippingAddress.state,
                            order.shippingAddress.zipCode,
                            order.shippingAddress.country
                        ].filter(Boolean).join(', ');
                    }
                }

                // Handle items from backend
                let items = [];
                if (order.items && Array.isArray(order.items)) {
                    items = order.items.map(item => ({
                        name: item.product?.name || item.name || 'Product',
                        quantity: item.quantity || 1,
                        price: item.price || item.product?.price || 0,
                        amount: (item.quantity || 1) * (item.price || 0)
                    }));
                }

                // Get payment method from backend
                let paymentMethod = 'COD';
                if (order.paymentMethod) {
                    paymentMethod = order.paymentMethod;
                } else if (order.paymentStatus === 'paid') {
                    paymentMethod = 'Paid Online';
                }

                return {
                    _id: order._id || order.orderNumber || `ORD-${order.orderId || Math.floor(Math.random() * 10000)}`,
                    materialName: items.length > 0 ? items[0].name : 'Product',
                    quantity: order.totalQuantity || items.reduce((sum, item) => sum + (item.quantity || 0), 0),
                    totalAmount: order.totalAmount || order.amount || 0,
                    status: order.status?.toLowerCase() || 'pending',
                    orderDate: order.createdAt || order.orderDate || new Date().toISOString(),
                    deliveryDate: order.deliveryDate || order.estimatedDelivery,
                    deliveryAddress: deliveryAddress,
                    paymentStatus: order.paymentStatus || 'pending',
                    paymentMethod: paymentMethod,
                    trackingId: order.trackingNumber || order.trackingId,
                    items: items,
                    cancellationReason: order.cancellationReason,
                    // Additional backend fields
                    orderId: order._id,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
                };
            });
            
            setOrders(transformedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error.response?.data || error.message);
            
            // Handle 401 unauthorized
            if (error.response?.status === 401) {
                Alert.alert(
                    'Session Expired',
                    'Please login again to continue',
                    [
                        {
                            text: 'Login',
                            onPress: () => router.replace('/login')
                        }
                    ]
                );
                return;
            }
            
            // Show error message
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to fetch orders. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            Alert.alert(
                'Cancel Order',
                'Are you sure you want to cancel this order?',
                [
                    {
                        text: 'No',
                        style: 'cancel'
                    },
                    {
                        text: 'Yes',
                        style: 'destructive',
                        onPress: async () => {
                            await ordersAPI.cancelOrder(orderId);
                            Alert.alert('Success', 'Order cancelled successfully');
                            fetchOrders(); // Refresh orders list
                            setSelectedOrder(null); // Close modal
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error cancelling order:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to cancel order. Please try again.'
            );
        }
    };

    const handleTrackOrder = (order) => {
        if (order.trackingId) {
            // In a real app, this would open a tracking link or screen
            Alert.alert(
                'Track Order',
                `Tracking ID: ${order.trackingId}\n\nTrack your order using this ID on the carrier's website.`,
                [{ text: 'OK' }]
            );
        } else {
            Alert.alert(
                'Tracking Not Available',
                'Tracking information will be available once your order is shipped.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
            // In a real app, this would download the invoice PDF
            Alert.alert(
                'Download Invoice',
                'Invoice download feature will be available soon.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Error downloading invoice:', error);
            Alert.alert('Error', 'Failed to download invoice. Please try again.');
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, []);

    const getStatusConfig = (status) => {
        const configs = {
            delivered: { 
                bg: '#10B981', 
                text: '#10B981',
                light: '#ECFDF5',
                icon: 'checkmark-circle',
                label: 'Delivered'
            },
            shipped: { 
                bg: '#3B82F6', 
                text: '#3B82F6',
                light: '#EFF6FF',
                icon: 'car',
                label: 'Shipped'
            },
            processing: { 
                bg: '#F59E0B', 
                text: '#F59E0B',
                light: '#FFFBEB',
                icon: 'sync',
                label: 'Processing'
            },
            cancelled: { 
                bg: '#EF4444', 
                text: '#EF4444',
                light: '#FEF2F2',
                icon: 'close-circle',
                label: 'Cancelled'
            },
            pending: { 
                bg: '#6B7280', 
                text: '#6B7280',
                light: '#F3F4F6',
                icon: 'time',
                label: 'Pending'
            },
        };
        return configs[status] || configs.pending;
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.materialName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: orders.length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0)
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleOrderPress = (order) => {
        setSelectedOrder(order);
    };

    const renderOrderItem = ({ item, index }) => {
        const statusConfig = getStatusConfig(item.status);
        
        return (
            <TouchableOpacity
                style={[
                    styles.orderCard,
                    { marginTop: index === 0 ? 0 : 16 }
                ]}
                onPress={() => handleOrderPress(item)}
                activeOpacity={0.7}
            >
                {/* Order Header */}
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdRow}>
                        <Text style={styles.orderIdLabel}>Order ID</Text>
                        <Text style={styles.orderIdValue}>{item._id}</Text>
                    </View>
                    
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.light }]}>
                        <Icon name={statusConfig.icon} size={14} color={statusConfig.text} />
                        <Text style={[styles.statusText, { color: statusConfig.text }]}>
                            {statusConfig.label}
                        </Text>
                    </View>
                </View>

                {/* Order Date */}
                <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Placed on</Text>
                    <Text style={styles.dateValue}>{formatDate(item.orderDate)}</Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Order Summary */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Amount</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(item.totalAmount)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Payment</Text>
                        <Text style={[styles.paymentMethod, 
                            { color: item.paymentMethod === 'COD' ? '#800000' : '#10B981' }
                        ]}>
                            {item.paymentMethod || 'COD'}
                        </Text>
                    </View>
                </View>

                {/* Items */}
                <View style={styles.itemsRow}>
                    <Text style={styles.itemsLabel}>Items ({item.items?.length || 1})</Text>
                    <Text style={styles.itemsValue}>
                        {item.items?.[0]?.quantity || 1} × {item.items?.[0]?.name || 'Product'}
                    </Text>
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => handleOrderPress(item)}
                >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Icon name="chevron-forward" size={16} color="#800000" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
                <ActivityIndicator size="large" color="#800000" />
                <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />
            
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#800000']}
                        tintColor="#800000"
                        progressBackgroundColor="#F8FAFC"
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity 
                            onPress={() => router.back()} 
                            style={styles.backButton}
                        >
                            <Icon name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>My Orders</Text>
                            <Text style={styles.headerSubtitle}>Track and manage all your orders in one place</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: '#800000' }]}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.delivered}</Text>
                            <Text style={styles.statLabel}>Delivered</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.processing}</Text>
                            <Text style={styles.statLabel}>Processing</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.cancelled}</Text>
                            <Text style={styles.statLabel}>Cancelled</Text>
                        </View>
                    </View>
                </View>

                {/* Search Section */}
                <View style={styles.searchContainer}>
                    <View style={[
                        styles.searchWrapper,
                        isSearchFocused && styles.searchWrapperFocused
                    ]}>
                        <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search orders..."
                            placeholderTextColor="#9CA3AF"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity 
                                onPress={() => setSearchTerm('')}
                                style={styles.clearButton}
                            >
                                <Icon name="close-circle" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filter Chips */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.filterContainer}
                    contentContainerStyle={styles.filterContent}
                >
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                        const isActive = filterStatus === status;
                        const config = getStatusConfig(status === 'all' ? 'pending' : status);
                        return (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.filterChip,
                                    isActive && styles.filterChipActive,
                                    isActive && { backgroundColor: config.bg }
                                ]}
                                onPress={() => setFilterStatus(status)}
                                activeOpacity={0.8}
                            >
                                {status !== 'all' && (
                                    <Icon 
                                        name={config.icon} 
                                        size={14} 
                                        color={isActive ? '#fff' : config.text} 
                                        style={styles.filterIcon}
                                    />
                                )}
                                <Text style={[
                                    styles.filterChipText,
                                    isActive && styles.filterChipTextActive
                                ]}>
                                    {status === 'all' ? 'All' : config.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Orders Header */}
                <View style={styles.ordersHeader}>
                    <Text style={styles.ordersTitle}>
                        {filteredOrders.length} Order{filteredOrders.length !== 1 ? 's' : ''}
                    </Text>
                    {filteredOrders.length > 0 && (
                        <Text style={styles.ordersSubtitle}>
                            Total: {formatCurrency(stats.totalAmount)}
                        </Text>
                    )}
                </View>

                {/* Orders List */}
                <View style={styles.ordersContainer}>
                    {filteredOrders.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIllustration}>
                                <Icon name="document-text-outline" size={80} color="#E5E7EB" />
                            </View>
                            <Text style={styles.emptyTitle}>No Orders Found</Text>
                            <Text style={styles.emptyText}>
                                {searchTerm ? 'Try different search terms' : 'No orders yet'}
                            </Text>
                            {!searchTerm && (
                                <TouchableOpacity 
                                    style={styles.shopButton}
                                    onPress={() => router.push('/(tabs)')}
                                >
                                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <FlatList
                            data={filteredOrders}
                            renderItem={renderOrderItem}
                            keyExtractor={(item) => item._id}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.ordersList}
                        />
                    )}
                </View>

                {/* Footer Spacer */}
                <View style={styles.footerSpacer} />
            </ScrollView>

            {/* Order Detail Modal */}
            <Modal
                visible={!!selectedOrder}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedOrder(null)}
                statusBarTranslucent
            >
                {selectedOrder && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHandle} />
                            
                            <ScrollView 
                                style={styles.modalScrollView}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.modalContent}
                            >
                                {/* Modal Header */}
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity
                                        onPress={() => setSelectedOrder(null)}
                                        style={styles.modalBackButton}
                                    >
                                        <Icon name="arrow-back" size={24} color="#374151" />
                                        <Text style={styles.backText}>Back</Text>
                                    </TouchableOpacity>
                                    <View style={styles.modalTitleContainer}>
                                        <Text style={styles.modalTitle}>Order Details</Text>
                                        <Text style={styles.modalOrderId}>{selectedOrder._id}</Text>
                                    </View>
                                    <View style={{ width: 44 }} />
                                </View>

                                {/* Shipping Address */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Shipping Address</Text>
                                    <View style={styles.addressContainer}>
                                        <Icon name="location-outline" size={20} color="#666" style={styles.addressIcon} />
                                        <Text style={styles.addressText}>
                                            {selectedOrder.deliveryAddress || 'Address not specified'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Order Summary */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Order Summary</Text>
                                    <View style={styles.summaryGrid}>
                                        <View style={styles.summaryItem}>
                                            <Text style={styles.summaryItemLabel}>Status</Text>
                                            <View style={[styles.statusBadge, 
                                                { backgroundColor: getStatusConfig(selectedOrder.status).light }]}>
                                                <Icon 
                                                    name={getStatusConfig(selectedOrder.status).icon} 
                                                    size={14} 
                                                    color={getStatusConfig(selectedOrder.status).text} 
                                                />
                                                <Text style={[styles.statusText, 
                                                    { color: getStatusConfig(selectedOrder.status).text }]}>
                                                    {getStatusConfig(selectedOrder.status).label}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.summaryItem}>
                                            <Text style={styles.summaryItemLabel}>Total</Text>
                                            <Text style={styles.summaryItemValue}>
                                                {formatCurrency(selectedOrder.totalAmount)}
                                            </Text>
                                        </View>
                                        <View style={styles.summaryItem}>
                                            <Text style={styles.summaryItemLabel}>Payment</Text>
                                            <Text style={[styles.summaryItemValue, 
                                                { color: selectedOrder.paymentMethod === 'COD' ? '#800000' : '#10B981' }]}>
                                                {selectedOrder.paymentMethod || 'COD'}
                                            </Text>
                                        </View>
                                        <View style={styles.summaryItem}>
                                            <Text style={styles.summaryItemLabel}>Date</Text>
                                            <Text style={styles.summaryItemValue}>
                                                {formatDate(selectedOrder.orderDate)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Items */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Items ({selectedOrder.items?.length || 1})</Text>
                                    {selectedOrder.items?.map((item, index) => (
                                        <View key={index} style={styles.itemCard}>
                                            <View style={styles.itemInfo}>
                                                <Text style={styles.itemName}>{item.name}</Text>
                                                <Text style={styles.itemQuantity}>
                                                    {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                                                </Text>
                                            </View>
                                            <Text style={styles.itemAmount}>
                                                ₹{item.amount?.toLocaleString('en-IN')}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Order Details */}
                                <View style={styles.detailsContainer}>
                                    {selectedOrder.deliveryDate && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>
                                                {selectedOrder.status === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}
                                            </Text>
                                            <Text style={styles.detailValue}>
                                                {formatDate(selectedOrder.deliveryDate)}
                                            </Text>
                                        </View>
                                    )}
                                    
                                    {selectedOrder.trackingId && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Tracking ID</Text>
                                            <Text style={styles.detailValue}>{selectedOrder.trackingId}</Text>
                                        </View>
                                    )}
                                    
                                    {selectedOrder.cancellationReason && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Cancellation Reason</Text>
                                            <Text style={[styles.detailValue, { color: '#EF4444' }]}>
                                                {selectedOrder.cancellationReason}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Total Amount */}
                                <View style={styles.totalContainer}>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Total Amount</Text>
                                        <Text style={styles.totalAmount}>
                                            {formatCurrency(selectedOrder.totalAmount)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.modalActions}>
                                    <TouchableOpacity 
                                        style={styles.downloadButton}
                                        onPress={() => handleDownloadInvoice(selectedOrder.orderId)}
                                    >
                                        <Icon name="download-outline" size={20} color="#800000" />
                                        <Text style={styles.downloadButtonText}>Download Invoice</Text>
                                    </TouchableOpacity>
                                    
                                    {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                                        <TouchableOpacity 
                                            style={styles.cancelButton}
                                            onPress={() => handleCancelOrder(selectedOrder.orderId)}
                                        >
                                            <Icon name="close-circle-outline" size={20} color="#EF4444" />
                                            <Text style={styles.cancelButtonText}>Cancel Order</Text>
                                        </TouchableOpacity>
                                    )}
                                    
                                    {selectedOrder.trackingId && (
                                        <TouchableOpacity 
                                            style={styles.trackButton}
                                            onPress={() => handleTrackOrder(selectedOrder)}
                                        >
                                            <Icon name="navigate-outline" size={20} color="#fff" />
                                            <Text style={styles.trackButtonText}>Track Order</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                )}
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#800000',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    
    // Header Styles
    header: {
        backgroundColor: '#800000',
        paddingTop: isIOS ? 60 : 40,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
    },
    
    // Stats Section
    statsContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    
    // Search Section
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 50,
    },
    searchWrapperFocused: {
        borderColor: '#800000',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
        fontFamily: 'System',
    },
    clearButton: {
        padding: 4,
    },
    
    // Filter Section
    filterContainer: {
        marginTop: 20,
    },
    filterContent: {
        paddingHorizontal: 20,
        paddingBottom: 4,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
    },
    filterChipActive: {
        borderColor: 'transparent',
    },
    filterIcon: {
        marginRight: 6,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    
    // Orders Header
    ordersHeader: {
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 16,
    },
    ordersTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    ordersSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    
    // Orders Container
    ordersContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    ordersList: {
        paddingBottom: 20,
    },
    
    // Order Card
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderIdRow: {
        flex: 1,
    },
    orderIdLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    orderIdValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginRight: 8,
    },
    dateValue: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryItem: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    paymentMethod: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemsRow: {
        marginBottom: 16,
    },
    itemsLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    itemsValue: {
        fontSize: 14,
        color: '#374151',
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginTop: 8,
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#800000',
    },
    
    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIllustration: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: '#800000',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    
    // Footer Spacer
    footerSpacer: {
        height: 40,
    },
    
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.9,
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    modalScrollView: {
        flex: 1,
    },
    modalContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingTop: 12,
    },
    modalBackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    backText: {
        fontSize: 16,
        color: '#374151',
        marginLeft: 4,
    },
    modalTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    modalOrderId: {
        fontSize: 14,
        color: '#6B7280',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    addressContainer: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 16,
    },
    addressIcon: {
        marginTop: 2,
        marginRight: 12,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    summaryItem: {
        width: '50%',
        paddingHorizontal: 6,
        marginBottom: 16,
    },
    summaryItemLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 6,
    },
    summaryItemValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    detailsContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 16,
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 16,
        marginBottom: 8,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 4,
    },
    itemQuantity: {
        fontSize: 12,
        color: '#6B7280',
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    totalContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 16,
        marginBottom: 24,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#800000',
    },
    modalActions: {
        gap: 12,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
    },
    downloadButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#800000',
        marginLeft: 8,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#FECACA',
        marginBottom: 12,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        marginLeft: 8,
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#800000',
        borderRadius: 10,
        paddingVertical: 16,
    },
    trackButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
});

export default OrdersScreen;