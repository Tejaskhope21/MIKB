// src/services/contractorapi.js

const getAPIBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const isLocal =
    window.location.hostname.includes("localhost") ||
    window.location.hostname === "127.0.0.1";

  return isLocal
    ? "http://localhost:5000/api/contractor"
    : "http://localhost:5000/api/contractor";
};

const API_BASE_URL = getAPIBaseURL();

// Safe fetch with timeout and better error handling
const safeFetch = async (endpoint, options = {}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const endpointPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${endpointPath}`;

    const token = localStorage.getItem("token");

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: (await response.text()) || response.statusText };
      }
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  }
};

/* =========================
   MAIN CONTRACTOR API FUNCTIONS
========================= */

export const getContractors = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("page", filters.page || "1");
    params.append("limit", filters.limit || "12");

    const filterKeys = [
      "search",
      "specialty",
      "location",
      "minRating",
      "minExperience",
      "sortBy",
    ];
    filterKeys.forEach((key) => {
      if (filters[key]) params.append(key, filters[key]);
    });

    const endpoint = params.toString() ? `/filter/all?${params}` : "/";
    const data = await safeFetch(endpoint);

    return {
      success: true,
      contractors: data.data || data.contractors || [],
      total: data.total || 0,
      pages: data.pages || 1,
      page: data.page || 1,
    };
  } catch (err) {
    return { success: false, contractors: [], total: 0, error: err.message };
  }
};

export const getContractorById = async (id) => {
  try {
    const data = await safeFetch(`/${id}`);
    return { success: true, contractor: data.data || data.contractor || data };
  } catch (err) {
    return { success: false, contractor: null, error: err.message };
  }
};

export const getContractorFilterOptions = async () => {
  try {
    const data = await safeFetch("/filter/options");
    return {
      success: true,
      specialties: data.specialties || [],
      locations: data.locations || [],
    };
  } catch (err) {
    return {
      success: false,
      specialties: ["Residential", "Commercial", "Renovation"],
      locations: ["New York", "Los Angeles", "Chicago"],
    };
  }
};

export const addContractorReview = async (contractorId, reviewData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Please login to submit a review" };
    }

    const response = await fetch(`${API_BASE_URL}/${contractorId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Server error" }));
      return {
        success: false,
        message: error.message || "Failed to submit review",
      };
    }

    const data = await response.json();
    return {
      success: true,
      review: data.review || data.data,
      message: "Review submitted!",
    };
  } catch (err) {
    return { success: false, message: err.message || "Network error" };
  }
};

export const updateContractorViews = async (contractorId) => {
  try {
    await safeFetch("/analytics/view", {
      method: "PUT",
      body: JSON.stringify({ contractorId, type: "profile" }),
    });
    return { success: true };
  } catch (err) {
    console.error("View update failed:", err);
    return { success: false };
  }
};

export const formatContractorForDisplay = (c) => ({
  id: c._id || c.id,
  companyName: c.companyName || "Unknown Contractor",
  name: c.name || "",
  description: c.description || "",
  location: c.location || "Location not specified",
  experience: c.experience || 0,
  specialties: c.specialties || [],
  profileImage: c.profileImage || "",
  verified: c.verified || false,
  reviews: c.reviews || [],
  portfolio: c.portfolio || [],
  phone: c.phone || "",
  email: c.email || "",
  rating: c.rating || 0,
  reviewCount: c.reviews?.length || 0,
  tagline: c.tagline || "",
  availability: c.availability || "available",
});

const contractorAPI = {
  getContractors,
  getContractorById,
  getContractorFilterOptions,
  addContractorReview,
  updateContractorViews,
  formatContractorForDisplay,
};

export default contractorAPI;
