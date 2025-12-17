// src/components/inventory/InventoryDashboard.jsx
import React, { useState } from "react";
import { FaBuilding, FaCubes, FaTruck, FaChartLine, FaSearch, FaFilter, FaEdit, FaTrash, FaBoxOpen, FaExclamationTriangle, FaPause, FaBan, FaCheckCircle, FaUpload, FaDownload } from "react-icons/fa";

// Material categories for construction materials
const CONSTRUCTION_CATEGORIES = [
  "All Materials",
  "Cement",
  "Steel",
  "Tiles",
  "Pipes",
  "Fittings",
  "Paint",
  "Putty",
  "Bricks",
  "Sand",
  "Aggregates",
  "Hardware",
  "Tools",
  "Electrical",
  "Plumbing"
];

// Sample products data
const SAMPLE_PRODUCTS = [
  {
    _id: "1",
    details: {
      productName: "Premium Cement Bag (OPC 53 Grade)",
      brand: "UltraTech",
      mrp: 350,
      sellingPrice: 320,
      stockQuantity: 500,
      unit: "bags",
      weight: "50kg",
      materialType: "Cement",
      grade: "53 Grade"
    },
    category: "Cement",
    subCategory: "OPC Cement",
    images: ["https://images.unsplash.com/photo-1592503254549-d83d24a4dfab?w=400&h=400&fit=crop"],
    status: "active",
    createdAt: "2025-09-01T10:30:00Z",
    warehouseLocation: "Warehouse A",
    minStockLevel: 50,
    reorderQuantity: 100
  },
  {
    _id: "2",
    details: {
      productName: "TMT Steel Rods (12mm Grade)",
      brand: "Jindal",
      mrp: 650,
      sellingPrice: 620,
      stockQuantity: 15,
      unit: "rods",
      length: "6m",
      materialType: "Steel",
      grade: "Fe 500"
    },
    category: "Steel",
    subCategory: "TMT Bars",
    images: ["https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop"],
    status: "lowStock",
    createdAt: "2025-09-05T14:20:00Z",
    warehouseLocation: "Warehouse B",
    minStockLevel: 20,
    reorderQuantity: 50
  },
  {
    _id: "3",
    details: {
      productName: "Ceramic Floor Tiles (Wooden Finish)",
      brand: "Kajaria",
      mrp: 85,
      sellingPrice: 75,
      stockQuantity: 0,
      unit: "pieces",
      size: "24x24 inch",
      materialType: "Tiles",
      finish: "Matt"
    },
    category: "Tiles",
    subCategory: "Floor Tiles",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop"],
    status: "outOfStock",
    createdAt: "2025-08-20T09:15:00Z",
    warehouseLocation: "Warehouse C",
    minStockLevel: 100,
    reorderQuantity: 200
  },
  {
    _id: "4",
    details: {
      productName: "PVC Plumbing Pipes (4 inch)",
      brand: "Finolex",
      mrp: 450,
      sellingPrice: 420,
      stockQuantity: 200,
      unit: "pipes",
      length: "3m",
      materialType: "Pipes",
      type: "PVC"
    },
    category: "Pipes",
    subCategory: "Plumbing Pipes",
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop"],
    status: "active",
    createdAt: "2025-09-10T11:45:00Z",
    warehouseLocation: "Warehouse A",
    minStockLevel: 50,
    reorderQuantity: 100
  },
  {
    _id: "5",
    details: {
      productName: "Asian Paints Weatherproof Exterior",
      brand: "Asian Paints",
      mrp: 2800,
      sellingPrice: 2650,
      stockQuantity: 45,
      unit: "liters",
      volume: "20L",
      materialType: "Paint",
      type: "Exterior"
    },
    category: "Paint",
    subCategory: "Exterior Paint",
    images: ["https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400&h=400&fit=crop"],
    status: "paused",
    createdAt: "2025-08-15T16:30:00Z",
    warehouseLocation: "Warehouse B",
    minStockLevel: 30,
    reorderQuantity: 60
  },
  {
    _id: "6",
    details: {
      productName: "Birla White Putty",
      brand: "Birla",
      mrp: 1200,
      sellingPrice: 1100,
      stockQuantity: 25,
      unit: "bags",
      weight: "40kg",
      materialType: "Putty",
      type: "Wall Putty"
    },
    category: "Putty",
    subCategory: "Wall Putty",
    images: ["https://images.unsplash.com/photo-1528323273322-d81458248d40?w=400&h=400&fit=crop"],
    status: "active",
    createdAt: "2025-09-12T13:20:00Z",
    warehouseLocation: "Warehouse C",
    minStockLevel: 20,
    reorderQuantity: 40
  },
  {
    _id: "7",
    details: {
      productName: "Clay Bricks (Red)",
      brand: "Local",
      mrp: 8,
      sellingPrice: 7,
      stockQuantity: 10000,
      unit: "pieces",
      size: "9x4x3 inch",
      materialType: "Bricks",
      type: "Clay"
    },
    category: "Bricks",
    subCategory: "Clay Bricks",
    images: ["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop"],
    status: "active",
    createdAt: "2025-09-03T08:45:00Z",
    warehouseLocation: "Warehouse D",
    minStockLevel: 5000,
    reorderQuantity: 10000
  },
  {
    _id: "8",
    details: {
      productName: "MS Angles (50x50x6mm)",
      brand: "Tata Steel",
      mrp: 750,
      sellingPrice: 720,
      stockQuantity: 85,
      unit: "pieces",
      length: "6m",
      materialType: "Steel",
      grade: "IS 2062"
    },
    category: "Steel",
    subCategory: "Structural Steel",
    images: ["https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop"],
    status: "active",
    createdAt: "2025-09-18T09:30:00Z",
    warehouseLocation: "Warehouse B",
    minStockLevel: 50,
    reorderQuantity: 100
  },
  {
    _id: "9",
    details: {
      productName: "Portland Pozzolana Cement",
      brand: "ACC",
      mrp: 340,
      sellingPrice: 310,
      stockQuantity: 320,
      unit: "bags",
      weight: "50kg",
      materialType: "Cement",
      grade: "PPC"
    },
    category: "Cement",
    subCategory: "PPC Cement",
    images: ["https://images.unsplash.com/photo-1592503254549-d83d24a4dfab?w=400&h=400&fit=crop"],
    status: "active",
    createdAt: "2025-09-15T14:15:00Z",
    warehouseLocation: "Warehouse A",
    minStockLevel: 100,
    reorderQuantity: 200
  },
  {
    _id: "10",
    details: {
      productName: "Concrete Blocks (Hollow)",
      brand: "NXTBlox",
      mrp: 45,
      sellingPrice: 42,
      stockQuantity: 5,
      unit: "pieces",
      size: "16x8x8 inch",
      materialType: "Blocks",
      type: "Hollow"
    },
    category: "Bricks",
    subCategory: "Concrete Blocks",
    images: ["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop"],
    status: "lowStock",
    createdAt: "2025-09-08T11:20:00Z",
    warehouseLocation: "Warehouse D",
    minStockLevel: 50,
    reorderQuantity: 100
  }
];

const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedCategory, setSelectedCategory] = useState("All Materials");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [inventoryData, setInventoryData] = useState({
    active: 7,
    activationPending: 0,
    blocked: 0,
    paused: 1,
    outOfStock: 1,
    lowStock: 2,
    totalValue: 0,
    totalQuantity: 0
  });

  // Calculate inventory statistics
  const calculateInventoryStats = () => {
    let active = 0;
    let activationPending = 0;
    let blocked = 0;
    let paused = 0;
    let outOfStock = 0;
    let lowStock = 0;
    let totalValue = 0;
    let totalQuantity = 0;

    products.forEach(product => {
      const quantity = product.details?.stockQuantity || 0;
      const price = product.details?.sellingPrice || 0;
      
      totalValue += quantity * price;
      totalQuantity += quantity;

      switch(product.status) {
        case 'active':
          active++;
          if (quantity === 0) outOfStock++;
          else if (quantity < (product.minStockLevel || 20)) lowStock++;
          break;
        case 'paused':
          paused++;
          break;
        case 'blocked':
          blocked++;
          break;
        case 'lowStock':
          lowStock++;
          active++;
          break;
        case 'outOfStock':
          outOfStock++;
          break;
        default:
          active++;
      }
    });

    return {
      active,
      activationPending,
      blocked,
      paused,
      outOfStock,
      lowStock,
      totalValue,
      totalQuantity
    };
  };

  // Update stats whenever products change
  React.useEffect(() => {
    const stats = calculateInventoryStats();
    setInventoryData(stats);
  }, [products]);

  // Client-side filtering
  const filteredProducts = products.filter((product) => {
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "active" && product.status === "active") ||
      (activeTab === "lowStock" && (product.status === "lowStock" || (product.details?.stockQuantity < (product.minStockLevel || 20) && product.details?.stockQuantity > 0))) ||
      (activeTab === "outOfStock" && (product.status === "outOfStock" || product.details?.stockQuantity === 0)) ||
      (activeTab === "paused" && product.status === "paused") ||
      (activeTab === "blocked" && product.status === "blocked");

    const matchesSearch =
      product.details?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.details?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.details?.materialType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === "All Materials" || 
      product.category === selectedCategory;

    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter((p) => p._id !== id);
      setProducts(updatedProducts);
    }
  };

  const handleEdit = (id) => {
    alert(`Edit product ${id} - This would open edit form in a real application`);
  };

  const handleBulkUpdate = () => {
    alert("Bulk stock update feature - This would open file upload dialog in a real application");
  };

  const handleDownloadTemplate = () => {
    alert("Downloading CSV template for bulk updates");
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color: "green",
        icon: <FaCheckCircle className="text-green-500" />,
        text: "Active",
        bgClass: "bg-green-100 text-green-800 border border-green-200"
      },
      lowStock: {
        color: "orange",
        icon: <FaExclamationTriangle className="text-orange-500" />,
        text: "Low Stock",
        bgClass: "bg-orange-100 text-orange-800 border border-orange-200"
      },
      outOfStock: {
        color: "red",
        icon: <FaBoxOpen className="text-red-500" />,
        text: "Out of Stock",
        bgClass: "bg-red-100 text-red-800 border border-red-200"
      },
      paused: {
        color: "yellow",
        icon: <FaPause className="text-yellow-500" />,
        text: "Paused",
        bgClass: "bg-yellow-100 text-yellow-800 border border-yellow-200"
      },
      blocked: {
        color: "gray",
        icon: <FaBan className="text-gray-500" />,
        text: "Blocked",
        bgClass: "bg-gray-100 text-gray-800 border border-gray-200"
      }
    };
    return configs[status] || configs.active;
  };

  const getMaterialTypeBadgeClass = (materialType) => {
    const classes = {
      'Cement': 'bg-gray-100 text-gray-800 border border-gray-200',
      'Steel': 'bg-red-100 text-red-800 border border-red-200',
      'Tiles': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Pipes': 'bg-green-100 text-green-800 border border-green-200',
      'Fittings': 'bg-purple-100 text-purple-800 border border-purple-200',
      'Paint': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'Putty': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'Bricks': 'bg-orange-100 text-orange-800 border border-orange-200',
      'Blocks': 'bg-amber-100 text-amber-800 border border-amber-200'
    };
    return classes[materialType] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const tabs = [
    { id: 'active', label: 'Active', count: inventoryData.active, color: 'green' },
    { id: 'lowStock', label: 'Low Stock', count: inventoryData.lowStock, color: 'orange' },
    { id: 'outOfStock', label: 'Out of Stock', count: inventoryData.outOfStock, color: 'red' },
    { id: 'paused', label: 'Paused', count: inventoryData.paused, color: 'yellow' },
    { id: 'blocked', label: 'Blocked', count: inventoryData.blocked, color: 'gray' },
    { id: 'all', label: 'All Products', count: products.length, color: 'blue' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
              <FaCubes className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Manage construction materials stock and availability</p>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryData.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Low Stock: {inventoryData.lowStock}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Out of Stock: {inventoryData.outOfStock}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(inventoryData.totalValue / 100000).toFixed(2)} Lakh
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-blue-600 text-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Total Quantity: {inventoryData.totalQuantity.toLocaleString()} units
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Product Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventoryData.paused + inventoryData.blocked}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FaPause className="text-yellow-600 text-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Paused: {inventoryData.paused}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                Blocked: {inventoryData.blocked}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Material Categories</p>
                <p className="text-2xl font-bold text-gray-900">{CONSTRUCTION_CATEGORIES.length - 1}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaBuilding className="text-purple-600 text-lg" />
              </div>
            </div>
            <div className="mt-3">
              <select
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 bg-white"
                onChange={(e) => setSelectedCategory(e.target.value)}
                value={selectedCategory}
              >
                {CONSTRUCTION_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto -mb-px" aria-label="Tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`
                    flex-shrink-0 px-5 py-4 font-medium text-sm md:text-base border-b-2 flex items-center transition-colors
                    ${activeTab === tab.id 
                      ? `border-${tab.color}-500 text-${tab.color}-600` 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className={`w-3 h-3 rounded-full mr-3 ${activeTab === tab.id ? `bg-${tab.color}-500` : 'bg-gray-300'}`}></div>
                  {tab.label}
                  <span className={`
                    ml-3 px-2.5 py-1 rounded-full text-xs font-semibold
                    ${activeTab === tab.id 
                      ? `bg-${tab.color}-100 text-${tab.color}-600` 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name, brand, or material type..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-gray-600 text-sm">
                <FaFilter className="mr-2" />
                <span>Filter:</span>
              </div>
              <div className="flex space-x-2">
                {["all", "published", "draft"].map((f) => (
                  <button
                    key={f}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === f 
                        ? "bg-orange-600 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category & Specifications
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Stock & Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaBoxOpen className="text-gray-400 text-2xl" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        {products.length === 0
                          ? "No construction materials in inventory"
                          : "No products match your search criteria"}
                      </h3>
                      <p className="text-gray-500">
                        {products.length === 0
                          ? "Add your first construction material to get started"
                          : "Try adjusting your search or filters"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const statusConfig = getStatusConfig(product.status);
                    return (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                              <img
                                src={product.images?.[0] || 'https://via.placeholder.com/400'}
                                alt={product.details?.productName || "Product"}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-semibold text-gray-900 line-clamp-2">
                                {product.details?.productName || "Unnamed Product"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {product.details?.brand || "No Brand"}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                SKU: BK-{product.category?.substring(0, 3).toUpperCase()}-{product._id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className={`text-xs px-3 py-1.5 rounded-full ${getMaterialTypeBadgeClass(product.details?.materialType)}`}>
                                {product.category}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>{product.subCategory}</div>
                              <div className="text-gray-500 text-xs mt-1">
                                {product.details?.weight && `Weight: ${product.details.weight}`}
                                {product.details?.size && ` | Size: ${product.details.size}`}
                                {product.details?.grade && ` | Grade: ${product.details.grade}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-gray-500">MRP: </span>
                              <span className="font-medium">₹{product.details?.mrp?.toLocaleString() || "N/A"}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Selling Price: </span>
                              <span className="font-semibold text-green-600">
                                ₹{product.details?.sellingPrice?.toLocaleString() || "N/A"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.details?.unit && `Per ${product.details.unit}`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className={`text-sm font-medium px-3 py-1.5 rounded-full ${
                                (product.details?.stockQuantity || 0) > (product.minStockLevel || 20)
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : (product.details?.stockQuantity || 0) > 0
                                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}>
                                {(product.details?.stockQuantity || 0).toLocaleString()} in stock
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              <div>Min Stock: {(product.minStockLevel || 20).toLocaleString()}</div>
                              <div>Reorder Qty: {(product.reorderQuantity || 50).toLocaleString()}</div>
                              {product.warehouseLocation && (
                                <div className="mt-1">
                                  <FaTruck className="inline mr-1 text-gray-400" />
                                  {product.warehouseLocation}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {statusConfig.icon}
                            <span className={`text-xs px-3 py-1.5 rounded-full ${statusConfig.bgClass}`}>
                              {statusConfig.text}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {product.createdAt
                              ? new Date(product.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            <button 
                              onClick={() => handleEdit(product._id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            >
                              <FaEdit className="mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            >
                              <FaTrash className="mr-2" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                  Showing <span className="font-semibold">{filteredProducts.length}</span> of{" "}
                  <span className="font-semibold">{products.length}</span> construction materials
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Total Value:</span> ₹{(filteredProducts.reduce((sum, p) => sum + ((p.details?.stockQuantity || 0) * (p.details?.sellingPrice || 0)), 0) / 100000).toFixed(2)} Lakh
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Operations Section */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="mb-4 lg:mb-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Bulk Inventory Operations</h3>
              <p className="text-gray-600">
                Update stock levels, prices, or status for multiple construction materials at once
              </p>
              <div className="flex items-center mt-3 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Supports Excel/CSV upload
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleBulkUpdate}
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <FaUpload className="mr-2" />
                Bulk Stock Update
              </button>
              <button 
                onClick={handleDownloadTemplate}
                className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-5 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <FaDownload className="mr-2" />
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Stock Distribution</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Cement</span>
                    <span className="font-medium">{Math.round((inventoryData.totalValue * 0.35) / 100000)} Lakh</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-600 rounded-full h-2" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Steel</span>
                    <span className="font-medium">{Math.round((inventoryData.totalValue * 0.25) / 100000)} Lakh</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 rounded-full h-2" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Turnover Rate</h4>
              <div className="text-2xl font-bold text-gray-900">2.3x</div>
              <p className="text-sm text-gray-600 mt-1">Monthly inventory turnover</p>
              <div className="mt-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Cement: 1.8x
                </div>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Steel: 2.5x
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Reorder Alerts</h4>
              <div className="text-2xl font-bold text-red-600">{inventoryData.lowStock + inventoryData.outOfStock}</div>
              <p className="text-sm text-gray-600 mt-1">Products need attention</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span>Low Stock: {inventoryData.lowStock}</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span>Out of Stock: {inventoryData.outOfStock}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm">
                Add New Product
              </button>
              <button className="w-full bg-white hover:bg-blue-50 text-blue-600 border border-blue-300 py-2 rounded-lg text-sm">
                Generate Stock Report
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Stock Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Healthy Stock</span>
                <span className="font-medium text-green-600">{inventoryData.active - inventoryData.lowStock - inventoryData.outOfStock}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 rounded-full h-2" style={{ 
                  width: `${((inventoryData.active - inventoryData.lowStock - inventoryData.outOfStock) / products.length * 100)}%` 
                }}></div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Need Attention</h4>
            <div className="text-lg font-bold text-orange-600 mb-2">{inventoryData.lowStock + inventoryData.outOfStock} Products</div>
            <p className="text-sm text-gray-600">Require immediate review or restocking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;