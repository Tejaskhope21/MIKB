import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Printer,
  MessageSquare,
  Download,
  Building,
  Globe,
  Phone as PhoneIcon,
  FileText,
  CreditCard,
  Shield,
  AlertCircle,
  Check,
  X,
  Banknote,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://bricks-backend-qyea.onrender.com/api";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const invoiceRef = useRef(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/orders/seller/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        alert("Order not found in your records");
        navigate("/seller/orders");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Failed to load order details");
        navigate("/seller/orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (verified) => {
    if (!verificationNotes.trim() && !verified) {
      alert("Please provide a reason for rejecting the payment");
      return;
    }

    try {
      setVerifying(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/orders/${orderId}/verify-payment`,
        { verified, notes: verificationNotes },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      fetchOrderDetails();
      alert(`Payment ${verified ? "verified" : "rejected"} successfully!`);
      setVerificationNotes("");
    } catch (error) {
      console.error("Payment verification failed:", error);
      alert(error.response?.data?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const updateOrderStatus = async (newStatus, extraData = {}) => {
    if (
      order.paymentMethod === "BANK_TRANSFER" &&
      newStatus !== "cancelled" &&
      !order.paymentProof?.verified
    ) {
      alert("Cannot process order. Payment verification pending.");
      return;
    }

    if (!window.confirm(`Mark order as ${newStatus.toUpperCase()}?`)) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus, ...extraData },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      fetchOrderDetails();
      alert("Order status updated!");
    } catch (error) {
      console.error("Update failed:", error);
      alert(error.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const handleShipped = () => {
    const tracking = prompt("Enter Tracking Number (e.g. DL123456789IN):");
    if (!tracking?.trim()) return;
    const carrier = prompt("Enter Courier (e.g. Delhivery, DTDC):");
    if (!carrier?.trim()) return;

    updateOrderStatus("shipped", {
      trackingNumber: tracking.trim(),
      carrier: carrier.trim(),
    });
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(
      `BricksIT_Invoice_${order.orderId || order._id.slice(-8).toUpperCase()}.pdf`,
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      payment_pending: "bg-orange-100 text-orange-800",
      paid: "bg-blue-100 text-blue-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const labels = {
      pending: "Pending",
      payment_pending: "Payment Pending",
      paid: "Paid / Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    return (
      <span
        className={`px-5 py-2 rounded-full text-sm font-bold ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentProof) => {
    if (!paymentProof) return null;

    if (paymentProof.verified) {
      return (
        <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold flex items-center gap-1">
          <Check className="w-4 h-4" /> Verified
        </span>
      );
    } else if (paymentProof.verified === false) {
      return (
        <span className="px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold flex items-center gap-1">
          <X className="w-4 h-4" /> Rejected
        </span>
      );
    } else {
      return (
        <span className="px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> Pending Verification
        </span>
      );
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDateShort = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getProductImage = (images) => {
    if (Array.isArray(images) && images.length > 0 && images[0]) {
      return images[0];
    }
    return "https://via.placeholder.com/300x300/f0f0f0/666666?text=No+Image";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#69431f] mx-auto"></div>
          <p className="mt-6 text-xl font-medium text-gray-700">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center bg-gray-50 min-h-screen">
        <Package className="w-32 h-32 text-gray-300 mx-auto mb-8" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Order Not Found
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          This order may have been removed or doesn't belong to you.
        </p>
        <button
          onClick={() => navigate("/seller/orders")}
          className="px-8 py-4 bg-[#69431f] text-white text-lg font-bold rounded-xl hover:bg-[#5a381a] transition"
        >
          ← Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <button
          onClick={() => navigate("/seller/orders")}
          className="flex items-center text-gray-600 hover:text-[#69431f] mb-6 font-medium text-lg"
        >
          <ArrowLeft className="w-6 h-6 mr-2" /> Back to Orders
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Order #{order.orderId || order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600 flex items-center gap-3 text-lg mb-4">
              <Calendar className="w-5 h-5" />
              {formatDate(order.createdAt)}
            </p>
            <div className="flex items-center gap-4">
              {getStatusBadge(order.status)}
              {order.paymentMethod === "BANK_TRANSFER" &&
                order.paymentProof && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    {getPaymentStatusBadge(order.paymentProof)}
                  </div>
                )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
            >
              <Printer className="w-6 h-6" /> Print Invoice
            </button>
            <button
              onClick={generatePDF}
              className="flex items-center gap-3 px-6 py-4 bg-[#69431f] text-white rounded-xl hover:bg-[#5a381a] font-medium transition"
            >
              <Download className="w-6 h-6" /> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Payment Proof Section (for Bank Transfer) */}
      {order.paymentMethod === "BANK_TRANSFER" && order.paymentProof && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-blue-600 mr-4" />
            <h2 className="text-2xl font-bold">Payment Proof & Details</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Transaction Details */}
            <div className="space-y-6">
              {/* Customer's Bank Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Customer's Bank Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Name:</span>
                    <span className="font-bold text-blue-700">
                      {order.paymentProof.userBankDetails?.bankName ||
                        "Not Provided"}
                    </span>
                  </div>
                  {order.paymentProof.userBankDetails?.accountName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-bold">
                        {order.paymentProof.userBankDetails.accountName}
                      </span>
                    </div>
                  )}
                  {order.paymentProof.userBankDetails?.accountNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-bold">
                        {order.paymentProof.userBankDetails.accountNumber}
                      </span>
                    </div>
                  )}
                  {order.paymentProof.userBankDetails?.ifscCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">IFSC Code:</span>
                      <span className="font-bold">
                        {order.paymentProof.userBankDetails.ifscCode}
                      </span>
                    </div>
                  )}
                  {order.paymentProof.userBankDetails?.upiId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">UPI ID:</span>
                      <span className="font-bold">
                        {order.paymentProof.userBankDetails.upiId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Time:</span>
                    <span className="font-bold">
                      {order.paymentProof.userBankDetails?.transactionTime ||
                        formatDate(order.paymentProof.uploadedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Transaction Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-bold text-green-700">
                      {order.paymentProof.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Transferred:</span>
                    <span className="font-bold text-green-700">
                      ₹
                      {order.paymentProof.amount?.toLocaleString("en-IN") ||
                        order.totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uploaded by Customer:</span>
                    <span className="font-bold">
                      {formatDate(order.paymentProof.uploadedAt)}
                    </span>
                  </div>
                  {order.paymentProof.verifiedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verified by You:</span>
                      <span className="font-bold">
                        {formatDate(order.paymentProof.verifiedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Bank Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Company Account (Where payment should come)
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-bold text-blue-700">
                      {order.paymentProof.companyBankDetails?.accountName ||
                        "Tejas Khope"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-bold text-blue-700">
                      {order.paymentProof.companyBankDetails?.accountNumber ||
                        "970318210000861"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IFSC Code:</span>
                    <span className="font-bold text-blue-700">
                      {order.paymentProof.companyBankDetails?.ifscCode ||
                        "BKID0009703"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">UPI ID:</span>
                    <span className="font-bold text-blue-700">
                      {order.paymentProof.companyBankDetails?.upiId ||
                        "khopetejas6-1@oksbi"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-bold text-blue-700">
                      {order.paymentProof.companyBankDetails?.bankName ||
                        "Bank of India"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Actions */}
              {!order.paymentProof.verified &&
                order.status === "payment_pending" && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-bold text-gray-800">Verify Payment</h4>
                    <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-yellow-700 font-medium">
                        <AlertCircle className="w-4 h-4 inline mr-2" />
                        Check if payment screenshot matches the details above
                        before verifying.
                      </p>
                    </div>
                    <textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="Add verification notes (required for rejection)..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={() => verifyPayment(true)}
                        disabled={verifying}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                      >
                        {verifying ? (
                          "Verifying..."
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            Verify Payment
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => verifyPayment(false)}
                        disabled={verifying || !verificationNotes.trim()}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                      >
                        {verifying ? (
                          "Processing..."
                        ) : (
                          <>
                            <X className="w-5 h-5" />
                            Reject Payment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              {/* Verification Status */}
              {order.paymentProof.verified !== undefined && (
                <div
                  className={`p-4 rounded-lg ${order.paymentProof.verified ? "bg-green-50" : "bg-red-50"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {order.paymentProof.verified ? (
                      <>
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-700">
                          Payment Verified
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-600" />
                        <span className="font-bold text-red-700">
                          Payment Rejected
                        </span>
                      </>
                    )}
                  </div>
                  {order.paymentProof.verificationNotes && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span>{" "}
                      {order.paymentProof.verificationNotes}
                    </p>
                  )}
                  {order.paymentProof.rejectionReason && (
                    <p className="text-sm text-red-600 mt-1">
                      <span className="font-medium">Reason:</span>{" "}
                      {order.paymentProof.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Screenshot */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Payment Screenshot (Uploaded by Customer)
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                <div className="relative">
                  <img
                    src={order.paymentProof.screenshot}
                    alt="Payment Proof Screenshot"
                    className="w-full h-auto rounded-lg shadow-lg max-h-96 object-contain mx-auto"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x500/e0e0e0/666666?text=Payment+Screenshot";
                      e.target.onerror = null;
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Customer Uploaded
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-700 mb-2">
                    Verification Checklist:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center mt-0.5">
                        {order.paymentProof.verified && (
                          <Check className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                      <span>
                        Amount matches: ₹
                        {order.totalPrice.toLocaleString("en-IN")}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center mt-0.5">
                        {order.paymentProof.verified && (
                          <Check className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                      <span>Transaction ID matches</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center mt-0.5">
                        {order.paymentProof.verified && (
                          <Check className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                      <span>Payment to correct account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center mt-0.5">
                        {order.paymentProof.verified && (
                          <Check className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                      <span>Screenshot is clear (not edited)</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Uploaded: {formatDate(order.paymentProof.uploadedAt)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Customer uploaded this screenshot as proof of payment
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      window.open(order.paymentProof.screenshot, "_blank")
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full Size
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Section */}
      <div
        className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        ref={invoiceRef}
      >
        {/* Invoice Header */}
        <div className="bg-[#69431f] text-white p-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-10 h-10" />
                <h1 className="text-4xl font-bold">BRICKSIT</h1>
              </div>
              <p className="text-lg opacity-90">
                Trusted Construction Material Marketplace
              </p>
              <div className="mt-6 space-y-2">
                <p className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Nagpur, Maharashtra
                </p>
                <p className="flex items-center gap-2">
                  <PhoneIcon className="w-5 h-5" />
                  info@bricksit.in | +91 9876543210
                </p>
                <p className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  GSTIN: 27ABCDE1234F1Z5
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold mb-2">TAX INVOICE</h2>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 inline-block">
                <p className="text-sm opacity-90">Invoice No.</p>
                <p className="text-2xl font-bold">
                  INV-{order.orderId || order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm mt-2 opacity-90">
                  Date: {formatDateShort(order.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order & Customer Info */}
        <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-8 border-b-2 border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-500 mb-3">
              BILL TO
            </h3>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                {order.user?.name || "Guest Customer"}
              </p>
              <p className="text-gray-700">{order.shippingAddress?.address}</p>
              <p className="text-gray-700">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                {order.shippingAddress?.pincode}
              </p>
              <p className="text-gray-700">
                Phone: {order.shippingAddress?.phone || "N/A"}
              </p>
              <p className="text-gray-700">
                Email: {order.user?.email || "N/A"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-500 mb-3">
              ORDER DETAILS
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Order ID:</span>{" "}
                {order.orderId || order._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Order Date:</span>{" "}
                {formatDateShort(order.createdAt)}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Status:</span>
                <span className="ml-2 px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                  {order.status.toUpperCase()}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Payment:</span>{" "}
                {order.paymentMethod?.toUpperCase()}
              </p>
              {order.paymentMethod === "BANK_TRANSFER" &&
                order.paymentProof && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Transaction ID:</span>{" "}
                    {order.paymentProof.transactionId}
                  </p>
                )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-500 mb-3">
              SELLER INFO
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700 font-bold">
                {order.items[0]?.seller?.businessName}
              </p>
              <p className="text-gray-700">
                Phone: {order.items[0]?.seller?.phone || "N/A"}
              </p>
              <p className="text-gray-700">
                Email: {order.items[0]?.seller?.email || "N/A"}
              </p>
              <p className="text-gray-700">
                Address: {order.items[0]?.seller?.address || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">ORDER ITEMS</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    #
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    ITEM DESCRIPTION
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    QUANTITY
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    UNIT PRICE
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6 text-gray-600">{index + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={getProductImage(item.product?.images)}
                          alt={item.product?.name}
                          className="w-16 h-16 rounded-lg object-cover border"
                          onError={(e) =>
                            (e.target.src =
                              "https://via.placeholder.com/64x64/f0f0f0/666666?text=No+Image")
                          }
                        />
                        <div>
                          <p className="font-bold text-gray-900">
                            {item.product?.name || "Unknown Product"}
                          </p>
                          {item.product?.brand && (
                            <p className="text-sm text-gray-600">
                              Brand: {item.product.brand}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{item.quantity}</td>
                    <td className="py-4 px-6 text-gray-700">
                      ₹{item.price.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-12 flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>
                    ₹
                    {order.sellerTotal?.toLocaleString("en-IN") ||
                      order.totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping:</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (GST 18%):</span>
                  <span>
                    ₹
                    {order.sellerGst?.toLocaleString("en-IN") ||
                      (order.totalPrice * 0.18).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>TOTAL AMOUNT</span>
                    <span className="text-[#69431f]">
                      ₹
                      {order.sellerGrandTotal?.toLocaleString("en-IN") ||
                        (order.totalPrice * 1.18).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="bg-[#69431f] text-white p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold mb-3">BRICKSIT CORPORATE</h4>
              <p className="text-sm opacity-90">Nagpur, Maharashtra</p>
              <p className="text-sm opacity-90">CIN: U74999MH2023PTC123456</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">CONTACT</h4>
              <p className="text-sm opacity-90">info@bricksit.in</p>
              <p className="text-sm opacity-90">+91 9876543210</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">BANK DETAILS</h4>
              <p className="text-sm opacity-90">Bank of India, Nagpur</p>
              <p className="text-sm opacity-90">A/C: 970318210000861</p>
              <p className="text-sm opacity-90">IFSC: BKID0009703</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-sm opacity-90">
              Thank you for your business! • This is a computer-generated
              invoice
            </p>
            <p className="text-xs mt-2 opacity-80">
              ©️ {new Date().getFullYear()} BricksIT. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Order Management</h2>
        <div className="flex flex-wrap gap-5">
          {/* Payment Verification Warning */}
          {order.paymentMethod === "BANK_TRANSFER" &&
            order.status === "payment_pending" &&
            order.paymentProof &&
            !order.paymentProof.verified && (
              <div className="w-full mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Payment Verification Required
                </h3>
                <p className="text-yellow-700">
                  Please verify the payment proof above before processing this
                  order.
                </p>
              </div>
            )}

          {/* Order status buttons */}
          {order.status === "pending" && order.paymentMethod === "COD" && (
            <button
              onClick={() => updateOrderStatus("paid")}
              disabled={updating}
              className="px-10 py-5 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition shadow-lg flex items-center gap-3"
            >
              <CheckCircle className="w-6 h-6" />
              Mark as Paid
            </button>
          )}

          {(order.status === "paid" ||
            (order.status === "payment_pending" &&
              order.paymentProof?.verified)) && (
            <button
              onClick={handleShipped}
              disabled={updating}
              className="px-10 py-5 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition shadow-lg flex items-center gap-3"
            >
              <Truck className="w-6 h-6" />
              Mark as Shipped
            </button>
          )}

          {order.status === "shipped" && (
            <button
              onClick={() => updateOrderStatus("delivered")}
              disabled={updating}
              className="px-10 py-5 bg-green-600 text-white text-lg font-bold rounded-xl hover:bg-green-700 disabled:opacity-60 transition shadow-lg flex items-center gap-3"
            >
              <CheckCircle className="w-6 h-6" />
              Mark as Delivered
            </button>
          )}

          {["pending", "payment_pending", "paid"].includes(order.status) && (
            <button
              onClick={() => updateOrderStatus("cancelled")}
              disabled={updating}
              className="px-10 py-5 bg-red-600 text-white text-lg font-bold rounded-xl hover:bg-red-700 disabled:opacity-60 transition shadow-lg flex items-center gap-3"
            >
              <X className="w-6 h-6" />
              Cancel Order
            </button>
          )}

          <button className="flex items-center gap-3 px-8 py-5 bg-[#69431f] text-white rounded-xl hover:bg-[#5a381a] font-medium transition">
            <MessageSquare className="w-6 h-6" /> Contact Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
