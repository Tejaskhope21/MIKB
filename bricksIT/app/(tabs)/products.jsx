// app/(tabs)/products.jsx
import React, { useState, useEffect } from 'react';
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
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const categories = [
    { id: '1', name: 'Cement', icon: 'cube-outline', count: 45 },
    { id: '2', name: 'Steel', icon: 'construct-outline', count: 32 },
    { id: '3', name: 'Paint', icon: 'color-palette-outline', count: 67 },
    { id: '4', name: 'Tiles', icon: 'square-outline', count: 89 },
    { id: '5', name: 'Bricks', icon: 'cube', count: 56 },
    { id: '6', name: 'Pipes', icon: 'water-outline', count: 78 },
    { id: '7', name: 'Electrical', icon: 'flash-outline', count: 34 },
    { id: '8', name: 'Tools', icon: 'hammer-outline', count: 23 },
];

export default function ProductsScreen() {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Load products
        loadProducts();
    }, []);

    const loadProducts = async () => {
        // Simulate API call
        const mockProducts = Array.from({ length: 20 }, (_, i) => ({
            id: `product-${i + 1}`,
            name: `Building Material ${i + 1}`,
            category: ['Cement', 'Steel', 'Paint', 'Tiles'][i % 4],
            price: Math.floor(Math.random() * 900) + 100,
            image: `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&${i}`,
            rating: 3.8 + Math.random() * 1.2,
            discount: Math.random() > 0.5 ? Math.floor(Math.random() * 35) + 10 : 0,
        }));
        setProducts(mockProducts);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    };

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('product', { id: item.id })}
        >
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productCategory}>{item.category}</Text>
                <Text style={styles.productPrice}>₹{item.price}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Products</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryButtonActive]}
                        onPress={() => setSelectedCategory('all')}
                    >
                        <Text style={[styles.categoryButtonText, selectedCategory === 'all' && styles.categoryButtonTextActive]}>
                            All Products
                        </Text>
                    </TouchableOpacity>

                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonActive]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <Ionicons
                                name={category.icon}
                                size={20}
                                color={selectedCategory === category.id ? '#800000' : '#666'}
                                style={styles.categoryIcon}
                            />
                            <Text style={[styles.categoryButtonText, selectedCategory === category.id && styles.categoryButtonTextActive]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Products Grid */}
            <FlatList
                data={products}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productsGrid}
                contentContainerStyle={styles.productsContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#800000']} />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#800000',
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        marginTop: -30,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1a1a1a',
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    categoryButtonActive: {
        backgroundColor: '#800000',
        borderColor: '#800000',
    },
    categoryIcon: {
        marginRight: 6,
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    categoryButtonTextActive: {
        color: '#fff',
    },
    productsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    productsGrid: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    productCard: {
        width: (width - 40) / 2,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    productImage: {
        width: '100%',
        height: 150,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    productCategory: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#800000',
    },
});