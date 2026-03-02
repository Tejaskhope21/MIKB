import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Award,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Image,
  ExternalLink,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://bricks-backend-qyea.onrender.com/api";

const ContractorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchContractorDetails();
  }, [id]);

  const fetchContractorDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/contractor/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setContractor(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching contractor details:", error);
      alert("Failed to load contractor details");
      navigate("/admin/contractors");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!window.confirm("Are you sure you want to verify this contractor?"))
      return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/admin/contractors/${id}/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Contractor verified successfully!");
      fetchContractorDetails();
    } catch (error) {
      console.error("Error verifying contractor:", error);
      alert(error.response?.data?.message || "Failed to verify contractor");
    }
  };

  const handleUnverify = async () => {
    if (!window.confirm("Are you sure you want to reject this contractor?"))
      return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/admin/contractors/${id}/unverify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Contractor rejected successfully!");
      fetchContractorDetails();
    } catch (error) {
      console.error("Error rejecting contractor:", error);
      alert(error.response?.data?.message || "Failed to reject contractor");
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this contractor permanently?",
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/admin/contractors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Contractor deleted successfully!");
      navigate("/admin/contractors");
    } catch (error) {
      console.error("Error deleting contractor:", error);
      alert(error.response?.data?.message || "Failed to delete contractor");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700">
            Loading contractor details...
          </p>
        </div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="text-center p-12">
        <AlertCircle className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Contractor Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The contractor you're looking for doesn't exist.
        </p>
        <Link
          to="/admin/contractors"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Back to Contractors
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin/contractors"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Contractors
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {contractor.companyName}
            </h1>
            <p className="text-gray-600">
              {contractor.name} • {contractor.contractorType}
            </p>
          </div>

          <div className="flex gap-4">
            {contractor.verificationStatus === "pending" && (
              <button
                onClick={handleVerify}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Verify Contractor
              </button>
            )}

            {contractor.verificationStatus === "verified" && (
              <button
                onClick={handleUnverify}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Reject Contractor
              </button>
            )}

            <button
              onClick={handleDelete}
              className="px-6 py-3 border border-red-600 text-red-600 rounded-xl hover:bg-red-50 font-medium flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-8">
        {contractor.verificationStatus === "verified" &&
        contractor.isVerified ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-xl">
            <CheckCircle className="w-6 h-6" />
            <span className="font-bold">Verified Contractor</span>
            <span className="text-sm">
              • Verified on{" "}
              {new Date(contractor.updatedAt).toLocaleDateString()}
            </span>
          </div>
        ) : contractor.verificationStatus === "pending" ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-800 rounded-xl">
            <AlertCircle className="w-6 h-6" />
            <span className="font-bold">Pending Verification</span>
            <span className="text-sm">• Waiting for approval</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 text-red-800 rounded-xl">
            <XCircle className="w-6 h-6" />
            <span className="font-bold">Rejected</span>
            <span className="text-sm">• Contractor not approved</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-1 font-medium border-b-2 ${activeTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`pb-4 px-1 font-medium border-b-2 ${activeTab === "portfolio" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Portfolio ({contractor.portfolio?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`pb-4 px-1 font-medium border-b-2 ${activeTab === "documents" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Documents
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium">{contractor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${contractor.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contractor.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${contractor.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contractor.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company Name</p>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{contractor.companyName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">License Number</p>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{contractor.licenseNumber}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Contractor Type
                    </p>
                    <p className="font-medium">{contractor.contractorType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Address
              </h2>
              <div className="space-y-4">
                {contractor.address?.street && (
                  <p className="text-gray-700">{contractor.address.street}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">City</p>
                    <p className="font-medium">
                      {contractor.address?.city || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">State</p>
                    <p className="font-medium">
                      {contractor.address?.state || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pincode</p>
                    <p className="font-medium">
                      {contractor.address?.pincode || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Country</p>
                    <p className="font-medium">
                      {contractor.address?.country || "India"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-8">
            {/* Professional Stats */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-600" />
                Professional Stats
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-2xl">
                        {contractor.experience || 0}
                      </p>
                      <p className="text-sm text-gray-500">Years Experience</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-2xl">
                        {contractor.projectsCompleted || 0}
                      </p>
                      <p className="text-sm text-gray-500">
                        Projects Completed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-2xl">
                        {contractor.teamSize || "1-5"}
                      </p>
                      <p className="text-sm text-gray-500">Team Size</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="font-medium">
                      {new Date(contractor.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="font-medium">
                      {new Date(contractor.updatedAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Account Status</p>
                  <p
                    className={`font-bold ${contractor.isActive ? "text-green-600" : "text-red-600"}`}
                  >
                    {contractor.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>

            {/* Specialties */}
            {contractor.specialties && contractor.specialties.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Specialties
                </h2>
                <div className="flex flex-wrap gap-2">
                  {contractor.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "portfolio" && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Portfolio Projects
            </h2>
            <span className="text-gray-600">
              {contractor.portfolio?.length || 0} projects
            </span>
          </div>

          {contractor.portfolio?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contractor.portfolio.map((project, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    {project.images && project.images.length > 0 ? (
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-900">
                        {project.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${project.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description || "No description available"}
                    </p>
                    <div className="space-y-2">
                      {project.category && (
                        <p className="text-sm">
                          <span className="font-medium">Category:</span>{" "}
                          {project.category}
                        </p>
                      )}
                      {project.location && (
                        <p className="text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {project.location}
                        </p>
                      )}
                      {project.year && (
                        <p className="text-sm">
                          <span className="font-medium">Year:</span>{" "}
                          {project.year}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No Portfolio Projects
              </h3>
              <p className="text-gray-500">
                This contractor hasn't added any portfolio projects yet.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Documents & Verification
          </h2>

          <div className="space-y-6">
            {/* License Document */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    Contractor License
                  </h3>
                  <p className="text-gray-600">
                    License Number: {contractor.licenseNumber}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                  Verified
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                This contractor's license has been verified and is valid.
              </p>
            </div>

            {/* Verification Status */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Verification History
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Account Created</p>
                    <p className="text-sm text-gray-500">
                      {new Date(contractor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>

                {contractor.verificationStatus === "verified" && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Account Verified</p>
                      <p className="text-sm text-gray-500">
                        {new Date(contractor.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Admin Notes
              </h3>
              <textarea
                placeholder="Add notes about this contractor..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorDetails;
