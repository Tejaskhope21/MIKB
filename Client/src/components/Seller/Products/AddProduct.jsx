import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, X, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

    // Building construction materials specific product data
    const [productData, setProductData] = useState({
        name: '',
        categoryId: '',
        subcategoryId: '',
        brand: '',
        description: '',
        materialType: '',
        grade: '',
        color: '',
        finish: '',
        application: [],
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
            manageStock: true,
            moq: 1,
            bulkDiscount: false,
            bulkTiers: []
        },
        shipping: {
            weight: '',
            dimensions: {
                length: '',
                width: '',
                height: ''
            },
            fragile: false
        },
        unitType: 'piece',
        packaging: {
            type: 'box',
            quantityPerPackage: 1
        },
        status: 'draft',
        certifications: [],
        warranty: {
            duration: '',
            type: ''
        },
        tags: [],
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
            } else {
                console.error('Failed to fetch categories:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Failed to load categories. Please refresh the page.');
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

            // Try to get subcategories from the category data first
            const selectedCategory = categories.find(cat =>
                cat._id === categoryId || cat.numericId?.toString() === categoryId
            );

            if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
                // Use subcategories from category data
                const formattedSubcategories = selectedCategory.subcategories.map((sub, index) => ({
                    _id: sub._id || `sub-${index}-${Date.now()}`,
                    numericId: sub.numericId || index + 1,
                    name: sub.title || sub.name,
                    title: sub.title || sub.name,
                    items: sub.items || []
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
                            numericId: sub.numericId || sub.id,
                            name: sub.title || sub.name,
                            title: sub.title || sub.name,
                            items: sub.items || []
                        }));
                        setSubcategories(formatted);
                    }
                }
            } catch (apiError) {
                console.log('Subcategories API endpoint not available:', apiError.message);
                // If API fails, check if there's a different structure
                if (selectedCategory) {
                    // Check for alternative subcategory field names
                    const altSubcategories = selectedCategory.subCategories || selectedCategory.sub_categories || [];
                    if (altSubcategories.length > 0) {
                        const formattedSubcategories = altSubcategories.map((sub, index) => ({
                            _id: sub._id || `sub-alt-${index}-${Date.now()}`,
                            numericId: sub.numericId || index + 1,
                            name: sub.title || sub.name,
                            title: sub.title || sub.name,
                            items: sub.items || []
                        }));
                        setSubcategories(formattedSubcategories);
                    }
                }
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

    const handleSubcategoryChange = (e) => {
        setProductData({
            ...productData,
            subcategoryId: e.target.value
        });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (images.length + files.length > 10) {
            alert('Maximum 10 images allowed. Please select fewer files.');
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

                    if (imageUrl && imageUrl.startsWith('/')) {
                        const baseUrl = API_URL.replace('/api', '');
                        imageUrl = `${baseUrl}${imageUrl}`;
                    }

                    uploadedImages.push(imageUrl);
                } else {
                    alert(response.data.message || 'Failed to upload image');
                }
            } catch (error) {
                console.error('Upload error:', error);
                const errorMessage = error.response?.data?.message ||
                    error.message ||
                    'Failed to upload image. Please try again.';
                alert(errorMessage);
                break;
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
            alert('Please fill in all variation names and options before generating variants');
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
                        image: images[0] || '',
                        specifications: {
                            ...productData.technicalSpecs,
                            ...(variation.type === 'size' && { size: option }),
                            ...(variation.type === 'color' && { color: option })
                        }
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

        if (!productData.inventory.stock || parseInt(productData.inventory.stock) < 0) {
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

            const cleanedImages = images.map(img => {
                const baseUrl = API_URL.replace('/api', '');
                return img.replace(baseUrl, '');
            });

            const dataToSubmit = {
                name: productData.name.trim(),
                categoryId: productData.categoryId,
                subcategoryId: productData.subcategoryId || null,
                brand: productData.brand.trim() || '',
                description: productData.description.trim(),
                materialType: productData.materialType || 'other',
                grade: productData.grade || '',
                color: productData.color || '',
                finish: productData.finish || '',
                application: productData.application.filter(app => app.trim()),
                technicalSpecs: {
                    thickness: productData.technicalSpecs.thickness || '',
                    weight: productData.technicalSpecs.weight || '',
                    density: productData.technicalSpecs.density || '',
                    waterResistance: Boolean(productData.technicalSpecs.waterResistance),
                    fireResistant: Boolean(productData.technicalSpecs.fireResistant),
                    thermalInsulation: Boolean(productData.technicalSpecs.thermalInsulation)
                },
                price: parseFloat(productData.price),
                originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : undefined,
                images: cleanedImages,
                inventory: {
                    stock: parseInt(productData.inventory.stock) || 0,
                    lowStockThreshold: parseInt(productData.inventory.lowStockThreshold) || 10,
                    moq: parseInt(productData.inventory.moq) || 1,
                    manageStock: productData.inventory.manageStock !== false,
                    bulkDiscount: Boolean(productData.inventory.bulkDiscount),
                    bulkTiers: productData.inventory.bulkTiers || []
                },
                shipping: productData.shipping.weight ? {
                    weight: productData.shipping.weight,
                    dimensions: {
                        length: productData.shipping.dimensions.length || '',
                        width: productData.shipping.dimensions.width || '',
                        height: productData.shipping.dimensions.height || ''
                    },
                    fragile: Boolean(productData.shipping.fragile)
                } : undefined,
                unitType: productData.unitType || 'piece',
                packaging: {
                    type: productData.packaging.type || 'box',
                    quantityPerPackage: parseInt(productData.packaging.quantityPerPackage) || 1
                },
                status: productData.status || 'draft',
                certifications: productData.certifications.filter(c => c.trim()),
                warranty: (productData.warranty.duration || productData.warranty.type) ? {
                    duration: productData.warranty.duration || '',
                    type: productData.warranty.type || ''
                } : undefined,
                tags: productData.tags.filter(tag => tag.trim()),
                seo: {
                    title: productData.seo.title || '',
                    description: productData.seo.description || '',
                    keywords: productData.seo.keywords || []
                },
                variations: variations
                    .filter(v => v.name && v.name.trim() && v.options && v.options.some(o => o.trim()))
                    .map(v => ({
                        name: v.name.trim(),
                        type: v.type || 'other',
                        options: v.options.filter(o => o.trim()),
                        affectsPrice: Boolean(v.affectsPrice)
                    })),
                variants: variants.map(v => ({
                    name: v.name || productData.name,
                    sku: '',
                    price: parseFloat(v.price) || parseFloat(productData.price),
                    stock: parseInt(v.stock) || 0,
                    attributes: v.attributes || {},
                    image: v.image || cleanedImages[0] || '',
                    specifications: v.specifications || {}
                }))
            };

            Object.keys(dataToSubmit).forEach(key => {
                if (dataToSubmit[key] === undefined ||
                    dataToSubmit[key] === null ||
                    (Array.isArray(dataToSubmit[key]) && dataToSubmit[key].length === 0) ||
                    (typeof dataToSubmit[key] === 'object' && dataToSubmit[key] !== null &&
                        !Array.isArray(dataToSubmit[key]) && Object.keys(dataToSubmit[key]).length === 0)) {
                    delete dataToSubmit[key];
                }
            });

            if (dataToSubmit.shipping && Object.keys(dataToSubmit.shipping).length === 0) {
                delete dataToSubmit.shipping;
            }
            if (dataToSubmit.warranty && Object.keys(dataToSubmit.warranty).length === 0) {
                delete dataToSubmit.warranty;
            }
            if (dataToSubmit.seo && Object.keys(dataToSubmit.seo).length === 0) {
                delete dataToSubmit.seo;
            }

            console.log('Submitting product data:', dataToSubmit);

            const response = await axios.post(`${API_URL}/products`, dataToSubmit, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            if (response.data.success) {
                alert('Product created successfully!');
                navigate('/seller/products');
            } else {
                throw new Error(response.data.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);

            let errorMessage = 'Failed to create product. Please try again.';

            if (error.response) {
                console.error('Server response:', error.response.data);

                if (error.response.status === 401) {
                    errorMessage = 'Session expired. Please login again.';
                    localStorage.removeItem('token');
                    navigate('/login');
                } else if (error.response.status === 400) {
                    errorMessage = error.response.data.message ||
                        error.response.data.details?.[0] ||
                        'Invalid data submitted. Please check all fields.';
                } else if (error.response.status === 403) {
                    errorMessage = 'You are not authorized to create products.';
                } else if (error.response.data && error.response.data.errors) {
                    errorMessage = error.response.data.errors.join('\n');
                }
            } else if (error.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                errorMessage = error.message || 'An unexpected error occurred.';
            }

            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const addBulkTier = () => {
        setProductData(prev => ({
            ...prev,
            inventory: {
                ...prev.inventory,
                bulkTiers: [
                    ...(prev.inventory.bulkTiers || []),
                    { minQuantity: 10, discountPercent: 5 }
                ]
            }
        }));
    };

    const addApplication = () => {
        setProductData(prev => ({
            ...prev,
            application: [...prev.application, '']
        }));
    };

    const addCertification = () => {
        setProductData(prev => ({
            ...prev,
            certifications: [...prev.certifications, '']
        }));
    };

    const handleTagsChange = (e) => {
        const value = e.target.value;
        const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        setProductData(prev => ({ ...prev, tags: tagsArray }));
    };

    const getTagsDisplay = () => {
        return Array.isArray(productData.tags) ? productData.tags.join(', ') : productData.tags || '';
    };

    const updateApplication = (index, value) => {
        setProductData(prev => {
            const updated = [...prev.application];
            updated[index] = value;
            return { ...prev, application: updated };
        });
    };

    const updateCertification = (index, value) => {
        setProductData(prev => {
            const updated = [...prev.certifications];
            updated[index] = value;
            return { ...prev, certifications: updated };
        });
    };

    const updateBulkTier = (index, field, value) => {
        setProductData(prev => {
            const updatedTiers = [...prev.inventory.bulkTiers];
            updatedTiers[index][field] = value;
            return {
                ...prev,
                inventory: {
                    ...prev.inventory,
                    bulkTiers: updatedTiers
                }
            };
        });
    };

    const removeBulkTier = (index) => {
        setProductData(prev => ({
            ...prev,
            inventory: {
                ...prev.inventory,
                bulkTiers: prev.inventory.bulkTiers.filter((_, i) => i !== index)
            }
        }));
    };

    const removeApplication = (index) => {
        setProductData(prev => ({
            ...prev,
            application: prev.application.filter((_, i) => i !== index)
        }));
    };

    const removeCertification = (index) => {
        setProductData(prev => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index)
        }));
    };

    const updateVariant = (index, field, value) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
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
                                <option value="">Select Type</option>
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
                                <option value="insulation">Insulation Materials</option>
                                <option value="roofing">Roofing Materials</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grade/Quality
                            </label>
                            <select
                                value={productData.grade}
                                onChange={(e) => setProductData({ ...productData, grade: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Grade</option>
                                <option value="premium">Premium</option>
                                <option value="standard">Standard</option>
                                <option value="economy">Economy</option>
                                <option value="53-grade">53 Grade</option>
                                <option value="43-grade">43 Grade</option>
                                <option value="33-grade">33 Grade</option>
                                <option value="fe-500">FE-500</option>
                                <option value="fe-550">FE-550</option>
                            </select>
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
                                        {category.name}
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
                                onChange={handleSubcategoryChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={!productData.categoryId || loadingSubcategories}
                            >
                                <option value="">Select Subcategory</option>
                                {loadingSubcategories ? (
                                    <option value="" disabled>Loading subcategories...</option>
                                ) : subcategories.length > 0 ? (
                                    subcategories.map((subcategory) => (
                                        <option key={subcategory._id || subcategory.id || subcategory.numericId}
                                            value={subcategory._id || subcategory.id || subcategory.numericId}>
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
                            {!loadingSubcategories && productData.categoryId && subcategories.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">No subcategories found for this category</p>
                            )}
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

                    {/* Application Areas */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Application Areas
                            </label>
                            <button
                                type="button"
                                onClick={addApplication}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {productData.application.map((app, index) => (
                                <div key={index} className="flex items-center">
                                    <input
                                        type="text"
                                        value={app}
                                        onChange={(e) => updateApplication(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., Wall Construction, Flooring, Roofing"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeApplication(index)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {productData.application.length === 0 && (
                                <p className="text-sm text-gray-500">No application areas added</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                        Technical Specifications
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thickness
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={productData.technicalSpecs.thickness}
                                    onChange={(e) => setProductData({
                                        ...productData,
                                        technicalSpecs: { ...productData.technicalSpecs, thickness: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., 10"
                                />
                                <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                                    mm
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Weight
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={productData.technicalSpecs.weight}
                                    onChange={(e) => setProductData({
                                        ...productData,
                                        technicalSpecs: { ...productData.technicalSpecs, weight: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., 50"
                                />
                                <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                                    kg
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Density
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={productData.technicalSpecs.density}
                                    onChange={(e) => setProductData({
                                        ...productData,
                                        technicalSpecs: { ...productData.technicalSpecs, density: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., 1.5"
                                />
                                <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                                    g/cm³
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Technical Features */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={productData.technicalSpecs.waterResistance}
                                onChange={(e) => setProductData({
                                    ...productData,
                                    technicalSpecs: { ...productData.technicalSpecs, waterResistance: e.target.checked }
                                })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Water Resistant</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={productData.technicalSpecs.fireResistant}
                                onChange={(e) => setProductData({
                                    ...productData,
                                    technicalSpecs: { ...productData.technicalSpecs, fireResistant: e.target.checked }
                                })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Fire Resistant</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={productData.technicalSpecs.thermalInsulation}
                                onChange={(e) => setProductData({
                                    ...productData,
                                    technicalSpecs: { ...productData.technicalSpecs, thermalInsulation: e.target.checked }
                                })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Thermal Insulation</span>
                        </label>
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

                    {/* Bulk Discount */}
                    <div className="mt-6">
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                checked={productData.inventory.bulkDiscount}
                                onChange={(e) => setProductData({
                                    ...productData,
                                    inventory: { ...productData.inventory, bulkDiscount: e.target.checked }
                                })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">Enable Bulk Discount</span>
                        </div>

                        {productData.inventory.bulkDiscount && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-medium text-gray-700">Bulk Pricing Tiers</h4>
                                    <button
                                        type="button"
                                        onClick={addBulkTier}
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Tier
                                    </button>
                                </div>

                                {productData.inventory.bulkTiers?.map((tier, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={tier.minQuantity}
                                                    onChange={(e) => updateBulkTier(index, 'minQuantity', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="Min Quantity"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={tier.discountPercent}
                                                    onChange={(e) => updateBulkTier(index, 'discountPercent', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="Discount %"
                                                />
                                                <span className="ml-2 text-sm text-gray-500">%</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeBulkTier(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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

                {/* Variations */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-0">
                            Variations (Sizes, Colors, etc.)
                        </h2>
                        <button
                            type="button"
                            onClick={addVariation}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Variation
                        </button>
                    </div>

                    {variations.map((variation, vIndex) => (
                        <div key={vIndex} className="mb-4 p-4 border border-gray-200 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Variation Name
                                    </label>
                                    <input
                                        type="text"
                                        value={variation.name}
                                        onChange={(e) => updateVariation(vIndex, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., Size, Color, Finish"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={variation.type}
                                        onChange={(e) => updateVariation(vIndex, 'type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="size">Size</option>
                                        <option value="color">Color</option>
                                        <option value="finish">Finish</option>
                                        <option value="grade">Grade</option>
                                        <option value="thickness">Thickness</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={variation.affectsPrice}
                                            onChange={(e) => updateVariation(vIndex, 'affectsPrice', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Affects Price</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Options
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => addVariationOption(vIndex)}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        + Add Option
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {variation.options?.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center">
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => {
                                                    const updated = [...variations];
                                                    updated[vIndex].options[oIndex] = e.target.value;
                                                    setVariations(updated);
                                                }}
                                                className="w-full px-3 py-1.5 border border-gray-300 rounded"
                                                placeholder={variation.type === 'size' ? 'e.g., 10mm' :
                                                    variation.type === 'color' ? 'e.g., White' :
                                                        variation.type === 'finish' ? 'e.g., Matte' : 'Option'}
                                            />
                                            {variation.options.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariationOption(vIndex, oIndex)}
                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    {variations.length > 0 && (
                        <button
                            type="button"
                            onClick={generateVariants}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full md:w-auto"
                        >
                            Generate Variants
                        </button>
                    )}

                    {variants.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium mb-4">Generated Variants ({variants.length})</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variant</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {variants.map((variant, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {variant.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {variant.attributes && Object.entries(variant.attributes).map(([key, value]) => (
                                                            <span key={key} className="mr-2">
                                                                {key}: {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        <span className="mr-1 text-gray-500">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={variant.price}
                                                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                            className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={variant.stock}
                                                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Packaging & Shipping */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                        Packaging & Shipping
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Shipping Weight (kg)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={productData.shipping.weight}
                                onChange={(e) => setProductData({
                                    ...productData,
                                    shipping: { ...productData.shipping, weight: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Certifications & Warranty */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                        Certifications & Warranty
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Certifications
                                </label>
                                <button
                                    type="button"
                                    onClick={addCertification}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {productData.certifications.map((cert, index) => (
                                    <div key={index} className="flex items-center">
                                        <input
                                            type="text"
                                            value={cert}
                                            onChange={(e) => updateCertification(index, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="e.g., ISO 9001, BIS Certified, GreenPro"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeCertification(index)}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {productData.certifications.length === 0 && (
                                    <p className="text-sm text-gray-500">No certifications added</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Warranty Duration
                                </label>
                                <input
                                    type="text"
                                    value={productData.warranty.duration}
                                    onChange={(e) => setProductData({
                                        ...productData,
                                        warranty: { ...productData.warranty, duration: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g., 1 year, 5 years"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Warranty Type
                                </label>
                                <select
                                    value={productData.warranty.type}
                                    onChange={(e) => setProductData({
                                        ...productData,
                                        warranty: { ...productData.warranty, type: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Select Type</option>
                                    <option value="manufacturer">Manufacturer Warranty</option>
                                    <option value="seller">Seller Warranty</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Options */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                    >
                        <Plus className={`w-4 h-4 mr-2 transition-transform ${showAdvanced ? 'rotate-45' : ''}`} />
                        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                    </button>

                    {showAdvanced && (
                        <div className="space-y-6 border-t pt-6">
                            {/* SEO */}
                            <div>
                                <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SEO Title
                                        </label>
                                        <input
                                            type="text"
                                            value={productData.seo.title}
                                            onChange={(e) => setProductData({
                                                ...productData,
                                                seo: { ...productData.seo, title: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Will appear in search results"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SEO Description
                                        </label>
                                        <textarea
                                            value={productData.seo.description}
                                            onChange={(e) => setProductData({
                                                ...productData,
                                                seo: { ...productData.seo, description: e.target.value }
                                            })}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Brief description for search engines"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <h3 className="text-lg font-medium mb-4">Tags</h3>
                                <input
                                    type="text"
                                    value={getTagsDisplay()}
                                    onChange={handleTagsChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter tags separated by commas (e.g., waterproof, fireproof, eco-friendly)"
                                />
                            </div>
                        </div>
                    )}
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
                                <option value="pending">Pending Review</option>
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