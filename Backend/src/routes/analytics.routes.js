const { Router } = require("express");
const { isAuthenticated, authenticateSeller } = require("../middlewares/auth.middleware");
const { getOverview, getRevenueChart, getTopProducts, getCategoryStats } = require("../controllers/analytics.controller");

const router = Router();

router.get("/overview", isAuthenticated, authenticateSeller, getOverview);
router.get("/revenue", isAuthenticated, authenticateSeller, getRevenueChart);
router.get("/products", isAuthenticated, authenticateSeller, getTopProducts);
router.get("/categories", isAuthenticated, authenticateSeller, getCategoryStats);

module.exports = router;
