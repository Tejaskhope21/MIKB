import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, X, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://bricks-com-backend.vercel.app/api';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [variations, setVariations] = useState([]);
    const [variants, setVariants] = useState([]);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // State for categories and subcategories
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);

    // Product data matching backend schema
    const [productData, setProductData] = useState({
        name: '',
        brand: '',
        description: '',
        categoryId: '',
        subcategoryId: '',
        materialType: 'other',
        grade: '',
        color: '',
        finish: '',
        technicalSpecs: {
            thickness: '',
            weight: '',
            density: '',
            waterResistance: false,
            fireResistant: false,
            thermalInsulation: false
        },
        price: '',
        originalPrice: '',
        inventory: {
            stock: 0,
            lowStockThreshold: 10,
            moq: 1,
            manageStock: true
        },
        unitType: 'piece',
        packaging: {
            type: 'box',
            quantityPerPackage: 1
        },
        status: 'draft',
        seo: {
            title: '',
            description: '',
            keywords: []
        }
    });

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await axios.get(`${API_URL}/categories`);
            if (response.data.success) {
                setCategories(response.data.categories || response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Failed to load categories');
        } finally {
            setLoadingCategories(false);
        }
    };

    // When category changes, fetch subcategories
    useEffect(() => {
        if (productData.categoryId) {
            fetchSubcategories(productData.categoryId);
        } else {
            setSubcategories([]);
            setProductData(prev => ({ ...prev, subcategoryId: '' }));
        }
    }, [productData.categoryId]);

    const fetchSubcategories = async (categoryId) => {
        try {
            setLoadingSubcategories(true);
            setSubcategories([]);

            // Try to get subcategories from the category data
            const selectedCategory = categories.find(cat =>
                cat._id === categoryId || cat.numericId?.toString() === categoryId
            );

            if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
                // Use subcategories from category data
                const formattedSubcategories = selectedCategory.subcategories.map((sub, index) => ({
                    _id: sub._id || `sub-${index}-${Date.now()}`,
                    name: sub.title || sub.name
                }));
                setSubcategories(formattedSubcategories);
                setLoadingSubcategories(false);
                return;
            }

            // If no subcategories in category data, try API endpoint
            try {
                const response = await axios.get(`${API_URL}/categories/${categoryId}/subcategories`);
                if (response.data.success) {
                    const subcategoriesData = response.data.subcategories || response.data.data || [];
                    if (subcategoriesData.length > 0) {
                        const formatted = subcategoriesData.map(sub => ({
                            _id: sub._id || sub.id,
                            name: sub.title || sub.name
                        }));
                        setSubcategories(formatted);
                    }
                }
            } catch (apiError) {
                console.log('Subcategories API endpoint not available');
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            setSubcategories([]);
        } finally {
            setLoadingSubcategories(false);
        }
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setProductData({
            ...productData,
            categoryId: categoryId,
            subcategoryId: ''
        });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (images.length + files.length > 10) {
            alert('Maximum 10 images allowed');
            return;
        }

        const uploadedImages = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                setUploading(true);
                const token = localStorage.getItem('token');

                const response = await axios.post(`${API_URL.replace('/api', '')}/api/upload`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.data.success) {
                    let imageUrl = response.data.imageUrl;
                    uploadedImages.push(imageUrl);
                } else {
                    alert(response.data.message || 'Failed to upload image');
                }
            } catch (error) {
                console.error('Upload error:', error);
                // For testing, use placeholder images
                const placeholderUrl = `https://via.placeholder.com/500x500?text=Product+${images.length + 1}`;
                uploadedImages.push(placeholderUrl);
                console.log('Using placeholder image:', placeholderUrl);
            } finally {
                setUploading(false);
            }
        }

        if (uploadedImages.length > 0) {
            setImages(prev => [...prev, ...uploadedImages]);
        }
        e.target.value = '';
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const addVariation = () => {
        setVariations(prev => [...prev, {
            name: '',
            type: 'size',
            options: [''],
            affectsPrice: false
        }]);
    };

    const updateVariation = (index, field, value) => {
        setVariations(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const addVariationOption = (variationIndex) => {
        setVariations(prev => {
            const updated = [...prev];
            if (!updated[variationIndex].options) {
                updated[variationIndex].options = [''];
            } else {
                updated[variationIndex].options.push('');
            }
            return updated;
        });
    };

    const removeVariationOption = (variationIndex, optionIndex) => {
        setVariations(prev => {
            const updated = [...prev];
            updated[variationIndex].options.splice(optionIndex, 1);
            return updated;
        });
    };

    const generateVariants = () => {
        if (variations.length === 0) {
            alert('Please add variations first');
            return;
        }

        const invalidVariations = variations.filter(v =>
            !v.name?.trim() || !v.options || v.options.length === 0 || v.options.every(o => !o.trim())
        );

        if (invalidVariations.length > 0) {
            alert('Please fill in all variation names and options');
            return;
        }

        let generatedVariants = [{}];

        variations.forEach(variation => {
            const newVariants = [];
            generatedVariants.forEach(variant => {
                variation.options.forEach(option => {
                    const variantName = variation.type === 'size'
                        ? `${productData.name} - ${option}`
                        : variation.type === 'color'
                            ? `${productData.name} - ${option} Color`
                            : `${productData.name} - ${option} ${variation.type}`;

                    newVariants.push({
                        ...variant,
                        attributes: {
                            ...variant.attributes,
                            [variation.name]: option
                        },
                        name: variantName,
                        sku: '',
                        price: variation.affectsPrice ? '' : productData.price || 0,
                        stock: productData.inventory.stock || 0,
                        image: images[0] || ''
                    });
                });
            });
            generatedVariants = newVariants;
        });

        setVariants(generatedVariants);
    };

    const validateProduct = () => {
        const errors = [];

        if (!productData.name.trim()) {
            errors.push('Product name is required');
        }

        if (!productData.categoryId) {
            errors.push('Please select a category');
        }

        if (!productData.price || parseFloat(productData.price) <= 0) {
            errors.push('Please enter a valid price greater than 0');
        }

        if (!productData.description.trim()) {
            errors.push('Product description is required');
        }

        if (images.length === 0) {
            errors.push('Please upload at least one product image');
        }

        if (productData.inventory.stock === undefined || parseInt(productData.inventory.stock) < 0) {
            errors.push('Please enter a valid stock quantity');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateProduct();
        if (validationErrors.length > 0) {
            alert(validationErrors.join('\n'));
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                navigate('/login');
                return;
            }

            // For testing: Use placeholder images if no images uploaded
            const imageUrls = images.length > 0 ? images : ['https://via.placeholder.com/500x500?text=Product+Image'];

            // Simplify the data structure - send only what's absolutely necessary
            const dataToSubmit = {
                name: productData.name.trim(),
                description: productData.description.trim(),
                categoryId: productData.categoryId,
                price: parseFloat(productData.price),
                images: imageUrls, // Send image URLs directly
                inventory: {
                    stock: parseInt(productData.inventory.stock) || 0
                },
                status: productData.status || 'draft'
            };

            // Add optional fields only if they have values
            if (productData.brand && productData.brand.trim()) {
                dataToSubmit.brand = productData.brand.trim();
            }
            if (productData.subcategoryId) {
                dataToSubmit.subcategoryId = productData.subcategoryId;
            }
            if (productData.materialType && productData.materialType !== 'other') {
                dataToSubmit.materialType = productData.materialType;
            }
            if (productData.grade && productData.grade.trim()) {
                dataToSubmit.grade = productData.grade.trim();
            }
            if (productData.color && productData.color.trim()) {
                dataToSubmit.color = productData.color.trim();
            }
            if (productData.finish && productData.finish.trim()) {
                dataToSubmit.finish = productData.finish.trim();
            }
            if (productData.originalPrice && parseFloat(productData.originalPrice) > 0) {
                dataToSubmit.originalPrice = parseFloat(productData.originalPrice);
            }
            if (productData.unitType && productData.unitType !== 'piece') {
                dataToSubmit.unitType = productData.unitType;
            }
            if (productData.inventory.lowStockThreshold && parseInt(productData.inventory.lowStockThreshold) > 0) {
                dataToSubmit.inventory.lowStockThreshold = parseInt(productData.inventory.lowStockThreshold);
            }
            if (productData.inventory.moq && parseInt(productData.inventory.moq) > 1) {
                dataToSubmit.inventory.moq = parseInt(productData.inventory.moq);
            }
            if (productData.packaging.type && productData.packaging.type !== 'box') {
                dataToSubmit.packaging = {
                    type: productData.packaging.type,
                    quantityPerPackage: parseInt(productData.packaging.quantityPerPackage) || 1
                };
            }

            console.log('Submitting product data:', dataToSubmit);

            const response = await axios.post(`${API_URL}/products`, dataToSubmit, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            console.log('Response:', response.data);

            if (response.data.success) {
                alert('Product created successfully!');
                navigate('/seller/products');
            } else {
                throw new Error(response.data.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Error status:', error.response?.status);

            let errorMessage = 'Failed to create product. Please try again.';

            if (error.response) {
                console.error('Full error response:', error.response);

                if (error.response.status === 401) {
                    errorMessage = 'Session expired. Please login again.';
                    localStorage.removeItem('token');
                    navigate('/login');
                } else if (error.response.status === 400) {
                    if (error.response.data.errors) {
                        errorMessage = 'Validation errors:\n' + Object.values(error.response.data.errors).join('\n');
                    } else if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else {
                        errorMessage = 'Invalid data submitted. Please check all fields.';
                    }
                } else if (error.response.status === 403) {
                    errorMessage = 'You are not authorized to create products.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                    console.error('Server error details:', error.response.data);
                }
            } else if (error.request) {
                console.error('No response received:', error.request);
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                console.error('Request setup error:', error.message);
                errorMessage = error.message || 'An unexpected error occurred.';
            }

            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const updateVariant = (index, field, value) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleTagsChange = (e) => {
        const value = e.target.value;
        const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        setProductData(prev => ({
            ...prev,
            seo: { ...prev.seo, keywords: tagsArray }
        }));
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add Construction Material</h1>
                <p className="text-gray-600 mt-2">Add new building and construction materials to your inventory</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Material Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={productData.name}
                                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Birla White Cement 53 Grade"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand/Manufacturer
                            </label>
                            <input
                                type="text"
                                value={productData.brand}
                                onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Ultratech, Ambuja, JK Cement"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Material Type *
                            </label>
                            <select
                                required
                                value={productData.materialType}
                                onChange={(e) => setProductData({ ...productData, materialType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="cement">Cement</option>
                                <option value="steel">Steel</option>
                                <option value="bricks">Bricks & Blocks</option>
                                <option value="sand">Sand & Aggregates</option>
                                <option value="tiles">Tiles & Sanitaryware</option>
                                <option value="paint">Paints & Coatings</option>
                                <option value="wood">Wood & Laminates</option>
                                <option value="plumbing">Plumbing Materials</option>
                                <option value="electrical">Electrical Materials</option>
                                <option value="hardware">Hardware & Fittings</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grade/Quality
                            </label>
                            <input
                                type="text"
                                value={productData.grade}
                                onChange={(e) => setProductData({ ...productData, grade: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 53 Grade, Premium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                required
                                value={productData.categoryId}
                                onChange={handleCategoryChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={loadingCategories}
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category._id || category.id} value={category._id || category.id}>
                                        {category.name || category.title}
                                    </option>
                                ))}
                            </select>
                            {loadingCategories && (
                                <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subcategory
                            </label>
                            <select
                                value={productData.subcategoryId}
                                onChange={(e) => setProductData({ ...productData, subcategoryId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={!productData.categoryId || loadingSubcategories}
                            >
                                <option value="">Select Subcategory</option>
                                {loadingSubcategories ? (
                                    <option value="" disabled>Loading subcategories...</option>
                                ) : subcategories.length > 0 ? (
                                    subcategories.map((subcategory) => (
                                        <option key={subcategory._id || subcategory.id} value={subcategory._id || subcategory.id}>
                                            {subcategory.title || subcategory.name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No subcategories available</option>
                                )}
                            </select>
                            {loadingSubcategories && (
                                <p className="text-xs text-gray-500 mt-1">Loading subcategories...</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color
                            </label>
                            <input
                                type="text"
                                value={productData.color}
                                onChange={(e) => setProductData({ ...productData, color: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., White, Grey, Red"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Finish
                            </label>
                            <input
                                type="text"
                                value={productData.finish}
                                onChange={(e) => setProductData({ ...productData, finish: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Matte, Glossy, Textured"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            required
                            value={productData.description}
                            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe the material, its features, composition, and advantages..."
                        />
                    </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                        Pricing & Inventory
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Selling Price *
                            </label>
                            <div className="flex items-center">
                                <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={productData.price}
                                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Original Price
                            </label>
                            <div className="flex items-center">
                                <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={productData.originalPrice}
                                    onChange={(e) => setProductData({ ...productData, originalPrice: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Unit Type
                            </label>
                            <select
                                value={productData.unitType}
                                onChange={(e) => setProductData({ ...productData, unitType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="piece">Piece</option>
                                <option value="kg">Kilogram (KG)</option>
                                <option value="ton">Metric Ton</option>
                                <option value="meter">Meter</option>
                                <option value="sq-meter">Square Meter</option>
                                <option value="cubic-meter">Cubic Meter</option>
                                <option value="bag">Bag</option>
                                <option value="set">Set</option>
                                <option value="roll">Roll</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock Quantity *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={productData.inventory.stock}
                                onChange={(e) => setProductData({
                                    ...productData,
                                    inventory: { ...productData.inventory, stock: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Low Stock Threshold
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={productData.inventory.lowStockThreshold}
                                onChange={(e) => setProductData({
                                    ...productData,
                                    inventory: { ...productData.inventory, lowStockThreshold: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Order Quantity (MOQ)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={productData.inventory.moq}
                                onChange={(e) => setProductData({
                                    ...productData,
                                    inventory: { ...productData.inventory, moq: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center">
                        <input
                            type="checkbox"
                            checked={productData.inventory.manageStock}
                            onChange={(e) => setProductData({
                                ...productData,
                                inventory: { ...productData.inventory, manageStock: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Manage Stock</span>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                        Product Images
                    </h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Images (Max 10) *
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${uploading ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {uploading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                                    ) : (
                                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                    )}
                                    <p className="text-sm text-gray-500">
                                        {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploading || images.length >= 10}
                                />
                            </label>
                        </div>
                        {images.length >= 10 && (
                            <p className="text-sm text-red-500 mt-2">Maximum 10 images reached</p>
                        )}
                    </div>

                    {images.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-600 mb-3">
                                {images.length} image(s) uploaded
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={img}
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-all duration-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {index === 0 && (
                                            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                Main
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Packaging */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                        Packaging
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Package Type
                            </label>
                            <select
                                value={productData.packaging.type}
                                onChange={(e) => setProductData({
                                    ...productData,
                                    packaging: { ...productData.packaging, type: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="box">Box</option>
                                <option value="bag">Bag</option>
                                <option value="bundle">Bundle</option>
                                <option value="pallet">Pallet</option>
                                <option value="roll">Roll</option>
                                <option value="crate">Crate</option>
                                <option value="loose">Loose</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity per Package
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={productData.packaging.quantityPerPackage}
                                onChange={(e) => setProductData({
                                    ...productData,
                                    packaging: { ...productData.packaging, quantityPerPackage: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Status & Submit */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Status
                            </label>
                            <select
                                value={productData.status}
                                onChange={(e) => setProductData({ ...productData, status: e.target.value })}
                                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="draft">Save as Draft</option>
                                <option value="published">Publish Now</option>
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/seller/products')}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {productData.status === 'draft' ? 'Save as Draft' : 'Create Product'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;