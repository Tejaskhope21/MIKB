// app/(tabs)/ProfileScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

/* =========================
   DYNAMIC API BASE URL
========================= */
const getApiBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }

  // For Android/iOS apps
  if (__DEV__) {
    return "http://localhost:5000/api";
  }

  // For production builds
  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for adding token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Silent error handling
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(["token", "userData"]);
    }
    return Promise.reject(error);
  },
);

// API Functions
const authAPI = {
  getProfile: async () => {
    try {
      const response = await api.get("/user/profile");
      return response;
    } catch (error) {
      try {
        const response = await api.get("/auth/profile");
        return response;
      } catch (secondError) {
        throw error;
      }
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore logout API errors
    }
    await AsyncStorage.multiRemove([
      "token",
      "userData",
      "cart",
      "userRole",
      "isLoggedIn",
    ]);
    return { success: true };
  },
};

const ordersAPI = {
  fetchUserOrders: async () => {
    try {
      const response = await api.get("/orders/my-orders");
      return response.data.orders || response.data || [];
    } catch (error) {
      return [];
    }
  },
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    checkloginAndLoadProfile();
  }, []);

  const checkloginAndLoadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setTimeout(() => {
          router.replace("/(auth)/Login");
        }, 100);
        return;
      }

      const profileRes = await authAPI.getProfile();
      const userData = profileRes.data?.user || profileRes.data;

      if (!userData) {
        throw new Error("No user data received");
      }

      setUser(userData);

      try {
        const userOrders = await ordersAPI.fetchUserOrders();
        setOrders(userOrders.slice(0, 5));
      } catch (orderError) {
        setOrders([]);
      }
    } catch (error) {
      await AsyncStorage.multiRemove(["token", "userData"]);

      Alert.alert("Session Expired", "Please login again", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/Login"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setOrders([]);
      setShowLogoutModal(false);

      Alert.alert("Logged Out", "You have been successfully logged out.", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/(auth)/Login");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to logout. Please try again.");
      setShowLogoutModal(false);
    }
  };

  const menuItems = [
    {
      icon: "cart-outline",
      label: "My Orders",
      onPress: () => router.push("/OrdersScreen"),
    },
    {
      icon: "location-outline",
      label: "My Addresses",
      onPress: () => router.push("/AddressesScreen"),
    },
    {
      icon: "chatbubble-outline",
      label: "Help & Support",
      onPress: () => router.push("/SupportScreen"),
    },
    {
      icon: "settings-outline",
      label: "Settings",
      onPress: () => router.push("/SettingsScreen"),
    },
    {
      icon: "log-out-outline",
      label: "Logout",
      onPress: () => setShowLogoutModal(true),
      color: "#dc3545",
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.guestHeader}>
            <View style={styles.avatarContainer}>
              <Icon name="person-circle-outline" size={50} color="#fff" />
            </View>
            <Text style={styles.guestTitle}>Welcome Guest!</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to access all features
            </Text>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push("/(auth)/Login")}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>BricksIT v1.0.0</Text>
          <Text style={styles.appCopyright}>
            © 2026 BricksIT. All rights reserved.
          </Text>
          {__DEV__ && <Text style={styles.apiInfo}>API: {API_BASE_URL}</Text>}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.name?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name || "User"}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userPhone}>
            {user.phone || "No phone number"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/edit-profile")}
        >
          <Icon name="pencil" size={20} color="#800000" />
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}></Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
                item.color && styles.logoutMenuItem,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[
                    styles.menuIconContainer,
                    item.color && { backgroundColor: "#ffebee" },
                  ]}
                >
                  <Icon
                    name={item.icon}
                    size={22}
                    color={item.color || "#800000"}
                  />
                </View>
                <Text
                  style={[
                    styles.menuLabel,
                    item.color && { color: item.color },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              <View style={styles.menuRight}>
                {item.count > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.count}</Text>
                  </View>
                )}
                <Icon
                  name="chevron-forward"
                  size={20}
                  color={item.color || "#999"}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>BricksIT v1.0.0</Text>
        <Text style={styles.appCopyright}>
          © 2026 BricksIT. All rights reserved.
        </Text>
      </View>

      <Modal
        transparent={true}
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Icon name="log-out-outline" size={40} color="#dc3545" />
              <Text style={styles.modalTitle}>Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to logout from your account?
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#800000",
    padding: 24,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 40,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#800000",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guestHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 24,
    textAlign: "center",
  },
  signInButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: "#800000",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  logoutMenuItem: {
    backgroundColor: "#fff8f8",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    fontWeight: "500",
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  countBadge: {
    backgroundColor: "#800000",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
    minWidth: 24,
    alignItems: "center",
  },
  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 32,
    paddingBottom: 40,
  },
  appVersion: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  appCopyright: {
    fontSize: 12,
    color: "#999",
  },
  apiInfo: {
    fontSize: 10,
    color: "#ccc",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#dc3545",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
