// services/api.js
export const fetchProducts = async () => {
    // Mock data for now
    return new Promise((resolve) => {
        setTimeout(() => {
            const products = Array.from({ length: 30 }, (_, i) => ({
                numericId: `prod-${i + 1}`,
                id: `prod-${i + 1}`,
                name: `Building Material ${i + 1}`,
                description: `High quality construction material ${i + 1}`,
                brand: ['Ambuja', 'ACC', 'Ultratech', 'JSW'][i % 4],
                price: Math.floor(Math.random() * 900) + 100,
                originalPrice: Math.floor(Math.random() * 1200) + 300,
                discount: Math.random() > 0.5 ? Math.floor(Math.random() * 35) + 10 : 0,
                materialType: ['Cement', 'Steel', 'Bricks', 'Paint', 'Tiles', 'Pipes'][i % 6],
                images: [
                    `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&${i}`,
                ],
                inventory: {
                    stock: Math.floor(Math.random() * 100),
                },
            }));
            resolve(products);
        }, 1000);
    });
};

export const searchAutocomplete = async (query, limit = 5) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                products: Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
                    id: `search-${i}`,
                    name: `${query} Product ${i + 1}`,
                    price: Math.floor(Math.random() * 900) + 100,
                    brand: 'Brand',
                    materialType: 'Category',
                })),
                categories: [],
                subcategories: [],
                query: query,
                totalResults: 15,
            });
        }, 500);
    });
};

export const hasSearchResults = (results) => {
    return (
        results &&
        results.success &&
        (results.products.length > 0 ||
            results.categories.length > 0 ||
            results.subcategories.length > 0)
    );
};