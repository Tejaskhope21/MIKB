import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload, X, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);

    const [productData, setProductData] = useState({
        name: '',
        categoryId: '',
        subcategoryId: '',
        brand: '',
        description: '',
        price: '',
        originalPrice: '',
        inventory: {
            stock: 0,
            lowStockThreshold: 10,
            manageStock: true,
            backorders: 'no'
        },
        status: 'draft',
        tags: [],
        specs: []
    });

    useEffect(() => {
        fetchProduct();
        fetchCategories();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const product = response.data.product;
                setProductData({
                    name: product.name || '',
                    categoryId: product.categoryId || '',
                    subcategoryId: product.subcategoryId || '',
                    brand: product.brand || '',
                    description: product.description || '',
                    price: product.price || '',
                    originalPrice: product.originalPrice || '',
                    inventory: {
                        stock: product.inventory?.stock || 0,
                        lowStockThreshold: product.inventory?.lowStockThreshold || 10,
                        manageStock: product.inventory?.manageStock !== false,
                        backorders: product.inventory?.backorders || 'no'
                    },
                    status: product.status || 'draft',
                    tags: product.tags || [],
                    specs: product.specs || []
                });
                setImages(product.images || []);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Failed to load product');
            navigate('/seller/products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setCategories(response.data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const dataToSubmit = {
                ...productData,
                images,
                tags: Array.isArray(productData.tags) ? productData.tags : productData.tags.split(',').map(t => t.trim()).filter(t => t),
                specs: Array.isArray(productData.specs) ? productData.specs.filter(s => s.trim()) : []
            };

            const response = await axios.put(`${API_URL}/products/${productId}`, dataToSubmit, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                alert('Product updated successfully!');
                navigate('/seller/products');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert(error.response?.data?.message || 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        // Implementation depends on your image upload setup
        // You can reuse the upload logic from AddProduct
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/seller/products')}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
                <p className="text-gray-600">Update product details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields similar to AddProduct */}
                {/* You can reuse most of the AddProduct form structure */}

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/seller/products')}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Update Product
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;