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
import { productsAPI, cartAPI } from '../../../services/api';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
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
            const data = await productsAPI.fetchProductById(id);
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
            await cartAPI.addToCart(product.id, quantity);
            Alert.alert('Success', 'Product added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add product to cart');
        }
    };

    const handleBuyNow = async () => {
        try {
            await cartAPI.addToCart(product.id, quantity);
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
                <Text>Product not found</Text>
            </View>
        );
    }

    const discount = product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <ScrollView style={styles.container}>
            {/* Product Images */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product.images?.[selectedImage] || 'https://via.placeholder.com/400' }}
                    style={styles.mainImage}
                />
                {product.images?.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
                        {product.images.map((img, index) => (
                            <TouchableOpacity key={index} onPress={() => setSelectedImage(index)}>
                                <Image
                                    source={{ uri: img }}
                                    style={[
                                        styles.thumbnail,
                                        selectedImage === index && styles.selectedThumbnail
                                    ]}
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
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
                    {product.inventory?.stock > 0 ? (
                        <Text style={styles.inStock}>In Stock ({product.inventory.stock} available)</Text>
                    ) : (
                        <Text style={styles.outOfStock}>Out of Stock</Text>
                    )}
                </View>

                {/* Description */}
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionTitle}>Description</Text>
                    <Text style={styles.description}>{product.description || 'No description available'}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={handleAddToCart}
                        disabled={!product.inventory?.stock}
                    >
                        <Icon name="cart-outline" size={20} color="#800000" />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buyNowButton}
                        onPress={handleBuyNow}
                        disabled={!product.inventory?.stock}
                    >
                        <Icon name="flash" size={20} color="#fff" />
                        <Text style={styles.buyNowText}>Buy Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
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
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        backgroundColor: '#fff',
    },
    mainImage: {
        width: width,
        height: width,
        resizeMode: 'contain',
    },
    thumbnailContainer: {
        padding: 10,
    },
    thumbnail: {
        width: 60,
        height: 60,
        marginRight: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedThumbnail: {
        borderColor: '#800000',
        borderWidth: 2,
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
        marginBottom: 16,
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
    actionButtons: {
        flexDirection: 'row',
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
    buyNowText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});