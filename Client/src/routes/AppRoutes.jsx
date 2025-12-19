import { Routes, Route, Navigate } from 'react-router-dom'
import Home from "../pages/Home/HomePage"
import ProductsPage from "../pages/Products/Products"
import ProductDetailsPage from "../pages/Products/ProductsDetails"
import CartPage from "../pages/Cart/CartPage"
import CheckoutPage from "../pages/Checkout/CheckoutPage"
import OrderSuccessPage from "../pages/Checkout/OrderSuccess"
import MainLayout from "../layouts/MainLayout"
import LoginPage from "../pages/Users/LoginPage"
import RegisterPage from "../pages/Users/RegisterPage"
import ProtectedRoute from '../components/Auth/ProtectedRoute'
import ErrorBoundary from '../components/ErrorBoundary'
import ProfilePage from '../components/UserProfilePage' // Fixed import path
import UserOrdersPage from '../pages/Users/UserOrders'

// Seller Components
import SellerLayout from '../layouts/SellerLayout'
import SellerDashboard from '../components/Seller/Dashboard'
import ProductList from '../components/Seller/Products/ProductList'
import AddProduct from '../components/Seller/Products/AddProduct'
import EditProduct from '../components/Seller/Products/EditProduct'
import OrderList from '../components/Seller/Orders/OrderList'
import OrderDetails from '../components/Seller/Orders/OrderDetails'
import Analytics from '../components/Seller/Analytics/Analytics'
import Reviews from '../components/Seller/Reviews/Reviews'
import Inventory from '../components/Seller/Inventory/Inventory'
import StoreSettings from '../components/Seller/Settings/StoreSettings'

const AppRoutes = () => {
    return (
        <ErrorBoundary>
            <Routes>
                {/* Public routes with MainLayout */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/category/:categoryId" element={<ProductsPage />} />
                    <Route path="/product/:productId" element={<ProductDetailsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={
                        <ProtectedRoute>
                            <CheckoutPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/order-success/:orderId" element={
                        <ProtectedRoute>
                            <OrderSuccessPage />
                        </ProtectedRoute>
                    } />
                </Route>

                {/* Auth routes (without MainLayout) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* User Profile Routes */}
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<ProfilePage />} />
                    <Route path="orders" element={<UserOrdersPage />} />
                    <Route path="wishlist" element={<div>Wishlist Page</div>} />
                    <Route path="addresses" element={<div>Addresses Page</div>} />
                </Route>

                {/* Seller Routes */}
                <Route path="/seller" element={
                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<SellerDashboard />} />

                    {/* Product Management Routes */}
                    <Route path="products" element={<ProductList />} />
                    <Route path="products/add" element={<AddProduct />} />
                    <Route path="products/edit/:productId" element={<EditProduct />} />
                    <Route path="products/import" element={<div>Import Products</div>} />
                    <Route path="products/categories" element={<div>Product Categories</div>} />

                    {/* Order Management Routes */}
                    <Route path="orders" element={<OrderList />} />
                    <Route path="orders/:orderId" element={<OrderDetails />} />
                    <Route path="orders/returns" element={<div>Returns & Refunds</div>} />

                    {/* Analytics & Reports */}
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="reports" element={<div>Sales Reports</div>} />

                    {/* Inventory Management */}
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="inventory/low-stock" element={<div>Low Stock Alerts</div>} />

                    {/* Customer Management */}
                    <Route path="customers" element={<div>Customer List</div>} />
                    <Route path="reviews" element={<Reviews />} />

                    {/* Marketing */}
                    <Route path="coupons" element={<div>Coupons</div>} />
                    <Route path="promotions" element={<div>Promotions</div>} />

                    {/* Store Settings */}
                    <Route path="settings" element={<StoreSettings />} />
                    <Route path="settings/store" element={<div>Store Information</div>} />
                    <Route path="settings/shipping" element={<div>Shipping Settings</div>} />
                    <Route path="settings/payment" element={<div>Payment Settings</div>} />
                </Route>

                {/* 404 Page */}
                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                            <p className="text-xl text-gray-600 mb-8">Page not found</p>
                            <a
                                href="/"
                                className="px-6 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#900000] transition-colors inline-block"
                            >
                                Go Home
                            </a>
                        </div>
                    </div>
                } />
            </Routes>
        </ErrorBoundary>
    )
}

export default AppRoutes