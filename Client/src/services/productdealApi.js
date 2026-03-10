import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

/* ================= HOT DEALS ================= */

export const fetchHotDeals = async () => {
  const res = await API.get("/deals");
  return res.data;
};

export const trackHotDealView = async (productId) => {
  try {
    await API.post(`/deals/view/${productId}`);
  } catch (err) {
    console.error("View tracking failed", err);
  }
};

export const trackHotDealClick = async (productId) => {
  try {
    await API.post(`/deals/click/${productId}`);
  } catch (err) {
    console.error("Click tracking failed", err);
  }
};

/* ================= TRENDING ================= */

export const fetchTrendingProducts = async () => {
  const res = await API.get("/trending");
  return res.data;
};

export const trackTrendingView = async (productId) => {
  try {
    await API.post(`/trending/view/${productId}`);
  } catch (err) {
    console.error("Trending view tracking failed", err);
  }
};

export const trackTrendingClick = async (productId) => {
  try {
    await API.post(`/trending/click/${productId}`);
  } catch (err) {
    console.error("Trending click tracking failed", err);
  }
};