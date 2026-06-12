const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["sale", "withdrawal"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    },
    description: {
        type: String,
    },
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
