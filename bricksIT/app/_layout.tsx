// app/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '../context/CartContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <StatusBar style="dark" />

        <Stack screenOptions={{ headerShown: false }}>
          {/* Bottom Tabs */}
          <Stack.Screen name="(tabs)" />

          {/* Stack Screens (NOT Tabs) */}
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="contractorsListScreen" /> {/* ✅ moved here */}
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal' }}
          />
        </Stack>
      </CartProvider>
    </SafeAreaProvider>
  );
}
