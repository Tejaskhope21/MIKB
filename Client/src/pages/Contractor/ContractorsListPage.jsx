import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Briefcase, CheckCircle, Users } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ||
        (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1')
        ? 'https://bricks-backend-qyea.onrender.com/api'
        : 'https://bricks-backend-qyea.onrender.com/api';

const ContractorsListPage = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [withPortfolio, setWithPortfolio] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter options (from backend)
  const [filterOptions, setFilterOptions] = useState({
    specialties: [],
    cities: [],
    states: [],
  });

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await axios.get(`${API_BASE}/filter/options`);
        setFilterOptions(res.data.options || {});
      } catch (err) {
        console.error('Failed to load filter options');
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch contractors with filters
  useEffect(() => {
    fetchContractors();
  }, [page, search, ratingFilter, experienceFilter, locationFilter, specialtyFilter, verifiedOnly, withPortfolio]);

  const fetchContractors = async () => {
    setLoading(true);
    setError('');

    try {
      let url = `${API_BASE}/?page=${page}&limit=12`;

      // Add query params based on filters
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (ratingFilter) url += `&minRating=${ratingFilter}`;
      if (experienceFilter) url += `&minExperience=${experienceFilter}`;
      if (locationFilter) url += `&location=${encodeURIComponent(locationFilter)}`;
      if (specialtyFilter) url += `&specialty=${encodeURIComponent(specialtyFilter)}`;
      if (verifiedOnly) url += `&verified=true`;
      if (withPortfolio) url += `&withPortfolio=true`;

      const res = await axios.get(url);
      setContractors(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError('Failed to load contractors. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const num = parseFloat(rating) || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= num ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{num.toFixed(1)}</span>
      </div>
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setRatingFilter('');
    setExperienceFilter('');
    setLocationFilter('');
    setSpecialtyFilter('');
    setVerifiedOnly(false);
    setWithPortfolio(false);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Trusted Contractors</h1>
          <p className="text-gray-600 mt-2">Browse verified professionals for your next project</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Company name, description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                </select>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <select
                  value={experienceFilter}
                  onChange={(e) => { setExperienceFilter(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Experience</option>
                  <option value="5">5+ Years</option>
                  <option value="10">10+ Years</option>
                  <option value="15">15+ Years</option>
                </select>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
                  placeholder="City or State"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Specialty */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <select
                  value={specialtyFilter}
                  onChange={(e) => { setSpecialtyFilter(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Specialties</option>
                  {filterOptions.specialties?.map((spec) => (
                    <option key={spec._id} value={spec._id}>
                      {spec._id} ({spec.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Verified Only */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(1); }}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Verified Contractors Only</span>
                </label>
              </div>

              {/* With Portfolio */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={withPortfolio}
                    onChange={(e) => { setWithPortfolio(e.target.checked); setPage(1); }}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Has Portfolio Projects</span>
                </label>
              </div>
            </div>
          </div>

          {/* Contractors Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">Loading contractors...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : contractors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <p className="text-xl text-gray-600">No contractors found matching your filters.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {contractors.map((contractor) => (
                    <Link
                      key={contractor._id}
                      to={`/contractor/${contractor._id}`}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden block"
                    >
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                        <div className="bg-gray-300 border-2 border-dashed rounded-xl w-24 h-24" />
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {contractor.companyName}
                          </h3>
                          {contractor.isVerified && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Verified</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {contractor.description || 'Professional contractor services'}
                        </p>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {contractor.address?.city && contractor.address?.state
                                ? `${contractor.address.city}, ${contractor.address.state}`
                                : 'Location not listed'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="w-4 h-4" />
                            <span>{contractor.experience || 0} years experience</span>
                          </div>

                          <div className="flex items-center justify-between">
                            {renderStars(contractor.rating || 0)}
                            <span className="text-sm text-gray-500">
                              {contractor.reviews?.length || 0} reviews
                            </span>
                          </div>

                          {contractor.portfolio && contractor.portfolio.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Users className="w-4 h-4" />
                              <span>{contractor.portfolio.length} projects in portfolio</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                      Previous
                    </button>

                    <span className="px-4 py-2">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorsListPage;