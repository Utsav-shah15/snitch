const { Router } = require("express");
const multer = require("multer");

const { authenticateSeller, isAuthenticated } = require("../middlewares/auth.middleware");
const { validateProductFunction, validateProductUpdateFunction } = require("../validator/product.validator");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyListings,
} = require("../controllers/product.controller");

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

router.get("/", getAllProducts);                          
router.get("/my-listings", authenticateSeller, getMyListings);
router.get("/:id", getProductById);                     

router.post(
  "/create",
  authenticateSeller,
  upload.array("images", 7),
  validateProductFunction,
  createProduct
);                                                       

router.patch(
  "/:id",
  authenticateSeller,
  upload.array("images", 7),
  validateProductUpdateFunction,
  updateProduct
);                                                       

router.delete("/:id", authenticateSeller, deleteProduct);

// Multer error handler — catches file size / type violations cleanly
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    const messages = {
      LIMIT_FILE_SIZE: "Each image must be under 5 MB",
      LIMIT_FILE_COUNT: "You can upload a maximum of 7 images",
      LIMIT_UNEXPECTED_FILE: "Unexpected field name for file upload",
    };
    return res.status(400).json({ error: messages[err.code] || err.message });
  }
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;