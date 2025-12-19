import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';

/* ================= CREATE ORDER ================= */
export const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { items, shippingAddress, paymentMethod, notes } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Order items are required'
            });
        }

        if (!shippingAddress) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required'
            });
        }

        // Fetch user with addresses
        const user = await User.findById(userId).session(session);

        // Check if the shipping address exists in user's addresses
        const userAddress = user.addresses.find(addr =>
            addr._id.toString() === shippingAddress
        );

        if (!userAddress) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Invalid shipping address'
            });
        }

        let subtotal = 0;
        let totalItems = 0;
        const orderItems = [];
        const sellerItems = new Map(); // To group items by seller

        // Process each item
        for (const item of items) {
            const product = await Product.findOne({
                numericId: Number(item.productId)
            }).session(session);

            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            // Check stock availability
            if (product.inventory.manageStock && product.inventory.stock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.inventory.stock}`
                });
            }

            // Calculate item total
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            totalItems += item.quantity;

            // Create order item
            const orderItem = {
                productId: product._id,
                numericId: product.numericId,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.images?.[0],
                sellerId: product.sellerId,
                status: 'pending'
            };

            orderItems.push(orderItem);

            // Group items by seller for commission calculation
            const sellerId = product.sellerId.toString();
            if (!sellerItems.has(sellerId)) {
                sellerItems.set(sellerId, {
                    sellerId: product.sellerId,
                    items: [],
                    total: 0
                });
            }

            const sellerData = sellerItems.get(sellerId);
            sellerData.items.push(orderItem);
            sellerData.total += itemTotal;

            // Reserve stock
            if (product.inventory.manageStock) {
                product.inventory.reservedStock += item.quantity;
                product.inventory.stock -= item.quantity;
                await product.save({ session });
            }
        }

        // Calculate totals
        const shippingCost = 0; // Could be calculated based on weight/distance
        const tax = subtotal * 0.18; // 18% GST
        const discount = 0; // Could apply coupon codes
        const total = subtotal + shippingCost + tax - discount;

        // Calculate commission and seller amounts
        const sellerAmounts = new Map();
        let totalCommission = 0;

        for (const [sellerId, data] of sellerItems) {
            const seller = await User.findById(sellerId).session(session);
            const commissionRate = seller.commission?.rate || 10;
            const commissionAmount = (data.total * commissionRate) / 100;
            const sellerAmount = data.total - commissionAmount;

            sellerAmounts.set(sellerId, {
                sellerAmount,
                commissionAmount
            });

            totalCommission += commissionAmount;
        }

        // Create order
        const order = new Order({
            userId,
            items: orderItems,
            shippingAddress: userAddress,
            payment: {
                method: paymentMethod || 'cod',
                status: paymentMethod === 'cod' ? 'pending' : 'pending',
                amount: total
            },
            shipping: {
                method: 'standard',
                cost: shippingCost,
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
            },
            subtotal,
            tax,
            discount,
            total,
            sellerAmount: total - totalCommission,
            commissionAmount: totalCommission,
            notes,
            status: paymentMethod === 'cod' ? 'pending' : 'pending'
        });

        await order.save({ session });

        // Update user's order count
        user.orderCount = (user.orderCount || 0) + 1;
        await user.save({ session });

        // Update seller stats
        for (const [sellerId, data] of sellerAmounts) {
            await User.findByIdAndUpdate(
                sellerId,
                {
                    $inc: {
                        'sellerStats.totalOrders': 1,
                        'sellerStats.pendingOrders': 1,
                        'sellerStats.totalRevenue': data.sellerAmount
                    }
                },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        // Populate order details
        const populatedOrder = await Order.findById(order._id)
            .populate('userId', 'name email')
            .populate('items.sellerId', 'name businessName');

        res.status(201).json({
            success: true,
            order: populatedOrder,
            message: 'Order created successfully'
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Create order error:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

        const query = { userId };

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
                .populate('items.sellerId', 'name businessName')
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
            userId
        })
            .populate('userId', 'name email phone')
            .populate('items.sellerId', 'name businessName email contactNumber');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Get product details for each item
        const itemsWithDetails = await Promise.all(
            order.items.map(async (item) => {
                const product = await Product.findOne({ numericId: item.numericId })
                    .select('name images brand description specs');

                return {
                    ...item.toObject(),
                    productDetails: product
                };
            })
        );

        const orderWithDetails = {
            ...order.toObject(),
            items: itemsWithDetails
        };

        res.json({
            success: true,
            order: orderWithDetails
        });

    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= UPDATE ORDER STATUS ================= */
export const updateOrderStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { status, cancellationReason, trackingNumber, carrier } = req.body;

        // Validate status
        const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const order = await Order.findOne({
            _id: id,
            userId
        }).session(session);

        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be updated to this status
        const statusFlow = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [],
            'cancelled': []
        };

        if (!statusFlow[order.status].includes(status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${order.status} to ${status}`
            });
        }

        const oldStatus = order.status;
        order.status = status;

        // Handle status-specific updates
        if (status === 'cancelled') {
            order.cancellationReason = cancellationReason;
            order.payment.status = 'refunded';

            // Release reserved stock and update products
            for (const item of order.items) {
                const product = await Product.findById(item.productId).session(session);
                if (product) {
                    if (product.inventory.manageStock) {
                        product.inventory.stock += item.quantity;
                        product.inventory.reservedStock = Math.max(
                            0,
                            product.inventory.reservedStock - item.quantity
                        );
                        await product.save({ session });
                    }
                }
            }

            // Update seller stats
            for (const item of order.items) {
                await User.findByIdAndUpdate(
                    item.sellerId,
                    {
                        $inc: {
                            'sellerStats.pendingOrders': -1
                        }
                    },
                    { session }
                );
            }
        }

        if (status === 'shipped') {
            order.shipping.trackingNumber = trackingNumber;
            order.shipping.carrier = carrier;
            order.shipping.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        }

        if (status === 'delivered') {
            order.shipping.deliveredAt = new Date();
            order.payment.status = 'completed';

            // Update product sold counts
            for (const item of order.items) {
                const product = await Product.findById(item.productId).session(session);
                if (product) {
                    product.inventory.soldCount += item.quantity;
                    product.lastSold = new Date();
                    await product.save({ session });
                }
            }

            // Update seller stats
            for (const item of order.items) {
                await User.findByIdAndUpdate(
                    item.sellerId,
                    {
                        $inc: {
                            'sellerStats.pendingOrders': -1,
                            'sellerStats.completedOrders': 1
                        }
                    },
                    { session }
                );
            }
        }

        await order.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            order,
            message: `Order status updated from ${oldStatus} to ${status}`
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Update order status error:', error);
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
            userId,
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
            const product = await Product.findById(item.productId).session(session);
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
                item.sellerId,
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
            userId,
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
        // await notifySellerAboutReturn(item.sellerId, order, item);

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
                    userId: new mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 },
                    totalSpent: { $sum: '$total' },
                    avgOrderValue: { $avg: '$total' }
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
                    userId: new mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
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
        const recentOrders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('orderId status total createdAt items.quantity')
            .populate('items.productId', 'name categoryId');

        // Calculate summary
        const summary = await Order.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$total' },
                    avgOrderValue: { $avg: '$total' },
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
            userId
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
            userId
        })
            .populate('userId', 'name email phone addresses')
            .populate('items.sellerId', 'businessName gstNumber businessAddress');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Get product details
        const itemsWithDetails = await Promise.all(
            order.items.map(async (item) => {
                const product = await Product.findOne({ numericId: item.numericId })
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
                name: order.userId.name,
                email: order.userId.email,
                phone: order.userId.phone,
                address: order.shippingAddress
            },

            seller: order.items[0]?.sellerId ? {
                name: order.items[0].sellerId.businessName,
                gst: order.items[0].sellerId.gstNumber,
                address: order.items[0].sellerId.businessAddress
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
                total: order.total
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
                $match: { userId: new mongoose.Types.ObjectId(userId) }
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
                                total: { $sum: '$total' },
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
                                totalSpent: { $sum: '$total' },
                                avgOrderValue: { $avg: '$total' }
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
            userId
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
            const product = await Product.findOne({
                numericId: item.numericId
            }).session(session);

            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.name} is no longer available`
                });
            }

            if (product.inventory.manageStock && product.inventory.stock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.name}`
                });
            }
        }

        // Create new order with same items and address
        const newOrder = new Order({
            userId,
            items: originalOrder.items.map(item => ({
                ...item.toObject(),
                _id: undefined, // Remove old _id
                status: 'pending'
            })),
            shippingAddress: originalOrder.shippingAddress,
            payment: {
                method: originalOrder.payment.method,
                status: 'pending',
                amount: originalOrder.total
            },
            shipping: {
                method: originalOrder.shipping.method,
                cost: originalOrder.shipping.cost,
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            },
            subtotal: originalOrder.subtotal,
            tax: originalOrder.tax,
            discount: originalOrder.discount,
            total: originalOrder.total,
            sellerAmount: originalOrder.sellerAmount,
            commissionAmount: originalOrder.commissionAmount,
            notes: `Reorder of order ${originalOrder.orderId}`,
            status: 'pending'
        });

        // Reserve stock for new order
        for (const item of newOrder.items) {
            const product = await Product.findOne({
                numericId: item.numericId
            }).session(session);

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
                item.sellerId,
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

/* ================= GET ORDER COUNT ================= */
export const getOrderCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const counts = await Order.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
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