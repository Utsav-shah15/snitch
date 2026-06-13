const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.models");
const Offer = require("../models/offer.model");
const { settlePendingBalance } = require("./wallet.controller");

// POST /api/orders — buyer places an order
const placeOrder = async (req, res) => {
    try {
        const { productId, quantity, shippingAddress, offerId } = req.body;

        const product = await Product.findById(productId);

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

        let totalPrice;
        let finalUnitPrice = product.price.amount;

        if (offerId) {
            const offer = await Offer.findById(offerId);
            if (!offer) {
                return res.status(404).json({ error: "Negotiated offer not found" });
            }
            if (offer.buyer.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: "This offer does not belong to you" });
            }
            if (offer.product.toString() !== productId) {
                return res.status(400).json({ error: "Offer does not match the product" });
            }
            if (offer.status !== "accepted" && offer.status !== "countered") {
                return res.status(400).json({ error: `Offer is not in an accepted/countered state (status: ${offer.status})` });
            }

            finalUnitPrice = offer.status === "countered" ? offer.counterPrice : offer.offeredPrice;
            totalPrice = finalUnitPrice * quantity;
        } else {
            totalPrice = product.price.amount * quantity;
        }

        // Reduce stock once and mark sold if zero
        product.stock -= quantity;
        if (product.stock === 0) {
            product.status = "sold";
        }
        await product.save();

        const order = await Order.create({
            buyer: req.user._id,
            seller: product.seller,
            product: product._id,
            quantity,
            totalPrice,
            shippingAddress,
        });

        // Delete the offer now that it has been purchased/resolved
        if (offerId) {
            const Offer = require("../models/offer.model");
            await Offer.findByIdAndDelete(offerId);
        }

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

            const product = await Product.findById(order.product);
            if (product && product.isReSnitched) {
                // Calculate royalty and seller shares
                const royaltyAmount = (order.totalPrice * (product.royaltyRate || 5)) / 100;
                const sellerShare = order.totalPrice - royaltyAmount;

                // 1. Pay original seller (royalty)
                const originalSeller = await User.findById(product.originalSeller);
                if (originalSeller) {
                    originalSeller.wallet.pendingBalance += royaltyAmount;
                    originalSeller.wallet.totalEarned += royaltyAmount;
                    await originalSeller.save();
                    await settlePendingBalance(product.originalSeller, royaltyAmount, order._id, "royalty");
                }

                // 2. Pay current seller (remaining sale share)
                const currentSeller = await User.findById(order.seller);
                if (currentSeller) {
                    currentSeller.wallet.pendingBalance += sellerShare;
                    currentSeller.wallet.totalEarned += sellerShare;
                    await currentSeller.save();
                    await settlePendingBalance(order.seller, sellerShare, order._id, "sale");
                }
            } else {
                // Normal product - full payout to seller
                const seller = await User.findById(order.seller);
                if (seller) {
                    seller.wallet.pendingBalance += order.totalPrice;
                    seller.wallet.totalEarned += order.totalPrice;
                    await seller.save();
                    await settlePendingBalance(order.seller, order.totalPrice, order._id, "sale");
                }
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

// POST /api/orders/:id/resnitch — buyer re-lists a delivered item
const reSnitch = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("product");

        if (!order) return res.status(404).json({ error: "Order not found" });

        // Only buyer of this order can re-snitch
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Can only re-snitch delivered orders
        if (order.status !== "delivered") {
            return res.status(400).json({ error: "You can only re-snitch delivered items" });
        }

        const { price, description } = req.body;
        if (!price || price <= 0) {
            return res.status(400).json({ error: "A valid resale price is required" });
        }

        const originalProduct = order.product;

        // Create a new listing re-snitched from original
        const newProduct = await Product.create({
            title: `[Re-Snitch] ${originalProduct.title}`,
            description: description || originalProduct.description,
            seller: req.user._id,
            price: { amount: price, currency: "INR" },
            images: originalProduct.images,
            category: originalProduct.category,
            size: originalProduct.size,
            condition: "Good", // Re-snitched items default to Good
            stock: 1,
            status: "active",
            isReSnitched: true,
            originalProduct: originalProduct._id,
            originalSeller: originalProduct.seller,
            royaltyRate: 5,
        });

        res.status(201).json({
            message: "Item re-snitched! Your listing is now live. Original seller will earn 5% royalty on sale.",
            product: newProduct,
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating re-snitch listing", details: error.message });
    }
};

module.exports = {
    placeOrder,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus,
    getOrderById,
    reSnitch,
};
