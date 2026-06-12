const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    offeredPrice: {
        type: Number,
        required: true,
    },
    counterPrice: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "countered", "declined"],
        default: "pending",
    },
    message: {
        type: String,
        default: "",
    },
}, { timestamps: true });

const Offer = mongoose.model("Offer", offerSchema);
module.exports = Offer;
