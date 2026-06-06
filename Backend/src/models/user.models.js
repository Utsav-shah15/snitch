const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        select: false,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    contactNumber: {
        type: String,
        required: function () {
            return !this.googleId;
        },
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    isSeller: {
        type: Boolean,
        default: false,
    },
    sellerProfile: {
        shopName: { type: String, default: "" },
        bio: { type: String, default: "" },
        avatar: { type: String, default: "" },
        joinedAt: { type: Date },
    },
    wallet: {
        totalEarned: { type: Number, default: 0 },
        pendingBalance: { type: Number, default: 0 },
        availableBalance: { type: Number, default: 0 },
    },
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.password || !this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;