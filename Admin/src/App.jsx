import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/Layout/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Sellers from "./pages/Sellers";
import SellerVerification from "./pages/SellerVerification";
import Users from "./pages/Users";
import Login from "./pages/Login";
import SellerAnalytics from "./pages/SellerAnalytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AdminCategories from "./pages/AdminCategories";

// Add these imports
import ContractorsList from "./pages/ContractorsList";
import ContractorDetails from "./pages/ContractorDetails";

function App() {
  const isAuthenticated = () => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    const userRole = localStorage.getItem("userRole");
    
    // Check for admin token or user with admin role
    return (token && userType === "admin") || (token && userRole === "admin");
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sellers" element={<Sellers />} />
          <Route path="seller-verification" element={<SellerVerification />} />
          <Route path="seller-analytics" element={<SellerAnalytics />} />
          <Route path="users" element={<Users />} />
          <Route path="category" element={<AdminCategories />} />
          
          {/* Add Contractors Routes */}
          <Route path="contractors" element={<ContractorsList />} />
          <Route path="contractors/:id" element={<ContractorDetails />} />
          
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Future routes - comment out for now */}
          {/* <Route path="products" element={<Products />} /> */}
          {/* <Route path="orders" element={<Orders />} /> */}
          {/* <Route path="payouts" element={<Payouts />} /> */}
          {/* <Route path="inventory" element={<Inventory />} /> */}
        </Route>

        {/* Default route - redirect to admin login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* 404 Route - redirect to admin login */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;