import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();

    // Get authentication data from localStorage
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem('userData');

    console.log('ProtectedRoute check:', {
        token: !!token,
        userRole,
        hasUserData: !!userData,
        currentPath: location.pathname,
        allowedRoles
    });

    // If no token or user data, redirect to login
    if (!token || !userData) {
        console.log('No token or user data, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        // Parse user data to validate it
        const parsedUser = JSON.parse(userData);
        if (!parsedUser || !parsedUser.email) {
            throw new Error('Invalid user data');
        }

        // If allowedRoles is specified, check if user has required role
        if (allowedRoles.length > 0) {
            if (!userRole || !allowedRoles.includes(userRole)) {
                console.log(`Access denied. User role: ${userRole}, Allowed roles:`, allowedRoles);

                // Redirect user to appropriate dashboard based on their role
                switch (userRole) {
                    case 'contractor':
                        return <Navigate to="/contractor/dashboard" replace />;
                    case 'seller':
                        return <Navigate to="/seller/dashboard" replace />;
                    case 'admin':
                        return <Navigate to="/admin/dashboard" replace />;
                    default:
                        return <Navigate to="/" replace />;
                }
            }
        }

        console.log('Access granted for role:', userRole);
        return children;
    } catch (error) {
        console.error('Protected route error:', error);
        // Clear invalid data and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
};

export default ProtectedRoute;