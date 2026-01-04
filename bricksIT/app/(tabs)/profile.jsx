import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, ordersAPI } from '../../services/api';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                setUser(JSON.parse(userData));
            }

            // Load orders
            const userOrders = await ordersAPI.fetchUserOrders();
            setOrders(userOrders.slice(0, 5));
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await authAPI.logout();
                        router.replace('/');
                    },
                },
            ]
        );
    };

    const menuItems = [
        {
            icon: 'cart-outline',
            label: 'My Orders',
            onPress: () => router.push('/orders'),
            count: orders.length,
        },
        {
            icon: 'location-outline',
            label: 'My Addresses',
            onPress: () => router.push('/addresses')
        },
        {
            icon: 'heart-outline',
            label: 'Wishlist',
            onPress: () => router.push('/wishlist')
        },
        {
            icon: 'chatbubble-outline',
            label: 'Help & Support',
            onPress: () => router.push('/support')
        },
        {
            icon: 'settings-outline',
            label: 'Settings',
            onPress: () => router.push('/settings')
        },
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
            {/* Header */}
            <View style={styles.header}>
                {user ? (
                    <>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{user.name || 'User'}</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                            <Text style={styles.userPhone}>{user.phone || 'No phone number'}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => router.push('/edit-profile')}
                        >
                            <Icon name="pencil" size={20} color="#800000" />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.guestHeader}>
                        <Text style={styles.guestTitle}>Welcome Guest!</Text>
                        <Text style={styles.guestSubtitle}>Sign in to access all features</Text>
                        <TouchableOpacity
                            style={styles.signInButton}
                            onPress={() => router.push('/login')}
                        >
                            <Text style={styles.signInButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Quick Stats */}
            {user && (
                <View style={styles.statsContainer}>
                    <TouchableOpacity style={styles.statItem}>
                        <Text style={styles.statValue}>{orders.length}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </TouchableOpacity>
                    <View style={styles.statDivider} />
                    <TouchableOpacity style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Wishlist</Text>
                    </TouchableOpacity>
                    <View style={styles.statDivider} />
                    <TouchableOpacity style={styles.statItem}>
                        <Text style={styles.statValue}>₹0</Text>
                        <Text style={styles.statLabel}>Spent</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Menu Items */}
            <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress}
                    >
                        <View style={styles.menuIconContainer}>
                            <Icon name={item.icon} size={22} color="#800000" />
                        </View>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <View style={styles.menuRight}>
                            {item.count > 0 && (
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>{item.count}</Text>
                                </View>
                            )}
                            <Icon name="chevron-forward" size={20} color="#999" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Recent Orders */}
            {user && orders.length > 0 && (
                <View style={styles.ordersContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Orders</Text>
                        <TouchableOpacity onPress={() => router.push('/orders')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {orders.slice(0, 3).map((order) => (
                        <TouchableOpacity
                            key={order.id}
                            style={styles.orderItem}
                            onPress={() => router.push(`/order/${order.id}`)}
                        >
                            <View style={styles.orderInfo}>
                                <Text style={styles.orderId}>Order #{order.orderId}</Text>
                                <Text style={styles.orderDate}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.orderStatusContainer}>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                                    <Text style={styles.statusText}>{order.status}</Text>
                                </View>
                                <Text style={styles.orderAmount}>₹{order.totalAmount?.toLocaleString()}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Logout Button */}
            {user && (
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="log-out-outline" size={22} color="#ff4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            )}

            {/* App Info */}
            <View style={styles.appInfo}>
                <Text style={styles.appVersion}>BricksIT v1.0.0</Text>
                <Text style={styles.appCopyright}>© 2024 BricksIT. All rights reserved.</Text>
            </View>
        </ScrollView>
    );
}

const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case 'pending': return '#ffc107';
        case 'confirmed': return '#007bff';
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
        backgroundColor: '#800000',
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#800000',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 2,
    },
    userPhone: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guestHeader: {
        flex: 1,
        alignItems: 'center',
    },
    guestTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    guestSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 16,
    },
    signInButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    signInButtonText: {
        color: '#800000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginTop: -20,
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#800000',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#eee',
        height: '80%',
        alignSelf: 'center',
    },
    menuContainer: {
        backgroundColor: '#fff',
        marginTop: 20,
        marginHorizontal: 16,
        borderRadius: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuIconContainer: {
        width: 40,
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countBadge: {
        backgroundColor: '#800000',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 8,
    },
    countText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    ordersContainer: {
        backgroundColor: '#fff',
        marginTop: 20,
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
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
    orderStatusContainer: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 4,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    orderAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#800000',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutText: {
        color: '#ff4444',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    appVersion: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    appCopyright: {
        fontSize: 12,
        color: '#666',
    },
});