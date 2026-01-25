import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack>
        {/* Login Screen */}
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
        
        {/* Register Screen */}
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
          }}
        />
        
        {/* Main Tabs */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        
        {/* Product Details */}
        <Stack.Screen
          name="product/[id]"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        
        {/* Products Screen */}
        <Stack.Screen
          name="products"
          options={{
            headerShown: false,
          }}
        />
        
        {/* Checkout Screen */}
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        
        {/* Seller Dashboard */}
        <Stack.Screen
          name="seller-dashboard"
          options={{
            headerShown: false,
          }}
        />
        
        {/* Contractor Dashboard */}
        <Stack.Screen
          name="contractor-dashboard"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </CartProvider>
  );
}