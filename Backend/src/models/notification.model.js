const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["order", "drop", "offer", "royalty", "stock", "system"],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    data: {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        dropId: { type: mongoose.Schema.Types.ObjectId, ref: "Drop" },
        offerId: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Index for fast querying user notifications sorted by newest
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
