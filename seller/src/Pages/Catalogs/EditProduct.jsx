// src/Pages/Seller/EditProduct.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowLeft, FaSave, FaImage } from "react-icons/fa";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    subCategory: "",
    brand: "",
    material: "",
    mrp: "",
    sellingPrice: "",
    stockQuantity: "",
    description: "",
    images: []
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = () => {
    setLoading(true);
    try {
      const storedProducts = JSON.parse(localStorage.getItem("sellerProducts") || "[]");
      const foundProduct = storedProducts.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setFormData({
          productName: foundProduct.details.productName,
          category: foundProduct.category,
          subCategory: foundProduct.subCategory,
          brand: foundProduct.details.brand,
          material: foundProduct.details.material,
          mrp: foundProduct.details.mrp,
          sellingPrice: foundProduct.details.sellingPrice,
          stockQuantity: foundProduct.details.stockQuantity,
          description: foundProduct.details.description,
          images: foundProduct.details.images || []
        });
      } else {
        toast.error("Product not found");
        navigate("/seller/my-products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...formData.images];
    
    files.forEach((file) => {
      if (file.type.match("image.*") && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({
            preview: e.target.result,
            name: file.name,
            size: file.size
          });
          setFormData({
            ...formData,
            images: newImages
          });
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please upload valid images (max 5MB each)");
      }
    });
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.sellingPrice || !formData.stockQuantity) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setSaving(true);
    
    try {
      const storedProducts = JSON.parse(localStorage.getItem("sellerProducts") || "[]");
      const updatedProducts = storedProducts.map(p => {
        if (p.id === id) {
          return {
            ...p,
            category: formData.category,
            subCategory: formData.subCategory,
            details: {
              ...p.details,
              productName: formData.productName,
              brand: formData.brand,
              material: formData.material,
              mrp: formData.mrp,
              sellingPrice: formData.sellingPrice,
              stockQuantity: formData.stockQuantity,
              description: formData.description,
              images: formData.images
            },
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });
      
      localStorage.setItem("sellerProducts", JSON.stringify(updatedProducts));
      toast.success("Product updated successfully!");
      
      setTimeout(() => {
        navigate("/seller/my-products");
      }, 1000);
      
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FB8B24]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => navigate("/seller/my-products")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft /> Back to Products
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600">Update product information and images</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category
              </label>
              <input
                type="text"
                value={formData.subCategory}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24]"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24]"
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB8B24] focus:border-[#FB8B24]"
            />
          </div>
          
          {/* Images Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <div className="flex flex-wrap gap-4 mb-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.preview}
                    alt={`Product ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {formData.images.length < 5 && (
                <label className="cursor-pointer">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-[#FB8B24] transition-colors">
                    <FaImage className="text-gray-400 text-xl mb-2" />
                    <span className="text-xs text-gray-500">Add Image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">Upload up to 5 images. Recommended size: 800x800px</p>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/seller/my-products")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#FB8B24] hover:bg-[#E36414] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <FaSave />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;