// app/_layout.js
import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{
            headerShown: false,
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="prducts"
          options={{
            headerShown: false,
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: false,
            presentation: 'modal'
          }}
        />
      </Stack>
    </CartProvider>
  );
}