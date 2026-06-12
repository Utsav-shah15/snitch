const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    price: {
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            enum: ["USD", "EUR", "GBP", "INR"],
            default: "INR",
        },
    },
    images: [
        {
            url: {
                type: String,
                required: true,
            },
        },
    ],
    category: {
        type: String,
        enum: ["Tops", "Bottoms", "Footwear", "Accessories"],
        required: true,
    },
    size: {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
        required: true,
    },
    condition: {
        type: String,
        enum: ["New", "Like New", "Good", "Fair"],
        required: true,
    },
    stock: {
        type: Number,
        default: 1,
        min: 0,
    },
    status: {
        type: String,
        enum: ["active", "draft", "sold"],
        default: "active",
    },
    isReSnitched: {
        type: Boolean,
        default: false,
    },
    originalProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    originalSeller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    royaltyRate: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
