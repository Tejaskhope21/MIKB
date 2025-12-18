import User from '../models/User.model.js';

/* ================= GET ALL USERS ================= */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'USER' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET ALL SELLERS ================= */
export const getAllSellers = async (req, res) => {
    try {
        const sellers = await User.find({ role: 'SELLER' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: sellers.length,
            sellers
        });

    } catch (error) {
        console.error('Get all sellers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= VERIFY SELLER ================= */
export const verifySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const seller = await User.findByIdAndUpdate(
            sellerId,
            { isSellerVerified: true },
            { new: true }
        ).select('-password');

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        res.json({
            success: true,
            seller,
            message: 'Seller verified successfully'
        });

    } catch (error) {
        console.error('Verify seller error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= TOGGLE USER ACTIVE STATUS ================= */
export const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= CREATE ADMIN (INTERNAL USE) ================= */
export const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if admin exists
        const existingAdmin = await User.findOne({ email, role: 'ADMIN' });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        const admin = await User.create({
            name,
            email,
            password,
            role: 'ADMIN',
            isActive: true
        });

        const adminResponse = admin.toObject();
        delete adminResponse.password;

        res.status(201).json({
            success: true,
            admin: adminResponse,
            message: 'Admin created successfully'
        });

    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET STATS ================= */
export const getStats = async (req, res) => {
    try {
        const [userCount, sellerCount, verifiedSellerCount] = await Promise.all([
            User.countDocuments({ role: 'USER', isActive: true }),
            User.countDocuments({ role: 'SELLER' }),
            User.countDocuments({ role: 'SELLER', isSellerVerified: true })
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers: userCount,
                totalSellers: sellerCount,
                verifiedSellers: verifiedSellerCount,
                pendingSellers: sellerCount - verifiedSellerCount
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};