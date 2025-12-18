import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCategoryById, fetchProducts } from '../../services/api';

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

    const filteredProducts = products; // already filtered from API

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Banner */}
            <div className="relative h-80 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
                <div className="absolute bottom-8 left-8">
                    <Link to="/categories" className="mb-4 inline-block">← Back</Link>
                    <div className="flex items-center gap-6">
                        <span className="text-6xl">{category.icon || '🔧'}</span>
                        <div>
                            <h1 className="text-4xl font-bold">{category.name}</h1>
                            <p>{category.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Filters */}
                <div className="bg-white p-6 rounded-xl shadow mb-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 px-4 py-3 border rounded-lg" />
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-3 border rounded-lg">
                            <option value="default">Default</option>
                            <option value="price-low">Price Low → High</option>
                            <option value="price-high">Price High → Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>

                    {/* Subcategory Filter */}
                    {category.subcategories?.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => setSelectedSubcategory(null)} className={!selectedSubcategory ? 'bg-blue-600 text-white px-4 py-2 rounded' : 'bg-gray-200 px-4 py-2 rounded'}>
                                All
                            </button>
                            {category.subcategories.map(sub => (
                                <button key={sub.numericId || sub.id} onClick={() => setSelectedSubcategory(sub.numericId || sub.id)} className={selectedSubcategory === (sub.numericId || sub.id) ? 'bg-blue-600 text-white px-4 py-2 rounded' : 'bg-gray-200 px-4 py-2 rounded'}>
                                    {sub.title || sub.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <div key={product.numericId || product.id} className="bg-white rounded-xl shadow hover:shadow-xl transition">
                                <img src={product.image || 'https://placehold.co/400x300'} alt={product.name} className="w-full h-48 object-cover rounded-t-xl" />
                                <div className="p-4">
                                    <h3 className="font-bold">{product.name}</h3>
                                    <p className="text-gray-600 text-sm">{product.brand}</p>
                                    <p className="text-2xl font-bold mt-2">₹{product.price}</p>
                                    <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded">Add to Cart</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">No products found</div>
                )}
            </div>
        </div>
    );
};

export default CategoryDetailsPage;