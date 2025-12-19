import React, { useState } from "react";
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";

const SellerVerification = ({ sellers, onVerify, onReject, loading }) => {
  const [selectedSeller, setSelectedSeller] = useState(null);

  const handleViewDetails = (seller) => {
    setSelectedSeller(seller);
  };

  const handleVerify = (sellerId) => {
    onVerify(sellerId);
    setSelectedSeller(null);
  };

  const handleReject = (sellerId) => {
    onReject(sellerId);
    setSelectedSeller(null);
  };

  return (
    <div className="space-y-6">
      {/* Verification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-blue-600 text-sm font-medium">Pending Verification</div>
          <div className="text-2xl font-bold text-blue-700">
            {sellers.filter(s => s.status === 'pending').length}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-green-600 text-sm font-medium">Verified Today</div>
          <div className="text-2xl font-bold text-green-700">
            {sellers.filter(s => s.verifiedDate === new Date().toISOString().split('T')[0]).length}
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-yellow-600 text-sm font-medium">Requires Attention</div>
          <div className="text-2xl font-bold text-yellow-700">
            {sellers.filter(s => s.requiresAttention).length}
          </div>
        </div>
      </div>

      {/* Sellers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sellers.filter(s => s.status === 'pending').map((seller) => (
                <tr key={seller.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{seller.name}</div>
                      <div className="text-sm text-gray-500">{seller.email}</div>
                      <div className="text-sm text-gray-500">{seller.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{seller.businessName}</div>
                      <div className="text-sm text-gray-500">{seller.businessType}</div>
                      <div className="text-sm text-gray-500">GST: {seller.gstNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(seller)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Docs
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerify(seller.id)}
                        className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(seller.id)}
                        className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleViewDetails(seller)}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Document View */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Seller Verification Details</h3>
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Seller Info */}
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {selectedSeller.name}</div>
                    <div><strong>Email:</strong> {selectedSeller.email}</div>
                    <div><strong>Phone:</strong> {selectedSeller.phone}</div>
                    <div><strong>Address:</strong> {selectedSeller.address}</div>
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <h4 className="font-semibold mb-2">Business Information</h4>
                  <div className="space-y-2">
                    <div><strong>Business Name:</strong> {selectedSeller.businessName}</div>
                    <div><strong>Business Type:</strong> {selectedSeller.businessType}</div>
                    <div><strong>GST Number:</strong> {selectedSeller.gstNumber}</div>
                    <div><strong>PAN Number:</strong> {selectedSeller.panNumber}</div>
                  </div>
                </div>

                {/* Documents */}
                <div className="md:col-span-2">
                  <h4 className="font-semibold mb-2">Uploaded Documents</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedSeller.documents?.map((doc, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="font-medium mb-2">{doc.type}</div>
                        <img
                          src={doc.url}
                          alt={doc.type}
                          className="w-full h-32 object-cover rounded"
                        />
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Full Document
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => handleReject(selectedSeller.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject Application
                </button>
                <button
                  onClick={() => handleVerify(selectedSeller.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve & Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerVerification;