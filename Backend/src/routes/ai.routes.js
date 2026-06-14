const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth.middleware");
const {
    aiSearch,
    getOutfitSuggestions,
    generateDescription,
    suggestPrice,
    getTrends,
} = require("../controllers/ai.controller");

// Public routes
router.get("/search", aiSearch);
router.get("/outfit/:id", getOutfitSuggestions);

// Authenticated routes (seller features)
router.post("/generate-description", isAuthenticated, generateDescription);
router.post("/suggest-price", isAuthenticated, suggestPrice);
router.get("/trends", isAuthenticated, getTrends);

module.exports = router;
