// controllers/contractor/contractor.controller.js
import Contractor from '../models/Contractor.model.js';

// @desc    Get all contractors
// @route   GET /api/contractor
// @access  Public
// contractor.controller.js (Backend)

// GET /api/contractor/contractors - Get all contractors
export const getAllContractors = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search,
            specialty,
            location,
            minRating,
            maxRating,
            minExperience,
            maxExperience,
            sortBy = 'rating',
            verified,
            withPortfolio
        } = req.query;
        
        // Build query
        let query = {};
        
        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { specialties: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (specialty) {
            query.specialties = specialty;
        }
        
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        
        if (minRating) {
            query.rating = { $gte: parseFloat(minRating) };
        }
        
        // Execute query
        const skip = (page - 1) * limit;
        
        const contractors = await Contractor.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ rating: -1 }); // Default sort
        
        const total = await Contractor.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: contractors,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            message: 'Contractors fetched successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};



// GET /api/contractor/contractors/:id - Get contractor by ID
export const getContractorById = async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.params.id);
        
        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: contractor,
            message: 'Contractor details fetched successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// POST /api/contractor/contractors/:id/reviews - Add review
export const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, projectType } = req.body;
        
        const contractor = await Contractor.findById(id);
        
        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }
        
        const review = {
            rating,
            comment,
            projectType,
            user: req.user?._id || 'Anonymous',
            createdAt: new Date()
        };
        
        contractor.reviews.push(review);
        
        // Update average rating
        const totalReviews = contractor.reviews.length;
        const totalRating = contractor.reviews.reduce((sum, r) => sum + r.rating, 0);
        contractor.rating = totalRating / totalReviews;
        
        await contractor.save();
        
        res.status(201).json({
            success: true,
            data: review,
            message: 'Review added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get contractor portfolio
// @route   GET /api/contractor/portfolio/projects
// @access  Private (Contractor only)
export const getContractorPortfolio = async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.user.id)
            .select('portfolio');

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        res.json({
            success: true,
            portfolio: contractor.portfolio || [],
            count: contractor.portfolio?.length || 0
        });
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Add project to portfolio
// @route   POST /api/contractor/portfolio/projects
// @access  Private (Contractor only)
export const addPortfolioProject = async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.user.id);

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        const {
            title,
            description,
            category,
            client,
            location,
            year,
            budget,
            images = [],
            status = 'completed'
        } = req.body;

        // Validation
        if (!title || !category || !client) {
            return res.status(400).json({
                success: false,
                message: 'Title, category, and client are required'
            });
        }

        const project = {
            title,
            description,
            category,
            client,
            location: location || contractor.address?.city || 'Unknown',
            year: year || new Date().getFullYear(),
            budget: budget || 0,
            images: Array.isArray(images) ? images : [],
            status
        };

        contractor.portfolio.push(project);
        await contractor.save();

        // Increment portfolio views
        contractor.portfolioViews += 1;
        await contractor.save();

        res.status(201).json({
            success: true,
            message: 'Project added to portfolio successfully',
            project,
            portfolioCount: contractor.portfolio.length
        });
    } catch (error) {
        console.error('Add portfolio error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update portfolio project
// @route   PUT /api/contractor/portfolio/projects/:projectId
// @access  Private (Contractor only)
export const updatePortfolioProject = async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.user.id);

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        const projectId = req.params.projectId;
        const project = contractor.portfolio.id(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found in portfolio'
            });
        }

        // Update project fields
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                project[key] = req.body[key];
            }
        });

        await contractor.save();

        res.json({
            success: true,
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        console.error('Update portfolio error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Delete portfolio project
// @route   DELETE /api/contractor/portfolio/projects/:projectId
// @access  Private (Contractor only)
export const deletePortfolioProject = async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.user.id);

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        const projectId = req.params.projectId;
        contractor.portfolio = contractor.portfolio.filter(
            project => project._id.toString() !== projectId
        );

        await contractor.save();

        res.json({
            success: true,
            message: 'Project deleted from portfolio',
            portfolioCount: contractor.portfolio.length
        });
    } catch (error) {
        console.error('Delete portfolio error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};



// @desc    Update contractor analytics
// @route   PUT /api/contractor/analytics/view
// @access  Private (Contractor only)
export const updateContractorAnalytics = async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.user.id);

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        const { type } = req.body; // 'profile' or 'portfolio'

        if (type === 'profile') {
            contractor.profileViews += 1;
        } else if (type === 'portfolio') {
            contractor.portfolioViews += 1;
        }

        await contractor.save();

        res.json({
            success: true,
            message: 'Analytics updated',
            analytics: {
                profileViews: contractor.profileViews,
                portfolioViews: contractor.portfolioViews
            }
        });
    } catch (error) {
        console.error('Update analytics error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get contractor stats
// @route   GET /api/contractor/stats/dashboard
// @access  Private (Contractor only)
export const getContractorStats = async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.user.id)
            .select('portfolio projectsCompleted ratings profileViews portfolioViews quoteRequests reviews');

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        const stats = {
            portfolio: {
                total: contractor.portfolio?.length || 0,
                completed: contractor.portfolio?.filter(p => p.status === 'completed').length || 0,
                ongoing: contractor.portfolio?.filter(p => p.status === 'ongoing').length || 0
            },
            ratings: contractor.ratings,
            projectsCompleted: contractor.projectsCompleted,
            analytics: {
                profileViews: contractor.profileViews,
                portfolioViews: contractor.portfolioViews,
                quoteRequests: contractor.quoteRequests
            },
            reviews: {
                total: contractor.reviews?.length || 0,
                recent: contractor.reviews?.slice(0, 5) || []
            }
        };

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get contractor stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
// controllers/contractor/contractorFilter.controller.js


/**
 * @desc    Advanced search and filter contractors
 * @route   GET /api/contractors/filter
 * @access  Public
 * @param   {Object} req.query - Filter parameters
 * @returns {Array} Filtered contractors with pagination
 */
export const filterContractors = async (req, res) => {
    try {
        const {
            // Basic search
            search,
            
            // Location filters
            location,
            city,
            state,
            pincode,
            
            // Rating filters
            minRating,
            maxRating,
            
            // Experience filters
            minExperience,
            maxExperience,
            
            // Specialization filters
            specialties,
            contractorType,
            
            // Business filters
            teamSize,
            minProjectsCompleted,
            
            // Portfolio filters
            portfolioCategory,
            portfolioStatus,
            
            // Verification filters
            verified,
            
            // Sorting
            sortBy = 'ratings.average',
            sortOrder = 'desc',
            
            // Pagination
            page = 1,
            limit = 10
            
        } = req.query;

        // Build query object - always show active contractors only
        const query = { isActive: true };

        // ===== TEXT SEARCH FILTER =====
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { companyName: searchRegex },
                { name: searchRegex },
                { 'address.city': searchRegex },
                { 'address.state': searchRegex },
                { specialties: { $in: [searchRegex] } },
                { 'portfolio.title': searchRegex },
                { 'portfolio.description': searchRegex }
            ];
        }

        // ===== LOCATION FILTERS =====
        if (city) {
            query['address.city'] = new RegExp(city, 'i');
        }
        
        if (state) {
            query['address.state'] = new RegExp(state, 'i');
        }
        
        if (pincode) {
            query['address.pincode'] = pincode;
        }
        
        if (location) {
            const locationRegex = new RegExp(location, 'i');
            query.$or = [
                { 'address.city': locationRegex },
                { 'address.state': locationRegex },
                { 'address.country': locationRegex },
                { 'portfolio.location': locationRegex }
            ];
        }

        // ===== RATING FILTERS =====
        if (minRating || maxRating) {
            query['ratings.average'] = {};
            
            if (minRating) {
                const minRatingValue = parseFloat(minRating);
                query['ratings.average'].$gte = minRatingValue;
            }
            
            if (maxRating) {
                const maxRatingValue = parseFloat(maxRating);
                query['ratings.average'].$lte = maxRatingValue;
            }
        }

        // ===== EXPERIENCE FILTERS =====
        if (minExperience || maxExperience) {
            query.experience = {};
            
            if (minExperience) {
                const minExpValue = parseInt(minExperience);
                query.experience.$gte = minExpValue;
            }
            
            if (maxExperience) {
                const maxExpValue = parseInt(maxExperience);
                query.experience.$lte = maxExpValue;
            }
        }

        // ===== SPECIALIZATION FILTERS =====
        if (specialties) {
            const specialtiesArray = Array.isArray(specialties) 
                ? specialties 
                : specialties.split(',');
            query.specialties = { $in: specialtiesArray.map(s => s.trim()) };
        }

        if (contractorType) {
            query.contractorType = contractorType;
        }

        // ===== BUSINESS FILTERS =====
        if (teamSize) {
            query.teamSize = teamSize;
        }

        if (minProjectsCompleted) {
            query.projectsCompleted = { $gte: parseInt(minProjectsCompleted) };
        }

        // ===== PORTFOLIO FILTERS =====
        if (portfolioCategory) {
            query['portfolio.category'] = new RegExp(portfolioCategory, 'i');
        }
        
        if (portfolioStatus) {
            query['portfolio.status'] = portfolioStatus;
        }

        // ===== VERIFICATION FILTER =====
        if (verified === 'true') {
            query.isVerified = true;
            query.verificationStatus = 'verified';
        }

        // ===== PAGINATION =====
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // ===== SORTING =====
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        // Default sorting if none provided
        if (!sortBy) {
            sort['ratings.average'] = -1;
            sort.experience = -1;
        }

        // ===== EXECUTE QUERY WITH AGGREGATION =====
        const contractors = await Contractor.aggregate([
            // Stage 1: Match documents based on filters
            { $match: query },
            
            // Stage 2: Lookup for additional data if needed
            {
                $lookup: {
                    from: 'users', // Assuming User model exists
                    localField: 'reviews.clientId',
                    foreignField: '_id',
                    as: 'reviewClients'
                }
            },
            
            // Stage 3: Add computed fields
            {
                $addFields: {
                    // Calculate review count
                    reviewCount: { $size: '$reviews' },
                    
                    // Calculate portfolio count
                    portfolioCount: { $size: '$portfolio' },
                    
                    // Get recent portfolio projects (last 3)
                    recentPortfolio: {
                        $slice: [
                            {
                                $filter: {
                                    input: '$portfolio',
                                    as: 'project',
                                    cond: { $eq: ['$$project.status', 'completed'] }
                                }
                            },
                            3
                        ]
                    },
                    
                    // Get successful projects count
                    successfulProjects: {
                        $size: {
                            $filter: {
                                input: '$portfolio',
                                as: 'project',
                                cond: { $eq: ['$$project.status', 'completed'] }
                            }
                        }
                    },
                    
                    // Calculate success rate (completed projects / total portfolio)
                    successRate: {
                        $cond: {
                            if: { $gt: [{ $size: '$portfolio' }, 0] },
                            then: {
                                $multiply: [
                                    {
                                        $divide: [
                                            {
                                                $size: {
                                                    $filter: {
                                                        input: '$portfolio',
                                                        as: 'project',
                                                        cond: { $eq: ['$$project.status', 'completed'] }
                                                    }
                                                }
                                            },
                                            { $size: '$portfolio' }
                                        ]
                                    },
                                    100
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            
            // Stage 4: Sort
            { $sort: sort },
            
            // Stage 5: Skip and limit for pagination
            { $skip: skip },
            { $limit: parseInt(limit) },
            
            // Stage 6: Project only needed fields
            {
                $project: {
                    // Basic info
                    name: 1,
                    companyName: 1,
                    email: 1,
                    phone: 1,
                    
                    // Professional info
                    contractorType: 1,
                    specialties: 1,
                    experience: 1,
                    teamSize: 1,
                    projectsCompleted: 1,
                    
                    // Location
                    address: 1,
                    
                    // Ratings & Reviews
                    ratings: 1,
                    reviewCount: 1,
                    reviews: { 
                        $slice: ['$reviews', 5] // Get only 5 recent reviews
                    },
                    
                    // Portfolio
                    portfolioCount: 1,
                    recentPortfolio: 1,
                    successfulProjects: 1,
                    successRate: 1,
                    
                    // Verification
                    isVerified: 1,
                    verificationStatus: 1,
                    
                    // Analytics
                    profileViews: 1,
                    portfolioViews: 1,
                    
                    // Timestamps
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        // Get total count for pagination
        const total = await Contractor.countDocuments(query);

        // ===== GET FILTER OPTIONS FOR FRONTEND =====
        const filterOptions = await getFilterOptionsFromDB();

        res.json({
            success: true,
            count: contractors.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            filtersApplied: Object.keys(req.query).length,
            contractors,
            filterOptions
        });

    } catch (error) {
        console.error('Filter contractors error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

/**
 * @desc    Get contractors by rating range
 * @route   GET /api/contractors/by-rating
 * @access  Public
 */
export const getContractorsByRating = async (req, res) => {
    try {
        const { 
            rating, // 1, 2, 3, 4, 5
            minRating = 0,
            maxRating = 5,
            page = 1,
            limit = 10 
        } = req.query;

        const query = { 
            isActive: true,
            'ratings.average': { $gte: parseFloat(minRating), $lte: parseFloat(maxRating) }
        };

        if (rating) {
            const ratingValue = parseFloat(rating);
            query['ratings.average'] = { $gte: ratingValue, $lt: ratingValue + 1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const contractors = await Contractor.find(query)
            .select('name companyName contractorType specialties experience ratings address isVerified profileViews')
            .sort({ 'ratings.average': -1, experience: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Contractor.countDocuments(query);

        // Get rating statistics
        const ratingStats = await Contractor.aggregate([
            { $match: { isActive: true } },
            {
                $bucket: {
                    groupBy: '$ratings.average',
                    boundaries: [0, 1, 2, 3, 4, 5],
                    default: 'No Rating',
                    output: {
                        count: { $sum: 1 },
                        contractors: {
                            $push: {
                                name: '$name',
                                companyName: '$companyName',
                                rating: '$ratings.average'
                            }
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            count: contractors.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            contractors,
            ratingStats
        });

    } catch (error) {
        console.error('Get contractors by rating error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

/**
 * @desc    Get contractors by experience
 * @route   GET /api/contractors/by-experience
 * @access  Public
 */
export const getContractorsByExperience = async (req, res) => {
    try {
        const { 
            years, // Specific years (e.g., 5, 10, 15)
            experienceRange, // beginner(1-3), intermediate(4-7), expert(8+)
            page = 1,
            limit = 10 
        } = req.query;

        const query = { isActive: true };

        if (years) {
            query.experience = parseInt(years);
        }

        if (experienceRange) {
            switch(experienceRange) {
                case 'beginner':
                    query.experience = { $gte: 1, $lte: 3 };
                    break;
                case 'intermediate':
                    query.experience = { $gte: 4, $lte: 7 };
                    break;
                case 'expert':
                    query.experience = { $gte: 8 };
                    break;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const contractors = await Contractor.find(query)
            .select('name companyName contractorType specialties experience ratings address isVerified portfolio projectsCompleted')
            .sort({ experience: -1, 'ratings.average': -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Contractor.countDocuments(query);

        // Get experience statistics
        const experienceStats = await Contractor.aggregate([
            { $match: { isActive: true } },
            {
                $bucket: {
                    groupBy: '$experience',
                    boundaries: [0, 3, 5, 10, 15, 20],
                    default: '20+',
                    output: {
                        count: { $sum: 1 },
                        avgRating: { $avg: '$ratings.average' },
                        totalProjects: { $sum: '$projectsCompleted' }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            count: contractors.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            contractors,
            experienceStats
        });

    } catch (error) {
        console.error('Get contractors by experience error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

/**
 * @desc    Get contractors by location
 * @route   GET /api/contractors/by-location
 * @access  Public
 */
export const getContractorsByLocation = async (req, res) => {
    try {
        const { 
            city,
            state,
            page = 1,
            limit = 10 
        } = req.query;

        if (!city && !state) {
            return res.status(400).json({
                success: false,
                message: 'Please provide either city or state'
            });
        }

        const query = { isActive: true };

        if (city) {
            query['address.city'] = new RegExp(city, 'i');
        }

        if (state) {
            query['address.state'] = new RegExp(state, 'i');
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const contractors = await Contractor.find(query)
            .select('name companyName contractorType specialties experience ratings address profileViews isVerified')
            .sort({ 'ratings.average': -1, profileViews: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Contractor.countDocuments(query);

        // Get location statistics
        const locationStats = await Contractor.aggregate([
            { $match: { isActive: true, 'address.city': { $exists: true } } },
            {
                $group: {
                    _id: { city: '$address.city', state: '$address.state' },
                    count: { $sum: 1 },
                    avgRating: { $avg: '$ratings.average' },
                    avgExperience: { $avg: '$experience' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        res.json({
            success: true,
            count: contractors.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            contractors,
            locationStats
        });

    } catch (error) {
        console.error('Get contractors by location error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

/**
 * @desc    Get contractors by specialty
 * @route   GET /api/contractors/by-specialty
 * @access  Public
 */
export const getContractorsBySpecialty = async (req, res) => {
    try {
        const { 
            specialty,
            page = 1,
            limit = 10 
        } = req.query;

        if (!specialty) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a specialty'
            });
        }

        const query = { 
            isActive: true,
            specialties: specialty 
        };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const contractors = await Contractor.find(query)
            .select('name companyName contractorType specialties experience ratings address portfolio isVerified profileViews')
            .sort({ 'ratings.average': -1, experience: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Contractor.countDocuments(query);

        // Get specialty statistics
        const specialtyStats = await Contractor.aggregate([
            { $match: { isActive: true } },
            { $unwind: '$specialties' },
            {
                $group: {
                    _id: '$specialties',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$ratings.average' },
                    avgExperience: { $avg: '$experience' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            count: contractors.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            contractors,
            specialtyStats
        });

    } catch (error) {
        console.error('Get contractors by specialty error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

/**
 * @desc    Get verified contractors only
 * @route   GET /api/contractors/verified
 * @access  Public
 */
export const getVerifiedContractors = async (req, res) => {
    try {
        const { 
            page = 1,
            limit = 10 
        } = req.query;

        const query = { 
            isActive: true,
            isVerified: true,
            verificationStatus: 'verified'
        };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const contractors = await Contractor.find(query)
            .select('name companyName contractorType specialties experience ratings address verificationDocuments profileViews portfolio')
            .sort({ 'ratings.average': -1, experience: -1, profileViews: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Contractor.countDocuments(query);

        // Get verification statistics
        const verificationStats = await Contractor.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$verificationStatus',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$ratings.average' }
                }
            }
        ]);

        res.json({
            success: true,
            count: contractors.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            contractors,
            verificationStats
        });

    } catch (error) {
        console.error('Get verified contractors error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

/**
 * @desc    Get contractors with portfolio
 * @route   GET /api/contractors/with-portfolio
 * @access  Public
 */
export const getContractorsWithPortfolio = async (req, res) => {
    try {
        const { 
            minProjects = 1,
            portfolioCategory,
            page = 1,
            limit = 10 
        } = req.query;

        const query = { 
            isActive: true,
            $expr: { $gte: [{ $size: '$portfolio' }, parseInt(minProjects)] }
        };

        if (portfolioCategory) {
            query['portfolio.category'] = new RegExp(portfolioCategory, 'i');
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const contractors = await Contractor.find(query)
            .select('name companyName contractorType specialties experience ratings address portfolio profileViews')
            .sort({ 
                portfolioCount: -1, // Note: portfolioCount is virtual or computed
                'ratings.average': -1 
            })
            .skip(skip)
            .limit(parseInt(limit));

        // Get portfolio size for each contractor
        const contractorsWithCount = contractors.map(contractor => ({
            ...contractor.toObject(),
            portfolioCount: contractor.portfolio.length,
            portfolioCategories: [...new Set(contractor.portfolio.map(p => p.category))],
            completedProjects: contractor.portfolio.filter(p => p.status === 'completed').length
        }));

        const total = await Contractor.countDocuments(query);

        // Get portfolio statistics
        const portfolioStats = await Contractor.aggregate([
            { $match: { isActive: true } },
            {
                $project: {
                    portfolioSize: { $size: '$portfolio' },
                    completedProjects: {
                        $size: {
                            $filter: {
                                input: '$portfolio',
                                as: 'project',
                                cond: { $eq: ['$$project.status', 'completed'] }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgPortfolioSize: { $avg: '$portfolioSize' },
                    maxPortfolioSize: { $max: '$portfolioSize' },
                    totalCompletedProjects: { $sum: '$completedProjects' }
                }
            }
        ]);

        res.json({
            success: true,
            count: contractorsWithCount.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            contractors: contractorsWithCount,
            portfolioStats: portfolioStats[0] || {}
        });

    } catch (error) {
        console.error('Get contractors with portfolio error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

/**
 * @desc    Get filter options for frontend
 * @route   GET /api/contractors/filter-options
 * @access  Public
 */
export const getFilterOptions = async (req, res) => {
    try {
        const options = await getFilterOptionsFromDB();
        
        res.json({
            success: true,
            options
        });

    } catch (error) {
        console.error('Get filter options error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// Helper function to get filter options from database
const getFilterOptionsFromDB = async () => {
    const options = await Contractor.aggregate([
        { $match: { isActive: true } },
        {
            $facet: {
                // All specialties
                specialties: [
                    { $unwind: '$specialties' },
                    { $group: { _id: '$specialties', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                
                // All cities
                cities: [
                    { $match: { 'address.city': { $exists: true, $ne: '' } } },
                    { $group: { _id: '$address.city', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 50 }
                ],
                
                // All states
                states: [
                    { $match: { 'address.state': { $exists: true, $ne: '' } } },
                    { $group: { _id: '$address.state', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                
                // All contractor types
                contractorTypes: [
                    { $group: { _id: '$contractorType', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                
                // Team sizes
                teamSizes: [
                    { $group: { _id: '$teamSize', count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ],
                
                // Experience ranges
                experienceRanges: [
                    {
                        $bucket: {
                            groupBy: '$experience',
                            boundaries: [0, 1, 3, 5, 10, 15, 20],
                            default: '20+',
                            output: {
                                count: { $sum: 1 },
                                minRating: { $min: '$ratings.average' },
                                maxRating: { $max: '$ratings.average' },
                                avgRating: { $avg: '$ratings.average' }
                            }
                        }
                    },
                    { $sort: { _id: 1 } }
                ],
                
                // Rating ranges
                ratingRanges: [
                    {
                        $bucket: {
                            groupBy: '$ratings.average',
                            boundaries: [0, 1, 2, 3, 4, 5],
                            default: 'No Rating',
                            output: {
                                count: { $sum: 1 },
                                avgExperience: { $avg: '$experience' }
                            }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]
            }
        }
    ]);

    return options[0] || {};
};
// controllers/contractor/contractor.controller.js

export const getContractorRatings = async (req, res) => {
    try {
        const { id } = req.params;

        const contractor = await Contractor.findById(id)
            .select('companyName ratings reviews')
            .populate({
                path: 'reviews.clientId',
                select: 'name avatar'
            });

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        // Sort reviews by newest first
        const sortedReviews = contractor.reviews.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.status(200).json({
            success: true,
            data: {
                companyName: contractor.companyName,
                averageRating: contractor.ratings.average,
                totalReviews: contractor.ratings.count,
                ratingBreakdown: contractor.ratings.breakdown,
                reviews: sortedReviews.map(review => ({
                    _id: review._id,
                    clientName: review.clientName || review.clientId?.name || 'Anonymous',
                    clientAvatar: review.clientId?.avatar || null,
                    rating: review.rating,
                    comment: review.comment,
                    project: review.project,
                    createdAt: review.createdAt
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
// controllers/contractor/contractor.controller.js

export const addContractorReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, projectType } = req.body;

        // Validation
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        if (!comment || comment.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Review comment must be at least 10 characters'
            });
        }

        const contractor = await Contractor.findById(id);
        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        // Prevent duplicate reviews
        const existingReview = contractor.reviews.find(
            r => r.clientId?.toString() === req.user._id.toString()
        );

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this contractor'
            });
        }

        // Create new review
        const newReview = {
            clientId: req.user._id,
            clientName: req.user.name || req.user.username || 'Anonymous',
            rating: Number(rating),
            comment: comment.trim(),
            project: projectType?.trim() || undefined,
            createdAt: new Date()
        };

        contractor.reviews.unshift(newReview);

        // Update ratings breakdown
        const ratingKey = rating.toString(); // '5', '4', etc.
        contractor.ratings.breakdown[ratingKey] = (contractor.ratings.breakdown[ratingKey] || 0) + 1;
        contractor.ratings.count += 1;

        // Recalculate average
        const totalRatingSum = Object.keys(contractor.ratings.breakdown).reduce((sum, key) => {
            return sum + (Number(key) * contractor.ratings.breakdown[key]);
        }, 0);

        contractor.ratings.average = contractor.ratings.count > 0
            ? Number((totalRatingSum / contractor.ratings.count).toFixed(2))
            : 0;

        await contractor.save();

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: newReview,
            ratingSummary: {
                average: contractor.ratings.average,
                totalReviews: contractor.ratings.count,
                breakdown: contractor.ratings.breakdown
            }
        });

    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};