import React, { useState, useEffect } from 'react';
import { Star, Filter, Check, X, MessageSquare, ThumbsUp, Calendar } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        rating: 'all',
        status: 'all',
        sort: 'newest'
    });
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });

    useEffect(() => {
        fetchReviews();
        fetchReviewStats();
    }, [filters]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`${API_URL}/seller/reviews?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setReviews(response.data.reviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/seller/reviews/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching review stats:', error);
        }
    };

    const updateReviewStatus = async (reviewId, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/seller/reviews/${reviewId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setReviews(reviews.map(review =>
                    review._id === reviewId ? { ...review, status } : review
                ));
                alert('Review status updated');
            }
        } catch (error) {
            console.error('Error updating review status:', error);
            alert('Failed to update review status');
        }
    };

    const replyToReview = async (reviewId, reply) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/seller/reviews/${reviewId}/reply`,
                { reply },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setReviews(reviews.map(review =>
                    review._id === reviewId ? { ...review, reply: { text: reply, date: new Date() } } : review
                ));
                alert('Reply submitted');
            }
        } catch (error) {
            console.error('Error replying to review:', error);
            alert('Failed to submit reply');
        }
    };

    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
            />
        ));
    };

    const getRatingPercentage = (stars) => {
        const total = stats.ratingDistribution[5] + stats.ratingDistribution[4] +
            stats.ratingDistribution[3] + stats.ratingDistribution[2] +
            stats.ratingDistribution[1];
        return total > 0 ? (stats.ratingDistribution[stars] / total) * 100 : 0;
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Customer Reviews</h1>
                <p className="text-gray-600">Manage and respond to customer feedback</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Average Rating</p>
                            <div className="flex items-center mt-2">
                                <span className="text-3xl font-bold text-gray-800">{stats.averageRating.toFixed(1)}</span>
                                <div className="flex ml-3">
                                    {renderStars(Math.round(stats.averageRating))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Based on {stats.totalReviews} reviews
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Star className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Rating Distribution</h3>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => (
                            <div key={stars} className="flex items-center">
                                <div className="flex items-center w-16">
                                    <span className="text-sm text-gray-600 mr-2">{stars}</span>
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                </div>
                                <div className="flex-1 ml-3">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400"
                                            style={{ width: `${getRatingPercentage(stars)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-600 ml-3 w-10">
                                    {stats.ratingDistribution[stars]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Review Status</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-700">Published</span>
                            <span className="font-medium">
                                {reviews.filter(r => r.status === 'published').length}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Pending</span>
                            <span className="font-medium">
                                {reviews.filter(r => r.status === 'pending').length}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">With Reply</span>
                            <span className="font-medium">
                                {reviews.filter(r => r.reply).length}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Reported</span>
                            <span className="font-medium">
                                {reviews.filter(r => r.reported).length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Filter className="w-4 h-4 inline mr-2" />
                            Filter by Rating
                        </label>
                        <select
                            value={filters.rating}
                            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="pending">Pending</option>
                            <option value="hidden">Hidden</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort By
                        </label>
                        <select
                            value={filters.sort}
                            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No reviews found</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="bg-white rounded-xl shadow p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center mb-2">
                                        <img
                                            src={review.customer?.avatar || 'https://via.placeholder.com/40'}
                                            alt={review.customer?.name}
                                            className="w-10 h-10 rounded-full mr-3"
                                        />
                                        <div>
                                            <h4 className="font-medium text-gray-800">{review.customer?.name}</h4>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center mb-3">
                                        <div className="flex mr-3">
                                            {renderStars(review.rating)}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {review.rating}.0 rating
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mb-4">{review.comment}</p>

                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mb-4">
                                            {review.images.slice(0, 3).map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt={`Review ${index + 1}`}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Product Info */}
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-4">
                                        <img
                                            src={review.product?.image || 'https://via.placeholder.com/50'}
                                            alt={review.product?.name}
                                            className="w-12 h-12 object-cover rounded mr-3"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-800">{review.product?.name}</p>
                                            <p className="text-sm text-gray-500">SKU: {review.product?.sku}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${review.status === 'published' ? 'bg-green-100 text-green-800' :
                                        review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {review.status}
                                    </span>
                                    {review.reported && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Reported
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Seller Reply */}
                            {review.reply ? (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                                <ThumbsUp className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-blue-800">Your Reply</span>
                                        </div>
                                        <span className="text-sm text-blue-600">
                                            {new Date(review.reply.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-blue-900">{review.reply.text}</p>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <textarea
                                        id={`reply-${review._id}`}
                                        placeholder="Write a reply to this review..."
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                const replyText = document.getElementById(`reply-${review._id}`).value;
                                                if (replyText.trim()) {
                                                    replyToReview(review._id, replyText);
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => updateReviewStatus(review._id, 'published')}
                                    className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-800"
                                >
                                    <Check className="w-4 h-4" />
                                    Publish
                                </button>
                                <button
                                    onClick={() => updateReviewStatus(review._id, 'hidden')}
                                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800"
                                >
                                    <X className="w-4 h-4" />
                                    Hide
                                </button>
                                {review.reported && (
                                    <button
                                        onClick={() => console.log('Review reported action')}
                                        className="px-3 py-2 text-orange-600 hover:text-orange-800"
                                    >
                                        View Report
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reviews;