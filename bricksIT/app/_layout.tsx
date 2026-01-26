import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth Screens */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />

        {/* Main Tabs */}
        <Stack.Screen name="(tabs)" />

        {/* Extra Screens (NO HEADER) */}
        <Stack.Screen name="AddressesScreen" />
        <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkout" options={{ presentation: 'modal' }} />
        <Stack.Screen name="products" />
        <Stack.Screen name="seller-dashboard" />
        <Stack.Screen name="contractor-dashboard" />
      </Stack>
    </CartProvider>
  );
}
