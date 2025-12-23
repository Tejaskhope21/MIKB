import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Package, TrendingUp, AlertCircle, ShoppingCart,
    Search, Filter, Download, Eye, Plus, Truck,
    Store, Calendar, DollarSign, BarChart3, Tag, Grid
} from 'lucide-react';

const MaterialsPage = () => {
    const [materials, setMaterials] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        fetchMaterials();
        fetchCart();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            // Mock data - replace with API call
            const mockMaterials = [
                {
                    _id: '1',
                    name: 'Cement (UltraTech)',
                    category: 'Cement',
                    brand: 'UltraTech',
                    unit: '50kg bag',
                    price: 400,
                    discountPrice: 380,
                    stock: 500,
                    minOrder: 10,
                    supplier: 'BuildMart Supplies',
                    location: 'Mumbai',
                    deliveryTime: '24 hours',
                    rating: 4.5,
                    reviews: 128,
                    description: 'Premium OPC 53 Grade cement for high-strength construction',
                    specifications: {
                        grade: '53',
                        type: 'OPC',
                        settingTime: '30 minutes',
                        strength: '53 MPa'
                    },
                    images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800']
                },
                {
                    _id: '2',
                    name: 'TMT Steel Bars',
                    category: 'Steel',
                    brand: 'JSW',
                    unit: 'ton',
                    price: 65000,
                    discountPrice: 62000,
                    stock: 50,
                    minOrder: 1,
                    supplier: 'Steel World',
                    location: 'Delhi',
                    deliveryTime: '48 hours',
                    rating: 4.8,
                    reviews: 256,
                    description: 'Fe-550D grade TMT steel bars with earthquake resistance',
                    specifications: {
                        grade: 'Fe-550D',
                        diameter: '8mm-32mm',
                        yieldStrength: '550 N/mm²',
                        elongation: '18%'
                    }
                },
                {
                    _id: '3',
                    name: 'Birla White Putty',
                    category: 'Wall Putty',
                    brand: 'Birla',
                    unit: '40kg bag',
                    price: 450,
                    discountPrice: 420,
                    stock: 200,
                    minOrder: 5,
                    supplier: 'Paint Paradise',
                    location: 'Bangalore',
                    deliveryTime: '24 hours',
                    rating: 4.3,
                    reviews: 89,
                    description: 'White cement based wall putty for smooth finishing'
                },
                {
                    _id: '4',
                    name: 'Kajaria Ceramic Tiles',
                    category: 'Tiles',
                    brand: 'Kajaria',
                    unit: 'box (10 sq ft)',
                    price: 2500,
                    discountPrice: 2300,
                    stock: 100,
                    minOrder: 2,
                    supplier: 'Tile World',
                    location: 'Chennai',
                    deliveryTime: '72 hours',
                    rating: 4.6,
                    reviews: 156,
                    description: 'Premium ceramic tiles for flooring and walls'
                },
                {
                    _id: '5',
                    name: 'Asian Paints Royale',
                    category: 'Paint',
                    brand: 'Asian Paints',
                    unit: '20 liter',
                    price: 8500,
                    discountPrice: 8000,
                    stock: 80,
                    minOrder: 1,
                    supplier: 'Color Masters',
                    location: 'Pune',
                    deliveryTime: '48 hours',
                    rating: 4.7,
                    reviews: 210,
                    description: 'Washable emulsion paint with anti-stain technology'
                }
            ];
            setMaterials(mockMaterials);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCart = async () => {
        try {
            // Mock cart data
            const mockCart = [
                { materialId: '1', name: 'Cement', quantity: 20, price: 380, total: 7600 },
                { materialId: '3', name: 'Birla White Putty', quantity: 10, price: 420, total: 4200 }
            ];
            setCart(mockCart);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const categories = ['all', 'Cement', 'Steel', 'Tiles', 'Paint', 'Wall Putty', 'Aggregates', 'Electrical', 'Plumbing'];

    const filteredMaterials = materials.filter(material => {
        const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
    const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const addToCart = (material) => {
        const existingItem = cart.find(item => item.materialId === material._id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.materialId === material._id
                    ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
                    : item
            ));
        } else {
            setCart([...cart, {
                materialId: material._id,
                name: material.name,
                quantity: 1,
                price: material.discountPrice || material.price,
                total: material.discountPrice || material.price
            }]);
        }
    };

    const removeFromCart = (materialId) => {
        setCart(cart.filter(item => item.materialId !== materialId));
    };

    const updateQuantity = (materialId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(materialId);
            return;
        }
        setCart(cart.map(item =>
            item.materialId === materialId
                ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
                : item
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Materials</h1>
                    <p className="text-gray-600">Browse and order construction materials</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <ShoppingCart className="w-6 h-6" />
                        {cartItemsCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {cartItemsCount}
                            </span>
                        )}
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Request Custom Material
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Materials in Catalog</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{materials.length}+</p>
                        </div>
                        <Package className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        15% more than last month
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Cart Value</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">₹{(cartTotal / 1000).toFixed(1)}K</p>
                        </div>
                        <ShoppingCart className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">{cartItemsCount} items in cart</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Avg. Delivery Time</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">48 hrs</p>
                        </div>
                        <Truck className="w-10 h-10 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600">Across all suppliers</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Price Alerts</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">3</p>
                        </div>
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <p className="text-sm text-red-600">Steel prices up by 5%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Filters and Search */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search materials by name, brand, or category..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    More Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Showing {filteredMaterials.length} of {materials.length} materials
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                className={`px-4 py-2 rounded-md flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-600'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid className="w-4 h-4" />
                                Grid
                            </button>
                            <button
                                className={`px-4 py-2 rounded-md flex items-center gap-2 ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'}`}
                                onClick={() => setViewMode('list')}
                            >
                                <BarChart3 className="w-4 h-4" />
                                List
                            </button>
                        </div>
                    </div>

                    {/* Materials Grid/List */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                        </div>
                    ) : filteredMaterials.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
                            <p className="text-gray-600">Try different search terms</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredMaterials.map((material) => (
                                <div key={material._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg mb-1">{material.name}</h3>
                                                <p className="text-gray-600 text-sm">{material.brand} • {material.category}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${material.stock > 100 ? 'bg-green-100 text-green-800' :
                                                    material.stock > 20 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {material.stock} in stock
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl font-bold">₹{material.discountPrice || material.price}</span>
                                                {material.discountPrice && (
                                                    <>
                                                        <span className="text-gray-500 line-through">₹{material.price}</span>
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                                            Save ₹{material.price - material.discountPrice}
                                                        </span>
                                                    </>
                                                )}
                                                <span className="text-sm text-gray-600 ml-auto">/{material.unit}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Store className="w-4 h-4" />
                                                <span>{material.supplier}</span>
                                                <span className="mx-2">•</span>
                                                <Truck className="w-4 h-4" />
                                                <span>{material.deliveryTime}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`w-4 h-4 ${i < Math.floor(material.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                        ★
                                                    </div>
                                                ))}
                                                <span className="text-sm text-gray-600 ml-2">({material.reviews})</span>
                                            </div>
                                            <button
                                                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
                                                onClick={() => addToCart(material)}
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredMaterials.map((material) => (
                                        <tr key={material._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium">{material.name}</div>
                                                    <div className="text-sm text-gray-500">{material.brand}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                                    {material.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold">₹{material.discountPrice || material.price}</div>
                                                {material.discountPrice && (
                                                    <div className="text-sm text-gray-500 line-through">₹{material.price}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`px-3 py-1 text-xs font-medium rounded-full ${material.stock > 100 ? 'bg-green-100 text-green-800' :
                                                        material.stock > 20 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {material.stock} units
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div>{material.supplier}</div>
                                                    <div className="text-gray-500">{material.deliveryTime}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        onClick={() => setSelectedMaterial(material)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                        onClick={() => addToCart(material)}
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
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

                {/* Right Column - Cart */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                Shopping Cart
                                {cartItemsCount > 0 && (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                                        {cartItemsCount} items
                                    </span>
                                )}
                            </h3>
                        </div>

                        {cart.length === 0 ? (
                            <div className="p-8 text-center">
                                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">Your cart is empty</p>
                                <p className="text-sm text-gray-500 mt-2">Add materials to get started</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 max-h-96 overflow-y-auto">
                                    {cart.map((item) => (
                                        <div key={item.materialId} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                                            <div className="flex-1">
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-sm text-gray-600">₹{item.price}/unit</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                                                        onClick={() => updateQuantity(item.materialId, item.quantity - 1)}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                                                        onClick={() => updateQuantity(item.materialId, item.quantity + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="font-bold w-20 text-right">₹{item.total}</div>
                                                <button
                                                    className="p-1 text-red-500 hover:text-red-700"
                                                    onClick={() => removeFromCart(item.materialId)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 border-t border-gray-200">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium">₹{cartTotal}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping</span>
                                            <span className="font-medium">₹{cartTotal > 10000 ? 0 : 500}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">GST (18%)</span>
                                            <span className="font-medium">₹{Math.round(cartTotal * 0.18)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                                            <span>Total</span>
                                            <span>₹{cartTotal + (cartTotal > 10000 ? 0 : 500) + Math.round(cartTotal * 0.18)}</span>
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700">
                                        Proceed to Checkout
                                    </button>
                                    <button className="w-full mt-3 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        Save for Later
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Price Alerts */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Price Alerts
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">Steel Prices Up</div>
                                        <div className="text-sm text-red-600">+5% increase this week</div>
                                    </div>
                                    <Tag className="w-5 h-5 text-red-500" />
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">Cement Prices Down</div>
                                        <div className="text-sm text-green-600">-3% decrease this week</div>
                                    </div>
                                    <Tag className="w-5 h-5 text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Material Detail Modal */}
            {selectedMaterial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedMaterial.name}</h2>
                                <p className="text-gray-600">{selectedMaterial.brand} • {selectedMaterial.category}</p>
                            </div>
                            <button
                                onClick={() => setSelectedMaterial(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <img
                                    src={selectedMaterial.images?.[0] || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800'}
                                    alt={selectedMaterial.name}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <div className="mt-6">
                                    <h3 className="font-semibold mb-3">Description</h3>
                                    <p className="text-gray-700">{selectedMaterial.description}</p>
                                </div>
                            </div>
                            <div>
                                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-3xl font-bold">₹{selectedMaterial.discountPrice || selectedMaterial.price}</div>
                                            {selectedMaterial.discountPrice && (
                                                <div className="text-gray-500 line-through">₹{selectedMaterial.price}</div>
                                            )}
                                            <div className="text-sm text-gray-600 mt-1">per {selectedMaterial.unit}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`px-3 py-1 text-sm font-medium rounded-full ${selectedMaterial.stock > 100 ? 'bg-green-100 text-green-800' :
                                                    selectedMaterial.stock > 20 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {selectedMaterial.stock} units available
                                            </div>
                                            <div className="text-sm text-gray-600 mt-2">Min order: {selectedMaterial.minOrder}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Supplier</span>
                                            <span className="font-medium">{selectedMaterial.supplier}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery Time</span>
                                            <span className="font-medium">{selectedMaterial.deliveryTime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Location</span>
                                            <span className="font-medium">{selectedMaterial.location}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Rating</span>
                                            <span className="font-medium">{selectedMaterial.rating}/5 ({selectedMaterial.reviews} reviews)</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedMaterial.specifications && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-3">Specifications</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(selectedMaterial.specifications).map(([key, value]) => (
                                                <div key={key} className="bg-gray-50 p-3 rounded">
                                                    <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                                    <div className="font-medium">{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        Save for Later
                                    </button>
                                    <button
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700"
                                        onClick={() => {
                                            addToCart(selectedMaterial);
                                            setSelectedMaterial(null);
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialsPage;