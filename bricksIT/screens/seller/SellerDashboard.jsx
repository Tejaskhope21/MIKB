import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { sellerAPI } from '../../services/api';

const StatCard = ({ title, value, icon, color, trend }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
            <Icon name={icon} size={24} color={color} />
        </View>
        <View style={styles.statContent}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
        {trend && (
            <View style={styles.trend}>
                <Icon
                    name={trend > 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={trend > 0 ? '#28a745' : '#dc3545'}
                />
                <Text style={[styles.trendText, { color: trend > 0 ? '#28a745' : '#dc3545' }]}>
                    {Math.abs(trend)}%
                </Text>
            </View>
        )}
    </View>
);

export default function SellerDashboard({ navigation }) {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const response = await sellerAPI.getDashboard();
            if (response.data.success) {
                setStats(response.data.stats);
                setRecentOrders(response.data.recentOrders || []);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { title: 'Add Product', icon: 'add-circle', screen: 'AddProduct' },
        { title: 'View Orders', icon: 'list', screen: 'SellerOrders' },
        { title: 'Inventory', icon: 'cube', screen: 'Inventory' },
        { title: 'Analytics', icon: 'stats-chart', screen: 'SellerAnalytics' },
    ];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#800000" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Seller Dashboard</Text>
                <Text style={styles.subtitle}>Welcome back! Here's your store overview</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard
                    title="Total Products"
                    value={stats?.totalProducts || 0}
                    icon="cube"
                    color="#007bff"
                    trend={12}
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.totalOrders || 0}
                    icon="cart"
                    color="#28a745"
                    trend={8}
                />
                <StatCard
                    title="Pending Orders"
                    value={stats?.pendingOrders || 0}
                    icon="time"
                    color="#ffc107"
                    trend={-3}
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
                    icon="cash"
                    color="#6f42c1"
                    trend={15}
                />
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.actionCard}
                            onPress={() => navigation.navigate(action.screen)}
                        >
                            <View style={styles.actionIcon}>
                                <Icon name={action.icon} size={24} color="#800000" />
                            </View>
                            <Text style={styles.actionTitle}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Recent Orders */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Orders</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SellerOrders')}>
                        <Text style={styles.seeAllText}>View All</Text>
                    </TouchableOpacity>
                </View>
                {recentOrders.length > 0 ? (
                    recentOrders.slice(0, 5).map((order) => (
                        <TouchableOpacity
                            key={order._id}
                            style={styles.orderCard}
                            onPress={() => navigation.navigate('OrderDetails', { orderId: order._id })}
                        >
                            <View style={styles.orderInfo}>
                                <Text style={styles.orderId}>Order #{order.orderId}</Text>
                                <Text style={styles.orderDate}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.orderDetails}>
                                <Text style={styles.orderCustomer}>{order.userId?.name}</Text>
                                <Text style={styles.orderAmount}>₹{order.total}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                                <Text style={styles.statusText}>{order.status}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noDataText}>No recent orders</Text>
                )}
            </View>

            {/* Low Stock Alert */}
            {stats?.lowStockProducts > 0 && (
                <View style={[styles.section, styles.alertSection]}>
                    <View style={styles.alertHeader}>
                        <Icon name="alert-circle" size={24} color="#dc3545" />
                        <Text style={styles.alertTitle}>Low Stock Alert</Text>
                    </View>
                    <Text style={styles.alertText}>
                        {stats.lowStockProducts} products are running low on stock
                    </Text>
                    <TouchableOpacity
                        style={styles.alertButton}
                        onPress={() => navigation.navigate('Inventory')}
                    >
                        <Text style={styles.alertButtonText}>Manage Inventory</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return '#ffc107';
        case 'paid': return '#007bff';
        case 'shipped': return '#17a2b8';
        case 'delivered': return '#28a745';
        case 'cancelled': return '#dc3545';
        default: return '#6c757d';
    }
};

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
    header: {
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        margin: '1%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statContent: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    statTitle: {
        fontSize: 14,
        color: '#666',
    },
    trend: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        fontSize: 12,
        marginLeft: 4,
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 12,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAllText: {
        color: '#800000',
        fontSize: 14,
        fontWeight: '600',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    actionCard: {
        width: '48%',
        alignItems: 'center',
        padding: 16,
        margin: '1%',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    actionIcon: {
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    orderCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    orderDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    orderDetails: {
        alignItems: 'flex-end',
        marginHorizontal: 12,
    },
    orderCustomer: {
        fontSize: 14,
        color: '#333',
    },
    orderAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#800000',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    noDataText: {
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
        padding: 20,
    },
    alertSection: {
        backgroundColor: '#fff3cd',
        borderWidth: 1,
        borderColor: '#ffeaa7',
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#856404',
        marginLeft: 8,
    },
    alertText: {
        fontSize: 14,
        color: '#856404',
        marginBottom: 12,
    },
    alertButton: {
        backgroundColor: '#856404',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    alertButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
});