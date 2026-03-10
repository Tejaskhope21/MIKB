import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import axios from "axios";
import {
  MapPin,
  CreditCard,
  Building,
  Upload,
  CheckCircle,
  Truck,
  AlertCircle,
  ArrowLeft,
  Shield,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [bankTransferDetails, setBankTransferDetails] = useState({
    transactionId: "",
    screenshot: null,
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });

  const [notes, setNotes] = useState("");

  // Price calculation
  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 5000 ? 0 : 150;
  const total = subtotal + tax + shipping;

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userAddresses = res.data.user.addresses || [];
        setAddresses(userAddresses);

        const defaultAddr =
          userAddresses.find((a) => a.isDefault) || userAddresses[0];
        if (defaultAddr) {
          setSelectedAddress(defaultAddr._id);
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
        if (err.response?.status === 401) navigate("/login");
      }
    };

    fetchAddresses();
  }, [navigate]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBankTransferDetails((prev) => ({
        ...prev,
        screenshot: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return false;
    }

    if (paymentMethod === "bank_transfer") {
      if (!bankTransferDetails.transactionId.trim()) {
        alert("Please enter transaction ID / UPI reference");
        return false;
      }
      if (!bankTransferDetails.screenshot) {
        alert("Please upload payment screenshot");
        return false;
      }
      if (!bankTransferDetails.bankName.trim()) {
        alert("Please enter bank name");
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const selectedAddrObj = addresses.find((a) => a._id === selectedAddress);
      if (!selectedAddrObj) {
        alert("Selected address not found");
        setLoading(false);
        return;
      }

      const shippingAddress = {
        address: selectedAddrObj.addressLine || selectedAddrObj.address || "",
        city: selectedAddrObj.city || "",
        state: selectedAddrObj.state || "",
        pincode: selectedAddrObj.pincode || "",
        fullName: selectedAddrObj.fullName || "",
        phone: selectedAddrObj.phone || "",
      };

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: paymentMethod === "cod" ? "COD" : "BANK_TRANSFER",
        notes: notes.trim(),
      };

      if (paymentMethod === "bank_transfer") {
        payload.paymentProof = {
          transactionId: bankTransferDetails.transactionId,
          screenshot: bankTransferDetails.screenshot,
          userBankDetails: {
            bankName: bankTransferDetails.bankName,
            accountName: bankTransferDetails.accountName,
            accountNumber: bankTransferDetails.accountNumber,
            ifscCode: bankTransferDetails.ifscCode,
            upiId: bankTransferDetails.upiId,
            transactionTime: new Date().toLocaleString("en-IN"),
          },
          companyBankDetails: {
            accountName: "Tejas Khope",
            accountNumber: "970318210000861",
            ifscCode: "BKID0009703",
            upiId: "khopetejas6-1@oksbi",
            bankName: "Bank of India",
            branch: "Mumbai Main Branch",
          },
          amount: total,
        };
      }

      const res = await axios.post(`${API_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      clearCart();
      navigate(
        `/order-success/${res.data._id || res.data.order?._id || res.data.orderId}`,
      );
    } catch (err) {
      console.error("Order failed:", err);
      alert(
        err.response?.data?.message ||
          "Failed to place order. Check console for details.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Bank details for display
  const bankDetails = {
    accountName: "Tejas Khope",
    accountNumber: "970318210000861",
    ifscCode: "BKID0009703",
    bankName: "Bank of India",
    branch: "Mumbai Main Branch",
    upiId: "khopetejas6-1@oksbi",
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-6"></div>
            <div className="space-y-4">
              <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse mb-6"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-12 bg-orange-200 rounded animate-pulse mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg border border-orange-200 p-12 max-w-md">
          <div className="text-8xl mb-6 text-gray-300">🛒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
          <Link
            to="/"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-sm hover:shadow-xl transform hover:scale-[1.02]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Cart
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Checkout</h1>
          <p className="text-gray-600 mt-2 text-lg">Complete your purchase in a few simple steps</p>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Forms Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Address Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                    <p className="text-gray-600 text-sm">Select where to deliver your order</p>
                  </div>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 bg-orange-50 rounded-xl border border-orange-200">
                    <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-6">No saved addresses found</p>
                    <Link
                      to="/profile?tab=addresses"
                      className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-sm"
                    >
                      Add New Address
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr._id}
                          onClick={() => setSelectedAddress(addr._id)}
                          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedAddress === addr._id
                              ? "border-orange-600 bg-orange-50/50 shadow-md"
                              : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{addr.fullName}</h3>
                              {addr.isDefault && (
                                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            {selectedAddress === addr._id && (
                              <CheckCircle className="w-6 h-6 text-orange-600" />
                            )}
                          </div>
                          <p className="text-gray-700 mt-2">
                            {addr.addressLine || addr.address}
                            <br />
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-gray-600 mt-2 text-sm">
                            <span className="font-medium">Phone:</span> {addr.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/profile?tab=addresses"
                      className="mt-6 inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    >
                      + Add New Address
                    </Link>
                  </>
                )}
              </div>

              {/* Payment Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <CreditCard className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                    <p className="text-gray-600 text-sm">Choose how you want to pay</p>
                  </div>
                </div>

                {/* COD Option */}
                <div
                  onClick={() => handlePaymentMethodChange("cod")}
                  className={`p-6 rounded-xl border-2 cursor-pointer mb-4 transition-all ${
                    paymentMethod === "cod"
                      ? "border-orange-600 bg-orange-50/50 shadow-md"
                      : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <Truck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Cash on Delivery</h3>
                        <p className="text-gray-600 text-sm">
                          Pay with cash when you receive your order
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "cod" && (
                      <CheckCircle className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                </div>

                {/* Bank Transfer Option */}
                <div
                  onClick={() => handlePaymentMethodChange("bank_transfer")}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "bank_transfer"
                      ? "border-orange-600 bg-orange-50/50 shadow-md"
                      : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Bank Transfer / UPI</h3>
                        <p className="text-gray-600 text-sm">
                          Direct bank transfer or UPI payment
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "bank_transfer" && (
                      <CheckCircle className="w-6 h-6 text-orange-600" />
                    )}
                  </div>

                  {paymentMethod === "bank_transfer" && (
                    <div className="mt-6 space-y-6 border-t pt-6">
                      {/* Company Bank Details */}
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-orange-600" />
                          Transfer to Company Account
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="bg-white p-3 rounded-lg border border-orange-100">
                            <span className="text-gray-600">Account Name:</span>
                            <span className="font-medium text-gray-900 block">{bankDetails.accountName}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-orange-100">
                            <span className="text-gray-600">Account No:</span>
                            <span className="font-medium text-gray-900 block">{bankDetails.accountNumber}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-orange-100">
                            <span className="text-gray-600">IFSC:</span>
                            <span className="font-medium text-gray-900 block">{bankDetails.ifscCode}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-orange-100">
                            <span className="text-gray-600">UPI ID:</span>
                            <span className="font-medium text-gray-900 block">{bankDetails.upiId}</span>
                          </div>
                        </div>
                        <p className="mt-4 bg-yellow-100 text-yellow-800 p-4 rounded-lg font-semibold border border-yellow-200">
                          Transfer exactly: <span className="text-xl">₹{total.toLocaleString()}</span>
                        </p>
                      </div>

                      {/* User Payment Details */}
                      <div>
                        <h4 className="font-bold text-gray-800 mb-4">Your Payment Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Transaction ID / UPI Reference *"
                            value={bankTransferDetails.transactionId}
                            onChange={(e) =>
                              setBankTransferDetails((prev) => ({
                                ...prev,
                                transactionId: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          />
                          <input
                            type="text"
                            placeholder="Your Bank Name *"
                            value={bankTransferDetails.bankName}
                            onChange={(e) =>
                              setBankTransferDetails((prev) => ({
                                ...prev,
                                bankName: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          />
                          <input
                            type="text"
                            placeholder="Your Account Name (Optional)"
                            value={bankTransferDetails.accountName}
                            onChange={(e) =>
                              setBankTransferDetails((prev) => ({
                                ...prev,
                                accountName: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          />
                          <input
                            type="text"
                            placeholder="Your Account Number (Optional)"
                            value={bankTransferDetails.accountNumber}
                            onChange={(e) =>
                              setBankTransferDetails((prev) => ({
                                ...prev,
                                accountNumber: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          />
                          <input
                            type="text"
                            placeholder="Your IFSC Code (Optional)"
                            value={bankTransferDetails.ifscCode}
                            onChange={(e) =>
                              setBankTransferDetails((prev) => ({
                                ...prev,
                                ifscCode: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          />
                          <input
                            type="text"
                            placeholder="Your UPI ID (Optional)"
                            value={bankTransferDetails.upiId}
                            onChange={(e) =>
                              setBankTransferDetails((prev) => ({
                                ...prev,
                                upiId: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          />
                        </div>
                      </div>

                      {/* File Upload */}
                      <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center bg-orange-50/30">
                        {bankTransferDetails.screenshot ? (
                          <div>
                            <img
                              src={bankTransferDetails.screenshot}
                              alt="Payment Proof"
                              className="mx-auto max-h-64 rounded-lg shadow-lg border-2 border-orange-200"
                            />
                            <button
                              onClick={() =>
                                setBankTransferDetails((prev) => ({
                                  ...prev,
                                  screenshot: null,
                                }))
                              }
                              className="mt-4 text-red-600 hover:text-red-700 font-medium transition-colors"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">
                              Upload payment screenshot (required)
                            </p>
                            <label className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-lg inline-block">
                              Choose File
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-3">
                              Max 5MB • Supported: PNG, JPG, JPEG
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Notes</h2>
                <p className="text-gray-600 text-sm mb-4">Optional - Add delivery instructions or special requests</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  placeholder="E.g., Call before delivery, Leave at gate, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition resize-none"
                />
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between pb-3 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shipping === 0 ? "Free" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium text-gray-900">₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-orange-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Delivery Estimate */}
                <div className="my-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center text-orange-700">
                    <Truck className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div>
                      <span className="font-semibold block">Estimated Delivery</span>
                      <span className="text-sm text-orange-600">3-7 business days</span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl py-5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Placing Order...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </button>

                {/* Secure Checkout Note */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center">
                    <Shield className="w-4 h-4 mr-1 text-orange-600" />
                    Secure SSL Encrypted Checkout
                  </p>
                </div>

                {/* Back to Cart Link */}
                <div className="text-center mt-6">
                  <Link to="/cart" className="text-gray-600 hover:text-orange-600 text-sm transition-colors">
                    ← Back to Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;