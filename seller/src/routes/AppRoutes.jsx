// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Page imports - check these files actually exist in your project
import SellerLogin from "../Pages/SellerLogin"; // Should be ../Pages/SellerLogin.jsx
import SellerRegistration from "../Pages/SellerRegistration.jsx"; // Should be ../Pages/SellerRegistration.jsx
import HomePage from "../Pages/HomePage"; // Should be ../Pages/HomePage.jsx
import SellerHome from "../Pages/SellerHome"; // Should be ../Pages/SellerHome.jsx
import AddSingleCatalog from "../Pages/Catalogs/AddSingleCatalog.jsx";
import EditProduct from "../Pages/Catalogs/EditProduct.jsx";
import SellerProducts from "../Pages/Catalogs/SellerProducts.jsx";
import BulkCatalogUpload from "../Pages/Catalogs/BulkCatalogUpload.jsx";
import OrdersDashboard from "../Pages/Order/OrdersDashboard.jsx";
import InventoryDashboard from "../Pages/Inventory/InventoryDashboard.jsx";
import PaymentsDashboard from "../Pages/Payments/PaymentDashboard.jsx";
import SellerSettings from "../Pages/Setting/SellerSettings.jsx";
// Layout Components - check these exist
import SidebarNavigation from "../components/SidebarNavigation"; // Should be ../components/SidebarNavigation.jsx

// You mentioned SellerDashboard but it's not used in routes
// import SellerDashboard from "../pages/SellerDashboard";

// Dummy protected route
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('brickskart_token') || true; // Check for token
  return isAuth ? children : <Navigate to="/seller-login" />;
};

// Main Dashboard Layout
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNavigation
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/seller-login" element={<SellerLogin />} />
      <Route path="/seller-register" element={<SellerRegistration />} />

      {/* Protected Seller Routes */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SellerHome />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/home-dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SellerHome />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/catalog"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AddSingleCatalog />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
       <Route
        path="/seller/my-products"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SellerProducts />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
 <Route
        path="/seller/edit-product/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EditProduct  />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/bulk-uplode"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BulkCatalogUpload  />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/orders-dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <OrdersDashboard  />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/inventory"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <InventoryDashboard  />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/payment-dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PaymentsDashboard  />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
       <Route
        path="/seller/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SellerSettings  />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/seller/home-dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;