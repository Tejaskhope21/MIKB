import React, { useState } from "react";
import { Link } from "react-router-dom";

// Static categories data matching your carousel
const categories = [
    {
        id: 1,
        name: "Cement",
        subcategories: [
            {
                title: "Cement Types",
                items: ["Portland Cement", "White Cement", "Rapid Hardening", "Waterproof Cement"]
            },
            {
                title: "By Brand",
                items: ["UltraTech", "Ambuja", "ACC", "Birla"]
            },
            {
                title: "Accessories",
                items: ["Cement Admixtures", "Waterproofing Compounds", "Plasticizers"]
            }
        ]
    },
    {
        id: 2,
        name: "Brick",
        subcategories: [
            {
                title: "Brick Types",
                items: ["Clay Bricks", "Fly Ash Bricks", "Concrete Blocks", "Hollow Bricks"]
            },
            {
                title: "Special Bricks",
                items: ["Engineering Bricks", "Fire Bricks", "Paver Blocks"]
            },
            {
                title: "By Size",
                items: ["Standard", "Jumbo", "Modular"]
            }
        ]
    },
    {
        id: 3,
        name: "Tiles",
        subcategories: [
            {
                title: "Floor Tiles",
                items: ["Ceramic", "Porcelain", "Vitrified", "Marble"]
            },
            {
                title: "Wall Tiles",
                items: ["Subway Tiles", "Mosaic", "3D Tiles", "Glass Tiles"]
            },
            {
                title: "By Application",
                items: ["Bathroom", "Kitchen", "Living Room", "Outdoor"]
            }
        ]
    },
    {
        id: 4,
        name: "Electricals",
        subcategories: [
            {
                title: "Wiring",
                items: ["Cables & Wires", "Switches & Sockets", "MCB & DB", "Conduits"]
            },
            {
                title: "Accessories",
                items: ["Extension Boards", "Adapters", "Plugs", "Testers"]
            },
            {
                title: "Safety",
                items: ["Earthing Equipment", "Surge Protectors", "Circuit Breakers"]
            }
        ]
    },
    {
        id: 5,
        name: "Power & Hand Tools",
        subcategories: [
            {
                title: "Power Tools",
                items: ["Drill Machines", "Angle Grinders", "Cutting Tools", "Sanders"]
            },
            {
                title: "Hand Tools",
                items: ["Hammers", "Screwdrivers", "Pliers", "Wrenches"]
            },
            {
                title: "Accessories",
                items: ["Drill Bits", "Blades", "Batteries", "Tool Kits"]
            }
        ]
    },
    {
        id: 6,
        name: "Plywood & Laminates",
        subcategories: [
            {
                title: "Plywood",
                items: ["Commercial Ply", "Marine Ply", "Fire Retardant", "BWR Grade"]
            },
            {
                title: "Laminates",
                items: ["Decorative", "Industrial", "Flexible", "Flush Doors"]
            },
            {
                title: "Boards",
                items: ["MDF", "Particle Board", "Block Board", "Veneers"]
            }
        ]
    },
    {
        id: 7,
        name: "Hardware",
        subcategories: [
            {
                title: "Fasteners",
                items: ["Screws", "Nuts & Bolts", "Anchors", "Rivets"]
            },
            {
                title: "Door Hardware",
                items: ["Hinges", "Handles", "Locks", "Door Closers"]
            },
            {
                title: "General Hardware",
                items: ["Chains", "Hooks", "Brackets", "Drawer Slides"]
            }
        ]
    },
    {
        id: 8,
        name: "Paints",
        subcategories: [
            {
                title: "Interior Paints",
                items: ["Emulsion", "Enamel", "Textured", "Primers"]
            },
            {
                title: "Exterior Paints",
                items: ["Weatherproof", "Heat Reflective", "Waterproof", "Texture"]
            },
            {
                title: "Accessories",
                items: ["Brushes", "Rollers", "Thinners", "Putty"]
            }
        ]
    },
    {
        id: 9,
        name: "Lighting & Fans",
        subcategories: [
            {
                title: "Lighting",
                items: ["LED Bulbs", "Tube Lights", "Spotlights", "Decorative"]
            },
            {
                title: "Fans",
                items: ["Ceiling Fans", "Exhaust Fans", "Table Fans", "Wall Fans"]
            },
            {
                title: "Fixtures",
                items: ["Chandeliers", "Pendants", "Wall Lights", "Outdoor"]
            }
        ]
    },
    {
        id: 10,
        name: "Bathroom",
        subcategories: [
            {
                title: "Fittings",
                items: ["Faucets", "Showers", "Mixers", "Accessories"]
            },
            {
                title: "Sanitaryware",
                items: ["Basins", "Toilets", "Urinals", "Bidets"]
            },
            {
                title: "Accessories",
                items: ["Towels Rails", "Soap Dispensers", "Mirrors", "Shelves"]
            }
        ]
    },
    {
        id: 11,
        name: "Plumbing",
        subcategories: [
            {
                title: "Pipes & Fittings",
                items: ["PVC Pipes", "CPVC Pipes", "GI Pipes", "Fittings"]
            },
            {
                title: "Valves",
                items: ["Ball Valves", "Gate Valves", "Check Valves", "Pressure Valves"]
            },
            {
                title: "Tools",
                items: ["Pipe Wrenches", "Cutters", "Threading Tools", "Sealants"]
            }
        ]
    },
    {
        id: 12,
        name: "Kitchen",
        subcategories: [
            {
                title: "Sinks & Faucets",
                items: ["Kitchen Sinks", "Faucets", "Drain Boards", "Accessories"]
            },
            {
                title: "Storage",
                items: ["Cabinets", "Shelves", "Pantry Units", "Organizers"]
            },
            {
                title: "Appliances",
                items: ["Chimneys", "Hobs", "Water Purifiers", "Trash Compactors"]
            }
        ]
    },
    {
        id: 13,
        name: "Doors & Windows",
        subcategories: [
            {
                title: "Doors",
                items: ["Wooden Doors", "Metal Doors", "PVC Doors", "Glass Doors"]
            },
            {
                title: "Windows",
                items: ["Aluminum Windows", "UPVC Windows", "Wooden Windows", "Sliding"]
            },
            {
                title: "Accessories",
                items: ["Handles", "Locks", "Hinges", "Weather Stripping"]
            }
        ]
    },
    {
        id: 14,
        name: "Flooring",
        subcategories: [
            {
                title: "Hard Flooring",
                items: ["Marble", "Granite", "Kota Stone", "Wooden Flooring"]
            },
            {
                title: "Soft Flooring",
                items: ["Carpets", "Vinyl", "Laminate", "Rubber"]
            },
            {
                title: "Accessories",
                items: ["Adhesives", "Underlay", "Trims", "Cleaning"]
            }
        ]
    },
    {
        id: 15,
        name: "Sanitaryware",
        subcategories: [
            {
                title: "Toilet Systems",
                items: ["Western", "Indian", "Wall Hung", "Smart Toilets"]
            },
            {
                title: "Basins",
                items: ["Counter Top", "Wall Hung", "Pedestal", "Semi-recessed"]
            },
            {
                title: "Urinals",
                items: ["Wall Type", "Stall Type", "Waterless", "Sensor"]
            }
        ]
    },
    {
        id: 16,
        name: "Building Materials",
        subcategories: [
            {
                title: "Structural",
                items: ["Steel", "Concrete", "Rebars", "Formwork"]
            },
            {
                title: "Finishing",
                items: ["Gypsum", "POP", "Wall Putty", "Adhesives"]
            },
            {
                title: "Insulation",
                items: ["Thermal", "Acoustic", "Fire", "Vapor Barrier"]
            }
        ]
    },
    {
        id: 17,
        name: "Safety & Security",
        subcategories: [
            {
                title: "Personal Safety",
                items: ["Helmets", "Gloves", "Safety Shoes", "Goggles"]
            },
            {
                title: "Site Safety",
                items: ["Barricades", "Signage", "Fire Extinguishers", "First Aid"]
            },
            {
                title: "Security",
                items: ["CCTV", "Alarms", "Locks", "Access Control"]
            }
        ]
    }
];

const CategoryHeader = () => {
    const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(null);
    const [isSubPanelHovered, setIsSubPanelHovered] = useState(false);

    const handleMouseLeave = () => {
        if (!isSubPanelHovered) {
            setHoveredCategoryIndex(null);
        }
    };

    return (
        <nav
            className="relative bg-white shadow-md z-40"
            onMouseLeave={handleMouseLeave}
            aria-label="Product categories"
        >
            {/* Main Categories Bar */}
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between overflow-x-auto">
                    <div className="flex space-x-1 py-3">
                        {categories.map((category, index) => (
                            <div
                                key={category.id}
                                className="relative"
                                onMouseEnter={() => setHoveredCategoryIndex(index)}
                            >
                                <button
                                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${hoveredCategoryIndex === index
                                        ? "text-[#800000] bg-red-50"
                                        : "text-gray-700 hover:text-[#800000] hover:bg-gray-50"
                                        }`}
                                    aria-haspopup="true"
                                >
                                    {category.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subcategory Mega Menu */}
            {hoveredCategoryIndex !== null && categories[hoveredCategoryIndex] && (
                <div
                    className="absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
                    onMouseEnter={() => setIsSubPanelHovered(true)}
                    onMouseLeave={() => {
                        setIsSubPanelHovered(false);
                        setHoveredCategoryIndex(null);
                    }}
                    style={{ top: "100%" }}
                    aria-label={`Subcategories for ${categories[hoveredCategoryIndex].name}`}
                >
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {categories[hoveredCategoryIndex].name}
                            </h2>
                            <Link
                                to={`/products/category/${categories[hoveredCategoryIndex].id}`}
                                className="text-[#800000] hover:text-red-700 font-medium flex items-center gap-1"
                            >
                                View All Products
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories[hoveredCategoryIndex].subcategories.map((group, idx) => (
                                <div key={idx} className="space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                        {group.title}
                                    </h3>
                                    <ul className="space-y-2">
                                        {group.items.map((item, itemIdx) => (
                                            <li key={itemIdx}>
                                                <Link
                                                    to={`/products/category/${categories[hoveredCategoryIndex].id}`}
                                                    className="text-gray-600 hover:text-[#800000] hover:underline transition-colors block py-1"
                                                >
                                                    {item}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Featured Products Section */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Featured {categories[hoveredCategoryIndex].name} Products
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {categories[hoveredCategoryIndex].subcategories[0].items.slice(0, 4).map((item, idx) => (
                                    <Link
                                        key={idx}
                                        to={`/products/category/${categories[hoveredCategoryIndex].id}`}
                                        className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                                <span className="text-gray-600 text-lg font-bold">
                                                    {item.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="text-gray-700 font-medium">{item}</span>
                                        </div>
                                    </Link>
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