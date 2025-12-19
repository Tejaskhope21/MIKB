import { Routes, Route } from 'react-router-dom'
import Home from "../pages/Home/HomePage"
import ProductsPage from "../pages/Products/Products"
import ProductDetailsPage from "../pages/Products/ProductsDetails"
import CartPage from "../pages/Cart/CartPage"
import MainLayout from "../layouts/MainLayout"
import LoginPage from "../pages/Users/LoginPage"
import RegisterPage from "../pages/Users/RegisterPage"
import ProtectedRoute from '../components/Auth/ProtectedRoute'

import ErrorBoundary from '../components/ErrorBoundary'

// Seller Components
import SellerLayout from '../layouts/SellerLayout'
import SellerDashboard from '../components/Seller/Dashboard'
import ProductList from '../components/Seller/Products/ProductList'
import OrderList from '../components/Seller/Orders/OrderList'

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
                    
                </Route>

                {/* Auth routes (without MainLayout) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Seller Routes */}
                <Route path="/seller" element={
                    <ProtectedRoute allowedRoles={['SELLER']}>
                        <SellerLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<SellerDashboard />} />
                    <Route path="dashboard" element={<SellerDashboard />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="orders" element={<OrderList />} />
                    {/* Add other seller routes here */}
                </Route>

                {/* 404 Page */}
                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                            <p className="text-xl text-gray-600 mb-8">Page not found</p>
                            <a href="/" className="px-6 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#900000] transition-colors">
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