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
          <Stack.Screen name="(tabs)" />

          {/* STACK SCREENS */}
          <Stack.Screen name="categories/[id]" />
          <Stack.Screen name="contractorsListScreen" />
          <Stack.Screen name="product/[id]" />

          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal' }}
          />
        </Stack>
      </CartProvider>
    </SafeAreaProvider>
  );
}
