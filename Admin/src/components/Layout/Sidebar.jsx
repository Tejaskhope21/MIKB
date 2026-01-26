import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  HardHat,
  Tag,
  BarChart3
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      path: "/admin/dashboard" 
    },
    { 
      icon: Store, 
      label: "Sellers", 
      path: "/admin/sellers" 
    },
    { 
      icon: HardHat, 
      label: "Contractors", 
      path: "/admin/contractors" 
    },
    { 
      icon: CheckCircle, 
      label: "Verification", 
      path: "/admin/seller-verification" 
    },
    { 
      icon: TrendingUp, 
      label: "Analytics", 
      path: "/admin/seller-analytics" 
    },
    { 
      icon: Users, 
      label: "Users", 
      path: "/admin/users" 
    },
    { 
      icon: Tag, 
      label: "Category", 
      path: "/admin/category" 
    },
    { 
      icon: BarChart3, 
      label: "Reports", 
      path: "/admin/reports" 
    },
    { 
      icon: Settings, 
      label: "Settings", 
      path: "/admin/settings" 
    },
  ];

  const handleLogout = () => {
    // Remove all admin related tokens
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    
    navigate("/admin/login");
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6" />
            </div>
            <div className="ml-3">
              <span className="text-lg font-bold">Admin Panel</span>
              <p className="text-xs text-gray-400">BricksIT Management</p>
            </div>
          </div>
          <button
            className="lg:hidden hover:bg-gray-800 p-1 rounded"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="mt-8 px-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">
            Main Menu
          </p>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                  }`
                }
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
              >
                <div className={`p-2 rounded-lg mr-3 ${item.label === "Dashboard" ? "bg-blue-500/20" : "bg-gray-800/50"} group-hover:bg-blue-500/20`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{item.label}</span>
                {item.label === "Contractors" && (
                  <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                    New
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">
            v2.1.0 • Admin Panel
          </p>
        </div>
      </aside>

      {/* Mobile Hamburger Menu */}
      <button
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
};

export default Sidebar;