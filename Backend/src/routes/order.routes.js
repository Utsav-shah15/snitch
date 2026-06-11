const { Router } = require("express");
const { isAuthenticated, authenticateSeller } = require("../middlewares/auth.middleware");
const { validatePlaceOrder, validateUpdateStatus } = require("../validator/order.validator");
const {
    placeOrder,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus,
    getOrderById,
    reSnitch,
} = require("../controllers/order.controller");

const router = Router();

// Buyer routes
router.post("/", isAuthenticated, validatePlaceOrder, placeOrder);
router.get("/my-orders", isAuthenticated, getMyOrders);
router.post("/:id/resnitch", isAuthenticated, reSnitch);

// Seller routes
router.get("/seller-orders", authenticateSeller, getSellerOrders);
router.patch("/:id/status", authenticateSeller, validateUpdateStatus, updateOrderStatus);

// Shared route (buyer or seller)
router.get("/:id", isAuthenticated, getOrderById);

module.exports = router;