import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Import Footer
import { useCart } from '../context/CartContext';

const MainLayout = () => {
    const { getCartCount } = useCart();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer - Imported */}
            <Footer />
        </div>
    );
};

export default MainLayout;