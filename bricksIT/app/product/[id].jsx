// Create this file: app/product/[id].jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchProductById, addToCart } from '../../services/api';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { addToCart: addToCartContext } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const data = await fetchProductById(id);
            setProduct(data);
        } catch (error) {
            console.error('Error loading product:', error);
            Alert.alert('Error', 'Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        try {
            await addToCartContext(product, quantity);
            Alert.alert('Success', 'Product added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add product to cart');
        }
    };

    const handleBuyNow = async () => {
        try {
            await addToCartContext(product, quantity);
            router.push('/cart');
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Failed to proceed');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#800000" />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={64} color="#ccc" />
                <Text style={styles.errorText}>Product not found</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const discount = product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Product Details</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Icon name="share-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Icon name="heart-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400' }}
                        style={styles.mainImage}
                    />
                </View>

                {/* Product Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.brand}>{product.brand || 'Brand'}</Text>
                    <Text style={styles.name}>{product.name}</Text>

                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>₹{product.price?.toLocaleString() || '0'}</Text>
                        {product.originalPrice > product.price && (
                            <>
                                <Text style={styles.originalPrice}>₹{product.originalPrice?.toLocaleString()}</Text>
                                {discount > 0 && (
                                    <Text style={styles.discount}>{discount}% OFF</Text>
                                )}
                            </>
                        )}
                    </View>

                    {/* Rating */}
                    {product.rating && (
                        <View style={styles.ratingContainer}>
                            <Icon name="star" size={16} color="#FFD700" />
                            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                            <Text style={styles.ratingCount}>({product.reviews || 0} reviews)</Text>
                        </View>
                    )}

                    {/* Quantity Selector */}
                    <View style={styles.quantityContainer}>
                        <Text style={styles.quantityLabel}>Quantity:</Text>
                        <View style={styles.quantityButtons}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Icon name="remove" size={20} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.quantity}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(quantity + 1)}
                            >
                                <Icon name="add" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Stock Status */}
                    <View style={styles.stockContainer}>
                        {product.inStock ? (
                            <Text style={styles.inStock}>
                                <Icon name="checkmark-circle" size={16} color="#28a745" /> In Stock
                            </Text>
                        ) : (
                            <Text style={styles.outOfStock}>
                                <Icon name="close-circle" size={16} color="#dc3545" /> Out of Stock
                            </Text>
                        )}
                    </View>

                    {/* Description */}
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionTitle}>Description</Text>
                        <Text style={styles.description}>
                            {product.description || 'High-quality building material for construction projects.'}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={handleAddToCart}
                    disabled={!product.inStock}
                >
                    <Icon name="cart-outline" size={22} color="#800000" />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.buyNowButton, !product.inStock && styles.disabledButton]}
                    onPress={handleBuyNow}
                    disabled={!product.inStock}
                >
                    <Icon name="flash" size={22} color="#fff" />
                    <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        marginTop: 20,
        marginBottom: 30,
    },
    backButton: {
        backgroundColor: '#800000',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#800000',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerIcon: {
        marginLeft: 16,
    },
    imageContainer: {
        backgroundColor: '#fff',
    },
    mainImage: {
        width: width,
        height: width,
        resizeMode: 'contain',
    },
    infoContainer: {
        backgroundColor: '#fff',
        marginTop: 10,
        padding: 16,
    },
    brand: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    originalPrice: {
        fontSize: 18,
        color: '#999',
        textDecorationLine: 'line-through',
        marginLeft: 12,
    },
    discount: {
        fontSize: 14,
        color: '#ff4444',
        fontWeight: 'bold',
        marginLeft: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 6,
        marginRight: 8,
    },
    ratingCount: {
        fontSize: 12,
        color: '#666',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    quantityLabel: {
        fontSize: 16,
        color: '#333',
    },
    quantityButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantity: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 20,
        color: '#333',
    },
    stockContainer: {
        marginBottom: 16,
    },
    inStock: {
        fontSize: 16,
        color: '#28a745',
        fontWeight: '500',
    },
    outOfStock: {
        fontSize: 16,
        color: '#dc3545',
        fontWeight: '500',
    },
    descriptionContainer: {
        marginBottom: 20,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    actionBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        gap: 12,
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#800000',
        borderRadius: 8,
        gap: 8,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#800000',
    },
    buyNowButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#800000',
        borderRadius: 8,
        gap: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buyNowText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});