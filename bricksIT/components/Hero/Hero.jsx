// components/Hero/Hero.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Text,
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width;
const ITEM_HEIGHT = 250;

const heroSlides = [
    {
        id: '1',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=600&fit=crop',
        title: 'Premium Building Materials',
        subtitle: 'Quality You Can Trust',
    },
    {
        id: '2',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop',
        title: 'Steel & Cement',
        subtitle: 'Best Prices Guaranteed',
    },
    {
        id: '3',
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=600&fit=crop',
        title: 'All Construction Needs',
        subtitle: 'One Stop Solution',
    },
];

export default function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef(null);
    const autoScrollRef = useRef(null);

    useEffect(() => {
        // Auto scroll every 5 seconds
        autoScrollRef.current = setInterval(() => {
            const nextIndex = (currentIndex + 1) % heroSlides.length;
            setCurrentIndex(nextIndex);
            scrollViewRef.current?.scrollTo({
                x: nextIndex * ITEM_WIDTH,
                animated: true,
            });
        }, 5000);

        return () => clearInterval(autoScrollRef.current);
    }, [currentIndex]);

    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / ITEM_WIDTH);
        setCurrentIndex(index);
    };

    const scrollToIndex = (index) => {
        setCurrentIndex(index);
        scrollViewRef.current?.scrollTo({
            x: index * ITEM_WIDTH,
            animated: true,
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {heroSlides.map((slide) => (
                    <View key={slide.id} style={styles.slide}>
                        <Image source={{ uri: slide.imageUrl }} style={styles.image} />
                        <View style={styles.overlay} />
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{slide.title}</Text>
                            <Text style={styles.subtitle}>{slide.subtitle}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {heroSlides.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dot,
                            currentIndex === index && styles.activeDot,
                        ]}
                        onPress={() => scrollToIndex(index)}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: ITEM_HEIGHT,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    textContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 18,
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 15,
        alignSelf: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 24,
    },
});