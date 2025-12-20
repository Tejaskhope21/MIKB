import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCategoryById } from '../../services/api';
import { ArrowLeft } from 'lucide-react';

const CategoryDetailsPage = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const cat = await fetchCategoryById(categoryId);
                setCategory(cat);
            } catch (err) {
                if (err.message.includes('not found')) navigate('/categories');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [categoryId, navigate]);

    const handleSubcategoryClick = (subcategoryId, subcategoryName) => {
        // Navigate to products page with category and subcategory filters
        navigate(`/products?category=${categoryId}&subcategory=${subcategoryId}`);
    };

    const handleAllProductsClick = () => {
        navigate(`/products?category=${categoryId}`);
    };

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
                {/* Subcategories Grid */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Subcategory</h2>
                    
                    {/* All Products Card */}
                    <div className="mb-8">
                        <div 
                            className="bg-white rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
                            onClick={handleAllProductsClick}
                        >
                            <div className="flex flex-col md:flex-row items-center">
                                <div className="md:w-1/4 h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <div className="text-6xl">📦</div>
                                </div>
                                <div className="md:w-3/4 p-8">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">All {category.name} Products</h3>
                                    <p className="text-gray-600 text-lg">
                                        Browse our complete collection of {category.name.toLowerCase()} materials and supplies
                                    </p>
                                    <div className="mt-6 flex items-center text-[#800000] font-medium">
                                        <span>View all products</span>
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subcategory Cards */}
                    {category.subcategories?.length > 0 && (
                        <>
                            <h3 className="text-xl font-bold text-gray-700 mb-6">Or browse by specific subcategory</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {category.subcategories.map(sub => (
                                    <div 
                                        key={sub.numericId || sub.id}
                                        className="bg-white rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer hover:border-[#800000]"
                                        onClick={() => handleSubcategoryClick(sub.numericId || sub.id, sub.title || sub.name)}
                                    >
                                        <div className="relative h-48 bg-gradient-to-br from-[#80000010] to-[#a52a2a10] flex items-center justify-center group-hover:from-[#80000020] group-hover:to-[#a52a2a20] transition-all">
                                            <div className="text-5xl">{sub.icon || '🏗️'}</div>
                                            <div className="absolute inset-0 bg-[#800000] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-bold text-gray-800 text-lg text-center mb-2">{sub.title || sub.name}</h3>
                                            <p className="text-gray-600 text-sm text-center mb-4">
                                                {sub.description || `Browse ${sub.title || sub.name} products`}
                                            </p>
                                            <div className="text-center">
                                                <span className="inline-flex items-center text-[#800000] text-sm font-medium">
                                                    View products
                                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryDetailsPage;