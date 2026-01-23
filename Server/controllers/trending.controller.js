import Product from '../models/Product.model.js';

/* =================================================
   SELLER → REQUEST TRENDING
================================================= */

export const requestTrending = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({
            _id: productId,
            sellerId: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or not owned by you'
            });
        }

        /* ===============================
           BLOCK IF ACTIVE HOT DEAL
        =============================== */
        const isActiveHotDeal =
            product.hotDeal?.isApproved === true &&
            product.hotDeal?.expiresAt &&
            product.hotDeal.expiresAt > new Date();

        if (isActiveHotDeal) {
            return res.status(400).json({
                success: false,
                message: 'Product is already in Hot Deals and cannot be added to Trending'
            });
        }

        /* ===============================
           ALREADY REQUESTED CHECK
        =============================== */
        if (product.trending?.isRequested) {
            return res.status(400).json({
                success: false,
                message: 'Trending request already sent'
            });
        }

        /* ===============================
           CREATE TRENDING REQUEST
        =============================== */
        product.trending = {
            isRequested: true,
            isApproved: false,
            isRejected: false,
            requestedAt: new Date()
        };

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Trending request sent to admin'
        });

    } catch (error) {
        console.error('Trending Request Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


/* =================================================
   SELLER → TRENDING STATUS
================================================= */
export const sellerTrendingStatus = async (req, res) => {
    const products = await Product.find({
        sellerId: req.user._id,
        'trending.isRequested': true
    }).select('name price trending');

    res.json({
        success: true,
        products
    });
};

/* =================================================
   ADMIN → GET TRENDING REQUESTS
================================================= */
export const getTrendingRequests = async (req, res) => {
    const products = await Product.find({
        'trending.isRequested': true,
        'trending.isApproved': false,
        'trending.isRejected': false
    })
        .populate('sellerId', 'name email')
        .select('name price images trending sellerId');

    res.json({
        success: true,
        products
    });
};

/* =================================================
   ADMIN → APPROVE TRENDING
================================================= */
export const approveTrending = async (req, res) => {
    const product = await Product.findById(req.params.productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    product.trending.isApproved = true;
    product.trending.isRejected = false;
    product.trending.isRequested = false;
    product.trending.approvedAt = new Date();

    await product.save();

    res.json({
        success: true,
        message: 'Trending product approved'
    });
};

/* =================================================
   ADMIN → REJECT TRENDING
================================================= */
export const rejectTrending = async (req, res) => {
    const product = await Product.findById(req.params.productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    product.trending.isRejected = true;
    product.trending.isApproved = false;
    product.trending.isRequested = false;
    product.trending.rejectedAt = new Date();

    await product.save();

    res.json({
        success: true,
        message: 'Trending product rejected'
    });
};

/* =================================================
   USER → GET TRENDING PRODUCTS
================================================= */
export const getTrendingProducts = async (req, res) => {
    const products = await Product.find({
        status: 'published',
        'trending.isApproved': true
    })
        .sort({ 'trending.approvedAt': -1 })
        .limit(12)
        .select('name price discount images trending');

    res.json({
        success: true,
        products
    });
};


/* =================================================
   USER → TRACK TRENDING VIEW
================================================= */
export const trackTrendingView = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOneAndUpdate(
            {
                _id: productId,
                'trending.isApproved': true
            },
            {
                $inc: { 'trending.views': 1 }
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Trending product not found'
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Trending View Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* =================================================
   USER → TRACK TRENDING CLICK
================================================= */
export const trackTrendingClick = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOneAndUpdate(
            {
                _id: productId,
                'trending.isApproved': true
            },
            {
                $inc: { 'trending.clicks': 1 }
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Trending product not found'
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Trending Click Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
