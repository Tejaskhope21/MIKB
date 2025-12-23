// controllers/contractor/contractor.controller.js
import Contractor from '../models/Contractor.model.js';

// @desc    Get all contractors
// @route   GET /api/contractor
// @access  Public
export const getAllContractors = async (req, res) => {
    try {
        const {
            specialty,
            city,
            minExperience,
            contractorType,
            verified = true,
            page = 1,
            limit = 12
        } = req.query;

        // Build query
        const query = { isActive: true };

        if (verified === 'true') {
            query.isVerified = true;
            query.verificationStatus = 'verified';
        }

        if (specialty) {
            query.specialties = specialty;
        }

        if (city) {
            query['address.city'] = new RegExp(city, 'i');
        }

        if (minExperience) {
            query.experience = { $gte: parseInt(minExperience) };
        }

        if (contractorType) {
            query.contractorType = contractorType;
        }

        const skip = (page - 1) * limit;

        // Execute query
        const contractors = await Contractor.find(query)
            .select('name companyName contractorType experience specialties address ratings portfolio projectsCompleted profileViews')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ 'ratings.average': -1, experience: -1, profileViews: -1 });

        const total = await Contractor.countDocuments(query);

        res.json({
            success: true,
            count: contractors.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            contractors
        });
    } catch (error) {
        console.error('Get contractors error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get contractor by ID
// @route   GET /api/contractor/:id
// @access  Public
export const getContractorById = async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.params.id)
            .select('-password -resetPasswordToken -resetPasswordExpire -__v');

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        // Increment profile views
        contractor.profileViews += 1;
        await contractor.save();

        res.json({
            success: true,
            contractor
        });
    } catch (error) {
        console.error('Get contractor error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
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

// @desc    Add review to contractor
// @route   POST /api/contractor/:id/reviews
// @access  Private (Users only)
export const addContractorReview = async (req, res) => {
    try {
        const { rating, comment, project } = req.body;
        const contractorId = req.params.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a rating between 1 and 5'
            });
        }

        const contractor = await Contractor.findById(contractorId);

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        // Check if user already reviewed
        const alreadyReviewed = contractor.reviews.find(
            review => review.clientId.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this contractor'
            });
        }

        // Add review
        const review = {
            clientId: req.user._id,
            rating: Number(rating),
            comment,
            project,
            clientName: req.user.name || 'Anonymous'
        };

        contractor.reviews.push(review);

        // Update ratings
        contractor.ratings.count = contractor.reviews.length;
        contractor.ratings.breakdown[rating] = (contractor.ratings.breakdown[rating] || 0) + 1;

        // Calculate average
        const totalRatings = contractor.reviews.reduce((sum, item) => sum + item.rating, 0);
        contractor.ratings.average = parseFloat((totalRatings / contractor.reviews.length).toFixed(1));

        await contractor.save();

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            ratings: contractor.ratings,
            reviewCount: contractor.reviews.length
        });
    } catch (error) {
        console.error('Add review error:', error);
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