import Product from '../models/Product.model.js';

/* =================================================
   SELLER → REQUEST HOT DEAL
================================================= */



export const requestHotDeal = async (req, res) => {
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

        if (product.hotDeal?.isRequested) {
            return res.status(400).json({
                success: false,
                message: 'Hot deal already requested'
            });
        }

        product.hotDeal = {
            ...product.hotDeal,
            isRequested: true,
            isApproved: false,
            isRejected: false,
            isPaid: true, // no payment
            requestedAt: new Date()
        };

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Hot deal request sent to admin'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


/* =================================================
   SELLER → HOT DEAL STATUS
================================================= */
export const sellerHotDealStatus = async (req, res) => {
    const products = await Product.find({
        sellerId: req.user._id,
        'hotDeal.isRequested': true
    }).select('name price hotDeal');

    res.json({ success: true, products });
};

/* =================================================
   ADMIN → GET HOT DEAL REQUESTS
================================================= */
export const getHotDealRequests = async (req, res) => {
    const products = await Product.find({
        'hotDeal.isRequested': true,
        'hotDeal.isApproved': false,
        'hotDeal.isRejected': false
    })
        .populate('sellerId', 'name email')
        .select('name price hotDeal sellerId');

    res.json({ success: true, products });
};

/* =================================================
   ADMIN → APPROVE HOT DEAL
================================================= */
export const approveHotDeal = async (req, res) => {
    const { days = 7, priority = 10 } = req.body;

    const product = await Product.findById(req.params.productId);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    product.hotDeal.isApproved = true;
    product.hotDeal.isRejected = false;
    product.hotDeal.isRequested = false;
    product.hotDeal.approvedAt = new Date();
    product.hotDeal.expiresAt = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
    );
    product.hotDeal.priority = priority;
    product.hotDeal.isPaid = true; // 🔥 AUTO ACTIVE

    await product.save();

    res.json({
        success: true,
        message: 'Hot deal approved and activated'
    });
};

/* =================================================
   ADMIN → REJECT HOT DEAL
================================================= */
export const rejectHotDeal = async (req, res) => {
    const product = await Product.findById(req.params.productId);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    product.hotDeal.isRejected = true;
    product.hotDeal.isRequested = false;
    product.hotDeal.isApproved = false;

    await product.save();

    res.json({
        success: true,
        message: 'Hot deal rejected'
    });
};

/* =================================================
   USER → GET HOT DEAL PRODUCTS
================================================= */
export const getHotDeals = async (req, res) => {
    const products = await Product.find({
        status: 'published',
        'hotDeal.isApproved': true,
        'hotDeal.isPaid': true,
        'hotDeal.expiresAt': { $gt: new Date() }
    })
        .sort({
            'hotDeal.priority': -1,
            'hotDeal.approvedAt': -1
        })
        .select('name price discount images hotDeal');

    res.json({
        success: true,
        products
    });
};

/* =================================================
   ANALYTICS
================================================= */
export const trackHotDealView = async (req, res) => {
    await Product.findByIdAndUpdate(req.params.productId, {
        $inc: { 'hotDeal.views': 1 }
    });

    res.json({ success: true });
};

export const trackHotDealClick = async (req, res) => {
    await Product.findByIdAndUpdate(req.params.productId, {
        $inc: { 'hotDeal.clicks': 1 }
    });

    res.json({ success: true });
};
