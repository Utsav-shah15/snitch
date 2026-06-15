const Drop = require("../models/drop.model");
const Product = require("../models/product.model");
const { createNotification } = require("../services/notification.service");
const { broadcast } = require("../services/socket.service");

// POST /api/drops — seller creates a new drop
const createDrop = async (req, res) => {
    try {
        const { title, description, scheduledAt, products, coverImage } = req.body;

        if (!title || !scheduledAt || !products || products.length === 0) {
            return res.status(400).json({ message: "Title, scheduledAt, and at least one product are required" });
        }

        const scheduledDate = new Date(scheduledAt);
        if (scheduledDate <= new Date()) {
            return res.status(400).json({ message: "Scheduled time must be in the future" });
        }

        // Verify all products belong to this seller
        const productIds = products.map(p => p.product);
        const sellerProducts = await Product.find({
            _id: { $in: productIds },
            seller: req.user._id,
        });

        if (sellerProducts.length !== productIds.length) {
            return res.status(400).json({ message: "All products must belong to you" });
        }

        const drop = await Drop.create({
            title,
            description: description || "",
            scheduledAt: scheduledDate,
            products: products.map(p => ({
                product: p.product,
                quantity: p.quantity || 1,
                sold: 0,
            })),
            seller: req.user._id,
            coverImage: coverImage || "",
            status: "scheduled",
        });

        const populated = await Drop.findById(drop._id)
            .populate("products.product", "title images price category")
            .populate("seller", "fullName sellerProfile.shopName sellerProfile.avatar");

        res.status(201).json({ message: "Drop scheduled successfully", drop: populated });
    } catch (error) {
        res.status(500).json({ message: "Error creating drop", error: error.message });
    }
};

// GET /api/drops — all drops (upcoming + live first, ended last)
const getAllDrops = async (req, res) => {
    try {
        const drops = await Drop.find()
            .populate("products.product", "title images price category")
            .populate("seller", "fullName sellerProfile.shopName sellerProfile.avatar")
            .sort({ scheduledAt: 1 });

        // Auto-update statuses based on current time
        const now = new Date();
        for (const drop of drops) {
            if (drop.status === "scheduled" && now >= drop.scheduledAt) {
                drop.status = "live";
                await drop.save();
            }
        }

        res.status(200).json({ drops });
    } catch (error) {
        res.status(500).json({ message: "Error fetching drops", error: error.message });
    }
};

// GET /api/drops/:id — single drop detail
const getDropById = async (req, res) => {
    try {
        const drop = await Drop.findById(req.params.id)
            .populate("products.product", "title images price category size condition stock")
            .populate("seller", "fullName sellerProfile.shopName sellerProfile.avatar");

        if (!drop) {
            return res.status(404).json({ message: "Drop not found" });
        }

        // Auto-update status
        const now = new Date();
        if (drop.status === "scheduled" && now >= drop.scheduledAt) {
            drop.status = "live";
            await drop.save();
        }

        res.status(200).json({ drop });
    } catch (error) {
        res.status(500).json({ message: "Error fetching drop", error: error.message });
    }
};

// POST /api/drops/:id/notify — buyer registers for drop notification
const notifyMe = async (req, res) => {
    try {
        const drop = await Drop.findById(req.params.id);

        if (!drop) {
            return res.status(404).json({ message: "Drop not found" });
        }

        if (drop.status === "ended") {
            return res.status(400).json({ message: "This drop has already ended" });
        }

        const userId = req.user._id;
        if (drop.seller.toString() === userId.toString()) {
            return res.status(400).json({ message: "You cannot register for notifications on your own drop" });
        }

        const alreadyNotified = drop.notifiedBuyers.some(
            (id) => id.toString() === userId.toString()
        );

        if (alreadyNotified) {
            return res.status(400).json({ message: "You're already registered for this drop" });
        }

        drop.notifiedBuyers.push(userId);
        await drop.save();

        res.status(200).json({ message: "You'll be notified when this drop goes live!" });
    } catch (error) {
        res.status(500).json({ message: "Error registering for notification", error: error.message });
    }
};

// PATCH /api/drops/:id/status — seller updates drop status (go live / end)
const updateDropStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const drop = await Drop.findById(req.params.id);

        if (!drop) {
            return res.status(404).json({ message: "Drop not found" });
        }

        if (drop.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this drop" });
        }

        if (!["live", "ended"].includes(status)) {
            return res.status(400).json({ message: "Status must be 'live' or 'ended'" });
        }

        // Cannot go live if already ended
        if (drop.status === "ended") {
            return res.status(400).json({ message: "Cannot change status of an ended drop" });
        }

        drop.status = status;
        await drop.save();

        // If going live, notify all registered buyers
        if (status === "live") {
            // Broadcast to all connected clients
            broadcast("drop-live", { dropId: drop._id, title: drop.title });

            // Send individual notifications to registered buyers (excluding the seller)
            for (const buyerId of drop.notifiedBuyers) {
                if (buyerId.toString() === drop.seller.toString()) continue;
                await createNotification({
                    userId: buyerId,
                    type: "drop",
                    title: "🔥 Drop is LIVE!",
                    message: `"${drop.title}" is now live! Hurry, limited stock available.`,
                    data: { dropId: drop._id },
                });
            }
        }

        const populated = await Drop.findById(drop._id)
            .populate("products.product", "title images price category")
            .populate("seller", "fullName sellerProfile.shopName sellerProfile.avatar");

        res.status(200).json({ message: `Drop ${status === "live" ? "is now LIVE" : "has ended"}`, drop: populated });
    } catch (error) {
        res.status(500).json({ message: "Error updating drop status", error: error.message });
    }
};

// GET /api/drops/my-drops — seller's own drops
const getMyDrops = async (req, res) => {
    try {
        const drops = await Drop.find({ seller: req.user._id })
            .populate("products.product", "title images price category")
            .sort({ createdAt: -1 });

        res.status(200).json({ drops });
    } catch (error) {
        res.status(500).json({ message: "Error fetching your drops", error: error.message });
    }
};

module.exports = {
    createDrop,
    getAllDrops,
    getDropById,
    notifyMe,
    updateDropStatus,
    getMyDrops,
};
