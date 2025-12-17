import Hero from "../../components/Hero/Hero";
import CategoryHeader from "../../components/CategorySection/CategoryHeader"; // Import the new CategoryHeader
import CategorySection from "../../components/CategorySection/CategorySection";
import BrandsSection from "../../components/Brands/BrandsSection";
import ProductsComponent from "../../components/Products/ProductsComponent";
import { products, categories as categoryData } from "../../data/buildersmartData";

const HomePage = () => {
    // Transform your product data to match ProductsComponent format
    const featuredProducts = products.map(product => {
        const category = categoryData.find(c => c.id === product.categoryId);
        const subcategory = category?.subcategories?.find(s => s.id === product.subcategoryId);

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            brand: product.brand,
            category: category?.name || `Category ${product.categoryId}`,
            subcategory: subcategory?.name || `Subcategory ${product.subcategoryId}`,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            rating: product.rating || 4.0,
            unit: product.unit || "piece",
            inStock: product.inStock !== false,
            image: product.image
        }
    });

    return (
        <div className="min-h-screen">

            {/* Category Header (Static Categories Bar) */}
            <div className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="container mx-auto">
                    <CategoryHeader />
                </div>
            </div>
            {/* Hero Section */}
            <Hero />



            {/* Category Cards/Grid Section */}
            <CategorySection />

            {/* Brands Section */}
            <BrandsSection />

            {/* All products sections at the bottom */}
            <div className="space-y-12">
                {/* Featured Products */}
                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ProductsComponent
                            title="Featured Products"
                            showFilters={true}
                            categoryColor="blue"
                            products={featuredProducts}
                        />
                    </div>
                </section>

                {/* Best Sellers */}
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ProductsComponent
                            title="Best Sellers"
                            showFilters={false}
                            categoryColor="red"
                            products={featuredProducts.filter(p => p.rating >= 4.5).slice(0, 6)}
                        />
                    </div>
                </section>

                {/* Special Offers */}
                <section className="py-12 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ProductsComponent
                            title="Special Offers"
                            showFilters={false}
                            categoryColor="orange"
                            products={featuredProducts.filter(p => p.discount > 0).slice(0, 6)}
                        />
                    </div>
                </section>
            </div>
        </div>
    )
}

export default HomePage;