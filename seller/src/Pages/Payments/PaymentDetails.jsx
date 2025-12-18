import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const navigate = useNavigate();

  // Sample completed orders data
  const completedOrders = [
    {
      orderId: "ORD12345",
      customer: "Rahul Sharma",
      product: "Men Polyester Regular Tshirt",
      quantity: 2,
      amount: 899,
      status: "Delivered",
      orderDate: "2024-12-10",
      paymentDate: "2024-12-16",
      paymentId: "SCBLNS2024121600304685",
      paymentMethod: "UPI",
    },
    {
      orderId: "ORD12346",
      customer: "Priya Patel",
      product: "Women Cotton Oversize Tshirt",
      quantity: 1,
      amount: 499,
      status: "Delivered",
      orderDate: "2024-12-11",
      paymentDate: "2024-12-16",
      paymentId: "SCBLNS2024121600304685",
      paymentMethod: "Credit Card",
    },
    {
      orderId: "ORD12347",
      customer: "Amit Kumar",
      product: "Men Sports Shorts",
      quantity: 3,
      amount: 1347,
      status: "Delivered",
      orderDate: "2024-12-09",
      paymentDate: "2024-12-16",
      paymentId: "SCBLNS2024121600304685",
      paymentMethod: "Net Banking",
    },
    {
      orderId: "ORD12348",
      customer: "Sneha Gupta",
      product: "Women Yoga Pants",
      quantity: 1,
      amount: 599,
      status: "Delivered",
      orderDate: "2024-12-12",
      paymentDate: "2024-12-16",
      paymentId: "SCBLNS2024121600304685",
      paymentMethod: "UPI",
    },
    {
      orderId: "ORD12349",
      customer: "Vikram Singh",
      product: "Kids Printed Tshirt",
      quantity: 2,
      amount: 798,
      status: "Delivered",
      orderDate: "2024-12-08",
      paymentDate: "2024-12-16",
      paymentId: "SCBLNS2024121600304685",
      paymentMethod: "Wallet",
    },
    {
      orderId: "ORD12350",
      customer: "Neha Desai",
      product: "Women Denim Jacket",
      quantity: 1,
      amount: 1299,
      status: "Delivered",
      orderDate: "2024-11-25",
      paymentDate: "2024-11-25",
      paymentId: "IN6ON24112505GST",
      paymentMethod: "Credit Card",
    },
    {
      orderId: "ORD12351",
      customer: "Rajesh Mehta",
      product: "Men Formal Shirt",
      quantity: 2,
      amount: 1598,
      status: "Delivered",
      orderDate: "2024-11-24",
      paymentDate: "2024-11-25",
      paymentId: "IN6ON24112505GST",
      paymentMethod: "Net Banking",
    },
    {
      orderId: "ORD12352",
      customer: "Anjali Joshi",
      product: "Women Summer Dress",
      quantity: 1,
      amount: 899,
      status: "Delivered",
      orderDate: "2024-11-23",
      paymentDate: "2024-11-25",
      paymentId: "IN6ON24112505GST",
      paymentMethod: "UPI",
    },
  ];

  // Filter orders based on search term
  const filteredOrders = completedOrders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort orders
  const sortedOrders = React.useMemo(() => {
    let sortableItems = [...filteredOrders];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredOrders, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? "↑" : "↓";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Payments
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Completed Payment Details
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          View all orders with completed payments
        </p>
      </header>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Order ID, Customer, Product or Payment ID"
                className="w-full px-4 py-2 border rounded-md pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-3 top-2.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 border rounded-md text-sm flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => requestSort("orderId")}
                >
                  Order ID {getSortIndicator("orderId")}
                </th>
                <th
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => requestSort("customer")}
                >
                  Customer {getSortIndicator("customer")}
                </th>
                <th
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => requestSort("product")}
                >
                  Product {getSortIndicator("product")}
                </th>
                <th
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => requestSort("quantity")}
                >
                  Qty {getSortIndicator("quantity")}
                </th>
                <th
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => requestSort("amount")}
                >
                  Amount {getSortIndicator("amount")}
                </th>
                <th
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => requestSort("orderDate")}
                >
                  Order Date {getSortIndicator("orderDate")}
                </th>
                <th
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => requestSort("paymentDate")}
                >
                  Payment Date {getSortIndicator("paymentDate")}
                </th>
                <th
                  className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => requestSort("paymentId")}
                >
                  Payment ID {getSortIndicator("paymentId")}
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Payment Method
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.length > 0 ? (
                sortedOrders.map((order, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3 text-sm font-medium text-blue-600">
                      {order.orderId}
                    </td>
                    <td className="p-3 text-sm">{order.customer}</td>
                    <td className="p-3 text-sm">{order.product}</td>
                    <td className="p-3 text-sm text-center">
                      {order.quantity}
                    </td>
                    <td className="p-3 text-sm">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="p-3 text-sm">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="p-3 text-sm">
                      {formatDate(order.paymentDate)}
                    </td>
                    <td className="p-3 text-sm">{order.paymentId}</td>
                    <td className="p-3 text-sm">{order.paymentMethod}</td>
                    <td className="p-3 text-sm">
                      <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-gray-500">
                    No orders found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t px-6 py-4 flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            Showing {sortedOrders.length} of {completedOrders.length} orders
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded text-sm">
              Previous
            </button>
            <button className="px-3 py-1 border rounded text-sm bg-blue-600 text-white">
              1
            </button>
            <button className="px-3 py-1 border rounded text-sm">2</button>
            <button className="px-3 py-1 border rounded text-sm">3</button>
            <span className="px-2">...</span>
            <button className="px-3 py-1 border rounded text-sm">10</button>
            <button className="px-3 py-1 border rounded text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
