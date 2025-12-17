// src/Pages/Seller/BulkCatalogUpload.js
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUpload, FaTrash, FaFileExcel, FaFileCsv, FaFileAlt } from "react-icons/fa";

const BulkCatalogUpload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop().toLowerCase(),
      lastModified: file.lastModified,
    }));

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadStatus(`${acceptedFiles.length} file(s) added successfully`);
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus("Please select files to upload");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Processing files...");

    try {
      // Simulate bulk upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate sample products from files
      const sampleProducts = files.map(file => ({
        id: `BULK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        category: "Cement & Binding Materials",
        subCategory: "Portland Cement",
        details: {
          productName: `Bulk Upload - ${file.name.split('.')[0]}`,
          brand: "Ambuja Cement",
          material: "Cement",
          mrp: "450",
          sellingPrice: "420",
          stockQuantity: "1000",
          description: "Bulk uploaded construction material product",
          images: [],
          sellerName: "Demo Seller",
          sellerPhone: "+91 9876543210",
          sellerEmail: "demo@brickskart.com"
        },
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Save to localStorage
      const existingProducts = JSON.parse(localStorage.getItem("sellerProducts") || "[]");
      localStorage.setItem("sellerProducts", JSON.stringify([...existingProducts, ...sampleProducts]));

      setUploadStatus(`Successfully added ${files.length} product(s) from bulk upload!`);
      toast.success(`Added ${files.length} products to your catalog`);
      
      // Clear files after successful upload
      setFiles([]);
      
      // Redirect to products page after delay
      setTimeout(() => {
        navigate("/seller/my-products");
      }, 1500);
      
    } catch (error) {
      setUploadStatus("Error processing files. Please try again.");
      console.error("Upload error:", error);
      toast.error("Failed to process bulk upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("bg-blue-50", "border-blue-400");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-blue-50", "border-blue-400");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-blue-50", "border-blue-400");

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      onDrop(Array.from(droppedFiles));
    }
  };

  const removeFile = (fileId) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'csv':
        return <FaFileCsv className="text-green-600" />;
      case 'xlsx':
      case 'xls':
        return <FaFileExcel className="text-green-700" />;
      default:
        return <FaFileAlt className="text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Catalog Upload</h1>
          <p className="text-gray-600">Upload multiple construction material products at once using CSV or Excel files</p>
          <button
            onClick={() => navigate("/seller/my-products")}
            className="mt-4 text-[#FB8B24] hover:text-[#E36414] font-medium"
          >
            ← Back to My Products
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 hover:border-[#FB8B24] hover:bg-[#FB8B24] hover:bg-opacity-5"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input").click()}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-3 bg-[#FB8B24] bg-opacity-20 rounded-full">
                <FaUpload className="w-8 h-8 text-[#FB8B24]" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drag and drop your catalog files here
                </p>
                <p className="text-sm text-gray-500 mt-1">or</p>
                <span className="text-[#FB8B24] hover:text-[#E36414] font-medium">
                  browse files from your computer
                </span>
              </div>
            </div>
            <input
              id="file-input"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  onDrop(Array.from(e.target.files));
                }
              }}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Selected Files ({files.length})
              </h3>
              <ul className="divide-y divide-gray-200">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type.toUpperCase()} • {new Date(file.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <div className="mb-2">📋 <strong>Supported formats:</strong> CSV, XLS, XLSX</div>
              <div className="text-xs text-gray-500">
                Download template: 
                <a href="#" className="text-[#FB8B24] hover:text-[#E36414] ml-2">
                  CSV Template
                </a> | 
                <a href="#" className="text-[#FB8B24] hover:text-[#E36414] ml-2">
                  Excel Template
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                isUploading || files.length === 0
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-[#FB8B24] hover:bg-[#E36414] text-white"
              }`}
            >
              <FaUpload />
              {isUploading ? "Processing..." : "Upload & Process Files"}
            </button>
          </div>

          {/* Status Message */}
          {uploadStatus && (
            <div
              className={`mt-4 p-3 rounded-md ${
                uploadStatus.includes("Successfully") || uploadStatus.includes("successfully")
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bulk Upload Instructions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-[#FB8B24] text-2xl mb-2">1</div>
              <h3 className="font-semibold text-gray-800 mb-2">Prepare Your File</h3>
              <p className="text-sm text-gray-600">
                Download our template and fill in your product details including product name, category, price, stock, etc.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-[#FB8B24] text-2xl mb-2">2</div>
              <h3 className="font-semibold text-gray-800 mb-2">Upload File</h3>
              <p className="text-sm text-gray-600">
                Drag and drop your CSV or Excel file, or click to browse and select files from your computer.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-[#FB8B24] text-2xl mb-2">3</div>
              <h3 className="font-semibold text-gray-800 mb-2">Review & Publish</h3>
              <p className="text-sm text-gray-600">
                Review the uploaded products, make any necessary edits, and publish them to your catalog.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">📝 Required Columns for CSV/Excel:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <span className="bg-white px-2 py-1 rounded border">product_name</span>
              <span className="bg-white px-2 py-1 rounded border">category</span>
              <span className="bg-white px-2 py-1 rounded border">sub_category</span>
              <span className="bg-white px-2 py-1 rounded border">brand</span>
              <span className="bg-white px-2 py-1 rounded border">material</span>
              <span className="bg-white px-2 py-1 rounded border">mrp</span>
              <span className="bg-white px-2 py-1 rounded border">selling_price</span>
              <span className="bg-white px-2 py-1 rounded border">stock_quantity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkCatalogUpload;