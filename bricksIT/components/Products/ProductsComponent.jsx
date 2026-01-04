// components/Products/ProductsComponent.jsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function ProductsComponent({
    products = [],
    onProductPress,
    columns = 2
}) {
    const cardWidth = columns === 2 ? CARD_WIDTH : (width - 64) / 3;

    const renderProductCard = (product) => (
        <TouchableOpacity
            key={product.id}
            style={[styles.card, { width: cardWidth }]}
            onPress={() => onProductPress && onProductPress(product)}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                />

                {product.discount > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{product.discount}% OFF</Text>
                    </View>
                )}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                </Text>

                <Text style={styles.productCategory} numberOfLines={1}>
                    {product.category}
                </Text>

                <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{product.price}</Text>
                    {product.originalPrice > product.price && (
                        <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                    )}
                </View>

                <View style={styles.metaContainer}>
                    {product.rating > 0 && (
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                        </View>
                    )}

                    <Text style={styles.brandText} numberOfLines={1}>
                        {product.brand}
                    </Text>
                </View>

                <TouchableOpacity style={styles.addToCartButton}>
                    <Ionicons name="cart-outline" size={16} color="#fff" />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (products.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No products available</Text>
            </View>
        );
    }

    return (
        <ScrollView horizontal={columns === 1} showsHorizontalScrollIndicator={false}>
            <View style={[styles.container, { flexDirection: columns === 1 ? 'row' : 'row', flexWrap: columns === 2 ? 'wrap' : 'nowrap' }]}>
                {products.map(renderProductCard)}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: 160,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#ff4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    infoContainer: {
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
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    originalPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    ratingText: {
        fontSize: 11,
        color: '#666',
    },
    brandText: {
        fontSize: 11,
        color: '#666',
    },
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#800000',
        paddingVertical: 8,
        borderRadius: 6,
        gap: 6,
    },
    addToCartText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 12,
        color: '#666',
        fontSize: 16,
    },
});