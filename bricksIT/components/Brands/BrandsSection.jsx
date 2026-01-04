// components/Brands/BrandsSection.jsx
import React, { useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const brands = [
    { id: '1', name: 'Ambuja', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyrK6T1yW-K1PJ5A6ZQ5lG4WcxGfNnKVBCPA&s' },
    { id: '2', name: 'ACC', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTid9BFpQz2p8odA6J8aMjEfWnZAdB28cn4Jw&s' },
    { id: '3', name: 'Ultratech', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROxqZDL50Uy7jPSX1M3sgwCbl1-9-0B0k9SA&s' },
    { id: '4', name: 'JSW', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwWqj4gy1wpFjJjJ4Ldq0lDqiYpIJPH_qJmg&s' },
    { id: '5', name: 'TATA Steel', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDsQw2dTfGQGF4K1dA61TNFdhKzNWumdrlnQ&s' },
    { id: '6', name: 'Berger', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8SVLjnDzF0y-_E8HXXyq-MfAKX7E1sS6WJg&s' },
    { id: '7', name: 'Asian Paints', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtPxWkEBSpqPTpEJhIWGYDJ5so6a6O9j8YfQ&s' },
    { id: '8', name: 'Finolex', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCuh-VuJpmB0b_xSpUNYrYzLZ8AKOysDJcvA&s' },
];

export default function BrandsSection() {
    const scrollViewRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const scrollLeft = () => {
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    };

    const scrollRight = () => {
        const scrollAmount = brands.length * 120;
        scrollViewRef.current?.scrollTo({ x: scrollAmount, animated: true });
    };

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Top Brands</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View All</Text>
                    <Ionicons name="arrow-forward" size={16} color="#800000" />
                </TouchableOpacity>
            </View>

            {/* Brands Carousel */}
            <View style={styles.carouselContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContent}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {brands.map((brand) => (
                        <TouchableOpacity key={brand.id} style={styles.brandCard} activeOpacity={0.7}>
                            <View style={styles.brandLogoContainer}>
                                <Image
                                    source={{ uri: brand.logo }}
                                    style={styles.brandLogo}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.brandName} numberOfLines={1}>
                                {brand.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Navigation Arrows */}
                <TouchableOpacity style={[styles.navButton, styles.navLeft]} onPress={scrollLeft}>
                    <Ionicons name="chevron-back" size={24} color="#800000" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navButton, styles.navRight]} onPress={scrollRight}>
                    <Ionicons name="chevron-forward" size={24} color="#800000" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 14,
        color: '#800000',
        fontWeight: '600',
    },
    carouselContainer: {
        position: 'relative',
    },
    carouselContent: {
        paddingHorizontal: 10,
    },
    brandCard: {
        width: 100,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    brandLogoContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#f8f9fa',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 12,
    },
    brandLogo: {
        width: '100%',
        height: '100%',
    },
    brandName: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -20 }],
        backgroundColor: '#fff',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1,
    },
    navLeft: {
        left: -8,
    },
    navRight: {
        right: -8,
    },
});