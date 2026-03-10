// api/requirements.js
import AsyncStorage from "@react-native-async-storage/async-storage";
const API_BASE_URL = "http://localhost:5000/api";

// Helper function for safe fetch with timeout
const safeFetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Error: ${response.status}`,
        data: null,
      };
    }

    return {
      success: true,
      data,
      message: data.message || "Success",
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return {
        success: false,
        message: "Request timeout. Please check your connection.",
        data: null,
      };
    }

    console.error("Fetch error:", error);
    return {
      success: false,
      message: error.message || "Network request failed",
      data: null,
    };
  }
};

export const getUserMaterialRequirements = async (params = {}) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token)
      return { success: false, message: "Authentication required", data: [] };

    const { page = 1, limit = 10, status, sort = "-createdAt" } = params;
    let url = `${API_BASE_URL}/requirements/my?page=${page}&limit=${limit}&sort=${sort}`;
    if (status) url += `&status=${status}`;

    return await safeFetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("getUserMaterialRequirements error:", err);
    return {
      success: false,
      message: "Failed to fetch requirements",
      data: [],
    };
  }
};

export const getMaterialRequirementById = async (requirementId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return { success: false, message: "Authentication required" };

    return await safeFetch(`${API_BASE_URL}/requirements/${requirementId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("getMaterialRequirementById error:", err);
    return { success: false, message: "Failed to fetch requirement" };
  }
};

export const createMaterialRequirement = async (requirementData) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return { success: false, message: "Authentication required" };

    const formattedData = {
      ...requirementData,
      deliveryDate: requirementData.deliveryDate
        ? new Date(requirementData.deliveryDate).toISOString()
        : undefined,
      materials: requirementData.materials?.map((m) => ({
        ...m,
        quantity: parseFloat(m.quantity) || 0,
      })),
    };

    return await safeFetch(`${API_BASE_URL}/requirements`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(formattedData),
    });
  } catch (err) {
    console.error("createMaterialRequirement error:", err);
    return { success: false, message: "Failed to create requirement" };
  }
};

export const updateMaterialRequirement = async (requirementId, updateData) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return { success: false, message: "Authentication required" };

    const formattedData = {
      ...updateData,
      deliveryDate: updateData.deliveryDate
        ? new Date(updateData.deliveryDate).toISOString()
        : undefined,
      materials: updateData.materials?.map((m) => ({
        ...m,
        quantity: parseFloat(m.quantity) || 0,
      })),
    };

    return await safeFetch(`${API_BASE_URL}/requirements/${requirementId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(formattedData),
    });
  } catch (err) {
    console.error("updateMaterialRequirement error:", err);
    return { success: false, message: "Failed to update requirement" };
  }
};

export const cancelMaterialRequirement = async (requirementId, reason = "") => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return { success: false, message: "Authentication required" };

    return await safeFetch(
      `${API_BASE_URL}/requirements/${requirementId}/cancel`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      },
    );
  } catch (err) {
    console.error("cancelMaterialRequirement error:", err);
    return { success: false, message: "Failed to cancel requirement" };
  }
};

export const deleteMaterialRequirement = async (id) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return { success: false, message: "Authentication required" };

    return await safeFetch(`${API_BASE_URL}/requirements/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("deleteMaterialRequirement error:", err);
    return { success: false, message: "Failed to delete requirement" };
  }
};

export const getRequirementStats = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return { success: false, message: "Authentication required" };

    return await safeFetch(`${API_BASE_URL}/requirements/stats/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("getRequirementStats error:", err);
    return { success: false, message: "Failed to fetch stats" };
  }
};

export const submitQuoteForRequirement = async (requirementId, quoteData) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return { success: false, message: "Authentication required" };

    return await safeFetch(
      `${API_BASE_URL}/requirements/${requirementId}/quotes`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(quoteData),
      },
    );
  } catch (err) {
    console.error("submitQuoteForRequirement error:", err);
    return { success: false, message: "Failed to submit quote" };
  }
};

export const acceptQuote = async (requirementId, quoteId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return { success: false, message: "Authentication required" };

    return await safeFetch(
      `${API_BASE_URL}/requirements/${requirementId}/quotes/${quoteId}/accept`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  } catch (err) {
    console.error("acceptQuote error:", err);
    return { success: false, message: "Failed to accept quote" };
  }
};

export const getRequirementQuotes = async (requirementId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return { success: false, message: "Authentication required" };

    return await safeFetch(
      `${API_BASE_URL}/requirements/${requirementId}/quotes`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  } catch (err) {
    console.error("getRequirementQuotes error:", err);
    return { success: false, message: "Failed to fetch quotes" };
  }
};

// Optional: Network status check utility
export const checkNetworkStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
