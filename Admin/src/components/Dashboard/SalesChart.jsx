import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Package,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Grid,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Target,
  Award,
  Star,
  Clock,
} from "lucide-react";


const SalesChart = () => {
  const [chartType, setChartType] = useState("line");
  const [timeRange, setTimeRange] = useState("monthly");
  const [showComparison, setShowComparison] = useState(true);
  const [showForecast, setShowForecast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    trends: true,
    categories: true,
    products: true,
    regions: false,
  });

  // Chart types
  const chartTypes = [
    { id: "line", label: "Line Chart", icon: LineChartIcon },
    { id: "bar", label: "Bar Chart", icon: BarChart3 },
    { id: "area", label: "Area Chart", icon: Area },
    { id: "pie", label: "Pie Chart", icon: PieChartIcon },
    { id: "composed", label: "Composed Chart", icon: Grid },
  ];

  // Time ranges
  const timeRanges = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "quarterly", label: "Quarterly" },
    { id: "yearly", label: "Yearly" },
  ];

  useEffect(() => {
    fetchSalesData();
  }, [timeRange]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with actual API call
      const data = {
        summary: {
          totalSales: 3250000,
          totalOrders: 4500,
          avgOrderValue: 722,
          conversionRate: 12.8,
          growthRate: 18.5,
          customerCount: 12500,
          repeatCustomers: 4200,
          avgCustomerValue: 2600,
        },
        monthlyData: [
          { month: "Jan", sales: 250000, orders: 350, profit: 65000, customers: 850 },
          { month: "Feb", sales: 280000, orders: 380, profit: 72000, customers: 920 },
          { month: "Mar", sales: 320000, orders: 420, profit: 82000, customers: 1050 },
          { month: "Apr", sales: 350000, orders: 460, profit: 90000, customers: 1150 },
          { month: "May", sales: 380000, orders: 500, profit: 98000, customers: 1250 },
          { month: "Jun", sales: 420000, orders: 550, profit: 108000, customers: 1350 },
          { month: "Jul", sales: 450000, orders: 580, profit: 115000, customers: 1450 },
          { month: "Aug", sales: 480000, orders: 620, profit: 122000, customers: 1550 },
          { month: "Sep", sales: 520000, orders: 670, profit: 132000, customers: 1650 },
          { month: "Oct", sales: 550000, orders: 710, profit: 140000, customers: 1750 },
          { month: "Nov", sales: 590000, orders: 760, profit: 150000, customers: 1850 },
          { month: "Dec", sales: 620000, orders: 800, profit: 158000, customers: 1950 },
        ],
        dailyData: [
          { day: "Mon", sales: 85000, orders: 120, avgOrder: 708 },
          { day: "Tue", sales: 92000, orders: 130, avgOrder: 708 },
          { day: "Wed", sales: 88000, orders: 125, avgOrder: 704 },
          { day: "Thu", sales: 95000, orders: 135, avgOrder: 704 },
          { day: "Fri", sales: 110000, orders: 155, avgOrder: 710 },
          { day: "Sat", sales: 105000, orders: 150, avgOrder: 700 },
          { day: "Sun", sales: 90000, orders: 130, avgOrder: 692 },
        ],
        categoryData: [
          { name: "Electronics", sales: 1250000, percentage: 38.5, growth: 22, profitMargin: 28 },
          { name: "Fashion", sales: 850000, percentage: 26.2, growth: 18, profitMargin: 32 },
          { name: "Home & Kitchen", sales: 650000, percentage: 20, growth: 15, profitMargin: 24 },
          { name: "Books", sales: 300000, percentage: 9.2, growth: 12, profitMargin: 35 },
          { name: "Others", sales: 200000, percentage: 6.2, growth: 8, profitMargin: 20 },
        ],
        topProducts: [
          { name: "Smartphone X", sales: 350000, units: 700, growth: 25, profit: 105000 },
          { name: "Laptop Pro", sales: 280000, units: 350, growth: 18, profit: 84000 },
          { name: "Wireless Earbuds", sales: 180000, units: 900, growth: 32, profit: 54000 },
          { name: "Smart Watch", sales: 150000, units: 375, growth: 28, profit: 45000 },
          { name: "Gaming Console", sales: 120000, units: 150, growth: 15, profit: 36000 },
        ],
        regionalData: [
          { region: "North", sales: 850000, orders: 1200, growth: 20, avgOrder: 708 },
          { region: "South", sales: 950000, orders: 1350, growth: 22, avgOrder: 704 },
          { region: "East", sales: 750000, orders: 1100, growth: 18, avgOrder: 682 },
          { region: "West", sales: 700000, orders: 1050, growth: 16, avgOrder: 667 },
        ],
        forecastData: [
          { month: "Jan", actual: 250000, forecast: 240000 },
          { month: "Feb", actual: 280000, forecast: 270000 },
          { month: "Mar", actual: 320000, forecast: 310000 },
          { month: "Apr", actual: 350000, forecast: 340000 },
          { month: "May", actual: 380000, forecast: 370000 },
          { month: "Jun", actual: 420000, forecast: 410000 },
          { month: "Jul", actual: 450000, forecast: 440000 },
          { month: "Aug", actual: 480000, forecast: 470000 },
          { month: "Sep", actual: 520000, forecast: 510000 },
          { month: "Oct", actual: 550000, forecast: 540000 },
          { month: "Nov", actual: 590000, forecast: 580000 },
          { month: "Dec", actual: 620000, forecast: 610000 },
          { month: "Jan '25", forecast: 650000 },
          { month: "Feb '25", forecast: 680000 },
          { month: "Mar '25", forecast: 720000 },
        ],
        comparisonData: {
          currentYear: 3250000,
          previousYear: 2740000,
          industryAverage: 2800000,
          target: 3500000,
        },
        performanceMetrics: {
          peakDay: "Friday",
          peakHour: "7 PM - 9 PM",
          bestCategory: "Electronics",
          bestProduct: "Smartphone X",
          conversionRate: 12.8,
          cartAbandonment: 28.5,
          avgSessionValue: 1250,
        },
      };
      setSalesData(data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
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
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  const renderChart = () => {
    if (!salesData) return null;

    const data = timeRange === "daily" ? salesData.dailyData : salesData.monthlyData;

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={timeRange === "daily" ? "day" : "month"} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "sales" || name === "profit") {
                    return [formatCurrency(value), name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
                name="Sales"
              />
              {showComparison && (
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Profit"
                />
              )}
              {showForecast && timeRange === "monthly" && (
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#ff7300"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  name="Forecast"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={timeRange === "daily" ? "day" : "month"} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "sales" || name === "profit") {
                    return [formatCurrency(value), name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" name="Sales" radius={[4, 4, 0, 0]} />
              {showComparison && (
                <Bar dataKey="orders" fill="#82ca9d" name="Orders" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={timeRange === "daily" ? "day" : "month"} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "sales" || name === "profit") {
                    return [formatCurrency(value), name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="sales"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                name="Sales"
              />
              {showComparison && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Profit"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={salesData.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${formatCurrency(entry.sales)}`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="sales"
              >
                {salesData.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value), "Sales"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "composed":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={timeRange === "daily" ? "day" : "month"} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "sales" || name === "profit") {
                    return [formatCurrency(value), name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="orders"
                fill="#8884d8"
                name="Orders"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sales"
                stroke="#ff7300"
                strokeWidth={2}
                name="Sales"
              />
              <Scatter
                yAxisId="right"
                dataKey="customers"
                fill="#82ca9d"
                name="Customers"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">Total Sales</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {formatCurrency(salesData.summary.totalSales)}
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">
                +{salesData.summary.growthRate}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last year</span>
            </div>
          </div>
          <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">Total Orders</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {salesData.summary.totalOrders}
            </p>
            <div className="flex items-center mt-2">
              <ShoppingBag className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">
                Avg: {formatCurrency(salesData.summary.avgOrderValue)}
              </span>
            </div>
          </div>
          <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-700">Customers</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {salesData.summary.customerCount.toLocaleString()}
            </p>
            <div className="flex items-center mt-2">
              <Users className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-purple-600">
                {salesData.summary.repeatCustomers.toLocaleString()} repeat
              </span>
            </div>
          </div>
          <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-700">Conversion Rate</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {salesData.summary.conversionRate}%
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-sm font-medium text-orange-600">
                +2.1% from last month
              </span>
            </div>
          </div>
          <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoryAnalysis = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Sales by Category</h3>
          <p className="text-sm text-gray-600">Performance across different product categories</p>
        </div>
        <PieChartIcon className="h-6 w-6 text-gray-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={salesData.categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="sales"
                label={(entry) => `${entry.name}: ${entry.percentage}%`}
              >
                {salesData.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value), "Sales"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          {salesData.categoryData.map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-gray-600">{category.percentage}% of total</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{formatCurrency(category.sales)}</div>
                <div className="flex items-center">
                  <div className="text-sm text-gray-600 mr-2">Growth:</div>
                  <div
                    className={`text-sm font-medium ${
                      category.growth > 15 ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    +{category.growth}%
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
          <p className="text-sm text-gray-600">Best sellers by revenue and growth</p>
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
                Sales Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Units Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Growth
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contribution
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salesData.topProducts.map((product, index) => {
              const contribution = (
                (product.sales / salesData.summary.totalSales) *
                100
              ).toFixed(1);
              const avgPrice = Math.round(product.sales / product.units);
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          Avg: {formatCurrency(avgPrice)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{formatCurrency(product.sales)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{product.units}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.growth > 20
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        +{product.growth}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-green-600">
                      {formatCurrency(product.profit)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${contribution}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">{contribution}%</span>
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

  const renderRegionalAnalysis = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Regional Performance</h3>
          <p className="text-sm text-gray-600">Sales distribution across regions</p>
        </div>
        <Target className="h-6 w-6 text-gray-500" />
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData.regionalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name === "sales" || name === "avgOrder") {
                  return [formatCurrency(value), name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" name="Sales" radius={[4, 4, 0, 0]} />
            <Bar dataKey="orders" fill="#82ca9d" name="Orders" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPerformanceMetrics = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Performance Metrics</h3>
          <p className="text-sm text-gray-600">Key performance indicators and insights</p>
        </div>
        <Award className="h-6 w-6 text-gray-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <div className="text-sm font-medium text-blue-700">Peak Sales Day</div>
          </div>
          <div className="mt-2 text-xl font-bold">{salesData.performanceMetrics.peakDay}</div>
          <div className="text-sm text-gray-600">Best performing day</div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-green-600 mr-2" />
            <div className="text-sm font-medium text-green-700">Best Category</div>
          </div>
          <div className="mt-2 text-xl font-bold">
            {salesData.performanceMetrics.bestCategory}
          </div>
          <div className="text-sm text-gray-600">Highest revenue generator</div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center">
            <ShoppingBag className="h-5 w-5 text-purple-600 mr-2" />
            <div className="text-sm font-medium text-purple-700">Avg Session Value</div>
          </div>
          <div className="mt-2 text-xl font-bold">
            {formatCurrency(salesData.performanceMetrics.avgSessionValue)}
          </div>
          <div className="text-sm text-gray-600">Per visitor value</div>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-orange-600 mr-2" />
            <div className="text-sm font-medium text-orange-700">Conversion Rate</div>
          </div>
          <div className="mt-2 text-xl font-bold">
            {salesData.performanceMetrics.conversionRate}%
          </div>
          <div className="text-sm text-gray-600">Visitor to customer</div>
        </div>
      </div>
    </div>
  );

  const renderComparisonMetrics = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Performance Comparison</h3>
          <p className="text-sm text-gray-600">Compare with previous year and targets</p>
        </div>
        <TrendingUp className="h-6 w-6 text-gray-500" />
      </div>
      <div className="space-y-4">
        {[
          {
            label: "Current Year Sales",
            value: salesData.comparisonData.currentYear,
            comparison: salesData.comparisonData.previousYear,
            target: salesData.comparisonData.target,
            type: "sales",
          },
          {
            label: "Growth Rate",
            value: salesData.summary.growthRate,
            comparison: 12.5, // Previous year growth
            target: 20,
            type: "percentage",
          },
          {
            label: "Industry Average",
            value: salesData.comparisonData.industryAverage,
            comparison: salesData.comparisonData.currentYear,
            target: null,
            type: "sales",
          },
        ].map((metric, index) => {
          const vsPrevious = ((metric.value - metric.comparison) / metric.comparison) * 100;
          const vsTarget = metric.target
            ? ((metric.value - metric.target) / metric.target) * 100
            : null;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{metric.label}</span>
                <div className="text-right">
                  <div className="font-bold">
                    {metric.type === "sales"
                      ? formatCurrency(metric.value)
                      : `${metric.value}%`}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">vs Previous</div>
                  <div
                    className={`text-sm font-medium ${
                      vsPrevious > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {vsPrevious > 0 ? "+" : ""}
                    {vsPrevious.toFixed(1)}%
                  </div>
                </div>
                {metric.target && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600">vs Target</div>
                    <div
                      className={`text-sm font-medium ${
                        vsTarget > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {vsTarget > 0 ? "+" : ""}
                      {vsTarget.toFixed(1)}%
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-sm text-gray-600">Status</div>
                  <div
                    className={`text-sm font-medium ${
                      vsPrevious > 0 && (!metric.target || vsTarget > 0)
                        ? "text-green-600"
                        : vsPrevious > 0 || (metric.target && vsTarget > 0)
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {vsPrevious > 0 && (!metric.target || vsTarget > 0)
                      ? "On Track"
                      : vsPrevious > 0 || (metric.target && vsTarget > 0)
                      ? "Moderate"
                      : "Needs Attention"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading || !salesData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Analytics</h1>
          <p className="text-gray-600">
            Comprehensive sales data visualization and analysis
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
          <button
            onClick={fetchSalesData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection("overview")}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-800">Sales Overview</h3>
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

      {/* Main Chart Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Sales Trend Analysis</h3>
            <p className="text-sm text-gray-600">
              Visualize sales performance over time
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {/* Chart Type Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {chartTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setChartType(type.id)}
                    className={`flex items-center px-3 py-1.5 rounded-md ${
                      chartType === type.id
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show Comparison Data</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showForecast}
              onChange={(e) => setShowForecast(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show Forecast</span>
          </label>
        </div>

        {/* Main Chart */}
        <div className="h-96">{renderChart()}</div>

        {/* Chart Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Current Period</div>
            <div className="font-bold">
              {timeRange === "daily" ? "This Week" : "This Month"}
            </div>
            <div className="text-2xl font-bold mt-1">
              {timeRange === "daily"
                ? formatCurrency(
                    salesData.dailyData.reduce((sum, day) => sum + day.sales, 0)
                  )
                : formatCurrency(
                    salesData.monthlyData[salesData.monthlyData.length - 1].sales
                  )}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Growth Rate</div>
            <div className="font-bold">Month-over-Month</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              +{salesData.summary.growthRate}%
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Best Day/Week</div>
            <div className="font-bold">
              {timeRange === "daily" ? "Friday" : "December"}
            </div>
            <div className="text-2xl font-bold mt-1">
              {timeRange === "daily"
                ? formatCurrency(110000)
                : formatCurrency(620000)}
            </div>
          </div>
        </div>
      </div>

      {/* Category Analysis Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <PieChartIcon className="h-5 w-5 text-purple-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-800">Category Analysis</h3>
          </div>
          {expandedSections.categories ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.categories && (
          <div className="px-6 pb-6">
            {renderCategoryAnalysis()}
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
            <Package className="h-5 w-5 text-orange-600 mr-3" />
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

      {/* Regional Analysis Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection("regions")}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <Target className="h-5 w-5 text-blue-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-800">Regional Analysis</h3>
          </div>
          {expandedSections.regions ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.regions && (
          <div className="px-6 pb-6 space-y-6">
            {renderRegionalAnalysis()}
            {renderPerformanceMetrics()}
            {renderComparisonMetrics()}
          </div>
        )}
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Key Insights</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                <span>
                  <strong>Electronics category</strong> leads with {salesData.categoryData[0].percentage}% contribution and {salesData.categoryData[0].growth}% growth
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                <span>
                  <strong>{salesData.performanceMetrics.peakDay}s</strong> show 25% higher sales than weekly average
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                <span>
                  <strong>Conversion rate</strong> improved by 2.1% this month, indicating effective marketing
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                <span>
                  <strong>Increase inventory</strong> in Electronics category during peak seasons
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                <span>
                  <strong>Promote underperforming categories</strong> (Books, Others) with targeted campaigns
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                <span>
                  <strong>Optimize pricing strategy</strong> for Fashion category to improve profit margin
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;