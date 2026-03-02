import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  Building2,
  ArrowLeft,
  Camera,
  X,
  Upload,
  Phone,
  Mail,
  Globe,
  FileText,
  Award,
  Briefcase,
  Loader2,
} from "lucide-react";

const API_BASE = "https://bricks-backend-qyea.onrender.com/api/contractor";

const ContractorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const isLoggedIn = !!localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  // Check if current user is the contractor
  const isContractorOwner =
    contractor?.userId?._id === currentUserId ||
    contractor?.userId === currentUserId;

  useEffect(() => {
    if (!id || id === "undefined" || id.trim() === "") {
      setError("Invalid contractor profile link.");
      setLoading(false);
      return;
    }

    const fetchContractor = async () => {
      try {
        const response = await axios.get(`${API_BASE}/${id}`);
        setContractor(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Contractor not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchContractor();
  }, [id]);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, GIF, WebP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage || !isContractorOwner) return;

    setUploadingImage(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await axios.post(
        `${API_BASE}/${id}/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Update contractor with new image
      setContractor((prev) => ({
        ...prev,
        profileImage: response.data.data.imageUrl,
      }));

      // Reset states
      setSelectedImage(null);
      setPreviewImage(null);
      setShowImageUpload(false);

      alert("Profile image updated successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to upload image. Please try again.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image
  const handleRemoveImage = async () => {
    if (!isContractorOwner) return;

    if (!confirm("Are you sure you want to remove your profile image?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/${id}/remove-image`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update contractor
      setContractor((prev) => ({
        ...prev,
        profileImage: null,
      }));

      alert("Profile image removed successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove image.");
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "Not available";
    // Format as XXX-XXX-XXXX for 10 digit numbers
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
    return phone;
  };

  const handleContactClick = () => {
    if (contractor.phone) {
      window.location.href = `tel:${contractor.phone}`;
    }
  };

  const handleEmailClick = () => {
    if (contractor.email) {
      window.location.href = `mailto:${contractor.email}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contractor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contractor Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
            {/* Profile Image with Upload Option */}
            <div className="relative group">
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {contractor.profileImage ? (
                  <img
                    src={contractor.profileImage}
                    alt={contractor.companyName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-16 h-16 text-gray-400" />
                )}
              </div>

              {/* Upload Button for Contractor Owner */}
              {isContractorOwner && (
                <>
                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    title="Change profile image"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {contractor.profileImage && (
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {contractor.companyName}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{contractor.name}</p>

              {/* Contractor Type Badge */}
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium mb-4">
                {contractor.contractorType}
              </span>

              {/* Contact Information */}
              <div className="space-y-3 mt-6">
                {contractor.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Phone Number</div>
                      <button
                        onClick={handleContactClick}
                        className="text-blue-600 hover:text-blue-800 font-medium text-lg"
                      >
                        {formatPhoneNumber(contractor.phone)}
                      </button>
                    </div>
                  </div>
                )}

                {contractor.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <button
                        onClick={handleEmailClick}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {contractor.email}
                      </button>
                    </div>
                  </div>
                )}

                {contractor.address &&
                  (contractor.address.city || contractor.address.state) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">Location</div>
                        <div className="font-medium text-gray-900">
                          {contractor.address.city && contractor.address.state
                            ? `${contractor.address.city}, ${contractor.address.state}`
                            : contractor.address.city ||
                              contractor.address.state ||
                              "Nationwide"}
                          {contractor.address.country &&
                            contractor.address.country !== "India" &&
                            `, ${contractor.address.country}`}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded">
              <MapPin className="w-5 h-5 text-gray-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Service Area</div>
              <div className="font-semibold text-gray-900">
                {contractor.address?.city && contractor.address?.state
                  ? `${contractor.address.city}, ${contractor.address.state}`
                  : "Nationwide"}
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded">
              <Calendar className="w-5 h-5 text-gray-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Experience</div>
              <div className="font-semibold text-gray-900">
                {contractor.experience || 1}+ Years
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded">
              <Users className="w-5 h-5 text-gray-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Team Size</div>
              <div className="font-semibold text-gray-900">
                {contractor.teamSize || "1-5"}
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded">
              <CheckCircle className="w-5 h-5 text-gray-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Projects Done</div>
              <div className="font-semibold text-gray-900">
                {contractor.projectsCompleted || 0}
              </div>
            </div>
          </div>

          {/* Business Details Section */}
          <div className="space-y-6">
            {/* License Information */}
            {contractor.licenseNumber && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    License Information
                  </h3>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">
                        License Number
                      </div>
                      <div className="font-mono text-gray-900">
                        {contractor.licenseNumber}
                      </div>
                    </div>
                    {contractor.isVerified && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Specialties */}
            {contractor.specialties && contractor.specialties.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Specialties
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contractor.specialties.map((spec, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Summary */}
            {contractor.portfolio && contractor.portfolio.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Portfolio ({contractor.portfolio.length} Projects)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contractor.portfolio.slice(0, 3).map((project, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-gray-900 mb-2">
                        {project.title}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {project.category}
                      </div>
                      <div className="text-xs text-gray-500">
                        {project.year} • {project.status}
                      </div>
                    </div>
                  ))}
                </div>
                {contractor.portfolio.length > 3 && (
                  <div className="text-center mt-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View all {contractor.portfolio.length} projects →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Additional Business Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contractor.website && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Website</div>
                      <a
                        href={
                          contractor.website.startsWith("http")
                            ? contractor.website
                            : `https://${contractor.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {contractor.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}

                {contractor.gstNumber && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">GST Number</div>
                      <div className="font-mono text-gray-900">
                        {contractor.gstNumber}
                      </div>
                    </div>
                  </div>
                )}

                {contractor.bankDetails && (
                  <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Banking Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {contractor.bankDetails.accountName && (
                        <div>
                          <div className="text-xs text-blue-700">
                            Account Name
                          </div>
                          <div className="font-medium">
                            {contractor.bankDetails.accountName}
                          </div>
                        </div>
                      )}
                      {contractor.bankDetails.bankName && (
                        <div>
                          <div className="text-xs text-blue-700">Bank Name</div>
                          <div className="font-medium">
                            {contractor.bankDetails.bankName}
                          </div>
                        </div>
                      )}
                      {contractor.bankDetails.ifscCode && (
                        <div>
                          <div className="text-xs text-blue-700">IFSC Code</div>
                          <div className="font-mono">
                            {contractor.bankDetails.ifscCode}
                          </div>
                        </div>
                      )}
                      {contractor.bankDetails.upiId && (
                        <div>
                          <div className="text-xs text-blue-700">UPI ID</div>
                          <div className="font-medium">
                            {contractor.bankDetails.upiId}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && isContractorOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Upload Profile Image
                </h3>
                <button
                  onClick={() => {
                    setShowImageUpload(false);
                    setSelectedImage(null);
                    setPreviewImage(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={uploadingImage}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Image Preview */}
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg overflow-hidden mb-4">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : contractor.profileImage ? (
                      <img
                        src={contractor.profileImage}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {previewImage ? "New image preview" : "Current image"}
                  </p>
                </div>

                {/* Upload Button */}
                <div className="text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm flex items-center gap-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    {selectedImage ? "Change Image" : "Select Image"}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Max file size: 5MB • Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImageUpload(false);
                      setSelectedImage(null);
                      setPreviewImage(null);
                    }}
                    disabled={uploadingImage}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={!selectedImage || uploadingImage}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorProfilePage;
