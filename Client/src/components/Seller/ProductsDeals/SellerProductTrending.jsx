import React, { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp, Clock, CheckCircle, XCircle, Flame } from "lucide-react";

/* ===============================
   API BASE
================================ */
const API = "http://localhost:5000/api/v1";

/* ===============================
   HELPERS
================================ */
const isActiveHotDeal = (hotDeal) => {
  if (!hotDeal?.isApproved) return false;
  if (!hotDeal?.expiresAt) return false;
  return new Date(hotDeal.expiresAt) > new Date();
};

const SellerProductTrending = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  /* ===============================
       AUTH AXIOS
    ================================ */
  const axiosAuth = axios.create({
    baseURL: API,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  /* ===============================
       FETCH SELLER PRODUCTS
    ================================ */
  const fetchProducts = async () => {
    try {
      const res = await axiosAuth.get("/products/my");
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ===============================
       REQUEST TRENDING
    ================================ */
  const requestTrending = async (productId) => {
    try {
      setActionLoading(true);
      const res = await axiosAuth.put(`/trending/request/${productId}`);
      alert(res.data.message);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Trending request failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ===============================
       STATUS BADGE
    ================================ */
  const renderStatus = (trending = {}) => {
    if (trending.isApproved) {
      return (
        <span className="text-green-600 flex items-center gap-1">
          <CheckCircle size={16} /> Trending
        </span>
      );
    }

    if (trending.isRejected) {
      return (
        <span className="text-red-600 flex items-center gap-1">
          <XCircle size={16} /> Rejected
        </span>
      );
    }

    if (trending.isRequested) {
      return (
        <span className="text-yellow-600 flex items-center gap-1">
          <Clock size={16} /> Pending
        </span>
      );
    }

    return (
      <span className="text-gray-500 flex items-center gap-1">
        <TrendingUp size={16} /> Not Trending
      </span>
    );
  };

  /* ===============================
       ACTION BUTTON
    ================================ */
  const renderActionButton = (product) => {
    const trending = product.trending || {};
    const hotDeal = product.hotDeal || {};

    // ❌ Block if Hot Deal active
    if (isActiveHotDeal(hotDeal)) {
      return (
        <span className="text-sm text-orange-600 flex items-center gap-1">
          <Flame size={14} /> Hot Deal Active
        </span>
      );
    }

    // ✅ Allow request only once
    if (!trending.isRequested && !trending.isApproved && !trending.isRejected) {
      return (
        <button
          disabled={actionLoading}
          onClick={() => requestTrending(product._id)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Add to Trending
        </button>
      );
    }

    return null;
  };

  /* ===============================
       UI
    ================================ */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📈 Product Trending</h1>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white shadow rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-500">₹{product.price}</p>
                {renderStatus(product.trending)}
              </div>

              {renderActionButton(product)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProductTrending;
