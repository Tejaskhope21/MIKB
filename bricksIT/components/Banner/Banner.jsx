// components/Banner/Banner.jsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Banner() {
    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.9}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1503387769-00a112127ca0?w=1200&h=400&fit=crop' }}
                style={styles.background}
                imageStyle={styles.backgroundImage}
            >
                <LinearGradient
                    colors={['rgba(128, 0, 0, 0.8)', 'rgba(128, 0, 0, 0.6)']}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        <Text style={styles.title}>Special Offer</Text>
                        <Text style={styles.subtitle}>Up to 40% OFF</Text>
                        <Text style={styles.description}>
                            On all building materials this month
                        </Text>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Shop Now</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 16,
        overflow: 'hidden',
        height: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    background: {
        flex: 1,
        width: '100%',
    },
    backgroundImage: {
        borderRadius: 16,
    },
    gradient: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        borderRadius: 16,
    },
    content: {
        maxWidth: '70%',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 20,
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#800000',
    },
});