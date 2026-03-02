import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://bricks-backend-qyea.onrender.com/api";

const ContractorsList = () => {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, verified, pending, rejected
  const [selectedContractors, setSelectedContractors] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contractorToDelete, setContractorToDelete] = useState(null);

  useEffect(() => {
    fetchContractors();
  }, [filter]);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/contractor`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Apply filter
      let filteredData = response.data.data || [];

      if (filter === "verified") {
        filteredData = filteredData.filter(
          (c) => c.isVerified && c.verificationStatus === "verified",
        );
      } else if (filter === "pending") {
        filteredData = filteredData.filter(
          (c) => c.verificationStatus === "pending",
        );
      } else if (filter === "rejected") {
        filteredData = filteredData.filter(
          (c) => c.verificationStatus === "rejected",
        );
      }

      setContractors(filteredData);
    } catch (error) {
      console.error("Error fetching contractors:", error);
      alert("Failed to load contractors");
    } finally {
      setLoading(false);
    }
  };

  // Search function
  const filteredContractors = contractors.filter((contractor) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();
    return (
      contractor.name?.toLowerCase().includes(searchLower) ||
      contractor.companyName?.toLowerCase().includes(searchLower) ||
      contractor.email?.toLowerCase().includes(searchLower) ||
      contractor.phone?.includes(search) ||
      contractor.contractorType?.toLowerCase().includes(searchLower) ||
      contractor.address?.city?.toLowerCase().includes(searchLower) ||
      contractor.address?.state?.toLowerCase().includes(searchLower)
    );
  });

  const handleVerify = async (contractorId) => {
    if (!window.confirm("Are you sure you want to verify this contractor?"))
      return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/admin/contractors/${contractorId}/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Contractor verified successfully!");
      fetchContractors();
    } catch (error) {
      console.error("Error verifying contractor:", error);
      alert(error.response?.data?.message || "Failed to verify contractor");
    }
  };

  const handleUnverify = async (contractorId) => {
    if (
      !window.confirm(
        "Are you sure you want to reject/unverify this contractor?",
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/admin/contractors/${contractorId}/unverify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Contractor unverified successfully!");
      fetchContractors();
    } catch (error) {
      console.error("Error unverifying contractor:", error);
      alert(error.response?.data?.message || "Failed to unverify contractor");
    }
  };

  const handleDeleteClick = (contractor) => {
    setContractorToDelete(contractor);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!contractorToDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/admin/contractors/${contractorToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Contractor deleted successfully!");
      setShowDeleteModal(false);
      setContractorToDelete(null);
      fetchContractors();
    } catch (error) {
      console.error("Error deleting contractor:", error);
      alert(error.response?.data?.message || "Failed to delete contractor");
    }
  };

  const toggleSelectAll = () => {
    if (selectedContractors.length === filteredContractors.length) {
      setSelectedContractors([]);
    } else {
      setSelectedContractors(filteredContractors.map((c) => c._id));
    }
  };

  const toggleSelectContractor = (contractorId) => {
    if (selectedContractors.includes(contractorId)) {
      setSelectedContractors(
        selectedContractors.filter((id) => id !== contractorId),
      );
    } else {
      setSelectedContractors([...selectedContractors, contractorId]);
    }
  };

  const handleBulkVerify = async () => {
    if (selectedContractors.length === 0) {
      alert("Please select contractors to verify");
      return;
    }

    if (
      !window.confirm(
        `Verify ${selectedContractors.length} selected contractors?`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");

      // Verify each contractor
      for (const contractorId of selectedContractors) {
        await axios.put(
          `${API_URL}/admin/contractors/${contractorId}/verify`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }

      alert(`${selectedContractors.length} contractors verified successfully!`);
      setSelectedContractors([]);
      fetchContractors();
    } catch (error) {
      console.error("Error bulk verifying:", error);
      alert("Failed to verify some contractors");
    }
  };

  const getStatusBadge = (contractor) => {
    if (contractor.verificationStatus === "verified" && contractor.isVerified) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Verified
        </span>
      );
    } else if (contractor.verificationStatus === "pending") {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Pending
        </span>
      );
    } else if (contractor.verificationStatus === "rejected") {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Company",
      "Email",
      "Phone",
      "Type",
      "Experience",
      "Status",
      "City",
      "State",
      "Join Date",
    ];
    const csvData = contractors.map((contractor) => [
      contractor.name,
      contractor.companyName,
      contractor.email,
      contractor.phone,
      contractor.contractorType,
      `${contractor.experience} years`,
      contractor.verificationStatus,
      contractor.address?.city || "N/A",
      contractor.address?.state || "N/A",
      new Date(contractor.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contractors_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Contractors Management
            </h1>
            <p className="text-gray-600">Manage and verify all contractors</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Contractors</p>
              <p className="text-3xl font-bold">{contractors.length}</p>
            </div>
            <User className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Verified</p>
              <p className="text-3xl font-bold text-green-600">
                {
                  contractors.filter((c) => c.verificationStatus === "verified")
                    .length
                }
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {
                  contractors.filter((c) => c.verificationStatus === "pending")
                    .length
                }
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {
                  contractors.filter((c) => c.verificationStatus === "rejected")
                    .length
                }
              </p>
            </div>
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search contractors by name, company, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Contractors</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Verification</option>
              <option value="rejected">Rejected</option>
            </select>

            {selectedContractors.length > 0 && (
              <button
                onClick={handleBulkVerify}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
              >
                <UserCheck className="w-5 h-5 inline mr-2" />
                Verify Selected ({selectedContractors.length})
              </button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={
                selectedContractors.length === filteredContractors.length &&
                filteredContractors.length > 0
              }
              onChange={toggleSelectAll}
              className="w-5 h-5 rounded border-gray-300"
            />
            <span className="text-gray-600">
              {selectedContractors.length} of {filteredContractors.length}{" "}
              selected
            </span>
          </div>
        </div>
      </div>

      {/* Contractors Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-gray-700">Loading contractors...</p>
          </div>
        ) : filteredContractors.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No Contractors Found
            </h3>
            <p className="text-gray-500">
              {search
                ? "Try different search terms"
                : "No contractors available yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedContractors.length ===
                          filteredContractors.length &&
                        filteredContractors.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Contractor
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Contact
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Details
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContractors.map((contractor) => (
                  <tr key={contractor._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedContractors.includes(contractor._id)}
                        onChange={() => toggleSelectContractor(contractor._id)}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Building className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {contractor.companyName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {contractor.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {contractor.contractorType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {contractor.email}
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {contractor.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Experience:</span>{" "}
                          {contractor.experience} years
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Team:</span>{" "}
                          {contractor.teamSize}
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {contractor.address?.city || "N/A"},{" "}
                          {contractor.address?.state || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(contractor)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/contractors/${contractor._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>

                        {contractor.verificationStatus === "pending" && (
                          <button
                            onClick={() => handleVerify(contractor._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Verify Contractor"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        )}

                        {contractor.verificationStatus === "verified" && (
                          <button
                            onClick={() => handleUnverify(contractor._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Reject Contractor"
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteClick(contractor)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Contractor"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredContractors.length > 0 && (
        <div className="mt-8 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredContractors.length} of {contractors.length}{" "}
            contractors
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && contractorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Delete Contractor
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete{" "}
                <strong>{contractorToDelete.companyName}</strong>? This action
                cannot be undone.
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Warning</p>
                  <p className="text-sm text-red-600 mt-1">
                    This will permanently delete the contractor's account,
                    portfolio, and all associated data.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setContractorToDelete(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorsList;
