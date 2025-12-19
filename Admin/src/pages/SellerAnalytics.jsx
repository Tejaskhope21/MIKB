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
  AreaChart,
  Area,
} from "recharts";
import {
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  Star,
  Award,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api } from "../utils/api";

const SellerAnalytics = () => {
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("monthly");
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    revenue: true,
    products: true,
    customers: false,
    financials: false,
  });

  useEffect(() => {
    fetchSellers();
    if (selectedSeller) {
      fetchAnalyticsData();
    }
  }, [selectedSeller, timeRange]);

  const fetchSellers = async () => {
    try {
      const response = await api.get("/admin/sellers");
      setSellers(response.data);
      if (!selectedSeller && response.data.length > 0) {
        setSelectedSeller(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with actual API call
      const data = {
        overview: {
          totalRevenue: 1250000,
          totalProfit: 320000,
          totalExpenses: 930000,
          netProfitMargin: 25.6,
          totalOrders: 1245,
          activeCustomers: 456,
          avgOrderValue: 1024,
          customerRetentionRate: 78.5,
        },
        monthlyPerformance: [
          { month: "Jan", revenue: 100000, profit: 25000, orders: 100, customers: 85 },
          { month: "Feb", revenue: 120000, profit: 30000, orders: 120, customers: 95 },
          { month: "Mar", revenue: 150000, profit: 38000, orders: 150, customers: 110 },
          { month: "Apr", revenue: 180000, profit: 45000, orders: 180, customers: 125 },
          { month: "May", revenue: 200000, profit: 52000, orders: 200, customers: 135 },
          { month: "Jun", revenue: 220000, profit: 58000, orders: 220, customers: 150 },
          { month: "Jul", revenue: 240000, profit: 62000, orders: 240, customers: 165 },
          { month: "Aug", revenue: 250000, profit: 65000, orders: 250, customers: 175 },
        ],
        revenueBreakdown: [
          { category: "Electronics", revenue: 450000, percentage: 36, profitMargin: 28 },
          { category: "Fashion", revenue: 320000, percentage: 25.6, profitMargin: 32 },
          { category: "Home & Kitchen", revenue: 280000, percentage: 22.4, profitMargin: 24 },
          { category: "Books", revenue: 120000, percentage: 9.6, profitMargin: 35 },
          { category: "Others", revenue: 80000, percentage: 6.4, profitMargin: 20 },
        ],
        topProducts: [
          { name: "Smartphone X", revenue: 150000, profit: 45000, units: 170, rating: 4.8 },
          { name: "Laptop Pro", revenue: 120000, profit: 35000, units: 90, rating: 4.7 },
          { name: "Wireless Earbuds", revenue: 80000, profit: 25000, units: 325, rating: 4.6 },
          { name: "Smart Watch", revenue: 60000, profit: 18000, units: 145, rating: 4.5 },
          { name: "Gaming Console", revenue: 50000, profit: 15000, units: 65, rating: 4.9 },
        ],
        customerMetrics: {
          newCustomers: 45,
          returningCustomers: 123,
          churnRate: 12.3,
          customerLifetimeValue: 12500,
          avgPurchaseFrequency: 3.2,
        },
        financialHealth: {
          cashFlow: 45000,
          inventoryValue: 120000,
          outstandingPayments: 35000,
          creditScore: 750,
          debtToIncome: 0.32,
        },
        performanceComparison: {
          sellerAvg: {
            revenue: 850000,
            profit: 210000,
            orders: 850,
          },
          categoryAvg: {
            revenue: 1100000,
            profit: 280000,
            orders: 1100,
          },
        },
      };
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {formatCurrency(analyticsData.overview.totalRevenue)}
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">+15.2%</span>
              <span className="text-xs text-gray-500 ml-2">vs last period</span>
            </div>
          </div>
          <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Profit Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">Net Profit</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {formatCurrency(analyticsData.overview.totalProfit)}
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">
                {analyticsData.overview.netProfitMargin}% margin
              </span>
            </div>
          </div>
          <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Orders Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-700">Total Orders</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {analyticsData.overview.totalOrders}
            </p>
            <div className="flex items-center mt-2">
              <ShoppingBag className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-purple-600">
                Avg: {formatCurrency(analyticsData.overview.avgOrderValue)}
              </span>
            </div>
          </div>
          <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Customers Card */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-700">Active Customers</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {analyticsData.overview.activeCustomers}
            </p>
            <div className="flex items-center mt-2">
              <Users className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-sm font-medium text-orange-600">
                {analyticsData.overview.customerRetentionRate}% retention
              </span>
            </div>
          </div>
          <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderRevenueChart = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Revenue & Profit Trend</h3>
          <p className="text-sm text-gray-600">Monthly performance overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analyticsData.monthlyPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name === "revenue" || name === "profit") {
                  return [formatCurrency(value), name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stackId="2"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#ff7300"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <div className="text-sm text-gray-600">Best Month</div>
          <div className="font-bold">Aug</div>
          <div className="text-sm text-green-600">
            {formatCurrency(250000)} revenue
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Growth Rate</div>
          <div className="font-bold text-green-600">+15.2%</div>
          <div className="text-sm text-gray-600">vs previous</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Peak Orders</div>
          <div className="font-bold">250</div>
          <div className="text-sm text-gray-600">in August</div>
        </div>
      </div>
    </div>
  );

  const renderCategoryBreakdown = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Revenue by Category</h3>
          <p className="text-sm text-gray-600">Product category performance</p>
        </div>
        <PieChartIcon className="h-6 w-6 text-gray-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analyticsData.revenueBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.category}: ${entry.percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="revenue"
              >
                {analyticsData.revenueBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          {analyticsData.revenueBreakdown.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <div>
                  <div className="font-medium">{category.category}</div>
                  <div className="text-sm text-gray-600">{category.percentage}% of total</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{formatCurrency(category.revenue)}</div>
                <div className="flex items-center">
                  <div className="text-sm text-gray-600 mr-2">Margin:</div>
                  <div
                    className={`text-sm font-medium ${
                      category.profitMargin > 25 ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {category.profitMargin}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTopProducts = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Top Performing Products</h3>
          <p className="text-sm text-gray-600">Best sellers by revenue and profit</p>
        </div>
        <Package className="h-6 w-6 text-gray-500" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Units Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit Margin
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {analyticsData.topProducts.map((product, index) => {
              const profitMargin = ((product.profit / product.revenue) * 100).toFixed(1);
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: PROD-{1000 + index}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{formatCurrency(product.revenue)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-green-600">
                      {formatCurrency(product.profit)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{product.units}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium">{product.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profitMargin > 30
                            ? "bg-green-100 text-green-800"
                            : profitMargin > 20
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {profitMargin}%
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomerMetrics = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Customer Analytics</h3>
          <p className="text-sm text-gray-600">Customer behavior and retention</p>
        </div>
        <Users className="h-6 w-6 text-gray-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-700">New Customers</div>
          <div className="text-2xl font-bold mt-1">
            {analyticsData.customerMetrics.newCustomers}
          </div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-700">Returning Customers</div>
          <div className="text-2xl font-bold mt-1">
            {analyticsData.customerMetrics.returningCustomers}
          </div>
          <div className="text-xs text-gray-500 mt-1">Loyal customers</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-purple-700">Churn Rate</div>
          <div className="text-2xl font-bold mt-1">
            {analyticsData.customerMetrics.churnRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Customer loss</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-orange-700">Avg Purchase Frequency</div>
          <div className="text-2xl font-bold mt-1">
            {analyticsData.customerMetrics.avgPurchaseFrequency}
          </div>
          <div className="text-xs text-gray-500 mt-1">Purchases/customer</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-red-700">Customer Lifetime Value</div>
          <div className="text-2xl font-bold mt-1">
            {formatCurrency(analyticsData.customerMetrics.customerLifetimeValue)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total value per customer</div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analyticsData.monthlyPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="customers" fill="#8884d8" name="New Customers" />
            <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderFinancialHealth = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Financial Health</h3>
          <p className="text-sm text-gray-600">Business financial metrics</p>
        </div>
        <DollarSign className="h-6 w-6 text-gray-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-700">Positive Cash Flow</div>
              <div className="text-xl font-bold mt-1">
                {formatCurrency(analyticsData.financialHealth.cashFlow)}
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-700">Inventory Value</div>
              <div className="text-xl font-bold mt-1">
                {formatCurrency(analyticsData.financialHealth.inventoryValue)}
              </div>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-yellow-700">Outstanding Payments</div>
              <div className="text-xl font-bold mt-1">
                {formatCurrency(analyticsData.financialHealth.outstandingPayments)}
              </div>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-purple-700">Credit Score</div>
              <div className="text-xl font-bold mt-1">
                {analyticsData.financialHealth.creditScore}/850
              </div>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Debt to Income Ratio</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                analyticsData.financialHealth.debtToIncome < 0.35
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {analyticsData.financialHealth.debtToIncome}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{
                width: `${Math.min(100, (analyticsData.financialHealth.debtToIncome / 0.5) * 100)}%`,
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500">
            {analyticsData.financialHealth.debtToIncome < 0.35
              ? "Healthy debt ratio"
              : "Consider reducing debt"}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Profit to Expense Ratio</span>
            <span className="text-sm font-bold text-green-600">
              {((analyticsData.overview.totalProfit / analyticsData.overview.totalExpenses) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (analyticsData.overview.totalProfit / analyticsData.overview.totalExpenses) * 100
                )}%`,
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500">Higher ratio indicates better profitability</div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceComparison = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Performance Comparison</h3>
          <p className="text-sm text-gray-600">Vs. other sellers and category average</p>
        </div>
        <BarChart3 className="h-6 w-6 text-gray-500" />
      </div>
      <div className="space-y-6">
        {[
          {
            metric: "Revenue",
            current: analyticsData.overview.totalRevenue,
            sellerAvg: analyticsData.performanceComparison.sellerAvg.revenue,
            categoryAvg: analyticsData.performanceComparison.categoryAvg.revenue,
          },
          {
            metric: "Profit",
            current: analyticsData.overview.totalProfit,
            sellerAvg: analyticsData.performanceComparison.sellerAvg.profit,
            categoryAvg: analyticsData.performanceComparison.categoryAvg.profit,
          },
          {
            metric: "Orders",
            current: analyticsData.overview.totalOrders,
            sellerAvg: analyticsData.performanceComparison.sellerAvg.orders,
            categoryAvg: analyticsData.performanceComparison.categoryAvg.orders,
          },
        ].map((item, index) => {
          const vsSeller = ((item.current - item.sellerAvg) / item.sellerAvg) * 100;
          const vsCategory = ((item.current - item.categoryAvg) / item.categoryAvg) * 100;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{item.metric}</span>
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="font-bold">{formatCurrency(item.current)}</span>
                    <span className="text-gray-500 ml-2">Current</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Seller Average</div>
                  <div className="font-medium">{formatCurrency(item.sellerAvg)}</div>
                  <div
                    className={`text-xs font-medium ${
                      vsSeller > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {vsSeller > 0 ? "+" : ""}
                    {vsSeller.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Category Average</div>
                  <div className="font-medium">{formatCurrency(item.categoryAvg)}</div>
                  <div
                    className={`text-xs font-medium ${
                      vsCategory > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {vsCategory > 0 ? "+" : ""}
                    {vsCategory.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Performance</div>
                  <div
                    className={`font-medium ${
                      vsSeller > 0 && vsCategory > 0
                        ? "text-green-600"
                        : vsSeller > 0 || vsCategory > 0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {vsSeller > 0 && vsCategory > 0
                      ? "Excellent"
                      : vsSeller > 0 || vsCategory > 0
                      ? "Good"
                      : "Needs Improvement"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading seller analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Seller Analytics</h1>
          <p className="text-gray-600">Track performance, profits, and business insights</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Seller Selector */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-bold text-gray-800">Select Seller</h2>
            <p className="text-sm text-gray-600">Choose a seller to view detailed analytics</p>
          </div>
          <div className="relative">
            <select
              value={selectedSeller?.id || ""}
              onChange={(e) => {
                const seller = sellers.find((s) => s.id === e.target.value);
                setSelectedSeller(seller);
              }}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {seller.businessName} ({seller.name})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
        {selectedSeller && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Business</div>
              <div className="font-medium">{selectedSeller.businessName}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Owner</div>
              <div className="font-medium">{selectedSeller.name}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Join Date</div>
              <div className="font-medium">
                {new Date(selectedSeller.joinDate).toLocaleDateString()}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Status</div>
              <div className="font-medium">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedSeller.status === "verified"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedSeller.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-6">
        {/* Overview Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection("overview")}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Target className="h-5 w-5 text-blue-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Performance Overview</h3>
            </div>
            {expandedSections.overview ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {expandedSections.overview && (
            <div className="px-6 pb-6">
              {renderOverviewCards()}
            </div>
          )}
        </div>

        {/* Revenue Trends Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection("revenue")}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Revenue Trends & Analytics</h3>
            </div>
            {expandedSections.revenue ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {expandedSections.revenue && (
            <div className="px-6 pb-6 space-y-6">
              {renderRevenueChart()}
              {renderCategoryBreakdown()}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection("products")}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Package className="h-5 w-5 text-purple-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Product Performance</h3>
            </div>
            {expandedSections.products ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {expandedSections.products && (
            <div className="px-6 pb-6">
              {renderTopProducts()}
            </div>
          )}
        </div>

        {/* Customers Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection("customers")}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Users className="h-5 w-5 text-orange-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Customer Analytics</h3>
            </div>
            {expandedSections.customers ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {expandedSections.customers && (
            <div className="px-6 pb-6">
              {renderCustomerMetrics()}
            </div>
          )}
        </div>

        {/* Financials Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection("financials")}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Financial Health & Comparison</h3>
            </div>
            {expandedSections.financials ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {expandedSections.financials && (
            <div className="px-6 pb-6 space-y-6">
              {renderFinancialHealth()}
              {renderPerformanceComparison()}
            </div>
          )}
        </div>
      </div>

      {/* Summary & Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Strengths</h4>
            <ul className="space-y-1">
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>Above average profit margin ({analyticsData.overview.netProfitMargin}%)</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>Strong customer retention ({analyticsData.overview.customerRetentionRate}%)</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>Excellent electronics category performance</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
            <ul className="space-y-1">
              <li className="flex items-center">
                <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                <span>Expand inventory in high-margin fashion category</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                <span>Reduce outstanding payments to improve cash flow</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                <span>Consider promotional campaigns for underperforming categories</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;