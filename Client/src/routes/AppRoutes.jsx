import { Routes, Route } from 'react-router-dom'
import Home from "../pages/Home/HomePage"
import ProductsPage from "../pages/Products/Products"
import ProductDetailsPage from "../pages/Products/ProductsDetails"
import CartPage from "../pages/Cart/CartPage"
import MainLayout from "../layouts/MainLayout"
import BrandsPage from "../pages/Brands/BrandPage"
import AllProductsPage from "../pages/Products/AllProductsPage" // Add this

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<AllProductsPage />} /> {/* Add this route */}
                <Route path="/products/category/:categoryId" element={<ProductsPage />} />
                <Route path="/product/:productId" element={<ProductDetailsPage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/cart" element={<CartPage />} />
            </Route>
        </Routes>
    )
}

export default AppRoutes