// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Page Imports (updated paths to match your actual folder structure)
import SellerLoginPage from "../Pages/SellerLogin.jsx";
import SellerRegisterPage from "../Pages/SellerRegistration.jsx";

import HomePage from "../pages/HomePage.jsx"; // Customer homepage
import SellerHome from "../Pages/SellerHome.jsx"; // Seller Dashboard Home

// Catalog & Product Management
import AddSingleCatalog from "../pages/Catalogs/AddSingleCatalog.jsx";
import EditProduct from "../pages/Catalogs/EditProduct.jsx";
import SellerProducts from "../pages/Catalogs/SellerProducts.jsx";
import BulkCatalogUpload from "../pages/Catalogs/BulkCatalogUpload.jsx";

// Other Seller Sections
import OrdersDashboard from "../pages/Order/OrdersDashboard.jsx";
import InventoryDashboard from "../pages/Inventory/InventoryDashboard.jsx";
import PaymentsDashboard from "../pages/Payments/PaymentDashboard.jsx";
import SellerSettings from "../pages/Setting/SellerSettings.jsx";

// Layout Components
import SidebarNavigation from "../components/SidebarNavigation.jsx";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Use consistent key (you used 'token' in login)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSeller = user?.role === 'seller' || user?.businessName; // Extra check if needed

  if (!token || !isSeller) {
    return <Navigate to="/seller/login" replace />;
  }
  return children;
};

// Dashboard Layout Wrapper
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarNavigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10 border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1 px-4 lg:px-0"></div>

            {/* Right-side icons (search, notifications, profile) */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Main App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/seller/login" element={<SellerLoginPage />} />
      <Route path="/seller/register" element={<SellerRegisterPage />} />

      {/* Protected Seller Dashboard Routes */}
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SellerHome />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect old paths or root seller path */}
      <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
      <Route path="/seller/home-dashboard" element={<Navigate to="/seller/dashboard" replace />} />

      {/* Catalog Management */}
      <Route
        path="/seller/catalog/add"
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
              <EditProduct />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/bulk-upload"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BulkCatalogUpload />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Orders, Inventory, Payments, Settings */}
      <Route
        path="/seller/orders"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <OrdersDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/inventory"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <InventoryDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/payments"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PaymentsDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SellerSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all: Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/seller/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;