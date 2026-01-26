import mongoose from 'mongoose';
import Product from '../models/Product.model.js';

/* =================================================
   UTIL
================================================= */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isActiveTrending = (product) => {
  if (!product.trending) return false;

  return product.trending.isApproved === true;
};

const isActiveHotDeal = (product) => {
  if (!product.hotDeal) return false;

  return (
    product.hotDeal.isApproved === true &&
    product.hotDeal.expiresAt &&
    product.hotDeal.expiresAt > new Date()
  );
};

/* =================================================
   SELLER → REQUEST HOT DEAL (PRODUCTION)
   RULE:
   ❌ If Trending exists → BLOCK
   ✅ If Hot Deal expired → ALLOW new request
================================================= */
export const requestHotDeal = async (req, res) => {
  try {
    const { productId } = req.params;

    /* ===============================
       VALIDATE PRODUCT ID
    =============================== */
    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    /* ===============================
       FIND PRODUCT OWNED BY SELLER
    =============================== */
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
       BLOCK IF TRENDING ACTIVE OR REQUESTED
    =============================== */
    if (
      product.trending?.isRequested === true ||
      isActiveTrending(product)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Product is already in Trending. Hot Deal not allowed.'
      });
    }

    /* ===============================
       BLOCK DUPLICATE HOT DEAL REQUEST
    =============================== */
    if (product.hotDeal?.isRequested === true) {
      return res.status(400).json({
        success: false,
        message: 'Hot Deal request already submitted'
      });
    }

    /* ===============================
       BLOCK IF HOT DEAL IS STILL ACTIVE
    =============================== */
    if (isActiveHotDeal(product)) {
      return res.status(400).json({
        success: false,
        message: 'Hot Deal is already active for this product'
      });
    }

    /* ===============================
       RESET & CREATE HOT DEAL REQUEST
    =============================== */
    product.hotDeal = {
      isRequested: true,
      isApproved: false,
      isRejected: false,
      isPaid: true, // 🔥 Auto paid (as per your rule)
      priority: 0,
      views: 0,
      clicks: 0,
      requestedAt: new Date(),
      approvedAt: null,
      expiresAt: null
    };

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Hot Deal request submitted successfully'
    });

  } catch (error) {
    console.error('REQUEST HOT DEAL ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while requesting Hot Deal'
    });
  }
};

/* =================================================
   SELLER → HOT DEAL STATUS
================================================= */
export const sellerHotDealStatus = async (req, res) => {
    try {
        const products = await Product.find({
            sellerId: req.user._id,
            'hotDeal.isRequested': true
        }).select('name price images hotDeal');

        res.json({ success: true, products });

    } catch (error) {
        console.error('SELLER HOT DEAL STATUS ERROR:', error);
        res.status(500).json({ success: false });
    }
};

/* =================================================
   ADMIN → GET HOT DEAL REQUESTS
================================================= */
export const getHotDealRequests = async (req, res) => {
    try {
        const products = await Product.find({
            'hotDeal.isRequested': true,
            'hotDeal.isApproved': false,
            'hotDeal.isRejected': false
        })
            .populate('sellerId', 'name email businessName')
            .select('name price images hotDeal sellerId');

        res.json({ success: true, products });

    } catch (error) {
        console.error('GET HOT DEAL REQUESTS ERROR:', error);
        res.status(500).json({ success: false });
    }
};

/* =================================================
   ADMIN → APPROVE HOT DEAL
================================================= */
export const approveHotDeal = async (req, res) => {
    try {
        const { days = 7, priority = 10 } = req.body;
        const { productId } = req.params;

        if (!isValidObjectId(productId)) {
            return res.status(400).json({ success: false });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        /* 🔒 DOUBLE CHECK TRENDING */
        if (product.trending?.isApproved) {
            return res.status(400).json({
                success: false,
                message: 'Product already active in Trending'
            });
        }

        product.hotDeal = {
            ...product.hotDeal,
            isApproved: true,
            isRejected: false,
            isRequested: false,
            isPaid: true,
            priority,
            approvedAt: new Date(),
            expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        };

        await product.save();

        res.json({
            success: true,
            message: 'Hot deal approved successfully'
        });

    } catch (error) {
        console.error('APPROVE HOT DEAL ERROR:', error);
        res.status(500).json({ success: false });
    }
};

/* =================================================
   ADMIN → REJECT HOT DEAL
================================================= */
export const rejectHotDeal = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!isValidObjectId(productId)) {
            return res.status(400).json({ success: false });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false });
        }

        product.hotDeal = {
            ...product.hotDeal,
            isRejected: true,
            isRequested: false,
            isApproved: false
        };

        await product.save();

        res.json({
            success: true,
            message: 'Hot deal rejected'
        });

    } catch (error) {
        console.error('REJECT HOT DEAL ERROR:', error);
        res.status(500).json({ success: false });
    }
};

/* =================================================
   USER → GET ACTIVE HOT DEAL PRODUCTS
================================================= */
export const getHotDeals = async (req, res) => {
    try {
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

    } catch (error) {
        console.error('GET HOT DEALS ERROR:', error);
        res.status(500).json({ success: false });
    }
};

/* =================================================
   ANALYTICS → VIEW
================================================= */
export const trackHotDealView = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.productId)) {
            return res.json({ success: false });
        }

        await Product.findByIdAndUpdate(req.params.productId, {
            $inc: { 'hotDeal.views': 1 }
        });

        res.json({ success: true });

    } catch {
        res.json({ success: false });
    }
};

/* =================================================
   ANALYTICS → CLICK
================================================= */
export const trackHotDealClick = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.productId)) {
            return res.json({ success: false });
        }

        await Product.findByIdAndUpdate(req.params.productId, {
            $inc: { 'hotDeal.clicks': 1 }
        });

        res.json({ success: true });

    } catch {
        res.json({ success: false });
    }
};
