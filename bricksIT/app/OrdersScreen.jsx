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
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

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
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const mockOrders = [
                {
                    _id: 'ORD-2024-001',
                    materialName: 'Cement (UltraTech)',
                    quantity: 100,
                    unit: 'bags',
                    totalAmount: 38000,
                    status: 'delivered',
                    orderDate: '2024-11-15',
                    deliveryDate: '2024-11-16',
                    supplier: 'BuildMart Supplies',
                    deliveryAddress: 'Site 1, Bandra West, Mumbai',
                    paymentStatus: 'paid',
                    trackingId: 'TRK789456123',
                    items: [
                        { name: 'Cement OPC 53', quantity: 100, price: 380, amount: 38000 }
                    ]
                },
                {
                    _id: 'ORD-2024-002',
                    materialName: 'TMT Steel Bars',
                    quantity: 5,
                    unit: 'tons',
                    totalAmount: 310000,
                    status: 'shipped',
                    orderDate: '2024-11-10',
                    estimatedDelivery: '2024-11-18',
                    supplier: 'Steel World',
                    deliveryAddress: 'Project Site, Whitefield, Bangalore',
                    paymentStatus: 'paid',
                    trackingId: 'TRK123456789',
                    items: [
                        { name: 'TMT Bars 12mm', quantity: 2, price: 62000, amount: 124000 },
                        { name: 'TMT Bars 16mm', quantity: 3, price: 62000, amount: 186000 }
                    ]
                },
                {
                    _id: 'ORD-2024-003',
                    materialName: 'Birla White Putty',
                    quantity: 20,
                    unit: 'bags',
                    totalAmount: 8400,
                    status: 'processing',
                    orderDate: '2024-11-12',
                    estimatedDelivery: '2024-11-14',
                    supplier: 'Paint Paradise',
                    deliveryAddress: 'Renovation Site, Kharadi, Pune',
                    paymentStatus: 'pending',
                    items: [
                        { name: 'White Putty', quantity: 20, price: 420, amount: 8400 }
                    ]
                },
                {
                    _id: 'ORD-2024-004',
                    materialName: 'Kajaria Ceramic Tiles',
                    quantity: 50,
                    unit: 'boxes',
                    totalAmount: 115000,
                    status: 'cancelled',
                    orderDate: '2024-11-05',
                    cancellationDate: '2024-11-07',
                    supplier: 'Tile World',
                    deliveryAddress: 'Residential Project, Adyar, Chennai',
                    paymentStatus: 'refunded',
                    cancellationReason: 'Wrong tile size ordered'
                },
                {
                    _id: 'ORD-2024-005',
                    materialName: 'Asian Paints Royale',
                    quantity: 10,
                    unit: 'liters',
                    totalAmount: 80000,
                    status: 'delivered',
                    orderDate: '2024-10-28',
                    deliveryDate: '2024-10-30',
                    supplier: 'Color Masters',
                    deliveryAddress: 'Commercial Complex, Hitech City, Hyderabad',
                    paymentStatus: 'paid',
                    trackingId: 'TRK987654321'
                }
            ];
            setOrders(mockOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, []);

    const getStatusConfig = (status) => {
        const configs = {
            delivered: { 
                bg: '#10B981', // Green
                light: '#D1FAE5', 
                text: '#065F46',
                icon: 'checkmark-circle',
                label: 'Delivered'
            },
            shipped: { 
                bg: '#3B82F6', // Blue
                light: '#DBEAFE', 
                text: '#1E40AF',
                icon: 'car',
                label: 'Shipped'
            },
            processing: { 
                bg: '#F59E0B', // Amber
                light: '#FEF3C7', 
                text: '#92400E',
                icon: 'sync',
                label: 'Processing'
            },
            cancelled: { 
                bg: '#EF4444', // Red
                light: '#FEE2E2', 
                text: '#991B1B',
                icon: 'close-circle',
                label: 'Cancelled'
            },
            pending: { 
                bg: '#6B7280', // Gray
                light: '#F3F4F6', 
                text: '#374151',
                icon: 'time',
                label: 'Pending'
            },
        };
        return configs[status] || configs.pending;
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return '#10B981'; // Green
            case 'pending': return '#F59E0B'; // Amber
            case 'refunded': return '#3B82F6'; // Blue
            case 'failed': return '#EF4444'; // Red
            default: return '#6B7280'; // Gray
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
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
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleOrderPress = (order) => {
        setSelectedOrder(order);
    };

    const renderOrderItem = ({ item, index }) => {
        const statusConfig = getStatusConfig(item.status);
        const paymentColor = getPaymentStatusColor(item.paymentStatus);
        
        return (
            <TouchableOpacity
                style={[
                    styles.orderCard,
                    { marginTop: index === 0 ? 0 : 16 }
                ]}
                onPress={() => handleOrderPress(item)}
                activeOpacity={0.9}
            >
                {/* Status Ribbon */}
                <View style={[styles.statusRibbon, { backgroundColor: statusConfig.bg }]}>
                    <Icon name={statusConfig.icon} size={14} color="#fff" />
                    <Text style={styles.statusRibbonText}>
                        {statusConfig.label}
                    </Text>
                </View>

                {/* Order Header */}
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdContainer}>
                        <Text style={styles.orderId}>{item._id}</Text>
                        <Text style={styles.orderDate}>{formatDate(item.orderDate)}</Text>
                    </View>
                    <Text style={styles.materialName} numberOfLines={2}>{item.materialName}</Text>
                </View>

                {/* Order Details */}
                <View style={styles.orderDetails}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Icon name="cube-outline" size={16} color="#666" />
                            <Text style={styles.detailText}>
                                {item.quantity} {item.unit}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Icon name="business-outline" size={16} color="#666" />
                            <Text style={styles.detailText} numberOfLines={1}>
                                {item.supplier}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.addressRow}>
                        <Icon name="location-outline" size={16} color="#666" />
                        <Text style={styles.addressText} numberOfLines={2}>
                            {item.deliveryAddress}
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Order Footer */}
                <View style={styles.orderFooter}>
                    <View style={styles.paymentContainer}>
                        <Text style={styles.paymentLabel}>Payment</Text>
                        <View style={[styles.paymentBadge, { borderColor: paymentColor }]}>
                            <Text style={[styles.paymentStatus, { color: paymentColor }]}>
                                {item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1)}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Total</Text>
                        <Text style={styles.orderAmount}>{formatCurrency(item.totalAmount)}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleOrderPress(item)}
                    >
                        <Icon name="eye-outline" size={18} color="#800000" />
                        <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                    
                    {item.trackingId && (
                        <TouchableOpacity style={[styles.actionButton, styles.trackButton]}>
                            <Icon name="navigate-outline" size={18} color="#fff" />
                            <Text style={styles.trackButtonText}>Track</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
                            <Text style={styles.headerSubtitle}>Track and manage your orders</Text>
                        </View>
                        <TouchableOpacity style={styles.filterIconButton}>
                            <Icon name="filter" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(128, 0, 0, 0.1)' }]}>
                                <Icon name="receipt-outline" size={24} color="#800000" />
                            </View>
                            <Text style={styles.statValue}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total Orders</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <Icon name="checkmark-circle-outline" size={24} color="#10B981" />
                            </View>
                            <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.delivered}</Text>
                            <Text style={styles.statLabel}>Delivered</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                <Icon name="sync-outline" size={24} color="#F59E0B" />
                            </View>
                            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.processing}</Text>
                            <Text style={styles.statLabel}>Processing</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                <Icon name="car-outline" size={24} color="#3B82F6" />
                            </View>
                            <Text style={[styles.statValue, { color: '#3B82F6' }]}>{stats.shipped}</Text>
                            <Text style={styles.statLabel}>Shipped</Text>
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
                            placeholder="Search orders, materials, suppliers..."
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
                    {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
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
                                        size={16} 
                                        color={isActive ? '#fff' : config.text} 
                                        style={styles.filterIcon}
                                    />
                                )}
                                <Text style={[
                                    styles.filterChipText,
                                    isActive && styles.filterChipTextActive
                                ]}>
                                    {status === 'all' ? 'All Orders' : config.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Orders Header */}
                <View style={styles.ordersHeader}>
                    <View>
                        <Text style={styles.ordersTitle}>
                            {filteredOrders.length} Order{filteredOrders.length !== 1 ? 's' : ''} Found
                        </Text>
                        <Text style={styles.ordersSubtitle}>
                            Total value: {formatCurrency(stats.totalAmount)}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.sortButton}>
                        <Icon name="swap-vertical" size={18} color="#800000" />
                        <Text style={styles.sortButtonText}>Sort</Text>
                    </TouchableOpacity>
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
                                {searchTerm ? 'Try different search terms' : 'Start ordering construction materials'}
                            </Text>
                            {searchTerm ? (
                                <TouchableOpacity 
                                    style={styles.clearSearchButton}
                                    onPress={() => setSearchTerm('')}
                                >
                                    <Text style={styles.clearSearchText}>Clear Search</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity 
                                    style={styles.shopButton}
                                    onPress={() => router.push('/(tabs)')}
                                >
                                    <Text style={styles.shopButtonText}>Browse Materials</Text>
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
                                    <View style={styles.modalTitleContainer}>
                                        <Text style={styles.modalOrderId}>{selectedOrder._id}</Text>
                                        <Text style={styles.modalProductName}>{selectedOrder.materialName}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setSelectedOrder(null)}
                                        style={styles.modalCloseButton}
                                    >
                                        <Icon name="close" size={24} color="#374151" />
                                    </TouchableOpacity>
                                </View>

                                {/* Status Badge */}
                                <View style={styles.modalStatusContainer}>
                                    <View style={[
                                        styles.modalStatusBadge,
                                        { backgroundColor: getStatusConfig(selectedOrder.status).bg }
                                    ]}>
                                        <Icon 
                                            name={getStatusConfig(selectedOrder.status).icon}
                                            size={20}
                                            color="#fff"
                                        />
                                        <Text style={styles.modalStatusText}>
                                            {getStatusConfig(selectedOrder.status).label}
                                        </Text>
                                    </View>
                                </View>

                                {/* Order Details */}
                                <View style={styles.detailsContainer}>
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailColumn}>
                                            <Text style={styles.detailLabel}>Order Date</Text>
                                            <Text style={styles.detailValue}>
                                                {formatDate(selectedOrder.orderDate)}
                                            </Text>
                                        </View>
                                        <View style={styles.detailColumn}>
                                            <Text style={styles.detailLabel}>Payment Status</Text>
                                            <Text style={[
                                                styles.detailValue,
                                                { color: getPaymentStatusColor(selectedOrder.paymentStatus) }
                                            ]}>
                                                {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    {selectedOrder.trackingId && (
                                        <View style={styles.detailRow}>
                                            <View style={styles.detailColumn}>
                                                <Text style={styles.detailLabel}>Tracking ID</Text>
                                                <Text style={styles.detailValue}>{selectedOrder.trackingId}</Text>
                                            </View>
                                            <View style={styles.detailColumn}>
                                                <Text style={styles.detailLabel}>Supplier</Text>
                                                <Text style={styles.detailValue}>{selectedOrder.supplier}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* Address Section */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                                    <View style={styles.addressContainer}>
                                        <Icon name="location-outline" size={20} color="#800000" />
                                        <Text style={styles.addressText}>{selectedOrder.deliveryAddress}</Text>
                                    </View>
                                </View>

                                {/* Items Section */}
                                {selectedOrder.items && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Order Items</Text>
                                        {selectedOrder.items.map((item, index) => (
                                            <View key={index} style={styles.itemRow}>
                                                <View>
                                                    <Text style={styles.itemName}>{item.name}</Text>
                                                    <Text style={styles.itemDetails}>
                                                        {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                                                    </Text>
                                                </View>
                                                <Text style={styles.itemAmount}>
                                                    ₹{item.amount.toLocaleString('en-IN')}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Price Summary */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Price Summary</Text>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.priceLabel}>Subtotal</Text>
                                        <Text style={styles.priceValue}>
                                            ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                                        </Text>
                                    </View>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.priceLabel}>Shipping</Text>
                                        <Text style={styles.priceValue}>
                                            ₹{selectedOrder.totalAmount > 10000 ? '0' : '500'}
                                        </Text>
                                    </View>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.priceLabel}>GST (18%)</Text>
                                        <Text style={styles.priceValue}>
                                            ₹{Math.round(selectedOrder.totalAmount * 0.18).toLocaleString('en-IN')}
                                        </Text>
                                    </View>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Total Amount</Text>
                                        <Text style={styles.totalAmount}>
                                            ₹{(selectedOrder.totalAmount + (selectedOrder.totalAmount > 10000 ? 0 : 500) + Math.round(selectedOrder.totalAmount * 0.18)).toLocaleString('en-IN')}
                                        </Text>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={styles.downloadButton}>
                                        <Icon name="download-outline" size={20} color="#800000" />
                                        <Text style={styles.downloadButtonText}>Download Invoice</Text>
                                    </TouchableOpacity>
                                    
                                    {selectedOrder.trackingId && (
                                        <TouchableOpacity style={styles.trackModalButton}>
                                            <Icon name="navigate-outline" size={20} color="#fff" />
                                            <Text style={styles.trackModalButtonText}>Track Order</Text>
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
    },
    filterIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Stats Section
    statsContainer: {
        paddingHorizontal: 20,
        marginTop: -20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: (width - 52) / 2,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
                borderWidth: 1,
                borderColor: '#F1F5F9',
            },
        }),
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#800000',
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
        marginTop: 24,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    searchWrapperFocused: {
        borderColor: '#800000',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        height: 56,
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
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    filterChipActive: {
        borderColor: 'transparent',
    },
    filterIcon: {
        marginRight: 6,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    
    // Orders Header
    ordersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 16,
    },
    ordersTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    ordersSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sortButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#800000',
        marginLeft: 6,
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
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
                borderWidth: 1,
                borderColor: '#F1F5F9',
            },
        }),
    },
    statusRibbon: {
        position: 'absolute',
        top: 0,
        right: 0,
        borderBottomLeftRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusRibbonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 6,
    },
    orderHeader: {
        marginBottom: 16,
    },
    orderIdContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    orderDate: {
        fontSize: 14,
        color: '#6B7280',
    },
    materialName: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 22,
    },
    orderDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    detailText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 8,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 16,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    paymentContainer: {
        flex: 1,
    },
    paymentLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    paymentBadge: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    paymentStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amountLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    orderAmount: {
        fontSize: 22,
        fontWeight: '700',
        color: '#800000',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#800000',
        marginLeft: 8,
    },
    trackButton: {
        backgroundColor: '#800000',
        borderColor: '#800000',
    },
    trackButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
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
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    clearSearchButton: {
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    clearSearchText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    shopButton: {
        backgroundColor: '#800000',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    shopButtonText: {
        fontSize: 16,
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: height * 0.85,
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
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingTop: 12,
    },
    modalTitleContainer: {
        flex: 1,
        marginRight: 12,
    },
    modalOrderId: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    modalProductName: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 22,
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalStatusContainer: {
        marginBottom: 24,
    },
    modalStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    modalStatusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
    detailsContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    detailColumn: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
    },
    addressText: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
        marginLeft: 12,
        lineHeight: 22,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    itemName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 14,
        color: '#6B7280',
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 15,
        color: '#374151',
    },
    priceValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: '#E5E7EB',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: '700',
        color: '#800000',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    downloadButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    downloadButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#800000',
        marginLeft: 8,
    },
    trackModalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#800000',
        borderRadius: 12,
        paddingVertical: 16,
    },
    trackModalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
});

export default OrdersScreen;