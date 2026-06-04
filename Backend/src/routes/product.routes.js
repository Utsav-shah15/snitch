const {Router} = require('express');
const {authenticateSeller} = require('../middlewares/auth.middleware');
const {createProduct} = require("../controllers/product.controller");
const router = Router();
const multer=require("multer");
const {validateProductFunction}=require("../validator/product.validator")

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits:{
        fileSize:5*1024*1024
    }
});

router.post('/create',authenticateSeller,upload.array('images',7),validateProductFunction,createProduct);
module.exports = router;