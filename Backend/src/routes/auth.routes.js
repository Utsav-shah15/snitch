const { Router } = require("express");
const { validateFunction } = require("../validator/auth.validator");
const {
    registerUser,
    loginUser,
    getMe,
    logoutUser,
    becomeSeller,
    googleAuth,
    googleCallback,
} = require("../controllers/auth.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");

const router = Router();

router.post("/register", validateFunction, registerUser);
router.post("/login", loginUser);
router.get("/logout", isAuthenticated, logoutUser);
router.get("/getMe", isAuthenticated, getMe);
router.patch("/become-seller", isAuthenticated, becomeSeller);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

module.exports = router;