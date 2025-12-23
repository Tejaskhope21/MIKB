import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, AlertTriangle, TrendingDown, TrendingUp, Download, Plus, Edit, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-backend-qyea.onrender.com/api';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        outOfStock: 0,
        lowStock: 0,
        totalStockValue: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        stockStatus: 'all',
        sortBy: 'name'
    });
    const [selectedItems, setSelectedItems] = useState([]);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [restockData, setRestockData] = useState({ productId: '', quantity: 10 });

    useEffect(() => {
        fetchInventory();
        fetchInventoryStats();
    }, [filters]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`${API_URL}/seller/inventory?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setInventory(response.data.inventory);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInventoryStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/seller/inventory/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching inventory stats:', error);
        }
    };

    const handleRestock = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/seller/inventory/restock`,
                restockData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Stock updated successfully');
                setShowRestockModal(false);
                fetchInventory();
                setRestockData({ productId: '', quantity: 10 });
            }
        } catch (error) {
            console.error('Error restocking:', error);
            alert('Failed to update stock');
        }
    };

    const handleBulkUpdate = async (action) => {
        if (selectedItems.length === 0) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/seller/inventory/bulk-update`,
                {
                    productIds: selectedItems,
                    action: action // 'disable', 'enable', 'archive'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert(`${response.data.updatedCount} items updated`);
                setSelectedItems([]);
                fetchInventory();
            }
        } catch (error) {
            console.error('Error bulk updating:', error);
            alert('Failed to update items');
        }
    };

    const exportInventory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/seller/inventory/export`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting inventory:', error);
            alert('Failed to export inventory');
        }
    };

    const getStockStatus = (stock, lowThreshold) => {
        if (stock <= 0) return { status: 'out_of_stock', color: 'bg-red-100 text-red-800', label: 'Out of Stock' };
        if (stock <= lowThreshold) return { status: 'low_stock', color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' };
        return { status: 'in_stock', color: 'bg-green-100 text-green-800', label: 'In Stock' };
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
                    <p className="text-gray-600">Track and manage your product stock</p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                    <button
                        onClick={exportInventory}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => setShowRestockModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        Restock Items
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Products</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-2">
                                {stats.totalProducts}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Out of Stock</p>
                            <h3 className="text-2xl font-bold text-red-600 mt-2">
                                {stats.outOfStock}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">Requires attention</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Low Stock</p>
                            <h3 className="text-2xl font-bold text-yellow-600 mt-2">
                                {stats.lowStock}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">Below threshold</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <TrendingDown className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Stock Value</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-2">
                                ₹{stats.totalStockValue?.toLocaleString() || '0'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">Total inventory value</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <select
                        value={filters.stockStatus}
                        onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="all">All Stock Status</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="in_stock">In Stock</option>
                    </select>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="name">Name A-Z</option>
                        <option value="name_desc">Name Z-A</option>
                        <option value="stock_low">Stock: Low to High</option>
                        <option value="stock_high">Stock: High to Low</option>
                        <option value="value_low">Value: Low to High</option>
                        <option value="value_high">Value: High to Low</option>
                    </select>
                    <button
                        onClick={fetchInventory}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center">
                            <span className="text-blue-700 font-medium">
                                {selectedItems.length} item(s) selected
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleBulkUpdate('disable')}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                            >
                                Disable Selected
                            </button>
                            <button
                                onClick={() => handleBulkUpdate('archive')}
                                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                            >
                                Archive Selected
                            </button>
                            <button
                                onClick={() => setSelectedItems([])}
                                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length > 0 && selectedItems.length === inventory.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems(inventory.map(item => item._id));
                                            } else {
                                                setSelectedItems([]);
                                            }
                                        }}
                                        className="rounded border-gray-300 text-blue-600"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Low Stock Alert</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                                            <p className="text-gray-500">Loading inventory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : inventory.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <Package className="w-12 h-12 text-gray-400 mb-3" />
                                            <p className="text-gray-500">No inventory items found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((item) => {
                                    const stockStatus = getStockStatus(item.stock, item.lowStockThreshold);
                                    const stockValue = item.stock * (item.price || 0);

                                    return (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedItems([...selectedItems, item._id]);
                                                        } else {
                                                            setSelectedItems(selectedItems.filter(id => id !== item._id));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <img
                                                        src={item.image || 'https://via.placeholder.com/40'}
                                                        alt={item.name}
                                                        className="w-10 h-10 object-cover rounded-lg mr-3"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-800">{item.name}</div>
                                                        <div className="text-sm text-gray-500">{item.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {item.sku || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{item.stock}</div>
                                                <div className="text-xs text-gray-500">
                                                    Sold: {item.soldCount || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">{item.lowStockThreshold || 10}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">₹{stockValue.toLocaleString()}</div>
                                                <div className="text-xs text-gray-500">
                                                    ₹{item.price?.toLocaleString() || '0'} each
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                                    {stockStatus.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setRestockData({ productId: item._id, quantity: 10 });
                                                            setShowRestockModal(true);
                                                        }}
                                                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                        title="Restock"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
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
            </div>

            {/* Restock Modal */}
            {showRestockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Restock Product</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity to Add
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={restockData.quantity}
                                    onChange={(e) => setRestockData({ ...restockData, quantity: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowRestockModal(false);
                                        setRestockData({ productId: '', quantity: 10 });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRestock}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Update Stock
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;