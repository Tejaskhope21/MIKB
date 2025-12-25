import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Star, 
  MapPin, 
  Users, 
  Calendar, 
  CheckCircle, 
  MessageSquare, 
  Building2, 
  ArrowLeft,
  Camera,
  X,
  Upload,
  Edit,
  Loader2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/contractor';

const ContractorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [contractor, setContractor] = useState(null);
  const [ratingsData, setRatingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const isLoggedIn = !!localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const currentUserRole = localStorage.getItem('role');

  // Check if current user is the contractor
  const isContractorOwner = contractor?.userId?._id === currentUserId || 
                          contractor?.userId === currentUserId;

  const userHasReviewed = ratingsData?.reviews?.some(
    (review) => review.clientId?.toString() === currentUserId
  );

  useEffect(() => {
    if (!id || id === 'undefined' || id.trim() === '') {
      setError('Invalid contractor profile link.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [contractorRes, ratingsRes] = await Promise.all([
          axios.get(`${API_BASE}/${id}`),
          axios.get(`${API_BASE}/${id}/ratings`)
        ]);

        setContractor(contractorRes.data.data);
        setRatingsData(ratingsRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Contractor not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
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
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await axios.post(
        `${API_BASE}/${id}/upload-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update contractor with new image
      setContractor(prev => ({
        ...prev,
        profileImage: response.data.data.imageUrl
      }));

      // Reset states
      setSelectedImage(null);
      setPreviewImage(null);
      setShowImageUpload(false);
      
      alert('Profile image updated successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image
  const handleRemoveImage = async () => {
    if (!isContractorOwner) return;

    if (!confirm('Are you sure you want to remove your profile image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE}/${id}/remove-image`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update contractor
      setContractor(prev => ({
        ...prev,
        profileImage: null
      }));
      
      alert('Profile image removed successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove image.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('Please login to submit a review.');
      return;
    }

    if (!reviewComment.trim()) {
      alert('Please add a comment to your review.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/${id}/reviews`,
        { rating: reviewRating, comment: reviewComment.trim() },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewComment('');
      
      // Refresh ratings data
      const res = await axios.get(`${API_BASE}/${id}/ratings`);
      setRatingsData(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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

  const averageRating = ratingsData?.averageRating || 0;
  const totalReviews = ratingsData?.totalReviews || 0;

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
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{contractor.companyName}</h1>
              <p className="text-lg text-gray-600 mb-4">{contractor.name}</p>
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">
                {contractor.contractorType}
              </span>
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
                  : 'Nationwide'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded">
              <Calendar className="w-5 h-5 text-gray-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Experience</div>
              <div className="font-semibold text-gray-900">{contractor.experience || 12}+ Years</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded">
              <Users className="w-5 h-5 text-gray-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Team Size</div>
              <div className="font-semibold text-gray-900">{contractor.teamSize || '5-20'}</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded">
              <CheckCircle className="w-5 h-5 text-gray-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Projects Done</div>
              <div className="font-semibold text-gray-900">{contractor.projectsCompleted || 100}+</div>
            </div>
          </div>

          {/* Description */}
          {contractor.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-600">{contractor.description}</p>
            </div>
          )}

          {/* Specialties */}
          {contractor.specialties && contractor.specialties.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {contractor.specialties.map((spec, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ratings Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Ratings</h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {renderStars(averageRating)}
                  </div>
                  <div className="text-gray-600">{totalReviews} reviews</div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-gray-900 font-medium">OK Positive Feedback</div>
            </div>
          </div>

          {/* Rating Bars */}
          <div className="space-y-3 mb-8">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingsData?.ratingBreakdown?.[stars] || 0;
              const total = totalReviews;
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-16">
                    <span className="text-sm font-medium text-gray-700">{stars}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-20">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>

          {/* Share Experience */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-center mb-4">Share Your Experience</h3>
            
            {!isLoggedIn ? (
              <div className="text-center">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Login to Review
                </button>
              </div>
            ) : userHasReviewed ? (
              <div className="text-center text-green-600 font-medium text-sm">
                ✓ You've already reviewed this contractor
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mx-auto text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Write Detailed Review
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews ({totalReviews})</h2>
          
          {(!ratingsData?.reviews || ratingsData.reviews.length === 0) ? (
            <div className="text-center py-12 bg-gray-50 rounded">
              <p className="text-gray-600 mb-4">No reviews yet</p>
              {isLoggedIn && !userHasReviewed && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Be the first to review
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {ratingsData.reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {review.clientName?.[0] || 'A'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {review.clientName || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    {review.wouldRecommend && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        ✓ Would recommend
                      </span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 text-sm">"{review.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && isContractorOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Upload Profile Image</h3>
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
                    {previewImage ? 'New image preview' : 'Current image'}
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
                    {selectedImage ? 'Change Image' : 'Select Image'}
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

      {/* Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Write Review</h3>
                <button 
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setReviewRating(num)}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${num <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorProfilePage;