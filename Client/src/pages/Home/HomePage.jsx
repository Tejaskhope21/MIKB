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
               

                const transformed = allProducts.map(p => {
                   
                    
                    // Get the first image from the images array
                    const firstImage = Array.isArray(p.images) && p.images.length > 0 
                        ? p.images[0] 
                        : null;
                    
                    // Handle relative image paths - add your backend URL
                    const imageUrl = firstImage 
                        ? (firstImage.startsWith('http') || firstImage.startsWith('data:image')
                            ? firstImage
                            : `http://localhost:5001/${firstImage.replace(/^\//, '')}`)
                        : "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=512&h=512&fit=crop";

                    return {
                        id: p.numericId || p._id || p.id,
                        name: p.name,
                        description: p.description || "High quality building material",
                        brand: p.brand || "Premium",
                        price: p.price || 0,
                        originalPrice: p.originalPrice || p.price,
                        discount: p.discount || 0,
                        rating: 4.2, // Default rating since it's not in your schema
                        category: p.materialType || "Building Material",
                        images: p.images || [], // Pass the entire images array
                        image: imageUrl, // Pass the processed first image URL
                        inStock: p.inventory?.stock > 0 || false
                    };
                });

                console.log("Transformed products:", transformed); // Debug log

                setFeaturedProducts(transformed.slice(0, 12));
                setBestSellers([...transformed].sort((a, b) => b.rating - a.rating).slice(0, 6));
                setSpecialOffers(transformed.filter(p => p.discount > 0).slice(0, 6));
                setError(null);
            } catch (err) {
                console.error("Error loading products:", err);
                setError(err.message);
                // Set fallback products
                const fallbackProducts = getFallbackProducts();
                setFeaturedProducts(fallbackProducts.slice(0, 12));
                setBestSellers(fallbackProducts.slice(0, 6));
                setSpecialOffers(fallbackProducts.slice(0, 6));
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Helper function to get fallback products
    const getFallbackProducts = () => {
        const fallbackImages = [
            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=512&h=512&fit=crop",
            "https://images.unsplash.com/photo-1581092580497-e0d4cb184827?w=512&h=512&fit=crop",
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=512&h=512&fit=crop",
            "https://images.unsplash.com/photo-1581092580497-e0d4cb184827?w=512&h=512&fit=crop",
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=512&h=512&fit=crop",
            "https://images.unsplash.com/photo-1581092580497-e0d4cb184827?w=512&h=512&fit=crop"
        ];

        const fallbackProducts = [];
        const materials = ['Cement', 'Steel', 'Bricks', 'Sand', 'Tiles', 'Paint', 'Wood'];
        
        for (let i = 1; i <= 20; i++) {
            const material = materials[i % materials.length];
            fallbackProducts.push({
                id: `fallback-${i}`,
                name: `${material} Product ${i}`,
                description: `High quality ${material.toLowerCase()} for construction`,
                brand: ["Premium", "Standard", "Elite"][i % 3],
                price: Math.floor(Math.random() * 1000) + 100,
                originalPrice: Math.floor(Math.random() * 1200) + 200,
                discount: Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 10 : 0,
                rating: 3.5 + Math.random() * 1.5,
                category: material,
                images: [fallbackImages[i % fallbackImages.length]],
                image: fallbackImages[i % fallbackImages.length],
                inStock: true
            });
        }
        return fallbackProducts;
    };

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
                            <ProductSectionSkeleton title="Featured Products" />
                        ) : (
                            <ProductsComponent 
                                title="Featured Products" 
                                categoryColor="blue" 
                                products={featuredProducts} 
                            />
                        )}
                    </div>
                </section>
             
                {/* Best Sellers Section */}
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <ProductSectionSkeleton title="Best Sellers" />
                        ) : (
                            <ProductsComponent 
                                title="Best Sellers" 
                                categoryColor="red" 
                                products={bestSellers} 
                            />
                        )}
                    </div>
                </section>
                 
                <Banner/>
                
                {/* Special Offers Section */}
                <section className="py-12 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <ProductSectionSkeleton title="Special Offers" />
                        ) : (
                            <ProductsComponent 
                                title="Special Offers" 
                                categoryColor="orange" 
                                products={specialOffers} 
                            />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;