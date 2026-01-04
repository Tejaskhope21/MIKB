// app/_layout.jsx
import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '../context/CartContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <StatusBar style="dark" backgroundColor="#800000" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" options={{ title: 'Product Details' }} />
          <Stack.Screen name="cart" options={{ title: 'Shopping Cart' }} />
          <Stack.Screen name="search" options={{ title: 'Search' }} />
        </Stack>
      </CartProvider>
    </SafeAreaProvider>
  );
}