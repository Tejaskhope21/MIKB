import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Flame,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  RotateCcw,
} from "lucide-react";

/* ===============================
   API BASE
================================ */
const API = "http://localhost:5000/api/v1";

/* ===============================
   HELPERS
================================ */
const isHotDealExpired = (hotDeal) => {
  if (!hotDeal?.expiresAt) return false;
  return new Date(hotDeal.expiresAt) < new Date();
};

const SellerProductHotDeal = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  /* ===============================
       AUTH AXIOS INSTANCE
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
  const fetchSellerProducts = async () => {
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
    fetchSellerProducts();
  }, []);

  /* ===============================
       REQUEST HOT DEAL
    ================================ */
  const requestHotDeal = async (productId) => {
    try {
      setActionLoading(true);
      const res = await axiosAuth.put(`/deals/request/${productId}`);
      alert(res.data.message);
      fetchSellerProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Hot deal request failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ===============================
       MAKE PAYMENT
    ================================ */
  const makePayment = async (productId) => {
    try {
      setActionLoading(true);
      const res = await axiosAuth.post(
        `/deals/create-checkout-session/${productId}`,
      );

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert("Stripe session not created");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ===============================
       STATUS BADGE
    ================================ */
  const renderStatus = (hotDeal = {}) => {
    if (hotDeal.isApproved && hotDeal.isPaid && !isHotDealExpired(hotDeal)) {
      return (
        <span className="text-green-600 flex items-center gap-1">
          <CheckCircle size={16} /> Active
        </span>
      );
    }

    if (hotDeal.isApproved && isHotDealExpired(hotDeal)) {
      return (
        <span className="text-orange-600 flex items-center gap-1">
          <RotateCcw size={16} /> Expired
        </span>
      );
    }

    if (hotDeal.isApproved && !hotDeal.isPaid) {
      return (
        <span className="text-blue-600 flex items-center gap-1">
          <Clock size={16} /> Payment Pending
        </span>
      );
    }

    if (hotDeal.isRejected) {
      return (
        <span className="text-red-600 flex items-center gap-1">
          <XCircle size={16} /> Rejected
        </span>
      );
    }

    if (hotDeal.isRequested) {
      return (
        <span className="text-yellow-600 flex items-center gap-1">
          <Clock size={16} /> Pending Approval
        </span>
      );
    }

    return (
      <span className="text-gray-500 flex items-center gap-1">
        <Flame size={16} /> Not in Hot Deal
      </span>
    );
  };

  /* ===============================
       ACTION BUTTON (🔥 FIXED)
    ================================ */
  const renderActionButton = (product) => {
    const hd = product.hotDeal || {};
    const expired = isHotDealExpired(hd);

    // ✅ FIRST TIME OR EXPIRED → ALLOW RE-APPLY
    if (
      (!hd.isRequested && !hd.isApproved && !hd.isRejected) ||
      (hd.isApproved && expired)
    ) {
      return (
        <button
          disabled={actionLoading}
          onClick={() => requestHotDeal(product._id)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {expired ? "Re-Apply Hot Deal" : "Add to Hot Deal"}
        </button>
      );
    }

    // 💳 PAYMENT REQUIRED
    if (hd.isApproved && !hd.isPaid) {
      return (
        <button
          disabled={actionLoading}
          onClick={() => makePayment(product._id)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
        >
          <CreditCard size={16} />
          Pay Now
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
      <h1 className="text-2xl font-bold mb-6">🔥 Product Hot Deals</h1>

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
                {renderStatus(product.hotDeal)}
              </div>

              {renderActionButton(product)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProductHotDeal;
