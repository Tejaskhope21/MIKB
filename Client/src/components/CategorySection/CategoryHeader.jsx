// components/CategoryHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate
import { fetchCategories } from '../../services/api';
import "../../index.css"

const CategoryHeader = () => {
    const [categories, setCategories] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isSubHovered, setIsSubHovered] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Add useNavigate hook

    useEffect(() => {
        fetchCategories()
            .then(data => {
                const enriched = data.map(cat => ({
                    ...cat,
                    id: cat.numericId || cat.id || cat._id
                }));
                setCategories(enriched);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load categories menu');
            });
    }, []);

    // Function to handle category click
    const handleCategoryClick = (categoryId, categoryName) => {
        navigate(`/products/category/${categoryId}`, { 
            state: { categoryName: categoryName }
        });
    };

    // Function to handle subcategory item click
    const handleSubcategoryClick = (categoryId, subcategoryName, categoryName) => {
        navigate(`/products/category/${categoryId}`, { 
            state: { 
                categoryName: categoryName,
                subcategoryName: subcategoryName,
                filter: subcategoryName
            }
        });
    };

    if (error) {
        return <nav className="bg-white shadow-md py-4 text-center text-red-600 text-sm">{error}</nav>;
    }

    return (
        <nav 
            className="relative bg-white shadow-md"
            onMouseLeave={() => !isSubHovered && setHoveredIndex(null)}
        >
            <div className="container mx-auto px-4">
                <div className="flex overflow-x-auto py-3 space-x-1 scrollbar-hide">
                    {categories.map((cat, i) => (
                        <div 
                            key={cat.id} 
                            onMouseEnter={() => setHoveredIndex(i)} 
                            className="relative"
                        >
                            <button 
                                onClick={() => handleCategoryClick(cat.id, cat.name)}
                                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                                    hoveredIndex === i 
                                        ? "text-[#800000] bg-red-50" 
                                        : "text-gray-600 hover:text-[#800000] hover:bg-gray-50"
                                }`}
                            >
                                {cat.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {hoveredIndex !== null && categories[hoveredIndex]?.subcategories?.length > 0 && (
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
                            <h2 className="text-xl font-bold text-gray-800">{categories[hoveredIndex].name}</h2>
                            <Link 
                                to={`/products/category/${categories[hoveredIndex].id}`}
                                state={{ categoryName: categories[hoveredIndex].name }}
                                className="text-[#800000] hover:text-red-700 font-medium flex items-center gap-1"
                            >
                                View All Products →
                            </Link>
                        </div>
                        
                        {/* Scrollable container - scrollbar hidden */}
                        <div 
                            className="overflow-y-auto pr-1 scrollbar-hide"
                            style={{ 
                                maxHeight: "55vh",
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories[hoveredIndex].subcategories.map((group, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
                                            {group.title}
                                        </h3>
                                        <ul 
                                            className="space-y-2 overflow-y-auto scrollbar-hide"
                                            style={{ 
                                                maxHeight: "280px",
                                            }}
                                        >
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
            )}
        </nav>
    );
};

export default CategoryHeader;