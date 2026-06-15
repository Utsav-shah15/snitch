const mongoose = require("mongoose");

const dropSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
    },
    scheduledAt: {
        type: Date,
        required: true,
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        sold: {
            type: Number,
            default: 0,
        },
    }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["scheduled", "live", "ended"],
        default: "scheduled",
    },
    notifiedBuyers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    coverImage: {
        type: String,
        default: "",
    },
}, { timestamps: true });

const Drop = mongoose.model("Drop", dropSchema);
module.exports = Drop;
