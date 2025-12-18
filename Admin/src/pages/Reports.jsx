import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Store,
  RefreshCw,
  Printer,
  FileText,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react";

const Reports = () => {
  const [activeReport, setActiveReport] = useState("sales");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  // Report types
  const reportTypes = [
    { id: "sales", name: "Sales Report", icon: DollarSign, color: "blue" },
    { id: "sellers", name: "Seller Performance", icon: Store, color: "green" },
    { id: "users", name: "User Analytics", icon: Users, color: "purple" },
    { id: "products", name: "Product Analysis", icon: Package, color: "orange" },
    { id: "financial", name: "Financial Summary", icon: TrendingUp, color: "red" },
  ];

  // Default empty data structure to prevent null errors
  const defaultReportData = {
    sales: {
      summary: {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        growthRate: 0,
      },
      dailyData: [],
      categoryData: [],
      topProducts: [],
    },
    sellers: {
      summary: {
        totalSellers: 0,
        activeSellers: 0,
        newSellers: 0,
        topSellerRevenue: 0,
      },
      performanceData: [],
      verificationStats: {
        verified: 0,
        pending: 0,
        rejected: 0,
      },
    },
    users: {
      summary: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        conversionRate: 0,
      },
      growthData: [],
      userTypes: [],
    },
  };

  // Initialize reportData with default data
  useEffect(() => {
    setReportData(defaultReportData.sales);
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [activeReport, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with actual API call
      const data = {
        sales: {
          summary: {
            totalSales: 1250000,
            totalOrders: 2450,
            averageOrderValue: 510,
            growthRate: 15.2,
          },
          dailyData: [
            { date: "2024-01-01", sales: 45000, orders: 85 },
            { date: "2024-01-02", sales: 52000, orders: 98 },
            { date: "2024-01-03", sales: 48000, orders: 92 },
            { date: "2024-01-04", sales: 61000, orders: 110 },
            { date: "2024-01-05", sales: 55000, orders: 105 },
            { date: "2024-01-06", sales: 49000, orders: 95 },
            { date: "2024-01-07", sales: 53000, orders: 100 },
          ],
          categoryData: [
            { category: "Electronics", sales: 450000, percentage: 36 },
            { category: "Fashion", sales: 320000, percentage: 25.6 },
            { category: "Home & Kitchen", sales: 280000, percentage: 22.4 },
            { category: "Books", sales: 120000, percentage: 9.6 },
            { category: "Others", sales: 80000, percentage: 6.4 },
          ],
          topProducts: [
            { name: "Smartphone X", sales: 85000, units: 170 },
            { name: "Laptop Pro", sales: 72000, units: 90 },
            { name: "Wireless Earbuds", sales: 65000, units: 325 },
            { name: "Smart Watch", sales: 58000, units: 145 },
            { name: "Gaming Console", sales: 52000, units: 65 },
          ],
        },
        sellers: {
          summary: {
            totalSellers: 156,
            activeSellers: 128,
            newSellers: 24,
            topSellerRevenue: 450000,
          },
          performanceData: [
            { name: "ElectroHub", revenue: 450000, orders: 450, rating: 4.8 },
            { name: "Fashionista", revenue: 380000, orders: 520, rating: 4.7 },
            { name: "Home Bliss", revenue: 320000, orders: 410, rating: 4.6 },
            { name: "Book World", revenue: 280000, orders: 650, rating: 4.9 },
            { name: "Tech Gear", revenue: 240000, orders: 300, rating: 4.5 },
          ],
          verificationStats: {
            verified: 128,
            pending: 18,
            rejected: 10,
          },
        },
        users: {
          summary: {
            totalUsers: 12500,
            activeUsers: 8500,
            newUsers: 450,
            conversionRate: 12.5,
          },
          growthData: [
            { month: "Jan", users: 9500, newSignups: 350 },
            { month: "Feb", users: 10000, newSignups: 380 },
            { month: "Mar", users: 10500, newSignups: 400 },
            { month: "Apr", users: 11000, newSignups: 420 },
            { month: "May", users: 11500, newSignups: 430 },
            { month: "Jun", users: 12000, newSignups: 440 },
            { month: "Jul", users: 12500, newSignups: 450 },
          ],
          userTypes: [
            { type: "Customers", count: 10500, percentage: 84 },
            { type: "Sellers", count: 156, percentage: 1.25 },
            { type: "Admins", count: 12, percentage: 0.1 },
            { type: "Inactive", count: 1832, percentage: 14.65 },
          ],
        },
      };

      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReportData(data[activeReport] || defaultReportData[activeReport]);
    } catch (error) {
      console.error("Error fetching report data:", error);
      // Fall back to default data on error
      setReportData(defaultReportData[activeReport] || defaultReportData.sales);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    alert(`Exporting ${activeReport} report as ${format.toUpperCase()}`);
    // Implement actual export logic here
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const renderSalesReport = () => {
    // Use reportData if available, otherwise use default
    const data = reportData || defaultReportData.sales;
    const categoryData = Array.isArray(data?.categoryData) ? data.categoryData : [];
    const topProducts = Array.isArray(data?.topProducts) ? data.topProducts : [];
    const dailyData = Array.isArray(data?.dailyData) ? data.dailyData : [];
    const summary = data?.summary || defaultReportData.sales.summary;
    
    return (
      <div className="space-y-6">
        {/* Sales Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</p>
                <div className="flex items-center mt-2 text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+{summary.growthRate}%</span>
                </div>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{summary.totalOrders}</p>
                <div className="flex items-center mt-2 text-blue-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+8.5%</span>
                </div>
              </div>
              <Package className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.averageOrderValue)}</p>
                <div className="flex items-center mt-2 text-purple-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+5.2%</span>
                </div>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold">{summary.growthRate}%</p>
                <div className="flex items-center mt-2 text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">YoY Growth</span>
                </div>
              </div>
              <BarChartIcon className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
            <div className="h-80">
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), "Sales"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#8884d8"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No sales data available
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
            <div className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.category}: ${entry.percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sales"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value), "Sales"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No category data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Sales Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Units Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Avg Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Contribution
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topProducts.map((product, index) => {
                      const avgPrice = Math.round(product.sales / product.units);
                      const contribution = summary.totalSales > 0 
                        ? ((product.sales / summary.totalSales) * 100).toFixed(1)
                        : 0;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium">{product.name}</div>
                          </td>
                          <td className="px-6 py-4">{formatCurrency(product.sales)}</td>
                          <td className="px-6 py-4">{product.units}</td>
                          <td className="px-6 py-4">{formatCurrency(avgPrice)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{ width: `${contribution}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm">{contribution}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No product data available
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSellersReport = () => {
    const data = reportData || defaultReportData.sellers;
    const performanceData = Array.isArray(data?.performanceData) ? data.performanceData : [];
    const verificationStats = data?.verificationStats || defaultReportData.sellers.verificationStats;
    const summary = data?.summary || defaultReportData.sellers.summary;
    
    return (
      <div className="space-y-6">
        {/* Seller Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sellers</p>
                <p className="text-2xl font-bold">{summary.totalSellers}</p>
                <div className="flex items-center mt-2 text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+{summary.newSellers} new</span>
                </div>
              </div>
              <Store className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sellers</p>
                <p className="text-2xl font-bold">{summary.activeSellers}</p>
                <div className="text-sm text-gray-600 mt-2">
                  {summary.totalSellers > 0 
                    ? ((summary.activeSellers / summary.totalSellers) * 100).toFixed(1) + "% active"
                    : "0% active"
                  }
                </div>
              </div>
              <Users className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Seller Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.topSellerRevenue)}
                </p>
                <div className="text-sm text-gray-600 mt-2">ElectroHub</div>
              </div>
              <DollarSign className="h-10 w-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verification Status</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-sm">Verified: {verificationStats.verified}</span>
                </div>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                  <span className="text-sm">Pending: {verificationStats.pending}</span>
                </div>
              </div>
              <FileText className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Seller Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Sellers Performance</h3>
          <div className="h-96">
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => {
                    if (name === "revenue") return [formatCurrency(value), "Revenue"];
                    if (name === "rating") return [value, "Rating"];
                    return [value, name];
                  }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar yAxisId="left" dataKey="orders" fill="#82ca9d" name="Orders" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rating"
                    stroke="#ff7300"
                    strokeWidth={2}
                    name="Rating"
                    dot={{ r: 4 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No seller performance data available
              </div>
            )}
          </div>
        </div>

        {/* Verification Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Verification Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Verified", value: verificationStats.verified, color: "#00C49F" },
                      { name: "Pending", value: verificationStats.pending, color: "#FFBB28" },
                      { name: "Rejected", value: verificationStats.rejected, color: "#FF8042" },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#00C49F" />
                    <Cell fill="#FFBB28" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            {performanceData.length > 0 ? (
              <div className="space-y-4">
                {performanceData.map((seller, index) => {
                  const revenuePerOrder = Math.round(seller.revenue / seller.orders);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{seller.name}</div>
                        <div className="text-sm text-gray-600">
                          {seller.orders} orders • {formatCurrency(revenuePerOrder)} avg
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(seller.revenue)}</div>
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(seller.rating) ? "text-yellow-400" : "text-gray-300"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-sm">{seller.rating}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No seller performance data available
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUsersReport = () => {
    const data = reportData || defaultReportData.users;
    const growthData = Array.isArray(data?.growthData) ? data.growthData : [];
    const userTypes = Array.isArray(data?.userTypes) ? data.userTypes : [];
    const summary = data?.summary || defaultReportData.users.summary;
    
    return (
      <div className="space-y-6">
        {/* User Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{summary.totalUsers?.toLocaleString() || "0"}</p>
                <div className="flex items-center mt-2 text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+{summary.newUsers || 0} new</span>
                </div>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{summary.activeUsers?.toLocaleString() || "0"}</p>
                <div className="text-sm text-gray-600 mt-2">
                  {summary.totalUsers > 0
                    ? ((summary.activeUsers / summary.totalUsers) * 100).toFixed(1) + "% active"
                    : "0% active"
                  }
                </div>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{summary.conversionRate || 0}%</p>
                <div className="flex items-center mt-2 text-blue-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+2.1%</span>
                </div>
              </div>
              <BarChartIcon className="h-10 w-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold">
                  {summary.totalUsers > 0
                    ? ((summary.newUsers / summary.totalUsers) * 100).toFixed(2) + "%"
                    : "0%"
                  }
                </p>
                <div className="text-sm text-gray-600 mt-2">Monthly Growth</div>
              </div>
              <PieChartIcon className="h-10 w-10 text-orange-500" />
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth Trend</h3>
          <div className="h-80">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Total Users"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newSignups"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="New Signups"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No user growth data available
              </div>
            )}
          </div>
        </div>

        {/* User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">User Type Distribution</h3>
            <div className="h-80">
              {userTypes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.type}: ${entry.percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      <Cell fill="#0088FE" />
                      <Cell fill="#00C49F" />
                      <Cell fill="#FFBB28" />
                      <Cell fill="#FF8042" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No user type data available
                </div>
              )}
            </div>
          </div>

          {/* User Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
            {userTypes.length > 0 ? (
              <div className="space-y-4">
                {userTypes.map((userType, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <div>
                        <div className="font-medium">{userType.type}</div>
                        <div className="text-sm text-gray-600">{userType.percentage}% of total</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{userType.count?.toLocaleString() || "0"}</div>
                      <div className="text-sm text-gray-600">users</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No user statistics available
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 mx-auto text-gray-400 animate-spin" />
          <p className="mt-2 text-gray-600">Loading report data...</p>
        </div>
      );
    }

    switch (activeReport) {
      case "sales":
        return renderSalesReport();
      case "sellers":
        return renderSellersReport();
      case "users":
        return renderUsersReport();
      default:
        return (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Select a Report</h3>
            <p className="text-gray-600 mt-2">Choose a report type from the options above</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and analyze platform reports</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    activeReport === report.id
                      ? `bg-${report.color}-600 text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {report.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="self-center">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchReportData}
                disabled={loading}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6">
          {renderReportContent()}
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Report Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-700">Generated On</div>
            <div className="mt-1">{new Date().toLocaleDateString("en-IN")}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-700">Time Period</div>
            <div className="mt-1">
              {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
              {new Date(dateRange.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm font-medium text-purple-700">Report Type</div>
            <div className="mt-1">
              {reportTypes.find((r) => r.id === activeReport)?.name || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;