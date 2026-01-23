// src/components/Trending/TrendingProductCard.jsx

import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trackTrendingView, trackTrendingClick } from '../../services/featuresApi';

export default function TrendingProductCard({ product, onPress }) {

  useEffect(() => {
    trackTrendingView(product._id);
  }, []);

  const handleClick = () => {
    trackTrendingClick(product._id);
    onPress();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleClick}>
      <Image source={{ uri: product.image }} style={styles.image} />

      {product.discount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{product.discount}% OFF</Text>
        </View>
      )}

      <Text numberOfLines={1} style={styles.name}>{product.name}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{product.price}</Text>
        {product.originalPrice > product.price && (
          <Text style={styles.original}>₹{product.originalPrice}</Text>
        )}
      </View>

      <View style={styles.ratingRow}>
        <Ionicons name="star" size={14} color="#facc15" />
        <Text style={styles.rating}>{product.rating}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    elevation: 4,
  },
  image: {
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  original: {
    marginLeft: 6,
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
  },
});
