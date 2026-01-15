import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export default function ProductCard({ product, onPress, viewMode = 'grid' }) {
  if (!product) return null;

  // ✅ SAFE IMAGE HANDLING
  const mainImage =
    product?.image ||
    product?.mainImage ||
    (Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400');

  return (
    <TouchableOpacity
      style={[
        styles.card,
        viewMode === 'list' && styles.listCard,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* IMAGE */}
      <Image
        source={{ uri: mainImage }}
        style={[
          styles.image,
          viewMode === 'list' && styles.listImage,
        ]}
      />

      {/* INFO */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {product.category?.name && (
          <Text style={styles.category}>
            {product.category.name}
          </Text>
        )}

        {/* PRICE */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ₹{product.price}
          </Text>

          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>
              ₹{product.originalPrice}
            </Text>
          )}
        </View>

        {/* RATING */}
        {product.rating && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>
              {product.rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  card: {
    width: (width - 32) / 2,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 6,
    overflow: 'hidden',
    elevation: 2,
  },

  listCard: {
    flexDirection: 'row',
    width: '100%',
    marginHorizontal: 8,
  },

  image: {
    width: '100%',
    height: 140,
  },

  listImage: {
    width: 120,
    height: 120,
  },

  info: {
    padding: 10,
    flex: 1,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },

  category: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#800000',
  },

  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },

  rating: {
    fontSize: 12,
    color: '#333',
  },
});
