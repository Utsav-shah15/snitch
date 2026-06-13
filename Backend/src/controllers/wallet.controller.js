const User = require("../models/user.models");
const Transaction = require("../models/transaction.model");
const Order = require("../models/order.model");

// GET /api/wallet — get seller wallet info
const getWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("order", "totalPrice product status");

        res.status(200).json({
            wallet: user.wallet,
            transactions,
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching wallet", details: error.message });
    }
};

// GET /api/wallet/transactions — full transaction history with pagination
const getTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;
        const { type } = req.query;

        const filter = { user: req.user._id };
        if (type) filter.type = type;

        const transactions = await Transaction.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("order", "totalPrice status");

        const total = await Transaction.countDocuments(filter);

        res.status(200).json({
            transactions,
            page,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching transactions", details: error.message });
    }
};

// POST /api/wallet/withdraw — request a withdrawal
const requestWithdrawal = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid withdrawal amount" });
        }

        const user = await User.findById(req.user._id);

        if (user.wallet.availableBalance < amount) {
            return res.status(400).json({
                error: `Insufficient balance. Available: ₹${user.wallet.availableBalance}`,
            });
        }

        // Deduct from available balance
        user.wallet.availableBalance -= amount;
        await user.save();

        // Create transaction record
        await Transaction.create({
            user: req.user._id,
            type: "withdrawal",
            amount,
            status: "pending",
            description: `Withdrawal request of ₹${amount}`,
        });

        res.status(200).json({
            message: `Withdrawal of ₹${amount} requested. It will be processed within 3-5 business days.`,
            wallet: user.wallet,
        });
    } catch (error) {
        res.status(500).json({ error: "Error processing withdrawal", details: error.message });
    }
};

// POST /api/wallet/settle — (Internal use) settle pending → available after delivery
// Called automatically when order is delivered
const settlePendingBalance = async (userId, amount, orderId, type = "sale") => {
    const user = await User.findById(userId);
    if (!user) return;

    // Move from pending to available
    user.wallet.pendingBalance = Math.max(0, user.wallet.pendingBalance - amount);
    user.wallet.availableBalance += amount;
    await user.save();

    const description = type === "royalty"
        ? `Royalty received — ₹${amount} added to available balance`
        : `Sale completed — ₹${amount} added to available balance`;

    await Transaction.create({
        user: userId,
        type,
        amount,
        order: orderId,
        status: "completed",
        description,
    });
};

module.exports = {
    getWallet,
    getTransactions,
    requestWithdrawal,
    settlePendingBalance,
};
