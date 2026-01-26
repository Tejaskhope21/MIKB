// controllers/contractor/contractor.controller.js
import Contractor from '../models/Contractor.model.js';

// @desc    Get all contractors
// @route   GET /api/contractor
// @access  Public
// contractor.controller.js (Backend)

// GET /api/contractor/contractors - Get all contractors
export const getAllContractors = async (req, res) => {
  try {
    const contractors = await Contractor.find({
      isActive: true,
      isVerified: true
    }).select('-password');

    res.json({
      success: true,
      count: contractors.length,
      data: contractors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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


export const getPortfolioProjects = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const contractor = await Contractor.findById(req.user.id)
      .select({ portfolio: { $slice: [skip, limit] } })
      .lean();

    if (!contractor) {
      return res.status(404).json({ success: false, message: 'Contractor not found' });
    }

    res.json({
      success: true,
      page,
      limit,
      portfolio: contractor.portfolio
    });

  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};





/**
 * @desc    Get single portfolio project
 * @route   GET /api/contractor/portfolio/projects/:projectId
 * @access  Contractor
 */
export const getPortfolioProjectById = async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.user.id).select('portfolio');

    const project = contractor?.portfolio.id(req.params.projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, project });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const addPortfolioProject = async (req, res) => {
  try {
    const { title, category, description, location, year, images, status } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required'
      });
    }

    const project = {
      _id: new mongoose.Types.ObjectId(),
      title,
      category,
      description,
      location,
      year: year || new Date().getFullYear(),
      images: Array.isArray(images) ? images : [],
      status: status || 'completed'
    };

    const result = await Contractor.findOneAndUpdate(
      { _id: req.user.id },
      { $push: { portfolio: project } },
      { new: true, projection: { portfolio: { $slice: -1 } } }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: 'Contractor not found' });
    }

    res.status(201).json({
      success: true,
      message: 'Project added successfully',
      project: result.portfolio[0]
    });

  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
export const updatePortfolioProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const updateFields = {};
    for (const key of Object.keys(req.body)) {
      updateFields[`portfolio.$.${key}`] = req.body[key];
    }

    const contractor = await Contractor.findOneAndUpdate(
      { _id: req.user.id, 'portfolio._id': projectId },
      { $set: updateFields },
      { new: true, projection: { 'portfolio.$': 1 } }
    );

    if (!contractor) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: contractor.portfolio[0]
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



export const deletePortfolioProject = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }

    const result = await Contractor.findOneAndUpdate(
      { _id: req.user.id },
      { $pull: { portfolio: { _id: req.params.projectId } } }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: 'Contractor not found' });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getContractorStats = async (req, res) => {
  try {
    const stats = await Contractor.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $project: {
          projectsCompleted: 1,
          profileViews: 1,
          portfolioViews: 1,
          portfolio: 1
        }
      },
      {
        $addFields: {
          totalProjects: { $size: '$portfolio' },
          completed: {
            $size: {
              $filter: {
                input: '$portfolio',
                as: 'p',
                cond: { $eq: ['$$p.status', 'completed'] }
              }
            }
          },
          ongoing: {
            $size: {
              $filter: {
                input: '$portfolio',
                as: 'p',
                cond: { $eq: ['$$p.status', 'ongoing'] }
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0]
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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

/**
 * @desc    Verify contractor
 * @route   PUT /api/admin/contractors/:id/verify
 * @access  Admin
 */
export const verifyContractor = async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id);

    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }

    contractor.isVerified = true;
    contractor.verificationStatus = 'verified';

    await contractor.save();

    res.json({
      success: true,
      message: 'Contractor verified successfully'
    });

  } catch (error) {
    console.error('Verify contractor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


/**
 * @desc    Unverify / Reject contractor
 * @route   PUT /api/admin/contractors/:id/unverify
 * @access  Admin
 */
export const unverifyContractor = async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id);

    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }

    contractor.isVerified = false;
    contractor.verificationStatus = 'rejected';

    await contractor.save();

    res.json({
      success: true,
      message: 'Contractor unverified successfully'
    });

  } catch (error) {
    console.error('Unverify contractor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


/**
 * @desc    Delete contractor (PERMANENT)
 * @route   DELETE /api/admin/contractors/:id
 * @access  Admin
 */
export const deleteContractor = async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id);

    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }

    await contractor.deleteOne();

    res.json({
      success: true,
      message: 'Contractor deleted permanently'
    });

  } catch (error) {
    console.error('Delete contractor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};




