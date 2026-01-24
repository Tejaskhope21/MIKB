import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ✅ Expo-compatible assets
const b1 = require('../../assets/images/offer5.gif');
const b2 = require('../../assets/images/offer6.gif');
const b3 = require('../../assets/images/offer4.gif');

export default function Banner() {
//   const router = useRouter();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const banners = [
    {
      id: 1,
      image: b1,
      category: 'Electrical',
      title: 'Deals Of The Day',
      description: 'Up to 40% off on all electrical items',
      icon: 'flash',
      link: '/categories/electricals',
      iconColor: '#2563eb',
    },
    {
      id: 2,
      image: b2,
      category: 'Hardware & Fixtures',
      title: 'Limited Time Offer',
      description: 'Premium hardware at unbeatable prices',
      icon: 'construct',
      link: '/categories/hardware',
      iconColor: '#dc2626',
    },
    {
      id: 3,
      image: b3,
      category: 'Plumbing',
      title: 'Hot Deals Await',
      description: 'Quality plumbing solutions with great discounts',
      icon: 'water',
      link: '/categories/plumbing',
      iconColor: '#16a34a',
    },
  ];

  // Calculate banner item width
  const bannerWidth = width;

  const startAutoScroll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      if (!isAutoScrolling) return;

      let nextIndex = currentIndex + 1;
      
      // If we're at the last banner, smoothly go back to first
      if (nextIndex >= banners.length) {
        nextIndex = 0;
        // Reset to first banner smoothly
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }
      } else {
        // Normal slide to next
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }
      }
      
      setCurrentIndex(nextIndex);
    }, 3000);
  }, [currentIndex, isAutoScrolling]);

  const handleScroll = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / bannerWidth);
    
    // Handle the duplicate banners for infinite loop
    if (index >= banners.length * 2) {
      // If scrolled to the duplicate section at the end, jump to beginning
      flatListRef.current?.scrollToIndex({
        index: index % banners.length,
        animated: false,
      });
    } else if (index < banners.length) {
      // If in the first section, update index
      const actualIndex = index % banners.length;
      if (actualIndex !== currentIndex) {
        setCurrentIndex(actualIndex);
      }
    }
  }, [currentIndex, bannerWidth]);

  const handleMomentumScrollEnd = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / bannerWidth);
    
    // Calculate actual index based on modulo
    const actualIndex = index % banners.length;
    
    if (actualIndex >= 0 && actualIndex < banners.length) {
      setCurrentIndex(actualIndex);
      setIsAutoScrolling(true);
      startAutoScroll();
    }
  }, [bannerWidth, startAutoScroll]);

  const handlePress = useCallback((link) => {
    router.push(link);
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      const index = viewableItems[0].index % banners.length;
      setCurrentIndex(index);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  useEffect(() => {
    startAutoScroll();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startAutoScroll]);

  const renderBannerItem = useCallback(({ item, index }) => {
    const inputRange = [
      (index - 1) * bannerWidth,
      index * bannerWidth,
      (index + 1) * bannerWidth,
    ];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const actualIndex = index % banners.length;
    const banner = banners[actualIndex];

    return (
      <Animated.View 
        style={[
          styles.bannerContainer, 
          { 
            width: bannerWidth,
            opacity,
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handlePress(banner.link)}
          style={styles.bannerItem}
        >
          {/* Background Image */}
          <Image 
            source={banner.image} 
            style={styles.image} 
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.categoryContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${banner.iconColor}20` }]}>
                <Ionicons name={banner.icon} size={24} color={banner.iconColor} />
              </View>
              <Text style={styles.category}>{banner.category}</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{banner.title}</Text>
              <Text style={styles.description}>{banner.description}</Text>
            </View>
          </View>

          {/* Slide Indicator */}
          <View style={styles.slideIndicator}>
            <Text style={styles.slideText}>
              {String(actualIndex + 1).padStart(2, '0')}/{String(banners.length).padStart(2, '0')}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [bannerWidth, handlePress, scrollX]);

  const getItemLayout = useCallback((data, index) => ({
    length: bannerWidth,
    offset: bannerWidth * index,
    index,
  }), [bannerWidth]);

  // Create data with duplicate banners for smooth infinite loop
  const bannerData = [...banners, ...banners];

  return (
    <View style={styles.container}>
      {/* Banner Carousel */}
      <Animated.FlatList
        ref={flatListRef}
        data={bannerData}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderBannerItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { 
            useNativeDriver: true,
            listener: handleScroll 
          }
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={() => setIsAutoScrolling(false)}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={bannerWidth}
        snapToAlignment="center"
        contentContainerStyle={styles.listContent}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        initialScrollIndex={0}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: Math.min(info.index, banners.length - 1),
              animated: true,
            });
          });
        }}
      />

      {/* Pagination Dots - FIXED: Only shows 3 dots */}
      {/* <View style={styles.paginationContainer}>
        {banners.map((banner, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.paginationDotActive,
              currentIndex === index && { backgroundColor: banner.iconColor }
            ]}
          />
        ))}
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  listContent: {},
  bannerContainer: {
    height: 220,
  },
  bannerItem: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  category: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  textContainer: {
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: '90%',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  slideIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  slideText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
  },
});