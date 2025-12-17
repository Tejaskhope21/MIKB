// src/components/SidebarNavigation.js
import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { 
  RiArrowDropDownLine, 
  RiArrowDropUpLine, 
  RiSettingsLine, 
  RiLogoutBoxLine, 
  RiUserLine,
  RiHomeLine,
  RiBuildingLine,
  RiTruckLine,
  RiBarChartLine,
  RiShieldLine,
  RiMoneyDollarCircleLine,
  RiStoreLine,
  RiFileListLine,
  RiImageLine,
  RiBankCardLine,
  RiShoppingBagLine,
  RiMegaphoneLine,
  RiFireLine,
  RiDashboardLine,
  RiNotificationLine,
  RiCustomerServiceLine,
  RiCheckboxCircleLine,
  RiProductHuntLine,
  RiUploadCloudLine,
  RiFileEditLine
} from "react-icons/ri";

// Add this simple cn function
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Create a mock AuthContext
const AuthContext = React.createContext({
  auth: {
    token: "demo_token",
    seller: {
      businessName: "Demo Construction Materials",
      revenue: "1,24,567",
      orders: 24,
      sellerId: "BK-SELLER-12345"
    },
    loading: false
  },
  login: () => {},
  logout: () => {}
});

// Simple Button component
const Button = ({ children, className, onClick, variant = 'ghost' }) => {
  const baseClasses = "text-left transition-colors w-full";
  const variantClasses = {
    ghost: "text-gray-300 hover:text-white hover:bg-gray-800/50",
    default: "bg-gray-800 text-white hover:bg-gray-700"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const navigationItems = [
  // Home Dashboard - Available in your routes
  {
    name: "Home Dashboard",
    path: "/seller/home-dashboard",
    icon: <RiHomeLine className="w-5 h-5" />,
    category: "Dashboard",
    color: "text-orange-500"
  },
  
  // Catalog Management - Available with sub-items
  {
    name: "Catalog Management",
    path: "/seller/catalog",
    icon: <RiBuildingLine className="w-5 h-5" />,
    category: "Product Management",
    color: "text-indigo-500",
    subItems: [
      { name: "Add Single Product", path: "/seller/catalog" },
      { name: "My Products", path: "/seller/my-products" },
      { name: "Bulk Upload", path: "/seller/bulk-uplode" },
      { name: "Edit Product", path: "/seller/edit-product" },
    ],
  },
  
  // UNLOCKED ROUTES - Removed comingSoon flags
  {
    name: "Orders Management",
    path: "/seller/orders-dashboard",
    icon: <RiShoppingBagLine className="w-5 h-5" />,
    category: "Manage Business",
    color: "text-orange-500"
  },
  // {
  //   name: "Returns & RTO",
  //   path: "/seller/returns",
  //   icon: <RiCheckboxCircleLine className="w-5 h-5" />,
  //   category: "Manage Business",
  //   color: "text-red-500"
  // },
  // {
  //   name: "Pricing & Discounts",
  //   path: "/seller/pricing",
  //   icon: <RiMoneyDollarCircleLine className="w-5 h-5" />,
  //   category: "Manage Business",
  //   color: "text-green-500",
  //   subItems: [
  //     { name: "Manage Pricing", path: "/seller/pricing" },
  //     { name: "Discount Management", path: "/seller/discount" },
  //     { name: "RTO Settings", path: "/seller/rto-settings" },
  //   ],
  // },
  // {
  //   name: "Claims Management",
  //   path: "/seller/claims",
  //   icon: <RiFileListLine className="w-5 h-5" />,
  //   category: "Manage Business",
  //   color: "text-purple-500"
  // },
  {
    name: "Inventory Management",
    path: "/seller/inventory",
    icon: <RiStoreLine className="w-5 h-5" />,
    category: "Manage Business",
    color: "text-blue-500"
  },
  // {
  //   name: "Image Upload",
  //   path: "/seller/image-upload",
  //   icon: <RiImageLine className="w-5 h-5" />,
  //   category: "Manage Business",
  //   color: "text-pink-500"
  // },
  {
    name: "Payments & Settlements",
    path: "/seller/payment-dashboard",
    icon: <RiBankCardLine className="w-5 h-5" />,
    category: "Manage Business",
    color: "text-emerald-500"
  },
  // {
  //   name: "Quality Control",
  //   path: "/seller/product-quality",
  //   icon: <RiShieldLine className="w-5 h-5" />,
  //   category: "Manage Business",
  //   color: "text-cyan-500"
  // },
  // {
  //   name: "Warehouse Management",
  //   path: "/seller/WarehousePage",
  //   icon: <RiTruckLine className="w-5 h-5" />,
  //   category: "Manage Business",
  //   color: "text-amber-500"
  // },
  // {
  //   name: "Contractor Network",
  //   path: "/seller/influencerinfo",
  //   icon: <RiUserLine className="w-5 h-5" />,
  //   category: "Boost Sales",
  //   color: "text-teal-500"
  // },
  // {
  //   name: "Advertisement",
  //   path: "/seller/advertisement",
  //   icon: <RiMegaphoneLine className="w-5 h-5" />,
  //   category: "Boost Sales",
  //   color: "text-violet-500"
  // },
  // {
  //   name: "Promotions",
  //   path: "/seller/promotions",
  //   icon: <RiFireLine className="w-5 h-5" />,
  //   category: "Boost Sales",
  //   color: "text-rose-500"
  // },
  // {
  //   name: "Instant Cash Flow",
  //   path: "/seller/instant-cash",
  //   icon: <RiMoneyDollarCircleLine className="w-5 h-5" />,
  //   category: "Boost Sales",
  //   color: "text-lime-500"
  // },
  // {
  //   name: "Business Analytics",
  //   path: "/seller/dashboard",
  //   icon: <RiBarChartLine className="w-5 h-5" />,
  //   category: "Performance",
  //   color: "text-sky-500"
  // },
];

function CustomHomeIcon() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
          <RiHomeLine className="w-5 h-5 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-white text-sm font-bold">
          Seller Home
        </span>
        <span className="text-gray-400 text-xs">
          Dashboard Overview
        </span>
      </div>
    </div>
  );
}

function CustomIcon({ icon, color = "text-gray-400", active = false }) {
  return (
    <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-gray-800' : 'bg-gray-900'} ${color}`}>
      {icon}
    </div>
  );
}

export default function SidebarNavigation({ isOpen = false, onClose = () => {} }) {
  // Use the mock context
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActivePath = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const toggleDropdown = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/seller-login");
    setIsProfileDropdownOpen(false);
    onClose?.();
  };

  const handleSettings = () => {
    navigate("/seller/settings");
    setIsProfileDropdownOpen(false);
    onClose?.();
  };

  const handleProfile = () => {
    navigate("/seller/seller-me");
    setIsProfileDropdownOpen(false);
    onClose?.();
  };

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Function to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <div
      style={{ 
        fontFamily: "'Mier Book', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "linear-gradient(180deg, #1a1c1e 0%, #242729 100%)"
      }}
      className={cn(
        "fixed z-50 md:static top-0 left-0 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out border-r border-gray-800 shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0 md:block"
      )}
    >
      {/* Mobile header */}
      <div className="flex justify-between items-center px-5 py-4 md:hidden border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <RiBuildingLine className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-base">Brick's Kart</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white hover:bg-gray-800 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Logo and profile with dropdown */}
      <div 
        ref={profileRef}
        className="relative flex items-center gap-3 px-5 py-5 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors group"
        onClick={toggleProfileDropdown}
      >
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <RiBuildingLine className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex items-center justify-between flex-1 pr-3">
          <div className="flex flex-col">
            <span className="text-white text-base font-bold truncate max-w-[140px]">
              {auth.loading ? "Loading..." : auth.seller?.businessName || "Building Materials"}
            </span>
            <span className="text-gray-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Verified Seller
            </span>
          </div>
          {isProfileDropdownOpen ? (
            <RiArrowDropUpLine className="text-gray-400 group-hover:text-white w-6 h-6 transition-colors" />
          ) : (
            <RiArrowDropDownLine className="text-gray-400 group-hover:text-white w-6 h-6 transition-colors" />
          )}
        </div>

        {/* Profile Dropdown Menu */}
        {isProfileDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 mx-4 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-sm">
            <div 
              className="flex items-center gap-3 px-4 py-4 hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-800"
              onClick={handleProfile}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                <RiUserLine className="text-orange-400 w-5 h-5" />
              </div>
              <div>
                <div className="text-white text-sm font-bold">Seller Profile</div>
                <div className="text-gray-400 text-xs">View your profile</div>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-3 px-4 py-4 hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-800"
              onClick={handleSettings}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <RiSettingsLine className="text-blue-400 w-5 h-5" />
              </div>
              <div>
                <div className="text-white text-sm font-bold">Settings</div>
                <div className="text-gray-400 text-xs">Manage preferences</div>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-3 px-4 py-4 hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={handleLogout}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 flex items-center justify-center">
                <RiLogoutBoxLine className="text-red-400 w-5 h-5" />
              </div>
              <div>
                <div className="text-white text-sm font-bold">Logout</div>
                <div className="text-gray-400 text-xs">Sign out securely</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-5 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900/50 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300 text-sm font-semibold">Quick Stats</span>
          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Live</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
            <div className="text-white text-lg font-bold">₹{auth.seller?.revenue || "1,24,567"}</div>
            <div className="text-gray-400 text-xs">Today's Revenue</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
            <div className="text-white text-lg font-bold">{auth.seller?.orders || "24"}</div>
            <div className="text-gray-400 text-xs">Pending Orders</div>
          </div>
        </div>
      </div>

      {/* Notices / Support */}
      <div className="flex border-b border-gray-800">
        <div 
          className="flex-1 flex items-center gap-3 px-5 py-4 hover:bg-gray-800/50 cursor-pointer transition-colors border-r border-gray-800"
          onClick={() => handleNavigation("/seller/notices")}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/20 flex items-center justify-center">
              <RiNotificationLine className="text-red-400 w-5 h-5" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
              2
            </div>
          </div>
          <div>
            <div className="text-white text-sm font-semibold">Notices</div>
            <div className="text-gray-400 text-xs">Important updates</div>
          </div>
        </div>
        
        <div 
          className="flex-1 flex items-center gap-3 px-5 py-4 hover:bg-gray-800/50 cursor-pointer transition-colors"
          onClick={() => handleNavigation("/seller/support")}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center">
            <RiCustomerServiceLine className="text-blue-400 w-5 h-5" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">Support</div>
            <div className="text-gray-400 text-xs">Need help?</div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav
        className="flex-1 my-4 overflow-y-auto mb-4 mr-1 px-2"
        style={{ maxHeight: "calc(100vh - 320px)" }}
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left text-gray-300 hover:text-white hover:bg-gray-800/50 mx-2 mb-3 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-700",
            isActivePath("/seller/home-dashboard") && "bg-gray-800/50 text-white border-gray-700"
          )}
          onClick={() => handleNavigation("/seller/home-dashboard")}
        >
          <CustomHomeIcon />
        </Button>

        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-6">
            <div className="flex items-center justify-between px-4 mb-2">
              <p
                className="text-gray-400 text-xs font-semibold uppercase tracking-wider"
                style={{ letterSpacing: "0.05em" }}
              >
                {category}
              </p>
              <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
            </div>
            <div className="space-y-1">
              {items.map((item) => {
                const isActive = isActivePath(item.path);
                
                return item.subItems ? (
                  <div key={item.name}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left text-gray-300 hover:text-white hover:bg-gray-800/50 mx-2 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-700",
                        (isActive || expandedItems[item.name]) && "bg-gray-800/50 text-white border-gray-700"
                      )}
                      onClick={() => toggleDropdown(item.name)}
                    >
                      <div className="flex items-center w-full">
                        <CustomIcon 
                          icon={item.icon} 
                          color={item.color} 
                          active={isActive || expandedItems[item.name]} 
                        />
                        <span className="flex-1 text-sm font-medium ml-3">
                          {item.name}
                        </span>
                        {expandedItems[item.name] ? (
                          <RiArrowDropUpLine className="text-gray-400 w-5 h-5" />
                        ) : (
                          <RiArrowDropDownLine className="text-gray-400 w-5 h-5" />
                        )}
                      </div>
                    </Button>
                    {expandedItems[item.name] && (
                      <div className="ml-4 pl-10 pr-2 space-y-1 mt-1">
                        {item.subItems.map((subItem) => {
                          // For edit product route, we need to handle it specially since it has :id parameter
                          const subItemPath = subItem.path === "/seller/edit-product" 
                            ? "/seller/edit-product/1" // Default ID, you can adjust this
                            : subItem.path;
                          
                          return (
                            <Button
                              key={subItem.name}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors text-sm py-2",
                                isActivePath(subItem.path) && "text-white bg-gray-800/30"
                              )}
                              onClick={() => handleNavigation(subItemPath)}
                            >
                              <div className="flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-3"></div>
                                <span>
                                  {subItem.name}
                                </span>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left text-gray-300 hover:text-white hover:bg-gray-800/50 mx-2 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-700",
                      isActive && "bg-gray-800/50 text-white border-gray-700"
                    )}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <div className="flex items-center w-full">
                      <CustomIcon 
                        icon={item.icon} 
                        color={item.color} 
                        active={isActive} 
                      />
                      <span className="flex-1 text-sm font-medium ml-3">
                        {item.name}
                      </span>
                      {isActive && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer with business info */}
      <div className="border-t border-gray-800 px-5 py-4 bg-gradient-to-r from-gray-900/50 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-bold">
            {auth.loading ? "Loading..." : auth.seller?.businessName || "Building Materials"}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>
        <div className="text-gray-400 text-xs">
          Seller ID: {auth.seller?.sellerId || "BK-SELLER-12345"}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">Since 2023</div>
          <div className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">Verified</div>
          <div className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">All Features Active</div>
        </div>
      </div>
    </div>
  );
}