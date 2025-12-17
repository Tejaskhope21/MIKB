export const categories = [
    {
        id: 1,
        name: "Cement & Concrete",
        icon: "🏗️",
        description: "High quality construction cement and concrete products",
        color: "blue",
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=400&fit=crop",
        subcategories: [
            { id: 101, name: "OPC Cement" },
            { id: 102, name: "PPC Cement" },
            { id: 103, name: "Ready Mix Concrete" },
            { id: 104, name: "Concrete Blocks" }
        ]
    },
    {
        id: 2,
        name: "Steel & Reinforcement",
        icon: "🛠️",
        description: "TMT bars, structural steel and reinforcement materials",
        color: "gray",
        image: "https://images.unsplash.com/photo-1578102487200-3e8b9c9b0b4e?w=800&h=400&fit=crop",
        subcategories: [
            { id: 201, name: "TMT Bars" },
            { id: 202, name: "Structural Steel" },
            { id: 203, name: "Binding Wire" },
            { id: 204, name: "Welding Electrodes" }
        ]
    },
    {
        id: 3,
        name: "Electricals",
        icon: "⚡",
        description: "Wires, switches, fittings and electrical accessories",
        color: "yellow",
        image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=400&fit=crop",
        subcategories: [
            { id: 301, name: "Wires & Cables" },
            { id: 302, name: "Switches & Sockets" },
            { id: 303, name: "MCB & DB" },
            { id: 304, name: "Conduit Pipes" }
        ]
    },
    {
        id: 4,
        name: "Plumbing & Sanitary",
        icon: "🚰",
        description: "Pipes, fittings, sanitaryware and bathroom accessories",
        color: "cyan",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
        subcategories: [
            { id: 401, name: "PVC Pipes" },
            { id: 402, name: "CP Fittings" },
            { id: 403, name: "Sanitaryware" },
            { id: 404, name: "Bathroom Fittings" }
        ]
    },
    {
        id: 5,
        name: "Bricks & Blocks",
        icon: "🧱",
        description: "Clay bricks, concrete blocks and AAC blocks",
        color: "orange",
        image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=400&fit=crop",
        subcategories: [
            { id: 501, name: "Clay Bricks" },
            { id: 502, name: "Concrete Blocks" },
            { id: 503, name: "AAC Blocks" },
            { id: 504, name: "Fly Ash Bricks" }
        ]
    },
    {
        id: 6,
        name: "Paints & Coatings",
        icon: "🎨",
        description: "Interior, exterior paints and protective coatings",
        color: "purple",
        image: "https://images.unsplash.com/photo-1560072810-1cffb09faf0f?w=800&h=400&fit=crop",
        subcategories: [
            { id: 601, name: "Interior Paints" },
            { id: 602, name: "Exterior Paints" },
            { id: 603, name: "Primers & Putty" },
            { id: 604, name: "Wood Coatings" }
        ]
    },
    {
        id: 7,
        name: "Hardware & Tools",
        icon: "🔧",
        description: "Construction hardware, tools and accessories",
        color: "red",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop",
        subcategories: [
            { id: 701, name: "Hand Tools" },
            { id: 702, name: "Power Tools" },
            { id: 703, name: "Fasteners" },
            { id: 704, name: "Safety Equipment" }
        ]
    },
    {
        id: 8,
        name: "Hot Deals",
        icon: "🔥",
        description: "Special offers, combos and trending deals",
        color: "pink",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop",
        subcategories: [
            { id: 801, name: "Combo Offers" },
            { id: 802, name: "Seasonal Discounts" },
            { id: 803, name: "Bundle Packs" },
            { id: 804, name: "Clearance Sale" }
        ]
    }
];

export const products = [
    // Cement & Concrete Products
    {
        id: 1001,
        name: "UltraTech OPC 53 Grade Cement",
        categoryId: 1,
        subcategoryId: 101,
        brand: "UltraTech",
        price: 420,
        originalPrice: 450,
        unit: "bag",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1598615123852-8c6c243e51e8?w=800&h=600&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1598615123852-8c6c243e51e8?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop"
        ],
        inStock: true,
        minOrder: 10,
        description: "Premium OPC 53 Grade cement for high strength construction. Ideal for all types of construction work including residential, commercial, and industrial projects.",
        detailedDescription: "UltraTech OPC 53 Grade Cement is a high-strength cement that provides excellent durability and structural integrity. It sets quickly and offers superior resistance to cracking and weathering. Perfect for concrete roads, bridges, and high-rise buildings.",
        specs: ["53 Grade", "IS:12269 Certified", "High Strength", "Quick Setting", "Low Heat of Hydration", "Excellent Workability"],
        features: [
            "High compressive strength",
            "Excellent durability",
            "Superior finish",
            "Corrosion resistant",
            "Suitable for all climatic conditions"
        ],
        discount: 7,
        tags: ["best-seller", "premium", "top-rated"],
        warranty: "1 Year",
        deliveryTime: "24-48 hours",
        quantity: 500,
        reviews: [
            { id: 1, user: "Rajesh Kumar", rating: 5, comment: "Excellent quality cement, highly recommended!", date: "2024-01-15" },
            { id: 2, user: "Amit Sharma", rating: 4, comment: "Good cement for construction work.", date: "2024-01-10" }
        ]
    },
    {
        id: 1002,
        name: "ACC PPC Cement",
        categoryId: 1,
        subcategoryId: 102,
        brand: "ACC",
        price: 410,
        unit: "bag",
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop"
        ],
        inStock: true,
        minOrder: 5,
        description: "Portland Pozzolana Cement for all construction needs",
        detailedDescription: "ACC PPC Cement is an eco-friendly cement that offers excellent durability and workability. It generates less heat during hydration and provides superior resistance to chemical attacks.",
        specs: ["PPC Grade", "IS:1489", "Eco Friendly", "Cost Effective"],
        features: [
            "Eco-friendly composition",
            "Reduced heat generation",
            "Excellent workability",
            "Cost-effective"
        ],
        tags: ["eco-friendly"],
        warranty: "6 Months",
        deliveryTime: "24-48 hours",
        quantity: 300
    },
    {
        id: 1003,
        name: "Ready Mix Concrete M25",
        categoryId: 1,
        subcategoryId: 103,
        brand: "RMC",
        price: 4500,
        unit: "cubic meter",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop"
        ],
        inStock: true,
        minOrder: 5,
        description: "Ready to use concrete for quick construction",
        detailedDescription: "Ready Mix Concrete M25 is a pre-mixed concrete solution that ensures consistent quality and saves time on construction sites. Perfect for large-scale projects where time is critical.",
        specs: ["M25 Grade", "Ready to Use", "Time Saving", "Quality Assured"],
        features: [
            "Consistent quality",
            "Time-saving",
            "Labor efficient",
            "Customizable mix designs"
        ],
        tags: ["ready-to-use", "time-saving"],
        deliveryTime: "Same day delivery",
        quantity: 100
    },

    // Steel & Reinforcement Products
    {
        id: 2001,
        name: "JSW TMT Bars Fe 500D",
        categoryId: 2,
        subcategoryId: 201,
        brand: "JSW",
        price: 65,
        unit: "kg",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1578102487200-3e8b9c9b0b4e?w=800&h=600&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1578102487200-3e8b9c9b0b4e?w=800&h=600&fit=crop"
        ],
        inStock: true,
        minOrder: 100,
        description: "High strength TMT bars for structural reinforcement",
        detailedDescription: "JSW TMT Bars Fe 500D offer superior strength and ductility, making them ideal for earthquake-resistant structures. They provide excellent bonding with concrete and are corrosion resistant.",
        specs: ["Fe 500D", "IS 1786", "Earthquake Resistant", "Corrosion Resistant"],
        features: [
            "High tensile strength",
            "Earthquake resistant",
            "Excellent bendability",
            "Superior weldability"
        ],
        tags: ["earthquake-resistant", "premium"],
        warranty: "Lifetime structural warranty",
        deliveryTime: "48-72 hours",
        quantity: 1000
    },
    {
        id: 2002,
        name: "SAIL Structural Steel",
        categoryId: 2,
        subcategoryId: 202,
        brand: "SAIL",
        price: 58,
        unit: "kg",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop"
        ],
        inStock: true,
        minOrder: 50,
        description: "Government certified structural steel sections",
        detailedDescription: "SAIL Structural Steel is manufactured under strict quality control measures and is certified by government authorities. Ideal for industrial structures, bridges, and heavy construction.",
        specs: ["IS 2062", "Structural Grade", "High Yield", "Durable"],
        features: [
            "Government certified",
            "High yield strength",
            "Uniform quality",
            "Easy fabrication"
        ],
        tags: ["government-certified"],
        warranty: "2 Years",
        deliveryTime: "3-5 days",
        quantity: 500
    },

    // Electrical Products
    {
        id: 3001,
        name: "Havells FR PVC Copper Wire",
        categoryId: 3,
        subcategoryId: 301,
        brand: "Havells",
        price: 850,
        unit: "coil",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop"
        ],
        inStock: true,
        minOrder: 1,
        description: "Fire retardant PVC insulated copper wires",
        detailedDescription: "Havells FR PVC Copper Wires are designed with fire-retardant insulation that prevents fire propagation. They offer excellent conductivity and are suitable for both residential and commercial wiring.",
        specs: ["1.5 sqmm", "90m Length", "Fire Retardant", "ISI Marked"],
        features: [
            "Fire retardant insulation",
            "High conductivity",
            "Durable PVC coating",
            "ISI certified"
        ],
        tags: ["fire-retardant", "best-seller"],
        warranty: "10 Years",
        deliveryTime: "24 hours",
        quantity: 200
    },
    {
        id: 3002,
        name: "Anchor Modular Switches",
        categoryId: 3,
        subcategoryId: 302,
        brand: "Anchor",
        price: 120,
        originalPrice: 150,
        unit: "piece",
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop"
        ],
        inStock: true,
        minOrder: 10,
        description: "Elegant modular switches with modern design",
        detailedDescription: "Anchor Modular Switches combine elegant design with superior functionality. They feature smooth operation, child safety shutters, and are available in various colors to match your interior.",
        specs: ["6A 250V", "Modular Design", "White Finish", "1 Year Warranty"],
        features: [
            "Modern design",
            "Child safety shutters",
            "Easy installation",
            "Multiple color options"
        ],
        discount: 20,
        tags: ["modern-design"],
        warranty: "1 Year",
        deliveryTime: "24 hours",
        quantity: 1000
    }
];