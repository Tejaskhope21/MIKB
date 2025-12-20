// CategoryDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCategoryById } from '../../services/api';
import { ArrowLeft } from 'lucide-react';
import Skeleton from '../../components/Skeleton/Skeleton';

const CategoryDetailsPage = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const cat = await fetchCategoryById(categoryId);
                
                if (!cat) {
                    throw new Error('Category not found');
                }
                
                setCategory(cat);
            } catch (err) {
                console.error('Error loading category:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        if (categoryId) {
            loadData();
        }
    }, [categoryId]);

    const handleAllProductsClick = () => {
        navigate(`/products/category/${categoryId}`);
    };

    const handleSubcategoryClick = (subcategoryId, subcategoryName) => {
        navigate(`/products/category/${categoryId}?subcategory=${subcategoryId}`);
    };

    // SKELETON LOADING COMPONENT
    const CategoryDetailsSkeleton = () => (
        <div className="min-h-screen bg-gray-50">
            {/* Banner Skeleton */}
            <div className="relative h-64 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse">
                <div className="max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
                    <div className="h-6 bg-gray-300 w-24 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-10 bg-gray-300 w-1/3"></div>
                        <div className="h-6 bg-gray-300 w-2/3"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Subcategory</h2>
                
                {/* All Products Card Skeleton */}
                <div className="mb-8">
                    <div className="bg-white border border-gray-200 overflow-hidden animate-pulse">
                        <div className="p-6">
                            <div className="h-7 bg-gray-300 w-2/3 mb-4"></div>
                            <div className="h-5 bg-gray-300 w-full mb-4"></div>
                            <div className="h-5 bg-gray-300 w-3/4"></div>
                            <div className="mt-6 h-6 bg-gray-200 w-32"></div>
                        </div>
                    </div>
                </div>

                {/* Subcategories Grid Skeleton */}
                <div className="mb-8">
                    <div className="h-7 bg-gray-300 w-64 mb-6 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg animate-pulse">
                                <div className="h-6 bg-gray-300 w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-300 w-full mb-2"></div>
                                <div className="h-4 bg-gray-300 w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <CategoryDetailsSkeleton />;
    }

    if (error || !category) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl shadow p-8 text-center">
                        <div className="text-6xl mb-4">😕</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            {error || 'The category you are looking for does not exist.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors"
                            >
                                ← Back to Home
                            </button>
                            <button
                                onClick={() => navigate('/products')}
                                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Browse All Products
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Banner - Matching your image design */}
            <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </button>
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
                        <p className="text-white/90 max-w-2xl text-lg">
                            {category.description || 'Essential construction materials for building and infrastructure projects'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Subcategory</h2>
                
                {/* All Products Card */}
                <div className="mb-8">
                    <div 
                        className="bg-white rounded-lg border border-gray-200 hover:border-blue-500 overflow-hidden group cursor-pointer transition-all duration-300"
                        onClick={handleAllProductsClick}
                    >
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">All {category.name} Products</h3>
                            <p className="text-gray-600 mb-4">
                                Browse our complete collection of {category.name.toLowerCase()} materials and supplies
                            </p>
                            <div className="flex items-center text-blue-600 font-medium">
                                <span>View all products →</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Or browse by specific subcategory */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Or browse by specific subcategory</h3>
                    
                    {category.subcategories?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.subcategories.map(sub => {
                                const subcategoryId = sub.numericId || sub.id || sub._id;
                                const subcategoryName = sub.title || sub.name || 'Subcategory';
                                
                                return (
                                    <div 
                                        key={subcategoryId}
                                        className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md overflow-hidden cursor-pointer transition-all duration-300"
                                        onClick={() => handleSubcategoryClick(subcategoryId, subcategoryName)}
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-gray-900 text-lg">
                                                    {subcategoryName}
                                                </h4>
                                            </div>
                                            <p className="text-gray-600 mb-4 text-sm">
                                                {sub.description || `Browse ${subcategoryName} products`}
                                            </p>
                                            <div className="flex items-center text-blue-600 text-sm font-medium">
                                                <span>View products →</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No subcategories available for this category.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryDetailsPage;