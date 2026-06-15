const { Router } = require("express");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const {
    createRazorpayOrder,
    verifyPayment,
    getKey,
} = require("../controllers/payment.controller");

const router = Router();

// Get Razorpay public key
router.get("/key", isAuthenticated, getKey);

// Create Razorpay checkout order
router.post("/create-order", isAuthenticated, createRazorpayOrder);

// Verify payment and place order
router.post("/verify", isAuthenticated, verifyPayment);

module.exports = router;
