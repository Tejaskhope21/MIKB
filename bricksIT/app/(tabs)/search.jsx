import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    FlatList,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { productsAPI, hasSearchResults } from '../../services/api';

const SearchScreen = () => {
    const { query: initialQuery } = useLocalSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(initialQuery || '');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);

    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery);
        }
        loadRecentSearches();
    }, [initialQuery]);

    const loadRecentSearches = () => {
        // In a real app, you would load this from AsyncStorage
        const recent = ['Cement', 'Steel', 'Tiles', 'Paint'];
        setRecentSearches(recent);
    };

    const performSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        Keyboard.dismiss();

        try {
            const results = await productsAPI.searchProducts(query);
            setSearchResults(results);

            // Save to recent searches
            if (query.trim() && !recentSearches.includes(query.trim())) {
                const updated = [query.trim(), ...recentSearches.slice(0, 4)];
                setRecentSearches(updated);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            performSearch(searchQuery.trim());
        }
    };

    const handleProductPress = (product) => {
        router.push(`/product/${product.id}`);
    };

    const handleRecentSearchPress = (query) => {
        setSearchQuery(query);
        performSearch(query);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productItem}
            onPress={() => handleProductPress(item)}
        >
            <Image
                source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.productBrand}>{item.brand}</Text>
                <Text style={styles.productPrice}>₹{item.price?.toLocaleString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products, brands, categories..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    autoFocus={!initialQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={clearSearch}>
                        <Icon name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#800000" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            ) : searchResults.length > 0 ? (
                <FlatList
                    data={searchResults}
                    renderItem={renderProductItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.resultsList}
                    ListHeaderComponent={
                        <Text style={styles.resultsHeader}>
                            {searchResults.length} results for "{searchQuery}"
                        </Text>
                    }
                />
            ) : searchQuery ? (
                <View style={styles.emptyResults}>
                    <Icon name="search-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyResultsTitle}>No results found</Text>
                    <Text style={styles.emptyResultsText}>
                        Try different keywords or check spelling
                    </Text>
                </View>
            ) : (
                <View style={styles.recentSearchesContainer}>
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                    {recentSearches.map((query, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.recentSearchItem}
                            onPress={() => handleRecentSearchPress(query)}
                        >
                            <Icon name="time-outline" size={18} color="#666" />
                            <Text style={styles.recentSearchText}>{query}</Text>
                            <Icon name="arrow-forward" size={18} color="#999" />
                        </TouchableOpacity>
                    ))}

                    <Text style={styles.sectionTitle}>Popular Categories</Text>
                    <View style={styles.categoriesContainer}>
                        {['Cement', 'Steel', 'Tiles', 'Paints', 'Bricks', 'Plumbing'].map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={styles.categoryChip}
                                onPress={() => handleRecentSearchPress(category)}
                            >
                                <Text style={styles.categoryText}>{category}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    resultsList: {
        padding: 16,
    },
    resultsHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    productItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    productBrand: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#800000',
    },
    emptyResults: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyResultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
    },
    emptyResultsText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    recentSearchesContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    recentSearchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    recentSearchText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#333',
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    categoryText: {
        color: '#800000',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default SearchScreen;