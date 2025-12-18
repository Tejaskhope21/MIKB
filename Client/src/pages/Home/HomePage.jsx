import React, { useState, useEffect } from 'react';
import Hero from "../../components/Hero/Hero";
import CategoryHeader from "../../components/CategorySection/CategoryHeader";
import CategorySection from "../../components/CategorySection/CategorySection";
import BrandsSection from "../../components/Brands/BrandsSection";
import ProductsComponent from "../../components/Products/ProductsComponent";
import { fetchProducts } from '../../services/api';

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Loading your store...</p>
                </div>
            </div>
        );
    }

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
            <div className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="container mx-auto">
                    <CategoryHeader />
                </div>
            </div>

            <Hero />
            <CategorySection />
            <BrandsSection />

            <div className="space-y-12">
                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ProductsComponent title="Featured Products" categoryColor="blue" products={featuredProducts} />
                    </div>
                </section>

                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ProductsComponent title="Best Sellers" categoryColor="red" products={bestSellers} />
                    </div>
                </section>

                <section className="py-12 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ProductsComponent title="Special Offers" categoryColor="orange" products={specialOffers} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;