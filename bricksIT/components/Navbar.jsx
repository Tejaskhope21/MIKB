import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Navbar() {
    const router = useRouter();

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />
            <View style={styles.container}>
                {/* Logo */}
                <TouchableOpacity onPress={() => router.push('/')}>
                    <Text style={styles.logo}>BricksIT</Text>
                </TouchableOpacity>

                {/* Icons */}
                <View style={styles.icons}>
                    {/* <TouchableOpacity onPress={() => router.push('/search')}>
                        <Ionicons name="search" size={22} color="#fff" />
                    </TouchableOpacity> */}

                    <TouchableOpacity
                        style={{ marginLeft: 20 }}
                        onPress={() => router.push('/cart')}
                    >
                        <Ionicons name="cart-outline" size={22} color="#fff" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>2</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ marginLeft: 20 }}
                        onPress={() => router.push('/profile')}
                    >
                        <Ionicons name="person-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 56,
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        elevation: 4,
    },
    logo: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    icons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -10,
        backgroundColor: '#ffcc00',
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
});
