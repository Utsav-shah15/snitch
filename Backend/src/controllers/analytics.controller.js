const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.models");

// GET /api/analytics/overview — seller top stats
const getOverview = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const [totalOrders, deliveredOrders, activeListings, user] = await Promise.all([
            Order.countDocuments({ seller: sellerId }),
            Order.countDocuments({ seller: sellerId, status: "delivered" }),
            Product.countDocuments({ seller: sellerId, status: "active" }),
            User.findById(sellerId),
        ]);

        const revenueData = await Order.aggregate([
            { $match: { seller: sellerId, status: "delivered" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]);

        const totalRevenue = revenueData[0]?.total || 0;
        const conversionRate = totalOrders > 0
            ? ((deliveredOrders / totalOrders) * 100).toFixed(1)
            : 0;

        res.status(200).json({
            totalRevenue,
            totalOrders,
            deliveredOrders,
            activeListings,
            conversionRate: parseFloat(conversionRate),
            wallet: user.wallet,
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching analytics overview", details: error.message });
    }
};

// GET /api/analytics/revenue — monthly revenue chart data (last 6 months)
const getRevenueChart = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const data = await Order.aggregate([
            {
                $match: {
                    seller: sellerId,
                    status: "delivered",
                    createdAt: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    revenue: { $sum: "$totalPrice" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const chart = data.map((d) => ({
            month: months[d._id.month - 1],
            revenue: d.revenue,
            orders: d.orders,
        }));

        res.status(200).json({ chart });
    } catch (error) {
        res.status(500).json({ error: "Error fetching revenue chart", details: error.message });
    }
};

// GET /api/analytics/products — top selling products
const getTopProducts = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const data = await Order.aggregate([
            { $match: { seller: sellerId, status: "delivered" } },
            {
                $group: {
                    _id: "$product",
                    totalSold: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$totalPrice" },
                },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $project: {
                    _id: 0,
                    productId: "$product._id",
                    title: "$product.title",
                    image: { $arrayElemAt: ["$product.images.url", 0] },
                    price: "$product.price.amount",
                    totalSold: 1,
                    totalRevenue: 1,
                },
            },
        ]);

        res.status(200).json({ products: data });
    } catch (error) {
        res.status(500).json({ error: "Error fetching top products", details: error.message });
    }
};

// GET /api/analytics/categories — category-wise performance
const getCategoryStats = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const data = await Order.aggregate([
            { $match: { seller: sellerId, status: "delivered" } },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "productInfo",
                },
            },
            { $unwind: "$productInfo" },
            {
                $group: {
                    _id: "$productInfo.category",
                    totalRevenue: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 },
                },
            },
            { $sort: { totalRevenue: -1 } },
        ]);

        res.status(200).json({ categories: data });
    } catch (error) {
        res.status(500).json({ error: "Error fetching category stats", details: error.message });
    }
};

module.exports = { getOverview, getRevenueChart, getTopProducts, getCategoryStats };
