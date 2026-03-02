import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_URL =
  Platform.OS === "web"
    ? "https://bricks-backend-qyea.onrender.com/api"
    : "http://10.0.2.2:5000/api";

const api = axios.create({
  baseURL: API_URL, // Android emulator
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================= AUTH =================
export const authAPI = {
  login: (data) => api.post("/auth/user/login", data),

  getProfile: () => api.get("/user/profile"),

  updateProfile: (data) => api.put("/user/profile", data),

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userData");
  },
};

// ================= ORDERS =================
export const ordersAPI = {
  fetchUserOrders: async () => {
    const res = await api.get("/orders/my-orders");
    return res.data.orders || [];
  },

  fetchOrderById: (id) => api.get(`/orders/${id}`),

  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),

  createOrder: (data) => api.post("/orders", data),
};

// ================= ADDRESSES =================
export const addressesAPI = {
  fetchUserAddresses: async () => {
    const res = await api.get("/user/addresses");
    return res.data.addresses || [];
  },

  addAddress: (data) => api.post("/user/addresses", data),

  updateAddress: (id, data) => api.put(`/user/addresses/${id}`, data),

  deleteAddress: (id) => api.delete(`/user/addresses/${id}`),

  setDefaultAddress: (id) => api.patch(`/user/addresses/${id}/default`),
};

export default api;
