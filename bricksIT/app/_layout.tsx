import { Stack } from "expo-router";
import { CartProvider } from "../context/CartContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <CartProvider>
          <StatusBar style="light" backgroundColor="#000000" />

          <Stack screenOptions={{ headerShown: false }}>
            {/* Auth Screens */}
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />

            {/* Main Tabs */}
            <Stack.Screen name="(tabs)" />

            {/* Extra Screens */}
            <Stack.Screen name="AddressesScreen" />
            <Stack.Screen name="product/[id]" options={{ presentation: "modal" }} />
            <Stack.Screen name="checkout" options={{ presentation: "modal" }} />
            <Stack.Screen name="products" />
            <Stack.Screen name="seller-dashboard" />
            <Stack.Screen name="contractor-dashboard" />
          </Stack>
        </CartProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
