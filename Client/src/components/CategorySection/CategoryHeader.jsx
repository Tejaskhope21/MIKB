// components/CategoryHeader.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCategories } from '../../services/api';
import "../../index.css"

const CategoryHeader = () => {
    const [categories, setCategories] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isSubHovered, setIsSubHovered] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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

    // Function to handle category click (goes to category page with all subcategories)
    const handleCategoryClick = (categoryId, categoryName) => {
        navigate(`/category/${categoryId}`, { 
            state: { categoryName: categoryName }
        });
    };

    // Function to handle subcategory click (goes to category page with subcategory pre-filtered)
    const handleSubcategoryClick = (categoryId, subcategoryTitle, subcategoryId, categoryName) => {
        // Navigate to the category page with the subcategory pre-selected
        navigate(`/category/${categoryId}`, { 
            state: { 
                categoryName: categoryName,
                subcategoryName: subcategoryTitle,
                subcategoryId: subcategoryId
            }
        });
    };

    // Extract all subcategories with their IDs
    const getAllSubcategories = (category) => {
        if (!category.subcategories || !Array.isArray(category.subcategories)) {
            return [];
        }
        
        const allSubcategories = [];
        
        category.subcategories.forEach(subcat => {
            // If the subcategory has a title and ID, add it
            if (subcat.title && subcat._id) {
                allSubcategories.push({
                    title: subcat.title,
                    id: subcat._id,
                    numericId: subcat.numericId
                });
            }
            
            // Also check if there are items that should be treated as subcategories
            if (subcat.items && Array.isArray(subcat.items)) {
                subcat.items.forEach(item => {
                    // For items without specific IDs, use a generated ID
                    allSubcategories.push({
                        title: item,
                        id: `item-${item.toLowerCase().replace(/\s+/g, '-')}`,
                        numericId: null
                    });
                });
            }
        });
        
        return allSubcategories;
    };

    if (error) {
        return <nav className="bg-white shadow-md py-4 text-center text-red-600 text-sm">{error}</nav>;
    }

    return (
        <nav 
            className="relative bg-white shadow-md"
            onMouseLeave={() => !isSubHovered && setHoveredIndex(null)}
        >
            {/* Main Categories Header */}
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

            {/* 4-Column Subcategories Dropdown */}
            {hoveredIndex !== null && categories[hoveredIndex]?.subcategories?.length > 0 && (
                <div
                    className="absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
                    onMouseEnter={() => setIsSubHovered(true)}
                    onMouseLeave={() => { 
                        setIsSubHovered(false); 
                        setHoveredIndex(null); 
                    }}
                    style={{ 
                        top: "100%",
                    }}
                >
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {categories[hoveredIndex].name}
                            </h2>
                            {/* <Link 
                                to={`/category/${categories[hoveredIndex].id}`}
                                state={{ categoryName: categories[hoveredIndex].name }}
                                className="text-[#800000] hover:text-red-700 font-medium text-sm flex items-center gap-1 border border-[#800000] px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                            >
                                View All Categories
                                <span className="ml-1">→</span>
                            </Link> */}
                        </div>
                        
                        {/* 4-Column Grid Subcategories */}
                        <div className="max-h-[30vh] overflow-y-auto pr-2 scrollbar-hide">
                            <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                                {getAllSubcategories(categories[hoveredIndex]).map((subcategory, index) => (
                                    <div key={subcategory.id} className="w-full">
                                        <button
                                            onClick={() => handleSubcategoryClick(
                                                categories[hoveredIndex].id, 
                                                subcategory.title,
                                                subcategory.id,
                                                categories[hoveredIndex].name
                                            )}
                                            className="w-full text-left px-3 py-2.5 text-gray-700 hover:text-[#800000] hover:bg-gray-50 rounded-md transition-colors duration-150 group"
                                        >
                                            <div className="flex items-center">
                                                <span className="font-medium text-sm group-hover:font-semibold transition-all">
                                                    {subcategory.title}
                                                </span>
                                                <span className="ml-2 text-xs text-gray-400 group-hover:text-[#800000] opacity-0 group-hover:opacity-100 transition-opacity">
                                                    →
                                                </span>
                                            </div>
                                            {subcategory.description && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {subcategory.description}
                                                </p>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Display count of subcategories */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                                Showing {getAllSubcategories(categories[hoveredIndex]).length} subcategories
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default CategoryHeader;