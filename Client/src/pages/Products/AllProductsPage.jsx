import React from 'react';
import ProductsComponent from "../../components/Products/ProductsComponent";
import { products, categories as categoryData } from '../../data/buildersmartData';

const AllProductsPage = () => {
    // Transform product data
    const allProducts = products.map(product => {
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
        };
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ProductsComponent
                    title="All Products"
                    showFilters={true}
                    products={allProducts}
                />
            </div>
        </div>
    );
};

export default AllProductsPage;