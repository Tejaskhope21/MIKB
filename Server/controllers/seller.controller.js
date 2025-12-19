import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import Payout from '../models/Payout.model.js';
import mongoose from 'mongoose';

/* ================= GET SELLER DASHBOARD STATS ================= */
export const getSellerDashboard = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const [
            totalProducts,
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue,
            recentOrders,
            lowStockProducts,
            monthlyRevenue
        ] = await Promise.all([
            // Total Products
            Product.countDocuments({ sellerId }),

            // Total Orders
            Order.countDocuments({ 'items.sellerId': sellerId }),

            // Pending Orders
            Order.countDocuments({
                'items.sellerId': sellerId,
                'items.status': 'pending'
            }),

            // Completed Orders
            Order.countDocuments({
                'items.sellerId': sellerId,
                'items.status': 'delivered'
            }),

            // Total Revenue
            Order.aggregate([
                { $match: { 'items.sellerId': sellerId, status: 'delivered' } },
                { $unwind: '$items' },
                { $match: { 'items.sellerId': sellerId } },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $multiply: ['$items.price', '$items.quantity']
                            }
                        }
                    }
                }
            ]),

            // Recent Orders (last 10)
            Order.find({ 'items.sellerId': sellerId })
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(10),

            // Low Stock Products
            Product.find({
                sellerId,
                'inventory.stock': { $lte: 10 },
                'inventory.manageStock': true
            }).select('name inventory.stock inventory.sku images'),

            // Monthly Revenue (last 6 months)
            Order.aggregate([
                {
                    $match: {
                        'items.sellerId': sellerId,
                        status: 'delivered',
                        createdAt: {
                            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                        }
                    }
                },
                { $unwind: '$items' },
                { $match: { 'items.sellerId': sellerId } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        revenue: {
                            $sum: {
                                $multiply: ['$items.price', '$items.quantity']
                            }
                        },
                        orders: { $addToSet: '$_id' }
                    }
                },
                {
                    $project: {
                        month: '$_id.month',
                        year: '$_id.year',
                        revenue: 1,
                        orderCount: { $size: '$orders' },
                        _id: 0
                    }
                },
                { $sort: { year: 1, month: 1 } }
            ])
        ]);

        const revenue = totalRevenue[0]?.total || 0;

        // Update seller stats in user document
        await User.findByIdAndUpdate(sellerId, {
            'sellerStats.totalProducts': totalProducts,
            'sellerStats.totalOrders': totalOrders,
            'sellerStats.pendingOrders': pendingOrders,
            'sellerStats.completedOrders': completedOrders,
            'sellerStats.totalRevenue': revenue
        });

        res.json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                pendingOrders,
                completedOrders,
                totalRevenue: revenue,
                averageOrderValue: totalOrders > 0 ? revenue / totalOrders : 0
            },
            recentOrders,
            lowStockProducts,
            monthlyRevenue,
            storeStatus: req.user.sellerSettings?.isStorePublished || false
        });

    } catch (error) {
        console.error('Get seller dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET SELLER PRODUCTS ================= */
export const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const {
            page = 1,
            limit = 10,
            status,
            category,
            search,
            sort = '-createdAt',
            minPrice,
            maxPrice,
            inStock
        } = req.query;

        const query = { sellerId };

        // Apply filters
        if (status) query.status = status;
        if (category) query.categoryId = Number(category);
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'inventory.sku': { $regex: search, $options: 'i' } }
            ];
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (inStock === 'true') {
            query['inventory.isInStock'] = true;
        } else if (inStock === 'false') {
            query['inventory.isInStock'] = false;
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .select('-reviews -__v'),
            Product.countDocuments(query)
        ]);

        res.json({
            success: true,
            products,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get seller products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= CREATE PRODUCT ================= */
export const createProduct = async (req, res) => {
    try {
        const sellerId = req.user._id;

        // Generate numeric ID
        const lastProduct = await Product.findOne().sort({ numericId: -1 });
        const numericId = lastProduct ? lastProduct.numericId + 1 : 1000;

        // Check SKU uniqueness
        if (req.body.inventory?.sku) {
            const existingSku = await Product.findOne({
                'inventory.sku': req.body.inventory.sku
            });
            if (existingSku) {
                return res.status(400).json({
                    success: false,
                    message: 'SKU already exists'
                });
            }
        }

        const productData = {
            ...req.body,
            sellerId,
            numericId,
            storeName: req.user.sellerSettings?.storeName || req.user.businessName
        };

        const product = await Product.create(productData);

        // Update seller stats
        await User.findByIdAndUpdate(sellerId, {
            $inc: { 'sellerStats.totalProducts': 1 }
        });

        res.status(201).json({
            success: true,
            product,
            message: 'Product created successfully'
        });

    } catch (error) {
        console.error('Create product error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const sellerId = req.user._id;

        // Find product and verify ownership
        const product = await Product.findOne({
            numericId: Number(productId),
            sellerId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        // Check SKU uniqueness if updating
        if (req.body.inventory?.sku && req.body.inventory.sku !== product.inventory.sku) {
            const existingSku = await Product.findOne({
                'inventory.sku': req.body.inventory.sku
            });
            if (existingSku) {
                return res.status(400).json({
                    success: false,
                    message: 'SKU already exists'
                });
            }
        }

        // Update product
        Object.assign(product, req.body);
        await product.save();

        res.json({
            success: true,
            product,
            message: 'Product updated successfully'
        });

    } catch (error) {
        console.error('Update product error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const sellerId = req.user._id;

        // Find product and verify ownership
        const product = await Product.findOneAndDelete({
            numericId: Number(productId),
            sellerId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        // Update seller stats
        await User.findByIdAndUpdate(sellerId, {
            $inc: { 'sellerStats.totalProducts': -1 }
        });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= BULK UPDATE PRODUCT STATUS ================= */
export const bulkUpdateProducts = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { productIds, status } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product IDs are required'
            });
        }

        if (!['draft', 'published', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const result = await Product.updateMany(
            {
                numericId: { $in: productIds.map(id => Number(id)) },
                sellerId
            },
            { status }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} products updated`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Bulk update products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= UPDATE INVENTORY ================= */
export const updateInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const sellerId = req.user._id;
        const { stock, lowStockThreshold, manageStock, sku } = req.body;

        const product = await Product.findOne({
            numericId: Number(productId),
            sellerId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        // Update inventory fields
        if (stock !== undefined) {
            product.inventory.stock = Number(stock);
            product.inventory.isInStock = stock > 0;
            product.lastRestocked = new Date();
        }

        if (lowStockThreshold !== undefined) {
            product.inventory.lowStockThreshold = Number(lowStockThreshold);
        }

        if (manageStock !== undefined) {
            product.inventory.manageStock = manageStock;
        }

        if (sku && sku !== product.inventory.sku) {
            // Check SKU uniqueness
            const existingSku = await Product.findOne({
                'inventory.sku': sku,
                _id: { $ne: product._id }
            });
            if (existingSku) {
                return res.status(400).json({
                    success: false,
                    message: 'SKU already exists'
                });
            }
            product.inventory.sku = sku;
        }

        await product.save();

        res.json({
            success: true,
            product,
            message: 'Inventory updated successfully'
        });

    } catch (error) {
        console.error('Update inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= BULK UPDATE INVENTORY ================= */
export const bulkUpdateInventory = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Updates array is required'
            });
        }

        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: {
                    numericId: Number(update.productId),
                    sellerId
                },
                update: {
                    $set: {
                        'inventory.stock': update.stock,
                        'inventory.isInStock': update.stock > 0,
                        'lastRestocked': new Date()
                    }
                }
            }
        }));

        const result = await Product.bulkWrite(bulkOps);

        res.json({
            success: true,
            message: `${result.modifiedCount} products updated`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Bulk update inventory error:', error);
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
            limit = 10,
            status,
            dateFrom,
            dateTo,
            search
        } = req.query;

        const query = { 'items.sellerId': sellerId };

        // Apply filters
        if (status) {
            if (status === 'pending') {
                query['items.status'] = 'pending';
            } else {
                query.status = status;
            }
        }

        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
                { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('userId', 'name email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        // Filter items for this seller only
        const sellerOrders = orders.map(order => {
            const orderObj = order.toObject();
            orderObj.items = orderObj.items.filter(item =>
                item.sellerId.toString() === sellerId.toString()
            );
            return orderObj;
        });

        res.json({
            success: true,
            orders: sellerOrders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
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

/* ================= UPDATE ORDER STATUS ================= */
export const updateOrderStatus = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { orderId, itemId } = req.params;
        const { status, trackingNumber, carrier, cancellationReason } = req.body;

        // Validate status
        const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Find order and verify seller has this item
        const order = await Order.findOne({
            _id: orderId,
            'items.sellerId': sellerId,
            'items._id': itemId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order item not found or unauthorized'
            });
        }

        // Find the specific item
        const itemIndex = order.items.findIndex(item =>
            item._id.toString() === itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Order item not found'
            });
        }

        const item = order.items[itemIndex];

        // Update item status
        item.status = status;

        // If shipping, update tracking info
        if (status === 'shipped') {
            order.shipping.trackingNumber = trackingNumber || order.shipping.trackingNumber;
            order.shipping.carrier = carrier || order.shipping.carrier;
            order.shipping.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
        }

        // If cancelled, add reason
        if (status === 'cancelled') {
            item.cancellationReason = cancellationReason;

            // Release reserved stock
            const product = await Product.findById(item.productId);
            if (product) {
                await product.releaseStock(item.quantity);
                await product.save();
            }
        }

        // If delivered, update deliveredAt
        if (status === 'delivered') {
            order.shipping.deliveredAt = new Date();

            // Update product sold count and stock
            const product = await Product.findById(item.productId);
            if (product) {
                await product.updateStock(item.quantity);
                await product.save();
            }

            // Update seller stats
            await User.findByIdAndUpdate(sellerId, {
                $inc: {
                    'sellerStats.completedOrders': 1,
                    'sellerStats.totalRevenue': item.price * item.quantity
                }
            });
        }

        await order.save();

        res.json({
            success: true,
            order,
            message: `Order status updated to ${status}`
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET SELLER PAYOUTS ================= */
export const getSellerPayouts = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const {
            page = 1,
            limit = 10,
            status,
            dateFrom,
            dateTo
        } = req.query;

        const query = { sellerId };

        // Apply filters
        if (status) query.status = status;

        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const skip = (page - 1) * limit;

        const [payouts, total] = await Promise.all([
            Payout.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Payout.countDocuments(query)
        ]);

        res.json({
            success: true,
            payouts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get seller payouts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= REQUEST PAYOUT ================= */
export const requestPayout = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { amount, method, details } = req.body;

        // Validate minimum payout amount
        const MIN_PAYOUT_AMOUNT = 100;
        if (amount < MIN_PAYOUT_AMOUNT) {
            return res.status(400).json({
                success: false,
                message: `Minimum payout amount is ₹${MIN_PAYOUT_AMOUNT}`
            });
        }

        // Check available balance (simplified - in real app, calculate from completed orders)
        const seller = await User.findById(sellerId);
        const availableBalance = seller.sellerStats?.totalRevenue || 0;

        if (amount > availableBalance) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Create payout
        const payout = await Payout.create({
            sellerId,
            amount,
            method,
            details,
            status: 'pending',
            periodStart: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
            periodEnd: new Date()
        });

        res.status(201).json({
            success: true,
            payout,
            message: 'Payout requested successfully'
        });

    } catch (error) {
        console.error('Request payout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= UPDATE SELLER PROFILE ================= */
export const updateSellerProfile = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const updates = req.body;

        // Remove restricted fields
        delete updates.role;
        delete updates.password;
        delete updates.email;
        delete updates.isSellerVerified;

        // Handle file uploads for documents
        if (req.files) {
            if (req.files.panCard) {
                updates.verificationDocuments.panCard = req.files.panCard[0].path;
            }
            if (req.files.aadharCard) {
                updates.verificationDocuments.aadharCard = req.files.aadharCard[0].path;
            }
            if (req.files.gstCertificate) {
                updates.verificationDocuments.gstCertificate = req.files.gstCertificate[0].path;
            }
        }

        const seller = await User.findByIdAndUpdate(
            sellerId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            seller,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update seller profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET SELLER ANALYTICS ================= */
export const getSellerAnalytics = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { period = 'month' } = req.query;

        let startDate;
        const endDate = new Date();

        switch (period) {
            case 'week':
                startDate = new Date(endDate.setDate(endDate.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(endDate.setMonth(endDate.getMonth() - 1));
                break;
            case 'quarter':
                startDate = new Date(endDate.setMonth(endDate.getMonth() - 3));
                break;
            case 'year':
                startDate = new Date(endDate.setFullYear(endDate.getFullYear() - 1));
                break;
            default:
                startDate = new Date(endDate.setMonth(endDate.getMonth() - 1));
        }

        const [
            salesData,
            topProducts,
            orderStatusCount,
            categoryPerformance
        ] = await Promise.all([
            // Sales over time
            Order.aggregate([
                {
                    $match: {
                        'items.sellerId': sellerId,
                        status: 'delivered',
                        createdAt: { $gte: startDate, $lte: new Date() }
                    }
                },
                { $unwind: '$items' },
                { $match: { 'items.sellerId': sellerId } },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                        orders: { $addToSet: '$_id' },
                        itemsSold: { $sum: '$items.quantity' }
                    }
                },
                { $sort: { '_id': 1 } },
                {
                    $project: {
                        date: '$_id',
                        revenue: 1,
                        orderCount: { $size: '$orders' },
                        itemsSold: 1,
                        _id: 0
                    }
                }
            ]),

            // Top selling products
            Order.aggregate([
                {
                    $match: {
                        'items.sellerId': sellerId,
                        status: 'delivered',
                        createdAt: { $gte: startDate, $lte: new Date() }
                    }
                },
                { $unwind: '$items' },
                { $match: { 'items.sellerId': sellerId } },
                {
                    $group: {
                        _id: '$items.productId',
                        productName: { $first: '$items.name' },
                        totalSold: { $sum: '$items.quantity' },
                        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 10 }
            ]),

            // Order status counts
            Order.aggregate([
                {
                    $match: {
                        'items.sellerId': sellerId,
                        createdAt: { $gte: startDate, $lte: new Date() }
                    }
                },
                { $unwind: '$items' },
                { $match: { 'items.sellerId': sellerId } },
                {
                    $group: {
                        _id: '$items.status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Category performance
            Order.aggregate([
                {
                    $match: {
                        'items.sellerId': sellerId,
                        status: 'delivered',
                        createdAt: { $gte: startDate, $lte: new Date() }
                    }
                },
                { $unwind: '$items' },
                { $match: { 'items.sellerId': sellerId } },
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
                        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                        itemsSold: { $sum: '$items.quantity' },
                        orders: { $addToSet: '$_id' }
                    }
                },
                { $sort: { revenue: -1 } }
            ])
        ]);

        res.json({
            success: true,
            analytics: {
                period,
                startDate,
                endDate: new Date(),
                salesData,
                topProducts,
                orderStatusCount: orderStatusCount.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                categoryPerformance,
                summary: {
                    totalRevenue: salesData.reduce((sum, day) => sum + day.revenue, 0),
                    totalOrders: salesData.reduce((sum, day) => sum + day.orderCount, 0),
                    totalItems: salesData.reduce((sum, day) => sum + day.itemsSold, 0),
                    averageOrderValue: salesData.length > 0
                        ? salesData.reduce((sum, day) => sum + day.revenue, 0) /
                        salesData.reduce((sum, day) => sum + day.orderCount, 0)
                        : 0
                }
            }
        });

    } catch (error) {
        console.error('Get seller analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET SELLER SETTINGS ================= */
export const getSellerSettings = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const seller = await User.findById(sellerId)
            .select('sellerSettings paymentSettings verificationDocuments performance');

        res.json({
            success: true,
            settings: seller
        });

    } catch (error) {
        console.error('Get seller settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= UPDATE SELLER SETTINGS ================= */
export const updateSellerSettings = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { settings, type } = req.body;

        if (!settings || !type) {
            return res.status(400).json({
                success: false,
                message: 'Settings and type are required'
            });
        }

        let updateField;
        switch (type) {
            case 'store':
                updateField = 'sellerSettings';
                break;
            case 'payment':
                updateField = 'paymentSettings';
                break;
            case 'verification':
                updateField = 'verificationDocuments';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid settings type'
                });
        }

        const seller = await User.findByIdAndUpdate(
            sellerId,
            { $set: { [updateField]: settings } },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            seller,
            message: 'Settings updated successfully'
        });

    } catch (error) {
        console.error('Update seller settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= PUBLISH/UNPUBLISH STORE ================= */
export const toggleStorePublish = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { isPublished } = req.body;

        const seller = await User.findByIdAndUpdate(
            sellerId,
            { $set: { 'sellerSettings.isStorePublished': isPublished } },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            seller,
            message: `Store ${isPublished ? 'published' : 'unpublished'} successfully`
        });

    } catch (error) {
        console.error('Toggle store publish error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET LOW STOCK ALERTS ================= */
export const getLowStockAlerts = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const lowStockProducts = await Product.find({
            sellerId,
            'inventory.manageStock': true,
            'inventory.stock': { $lte: { $expr: '$inventory.lowStockThreshold' } }
        })
            .select('name inventory.stock inventory.lowStockThreshold inventory.sku images price')
            .sort({ 'inventory.stock': 1 })
            .limit(50);

        res.json({
            success: true,
            alerts: lowStockProducts,
            count: lowStockProducts.length
        });

    } catch (error) {
        console.error('Get low stock alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= EXPORT PRODUCTS ================= */
export const exportProducts = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { format = 'csv' } = req.query;

        const products = await Product.find({ sellerId })
            .select('-_id -__v -reviews')
            .lean();

        if (format === 'csv') {
            // Convert to CSV
            const headers = ['SKU', 'Name', 'Category', 'Price', 'Stock', 'Status'];
            const csvData = products.map(p => [
                p.inventory.sku,
                p.name,
                p.categoryId,
                p.price,
                p.inventory.stock,
                p.status
            ].join(','));

            const csv = [headers.join(','), ...csvData].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
            return res.send(csv);
        } else if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=products.json');
            return res.json(products);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid format. Use "csv" or "json"'
            });
        }

    } catch (error) {
        console.error('Export products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};