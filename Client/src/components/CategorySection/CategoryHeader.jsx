// components/CategoryHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCategories } from '../../services/api';
import "../../index.css";

const CategoryHeader = () => {
    const [categories, setCategories] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isSubHovered, setIsSubHovered] = useState(false);
    const [loading, setLoading] = useState(true);        // New: Loading state
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchCategories();

                const enriched = data.map(cat => ({
                    ...cat,
                    id: cat.numericId || cat.id || cat._id
                }));

                setCategories(enriched);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setError('Failed to load categories');
                // Optional: Set fallback static categories
                setCategories(getFallbackCategories());
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    // Fallback categories in case API fails (good UX)
    const getFallbackCategories = () => [
        { id: 1, name: "Cement", subcategories: [{ title: "Types", items: ["OPC", "PPC", "White Cement"] }] },
        { id: 2, name: "Steel & TMT", subcategories: [{ title: "Grades", items: ["Fe500", "Fe550", "TMT Bars"] }] },
        { id: 3, name: "Bricks & Blocks", subcategories: [{ title: "Materials", items: ["Red Bricks", "Fly Ash", "AAC Blocks"] }] },
        { id: 4, name: "Tiles", subcategories: [{ title: "Types", items: ["Floor", "Wall", "Vitrified"] }] },
        { id: 5, name: "Paints", subcategories: [{ title: "Brands", items: ["Asian Paints", "Berger", "Nerolac"] }] },
        { id: 6, name: "Electrical", subcategories: [{ title: "Products", items: ["Wires", "Switches", "MCB"] }] },
    ];

    const handleCategoryClick = (categoryId, categoryName) => {
        navigate(`/products/category/${categoryId}`, {
            state: { categoryName }
        });
    };

    const handleSubcategoryClick = (categoryId, subcategoryName, categoryName) => {
        navigate(`/products/category/${categoryId}`, {
            state: {
                categoryName,
                subcategoryName,
                filter: subcategoryName
            }
        });
    };

    // Skeleton for main category buttons
    const CategoryButtonsSkeleton = () => (
        <div className="flex overflow-x-auto py-3 space-x-4 scrollbar-hide">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0">
                    <div className="px-6 py-2 bg-gray-200 rounded-md animate-pulse w-28 h-9"></div>
                </div>
            ))}
        </div>
    );

    // Skeleton for mega menu dropdown
    const MegaMenuSkeleton = () => (
        <div className="absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                            <div className="space-y-3">
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <div key={j} className="h-4 w-40 bg-gray-100 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // If error, show minimal fallback with fallback data (no blank menu)
    if (error && categories.length === 0) {
        return (
            <nav className="bg-white shadow-md py-4 text-center">
                <span className="text-orange-600 text-sm">Using sample categories</span>
            </nav>
        );
    }

    return (
        <nav
            className="relative bg-white shadow-md"
            onMouseLeave={() => !isSubHovered && setHoveredIndex(null)}
        >
            <div className="container mx-auto px-4">
                {loading ? (
                    <CategoryButtonsSkeleton />
                ) : (
                    <div className="flex overflow-x-auto py-3 space-x-1 scrollbar-hide">
                        {categories.map((cat, i) => (
                            <div
                                key={cat.id}
                                onMouseEnter={() => setHoveredIndex(i)}
                                className="relative flex-shrink-0"
                            >
                                <button
                                    onClick={() => handleCategoryClick(cat.id, cat.name)}
                                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${hoveredIndex === i
                                            ? "text-[#800000] bg-red-50"
                                            : "text-gray-700 hover:text-[#800000] hover:bg-gray-50"
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Mega Menu Dropdown */}
            {hoveredIndex !== null && (
                <>
                    {loading ? (
                        <MegaMenuSkeleton />
                    ) : categories[hoveredIndex]?.subcategories?.length > 0 ? (
                        <div
                            className="absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
                            onMouseEnter={() => setIsSubHovered(true)}
                            onMouseLeave={() => {
                                setIsSubHovered(false);
                                setHoveredIndex(null);
                            }}
                            style={{
                                top: "100%",
                                maxHeight: "70vh",
                                zIndex: 40,
                            }}
                        >
                            <div className="container mx-auto px-4 py-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {categories[hoveredIndex].name}
                                    </h2>
                                    <Link
                                        to={`/products/category/${categories[hoveredIndex].id}`}
                                        state={{ categoryName: categories[hoveredIndex].name }}
                                        className="text-[#800000] hover:text-red-700 font-medium flex items-center gap-1"
                                    >
                                        View All Products →
                                    </Link>
                                </div>

                                <div
                                    className="overflow-y-auto pr-1 scrollbar-hide"
                                    style={{ maxHeight: "55vh" }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {categories[hoveredIndex].subcategories.map((group, idx) => (
                                            <div key={idx} className="space-y-3">
                                                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
                                                    {group.title}
                                                </h3>
                                                <ul className="space-y-2">
                                                    {group.items.map((item, j) => (
                                                        <li key={j}>
                                                            <button
                                                                onClick={() => handleSubcategoryClick(
                                                                    categories[hoveredIndex].id,
                                                                    item,
                                                                    categories[hoveredIndex].name
                                                                )}
                                                                className="text-gray-600 hover:text-[#800000] hover:underline block py-1 transition-colors w-full text-left"
                                                            >
                                                                {item}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </>
            )}
        </nav>
    );
};

export default CategoryHeader;