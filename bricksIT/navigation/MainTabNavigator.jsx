import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as CartProvider } from './src/context/CartContext';
import { CartProvider as CartContextProvider } from './src/context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ProductDetailScreen from './src/screens/products/ProductDetailScreen';
import ProductsScreen from './src/screens/products/ProductsScreen';
import CategoryScreen from './src/screens/products/CategoryScreen';
import CartScreen from './src/screens/cart/CartScreen';
import CheckoutScreen from './src/screens/cart/CheckoutScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import OrdersScreen from './src/screens/orders/OrdersScreen';
import SearchScreen from './src/screens/search/SearchScreen';

// Seller Screens
import SellerDashboard from './src/screens/seller/SellerDashboard';
import SellerProducts from './src/screens/seller/ProductsScreen';
import AddProductScreen from './src/screens/seller/AddProductScreen';
import EditProductScreen from './src/screens/seller/EditProductScreen';
import SellerOrders from './src/screens/seller/OrdersScreen';
import InventoryScreen from './src/screens/seller/InventoryScreen';
import SellerSettings from './src/screens/seller/SettingsScreen';

// Contractor Screens
import ContractorDashboard from './src/screens/contractor/DashboardScreen';
import ContractorProjects from './src/screens/contractor/ProjectsScreen';
import ContractorPortfolio from './src/screens/contractor/PortfolioScreen';
import ContractorMaterials from './src/screens/contractor/MaterialsScreen';

// Admin Screens
import AdminDashboard from './src/screens/admin/DashboardScreen';

// Tab Icons
import Icon from 'react-native-vector-icons/Ionicons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Categories') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Cart') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Search') {
                        iconName = focused ? 'search' : 'search-outline';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#800000',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Categories" component={CategoriesTabScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Cart" component={CartTabScreen} />
            <Tab.Screen name="Profile" component={ProfileTabScreen} />
        </Tab.Navigator>
    );
}

function CategoriesTabScreen() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="CategoriesMain" component={CategoriesScreen} options={{ title: 'Categories' }} />
            <Stack.Screen name="CategoryProducts" component={CategoryScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        </Stack.Navigator>
    );
}

function CartTabScreen() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="CartMain" component={CartScreen} options={{ title: 'My Cart' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
        </Stack.Navigator>
    );
}

function ProfileTabScreen() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <Stack.Screen name="MyOrders" component={OrdersScreen} options={{ title: 'My Orders' }} />
            <Stack.Screen name="Addresses" component={AddressesScreen} />
        </Stack.Navigator>
    );
}

// Protected Route Component for React Native
const ProtectedRoute = ({ children, navigation, allowedRoles = [] }) => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(null);

    React.useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userRole = await AsyncStorage.getItem('userRole');
            const userData = await AsyncStorage.getItem('userData');

            if (!token || !userData) {
                navigation.replace('Login');
                return;
            }

            try {
                const parsedUser = JSON.parse(userData);
                if (!parsedUser || !parsedUser.email) {
                    throw new Error('Invalid user data');
                }

                if (allowedRoles.length > 0) {
                    if (!userRole || !allowedRoles.includes(userRole)) {
                        // Redirect based on role
                        switch (userRole) {
                            case 'contractor':
                                navigation.replace('ContractorDashboard');
                                break;
                            case 'seller':
                                navigation.replace('SellerDashboard');
                                break;
                            case 'admin':
                                navigation.replace('AdminDashboard');
                                break;
                            default:
                                navigation.replace('Home');
                        }
                        return;
                    }
                }

                setIsAuthenticated(true);
            } catch (error) {
                console.error('Protected route error:', error);
                await AsyncStorage.multiRemove(['token', 'userRole', 'userData']);
                navigation.replace('Login');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            navigation.replace('Login');
        }
    };

    if (isAuthenticated === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#800000" />
            </View>
        );
    }

    return isAuthenticated ? children : null;
};

// Main App Component
export default function App() {
    return (
        <CartContextProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="MainTabs">
                    {/* Public Routes */}
                    <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                    <Stack.Screen name="Products" component={ProductsScreen} />
                    <Stack.Screen name="Category" component={CategoryScreen} />
                    <Stack.Screen name="Search" component={SearchScreen} />

                    {/* Protected User Routes */}
                    <Stack.Screen name="Cart" component={CartScreen} />
                    <Stack.Screen name="Checkout" component={CheckoutScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="Orders" component={OrdersScreen} />

                    {/* Seller Routes */}
                    <Stack.Screen name="SellerDashboard" component={SellerDashboard} />
                    <Stack.Screen name="SellerProducts" component={SellerProducts} />
                    <Stack.Screen name="AddProduct" component={AddProductScreen} />
                    <Stack.Screen name="EditProduct" component={EditProductScreen} />
                    <Stack.Screen name="SellerOrders" component={SellerOrders} />
                    <Stack.Screen name="Inventory" component={InventoryScreen} />
                    <Stack.Screen name="SellerSettings" component={SellerSettings} />

                    {/* Contractor Routes */}
                    <Stack.Screen name="ContractorDashboard" component={ContractorDashboard} />
                    <Stack.Screen name="ContractorProjects" component={ContractorProjects} />
                    <Stack.Screen name="ContractorPortfolio" component={ContractorPortfolio} />
                    <Stack.Screen name="ContractorMaterials" component={ContractorMaterials} />

                    {/* Admin Routes */}
                    <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
                </Stack.Navigator>
            </NavigationContainer>
        </CartContextProvider>
    );
}