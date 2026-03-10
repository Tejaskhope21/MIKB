import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { height } = Dimensions.get("window");
const isIOS = Platform.OS === "ios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.log("Token retrieval error:", err);
  }
  return config;
});

const ordersAPI = {
  fetchUserOrders: async () => {
    try {
      const response = await api.get("/orders/my-orders");
      return response.data.success ? response.data.orders || [] : [];
    } catch (err) {
      console.error("Fetch orders failed:", err?.response?.data || err.message);
      return [];
    }
  },
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "Login", onPress: () => router.replace("/(auth)/login") },
        ]);
        return;
      }

      const rawOrders = await ordersAPI.fetchUserOrders();

      const transformed = rawOrders.map((order) => ({
        _id: order._id,
        orderId: order.orderId || `ORD-${String(order._id || "").slice(-6)}`,
        status: String(order.status || "pending").toLowerCase(),
        totalAmount: Number(order.totalPrice || 0),
        orderDate: order.createdAt,
        paymentMethod: order.paymentMethod || "COD",
        deliveryAddress: formatAddress(order.shippingAddress),
        items: (order.items || []).map((item) => ({
          name: item?.product?.name || "Product Name Missing",
          quantity: Number(item?.quantity || 1),
          price: Number(item?.price || item?.product?.price || 0),
          amount:
            Number(item?.quantity || 1) *
            Number(item?.price || item?.product?.price || 0),
        })),
      }));

      setOrders(transformed);
    } catch (error) {
      console.error("Orders fetch failed:", error);
      Alert.alert("Error", "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const formatAddress = (addr) => {
    if (!addr) return "No address provided";
    const { address, city, state, pincode } = addr;
    return [address, city, state, pincode].filter(Boolean).join(", ");
  };

  const formatCurrency = (amt) =>
    `₹${Number(amt || 0).toLocaleString("en-IN")}`;
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  const getStatusConfig = (status) => {
    const map = {
      pending: {
        bg: "#FEF3C7",
        text: "#D97706",
        icon: "time-outline",
        label: "Pending",
      },
      paid: {
        bg: "#EDE9FE",
        text: "#7C3AED",
        icon: "card-outline",
        label: "Paid",
      },
      shipped: {
        bg: "#DBEAFE",
        text: "#2563EB",
        icon: "car-outline",
        label: "Shipped",
      },
      delivered: {
        bg: "#D1FAE5",
        text: "#059669",
        icon: "checkmark-circle",
        label: "Delivered",
      },
      cancelled: {
        bg: "#FEE2E2",
        text: "#DC2626",
        icon: "close-circle",
        label: "Cancelled",
      },
    };
    return map[status?.toLowerCase()] || map.pending;
  };

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      o.orderId.toLowerCase().includes(term) ||
      o.items.some((i) => i.name.toLowerCase().includes(term));
    const matchesFilter = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleDownloadInvoice = (order) => {
    if (!order) return;

    const invoiceDetails = `
====================================
          INVOICE
====================================
Order ID          : ${order.orderId || "N/A"}
Placed on         : ${formatDate(order.orderDate)}
Status            : ${order.status?.toUpperCase() || "UNKNOWN"}
Payment Method    : ${order.paymentMethod || "N/A"}
Delivery Address  : ${order.deliveryAddress || "No address"}

------------------------------------
Items (${order.items?.length || 0}):
------------------------------------
${order.items
  ?.map(
    (item, index) =>
      `${index + 1}. ${item.name || "Unknown Product"}\n` +
      `   Qty: ${item.quantity || 0} × ₹${Number(item.price || 0).toLocaleString("en-IN")}\n` +
      `   Amount: ₹${Number(item.amount || 0).toLocaleString("en-IN")}\n`,
  )
  .join("")}
------------------------------------

TOTAL AMOUNT      : ${formatCurrency(order.totalAmount)}

Thank you for shopping with us!
====================================
    `.trim();

    Alert.alert(
      "Invoice Generated",
      "Invoice preview (text format):\n\n" +
        invoiceDetails.substring(0, 500) +
        (invoiceDetails.length > 500 ? "..." : ""),
      [
        { text: "Close", style: "cancel" },
        {
          text: "Copy to Clipboard",
          onPress: () => {
            Alert.alert(
              "Copied",
              "Invoice text copied to clipboard! (expo-clipboard required)",
            );
          },
        },
      ],
    );
  };

  const renderOrderCard = ({ item, index }) => {
    const status = getStatusConfig(item.status);
    const firstItem = item.items?.[0] || { name: "No items" };
    const displayName =
      item.items?.length === 1
        ? firstItem.name
        : `${firstItem.name} + ${item.items.length - 1} more`;

    return (
      <TouchableOpacity
        style={[styles.orderCard, index === 0 && { marginTop: 0 }]}
        activeOpacity={0.8}
        onPress={() => handleViewOrder(item)}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderId}>{item.orderId}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Icon name={status.icon} size={14} color={status.text} />
            <Text style={[styles.statusText, { color: status.text }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <Text style={styles.productName} numberOfLines={1}>
          {displayName}
        </Text>

        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Placed on</Text>
          <Text style={styles.dateValue}>{formatDate(item.orderDate)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(item.totalAmount)}
            </Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>Payment</Text>
            <Text
              style={[
                styles.paymentText,
                { color: item.paymentMethod === "COD" ? "#b45309" : "#059669" },
              ]}
            >
              {item.paymentMethod}
            </Text>
          </View>
        </View>

        <View style={styles.itemsCount}>
          <Text style={styles.itemsLabel}>Items</Text>
          <Text style={styles.itemsValue}>
            {item.items?.length || 0} item{item.items?.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => handleViewOrder(item)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Icon name="chevron-forward" size={16} color="#800000" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#800000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#800000"]}
            tintColor="#800000"
          />
        }
        style={styles.content}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon
              name="search"
              size={20}
              color="#9CA3AF"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map(
            (s) => {
              const active = filterStatus === s;
              const conf = getStatusConfig(s === "all" ? "pending" : s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.filterChip,
                    active && {
                      backgroundColor: conf.text,
                      borderColor: conf.text,
                    },
                  ]}
                  onPress={() => setFilterStatus(s)}
                >
                  <Text
                    style={[styles.filterText, active && { color: "#fff" }]}
                  >
                    {s === "all" ? "All" : conf.label}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </ScrollView>

        {filteredOrders.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="cart-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {searchTerm ? "No matching orders found" : "No orders yet"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          />
        )}
      </ScrollView>

      {/* Order Detail Modal */}
      <Modal
        visible={!!selectedOrder}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedOrder(null)}
      >
        {selectedOrder && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />

              <ScrollView style={{ flex: 1 }}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => setSelectedOrder(null)}
                    style={styles.modalBack}
                  >
                    <Icon name="arrow-back" size={24} color="#374151" />
                    <Text
                      style={{ marginLeft: 8, fontSize: 16, color: "#374151" }}
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <View style={{ width: 60 }} />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Order #{selectedOrder.orderId || "N/A"}
                  </Text>
                  <Text style={styles.dateText}>
                    Placed on {formatDate(selectedOrder.orderDate)}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Items ({selectedOrder.items?.length || 0})
                  </Text>
                  {selectedOrder.items?.map((item, i) => (
                    <View key={i} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>
                          {item.name || "Unknown"}
                        </Text>
                        <Text style={styles.itemQty}>
                          {item.quantity || 0} × ₹
                          {Number(item.price || 0).toLocaleString("en-IN")}
                        </Text>
                      </View>
                      <Text style={styles.itemAmount}>
                        ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Delivery Address</Text>
                  <Text style={styles.address}>
                    {selectedOrder.deliveryAddress || "N/A"}
                  </Text>
                </View>

                <View style={styles.totalSection}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(selectedOrder.totalAmount)}
                  </Text>
                </View>

                {selectedOrder.status === "delivered" && (
                  <TouchableOpacity
                    style={styles.downloadInvoiceButton}
                    onPress={() => handleDownloadInvoice(selectedOrder)}
                  >
                    <Icon
                      name="document-text-outline"
                      size={20}
                      color="#059669"
                    />
                    <Text style={styles.downloadInvoiceText}>
                      Download Invoice
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#800000",
    padding: 16,
    paddingTop: isIOS ? 16 : 16 + StatusBar.currentHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#800000",
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 24,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 12,
  },
  filterText: {
    fontWeight: "500",
    color: "#4B5563",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 8,
  },
  dateValue: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemsCount: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  itemsValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  viewDetailsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  viewDetailsText: {
    color: "#800000",
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.88,
    minHeight: 400,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalBack: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  dateText: {
    color: "#6B7280",
    fontSize: 14,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemQty: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  address: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F9FAFB",
    margin: 20,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#800000",
  },
  downloadInvoiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  downloadInvoiceText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});
