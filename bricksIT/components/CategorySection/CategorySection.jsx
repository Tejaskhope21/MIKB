// components/CategorySection/CategorySection.jsx
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 4; // 4 columns

const categories = [
    {
        id: '1',
        name: 'Cement',
        icon: 'https://images.unsplash.com/photo-1599423300746-b62533397364?w=400&h=400&fit=crop',
        count: '45+ Products',
    },
    {
        id: '2',
        name: 'Steel',
        icon: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop',
        count: '32+ Products',
    },
    {
        id: '3',
        name: 'Bricks',
        icon: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop',
        count: '56+ Products',
    },
    {
        id: '4',
        name: 'Paint',
        icon: 'https://images.unsplash.com/photo-1545006397-ffe42fa2db97?w=400&h=400&fit=crop',
        count: '67+ Products',
    },
    {
        id: '5',
        name: 'Tiles',
        icon: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop',
        count: '89+ Products',
    },
    {
        id: '6',
        name: 'Pipes',
        icon: 'https://images.unsplash.com/photo-1628793320654-4a54f8f7bb05?w=400&h=400&fit=crop',
        count: '78+ Products',
    },
    {
        id: '7',
        name: 'Electrical',
        icon: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop',
        count: '34+ Products',
    },
    {
        id: '8',
        name: 'Tools',
        icon: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2406?w=400&h=400&fit=crop',
        count: '23+ Products',
    },
];

export default function CategorySection() {
    const navigation = useNavigation();

    const handleCategoryPress = (category) => {
        navigation.navigate('products', { category: category.name });
    };

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Shop by Category</Text>
                <TouchableOpacity onPress={() => navigation.navigate('products')}>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            {/* Categories Grid */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={styles.categoryCard}
                        onPress={() => handleCategoryPress(category)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconContainer}>
                            <Image
                                source={{ uri: category.icon }}
                                style={styles.icon}
                                resizeMode="cover"
                            />
                        </View>
                        <Text style={styles.categoryName} numberOfLines={1}>
                            {category.name}
                        </Text>
                        <Text style={styles.categoryCount} numberOfLines={1}>
                            {category.count}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    viewAll: {
        fontSize: 14,
        color: '#800000',
        fontWeight: '600',
    },
    categoriesContainer: {
        paddingRight: 16,
    },
    categoryCard: {
        width: 90,
        alignItems: 'center',
        marginRight: 20,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    icon: {
        width: '100%',
        height: '100%',
    },
    categoryName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 2,
    },
    categoryCount: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
});