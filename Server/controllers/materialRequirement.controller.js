// controllers/materialRequirement.controller.js
import MaterialRequirement from '../models/MaterialRequirement.model.js';
import User from '../models/User.model.js';


/* ================= CREATE REQUIREMENT ================= */
export const createRequirement = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Check if user has phone, otherwise require it from request body
        if (!user.phone && !req.body.phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        const requirementData = {
            ...req.body,
            userId: req.user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || req.body.phone // Use user's phone OR request body phone
        };

        // Additional validation
        if (!requirementData.phone || !/^[0-9]{10}$/.test(requirementData.phone)) {
            return res.status(400).json({
                success: false,
                message: 'Valid 10-digit phone number is required'
            });
        }

        const requirement = await MaterialRequirement.create(requirementData);

        res.status(201).json({
            success: true,
            data: requirement,
            message: 'Material requirement submitted successfully'
        });
    } catch (error) {
        console.error('Create requirement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
/* ================= GET MY REQUIREMENTS ================= */
export const getMyRequirements = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status,
            sort = '-createdAt' 
        } = req.query;

        const query = { userId: req.user.id };
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const [requirements, total] = await Promise.all([
            MaterialRequirement.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('assignedTo', 'name businessName'),
            MaterialRequirement.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: requirements,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get my requirements error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET REQUIREMENT BY ID ================= */
export const getRequirementById = async (req, res) => {
    try {
        const requirement = await MaterialRequirement.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('assignedTo', 'name businessName phone')
            .populate('quotes.supplierId', 'name businessName email phone')
            .populate('cancelledBy', 'name email');

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        // Check authorization
        if (
            req.user.role !== 'ADMIN' && 
            req.user.role !== 'SUPER_ADMIN' &&
            requirement.userId._id.toString() !== req.user.id &&
            (!requirement.assignedTo || requirement.assignedTo._id.toString() !== req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this requirement'
            });
        }

        res.json({
            success: true,
            data: requirement
        });
    } catch (error) {
        console.error('Get requirement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= UPDATE REQUIREMENT ================= */
export const updateRequirement = async (req, res) => {
    try {
        const requirement = await MaterialRequirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        // Check if user can update
        if (requirement.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this requirement'
            });
        }

        // Only pending requirements can be updated by user
        if (requirement.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending requirements can be updated'
            });
        }

        const allowedUpdates = [
            'projectType', 'projectLocation', 'deliveryDate', 'budgetRange',
            'materials', 'additionalNotes', 'urgencyLevel', 'siteVisitRequired'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const updatedRequirement = await MaterialRequirement.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name businessName');

        res.json({
            success: true,
            data: updatedRequirement,
            message: 'Requirement updated successfully'
        });
    } catch (error) {
        console.error('Update requirement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= CANCEL REQUIREMENT ================= */
export const cancelRequirement = async (req, res) => {
    try {
        const { reason } = req.body;
        const requirement = await MaterialRequirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        // Check authorization
        const isOwner = requirement.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isAssignedSeller = requirement.assignedTo && 
            requirement.assignedTo.toString() === req.user.id;

        if (!isOwner && !isAdmin && !isAssignedSeller) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this requirement'
            });
        }

        requirement.status = 'cancelled';
        requirement.cancelledAt = new Date();
        requirement.cancelledBy = req.user.id;
        requirement.cancelledByRole = isAdmin ? 'admin' : (isAssignedSeller ? 'seller' : 'user');
        requirement.cancellationReason = reason || 'No reason provided';

        await requirement.save();

        res.json({
            success: true,
            data: requirement,
            message: 'Requirement cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel requirement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET ALL REQUIREMENTS (ADMIN) ================= */
export const getAllRequirements = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            projectType,
            urgencyLevel,
            dateFrom,
            dateTo,
            search,
            sort = '-createdAt'
        } = req.query;

        const query = {};

        // Filters
        if (status) query.status = status;
        if (projectType) query.projectType = projectType;
        if (urgencyLevel) query.urgencyLevel = urgencyLevel;

        // Date range
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                fromDate.setHours(0, 0, 0, 0);
                query.createdAt.$gte = fromDate;
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = toDate;
            }
        }

        // Search
        if (search) {
            query.$or = [
                { requirementNumber: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { projectLocation: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [requirements, total] = await Promise.all([
            MaterialRequirement.find(query)
                .populate('userId', 'name email phone')
                .populate('assignedTo', 'name businessName')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            MaterialRequirement.countDocuments(query)
        ]);

        // Stats
        const stats = await MaterialRequirement.aggregate([
            { $match: query },
            { $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalValue: { $sum: { $cond: [{ $gt: ['$materials', []] }, 1, 0] } }
            }}
        ]);

        res.json({
            success: true,
            data: requirements,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            stats: stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {})
        });
    } catch (error) {
        console.error('Get all requirements error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= ACCEPT REQUIREMENT (ADMIN) ================= */
export const acceptRequirement = async (req, res) => {
    try {
        const requirement = await MaterialRequirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        if (requirement.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Requirement is already ${requirement.status}`
            });
        }

        requirement.status = 'accepted';
        requirement.assignedBy = req.user.id;
        requirement.assignedAt = new Date();

        await requirement.save();

        res.json({
            success: true,
            data: requirement,
            message: 'Requirement accepted successfully'
        });
    } catch (error) {
        console.error('Accept requirement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= ASSIGN TO SELLER (ADMIN) ================= */
export const assignToSeller = async (req, res) => {
    try {
        const { sellerId } = req.body;
        const requirement = await MaterialRequirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        // Verify seller exists
        const seller = await User.findOne({
            _id: sellerId,
            role: 'SELLER',
            isActive: true
        });

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found or not active'
            });
        }

        requirement.assignedTo = sellerId;
        requirement.status = 'processing';
        requirement.assignedBy = req.user.id;
        requirement.assignedAt = new Date();

        await requirement.save();

        res.json({
            success: true,
            data: requirement,
            message: 'Requirement assigned to seller successfully'
        });
    } catch (error) {
        console.error('Assign to seller error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= ADD QUOTE (SELLER) ================= */
export const addQuote = async (req, res) => {
    try {
        const { amount, notes, validity } = req.body;
        const requirement = await MaterialRequirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        // Check if seller is assigned or requirement is open for quotes
        if (requirement.assignedTo && requirement.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to quote on this requirement'
            });
        }

        // Check if already quoted
        const existingQuote = requirement.quotes.find(
            quote => quote.supplierId.toString() === req.user.id
        );

        if (existingQuote) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a quote for this requirement'
            });
        }

        const quote = {
            supplierId: req.user.id,
            amount,
            notes,
            validity: validity ? new Date(validity) : undefined
        };

        requirement.quotes.push(quote);
        await requirement.save();

        // Populate supplier info
        const updatedRequirement = await MaterialRequirement.findById(req.params.id)
            .populate('quotes.supplierId', 'name businessName email');

        res.status(201).json({
            success: true,
            data: updatedRequirement,
            message: 'Quote submitted successfully'
        });
    } catch (error) {
        console.error('Add quote error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= ACCEPT QUOTE (USER/SELLER) ================= */
export const acceptQuote = async (req, res) => {
    try {
        const { quoteId } = req.params;
        const requirement = await MaterialRequirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        // Find the quote
        const quote = requirement.quotes.id(quoteId);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Authorization
        const isOwner = requirement.userId.toString() === req.user.id;
        const isQuoteOwner = quote.supplierId.toString() === req.user.id;

        if (!isOwner && !isQuoteOwner) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to accept this quote'
            });
        }

        // Update all quotes status
        requirement.quotes.forEach(q => {
            q.status = q._id.toString() === quoteId ? 'accepted' : 'rejected';
        });

        // Update requirement status if owner accepts quote
        if (isOwner) {
            requirement.status = 'processing';
            requirement.assignedTo = quote.supplierId;
            requirement.assignedAt = new Date();
        }

        await requirement.save();

        res.json({
            success: true,
            data: requirement,
            message: 'Quote accepted successfully'
        });
    } catch (error) {
        console.error('Accept quote error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET SELLER ASSIGNED REQUIREMENTS ================= */
export const getSellerAssignedRequirements = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status,
            sort = '-createdAt' 
        } = req.query;

        const query = { assignedTo: req.user.id };
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const [requirements, total] = await Promise.all([
            MaterialRequirement.find(query)
                .populate('userId', 'name email phone')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            MaterialRequirement.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: requirements,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get seller requirements error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET REQUIREMENTS STATS ================= */
export const getRequirementsStats = async (req, res) => {
    try {
        const stats = await MaterialRequirement.aggregate([
            {
                $facet: {
                    statusCounts: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    dailyCounts: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                                },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: -1 } },
                        { $limit: 30 }
                    ],
                    projectTypeStats: [
                        { $group: { _id: '$projectType', count: { $sum: 1 } } },
                        { $sort: { count: -1 } }
                    ],
                    monthlyValue: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: { format: '%Y-%m', date: '$createdAt' }
                                },
                                count: { $sum: 1 },
                                totalRequirements: { $sum: { $size: '$materials' } }
                            }
                        },
                        { $sort: { _id: -1 } },
                        { $limit: 6 }
                    ]
                }
            }
        ]);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= UPDATE REQUIREMENT STATUS ================= */
export const updateRequirementStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const requirement = await MaterialRequirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        requirement.status = status;
        
        if (status === 'completed') {
            requirement.completedAt = new Date();
        }

        await requirement.save();

        res.json({
            success: true,
            data: requirement,
            message: `Requirement status updated to ${status}`
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= REJECT REQUIREMENT ================= */
export const rejectRequirement = async (req, res) => {
    try {
        const requirement = await MaterialRequirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        requirement.status = 'rejected';
        await requirement.save();

        res.json({
            success: true,
            data: requirement,
            message: 'Requirement rejected successfully'
        });
    } catch (error) {
        console.error('Reject requirement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
//  Delete Material Requirment
export const deleteMaterialRequirement = async (req, res) => {
    try {
        const requirement = await MaterialRequirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        // Check authorization
        const isOwner = requirement.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this requirement'
            });
        }

        // Additional checks for safety
        if (requirement.status === 'processing' || requirement.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: `Cannot delete requirement with ${requirement.status} status. Please cancel it first.`
            });
        }

        // Check if there are any quotes submitted
        if (requirement.quotes && requirement.quotes.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete requirement with submitted quotes. Please cancel it first.'
            });
        }

        // Soft delete by marking as deleted
        if (process.env.SOFT_DELETE === 'true') {
            requirement.isDeleted = true;
            requirement.deletedAt = new Date();
            requirement.deletedBy = req.user.id;
            requirement.deletedByRole = isAdmin ? 'admin' : 'user';
            await requirement.save();

            return res.json({
                success: true,
                message: 'Requirement deleted successfully (soft delete)',
                data: requirement
            });
        }

        // Hard delete (permanently remove from database)
        await MaterialRequirement.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Requirement deleted permanently',
            data: { id: req.params.id }
        });

    } catch (error) {
        console.error('Delete requirement error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
