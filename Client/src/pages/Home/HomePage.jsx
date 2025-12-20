import React, { useState, useEffect } from 'react';
import Hero from "../../components/Hero/Hero";
import CategoryHeader from "../../components/CategorySection/CategoryHeader";
import CategorySection from "../../components/CategorySection/CategorySection";
import BrandsSection from "../../components/Brands/BrandsSection";
import ProductsComponent from "../../components/Products/ProductsComponent";
import { fetchProducts } from '../../services/api';
import Banner from '../../components/Banner/Banner';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [specialOffers, setSpecialOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const allProducts = await fetchProducts();

                const transformed = allProducts.map(p => ({
                    id: p.numericId || p.id,
                    name: p.name,
                    description: p.description || "High quality building material",
                    brand: p.brand || "Premium",
                    price: p.price || 0,
                    originalPrice: p.originalPrice || p.price,
                    discount: p.discount || 0,
                    rating: p.rating || 4.2,
                    image: p.image || "https://placehold.co/512x512?text=Product"
                }));

                setFeaturedProducts(transformed.slice(0, 12));
                setBestSellers([...transformed].sort((a, b) => b.rating - a.rating).slice(0, 6));
                setSpecialOffers(transformed.filter(p => p.discount > 0).slice(0, 6) || transformed.slice(0, 6));
                setError(null);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Skeleton Loading Component for Product Sections
    const ProductSectionSkeleton = ({ title = "Loading..." }) => (
        <div className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-4">
                    <div className="h-7 w-48 bg-gray-200 animate-pulse"></div>
                    <div className="h-5 w-16 bg-gray-200 animate-pulse"></div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="relative bg-white overflow-hidden flex flex-col items-center justify-center w-full">
                            {/* Image Skeleton */}
                            <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse"></div>
                            
                            {/* Content Skeleton */}
                            <div className="p-2 w-full">
                                <div className="h-3 bg-gray-200 animate-pulse mb-1 w-3/4"></div>
                                <div className="h-2.5 bg-gray-200 animate-pulse mb-2 w-1/2"></div>
                                
                                <div className="flex flex-wrap items-center gap-1 justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                        <div className="w-10 h-3 bg-gray-200 animate-pulse"></div>
                                        <div className="w-8 h-2.5 bg-gray-200 animate-pulse"></div>
                                    </div>
                                    <div className="w-8 h-3 bg-gray-200 animate-pulse"></div>
                                </div>
                                
                                <div className="mt-1 flex items-center justify-between">
                                    <div className="w-16 h-2.5 bg-gray-200 animate-pulse"></div>
                                    <div className="w-6 h-2.5 bg-gray-200 animate-pulse"></div>
                                </div>
                            </div>
                            
                            {/* Discount Badge Skeleton */}
                            <div className="absolute top-2 left-2 w-12 h-4 bg-gray-300 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">⚠️ {error}</p>
                    <p className="text-gray-600">Please start your backend server</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="container mx-auto">
                    <CategoryHeader />
                </div>
            </div>

            <Hero />
            <CategorySection />
            <BrandsSection />

            <div className="space-y-12">
                {/* Featured Products Section */}
                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="py-6">
                                {/* Header Skeleton */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-7 w-48 bg-gray-200 animate-pulse"></div>
                                    <div className="h-5 w-16 bg-gray-200 animate-pulse"></div>
                                </div>

                                {/* Products Grid Skeleton */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="relative bg-white overflow-hidden flex flex-col items-center justify-center w-full">
                                            {/* Image Skeleton */}
                                            <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse"></div>
                                            
                                            {/* Content Skeleton */}
                                            <div className="p-2 w-full">
                                                <div className="h-3 bg-gray-200 animate-pulse mb-1 w-3/4"></div>
                                                <div className="h-2.5 bg-gray-200 animate-pulse mb-2 w-1/2"></div>
                                                
                                                <div className="flex flex-wrap items-center gap-1 justify-between mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-10 h-3 bg-gray-200 animate-pulse"></div>
                                                        <div className="w-8 h-2.5 bg-gray-200 animate-pulse"></div>
                                                    </div>
                                                    <div className="w-8 h-3 bg-gray-200 animate-pulse"></div>
                                                </div>
                                                
                                                <div className="mt-1 flex items-center justify-between">
                                                    <div className="w-16 h-2.5 bg-gray-200 animate-pulse"></div>
                                                    <div className="w-6 h-2.5 bg-gray-200 animate-pulse"></div>
                                                </div>
                                            </div>
                                            
                                            {/* Discount Badge Skeleton */}
                                            <div className="absolute top-2 left-2 w-12 h-4 bg-gray-300 animate-pulse"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <ProductsComponent 
                                title="Featured Products" 
                                categoryColor="blue" 
                                products={featuredProducts} 
                                 className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3"
                            />
                        )}
                    </div>
                </section>
             
                {/* Best Sellers Section */}
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="py-6">
                                {/* Header Skeleton */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-7 w-48 bg-gray-200 animate-pulse"></div>
                                    <div className="h-5 w-16 bg-gray-200 animate-pulse"></div>
                                </div>

                                {/* Products Grid Skeleton */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="relative bg-white overflow-hidden flex flex-col items-center justify-center w-full">
                                            {/* Image Skeleton */}
                                            <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse"></div>
                                            
                                            {/* Content Skeleton */}
                                            <div className="p-2 w-full">
                                                <div className="h-3 bg-gray-200 animate-pulse mb-1 w-3/4"></div>
                                                <div className="h-2.5 bg-gray-200 animate-pulse mb-2 w-1/2"></div>
                                                
                                                <div className="flex flex-wrap items-center gap-1 justify-between mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-10 h-3 bg-gray-200 animate-pulse"></div>
                                                        <div className="w-8 h-2.5 bg-gray-200 animate-pulse"></div>
                                                    </div>
                                                    <div className="w-8 h-3 bg-gray-200 animate-pulse"></div>
                                                </div>
                                                
                                                <div className="mt-1 flex items-center justify-between">
                                                    <div className="w-16 h-2.5 bg-gray-200 animate-pulse"></div>
                                                    <div className="w-6 h-2.5 bg-gray-200 animate-pulse"></div>
                                                </div>
                                            </div>
                                            
                                            {/* Discount Badge Skeleton */}
                                            <div className="absolute top-2 left-2 w-12 h-4 bg-gray-300 animate-pulse"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <ProductsComponent 
                                title="Best Sellers" 
                                categoryColor="red" 
                                products={bestSellers} 
                                 className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3"
                            />
                        )}
                    </div>
                </section>
                 <Banner/>
                {/* Special Offers Section */}
                <section className="py-12 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="py-6">
                                {/* Header Skeleton */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-7 w-48 bg-gray-200 animate-pulse"></div>
                                    <div className="h-5 w-16 bg-gray-200 animate-pulse"></div>
                                </div>

                                {/* Products Grid Skeleton */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="relative bg-white overflow-hidden flex flex-col items-center justify-center w-full">
                                            {/* Image Skeleton */}
                                            <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse"></div>
                                            
                                            {/* Content Skeleton */}
                                            <div className="p-2 w-full">
                                                <div className="h-3 bg-gray-200 animate-pulse mb-1 w-3/4"></div>
                                                <div className="h-2.5 bg-gray-200 animate-pulse mb-2 w-1/2"></div>
                                                
                                                <div className="flex flex-wrap items-center gap-1 justify-between mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-10 h-3 bg-gray-200 animate-pulse"></div>
                                                        <div className="w-8 h-2.5 bg-gray-200 animate-pulse"></div>
                                                    </div>
                                                    <div className="w-8 h-3 bg-gray-200 animate-pulse"></div>
                                                </div>
                                                
                                                <div className="mt-1 flex items-center justify-between">
                                                    <div className="w-16 h-2.5 bg-gray-200 animate-pulse"></div>
                                                    <div className="w-6 h-2.5 bg-gray-200 animate-pulse"></div>
                                                </div>
                                            </div>
                                            
                                            {/* Discount Badge Skeleton */}
                                            <div className="absolute top-2 left-2 w-12 h-4 bg-gray-300 animate-pulse"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <ProductsComponent 
                                title="Special Offers" 
                                categoryColor="orange" 
                                products={specialOffers} 
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3"
                            />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;