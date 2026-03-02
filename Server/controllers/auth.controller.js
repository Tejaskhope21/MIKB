import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';

/* ================= USER REGISTER ================= */
export const userRegister = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: 'USER'
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            token: generateToken(user),
            user: userResponse,
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('User register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/* ================= USER LOGIN ================= */
export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email, role: 'USER' }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account is deactivated. Please contact support.'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            token: generateToken(user),
            user: userResponse,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/* ================= SELLER REGISTER ================= */
export const sellerRegister = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if seller exists
        const existingSeller = await User.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create seller
        const seller = await User.create({
            ...req.body,
            password,
            role: 'SELLER'
        });

        // Remove password from response
        const sellerResponse = seller.toObject();
        delete sellerResponse.password;

        res.status(201).json({
            success: true,
            token: generateToken(seller),
            seller: sellerResponse,
            message: 'Seller registered successfully. Awaiting verification.'
        });

    } catch (error) {
        console.error('Seller register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/* ================= SELLER LOGIN ================= */
export const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const seller = await User.findOne({ email, role: 'SELLER' }).select('+password');

        if (!seller) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!seller.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account is deactivated'
            });
        }

        const isMatch = await seller.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        seller.lastLogin = new Date();
        await seller.save();

        const sellerResponse = seller.toObject();
        delete sellerResponse.password;

        res.json({
            success: true,
            token: generateToken(seller),
            seller: sellerResponse,
            message: 'Seller login successful'
        });

    } catch (error) {
        console.error('Seller login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};





/* ================= GET CURRENT USER ================= */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= ADMIN LOGIN ================= */
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // IMPORTANT: select password explicitly
        const admin = await User.findOne({
            email: email.toLowerCase(),
            role: 'ADMIN'
        }).select('+password');

        if (!admin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access only'
            });
        }

        // DEBUG (temporary – remove in production)
        // console.log('Entered password:', password);
        // console.log('DB password:', admin.password);

        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        admin.lastLogin = new Date();
        await admin.save();

        const adminResponse = admin.toObject();
        delete adminResponse.password;

        return res.status(200).json({
            success: true,
            token: generateToken(admin),
            admin: adminResponse,
            message: 'Admin login successful'
        });

    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};





/* ================= ADMIN REGISTER ================= */
export const adminRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const existingAdmin = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        // ✅ DO NOT HASH PASSWORD HERE
        const admin = await User.create({
            name,
            email: email.toLowerCase(),
            password, // plain password
            role: 'ADMIN'
        });

        admin.lastLogin = new Date();
        await admin.save();

        const adminResponse = admin.toObject();
        delete adminResponse.password;

        return res.status(201).json({
            success: true,
            token: generateToken(admin),
            admin: adminResponse,
            message: 'Admin registered successfully'
        });

    } catch (error) {
        console.error('Admin register error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

