import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCategoryById, fetchProducts } from '../../services/api';
import { ArrowLeft, Search } from 'lucide-react';

const CategoryDetailsPage = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const cat = await fetchCategoryById(categoryId);
                setCategory(cat);

                const prods = await fetchProducts({ categoryId: cat.numericId || categoryId, search: '', sort: sortBy });
                setProducts(prods);
            } catch (err) {
                if (err.message.includes('not found')) navigate('/categories');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [categoryId, navigate]);

    // Re-fetch on filters
    useEffect(() => {
        if (!category) return;
        fetchProducts({
            categoryId: category.numericId || categoryId,
            subcategoryId: selectedSubcategory,
            search: searchTerm,
            sort: sortBy
        }).then(setProducts);
    }, [searchTerm, sortBy, selectedSubcategory, category]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!category) return <div className="text-center py-20">Category not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Banner */}
            <div className="relative h-64 bg-gradient-to-r from-[#800000] to-[#a52a2a] text-white">
                <div className="max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
                    <Link 
                        to="/" 
                        className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
                        <p className="text-white/90 max-w-2xl">{category.description || 'Essential construction materials for building and infrastructure projects'}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:w-1/4 space-y-6">
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">FILTERS</h3>
                            
                            {/* Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search products
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000] focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Subcategories Filter */}
                            <div>
                                <h4 className="font-medium text-gray-800 mb-3">SUBCATEGORIES</h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedSubcategory(null)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${!selectedSubcategory ? 'bg-[#800000] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                                    >
                                        All Products
                                    </button>
                                    {category.subcategories?.map(sub => (
                                        <button
                                            key={sub.numericId || sub.id}
                                            onClick={() => setSelectedSubcategory(sub.numericId || sub.id)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${selectedSubcategory === (sub.numericId || sub.id) ? 'bg-[#800000] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                                        >
                                            {sub.title || sub.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {/* Horizontal Subcategory Filter */}
                        {category.subcategories?.length > 0 && (
                            <div className="bg-white rounded-xl shadow p-4 mb-6">
                                <h4 className="font-medium text-gray-800 mb-3">Filter by Subcategory</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedSubcategory(null)}
                                        className={`px-4 py-2 rounded-lg transition-colors ${!selectedSubcategory ? 'bg-[#800000] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        All Products
                                    </button>
                                    {category.subcategories.map(sub => (
                                        <button
                                            key={sub.numericId || sub.id}
                                            onClick={() => setSelectedSubcategory(sub.numericId || sub.id)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${selectedSubcategory === (sub.numericId || sub.id) ? 'bg-[#800000] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            {sub.title || sub.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sorting and Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                            <div className="text-gray-600 mb-4 sm:mb-0">
                                Showing {products.length} product{products.length !== 1 ? 's' : ''}
                            </div>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-[#800000] focus:outline-none"
                            >
                                <option value="default">Sort by: Default</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>

                        {/* Products Grid */}
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map(product => (
                                    <div
                                        key={product.numericId || product.id}
                                        className="bg-white rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                                    >
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                                                alt={product.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-800 text-lg truncate">{product.name}</h3>
                                            <p className="text-gray-600 text-sm mt-1 truncate">{product.brand}</p>
                                            <div className="flex items-center justify-between mt-4">
                                                <div>
                                                    <p className="text-xl font-bold text-[#800000]">₹{product.price}</p>
                                                    {product.originalPrice && (
                                                        <p className="text-sm text-gray-400 line-through">₹{product.originalPrice}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button className="w-full mt-4 bg-[#800000] hover:bg-[#600000] text-white py-2.5 rounded-lg transition-colors font-medium">
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow p-12 text-center">
                                <div className="text-6xl mb-4 text-gray-300">🏗️</div>
                                <h3 className="text-xl font-medium text-gray-700 mb-3">No Products Found</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    No products available in {category.name} category
                                </p>
                                <Link
                                    to="/products"
                                    className="inline-flex items-center px-6 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors font-medium"
                                >
                                    View All Products
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryDetailsPage;