// src/Pages/Seller/AddSingleCatalog.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Construction Material Categories
const mainCategoryData = [
  { title: "Aggregates & Sand", slug: "aggregates-sand" },
  { title: "Cement & Binding Materials", slug: "cement-binding-materials" },
  { title: "Bricks & Blocks", slug: "bricks-blocks" },
  { title: "Steel & Metal", slug: "steel-metal" },
  { title: "TMT Bars", slug: "tmt-bars" },
  { title: "Mild Steel Bars", slug: "mild-steel-bars" },
  { title: "Wood & Formwork", slug: "wood-formwork" },
  { title: "Plywood", slug: "plywood" },
  { title: "Roofing & Waterproofing", slug: "roofing-waterproofing" },
  { title: "Roofing Sheets", slug: "roofing-sheets" },
  { title: "Sanitaryware", slug: "sanitaryware" },
  { title: "Bathroom Fittings", slug: "bathroom-fittings" },
  { title: "Plumbing Materials", slug: "plumbing-materials" },
  { title: "Wiring & Cables", slug: "wiring-cables" },
  { title: "Switches & Sockets", slug: "switches-sockets" },
  { title: "Electrical Accessories", slug: "electrical-accessories" },
  { title: "Lighting", slug: "lighting" },
  { title: "Fans & Appliances", slug: "fans-appliances" },
  { title: "Floor Tiles", slug: "floor-tiles" },
  { title: "Wall Tiles", slug: "wall-tiles" },
  { title: "Natural Stones", slug: "natural-stones" },
  { title: "Marble", slug: "marble" },
  { title: "Granite", slug: "granite" },
  { title: "Paints & Coatings", slug: "paints-coatings" },
  { title: "Hardware & Fasteners", slug: "hardware-fasteners" },
  { title: "Safety & Security", slug: "safety-security" },
  { title: "Tools & Equipment", slug: "tools-equipment" },
  { title: "Doors & Windows", slug: "doors-windows" },
  { title: "Kitchen Materials", slug: "kitchen-materials" },
];

// Sub-categories
const subCategoryData = {
  "Aggregates & Sand": ["River Sand", "M Sand", "Coarse Aggregates", "Fine Aggregates"],
  "Cement & Binding Materials": ["Portland Cement", "PPC Cement", "White Cement", "Ready Mix Concrete"],
  "Bricks & Blocks": ["Clay Bricks", "Fly Ash Bricks", "Concrete Blocks", "AAC Blocks"],
  "Steel & Metal": ["Structural Steel", "MS Plates", "MS Angles", "MS Channels"],
  "TMT Bars": ["Fe 500", "Fe 500D", "Fe 550", "Fe 600"],
  "Mild Steel Bars": ["Round Bars", "Square Bars", "Flat Bars", "MS Rounds"],
  "Wood & Formwork": ["Timber Wood", "Hardwood", "Softwood", "Shuttering Materials"],
  "Plywood": ["Commercial Plywood", "Marine Plywood", "Fire Retardant Plywood", "BWR Plywood"],
  "Roofing & Waterproofing": ["GI Sheets", "Color Coated Sheets", "Bitumen Sheets", "Waterproofing Membrane"],
  "Roofing Sheets": ["GI Corrugated Sheets", "Color Coated Sheets", "Galvalume Sheets", "Polycarbonate Sheets"],
  "Sanitaryware": ["Western Toilets", "Indian Toilets", "Wash Basins", "Urinals"],
  "Bathroom Fittings": ["Faucets / Taps", "Shower Sets", "Health Faucets", "Angle Valves"],
  "Plumbing Materials": ["PVC Pipes", "CPVC Pipes", "UPVC Pipes", "GI Pipes"],
  "Wiring & Cables": ["PVC Cables", "Copper Wires", "Armored Cables", "Flexible Cables"],
  "Switches & Sockets": ["Modular Switches", "Socket Outlets", "Dimmer Switches", "Bell Push Switches"],
  "Electrical Accessories": ["MCB", "RCCB", "Distribution Boards", "Conduits"],
  "Lighting": ["LED Lights", "Tube Lights", "Panel Lights", "Downlights"],
  "Fans & Appliances": ["Ceiling Fans", "Exhaust Fans", "Wall Fans", "Water Heaters"],
  "Floor Tiles": ["Vitrified Tiles", "Ceramic Tiles", "Porcelain Tiles", "Anti-skid Tiles"],
  "Wall Tiles": ["Ceramic Wall Tiles", "Glazed Tiles", "Subway Tiles", "Mosaic Tiles"],
  "Natural Stones": ["Granite Slabs", "Marble Slabs", "Kota Stone", "Slate Stone"],
  "Marble": ["Indian Marble", "Italian Marble", "Makrana Marble", "Marble Tiles"],
  "Granite": ["Black Galaxy Granite", "Absolute Black Granite", "Tan Brown Granite", "Granite Tiles"],
  "Paints & Coatings": ["Emulsion Paint", "Enamel Paint", "Distemper", "Primer"],
  "Hardware & Fasteners": ["Nails", "Screws", "Bolts & Nuts", "Hinges"],
  "Safety & Security": ["Safety Helmets", "Safety Shoes", "Gloves", "CCTV Cameras"],
  "Tools & Equipment": ["Power Tools", "Hand Tools", "Measuring Tools", "Drilling Machines"],
  "Doors & Windows": ["Main Doors", "Internal Doors", "Windows", "Shutters"],
  "Kitchen Materials": ["Kitchen Sinks", "Kitchen Faucets", "Kitchen Cabinets", "Countertops"],
};

// Field options
const fieldOptions = {
  brand: ["Ambuja Cement", "ACC", "CERA", "Dalmia", "Finolex", "Havells", "Jaquar", "KEL", "Legrand", "Nippon Paint", "Panasonic", "TATA", "V-GUARD", "Wipro"],
  material: ["Steel", "Concrete", "Wood", "Plastic", "Ceramic", "Glass", "Fiber", "Aluminum", "Copper"],
  color: ["White", "Black", "Grey", "Brown", "Beige", "Red", "Blue", "Green", "Yellow", "Multicolor"],
  thickness: ["1mm", "2mm", "3mm", "4mm", "5mm", "6mm", "8mm", "10mm", "12mm", "16mm"],
  length: ["6 feet", "8 feet", "10 feet", "12 feet", "Custom"],
  diameter: ["6mm", "8mm", "10mm", "12mm", "16mm", "20mm", "25mm", "32mm"],
  grade: ["A", "B", "C", "Premium", "Standard", "Commercial", "Industrial"],
  finish: ["Matte", "Glossy", "Semi-Gloss", "Textured", "Polished", "Brushed", "Anodized"],
  capacity: ["1L", "5L", "10L", "20L", "50L", "100L"],
  powerRating: ["100W", "500W", "1000W", "1500W", "2000W", "3000W"],
  voltage: ["110V", "220V", "240V", "440V"],
  certification: ["ISI", "BIS", "ISO", "CE", "UL", "RoHS"],
  packaging: ["Bag", "Box", "Bundle", "Roll", "Sheet", "Piece", "Pallet"],
  gst: ["5%", "12%", "18%", "28%"],
  countryOrigin: ["India", "China", "USA", "Germany", "Japan", "Italy", "Spain"],
};

const AddSingleCatalog = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Get seller info from localStorage
  const [sellerInfo, setSellerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    businessName: "",
    sellerId: ""
  });

  useEffect(() => {
    // Get seller info from localStorage
    const sellerSession = localStorage.getItem("sellerSession");
    if (sellerSession) {
      try {
        const parsedSession = JSON.parse(sellerSession);
        if (parsedSession.seller) {
          setSellerInfo({
            name: parsedSession.seller.name || "Demo Seller",
            phone: parsedSession.seller.phone || "+91 9876543210",
            email: parsedSession.seller.email || "demo@brickskart.com",
            businessName: parsedSession.seller.businessName || "Demo Construction Supplier",
            sellerId: parsedSession.seller.sellerId || "SELLER-" + Date.now()
          });
        }
      } catch (error) {
        console.error("Error parsing seller session:", error);
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    products: [
      {
        productName: "",
        gst: "",
        hsnCode: "",
        netWeight: "",
        mrp: "",
        sellingPrice: "",
        stockQuantity: "",
        manufacturerName: "",
        manufacturerAddress: "",
        manufacturerPincode: "",
        countryOrigin: "",
        description: "",
        brand: "",
        material: "",
        color: "",
        thickness: "",
        length: "",
        diameter: "",
        grade: "",
        finish: "",
        images: [],
        sellerName: "",
        sellerPhone: "",
        sellerEmail: "",
        sellerId: "",
        businessName: "",
        status: "active",
        rating: 0,
        reviews: 0,
        soldCount: 0
      },
    ],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [dropdownSearch, setDropdownSearch] = useState({});
  const [showDropdown, setShowDropdown] = useState({});
  const fileInputRefs = useRef([]);

  // Reset fileInputRefs when products change
  useEffect(() => {
    fileInputRefs.current = formData.products.map(() => null);
  }, [formData.products.length]);

  // Populate seller info when product is added
  useEffect(() => {
    const products = [...formData.products];
    products.forEach((product, index) => {
      products[index] = {
        ...product,
        sellerName: sellerInfo.name,
        sellerPhone: sellerInfo.phone,
        sellerEmail: sellerInfo.email,
        sellerId: sellerInfo.sellerId,
        businessName: sellerInfo.businessName
      };
    });
    setFormData({ ...formData, products });
  }, [sellerInfo]);

  // Get current category configuration
  const getCategoryConfig = () => {
    if (!formData.category) return null;
    
    const categoryFields = {
      "Aggregates & Sand": ["brand", "material", "grade", "packaging"],
      "Cement & Binding Materials": ["brand", "grade", "packaging", "certification"],
      "Bricks & Blocks": ["brand", "material", "grade", "packaging"],
      "Steel & Metal": ["brand", "material", "grade", "thickness", "length"],
      "TMT Bars": ["brand", "grade", "diameter", "length"],
      "Mild Steel Bars": ["brand", "grade", "diameter", "length"],
      "Plywood": ["brand", "material", "thickness", "grade"],
      "Sanitaryware": ["brand", "material", "color", "capacity"],
      "Bathroom Fittings": ["brand", "material", "finish"],
      "Plumbing Materials": ["brand", "material", "diameter", "length"],
      "Floor Tiles": ["brand", "material", "color", "finish", "grade"],
      "Wall Tiles": ["brand", "material", "color", "finish"],
      "Paints & Coatings": ["brand", "color", "capacity", "finish"],
      "default": ["brand", "material", "description"]
    };
    
    return categoryFields[formData.category] || categoryFields.default;
  };

  // Handle search for category
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term.length > 1) {
      const results = [];
      
      mainCategoryData.forEach((category) => {
        if (category.title.toLowerCase().includes(term)) {
          results.push(category.title);
        }
      });
      
      Object.entries(subCategoryData).forEach(([mainCat, subCats]) => {
        subCats.forEach((subCat) => {
          if (subCat.toLowerCase().includes(term)) {
            results.push(`${mainCat} > ${subCat}`);
          }
        });
      });
      
      setFilteredCategories([...new Set(results.slice(0, 15))]);
    } else {
      setFilteredCategories([]);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryPath) => {
    const parts = categoryPath.split(" > ");
    if (parts.length === 1) {
      setFormData({
        ...formData,
        category: parts[0],
        subCategory: "",
      });
    } else if (parts.length === 2) {
      setFormData({
        ...formData,
        category: parts[0],
        subCategory: parts[1],
      });
    }
    setSearchTerm("");
    setFilteredCategories([]);
  };

  // Handle input changes
  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const products = [...formData.products];
    products[index][name] = value;
    setFormData({ ...formData, products });
    if (errors[`products.${index}.${name}`]) {
      const newErrors = { ...errors };
      delete newErrors[`products.${index}.${name}`];
      setErrors(newErrors);
    }
  };

  // Handle dropdown selection
  const handleDropdownSelect = (field, value, index) => {
    const products = [...formData.products];
    products[index][field] = value;
    setFormData({ ...formData, products });
    setShowDropdown({ ...showDropdown, [`${field}-${index}`]: false });
    setDropdownSearch({ ...dropdownSearch, [`${field}-${index}`]: "" });
    if (errors[`products.${index}.${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`products.${index}.${field}`];
      setErrors(newErrors);
    }
  };

  // Add a new product
  const addProduct = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          productName: "",
          gst: "",
          hsnCode: "",
          netWeight: "",
          mrp: "",
          sellingPrice: "",
          stockQuantity: "",
          manufacturerName: "",
          manufacturerAddress: "",
          manufacturerPincode: "",
          countryOrigin: "",
          description: "",
          brand: "",
          material: "",
          color: "",
          thickness: "",
          length: "",
          diameter: "",
          grade: "",
          finish: "",
          images: [],
          sellerName: sellerInfo.name,
          sellerPhone: sellerInfo.phone,
          sellerEmail: sellerInfo.email,
          sellerId: sellerInfo.sellerId,
          businessName: sellerInfo.businessName,
          status: "active",
          rating: 0,
          reviews: 0,
          soldCount: 0
        },
      ],
    });
  };

  // Remove a product
  const removeProduct = (index) => {
    const products = [...formData.products];
    products.splice(index, 1);
    setFormData({ ...formData, products });
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.startsWith(`products.${index}.`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  // Handle image upload
  const handleImageUpload = (e, index) => {
    const files = Array.from(e.target.files);
    const products = [...formData.products];
    if (products[index].images.length + files.length > 5) {
      toast.error("Cannot upload more than 5 images per product");
      return;
    }
    const validFiles = files.filter((file) => {
      if (!file.type.match("image.*")) {
        toast.error("Only image files are allowed");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return false;
      }
      return true;
    });
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        products[index].images = [
          ...products[index].images,
          {
            file: file,
            preview: e.target.result,
            name: file.name,
            size: file.size
          },
        ];
        setFormData({ ...formData, products });
        if (errors[`products.${index}.images`]) {
          const newErrors = { ...errors };
          delete newErrors[`products.${index}.images`];
          setErrors(newErrors);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove an image
  const removeImage = (productIndex, imageIndex) => {
    const products = [...formData.products];
    products[productIndex].images.splice(imageIndex, 1);
    setFormData({ ...formData, products });
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    const categoryConfig = getCategoryConfig();
    
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.subCategory)
      newErrors.subCategory = "Sub-category is required";
    
    formData.products.forEach((product, index) => {
      if (!product.productName)
        newErrors[`products.${index}.productName`] = "Product name is required";
      if (!product.mrp) newErrors[`products.${index}.mrp`] = "MRP is required";
      if (!product.sellingPrice)
        newErrors[`products.${index}.sellingPrice`] =
          "Selling price is required";
      if (!product.stockQuantity)
        newErrors[`products.${index}.stockQuantity`] =
          "Stock quantity is required";
      if (product.images.length === 0)
        newErrors[`products.${index}.images`] =
          "At least one image is required";
      if (
        product.mrp &&
        product.sellingPrice &&
        parseFloat(product.sellingPrice) > parseFloat(product.mrp)
      ) {
        newErrors[`products.${index}.sellingPrice`] =
          "Selling price cannot be greater than MRP";
      }
      
      if (categoryConfig) {
        categoryConfig.forEach((field) => {
          if (!product[field] && fieldOptions[field]?.length) {
            newErrors[`products.${index}.${field}`] = `${
              field.charAt(0).toUpperCase() +
              field
                .slice(1)
                .replace(/([A-Z])/g, " $1")
                .trim()
            } is required`;
          }
        });
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (Static version)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get existing products from localStorage
      const existingProducts = JSON.parse(localStorage.getItem("sellerProducts") || "[]");
      
      // Generate unique IDs for new products
      const newProducts = formData.products.map((product, index) => {
        const productId = `PROD-${Date.now()}-${index}`;
        return {
          id: productId,
          category: formData.category,
          subCategory: formData.subCategory,
          details: {
            ...product,
            images: product.images.map(img => ({
              preview: img.preview,
              name: img.name,
              size: img.size
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            rating: Math.random() * 2 + 3, // Random rating 3-5
            reviews: Math.floor(Math.random() * 100),
            soldCount: Math.floor(Math.random() * 50),
            views: Math.floor(Math.random() * 1000),
            isFeatured: Math.random() > 0.7
          },
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });
      
      // Save to localStorage
      localStorage.setItem("sellerProducts", JSON.stringify([...existingProducts, ...newProducts]));
      
      toast.success(`${newProducts.length} product(s) added successfully!`);
      
      // Reset form
      setFormData({
        category: "",
        subCategory: "",
        products: [
          {
            productName: "",
            gst: "",
            hsnCode: "",
            netWeight: "",
            mrp: "",
            sellingPrice: "",
            stockQuantity: "",
            manufacturerName: "",
            manufacturerAddress: "",
            manufacturerPincode: "",
            countryOrigin: "",
            description: "",
            brand: "",
            material: "",
            color: "",
            thickness: "",
            length: "",
            diameter: "",
            grade: "",
            finish: "",
            images: [],
            sellerName: sellerInfo.name,
            sellerPhone: sellerInfo.phone,
            sellerEmail: sellerInfo.email,
            sellerId: sellerInfo.sellerId,
            businessName: sellerInfo.businessName,
            status: "active",
            rating: 0,
            reviews: 0,
            soldCount: 0
          },
        ],
      });
      setStep(1);
      
      // Redirect to seller's product catalog page
      setTimeout(() => {
        navigate("/seller/my-products");
      }, 1000);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render field based on type
  const renderField = (field, index) => {
    const product = formData.products[index];
    const value = product[field] || "";
    const error = errors[`products.${index}.${field}`];
    
    switch (field) {
      case "brand":
      case "material":
      case "color":
      case "gst":
      case "countryOrigin":
      case "thickness":
      case "length":
      case "diameter":
      case "grade":
      case "finish":
      case "packaging":
      case "certification":
        return (
          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.charAt(0).toUpperCase() +
                field
                  .slice(1)
                  .replace(/([A-Z])/g, " $1")
                  .trim()}{" "}
              *
            </label>
            <div className="relative">
              <input
                type="text"
                value={value}
                onClick={() =>
                  setShowDropdown({
                    ...showDropdown,
                    [`${field}-${index}`]: true,
                  })
                }
                className={`border ${
                  error ? "border-red-500" : "border-gray-300"
                } p-3 w-full rounded-lg text-sm focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24] transition-colors`}
                name={field}
                readOnly
                placeholder={`Select ${field
                  .replace(/([A-Z])/g, " $1")
                  .trim()}`}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              {showDropdown[`${field}-${index}`] && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder={`Search ${field}...`}
                      value={dropdownSearch[`${field}-${index}`] || ""}
                      onChange={(e) =>
                        setDropdownSearch({
                          ...dropdownSearch,
                          [`${field}-${index}`]: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24]"
                      autoFocus
                    />
                  </div>
                  <div className="dropdown-options max-h-48 overflow-y-auto">
                    {fieldOptions[field]
                      ?.filter((option) =>
                        option
                          .toLowerCase()
                          .includes(
                            (
                              dropdownSearch[`${field}-${index}`] || ""
                            ).toLowerCase()
                          )
                      )
                      .map((option) => (
                        <div
                          key={option}
                          className={`p-3 text-sm cursor-pointer transition-colors ${
                            value === option
                              ? "bg-[#FB8B24] text-white"
                              : "hover:bg-[#FB8B24] hover:bg-opacity-10"
                          }`}
                          onClick={() =>
                            handleDropdownSelect(field, option, index)
                          }
                        >
                          {option}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "mrp":
      case "sellingPrice":
      case "stockQuantity":
      case "netWeight":
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field === "mrp"
                ? "MRP (₹)"
                : field === "sellingPrice"
                ? "Selling Price (₹)"
                : field === "stockQuantity"
                ? "Stock Quantity"
                : "Net Weight (kg)"}{" "}
              *
            </label>
            <input
              type="number"
              name={field}
              value={value}
              onChange={(e) => handleChange(e, index)}
              className={`border ${
                error ? "border-red-500" : "border-gray-300"
              } p-3 w-full rounded-lg text-sm focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24] transition-colors`}
              required
              placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim()}`}
              min="0"
              step={field === "netWeight" || field.includes("Price") ? "0.01" : "1"}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      case "description":
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name={field}
              value={value}
              onChange={(e) => handleChange(e, index)}
              className={`border ${
                error ? "border-red-500" : "border-gray-300"
              } p-3 w-full rounded-lg text-sm focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24] transition-colors`}
              rows="4"
              required
              placeholder="Describe the product features, specifications, and benefits..."
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      default:
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field === "productName"
                ? "Product Name *"
                : field === "hsnCode"
                ? "HSN Code"
                : field.charAt(0).toUpperCase() +
                  field
                    .slice(1)
                    .replace(/([A-Z])/g, " $1")
                    .trim()}{" "}
            </label>
            <input
              type="text"
              name={field}
              value={value}
              onChange={(e) => handleChange(e, index)}
              className={`border ${
                error ? "border-red-500" : "border-gray-300"
              } p-3 w-full rounded-lg text-sm focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24] transition-colors`}
              required={field === "productName"}
              placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim()}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-[#E36414]">Add New Product</h1>
            <Link 
              to="/seller/my-products" 
              className="text-[#FB8B24] hover:text-[#E36414] font-medium"
            >
              ← Back to My Products
            </Link>
          </div>
          <p className="text-gray-600">Add your construction materials to the marketplace</p>
        </div>

        {/* Progress Steps */}
        <div className="flex mb-8 space-x-4">
          <div
            className={`flex-1 text-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
              step === 1
                ? "bg-[#FB8B24] text-white shadow-md"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            1. Select Category
          </div>
          <div
            className={`flex-1 text-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
              step === 2
                ? "bg-[#FB8B24] text-white shadow-md"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            2. Add Product Details
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
        >
          {step === 1 && (
            <div className="fade-in">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Select Construction Material Category
              </h2>
              
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Category
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search for categories (e.g., Cement, Tiles, Plumbing)..."
                  className={`border ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  } p-3 w-full rounded-lg text-sm focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24] transition-colors`}
                />
                {filteredCategories.length > 0 && (
                  <div className="mt-2 border rounded-lg bg-white shadow-lg z-20 absolute w-full max-w-2xl">
                    {filteredCategories.map((category, idx) => (
                      <div
                        key={idx}
                        className="p-3 hover:bg-[#FB8B24] hover:text-white cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors text-sm"
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        subCategory: "",
                      })
                    }
                    className={`border ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    } p-3 w-full rounded-lg text-sm focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24] transition-colors`}
                  >
                    <option value="">Select Main Category</option>
                    {mainCategoryData.map((category) => (
                      <option key={category.title} value={category.title}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                  )}
                </div>
                {formData.category && subCategoryData[formData.category] && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Category *
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subCategory: e.target.value,
                        })
                      }
                      className={`border ${
                        errors.subCategory ? "border-red-500" : "border-gray-300"
                      } p-3 w-full rounded-lg text-sm focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24] transition-colors`}
                    >
                      <option value="">Select Sub Category</option>
                      {subCategoryData[formData.category]?.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                    {errors.subCategory && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.subCategory}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Selected: {formData.category} {formData.subCategory && ">"}{" "}
                  {formData.subCategory}
                </span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.category || !formData.subCategory}
                  className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                    !formData.category || !formData.subCategory
                      ? "bg-gray-300 cursor-not-allowed text-gray-500"
                      : "bg-[#FB8B24] hover:bg-[#E36414] text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Add Product Details
              </h2>
              
              <div className="mb-6 p-4 bg-[#FB8B24] bg-opacity-10 rounded-lg border-l-4 border-[#FB8B24]">
                <span className="font-medium text-[#FB8B24]">
                  Selected Category:
                </span>{" "}
                {formData.category} &gt; {formData.subCategory}
              </div>

              {formData.products.map((product, index) => {
                const categoryConfig = getCategoryConfig();
                const commonFields = [
                  "productName",
                  "gst",
                  "hsnCode",
                  "netWeight",
                  "mrp",
                  "sellingPrice",
                  "stockQuantity",
                  "manufacturerName",
                  "manufacturerAddress",
                  "manufacturerPincode",
                  "countryOrigin",
                  "description"
                ];
                return (
                  <div
                    key={index}
                    className="mb-8 border border-gray-100 p-6 rounded-xl shadow-sm bg-white"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Product {index + 1}
                      </h3>
                      {formData.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                        >
                          Remove Product
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {categoryConfig &&
                        categoryConfig.map((field) => (
                          <div key={field}>{renderField(field, index)}</div>
                        ))}
                      {commonFields.map((field) => (
                        <div key={field}>{renderField(field, index)}</div>
                      ))}
                    </div>

                    {/* Seller Info (Auto-filled) */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-3">Seller Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Seller Name</label>
                          <input
                            type="text"
                            value={product.sellerName}
                            readOnly
                            className="border border-gray-300 p-2 w-full rounded-lg text-sm bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Business Name</label>
                          <input
                            type="text"
                            value={product.businessName}
                            readOnly
                            className="border border-gray-300 p-2 w-full rounded-lg text-sm bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Contact Email</label>
                          <input
                            type="text"
                            value={product.sellerEmail}
                            readOnly
                            className="border border-gray-300 p-2 w-full rounded-lg text-sm bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Upload Product Images (Up to 5) *
                      </p>
                      <div className="flex flex-wrap gap-4 mb-4">
                        {product.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative group">
                            <img
                              src={image.preview}
                              alt={`Preview ${imgIndex + 1}`}
                              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index, imgIndex)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {product.images.length < 5 && (
                          <div
                            className="flex-shrink-0 border-2 border-dashed border-[#FB8B24] rounded-lg p-4 text-center w-24 h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-[#FB8B24] hover:bg-opacity-10 transition-colors"
                            onClick={() => fileInputRefs.current[index]?.click()}
                          >
                            <div className="w-8 h-8 rounded-full bg-[#FB8B24] bg-opacity-20 flex items-center justify-center mb-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-[#FB8B24]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </div>
                            <span className="text-xs text-[#FB8B24]">
                              Add Image
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={(el) => (fileInputRefs.current[index] = el)}
                          onChange={(e) => handleImageUpload(e, index)}
                          className="hidden"
                          multiple
                          accept="image/*"
                        />
                      </div>
                      {errors[`products.${index}.images`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`products.${index}.images`]}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Upload clear images from different angles. Recommended: 800x800px, max 5MB each.
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap justify-between items-center mt-8 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={addProduct}
                  className="bg-[#FB8B24] hover:bg-[#E36414] text-white px-5 py-2 rounded-lg font-medium text-sm transition-all duration-300 mb-4"
                >
                  + Add Another Product
                </button>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-[#34A853] hover:bg-[#2E8B47] text-white px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Adding Product...
                      </span>
                    ) : "Publish Product(s)"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddSingleCatalog;