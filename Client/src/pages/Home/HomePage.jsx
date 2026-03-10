import React, { useState, useEffect } from 'react';
import Hero from "../../components/Hero/Hero";
import CategoryHeader from "../../components/CategorySection/CategoryHeader";
import CategorySection from "../../components/CategorySection/CategorySection";
import BrandsSection from "../../components/Brands/BrandsSection";
import ProductsComponent from "../../components/Products/ProductsComponent";
import { fetchProducts } from '../../services/api';
import Banner from '../../components/Banner/Banner';
import HotDeals from '../../components/ProductDeals/HotDeals';
import TrendingProducts from '../../components/ProductDeals/TrendingProducts';
import AllProductsPage from '../Products/AllProductsPage';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [specialOffers, setSpecialOffers] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setProductsLoading(true);
                setProductsError(null);

                const allProducts = await fetchProducts();

                // Transform API data
                const transformed = allProducts.map(p => {
                    const firstImage = Array.isArray(p.images) && p.images.length > 0
                        ? p.images[0]
                        : null;

                    const imageUrl = firstImage
                        ? (firstImage.startsWith('http') || firstImage.startsWith('data:image')
                            ? firstImage
                            : `http://localhost:5000/${firstImage.replace(/^\//, '')}`)
                        : "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=512&h=512&fit=crop";

                    return {
                        id: p.numericId || p._id || p.id,
                        name: p.name || "Unnamed Product",
                        description: p.description || "High quality building material",
                        brand: p.brand || "Premium",
                        price: p.price || 0,
                        originalPrice: p.originalPrice || p.price,
                        discount: p.discount || 0,
                        rating: 4.2, // You can make this dynamic later
                        category: p.materialType || "Building Material",
                        images: p.images || [],
                        image: imageUrl,
                        inStock: p.inventory?.stock > 0 || false
                    };
                });

                // Use real data if available, otherwise fallback
                const dataToUse = transformed.length > 0 ? transformed : getFallbackProducts();

                setFeaturedProducts(dataToUse.slice(0, 12));
                setBestSellers([...dataToUse].sort((a, b) => b.rating - a.rating).slice(0, 6));
                setSpecialOffers(dataToUse.filter(p => p.discount > 0).slice(0, 6));

            } catch (err) {
                console.error("Error loading products:", err);
                setProductsError(err.message || "Failed to load products");

                // Always show fallback data on error
                const fallback = getFallbackProducts();
                setFeaturedProducts(fallback.slice(0, 12));
                setBestSellers(fallback.slice(0, 6));
                setSpecialOffers(fallback.slice(0, 6));
            } finally {
                setProductsLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Fallback dummy products (shown when API fails or is slow)
    const getFallbackProducts = () => {
        const fallbackImages = [
            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=512&h=512&fit=crop",
            "https://images.unsplash.com/photo-1581092580497-e0d4cb184827?w=512&h=512&fit=crop",
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=512&h=512&fit=crop",
            "https://images.unsplash.com/photo-1581093450021-4a47de3b9c84?w=512&h=512&fit=crop",
            "https://images.unsplash.com/photo-1581092160607-36e2c6e2cb3b?w=512&h=512&fit=crop",
            "https://images.unsplash.com/photo-1581093577422-6aefdcac5ad7?w=512&h=512&fit=crop"
        ];

        const materials = ['Cement', 'Steel', 'Bricks', 'Sand', 'Tiles', 'Paint', 'Wood', 'Pipes'];
        const fallbackProducts = [];

        for (let i = 1; i <= 30; i++) {
            const material = materials[i % materials.length];
            const hasDiscount = Math.random() > 0.5;
            fallbackProducts.push({
                id: `fallback-${i}`,
                name: `${material} Premium ${i}`,
                description: `High quality ${material.toLowerCase()} for all construction needs`,
                brand: ["UltraBuild", "ProConstruct", "EliteMaterials"][i % 3],
                price: Math.floor(Math.random() * 900) + 100,
                originalPrice: hasDiscount ? Math.floor(Math.random() * 1200) + 300 : null,
                discount: hasDiscount ? Math.floor(Math.random() * 35) + 10 : 0,
                rating: 3.8 + Math.random() * 1.2,
                category: material,
                images: [fallbackImages[i % fallbackImages.length]],
                image: fallbackImages[i % fallbackImages.length],
                inStock: true
            });
        }
        return fallbackProducts;
    };

    // Skeleton for product sections during loading
    const ProductSectionSkeleton = ({ title = "Loading..." }) => (
        <div className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {Array.from({ length: title.includes("Special") || title.includes("Best") ? 6 : 12 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="aspect-[3/4] bg-gray-200 animate-pulse"></div>
                            <div className="p-3 space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                <div className="flex justify-between items-center">
                                    <div className="h-5 bg-gray-300 rounded animate-pulse w-16"></div>
                                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="absolute top-3 left-3">
                                <div className="h-10 w-10 bg-red-200 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Category Header */}
            <div className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="container mx-auto">
                    <CategoryHeader />
                </div>
            </div>

            {/* Static Sections - Show Immediately */}
            <Hero />
            <CategorySection />
            <BrandsSection />

            <div className="space-y-12 py-8">
             <div className="max-w-7xl mx-auto px-4">
      <HotDeals />
    </div>

             

                {/* Banner */}
                <Banner />

              <div className="max-w-7xl mx-auto px-4">
      
      <TrendingProducts/>    </div>
            </div>


   <AllProductsPage/>
            {/* Optional: Small error notification */}
            {productsError && !productsLoading && (
                <div className="fixed bottom-4 right-4 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
                    <p className="text-sm">⚠️ Products failed to load from server.</p>
                    <p className="text-xs mt-1">Showing sample data instead.</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;