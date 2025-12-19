import React, { useState, useEffect } from "react";
import StatsCards from "../components/Dashboard/StatsCards";
import SalesChart from "../components/Dashboard/SalesChart";
import RecentActivities from "../components/Dashboard/RecentActivities";
import { api } from "../utils/api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalSellers: 0,
    pendingVerifications: 0,
    totalRevenue: 0,
    recentActivities: [],
    salesData: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const stats = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers.toLocaleString(),
      icon: "👥",
      change: "+12%",
      color: "blue",
    },
    {
      title: "Total Sellers",
      value: dashboardData.totalSellers.toLocaleString(),
      icon: "🏪",
      change: "+8%",
      color: "green",
    },
    {
      title: "Pending Verifications",
      value: dashboardData.pendingVerifications,
      icon: "⏳",
      change: "-3",
      color: "yellow",
    },
    {
      title: "Total Revenue",
      value: `₹${dashboardData.totalRevenue.toLocaleString()}`,
      icon: "💰",
      change: "+15%",
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales Overview</h2>
            <SalesChart data={dashboardData.salesData} />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-1">
          <RecentActivities activities={dashboardData.recentActivities} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium">Verify Sellers</div>
          </button>
          <button className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">View Reports</div>
          </button>
          <button className="p-4 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-medium">Manage Users</div>
          </button>
          <button className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-medium">Settings</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;