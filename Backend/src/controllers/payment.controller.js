const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Offer = require("../models/offer.model");
const Drop = require("../models/drop.model");
const { createNotification } = require("../services/notification.service");

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order and returns the order ID + key for frontend checkout popup.
 * Does NOT create a DB order yet — that happens after payment verification.
 */
const createRazorpayOrder = async (req, res) => {
    try {
        const { productId, quantity, offerId } = req.body;

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

        if (product.seller.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot buy your own product" });
        }

        // Drop Rule: Each buyer can only purchase 1 product per drop release
        const drop = await Drop.findOne({ "products.product": productId });
        if (drop) {
            const dropProductIds = drop.products.map(p => p.product.toString());
            const existingDropOrder = await Order.findOne({
                buyer: req.user._id,
                product: { $in: dropProductIds },
                status: { $ne: "cancelled" }
            });
            if (existingDropOrder) {
                return res.status(400).json({ error: "You have already purchased from this drop. Each buyer can only buy 1 product per release." });
            }
        }

        // Calculate price (offer-based or listed price)
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
                return res.status(400).json({ error: `Offer is not in an accepted/countered state` });
            }
            finalUnitPrice = offer.status === "countered" ? offer.counterPrice : offer.offeredPrice;
        }

        const totalPrice = finalUnitPrice * quantity;

        // Create Razorpay order (amount in paise = INR * 100)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalPrice * 100),
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${req.user._id.toString().slice(-6)}`,
            notes: {
                productId,
                quantity: quantity.toString(),
                buyerId: req.user._id.toString(),
                offerId: offerId || "",
            },
        });

        res.status(200).json({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            productTitle: product.title,
        });
    } catch (error) {
        console.error("Razorpay create order error:", error);
        res.status(500).json({ error: "Failed to create payment order", details: error.message });
    }
};

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature and creates the actual DB order.
 */
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            productId,
            quantity,
            shippingAddress,
            offerId,
        } = req.body;

        // Step 1: Verify signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Payment verification failed. Invalid signature." });
        }

        // Step 2: Validate product and create order (same logic as placeOrder)
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (product.status !== "active") {
            return res.status(400).json({ error: "This product is no longer available" });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ error: `Only ${product.stock} items available in stock` });
        }

        // Drop Rule: Each buyer can only purchase 1 product per drop release
        const drop = await Drop.findOne({ "products.product": productId });
        if (drop) {
            const dropProductIds = drop.products.map(p => p.product.toString());
            const existingDropOrder = await Order.findOne({
                buyer: req.user._id,
                product: { $in: dropProductIds },
                status: { $ne: "cancelled" }
            });
            if (existingDropOrder) {
                return res.status(400).json({ error: "You have already purchased from this drop. Each buyer can only buy 1 product per release." });
            }
        }

        // Calculate final price
        let totalPrice;
        let finalUnitPrice = product.price.amount;

        if (offerId) {
            const offer = await Offer.findById(offerId);
            if (offer) {
                finalUnitPrice = offer.status === "countered" ? offer.counterPrice : offer.offeredPrice;
            }
            totalPrice = finalUnitPrice * quantity;
        } else {
            totalPrice = product.price.amount * quantity;
        }

        // Reduce stock
        product.stock -= quantity;
        if (product.stock === 0) {
            product.status = "sold";
        }
        await product.save();

        // Create order with payment details
        const order = await Order.create({
            buyer: req.user._id,
            seller: product.seller,
            product: product._id,
            quantity,
            totalPrice,
            shippingAddress,
            paymentStatus: "paid",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
        });

        // Delete the offer if it was an offer-based purchase
        if (offerId) {
            await Offer.findByIdAndDelete(offerId);
        }

        // Send notification to seller
        await createNotification({
            userId: product.seller,
            type: "order",
            title: "📦 New Order Received!",
            message: `You have a new order for "${product.title}" (Qty: ${quantity}). Payment confirmed via Razorpay.`,
            data: { orderId: order._id.toString(), role: "seller" },
        });

        // Populate for response
        await order.populate("product", "title images price");
        await order.populate("seller", "fullName sellerProfile.shopName");

        res.status(201).json({ message: "Payment verified & order placed successfully!", order });
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ error: "Payment verification failed", details: error.message });
    }
};

/**
 * GET /api/payment/key
 * Returns the Razorpay key ID (safe to expose to frontend).
 */
const getKey = async (req, res) => {
    res.status(200).json({ keyId: process.env.RAZORPAY_KEY_ID });
};

module.exports = {
    createRazorpayOrder,
    verifyPayment,
    getKey,
};
