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

// Additional pages you might need
// import Products from "./pages/Products";
// import Orders from "./pages/Orders";
// import Payouts from "./pages/Payouts";
// import Inventory from "./pages/Inventory";

function App() {
  const isAuthenticated = () => {
    const token = localStorage.getItem("adminToken");
    const userType = localStorage.getItem("userType");
    return token && userType === "admin";
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
          {/* <Route path="products" element={<Products />} /> */}
          {/* <Route path="orders" element={<Orders />} /> */}
          {/* <Route path="payouts" element={<Payouts />} /> */}
          {/* <Route path="inventory" element={<Inventory />} /> */}
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
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