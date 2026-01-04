import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { fetchProductById } from '../../services/api';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
    const { productId } = route.params;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const data = await fetchProductById(productId);
            setProduct(data);
        } catch (error) {
            console.error('Error loading product:', error);
            Alert.alert('Error', 'Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            Alert.alert('Success', `${product.name} added to cart`);
        }
    };

    const handleBuyNow = () => {
        if (product) {
            addToCart(product, quantity);
            navigation.navigate('Cart');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#800000" />
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
                <Text style={styles.errorText}>Product not found</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerIcon}>
                            <Ionicons name="share-outline" size={22} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerIcon}>
                            <Ionicons name="heart-outline" size={22} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Product Images */}
                <View style={styles.imageSection}>
                    <Image
                        source={{ uri: product.images?.[selectedImage] || product.image }}
                        style={styles.mainImage}
                    />
                    {product.images && product.images.length > 1 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.thumbnailContainer}
                        >
                            {product.images.map((img, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelectedImage(index)}
                                    style={[
                                        styles.thumbnail,
                                        selectedImage === index && styles.selectedThumbnail,
                                    ]}
                                >
                                    <Image source={{ uri: img }} style={styles.thumbnailImage} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.infoSection}>
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{product.category}</Text>
                    </View>

                    <Text style={styles.productName}>{product.name}</Text>

                    <View style={styles.brandContainer}>
                        <Text style={styles.brandText}>Brand: {product.brand}</Text>
                    </View>

                    {/* Price Section */}
                    <View style={styles.priceSection}>
                        <Text style={styles.price}>₹{product.price}</Text>
                        {product.originalPrice > product.price && (
                            <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                        )}
                        {product.discount > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>{product.discount}% OFF</Text>
                            </View>
                        )}
                    </View>

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={18} color="#fbbf24" />
                        <Text style={styles.ratingText}>{product.rating || 4.0}</Text>
                        <Text style={styles.ratingCount}>({product.reviews || 120} reviews)</Text>
                    </View>

                    {/* Stock Status */}
                    <View style={styles.stockContainer}>
                        <MaterialIcons
                            name={product.inStock ? "inventory" : "error-outline"}
                            size={20}
                            color={product.inStock ? "#10b981" : "#ef4444"}
                        />
                        <Text
                            style={[
                                styles.stockText,
                                { color: product.inStock ? "#10b981" : "#ef4444" },
                            ]}
                        >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                        </Text>
                    </View>

                    {/* Quantity Selector */}
                    <View style={styles.quantitySection}>
                        <Text style={styles.quantityLabel}>Quantity:</Text>
                        <View style={styles.quantitySelector}>
                            <TouchableOpacity
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                style={styles.quantityButton}
                                disabled={quantity <= 1}
                            >
                                <Text style={styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityValue}>{quantity}</Text>
                            <TouchableOpacity
                                onPress={() => setQuantity(quantity + 1)}
                                style={styles.quantityButton}
                            >
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>
                            {product.description || "No description available."}
                        </Text>
                    </View>

                    {/* Specifications */}
                    {product.specifications && (
                        <View style={styles.specsSection}>
                            <Text style={styles.sectionTitle}>Specifications</Text>
                            {Object.entries(product.specifications).map(([key, value]) => (
                                <View key={key} style={styles.specRow}>
                                    <Text style={styles.specKey}>{key}:</Text>
                                    <Text style={styles.specValue}>{value}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={styles.cartButton}
                    onPress={handleAddToCart}
                    disabled={!product.inStock}
                >
                    <Ionicons name="cart-outline" size={22} color="#fff" />
                    <Text style={styles.cartButtonText}>Add to Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.buyButton, !product.inStock && styles.disabledButton]}
                    onPress={handleBuyNow}
                    disabled={!product.inStock}
                >
                    <Text style={styles.buyButtonText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        backgroundColor: '#fff',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#6b7280',
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerIcon: {
        marginLeft: 20,
    },
    imageSection: {
        paddingVertical: 20,
    },
    mainImage: {
        width: width,
        height: 300,
        resizeMode: 'contain',
    },
    thumbnailContainer: {
        paddingHorizontal: 20,
        marginTop: 15,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    selectedThumbnail: {
        borderColor: '#800000',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    infoSection: {
        padding: 20,
    },
    categoryTag: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    categoryText: {
        color: '#3b82f6',
        fontSize: 12,
        fontWeight: '600',
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    brandContainer: {
        marginBottom: 15,
    },
    brandText: {
        fontSize: 14,
        color: '#6b7280',
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginRight: 15,
    },
    originalPrice: {
        fontSize: 18,
        color: '#9ca3af',
        textDecorationLine: 'line-through',
        marginRight: 15,
    },
    discountBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    discountText: {
        color: '#92400e',
        fontSize: 12,
        fontWeight: '600',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    ratingText: {
        fontSize: 16,
        color: '#1f2937',
        marginLeft: 6,
        marginRight: 10,
    },
    ratingCount: {
        fontSize: 14,
        color: '#6b7280',
    },
    stockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    stockText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    quantitySection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 25,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f3f4f6',
    },
    quantityLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 4,
    },
    quantityButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 6,
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    quantityValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginHorizontal: 20,
        minWidth: 30,
        textAlign: 'center',
    },
    descriptionSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#4b5563',
    },
    specsSection: {
        marginBottom: 100,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    specKey: {
        fontSize: 14,
        color: '#6b7280',
    },
    specValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '500',
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    cartButton: {
        flex: 1,
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 10,
        marginRight: 10,
    },
    cartButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    buyButton: {
        flex: 1,
        backgroundColor: '#f59e0b',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 10,
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProductDetailScreen;