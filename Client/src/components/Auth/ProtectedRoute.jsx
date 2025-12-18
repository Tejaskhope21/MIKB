// components/Auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        // Redirect to login if no token or user
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        // Validate user data
        const parsedUser = JSON.parse(user);
        if (!parsedUser || !parsedUser.email) {
            throw new Error('Invalid user data');
        }

        // Optional: Check token expiry (if you store expiry in token)
        // const decodedToken = jwtDecode(token); // if using jwt-decode library
        // if (decodedToken.exp * 1000 < Date.now()) {
        //     localStorage.removeItem('token');
        //     localStorage.removeItem('user');
        //     return <Navigate to="/login" replace />;
        // }

        return children;
    } catch (error) {
        console.error('Protected route error:', error);
        // Clear invalid data and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
};

export default ProtectedRoute;