// app/(tabs)/search.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { searchAutocomplete, hasSearchResults } from '../services/featuresApi';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [autocompleteData, setAutocompleteData] = useState({
    products: [],
    categories: [],
    subcategories: [],
    totalResults: 0,
    query: '',
  });
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ─── Debounce ────────────────────────────────────────────────
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchSuggestions = useCallback(
    debounce(async (text) => {
      if (!text?.trim() || text.trim().length < 2) {
        setAutocompleteData({
          products: [],
          categories: [],
          subcategories: [],
          totalResults: 0,
          query: '',
        });
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const result = await searchAutocomplete(text.trim(), 10);
        if (result?.success) {
          setAutocompleteData(result);
          setShowSuggestions(hasSearchResults(result));
        }
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setLoading(false);
      }
    }, 380),
    []
  );

  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  // ─── Navigation Handlers ─────────────────────────────────────
  const handleProductPress = (product) => {
    const id = product?._id || product?.id;
    if (id) {
      // Same route you already use in HomeScreen
      router.push({
        pathname: '/productDetails/[id]',
        params: { id },
      });
    } else {
      console.warn('Product is missing _id / id', product);
    }
    clearSearch();
  };

  const handleCategoryOrSubcategoryPress = (item) => {
    const id = item?._id || item?.id;

    if (id) {
      // Same route pattern you already use in HomeScreen → categories/[id]
      router.push({
        pathname: '/categories/[id]',
        params: {
          id,
          // optional – can help with title / back button
          name: item.name || 'Category',
        },
      });
    } else {
      console.warn('Category/Subcategory missing _id / id', item);
      // fallback: full text search if you have such screen
      // router.push({ pathname: '/search-results', params: { q: query } });
    }

    clearSearch();
  };

  const renderSuggestion = ({ item }) => {
    const type = item.type;

    if (type === 'product') {
      return (
        <TouchableOpacity
          style={styles.suggestionRow}
          onPress={() => handleProductPress(item)}
        >
          <Image
            source={{
              uri: item.images?.[0] || item.image || 'https://via.placeholder.com/64',
            }}
            style={styles.thumb}
            resizeMode="cover"
          />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name || 'Product'}
            </Text>
            <Text style={styles.meta}>
              {item.brand || '—'} • ₹{(item.price || 0).toLocaleString()}
            </Text>
            {item.categoryName && (
              <Text style={styles.categoryHint}>in {item.categoryName}</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    // category + subcategory → same handler & route
    if (type === 'category' || type === 'subcategory') {
      return (
        <TouchableOpacity
          style={styles.categoryRow}
          onPress={() => handleCategoryOrSubcategoryPress(item)}
        >
          <Icon
            name={type === 'category' ? 'folder-outline' : 'layers-outline'}
            size={22}
            color={type === 'category' ? '#1976d2' : '#388e3c'}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.categoryName}>{item.name}</Text>
            {type === 'subcategory' && item.categoryName && (
              <Text style={styles.subHint}>in {item.categoryName}</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={22} color="#616161" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="Search cement, steel, tiles, paint..."
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
            placeholderTextColor="#9e9e9e"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Icon name="close-circle" size={24} color="#800000" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#c62828" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : showSuggestions ? (
        <FlatList
          data={[
            ...autocompleteData.products.map((p) => ({ ...p, type: 'product' })),
            ...autocompleteData.categories.map((c) => ({ ...c, type: 'category' })),
            // ...autocompleteData.subcategories.map((s) => ({ ...s, type: 'subcategory' })),
          ]}
          renderItem={renderSuggestion}
          keyExtractor={(item, i) => `${item.type}-${item._id || item.id || i}`}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="search-outline" size={56} color="#bdbdbd" />
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Icon name="search-circle-outline" size={90} color="#e0e0e0" />
          <Text style={styles.placeholderText}>
            Type product or category name to begin
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#800000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, color: '#616161', fontSize: 15 },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#800000',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#800000',
  },
  suggestionRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    color: '#212121',
    fontWeight: '500',
  },
  meta: {
    fontSize: 13,
    color: '#616161',
    marginTop: 3,
  },
  categoryHint: {
    fontSize: 12,
    color: '#1976d2',
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryName: {
    fontSize: 16,
    color: '#1e88e5',
  },
  subHint: {
    fontSize: 13,
    color: '#800000',
    marginTop: 2,
  },
});