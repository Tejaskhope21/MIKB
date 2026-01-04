// app/(tabs)/index.jsx - Main Home Page
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero/Hero';
import CategorySection from '../../components/CategorySection/CategorySection';
import BrandsSection from '../../components/Brands/BrandsSection';
import ProductsComponent from '../../components/Products/ProductsComponent';
import Banner from '../../components/Banner/Banner';
import { fetchProducts } from '../../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      const allProducts = await fetchProducts();

      const transformed = allProducts.map(p => ({
        id: p.numericId || p._id || p.id,
        name: p.name || "Unnamed Product",
        brand: p.brand || "Premium",
        price: p.price || 0,
        originalPrice: p.originalPrice || p.price,
        discount: p.discount || 0,
        rating: 4.2,
        category: p.materialType || "Building Material",
        image: p.images?.[0] || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=512&h=512&fit=crop",
        inStock: p.inventory?.stock > 0 || false,
      }));

      setFeaturedProducts(transformed.slice(0, 12));
      setBestSellers([...transformed].sort((a, b) => b.rating - a.rating).slice(0, 6));
      setSpecialOffers(transformed.filter(p => p.discount > 0).slice(0, 6));

    } catch (err) {
      console.error("Error loading products:", err);
      Alert.alert("Error", "Failed to load products. Using sample data.");
      // Load sample data
      loadSampleData();
    }
  };

  const loadSampleData = () => {
    const sampleProducts = Array.from({ length: 20 }, (_, i) => ({
      id: `sample-${i + 1}`,
      name: `Building Material ${i + 1}`,
      brand: ['UltraBuild', 'ProConstruct', 'EliteMaterials'][i % 3],
      price: Math.floor(Math.random() * 900) + 100,
      originalPrice: Math.floor(Math.random() * 1200) + 300,
      discount: Math.random() > 0.5 ? Math.floor(Math.random() * 35) + 10 : 0,
      rating: 3.8 + Math.random() * 1.2,
      category: ['Cement', 'Steel', 'Bricks', 'Paint'][i % 4],
      image: `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&${i}`,
      inStock: true,
    }));

    setFeaturedProducts(sampleProducts.slice(0, 12));
    setBestSellers([...sampleProducts].sort((a, b) => b.rating - a.rating).slice(0, 6));
    setSpecialOffers(sampleProducts.filter(p => p.discount > 0).slice(0, 6));
  };

  useEffect(() => {
    loadProducts().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts().finally(() => setRefreshing(false));
  }, []);

  const handleProductPress = (product) => {
    navigation.navigate('product', { id: product.id });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#800000']}
            tintColor="#800000"
          />
        }
      >
        <Hero />

        <View style={styles.section}>
          <CategorySection />
        </View>

        <View style={styles.section}>
          <BrandsSection />
        </View>

        {/* Featured Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ProductsComponent
            products={featuredProducts}
            onProductPress={handleProductPress}
          />
        </View>

        {/* Banner Section */}
        <View style={styles.section}>
          <Banner />
        </View>

        {/* Best Sellers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Sellers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ProductsComponent
            products={bestSellers}
            onProductPress={handleProductPress}
            columns={3}
          />
        </View>

        {/* Special Offers Section */}
        <View style={[styles.section, styles.specialOffersSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ProductsComponent
            products={specialOffers}
            onProductPress={handleProductPress}
            columns={3}
          />
        </View>

        {/* Footer Space */}
        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  specialOffersSection: {
    backgroundColor: '#f0f7ff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAllText: {
    color: '#800000',
    fontSize: 14,
    fontWeight: '600',
  },
  footerSpace: {
    height: 80,
  },
});