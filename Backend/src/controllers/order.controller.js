const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.models");

// POST /api/orders — buyer places an order
const placeOrder = async (req, res) => {
    try {
        const { productId, quantity, shippingAddress } = req.body;

        const product = await Product.findByIdAndUpdate(
            {
                _id: productId,
                status: "active",
                stock: { $gte: quantity },
            },
            {
                $inc: { stock: -quantity },
            },
            { new: true }
        )

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (product.status !== "active") {
            return res.status(400).json({ error: "This product is not available for purchase" });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ error: `Only ${product.stock} items available in stock` });
        }

        // Buyer can't buy their own product
        if (product.seller.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot buy your own product" });
        }

        const totalPrice = product.price.amount * quantity;

        const order = await Order.create({
            buyer: req.user._id,
            seller: product.seller,
            product: product._id,
            quantity,
            totalPrice,
            shippingAddress,
        });

        // Reduce stock
        product.stock -= quantity;
        if (product.stock === 0) {
            product.status = "sold";
        }
        await product.save();

        // Populate for response
        await order.populate("product", "title images price");
        await order.populate("seller", "fullName sellerProfile.shopName");

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        res.status(500).json({ error: "Error placing order", details: error.message });
    }
};

// GET /api/orders/my-orders — buyer's order history
const getMyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ buyer: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("product", "title images price category size condition")
            .populate("seller", "fullName sellerProfile.shopName")

        const totalOrders = await Order.countDocuments({ buyer: req.user._id });

        res.status(200).json({
            orders,
            page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching orders", details: error.message });
    }
};

// GET /api/orders/seller-orders — orders received by seller
const getSellerOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { seller: req.user._id };
        if (status) filter.status = status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("product", "title images price category size")
            .populate("buyer", "fullName email contactNumber");

        const totalOrders = await Order.countDocuments(filter);

        res.status(200).json({
            orders,
            page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching seller orders", details: error.message });
    }
};

// PATCH /api/orders/:id/status — seller updates order status
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Only seller can update status
        if (order.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized to update this order" });
        }

        const { status } = req.body;

        const allowedStatus = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        // Validate status transitions
        const validTransitions = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["shipped", "cancelled"],
            shipped: ["delivered"],
            delivered: [],
            cancelled: [],
        };

        if (!validTransitions[order.status].includes(status)) {
            return res.status(400).json({
                error: `Cannot change status from "${order.status}" to "${status}"`,
            });
        }

        order.status = status;

        // If delivered, mark payment as paid and credit seller wallet
        if (status === "delivered" && order.paymentStatus !== "paid") {
            order.paymentStatus = "paid";

            // Credit seller wallet (pending balance — T+2 settlement)
            const seller = await User.findById(order.seller);
            if (seller) {
                seller.wallet.pendingBalance += order.totalPrice;
                seller.wallet.totalEarned += order.totalPrice;
                await seller.save();
            }
        }

        // If cancelled, restore stock
        if (status === "cancelled") {
            const product = await Product.findById(order.product);
            if (product) {
                product.stock += order.quantity;
                if (product.status === "sold") product.status = "active";
                await product.save();
            }
        }

        await order.save();
        await order.populate("product", "title images price");

        res.status(200).json({ message: `Order status updated to "${status}"`, order });
    } catch (error) {
        res.status(500).json({ error: "Error updating order status", details: error.message });
    }
};

// GET /api/orders/:id — single order detail
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("product", "title images price category size condition")
            .populate("seller", "fullName sellerProfile.shopName")
            .populate("buyer", "fullName email");

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Only buyer or seller can view
        const userId = req.user._id.toString();
        if (order.buyer._id.toString() !== userId && order.seller._id.toString() !== userId) {
            return res.status(403).json({ error: "Not authorized to view this order" });
        }

        res.status(200).json({ order });
    } catch (error) {
        res.status(500).json({ error: "Error fetching order", details: error.message });
    }
};

module.exports = {
    placeOrder,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus,
    getOrderById,
};
