import { Routes, Route, Navigate } from 'react-router-dom'
import Home from "../pages/Home/HomePage"
import ProductsPage from "../pages/Products/ProductsPage"
import ProductDetailsPage from "../pages/Products/ProductsDetails"
import CartPage from "../pages/Cart/CartPage"
import CheckoutPage from "../pages/Checkout/CheckoutPage"
import OrderSuccessPage from "../pages/Checkout/OrderSuccess"
import MainLayout from "../layouts/MainLayout"
import LoginPage from "../pages/Users/LoginPage"
import RegisterPage from "../pages/Users/RegisterPage"
import ProtectedRoute from '../components/Auth/ProtectedRoute'
import ErrorBoundary from '../components/ErrorBoundary'
import ProfilePage from '../components/UserProfilePage'
import UserOrdersPage from '../pages/Users/UserOrders'
import OrderDetailsPage from '../pages/Users/OrderDetailsPage'

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

// Contractor Components
import ContractorLayout from '../layouts/ContractorLayout'
import ContractorDashboardPage from '../pages/Contractor/DashboardPage'
import ProjectsPage from '../pages/Contractor/ProjectsPage'
import PortfolioPage from '../pages/Contractor/PortfolioPage'
import QuotesPage from '../pages/Contractor/QuotesPage' // Add this import
import MaterialsPage from '../pages/Contractor/MaterialsPage'
import OrdersPage from '../pages/Contractor/OrdersPage'
import CommunityPage from '../pages/Contractor/CommunityPage'

// Public Components
import InvestorPage from '../pages/Investor/InvestorPage'
import MaterialRequirementPage from '../pages/MaterialRequirement/MaterialRequirementPage'
import CategoryWithSubcategories from '../pages/Category/CategoryWithSubcategories'
import BrandsPage from '../pages/Brands/BrandPage'
import AllProductsPage from "../pages/Products/AllProductsPage"
import SubcategoryProductsPage from "../pages/Products/SubcategoryProductsPage"

const AppRoutes = () => {
    return (
        <ErrorBoundary>
            <Routes>
                {/* Public routes with MainLayout */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<AllProductsPage />} />
                    <Route path="/investors" element={<InvestorPage />} />
                    <Route path="/post-requirement" element={<MaterialRequirementPage />} />
                    <Route path="/products/category/:categoryId" element={<ProductsPage />} />
                    <Route path="/product/:productId" element={<ProductDetailsPage />} />

                    <Route path="/cart" element={<CartPage />} />

                    <Route path="/brands" element={<BrandsPage />} />

                    {/* Protected User Routes (general users) */}
                    <Route path="/category/:categoryId" element={<CategoryWithSubcategories />} />
                    <Route path="/category/:categoryId/subcategory/:subcategoryId/products" element={<SubcategoryProductsPage />} />

                    {/* Protected User Routes */}
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
                    <Route path="/orders/my-orders" element={
                        <ProtectedRoute>
                            <UserOrdersPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/orders/:id" element={
                        <ProtectedRoute>
                            <OrderDetailsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/my-orders" element={
                        <ProtectedRoute>
                            <Navigate to="/orders/my-orders" replace />
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
                    <Route path="wishlist" element={<div>Wishlist Page</div>} />
                    <Route path="addresses" element={<div>Addresses Page</div>} />
                </Route>

                {/* CONTRACTOR ROUTES - Only accessible to contractors */}
                <Route path="/contractor" element={
                    <ProtectedRoute allowedRoles={['contractor']}>
                        <ContractorLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<ContractorDashboardPage />} />

                    {/* Contractor specific routes */}
                    <Route path="projects" element={<div className="p-6">projects Page (Coming Soon)</div>} />
                    <Route path="portfolio" element={<div className="p-6">portfolio Page (Coming Soon)</div>} />
                    <Route path="quotes" element={<div className="p-6">quotes Page (Coming Soon)</div>} />
                    <Route path="materials" element={<div className="p-6">materials Page (Coming Soon)</div>} />
                    <Route path="orders" element={<div className="p-6">orders Page (Coming Soon)</div>} />
                    <Route path="community" element={<div className="p-6">community Page (Coming Soon)</div>} />
                    <Route path="messages" element={<div className="p-6">Messages Page (Coming Soon)</div>} />
                    <Route path="analytics" element={<div className="p-6">Analytics Page (Coming Soon)</div>} />
                    <Route path="finance" element={<div className="p-6">Finance Page (Coming Soon)</div>} />
                    <Route path="schedule" element={<div className="p-6">Schedule Page (Coming Soon)</div>} />
                    <Route path="settings" element={<div className="p-6">Settings Page (Coming Soon)</div>} />
                </Route>

                {/* SELLER ROUTES - Only accessible to sellers and admins */}
                <Route path="/seller" element={
                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<SellerDashboard />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="products/add" element={<AddProduct />} />
                    <Route path="products/edit/:productId" element={<EditProduct />} />
                    <Route path="products/import" element={<div className="p-6">Import Products</div>} />
                    <Route path="products/categories" element={<div className="p-6">Product Categories</div>} />

                    <Route path="orders" element={<OrderList />} />
                    <Route path="orders/:orderId" element={<OrderDetails />} />
                    <Route path="orders/returns" element={<div className="p-6">Returns & Refunds</div>} />

                    <Route path="analytics" element={<Analytics />} />
                    <Route path="reports" element={<div className="p-6">Sales Reports</div>} />

                    <Route path="inventory" element={<Inventory />} />
                    <Route path="inventory/low-stock" element={<div className="p-6">Low Stock Alerts</div>} />

                    <Route path="customers" element={<div className="p-6">Customer List</div>} />
                    <Route path="reviews" element={<Reviews />} />

                    <Route path="coupons" element={<div className="p-6">Coupons</div>} />
                    <Route path="promotions" element={<div className="p-6">Promotions</div>} />

                    <Route path="settings" element={<StoreSettings />} />
                    <Route path="settings/store" element={<div className="p-6">Store Information</div>} />
                    <Route path="settings/shipping" element={<div className="p-6">Shipping Settings</div>} />
                    <Route path="settings/payment" element={<div className="p-6">Payment Settings</div>} />
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

export default AppRoutes;