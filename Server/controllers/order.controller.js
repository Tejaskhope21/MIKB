import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';

/* ================= CREATE ORDER ================= */

// ================= GET SELLER ORDERS =================
export const getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user._id; // assuming logged-in seller

        const {
            page = 1,
            limit = 10,
            status,
            search // optional: search by orderId or customer name
        } = req.query;

        const query = {
            'items.seller': sellerId
        };

        if (status) query.status = status;
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { 'user.name': { $regex: search, $options: 'i' } } // assuming you populate user later
            ];
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

        res.json({
            success: true,
            orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, notes = '' } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        if (!shippingAddress || typeof shippingAddress !== 'object') {
            return res.status(400).json({ message: 'Valid shipping address is required' });
        }

        // Validate all productIds are valid ObjectIds
        const validObjectIds = items.every(item =>
            mongoose.Types.ObjectId.isValid(item.productId)
        );
        if (!validObjectIds) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const productIds = items.map(i => new mongoose.Types.ObjectId(i.productId));
        const products = await Product.find({ _id: { $in: productIds } }).populate('sellerId');

        if (products.length !== items.length) {
            return res.status(400).json({ message: 'One or more products not found' });
        }

        // Optional: Check all products have same seller
        const sellerIds = [...new Set(products.map(p => p.sellerId.toString()))];
        if (sellerIds.length > 1) {
            return res.status(400).json({ message: 'All products must belong to same seller' });
        }

        const orderItems = items.map(item => {
            const product = products.find(p => p._id.toString() === item.productId);
            return {
                product: product._id,
                seller: product.sellerId,
                quantity: item.quantity,
                price: product.price
            };
        });

        const totalPrice = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            notes
        });

        // Optionally populate before sending
        const populatedOrder = await Order.findById(order._id)
            .populate('items.product', 'name images')
            .populate('items.seller', 'businessName');

        res.status(201).json(populatedOrder);

    } catch (error) {
        console.error('CREATE ORDER ERROR:', error);
        res.status(500).json({
            message: 'Order creation failed',
            error: error.message
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
        if (status) {
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
                .populate('items.seller', 'name businessName')
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
            .populate('items.product', 'name images brand description specs')
            .populate('items.seller', 'name businessName email contactNumber');

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

/* ================= UPDATE ORDER STATUS BY SELLER (NO SCHEMA CHANGE) ================= */
/* ================= UPDATE ORDER STATUS BY SELLER (WORKS WITH CURRENT SCHEMA) ================= */
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
            return res.status(400).json({ message: 'Status is required' });
        }

        // Only allow valid enum values from your schema
        const validStatuses = ['paid', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findOne({
            _id: id,
            'items.seller': sellerId
        }).session(session);

        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Order not found or you are not authorized' });
        }

        // Valid status transitions based on your enum
        const allowedTransitions = {
            pending: ['paid', 'cancelled'],
            paid: ['shipped', 'cancelled'],
            shipped: ['delivered'],
            delivered: [],
            cancelled: []
        };

        if (!allowedTransitions[order.status]?.includes(status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: `Cannot change status from "${order.status}" to "${status}"`
            });
        }

        const oldStatus = order.status;
        order.status = status;

        // When marking as shipped → save tracking in notes
        if (status === 'shipped') {
            if (!trackingNumber || !carrier) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Tracking number and carrier are required' });
            }

            const trackingNote = `\n\n[SHIPPING DETAILS]\nCarrier: ${carrier}\nTracking Number: ${trackingNumber}\nShipped on: ${new Date().toLocaleDateString('en-IN')}`;
            order.notes = (order.notes || '') + trackingNote;
        }

        // When delivered → update sold count and seller stats
        if (status === 'delivered') {
            const deliveredNote = `\n\n[DELIVERED]\nOrder marked as delivered on: ${new Date().toLocaleDateString('en-IN')}`;
            order.notes = (order.notes || '') + deliveredNote;

            // Increase sold count for products
            for (const item of order.items.filter(i => i.seller.toString() === sellerId.toString())) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { 'inventory.soldCount': item.quantity } },
                    { session }
                );
            }

            // Update seller revenue and completed orders
            await User.findByIdAndUpdate(
                sellerId,
                {
                    $inc: {
                        'sellerStats.completedOrders': 1,
                        'sellerStats.totalRevenue': order.totalPrice
                    }
                },
                { session }
            );
        }

        // Cancel → release stock
        if (status === 'cancelled') {
            for (const item of order.items.filter(i => i.seller.toString() === sellerId.toString())) {
                const product = await Product.findById(item.product).session(session);
                if (product?.inventory?.manageStock) {
                    product.inventory.stock += item.quantity;
                    product.inventory.reservedStock = Math.max(0, product.inventory.reservedStock - item.quantity);
                    await product.save({ session });
                }
            }
        }

        await order.save({ session });
        await session.commitTransaction();
        session.endSession();

        // Return fresh populated order
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
            message: 'Server error',
            error: error.message
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
            status: { $in: ['pending', 'confirmed'] }
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
        order.cancellationReason = reason;
        order.payment.status = 'refunded';

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
                        'sellerStats.pendingOrders': -1
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

/* ================= REQUEST RETURN/REFUND ================= */
export const requestReturn = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { itemId, reason, description, images } = req.body;

        const order = await Order.findOne({
            _id: id,
            user: userId,
            status: 'delivered'
        });

        if (!order) {
            return res.status(400).json({
                success: false,
                message: 'Order not found or cannot be returned'
            });
        }

        const item = order.items.find(item => item._id.toString() === itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Order item not found'
            });
        }

        // Check if item is already requested for return
        if (item.returnStatus) {
            return res.status(400).json({
                success: false,
                message: 'Return already requested for this item'
            });
        }

        // Update item return status
        item.returnStatus = 'requested';
        item.returnReason = reason;
        item.returnDescription = description;
        item.returnImages = images || [];

        await order.save();

        // Notify seller (in real app, send notification/email)
        // await notifySellerAboutReturn(item.seller, order, item);

        res.json({
            success: true,
            message: 'Return request submitted successfully',
            returnId: item._id
        });

    } catch (error) {
        console.error('Request return error:', error);
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

        // Get top categories
        const topCategories = await Order.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.categoryId',
                    count: { $sum: '$items.quantity' },
                    totalSpent: {
                        $sum: { $multiply: ['$items.price', '$items.quantity'] }
                    }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Get recent orders
        const recentOrders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('orderId status total createdAt items.quantity')
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
                topCategories,
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

/* ================= TRACK ORDER ================= */
export const trackOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            user: userId
        }).select('orderId status shipping items createdAt updatedAt');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Create timeline based on order status
        const timeline = [];
        const now = new Date();

        timeline.push({
            status: 'Order Placed',
            date: order.createdAt,
            completed: true,
            description: 'Your order has been placed successfully'
        });

        if (order.status === 'confirmed' ||
            order.status === 'processing' ||
            order.status === 'shipped' ||
            order.status === 'delivered') {
            timeline.push({
                status: 'Order Confirmed',
                date: order.updatedAt,
                completed: true,
                description: 'Seller has confirmed your order'
            });
        }

        if (order.status === 'processing' ||
            order.status === 'shipped' ||
            order.status === 'delivered') {
            timeline.push({
                status: 'Processing',
                date: order.updatedAt,
                completed: true,
                description: 'Seller is preparing your order'
            });
        }

        if (order.status === 'shipped' || order.status === 'delivered') {
            timeline.push({
                status: 'Shipped',
                date: order.shipping?.estimatedDelivery ?
                    new Date(order.shipping.estimatedDelivery.getTime() - 2 * 24 * 60 * 60 * 1000) :
                    new Date(order.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
                completed: true,
                description: order.shipping?.trackingNumber ?
                    `Shipped with tracking: ${order.shipping.trackingNumber}` :
                    'Your order has been shipped',
                trackingNumber: order.shipping?.trackingNumber,
                carrier: order.shipping?.carrier
            });
        }

        if (order.status === 'delivered') {
            timeline.push({
                status: 'Delivered',
                date: order.shipping?.deliveredAt || order.updatedAt,
                completed: true,
                description: 'Your order has been delivered'
            });
        } else {
            timeline.push({
                status: 'Out for Delivery',
                date: order.shipping?.estimatedDelivery ||
                    new Date(order.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000),
                completed: false,
                description: 'Estimated delivery date',
                isCurrent: true
            });
        }

        // Sort timeline by date
        timeline.sort((a, b) => a.date - b.date);

        res.json({
            success: true,
            order: {
                orderId: order.orderId,
                status: order.status,
                shipping: order.shipping,
                items: order.items,
                timeline
            }
        });

    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= DOWNLOAD INVOICE ================= */
export const downloadInvoice = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            user: userId
        })
            .populate('user', 'name email phone addresses')
            .populate('items.seller', 'businessName gstNumber businessAddress');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Get product details
        const itemsWithDetails = await Promise.all(
            order.items.map(async (item) => {
                const product = await Product.findById(item.product)
                    .select('name brand description');
                return {
                    ...item.toObject(),
                    productDetails: product
                };
            })
        );

        // Generate invoice data
        const invoiceData = {
            invoiceNumber: `INV-${order.orderId}`,
            date: new Date().toLocaleDateString('en-IN'),
            orderDate: order.createdAt.toLocaleDateString('en-IN'),

            customer: {
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone,
                address: order.shippingAddress
            },

            seller: order.items[0]?.seller ? {
                name: order.items[0].seller.businessName,
                gst: order.items[0].seller.gstNumber,
                address: order.items[0].seller.businessAddress
            } : null,

            items: itemsWithDetails.map(item => ({
                name: item.productDetails?.name || item.name,
                description: item.productDetails?.description || '',
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            })),

            summary: {
                subtotal: order.subtotal,
                shipping: order.shipping.cost,
                tax: order.tax,
                discount: order.discount,
                total: order.totalPrice
            },

            payment: {
                method: order.payment.method,
                status: order.payment.status,
                transactionId: order.payment.transactionId
            }
        };

        // In a real application, you would generate a PDF here
        // For now, return JSON data
        res.json({
            success: true,
            invoice: invoiceData,
            message: 'Invoice data generated successfully',
            downloadUrl: `/api/v1/orders/${id}/invoice/pdf` // Would generate PDF in production
        });

    } catch (error) {
        console.error('Download invoice error:', error);
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

/* ================= REORDER ================= */
export const reorder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { id } = req.params;

        // Get the original order
        const originalOrder = await Order.findOne({
            _id: id,
            user: userId
        }).session(session);

        if (!originalOrder) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Original order not found'
            });
        }

        // Check if all products are still available
        for (const item of originalOrder.items) {
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Product is no longer available`
                });
            }

            if (product.inventory.manageStock && product.inventory.stock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product`
                });
            }
        }

        // Create new order with same items and address
        const newOrder = new Order({
            user: userId,
            items: originalOrder.items.map(item => ({
                ...item.toObject(),
                _id: undefined, // Remove old _id
                status: 'pending'
            })),
            shippingAddress: originalOrder.shippingAddress,
            paymentMethod: originalOrder.paymentMethod,
            totalPrice: originalOrder.totalPrice,
            status: 'pending'
        });

        // Reserve stock for new order
        for (const item of newOrder.items) {
            const product = await Product.findById(item.product).session(session);

            if (product && product.inventory.manageStock) {
                product.inventory.reservedStock += item.quantity;
                product.inventory.stock -= item.quantity;
                await product.save({ session });
            }
        }

        await newOrder.save({ session });

        // Update seller stats
        for (const item of newOrder.items) {
            await User.findByIdAndUpdate(
                item.seller,
                {
                    $inc: {
                        'sellerStats.totalOrders': 1,
                        'sellerStats.pendingOrders': 1,
                        'sellerStats.totalRevenue': item.price * item.quantity
                    }
                },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            order: newOrder,
            message: 'Reorder created successfully'
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Reorder error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const getSellerOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('user', 'name email phone')
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'categoryId', select: 'name title' },
                    { path: 'subcategoryId', select: 'name title' }
                ]
            });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if this seller owns any item in the order
        const isSellerOrder = order.items.some(item => item.seller.toString() === req.user._id.toString());
        if (!isSellerOrder) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
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
                    processing: {
                        $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
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
                processing: 0,
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