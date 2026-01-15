// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     View,
//     ScrollView,
//     StyleSheet,
//     RefreshControl,
//     Text,
//     ActivityIndicator,
//     Alert,
//     Dimensions,
//     TouchableOpacity,
//     Image,
//     FlatList,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/Ionicons';

// // Import Components
// import Navbar from '../components/Navbar';
// import HeroCarousel from '../components/HeroCarousel';
// import CategoryGrid from '../components/CategoryGrid';
// import BrandCarousel from '../components/BrandCarousel';
// import ProductCard from '../components/ProductCard';
// import SearchBar from '../components/SearchBar';
// import { fetchProducts, categoriesAPI } from '../services/api';

// const { width } = Dimensions.get('window');

// export default function HomeScreen() {
//     const navigation = useNavigation();
//     const [featuredProducts, setFeaturedProducts] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [refreshing, setRefreshing] = useState(false);

//     const heroImages = [
//         { id: 1, image: require('../../assets/hero1.jpg'), title: 'Premium Building Materials' },
//         { id: 2, image: require('../../assets/hero2.jpg'), title: 'Trusted Brands' },
//         { id: 3, image: require('../../assets/hero3.jpg'), title: 'Fast Delivery' },
//     ];

//     const loadData = async () => {
//         try {
//             // Load categories
//             const categoriesResponse = await categoriesAPI.getAllCategories();
//             setCategories(categoriesResponse.data.categories || []);

//             // Load products
//             const productsResponse = await fetchProducts();
//             const transformed = productsResponse.map(p => ({
//                 id: p.numericId || p._id || p.id,
//                 name: p.name || "Unnamed Product",
//                 brand: p.brand || "Premium",
//                 price: p.price || 0,
//                 originalPrice: p.originalPrice || p.price,
//                 discount: p.discount || 0,
//                 image: p.images?.[0] || "https://via.placeholder.com/300",
//                 inStock: p.inventory?.stock > 0 || false,
//                 category: p.categoryId?.name || 'Building Material',
//                 rating: p.rating || 4.0,
//             }));

//             setFeaturedProducts(transformed.slice(0, 8));
//         } catch (err) {
//             console.error("Error loading data:", err);
//             Alert.alert("Error", "Failed to load data. Please check your connection.");
//         }
//     };

//     useEffect(() => {
//         loadData().finally(() => setLoading(false));
//     }, []);

//     const onRefresh = useCallback(() => {
//         setRefreshing(true);
//         loadData().finally(() => setRefreshing(false));
//     }, []);

//     const handleProductPress = (product) => {
//         navigation.navigate('ProductDetail', { productId: product.id });
//     };

//     const handleCategoryPress = (category) => {
//         navigation.navigate('Category', {
//             categoryId: category.id,
//             categoryName: category.name
//         });
//     };

//     const renderProductItem = ({ item }) => (
//         <TouchableOpacity
//             style={styles.productCard}
//             onPress={() => handleProductPress(item)}
//         >
//             <Image source={{ uri: item.image }} style={styles.productImage} />
//             <View style={styles.productInfo}>
//                 <Text style={styles.productBrand}>{item.brand}</Text>
//                 <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
//                 <View style={styles.priceContainer}>
//                     <Text style={styles.productPrice}>₹{item.price}</Text>
//                     {item.originalPrice > item.price && (
//                         <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
//                     )}
//                 </View>
//                 {item.discount > 0 && (
//                     <View style={styles.discountBadge}>
//                         <Text style={styles.discountText}>{item.discount}% OFF</Text>
//                     </View>
//                 )}
//             </View>
//         </TouchableOpacity>
//     );

  

//     if (loading && !refreshing) {
//         return (
//             <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#800000" />
//                 <Text style={styles.loadingText}>Loading...</Text>
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             <Navbar />
//             <ScrollView
//                 style={styles.scrollView}
//                 showsVerticalScrollIndicator={false}
//                 refreshControl={
//                     <RefreshControl
//                         refreshing={refreshing}
//                         onRefresh={onRefresh}
//                         colors={['#800000']}
//                         tintColor="#800000"
//                     />
//                 }
//             >
//                 {/* Hero Carousel */}
//                 {/* <HeroCarousel images={heroImages} />s */}

//                 {/* Search Bar */}
//                 <View style={styles.searchContainer}>
//                     <SearchBar />
//                 </View>

//                 {/* Categories Section */}
             
//                 {/* Brands Section */}
              

//                 {/* Featured Products */}
//                 <View style={styles.section}>
//                     <View style={styles.sectionHeader}>
//                         <Text style={styles.sectionTitle}>Featured Products</Text>
//                         <TouchableOpacity onPress={() => navigation.navigate('Products')}>
//                             <Text style={styles.seeAllText}>See All</Text>
//                         </TouchableOpacity>
//                     </View>
//                     <FlatList
//                         data={featuredProducts}
//                         renderItem={renderProductItem}
//                         keyExtractor={item => item.id}
//                         numColumns={2}
//                         scrollEnabled={false}
//                         columnWrapperStyle={styles.productsGrid}
//                     />
//                 </View>

//                 {/* Quick Actions */}
//                 <View style={styles.quickActions}>
//                     <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PostRequirement')}>
//                         <Icon name="document-text" size={24} color="#800000" />
//                         <Text style={styles.actionText}>Post Requirement</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ContractorDashboard')}>
//                         <Icon name="construct" size={24} color="#800000" />
//                         <Text style={styles.actionText}>Contractors</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SellerDashboard')}>
//                         <Icon name="storefront" size={24} color="#800000" />
//                         <Text style={styles.actionText}>Sell</Text>
//                     </TouchableOpacity>
//                 </View>
//             </ScrollView>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f8f9fa',
//     },
//     scrollView: {
//         flex: 1,
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#f8f9fa',
//     },
//     loadingText: {
//         marginTop: 10,
//         color: '#666',
//         fontSize: 16,
//     },
//     searchContainer: {
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         backgroundColor: '#fff',
//     },
//     section: {
//         backgroundColor: '#fff',
//         marginVertical: 8,
//         paddingVertical: 16,
//     },
//     sectionHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 16,
//         marginBottom: 12,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#1a1a1a',
//     },
//     seeAllText: {
//         color: '#800000',
//         fontSize: 14,
//         fontWeight: '600',
//     },
//     categoriesList: {
//         paddingHorizontal: 16,
//     },
//     categoryCard: {
//         width: 100,
//         marginRight: 12,
//         alignItems: 'center',
//     },
//     categoryImage: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         backgroundColor: '#f0f0f0',
//     },
//     categoryName: {
//         marginTop: 8,
//         fontSize: 12,
//         textAlign: 'center',
//         color: '#333',
//     },
//     productsGrid: {
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//     },
//     productCard: {
//         width: (width - 40) / 2,
//         backgroundColor: '#fff',
//         borderRadius: 8,
//         marginBottom: 12,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     productImage: {
//         width: '100%',
//         height: 150,
//         borderTopLeftRadius: 8,
//         borderTopRightRadius: 8,
//     },
//     productInfo: {
//         padding: 8,
//     },
//     productBrand: {
//         fontSize: 10,
//         color: '#666',
//         marginBottom: 4,
//     },
//     productName: {
//         fontSize: 12,
//         fontWeight: '500',
//         color: '#333',
//         marginBottom: 8,
//     },
//     priceContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     productPrice: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     originalPrice: {
//         fontSize: 12,
//         color: '#999',
//         textDecorationLine: 'line-through',
//         marginLeft: 6,
//     },
//     discountBadge: {
//         position: 'absolute',
//         top: 8,
//         left: 8,
//         backgroundColor: '#ff4444',
//         paddingHorizontal: 6,
//         paddingVertical: 2,
//         borderRadius: 4,
//     },
//     discountText: {
//         color: '#fff',
//         fontSize: 10,
//         fontWeight: 'bold',
//     },
//     quickActions: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         padding: 16,
//         backgroundColor: '#fff',
//         marginTop: 8,
//     },
//     actionButton: {
//         alignItems: 'center',
//         padding: 12,
//     },
//     actionText: {
//         marginTop: 8,
//         fontSize: 12,
//         color: '#800000',
//         fontWeight: '500',
//     },
// });