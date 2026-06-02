const {Router}=require("express");
const { validateFunction } = require("../validator/auth.validator");
const {registerUser}=require("../controllers/auth.controller");

const router=Router();

router.post("/register",validateFunction,registerUser);

module.exports=router;