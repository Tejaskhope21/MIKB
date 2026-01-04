// app/(tabs)/search.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { productsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        loadTrendingProducts();
        loadRecentSearches();
    }, []);

    const loadTrendingProducts = async () => {
        try {
            const products = await productsAPI.fetchFeaturedProducts();
            setTrendingProducts(products.slice(0, 6));
        } catch (error) {
            console.error('Error loading trending products:', error);
        }
    };

    const loadRecentSearches = async () => {
        // Load from AsyncStorage
        try {
            // This would be implemented with AsyncStorage
            setRecentSearches(['Cement', 'Steel', 'Bricks', 'Tiles']);
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            Alert.alert('Search', 'Please enter a search term');
            return;
        }

        try {
            setLoading(true);
            const results = await productsAPI.searchProducts(searchQuery);
            setSearchResults(results);
            setShowResults(true);

            // Save to recent searches
            if (!recentSearches.includes(searchQuery)) {
                const updated = [searchQuery, ...recentSearches.slice(0, 4)];
                setRecentSearches(updated);
                // Save to AsyncStorage
            }
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'Failed to search products');
        } finally {
            setLoading(false);
        }
    };

    const handleProductPress = (product) => {
        router.push(`/product/${product._id || product.id}`);
        setShowResults(false);
        setSearchQuery('');
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setShowResults(false);
    };

    const renderProductItem = ({ item }) => {
        const discount = item.originalPrice > item.price
            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
            : 0;

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => handleProductPress(item)}
            >
                <Image
                    source={{ uri: item.images?.[0] || item.image }}
                    style={styles.productImage}
                />
                <View style={styles.productInfo}>
                    <Text style={styles.productBrand} numberOfLines={1}>
                        {item.brand}
                    </Text>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.productPrice}>₹{item.price?.toLocaleString()}</Text>
                        {discount > 0 && (
                            <Text style={styles.discountText}>{discount}% OFF</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSearchSuggestion = ({ item }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => {
                setSearchQuery(item);
                handleSearch();
            }}
        >
            <Icon name="time-outline" size={18} color="#666" />
            <Text style={styles.suggestionText}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Search Header */}
            <View style={styles.searchHeader}>
                <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search building materials..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch}>
                            <Icon name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#800000" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            ) : showResults ? (
                <FlatList
                    data={searchResults}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item._id || item.id || String(Math.random())}
                    numColumns={2}
                    columnWrapperStyle={styles.productsGrid}
                    contentContainerStyle={styles.resultsContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="search-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No results found</Text>
                            <Text style={styles.emptySubtext}>Try different keywords</Text>
                        </View>
                    }
                />
            ) : (
                <ScrollView style={styles.suggestionsContainer}>
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent Searches</Text>
                            <FlatList
                                data={recentSearches}
                                renderItem={renderSearchSuggestion}
                                keyExtractor={(item, index) => `recent-${index}`}
                                scrollEnabled={false}
                            />
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => setRecentSearches([])}
                            >
                                <Text style={styles.clearButtonText}>Clear History</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Trending Products */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Trending Products</Text>
                        <FlatList
                            data={trendingProducts}
                            renderItem={renderProductItem}
                            keyExtractor={(item) => item._id || item.id || String(Math.random())}
                            numColumns={2}
                            columnWrapperStyle={styles.productsGrid}
                            scrollEnabled={false}
                        />
                    </View>

                    {/* Popular Categories */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Popular Categories</Text>
                        <View style={styles.categoriesGrid}>
                            {[
                                { name: 'Cement', icon: 'cube-outline' },
                                { name: 'Steel', icon: 'construct-outline' },
                                { name: 'Bricks', icon: 'cube' },
                                { name: 'Tiles', icon: 'square-outline' },
                                { name: 'Paint', icon: 'color-palette-outline' },
                                { name: 'Pipes', icon: 'water-outline' },
                            ].map((category) => (
                                <TouchableOpacity
                                    key={category.name}
                                    style={styles.categoryItem}
                                    onPress={() => {
                                        setSearchQuery(category.name);
                                        handleSearch();
                                    }}
                                >
                                    <View style={styles.categoryIcon}>
                                        <Icon name={category.icon} size={24} color="#800000" />
                                    </View>
                                    <Text style={styles.categoryName}>{category.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#800000',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 50,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 10,
    },
    searchButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    searchButtonText: {
        color: '#800000',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 14,
    },
    resultsContainer: {
        padding: 16,
    },
    suggestionsContainer: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    suggestionText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    clearButtonText: {
        color: '#800000',
        fontSize: 14,
    },
    productsGrid: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    productCard: {
        width: (width - 40) / 2,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    productInfo: {
        padding: 12,
    },
    productBrand: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#800000',
    },
    discountText: {
        fontSize: 12,
        color: '#ff4444',
        fontWeight: '600',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: (width - 48) / 3,
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
});