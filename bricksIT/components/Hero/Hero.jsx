// components/Hero/Hero.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity,
} from 'react-native';

import hero1 from "../../assets/images/b2.jpg"
import hero2 from "../../assets/images/b3.jpg"

import hero3 from "../../assets/images/b4.jpg"


const { width } = Dimensions.get('window');

export default function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef(null);
    const autoScrollRef = useRef(null);

    // Replace these with your actual image URLs
    const heroSlides = [
        {
            id: '1',
            imageUrl: hero1, // Replace with your first image URL
        },
        {
            id: '2',
            imageUrl: hero2, // Replace with your second image URL
        },
        {
            id: '3',
            imageUrl: hero3, // Replace with your third image URL
        },
    ];

    useEffect(() => {
        // Auto scroll every 4 seconds
        autoScrollRef.current = setInterval(() => {
            const nextIndex = (currentIndex + 1) % heroSlides.length;
            setCurrentIndex(nextIndex);
            scrollViewRef.current?.scrollTo({
                x: nextIndex * (width - 20),
                animated: true,
            });
        }, 4000);

        return () => clearInterval(autoScrollRef.current);
    }, [currentIndex]);

    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / (width - 20));
        setCurrentIndex(index);
    };

    const scrollToIndex = (index) => {
        setCurrentIndex(index);
        scrollViewRef.current?.scrollTo({
            x: index * (width - 20),
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
                        <Image 
                            source={{ uri: slide.imageUrl }} 
                            style={styles.image} 
                            resizeMode="cover"
                        />
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
        height: 180,
        position: 'relative',
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0', // Added background color for visibility
    },
    scrollView: {
        flex: 1,
        borderRadius: 8,
    },
    slide: {
        width: width - 20,
        height: 180,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
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
    },
});