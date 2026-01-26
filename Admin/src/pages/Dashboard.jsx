import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatsCards from "../components/Dashboard/StatsCards";
import SalesChart from "../components/Dashboard/SalesChart";
import RecentActivities from "../components/Dashboard/RecentActivities";
import { api } from "../utils/api";
import {
  Users,
  Store,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalContractors: 0,
    pendingVerifications: 0,
    pendingContractorVerifications: 0,
    totalRevenue: 0,
    recentActivities: [],
    salesData: [],
    stats: {}
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard data
      const response = await api.get("/admin/dashboard");
      setDashboardData(response.data);

      // Fetch contractors data
      const contractorsResponse = await api.get("/contractor");
      const contractors = contractorsResponse.data.data || [];
      
      // Calculate contractor stats
      const totalContractors = contractors.length;
      const pendingContractorVerifications = contractors.filter(c => 
        c.verificationStatus === 'pending'
      ).length;

      setDashboardData(prev => ({
        ...prev,
        totalContractors,
        pendingContractorVerifications,
        stats: {
          ...prev.stats,
          verifiedContractors: contractors.filter(c => c.verificationStatus === 'verified').length,
          rejectedContractors: contractors.filter(c => c.verificationStatus === 'rejected').length,
        }
      }));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      
      // Fallback data
      setDashboardData({
        totalUsers: 1254,
        totalSellers: 342,
        totalContractors: 89,
        pendingVerifications: 23,
        pendingContractorVerifications: 12,
        totalRevenue: 24567890,
        recentActivities: [
          { id: 1, type: 'new_user', message: 'New user registered', time: '5 minutes ago' },
          { id: 2, type: 'new_order', message: 'New order placed', time: '15 minutes ago' },
          { id: 3, type: 'seller_verified', message: 'Seller verified', time: '1 hour ago' },
          { id: 4, type: 'contractor_pending', message: 'Contractor verification pending', time: '2 hours ago' }
        ],
        salesData: [
          { month: 'Jan', sales: 40000 },
          { month: 'Feb', sales: 52000 },
          { month: 'Mar', sales: 48000 },
          { month: 'Apr', sales: 61000 },
          { month: 'May', sales: 58000 },
          { month: 'Jun', sales: 72000 }
        ],
        stats: {
          verifiedContractors: 45,
          rejectedContractors: 8
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers.toLocaleString(),
      icon: <Users className="w-8 h-8" />,
      change: "+12%",
      changeType: "increase",
      color: "blue",
      link: "/admin/users"
    },
    {
      title: "Total Sellers",
      value: dashboardData.totalSellers.toLocaleString(),
      icon: <Store className="w-8 h-8" />,
      change: "+8%",
      changeType: "increase",
      color: "green",
      link: "/admin/sellers"
    },
    {
      title: "Total Contractors",
      value: dashboardData.totalContractors.toLocaleString(),
      icon: <Users className="w-8 h-8" />,
      change: dashboardData.totalContractors > 0 ? "+5%" : "0%",
      changeType: dashboardData.totalContractors > 0 ? "increase" : "neutral",
      color: "indigo",
      link: "/admin/contractors"
    },
    {
      title: "Pending Verifications",
      value: dashboardData.pendingVerifications + dashboardData.pendingContractorVerifications,
      icon: <AlertCircle className="w-8 h-8" />,
      change: "-3",
      changeType: "decrease",
      color: "yellow",
      link: "/admin/seller-verification"
    },
    {
      title: "Total Revenue",
      value: `₹${dashboardData.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-8 h-8" />,
      change: "+15%",
      changeType: "increase",
      color: "purple"
    }
  ];

  const quickActions = [
    {
      title: "Verify Sellers",
      icon: "📋",
      color: "blue",
      link: "/admin/seller-verification",
      description: "Approve pending seller requests"
    },
    {
      title: "Manage Contractors",
      icon: "👷",
      color: "indigo",
      link: "/admin/contractors",
      description: "View and manage contractors"
    },
    {
      title: "View Reports",
      icon: "📊",
      color: "green",
      link: "/admin/reports",
      description: "Sales and analytics reports"
    },
    {
      title: "Settings",
      icon: "⚙️",
      color: "purple",
      link: "/admin/settings",
      description: "System configuration"
    }
  ];

  const verificationStats = [
    {
      title: "Pending Seller Verifications",
      value: dashboardData.pendingVerifications,
      icon: <Clock className="w-6 h-6" />,
      color: "yellow",
      link: "/admin/seller-verification"
    },
    {
      title: "Pending Contractor Verifications",
      value: dashboardData.pendingContractorVerifications,
      icon: <Clock className="w-6 h-6" />,
      color: "orange",
      link: "/admin/contractors?filter=pending"
    },
    {
      title: "Verified Contractors",
      value: dashboardData.stats?.verifiedContractors || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "green",
      link: "/admin/contractors?filter=verified"
    },
    {
      title: "Rejected Contractors",
      value: dashboardData.stats?.rejectedContractors || 0,
      icon: <XCircle className="w-6 h-6" />,
      color: "red",
      link: "/admin/contractors?filter=rejected"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                <div className={`text-${stat.color}-600`}>
                  {stat.icon}
                </div>
              </div>
              <div className={`flex items-center gap-1 ${stat.changeType === 'increase' ? 'text-green-600' : stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'}`}>
                {stat.changeType === 'increase' ? <TrendingUp className="w-4 h-4" /> : 
                 stat.changeType === 'decrease' ? <TrendingDown className="w-4 h-4" /> : null}
                <span className="font-medium">{stat.change}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-600 mt-1">{stat.title}</p>
            {stat.link && (
              <Link to={stat.link} className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-800">
                View details →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Verification Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Verification Overview</h2>
          <Link to="/admin/contractors" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            Manage all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {verificationStats.map((stat, index) => (
            <Link key={index} to={stat.link} className="block">
              <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <div className={`text-${stat.color}-600`}>
                      {stat.icon}
                    </div>
                  </div>
                  <span className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{stat.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sales Overview</h2>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Last 6 months</option>
                <option>Last year</option>
                <option>Custom range</option>
              </select>
            </div>
            <SalesChart data={dashboardData.salesData} />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
              <Link to="/admin/reports" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View all →
              </Link>
            </div>
            <RecentActivities activities={dashboardData.recentActivities} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} className="block">
              <div className={`p-6 bg-${action.color}-50 text-${action.color}-700 rounded-xl hover:bg-${action.color}-100 transition-colors border border-${action.color}-200`}>
                <div className="text-3xl mb-4">{action.icon}</div>
                <div className="font-bold text-lg mb-2">{action.title}</div>
                <p className="text-sm opacity-80">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">User Growth</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">+24%</div>
            <p className="text-sm text-gray-600">Compared to last month</p>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Active Sellers</h3>
              <Store className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{Math.round(dashboardData.totalSellers * 0.85)}</div>
            <p className="text-sm text-gray-600">Currently active</p>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Contractor Engagement</h3>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">92%</div>
            <p className="text-sm text-gray-600">Active portfolio updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;