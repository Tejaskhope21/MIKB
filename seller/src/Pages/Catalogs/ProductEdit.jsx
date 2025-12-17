import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    productType: "",
    details: {},
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/get/${id}`
      );
      setProduct(response.data.data);
      setFormData({
        category: response.data.data.category,
        subCategory: response.data.data.subCategory,
        productType: response.data.data.productType || "",
        details: response.data.data.details || {},
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/products/update/${id}`,
        formData
      );
      if (response.data.success) {
        toast.success("Product updated successfully");
        navigate("/upload-catalog");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        {/* Form fields similar to AddSingleCatalog but for editing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={formData.details.productName || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  details: { ...formData.details, productName: e.target.value },
                })
              }
              className="border p-2 w-full rounded"
            />
          </div>

          {/* Add other fields similarly */}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="bg-[#FB8B24] text-white px-4 py-2 rounded"
          >
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
