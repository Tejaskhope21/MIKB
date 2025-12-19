import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Store,
  DollarSign,
  Package,
  ShoppingBag,
  CreditCard,
  Activity,
  Target,
  Award,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const StatsCards = ({ stats, loading = false, columns = 4 }) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
        {[...Array(columns)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getIconComponent = (icon) => {
    const iconMap = {
      users: Users,
      store: Store,
      dollar: DollarSign,
      package: Package,
      shopping: ShoppingBag,
      credit: CreditCard,
      activity: Activity,
      target: Target,
      award: Award,
      clock: Clock,
      barchart: BarChart3,
      piechart: PieChart,
      linechart: LineChart,
      calendar: Calendar,
      check: CheckCircle,
      xcircle: XCircle,
      alert: AlertCircle,
      default: Activity,
    };

    return iconMap[icon] || iconMap.default;
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        darkText: "text-blue-900",
        iconBg: "bg-blue-500",
        icon: "text-white",
        trendUp: "text-blue-600",
        trendDown: "text-blue-400",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        darkText: "text-green-900",
        iconBg: "bg-green-500",
        icon: "text-white",
        trendUp: "text-green-600",
        trendDown: "text-green-400",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        darkText: "text-purple-900",
        iconBg: "bg-purple-500",
        icon: "text-white",
        trendUp: "text-purple-600",
        trendDown: "text-purple-400",
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        darkText: "text-orange-900",
        iconBg: "bg-orange-500",
        icon: "text-white",
        trendUp: "text-orange-600",
        trendDown: "text-orange-400",
      },
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        darkText: "text-red-900",
        iconBg: "bg-red-500",
        icon: "text-white",
        trendUp: "text-red-600",
        trendDown: "text-red-400",
      },
      yellow: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        darkText: "text-yellow-900",
        iconBg: "bg-yellow-500",
        icon: "text-white",
        trendUp: "text-yellow-600",
        trendDown: "text-yellow-400",
      },
      gray: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        darkText: "text-gray-900",
        iconBg: "bg-gray-500",
        icon: "text-white",
        trendUp: "text-gray-600",
        trendDown: "text-gray-400",
      },
    };

    return colorMap[color] || colorMap.blue;
  };

  const formatValue = (value, type = "default") => {
    if (type === "currency") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }

    if (type === "percentage") {
      return `${value}%`;
    }

    if (type === "number" && value > 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }

    return value.toString();
  };

  const renderTrendIndicator = (change) => {
    if (!change) return null;

    const isPositive = !change.startsWith("-");
    const value = change.replace("+", "").replace("-", "");

    return (
      <div
        className={`flex items-center text-sm font-medium ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <ArrowUpRight className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDownRight className="h-4 w-4 mr-1" />
        )}
        <span>{change}</span>
      </div>
    );
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
      {stats.map((stat, index) => {
        const colors = getColorClasses(stat.color || "blue");
        const IconComponent = getIconComponent(stat.icon || "activity");

        return (
          <div
            key={index}
            className={`${colors.bg} ${colors.border} rounded-xl border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${colors.text}`}>{stat.title}</p>
                <p className={`text-2xl font-bold mt-1 ${colors.darkText}`}>
                  {formatValue(stat.value, stat.type)}
                </p>
                <div className="mt-2 flex items-center space-x-3">
                  {stat.change && renderTrendIndicator(stat.change)}
                  {stat.description && (
                    <span className="text-xs text-gray-500">{stat.description}</span>
                  )}
                </div>
              </div>
              <div className={`h-12 w-12 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
                <IconComponent className={`h-6 w-6 ${colors.icon}`} />
              </div>
            </div>

            {/* Progress Bar (if provided) */}
            {stat.progress !== undefined && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{stat.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`${colors.iconBg} h-1.5 rounded-full`}
                    style={{ width: `${Math.min(100, stat.progress)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Comparison (if provided) */}
            {stat.comparison && (
              <div className="mt-3 text-xs text-gray-500">
                vs {stat.comparison.label}: {stat.comparison.value}
              </div>
            )}

            {/* Badge (if provided) */}
            {stat.badge && (
              <div className="mt-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    stat.badge.type === "success"
                      ? "bg-green-100 text-green-800"
                      : stat.badge.type === "warning"
                      ? "bg-yellow-100 text-yellow-800"
                      : stat.badge.type === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {stat.badge.icon === "check" && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {stat.badge.icon === "alert" && (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {stat.badge.icon === "x" && <XCircle className="h-3 w-3 mr-1" />}
                  {stat.badge.text}
                </span>
              </div>
            )}

            {/* Action (if provided) */}
            {stat.action && (
              <div className="mt-4">
                <button
                  onClick={stat.action.onClick}
                  className={`text-sm font-medium ${colors.text} hover:underline`}
                >
                  {stat.action.label} →
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Default props for different use cases
StatsCards.defaultProps = {
  stats: [
    {
      title: "Total Users",
      value: 12500,
      change: "+12%",
      icon: "users",
      color: "blue",
      type: "number",
      description: "vs last month",
    },
    {
      title: "Total Revenue",
      value: 3250000,
      change: "+18.5%",
      icon: "dollar",
      color: "green",
      type: "currency",
      description: "vs last month",
    },
    {
      title: "Total Orders",
      value: 4500,
      change: "+15%",
      icon: "shopping",
      color: "purple",
      type: "number",
      description: "vs last month",
    },
    {
      title: "Conversion Rate",
      value: 12.8,
      change: "+2.1%",
      icon: "target",
      color: "orange",
      type: "percentage",
      description: "vs last month",
    },
  ],
  columns: 4,
};

export default StatsCards;