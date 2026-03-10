import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const [productData, setProductData] = useState({
    name: "",
    categoryId: "",
    subcategoryId: "",
    brand: "",
    description: "",
    price: "",
    originalPrice: "",
    inventory: {
      stock: 0,
      lowStockThreshold: 10,
      manageStock: true,
      backorders: "no",
    },
    status: "draft",
    tags: [],
    specs: [],
  });

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [productId]);

  useEffect(() => {
    if (productData.categoryId) {
      fetchSubcategories(productData.categoryId);
    }
  }, [productData.categoryId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const product = response.data.product;
        setProductData({
          name: product.name || "",
          categoryId: product.categoryId || "",
          subcategoryId: product.subcategoryId || "",
          brand: product.brand || "",
          description: product.description || "",
          price: product.price || "",
          originalPrice: product.originalPrice || "",
          inventory: {
            stock: product.inventory?.stock || 0,
            lowStockThreshold: product.inventory?.lowStockThreshold || 10,
            manageStock: product.inventory?.manageStock !== false,
            backorders: product.inventory?.backorders || "no",
          },
          status: product.status || "draft",
          tags: product.tags || [],
          specs: product.specs || [],
        });
        setImages(product.images || []);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Failed to load product");
      navigate("/seller/products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      setLoadingSubcategories(true);
      setSubcategories([]);

      // Try to get subcategories from the category data first
      const selectedCategory = categories.find(
        (cat) =>
          cat._id === categoryId || cat.numericId?.toString() === categoryId,
      );

      if (
        selectedCategory &&
        selectedCategory.subcategories &&
        selectedCategory.subcategories.length > 0
      ) {
        // Use subcategories from category data
        const formattedSubcategories = selectedCategory.subcategories.map(
          (sub, index) => ({
            _id: sub._id || `sub-${index}-${Date.now()}`,
            numericId: sub.numericId || index + 1,
            name: sub.title || sub.name,
            title: sub.title || sub.name,
            items: sub.items || [],
          }),
        );
        setSubcategories(formattedSubcategories);
        setLoadingSubcategories(false);
        return;
      }

      // If no subcategories in category data, try API endpoint
      try {
        const response = await axios.get(
          `${API_URL}/categories/${categoryId}/subcategories`,
        );

        if (response.data.success) {
          const subcategoriesData =
            response.data.subcategories || response.data.data || [];

          if (subcategoriesData.length > 0) {
            const formatted = subcategoriesData.map((sub) => ({
              _id: sub._id || sub.id,
              numericId: sub.numericId || sub.id,
              name: sub.title || sub.name,
              title: sub.title || sub.name,
              items: sub.items || [],
            }));
            setSubcategories(formatted);
          }
        }
      } catch (apiError) {
        console.log(
          "Subcategories API endpoint not available:",
          apiError.message,
        );
        // If API fails, check if there's a different structure
        if (selectedCategory) {
          // Check for alternative subcategory field names
          const altSubcategories =
            selectedCategory.subCategories ||
            selectedCategory.sub_categories ||
            [];
          if (altSubcategories.length > 0) {
            const formattedSubcategories = altSubcategories.map(
              (sub, index) => ({
                _id: sub._id || `sub-alt-${index}-${Date.now()}`,
                numericId: sub.numericId || index + 1,
                name: sub.title || sub.name,
                title: sub.title || sub.name,
                items: sub.items || [],
              }),
            );
            setSubcategories(formattedSubcategories);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const dataToSubmit = {
        ...productData,
        images,
        tags: Array.isArray(productData.tags)
          ? productData.tags
          : productData.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t),
        specs: productData.specs.filter((s) => s.key && s.value),
      };

      const response = await axios.put(
        `${API_URL}/products/${productId}`,
        dataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        alert("Product updated successfully!");
        navigate("/seller/products");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.post(`${API_URL}/upload/images`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setImages((prev) => [...prev, ...response.data.urls]);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images");
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !productData.tags.includes(newTag.trim())) {
      setProductData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setProductData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setProductData((prev) => ({
        ...prev,
        specs: [
          ...prev.specs,
          { key: newSpecKey.trim(), value: newSpecValue.trim() },
        ],
      }));
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const removeSpec = (index) => {
    setProductData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }));
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
          onClick={() => navigate("/seller/products")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
        <p className="text-gray-600">Update product details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={productData.name}
                onChange={(e) =>
                  setProductData({ ...productData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                value={productData.brand}
                onChange={(e) =>
                  setProductData({ ...productData, brand: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={productData.categoryId}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    categoryId: e.target.value,
                    subcategoryId: "",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <select
                value={productData.subcategoryId}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    subcategoryId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!productData.categoryId}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                <input
                  type="number"
                  value={productData.price}
                  onChange={(e) =>
                    setProductData({ ...productData, price: e.target.value })
                  }
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                <input
                  type="number"
                  value={productData.originalPrice}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      originalPrice: e.target.value,
                    })
                  }
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Description *
            </label>
            <textarea
              value={productData.description}
              onChange={(e) =>
                setProductData({ ...productData, description: e.target.value })
              }
              rows="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Product Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Upload</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">
            Upload up to 6 images. First image will be the main product image.
          </p>
        </div>

        {/* Inventory */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={productData.inventory.stock}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    inventory: {
                      ...productData.inventory,
                      stock: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={productData.inventory.lowStockThreshold}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    inventory: {
                      ...productData.inventory,
                      lowStockThreshold: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backorders
              </label>
              <select
                value={productData.inventory.backorders}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    inventory: {
                      ...productData.inventory,
                      backorders: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="no">Do Not Allow</option>
                <option value="allow">Allow</option>
                <option value="notify">Allow, but notify customer</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="manageStock"
                checked={productData.inventory.manageStock}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    inventory: {
                      ...productData.inventory,
                      manageStock: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label
                htmlFor="manageStock"
                className="ml-2 text-sm text-gray-700"
              >
                Manage stock
              </label>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {productData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTag())
              }
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Specifications</h2>
          <div className="space-y-3 mb-4">
            {productData.specs.map((spec, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded"
              >
                <div className="flex-1">
                  <span className="font-medium">{spec.key}:</span>
                  <span className="ml-2">{spec.value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              placeholder="Specification key"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              placeholder="Specification value"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addSpec}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              Add Specification
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="draft"
                name="status"
                value="draft"
                checked={productData.status === "draft"}
                onChange={(e) =>
                  setProductData({ ...productData, status: e.target.value })
                }
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="draft" className="ml-2 text-gray-700">
                Draft
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="published"
                name="status"
                value="published"
                checked={productData.status === "published"}
                onChange={(e) =>
                  setProductData({ ...productData, status: e.target.value })
                }
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="published" className="ml-2 text-gray-700">
                Published
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
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
