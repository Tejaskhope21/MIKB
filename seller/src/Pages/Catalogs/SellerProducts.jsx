// src/Pages/Seller/SellerProducts.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaChartLine,
  FaBox,
  FaRupeeSign,
  FaShoppingCart,
  FaFilter,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle
} from "react-icons/fa";

const SellerProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchSellerInfo();
  }, []);

  const fetchSellerInfo = () => {
    const sellerSession = localStorage.getItem("sellerSession");
    if (sellerSession) {
      try {
        const parsedSession = JSON.parse(sellerSession);
        setSellerInfo(parsedSession.seller);
      } catch (error) {
        console.error("Error parsing seller session:", error);
      }
    }
  };

  const fetchProducts = () => {
    setLoading(true);
    try {
      const storedProducts = JSON.parse(localStorage.getItem("sellerProducts") || "[]");
      setProducts(storedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter(product => product.id !== productId);
      localStorage.setItem("sellerProducts", JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      toast.success("Product deleted successfully");
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products to delete");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      const updatedProducts = products.filter(product => !selectedProducts.includes(product.id));
      localStorage.setItem("sellerProducts", JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} product(s) deleted successfully`);
    }
  };

  const handleStatusChange = (productId, newStatus) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    });
    
    localStorage.setItem("sellerProducts", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    toast.success(`Product ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
  };

  const handleStockUpdate = (productId, newStock) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          details: {
            ...product.details,
            stockQuantity: newStock
          },
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    });
    
    localStorage.setItem("sellerProducts", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    toast.success("Stock updated successfully");
  };

  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id));
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      if (filter === "all") return true;
      if (filter === "active") return product.status === "active";
      if (filter === "inactive") return product.status === "inactive";
      if (filter === "lowstock") return parseInt(product.details.stockQuantity) < 10;
      return true;
    })
    .filter(product => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        product.details.productName.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.details.brand.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "priceHigh":
          return parseFloat(b.details.sellingPrice) - parseFloat(a.details.sellingPrice);
        case "priceLow":
          return parseFloat(a.details.sellingPrice) - parseFloat(b.details.sellingPrice);
        case "stockHigh":
          return parseInt(b.details.stockQuantity) - parseInt(a.details.stockQuantity);
        case "stockLow":
          return parseInt(a.details.stockQuantity) - parseInt(b.details.stockQuantity);
        default:
          return 0;
      }
    });

  // Calculate statistics
  const stats = {
    total: products.length,
    active: products.filter(p => p.status === "active").length,
    inactive: products.filter(p => p.status === "inactive").length,
    lowStock: products.filter(p => parseInt(p.details.stockQuantity) < 10).length,
    totalValue: products.reduce((sum, p) => sum + (parseFloat(p.details.sellingPrice) * parseInt(p.details.stockQuantity)), 0),
    totalSold: products.reduce((sum, p) => sum + (p.details.soldCount || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FB8B24]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
              <p className="text-gray-600">Manage your construction materials inventory</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/seller/add-single-catalog"
                className="inline-flex items-center gap-2 bg-[#FB8B24] hover:bg-[#E36414] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <FaPlus /> Add New Product
              </Link>
              <Link
                to="/seller/home-dashboard"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <FaChartLine /> Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaBox className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Products</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FaExclamationCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaRupeeSign className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Bulk Actions */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                onChange={selectAllProducts}
                className="h-4 w-4 text-[#FB8B24] focus:ring-[#FB8B24] border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">
                {selectedProducts.length} selected
              </span>
              {selectedProducts.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium"
                >
                  <FaTrash /> Delete Selected
                </button>
              )}
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24]"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="stockHigh">Stock: High to Low</option>
                <option value="stockLow">Stock: Low to High</option>
              </select>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24]"
              >
                <option value="all">All Products</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="lowstock">Low Stock (&lt; 10)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <FaBox className="text-gray-300 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Start by adding your first construction material product</p>
              <Link
                to="/seller/add-single-catalog"
                className="inline-flex items-center gap-2 bg-[#FB8B24] hover:bg-[#E36414] text-white px-4 py-2 rounded-lg font-medium"
              >
                <FaPlus /> Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="h-4 w-4 text-[#FB8B24] focus:ring-[#FB8B24] border-gray-300 rounded mr-3"
                          />
                          <div className="flex items-center">
                            {product.details.images && product.details.images.length > 0 ? (
                              <img
                                src={product.details.images[0].preview}
                                alt={product.details.productName}
                                className="h-10 w-10 rounded-lg object-cover mr-3"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                                <FaBox className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.details.productName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.details.brand}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                        <div className="text-sm text-gray-500">{product.subCategory}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{parseFloat(product.details.sellingPrice).toFixed(2)}</div>
                        <div className="text-xs text-gray-500 line-through">
                          ₹{parseFloat(product.details.mrp).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2 w-20 rounded-full mr-2 ${
                            parseInt(product.details.stockQuantity) > 20 
                              ? 'bg-green-500' 
                              : parseInt(product.details.stockQuantity) > 10 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-medium">
                            {product.details.stockQuantity}
                          </span>
                          <button
                            onClick={() => {
                              const newStock = prompt("Enter new stock quantity:", product.details.stockQuantity);
                              if (newStock !== null && !isNaN(newStock)) {
                                handleStockUpdate(product.id, parseInt(newStock));
                              }
                            }}
                            className="ml-2 text-xs text-[#FB8B24] hover:text-[#E36414] font-medium"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {product.status === "active" ? (
                            <>
                              <FaCheckCircle className="mr-1" /> Active
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="mr-1" /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Product"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => navigate(`/seller/edit-product/${product.id}`)}
                            className="text-[#FB8B24] hover:text-[#E36414]"
                            title="Edit Product"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleStatusChange(
                              product.id, 
                              product.status === "active" ? "inactive" : "active"
                            )}
                            className={product.status === "active" 
                              ? "text-red-600 hover:text-red-900" 
                              : "text-green-600 hover:text-green-900"
                            }
                            title={product.status === "active" ? "Deactivate" : "Activate"}
                          >
                            {product.status === "active" ? <FaTimesCircle /> : <FaCheckCircle />}
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Product"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">📈 Product Management Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Keep stock updated to avoid missed sales opportunities</li>
            <li>• Use clear, high-quality images for better conversions</li>
            <li>• Monitor low stock items and replenish promptly</li>
            <li>• Activate products during peak construction seasons</li>
            <li>• Regularly update prices based on market trends</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SellerProducts;