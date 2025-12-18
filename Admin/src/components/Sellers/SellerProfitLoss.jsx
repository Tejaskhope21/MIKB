import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingBag } from "lucide-react";

const SellerProfitLoss = ({ sellerId }) => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [sellerId, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Simulated data - replace with actual API call
      const data = {
        overview: {
          totalRevenue: 1250000,
          totalProfit: 320000,
          totalLoss: 45000,
          totalOrders: 1245,
          activeCustomers: 456,
          conversionRate: 12.5,
        },
        monthlyData: [
          { month: "Jan", revenue: 100000, profit: 25000, loss: 5000, orders: 100 },
          { month: "Feb", revenue: 120000, profit: 30000, loss: 4000, orders: 120 },
          { month: "Mar", revenue: 150000, profit: 38000, loss: 6000, orders: 150 },
          { month: "Apr", revenue: 180000, profit: 45000, loss: 7000, orders: 180 },
          { month: "May", revenue: 200000, profit: 52000, loss: 8000, orders: 200 },
          { month: "Jun", revenue: 220000, profit: 58000, loss: 9000, orders: 220 },
          { month: "Jul", revenue: 240000, profit: 62000, loss: 10000, orders: 240 },
          { month: "Aug", revenue: 250000, profit: 65000, loss: 11000, orders: 250 },
        ],
        categoryBreakdown: [
          { name: "Electronics", value: 40, color: "#0088FE" },
          { name: "Fashion", value: 30, color: "#00C49F" },
          { name: "Home & Kitchen", value: 20, color: "#FFBB28" },
          { name: "Others", value: 10, color: "#FF8042" },
        ],
        topProducts: [
          { name: "Smartphone X", revenue: 150000, profit: 45000 },
          { name: "Laptop Pro", revenue: 120000, profit: 35000 },
          { name: "Wireless Earbuds", revenue: 80000, profit: 25000 },
          { name: "Smart Watch", revenue: 60000, profit: 18000 },
          { name: "Tablet", revenue: 50000, profit: 15000 },
        ],
      };
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalyticsData({
        overview: {},
        monthlyData: [],
        categoryBreakdown: [],
        topProducts: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!analyticsData) {
    return <div className="text-center py-8">No analytics data available</div>;
  }

  const { 
    overview = {}, 
    monthlyData = [], 
    categoryBreakdown = [], 
    topProducts = [] 
  } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <div className="bg-white rounded-lg shadow-sm p-1">
          {["daily", "weekly", "monthly", "yearly"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded capitalize ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">₹{(overview.totalRevenue || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+12.5%</span>
              </div>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold">₹{(overview.totalProfit || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+8.3%</span>
              </div>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Loss</p>
              <p className="text-2xl font-bold">₹{(overview.totalLoss || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2 text-red-600">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span className="text-sm">-4.2%</span>
              </div>
            </div>
            <TrendingDown className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{overview.totalOrders || 0}</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+15.2%</span>
              </div>
            </div>
            <ShoppingBag className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Chart */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue & Profit Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="loss" stroke="#ff6b6b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Top Products Table */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Profit Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orders
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.map((product, index) => {
                  const profitMargin = product.revenue > 0 
                    ? ((product.profit / product.revenue) * 100).toFixed(1)
                    : "0.0";
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{product.name || "Unknown Product"}</div>
                      </td>
                      <td className="px-6 py-4">₹{(product.revenue || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">₹{(product.profit || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {profitMargin}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.revenue > 0 ? Math.round(product.revenue / 1000) : 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Conversion Rate</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{overview.conversionRate || 0}%</div>
            <div className="text-sm text-gray-600 mt-2">Visitor to Customer Conversion</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Active Customers</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{overview.activeCustomers || 0}</div>
            <div className="text-sm text-gray-600 mt-2">Customers with recent purchases</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Average Order Value</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              ₹{overview.totalOrders > 0 
                ? Math.round((overview.totalRevenue || 0) / (overview.totalOrders || 1)).toLocaleString()
                : "0"}
            </div>
            <div className="text-sm text-gray-600 mt-2">Per transaction average</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfitLoss;