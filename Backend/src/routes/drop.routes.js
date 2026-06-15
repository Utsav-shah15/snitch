const { Router } = require("express");
const { isAuthenticated, authenticateSeller } = require("../middlewares/auth.middleware");
const {
    createDrop,
    getAllDrops,
    getDropById,
    notifyMe,
    updateDropStatus,
    getMyDrops,
} = require("../controllers/drop.controller");

const router = Router();

// Public routes
router.get("/", getAllDrops);

// Buyer routes
router.post("/:id/notify", isAuthenticated, notifyMe);

// Seller routes
router.post("/", authenticateSeller, createDrop);
router.get("/my-drops", authenticateSeller, getMyDrops);
router.patch("/:id/status", authenticateSeller, updateDropStatus);

// Shared (must be last — catches /:id pattern)
router.get("/:id", getDropById);

module.exports = router;
