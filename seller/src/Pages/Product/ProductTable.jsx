import React from "react";
import { Link } from "react-router-dom";

const ProductTable = ({
  products,
  filteredProducts,
  filter,
  searchTerm,
  handleDelete,
}) => {
  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Stock</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Created</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-4 text-center text-gray-500">
                {products.length === 0
                  ? "No products found. Add your first product to start selling!"
                  : `No products match your search criteria: "${searchTerm || filter || "None"}"`}
              </td>
            </tr>
          ) : (
            filteredProducts.map((product, index) => (
              <tr
                key={product._id || index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="p-3">
                  <div className="flex items-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.details?.productName || "Product"}
                        className="w-10 h-10 object-cover rounded mr-3"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.png"; // Fallback image
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {product.details?.productName || "Unnamed Product"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.details?.brand || "No Brand"}
                      </div>
                    </div>
                     </div>
                  </td>
                 
                <td className="p-3">
                  <div className="text-sm">
                    <div>{product.category || "N/A"}</div>
                    <div className="text-gray-500">
                      {product.subCategory || "N/A"}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-sm">
                    <div>MRP: ₹{product.details?.mrp || "N/A"}</div>
                    <div>Price: ₹{product.details?.sellingPrice || "N/A"}</div>
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      (product.details?.stockQuantity || 0) > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.details?.stockQuantity || 0} in stock
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      product.status === "published"
                        ? "bg-green-100 text-green-800"
                        : product.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.status || "draft"}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Link
                      to={`/edit-product/${product._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {filteredProducts.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 p-3">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      )}
    </div>
  );
};

export default ProductTable;