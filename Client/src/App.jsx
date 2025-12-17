import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { CartProvider } from './context/CartContext';
import CartSidebar from "./components/Cart/CartSidebar";

function App() {
  return (
    <CartProvider>
      <AppRoutes />
      <CartSidebar />
    </CartProvider>
  );
}

export default App;