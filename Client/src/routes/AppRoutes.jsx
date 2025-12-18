// AppRoutes.jsx
import { Routes, Route } from 'react-router-dom'
import Home from "../pages/Home/HomePage"
import ProductsPage from "../pages/Products/Products"
import ProductDetailsPage from "../pages/Products/ProductsDetails"
import CartPage from "../pages/Cart/CartPage"
import MainLayout from "../layouts/MainLayout"
import BrandsPage from "../pages/Brands/BrandPage"
import AllProductsPage from "../pages/Products/AllProductsPage"
import LoginPage from "../pages/Users/LoginPage"
import RegisterPage from "../pages/Users/RegisterPage"
import UserProfilePage from "../components/UserProfilePage"
import ProtectedRoute from '../components/Auth/ProtectedRoute'
import ErrorBoundary from '../components/ErrorBoundary'

const AppRoutes = () => {
    return (
        <ErrorBoundary>
            <Routes>
                {/* Public routes with MainLayout */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<AllProductsPage />} />
                    <Route path="/products/category/:categoryId" element={<ProductsPage />} />
                    <Route path="/product/:productId" element={<ProductDetailsPage />} />
                    <Route path="/brands" element={<BrandsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/post-requirement" element={<div className="container mx-auto px-4 py-8">Post Requirement Page</div>} />
                    <Route path="/sellerhome" element={<div className="container mx-auto px-4 py-8">Seller Home Page</div>} />
                    <Route path="/investor" element={<div className="container mx-auto px-4 py-8">Investor Page</div>} />

                    {/* Protected Routes */}
                    <Route path="/orders" element={
                        <ProtectedRoute>
                            <div className="container mx-auto px-4 py-8">
                                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>
                                <p className="text-gray-600">Your orders will appear here.</p>
                            </div>
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <UserProfilePage />
                        </ProtectedRoute>
                    } />
                </Route>

                {/* Auth routes (without MainLayout) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

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