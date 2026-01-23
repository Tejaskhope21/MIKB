// src/components/Trending/TrendingSection.jsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import TrendingProductCard from '../Cards/TrendingProductCard';
import { fetchTrendingProducts } from '../../services/featuresApi';
import { useRouter } from 'expo-router';

export default function TrendingSection() {
  const [products, setProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchTrendingProducts().then(setProducts);
  }, []);

  if (!products.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Trending For You</Text>

      <FlatList
        horizontal
        data={products}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TrendingProductCard
            product={item}
            onPress={() => router.push(`/product/${item._id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
});
