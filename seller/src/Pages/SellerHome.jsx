import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import {
  FaBuilding,
  FaTruck,
  FaBox,
  FaRupeeSign,
  FaChartLine,
  FaBell,
  FaUserCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBullhorn,
  FaWarehouse,
  FaCubes,
  FaPercentage,
  FaShieldAlt,
  FaFileInvoice
} from 'react-icons/fa';

const SellerHome = () => {
  const [stats, setStats] = useState({
    dailyViews: 2450,
    orders: 24,
    revenue: 124567,
    pendingOrders: 8,
    growthRate: 18.5,
    totalProducts: 145,
    lowStockProducts: 7
  });

  const [businessMetrics, setBusinessMetrics] = useState({
    customerRating: 4.7,
    orderCompletion: 94,
    returnRate: 2.3,
    shippingTime: "1.8 days"
  });

  // Construction materials sales data
  const materialsData = [
    { day: 'Mon', cement: 45, steel: 38, bricks: 52, tools: 28 },
    { day: 'Tue', cement: 52, steel: 45, bricks: 61, tools: 32 },
    { day: 'Wed', cement: 48, steel: 42, bricks: 58, tools: 30 },
    { day: 'Thu', cement: 61, steel: 52, bricks: 72, tools: 38 },
    { day: 'Fri', cement: 55, steel: 48, bricks: 65, tools: 35 },
    { day: 'Sat', cement: 38, steel: 32, bricks: 45, tools: 25 },
    { day: 'Sun', cement: 32, steel: 28, bricks: 38, tools: 22 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 450000 },
    { month: 'Feb', revenue: 520000 },
    { month: 'Mar', revenue: 610000 },
    { month: 'Apr', revenue: 580000 },
    { month: 'May', revenue: 730000 },
    { month: 'Jun', revenue: 810000 },
    { month: 'Jul', revenue: 890000 },
    { month: 'Aug', revenue: 124567 }
  ];

  const categoryDistribution = [
    { name: 'Cement & Concrete', value: 32, color: '#f97316' },
    { name: 'Steel & Metals', value: 25, color: '#3b82f6' },
    { name: 'Bricks & Blocks', value: 18, color: '#ef4444' },
    { name: 'Tools & Equipment', value: 15, color: '#10b981' },
    { name: 'Electrical & Plumbing', value: 10, color: '#8b5cf6' }
  ];

  const COLORS = ['#f97316', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'];

  const todoItems = [
    {
      title: 'Pending Orders',
      count: stats.pendingOrders,
      icon: <FaBox className="text-blue-500" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Warehouse Updates',
      count: 3,
      icon: <FaWarehouse className="text-orange-500" />,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Low Stock Alert',
      count: stats.lowStockProducts,
      icon: <FaExclamationTriangle className="text-red-500" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    },
    {
      title: 'Payments Due',
      count: 2,
      icon: <FaRupeeSign className="text-green-500" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    }
  ];

  const announcements = [
    {
      title: 'Construction Season Offers',
      description: 'Boost your sales with special summer construction offers. Limited time discounts available!',
      icon: <FaBullhorn className="text-purple-500" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800'
    },
    {
      title: 'GST Compliance Update',
      description: 'New GST regulations for construction materials effective from Oct 1, 2024.',
      icon: <FaFileInvoice className="text-blue-500" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800'
    },
    {
      title: 'Quality Verification Complete',
      description: 'Your building materials have passed quality verification. ✅ Ready for nationwide shipping.',
      icon: <FaShieldAlt className="text-green-500" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-800'
    }
  ];

  const quickActions = [
    { label: 'Add Building Material', icon: '🏗️', path: '/seller/catalog' },
    { label: 'Update Stock Levels', icon: '📦', path: '/seller/inventory' },
    { label: 'View Contractor Orders', icon: '👷', path: '/seller/orders' },
    { label: 'Payment Dashboard', icon: '💰', path: '/seller/payments' },
    { label: 'Quality Reports', icon: '📊', path: '/seller/quality' },
    { label: 'Shipping Labels', icon: '🚚', path: '/seller/shipping' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FaBuilding className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Brick's Kart</h1>
                <p className="text-gray-600 text-sm">Building Materials Seller Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <FaBell className="w-6 h-6" />
                  <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center animate-pulse">
                    3
                  </span>
                </button>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                <FaUserCircle className="w-8 h-8 text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-800">Demo Construction</p>
                  <p className="text-xs text-gray-500">Verified Seller</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* GST Compliance Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-5 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <FaFileInvoice className="w-6 h-6" />
                <h3 className="text-xl font-bold">GST Compliance Update</h3>
              </div>
              <p className="text-blue-100">
                New HSN codes for construction materials effective from Oct 2024. Ensure your catalog is updated.
              </p>
              <p className="text-sm text-blue-200 mt-1">Updated pricing will help you stay competitive & increase visibility</p>
            </div>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors shadow-md">
              Update HSN Codes
            </button>
          </div>
        </div>

        {/* Material Quality Assurance Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-5 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <FaShieldAlt className="w-6 h-6" />
                <h3 className="text-xl font-bold">Quality Assurance Required</h3>
              </div>
              <p className="text-orange-100">
                Submit quality certificates for new construction material batches to unlock premium buyer tier.
              </p>
              <p className="text-sm text-orange-200 mt-1">Quality verified materials get 3x more visibility</p>
            </div>
            <button className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-semibold transition-colors shadow-md">
              Upload Certificates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaChartLine className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    ▲ {stats.growthRate}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.dailyViews.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Daily Views</div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaBox className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.orders}</div>
                <div className="text-sm text-gray-500">Orders Today</div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaRupeeSign className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{stats.revenue.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-gray-500">Today's Revenue</div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FaCubes className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                <div className="text-sm text-gray-500">Active Products</div>
              </div>
            </div>

            {/* To Do List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Action Required</h2>
                <span className="text-sm text-gray-500">Complete these tasks to optimize your business</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {todoItems.map((item, index) => (
                  <div
                    key={index}
                    className={`${item.bgColor} border ${item.borderColor} rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div className={`text-lg font-bold ${item.textColor}`}>
                        {item.count}
                      </div>
                    </div>
                    <div className={`font-medium ${item.textColor} mb-2`}>
                      {item.title}
                    </div>
                    <button className={`text-sm font-semibold ${item.textColor} hover:opacity-80`}>
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Material Sales Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Material Sales Performance</h2>
                <div className="flex gap-4">
                  <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Weekly</button>
                  <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Monthly</button>
                  <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Quarterly</button>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="cement" fill="#f97316" name="Cement" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="steel" fill="#3b82f6" name="Steel" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="bricks" fill="#ef4444" name="Bricks" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="tools" fill="#10b981" name="Tools" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Business Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Business Performance Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{businessMetrics.customerRating}</div>
                  <div className="text-sm text-gray-500">Customer Rating</div>
                  <div className="flex justify-center mt-1">
                    {'★'.repeat(4)}<span className="text-gray-300">★</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{businessMetrics.orderCompletion}%</div>
                  <div className="text-sm text-gray-500">Order Completion</div>
                  <div className="text-xs text-green-600 mt-1">+2% from last month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{businessMetrics.returnRate}%</div>
                  <div className="text-sm text-gray-500">Return Rate</div>
                  <div className="text-xs text-red-600 mt-1">Industry avg: 3.5%</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{businessMetrics.shippingTime}</div>
                  <div className="text-sm text-gray-500">Avg Shipping Time</div>
                  <div className="text-xs text-green-600 mt-1">Fast delivery</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Revenue Growth */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Growth</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" tickFormatter={(value) => `₹${value / 1000}k`} />
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f97316"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-bold text-gray-900">Total Revenue: ₹24.8L</div>
                <div className="text-sm text-green-600">▲ 18.5% growth this quarter</div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Material Category Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Share']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryDistribution.map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span className="text-sm text-gray-600">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <FaBullhorn className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Announcements & Updates</h2>
              </div>
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <div
                    key={index}
                    className={`${announcement.bgColor} p-4 rounded-lg border ${announcement.textColor.replace('800', '200')}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 flex items-center justify-center mt-1">
                        {announcement.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{announcement.title}</h3>
                        <p className="text-sm opacity-90">{announcement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <span className="text-2xl mb-2">{action.icon}</span>
                    <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <FaTruck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Logistics Support</h3>
                  <p className="text-gray-300 text-sm">Need help with heavy material shipping?</p>
                </div>
              </div>
              <button className="w-full mt-4 bg-white text-gray-900 hover:bg-gray-100 py-3 rounded-lg font-semibold transition-colors">
                Schedule Pickup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerHome;