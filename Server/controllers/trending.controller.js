import Product from '../models/Product.model.js';
import mongoose from 'mongoose';


/* =================================================
   HELPER → CHECK ACTIVE HOT DEAL
================================================= */
const isActiveHotDeal = (product) => {
  if (!product.hotDeal) return false;

  return (
    product.hotDeal.isApproved === true &&
    product.hotDeal.expiresAt &&
    product.hotDeal.expiresAt > new Date()
  );
};

/* =================================================
   SELLER → REQUEST TRENDING (PRODUCTION)
================================================= */
export const requestTrending = async (req, res) => {
  try {
    const { productId } = req.params;

    /* ===============================
       VALIDATE PRODUCT ID
    =============================== */
    if (!mongoose.Types.ObjectId.isValid(productId)) {
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
       BLOCK IF HOT DEAL EXISTS
    =============================== */
    if (
      product.hotDeal?.isRequested === true ||
      isActiveHotDeal(product)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Product is already in Hot Deals'
      });
    }

    /* ===============================
       BLOCK DUPLICATE TRENDING REQUEST
    =============================== */
    if (product.trending?.isRequested === true) {
      return res.status(400).json({
        success: false,
        message: 'Trending request already sent'
      });
    }

    /* ===============================
       BLOCK IF ALREADY APPROVED
    =============================== */
    if (product.trending?.isApproved === true) {
      return res.status(400).json({
        success: false,
        message: 'Product is already approved as Trending'
      });
    }

    /* ===============================
       RESET & CREATE TRENDING REQUEST
    =============================== */
    product.trending = {
      isRequested: true,
      isApproved: false,
      isRejected: false,
      views: 0,
      clicks: 0,
      requestedAt: new Date(),
      approvedAt: null,
      rejectedAt: null
    };

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Trending request sent to admin successfully'
    });

  } catch (error) {
    console.error('Trending Request Error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while requesting trending'
    });
  }
};


/* =================================================
   SELLER → TRENDING STATUS
================================================= */
export const sellerTrendingStatus = async (req, res) => {
    try {
        const products = await Product.find({
            sellerId: req.user._id,
            $or: [
                { 'trending.isRequested': true },
                { 'trending.isApproved': true }
            ]
        }).select('name price trending');

        res.json({ success: true, products });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/* =================================================
   ADMIN → GET TRENDING REQUESTS
================================================= */
export const getTrendingRequests = async (req, res) => {
    try {
        const products = await Product.find({
            'trending.isRequested': true,
            'trending.isApproved': false,
            'trending.isRejected': false
        })
            .populate('sellerId', 'name email')
            .select('name price images trending sellerId');

        res.json({ success: true, products });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/* =================================================
   ADMIN → APPROVE TRENDING
================================================= */
export const approveTrending = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        /* 🔥 REMOVE HOT DEAL IF EXISTS */
        product.hotDeal = {
            isRequested: false,
            isApproved: false,
            isRejected: false
        };

        product.trending = {
            ...product.trending,
            isApproved: true,
            isRejected: false,
            isRequested: false,
            approvedAt: new Date()
        };

        await product.save();

        res.json({
            success: true,
            message: 'Trending product approved'
        });

    } catch (error) {
        console.error('Approve Trending Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/* =================================================
   ADMIN → REJECT TRENDING
================================================= */
export const rejectTrending = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.trending = {
            ...product.trending,
            isRejected: true,
            isApproved: false,
            isRequested: false,
            rejectedAt: new Date()
        };

        await product.save();

        res.json({
            success: true,
            message: 'Trending product rejected'
        });

    } catch (error) {
        console.error('Reject Trending Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/* =================================================
   USER → GET TRENDING PRODUCTS
================================================= */
export const getTrendingProducts = async (req, res) => {
    try {
        const products = await Product.find({
            status: 'published',
            'trending.isApproved': true
        })
            .sort({ 'trending.approvedAt': -1 })
            .limit(12)
            .select('name price discount images trending');

        res.json({ success: true, products });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/* =================================================
   USER → TRACK TRENDING VIEW
================================================= */
export const trackTrendingView = async (req, res) => {
    try {
        await Product.updateOne(
            { _id: req.params.productId, 'trending.isApproved': true },
            { $inc: { 'trending.views': 1 } }
        );

        res.json({ success: true });

    } catch (error) {
        console.error('Trending View Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/* =================================================
   USER → TRACK TRENDING CLICK
================================================= */
export const trackTrendingClick = async (req, res) => {
    try {
        await Product.updateOne(
            { _id: req.params.productId, 'trending.isApproved': true },
            { $inc: { 'trending.clicks': 1 } }
        );

        res.json({ success: true });

    } catch (error) {
        console.error('Trending Click Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
