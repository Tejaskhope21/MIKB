import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';

/* ================= CREATE ORDER ================= */


export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentProof,
      notes = ''
    } = req.body;

    /* =========================
       BASIC VALIDATIONS
    ========================= */
    if (!items || !items.length) {
      throw new Error('No order items');
    }

    if (!shippingAddress || typeof shippingAddress !== 'object') {
      throw new Error('Valid shipping address is required');
    }

    const isValidIds = items.every(i =>
      mongoose.Types.ObjectId.isValid(i.productId)
    );

    if (!isValidIds) {
      throw new Error('Invalid product ID format');
    }

    /* =========================
       FETCH PRODUCTS
    ========================= */
    const productIds = items.map(i => new mongoose.Types.ObjectId(i.productId));

    const products = await Product.find({ _id: { $in: productIds } })
      .populate('sellerId', '_id businessName email phone')
      .session(session)
      .lean(); // ✅ performance boost

    if (products.length !== items.length) {
      throw new Error('One or more products not found');
    }

    /* =========================
       CREATE ORDER ITEMS
    ========================= */
    const orderItems = items.map(item => {
      const product = products.find(
        p => p._id.toString() === item.productId
      );

      if (!product) {
        throw new Error('Product mismatch');
      }

      return {
        product: product._id,
        seller: product.sellerId._id, // ✅ FIX (ObjectId only)
        quantity: item.quantity,
        price: product.price
      };
    });

    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    /* =========================
       PREPARE ORDER
    ========================= */
    const orderData = {
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        ...shippingAddress,
        fullName: req.user.name || shippingAddress.fullName,
        phone: req.user.phone || shippingAddress.phone,
        email: req.user.email || shippingAddress.email
      },
      paymentMethod,
      totalPrice,
      notes
    };

    if (paymentMethod === 'BANK_TRANSFER' && paymentProof) {
      orderData.paymentProof = {
        ...paymentProof,
        amount: totalPrice,
        uploadedAt: new Date()
      };
    }

    /* =========================
       SAVE ORDER
    ========================= */
    const order = await Order.create([orderData], { session });

    /* =========================
       UPDATE STOCK
    ========================= */
    for (const item of items) {
      const product = products.find(
        p => p._id.toString() === item.productId
      );

      if (product?.inventory?.manageStock) {
        if (product.inventory.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        await Product.updateOne(
          { _id: product._id },
          {
            $inc: {
              'inventory.stock': -item.quantity,
              'inventory.reservedStock': item.quantity
            }
          },
          { session }
        );
      }
    }

    /* =========================
       UPDATE SELLER STATS
    ========================= */
    const sellerIds = [
      ...new Set(orderItems.map(i => i.seller.toString()))
    ];

    for (const sellerId of sellerIds) {
      await User.updateOne(
        { _id: sellerId },
        {
          $inc: {
            'sellerStats.totalOrders': 1,
            'sellerStats.pendingOrders': 1,
            'sellerStats.totalRevenue': totalPrice
          }
        },
        { session }
      );
    }

    /* =========================
       COMMIT
    ========================= */
    await session.commitTransaction();
    session.endSession();

    /* =========================
       RESPONSE
    ========================= */
    const populatedOrder = await Order.findById(order[0]._id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price brand')
      .populate('items.seller', 'businessName email phone');

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('CREATE ORDER ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Order creation failed'
    });
  }
};

/* ================= GET USER ORDERS ================= */
export const getOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            page = 1,
            limit = 10,
            status,
            dateFrom,
            dateTo,
            sort = '-createdAt'
        } = req.query;

        const query = { user: userId };

        // Apply filters
        if (status && status !== 'all') {
            query.status = status;
        }

        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('items.product', 'name images price')
                .populate('items.seller', 'businessName email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        res.json({
            success: true,
            orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET ORDER BY ID ================= */
export const getOrderById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            user: userId
        })
            .populate('user', 'name email phone')
            .populate('items.product', 'name images price brand description specs')
            .populate('items.seller', 'businessName email phone');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET SELLER ORDERS ================= */
export const getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const {
            page = 1,
            limit = 20,
            status,
            search,
            paymentMethod,
            dateFrom,
            dateTo
        } = req.query;

        const query = {
            'items.seller': sellerId
        };

        // Apply filters
        if (status && status !== 'all') {
            query.status = status;
        }

        if (paymentMethod && paymentMethod !== 'all') {
            query.paymentMethod = paymentMethod;
        }

        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { 'user.name': { $regex: search, $options: 'i' } },
                { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
            ];
        }

        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user', 'name email phone')
                .populate('items.product', 'name images price')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        // Calculate seller-specific totals
        const sellerOrders = orders.map(order => {
            const sellerItems = order.items.filter(item => 
                item.seller.toString() === sellerId.toString()
            );
            const sellerTotal = sellerItems.reduce((sum, item) => 
                sum + (item.price * item.quantity), 0
            );
            
            return {
                ...order.toObject(),
                sellerItems,
                sellerTotal
            };
        });

        // Get statistics
        const stats = await Order.aggregate([
            { $match: { 'items.seller': sellerId } },
            { $unwind: '$items' },
            { $match: { 'items.seller': sellerId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            }
        ]);

        const statusStats = {
            pending: { count: 0, amount: 0 },
            payment_pending: { count: 0, amount: 0 },
            paid: { count: 0, amount: 0 },
            shipped: { count: 0, amount: 0 },
            delivered: { count: 0, amount: 0 },
            cancelled: { count: 0, amount: 0 }
        };

        stats.forEach(stat => {
            statusStats[stat._id] = {
                count: stat.count,
                amount: stat.totalAmount
            };
        });

        res.json({
            success: true,
            orders: sellerOrders,
            stats: statusStats,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error'
        });
    }
};

/* ================= GET SELLER ORDER DETAILS ================= */
export const getSellerOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const sellerId = req.user._id;

        const order = await Order.findOne({
            _id: orderId,
            'items.seller': sellerId
        })
            .populate('user', 'name email phone')
            .populate('items.product', 'name images price brand')
            .populate('items.seller', 'businessName email phone');

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found or unauthorized' 
            });
        }

        // Filter items for this seller only
        const sellerItems = order.items.filter(item => 
            item.seller._id.toString() === sellerId.toString()
        );

        // Calculate seller-specific totals
        const sellerTotal = sellerItems.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );

        const sellerGst = sellerTotal * 0.18;
        const sellerGrandTotal = sellerTotal + sellerGst;

        res.json({
            success: true,
            order: {
                ...order.toObject(),
                items: sellerItems,
                sellerTotal,
                sellerGst,
                sellerGrandTotal
            }
        });

    } catch (error) {
        console.error('Get seller order details error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

/* ================= UPDATE ORDER STATUS BY SELLER ================= */
export const updateOrderStatusBySeller = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const sellerId = req.user._id;
        const { id } = req.params;
        const { status, trackingNumber, carrier } = req.body;

        if (!status) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                success: false,
                message: 'Status is required' 
            });
        }

        const validStatuses = ['paid', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                success: false,
                message: 'Invalid status' 
            });
        }

        // Find order
        const order = await Order.findOne({
            _id: id,
            'items.seller': sellerId
        }).session(session);

        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ 
                success: false,
                message: 'Order not found or unauthorized' 
            });
        }

        // Check if payment is verified for bank transfer orders
        if (order.paymentMethod === 'BANK_TRANSFER' && 
            status !== 'cancelled' && 
            !order.paymentProof?.verified) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                success: false,
                message: 'Cannot process order. Payment verification pending.' 
            });
        }

        // Status transition validation
        const allowedTransitions = {
            pending: ['paid', 'cancelled'],
            payment_pending: ['paid', 'cancelled'],
            paid: ['shipped', 'cancelled'],
            shipped: ['delivered'],
            delivered: [],
            cancelled: []
        };

        if (!allowedTransitions[order.status]?.includes(status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: `Cannot change status from "${order.status}" to "${status}"`
            });
        }

        // Get seller items
        const sellerItems = order.items.filter(item => 
            item.seller.toString() === sellerId.toString()
        );

        // Update order
        order.status = status;

        // Handle shipping
        if (status === 'shipped') {
            if (!trackingNumber || !carrier) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ 
                    success: false,
                    message: 'Tracking number and carrier are required for shipping' 
                });
            }

            order.trackingInfo = {
                trackingNumber,
                carrier,
                shippedAt: new Date(),
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            };

            const shippingNote = `[SHIPPED] Carrier: ${carrier}, Tracking: ${trackingNumber}`;
            order.notes = (order.notes || '') + '\n' + shippingNote;
        }

        // Handle delivery
        if (status === 'delivered') {
            order.trackingInfo.deliveredAt = new Date();
            const deliveryNote = `[DELIVERED] On: ${new Date().toLocaleDateString('en-IN')}`;
            order.notes = (order.notes || '') + '\n' + deliveryNote;

            // Update seller stats
            const sellerRevenue = sellerItems.reduce((sum, item) => 
                sum + (item.price * item.quantity), 0
            );

            await User.findByIdAndUpdate(
                sellerId,
                {
                    $inc: {
                        'sellerStats.completedOrders': 1,
                        'sellerStats.totalRevenue': sellerRevenue
                    },
                    $inc: { 'sellerStats.pendingOrders': -1 }
                },
                { session }
            );

            // Update product sold count
            for (const item of sellerItems) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { 'inventory.soldCount': item.quantity } },
                    { session }
                );
            }
        }

        // Handle paid status (for COD)
        if (status === 'paid' && order.paymentMethod === 'COD') {
            const paidNote = `[PAID] Marked as paid by seller on ${new Date().toLocaleDateString('en-IN')}`;
            order.notes = (order.notes || '') + '\n' + paidNote;
        }

        // Handle cancellation
        if (status === 'cancelled') {
            // Restore stock
            for (const item of sellerItems) {
                const product = await Product.findById(item.product).session(session);
                if (product?.inventory?.manageStock) {
                    product.inventory.stock += item.quantity;
                    product.inventory.reservedStock = Math.max(
                        0,
                        product.inventory.reservedStock - item.quantity
                    );
                    await product.save({ session });
                }
            }

            // Update seller stats
            await User.findByIdAndUpdate(
                sellerId,
                { 
                    $inc: { 
                        'sellerStats.pendingOrders': -1,
                        'sellerStats.cancelledOrders': 1
                    } 
                },
                { session }
            );
        }

        await order.save({ session });
        await session.commitTransaction();
        session.endSession();

        // Return populated order
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name images price')
            .populate('items.seller', 'businessName');

        res.json({
            success: true,
            order: populatedOrder,
            message: `Order status updated to "${status}"`
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Seller update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= VERIFY PAYMENT PROOF ================= */
export const verifyPaymentProof = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { orderId } = req.params;
        const sellerId = req.user._id;
        const { verified, notes } = req.body;

        // Find order belonging to this seller
        const order = await Order.findOne({
            _id: orderId,
            'items.seller': sellerId,
            paymentMethod: 'BANK_TRANSFER'
        }).session(session);

        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found or not a bank transfer order' 
            });
        }

        if (!order.paymentProof) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                success: false, 
                message: 'No payment proof found for this order' 
            });
        }

        // Update payment proof verification
        order.paymentProof.verified = verified;
        order.paymentProof.verifiedBy = sellerId;
        order.paymentProof.verifiedAt = new Date();
        
        if (notes) {
            order.paymentProof.verificationNotes = notes;
        }

        // Update order status based on verification
        if (verified) {
            order.status = 'paid';
        } else {
            order.status = 'payment_pending';
            order.paymentProof.rejectionReason = notes || 'Payment verification failed';
        }

        await order.save({ session });
        await session.commitTransaction();
        session.endSession();

        // Return updated order
        const updatedOrder = await Order.findById(order._id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name images price');

        res.json({
            success: true,
            message: `Payment ${verified ? 'verified' : 'rejected'} successfully`,
            order: updatedOrder
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Verify payment proof error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

/* ================= GET SELLER PAYMENT DETAILS ================= */
export const getSellerPaymentDetails = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { orderId } = req.params;

        const order = await Order.findOne({
            _id: orderId,
            'items.seller': sellerId,
            paymentMethod: 'BANK_TRANSFER'
        })
            .select('orderId paymentProof totalPrice status createdAt')
            .populate('user', 'name email phone');

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found or not a bank transfer order' 
            });
        }

        res.json({
            success: true,
            paymentDetails: {
                orderId: order.orderId,
                customer: order.user,
                amount: order.totalPrice,
                status: order.status,
                paymentMethod: order.paymentMethod,
                proof: order.paymentProof,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error('Get payment details error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

/* ================= CANCEL ORDER ================= */
export const cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Cancellation reason is required'
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: userId,
            status: { $in: ['pending', 'payment_pending'] }
        }).session(session);

        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled or not found'
            });
        }

        // Update order
        order.status = 'cancelled';
        order.notes = (order.notes || '') + `\n[CANCELLED] Reason: ${reason}`;

        // Release reserved stock and update products
        for (const item of order.items) {
            const product = await Product.findById(item.product).session(session);
            if (product && product.inventory.manageStock) {
                product.inventory.stock += item.quantity;
                product.inventory.reservedStock = Math.max(
                    0,
                    product.inventory.reservedStock - item.quantity
                );
                await product.save({ session });
            }
        }

        // Update seller stats
        for (const item of order.items) {
            await User.findByIdAndUpdate(
                item.seller,
                {
                    $inc: {
                        'sellerStats.pendingOrders': -1,
                        'sellerStats.cancelledOrders': 1
                    }
                },
                { session }
            );
        }

        await order.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            order,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET ORDER HISTORY ================= */
export const getOrderHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            year = new Date().getFullYear(),
            limit = 12
        } = req.query;

        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31 23:59:59`);

        // Get monthly order count
        const monthlyStats = await Order.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 },
                    totalSpent: { $sum: '$totalPrice' },
                    avgOrderValue: { $avg: '$totalPrice' }
                }
            },
            {
                $project: {
                    month: '$_id',
                    count: 1,
                    totalSpent: 1,
                    avgOrderValue: { $round: ['$avgOrderValue', 2] },
                    _id: 0
                }
            },
            { $sort: { month: 1 } }
        ]);

        // Get recent orders
        const recentOrders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('orderId status totalPrice createdAt items.quantity')
            .populate('items.product', 'name categoryId');

        // Calculate summary
        const summary = await Order.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalPrice' },
                    avgOrderValue: { $avg: '$totalPrice' },
                    completedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            history: {
                year: parseInt(year),
                summary: summary[0] || {
                    totalOrders: 0,
                    totalSpent: 0,
                    avgOrderValue: 0,
                    completedOrders: 0,
                    cancelledOrders: 0
                },
                monthlyStats,
                recentOrders
            }
        });

    } catch (error) {
        console.error('Get order history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET ORDER COUNT ================= */
export const getOrderCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const counts = await Order.aggregate([
            {
                $match: { user: new mongoose.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    payment_pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'payment_pending'] }, 1, 0] }
                    },
                    paid: {
                        $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
                    },
                    shipped: {
                        $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
                    },
                    delivered: {
                        $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                    },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            counts: counts[0] || {
                total: 0,
                pending: 0,
                payment_pending: 0,
                paid: 0,
                shipped: 0,
                delivered: 0,
                cancelled: 0
            }
        });

    } catch (error) {
        console.error('Get order count error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET ORDER SUMMARY ================= */
export const getOrderSummary = async (req, res) => {
    try {
        const userId = req.user._id;

        const summary = await Order.aggregate([
            {
                $match: { user: new mongoose.Types.ObjectId(userId) }
            },
            {
                $facet: {
                    statusCounts: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    monthlySpending: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: '$createdAt' },
                                    month: { $month: '$createdAt' }
                                },
                                total: { $sum: '$totalPrice' },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { '_id.year': -1, '_id.month': -1 } },
                        { $limit: 6 }
                    ],
                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                totalSpent: { $sum: '$totalPrice' },
                                avgOrderValue: { $avg: '$totalPrice' }
                            }
                        }
                    ]
                }
            }
        ]);

        res.json({
            success: true,
            summary: {
                statusCounts: summary[0].statusCounts.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                monthlySpending: summary[0].monthlySpending,
                totalStats: summary[0].totalStats[0] || {
                    totalOrders: 0,
                    totalSpent: 0,
                    avgOrderValue: 0
                }
            }
        });

    } catch (error) {
        console.error('Get order summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};