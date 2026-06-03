const {Router}=require("express");
const { validateFunction } = require("../validator/auth.validator");
const {registerUser,loginUser,getMe,googleAuth,googleCallback}=require("../controllers/auth.controller");
const {isAuthenticated}=require("../middlewares/auth.middleware");

const router=Router();

router.post("/register",validateFunction,registerUser);
router.post("/login",loginUser);
router.get("/getMe",isAuthenticated,getMe);
router.get("/google",googleAuth);
router.get("/google/callback",googleCallback);

module.exports=router;