const Product = require("../models/product.model");
const uploadFile = require("../services/storage.service");

// POST /api/products/create
const createProduct = async (req, res) => {
    try {
        const { title, description, amount, currency, category, size, condition, stock } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        // Upload all images to ImageKit
        const images = await Promise.all(
            req.files.map(async (file) => {
                const uploaded = await uploadFile({
                    buffer: file.buffer,
                    filename: file.originalname,
                });
                return { url: uploaded.url };
            })
        );

        const product = await Product.create({
            title,
            description,
            price: {
                amount: Number(amount),
                currency: currency || "INR",
            },
            images,
            category,
            size,
            condition,
            stock: Number(stock) || 1,
            seller: req.user._id,
        });

        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
};

// GET /api/products — all active products with optional filters
const getAllProducts = async (req, res) => {
    try {
        const { category, size, condition, minPrice, maxPrice, search, sort } = req.query;
        const page= parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = { status: "active", stock: { $gt: 0 } };

        if (category) filter.category = category;
        if (size) filter.size = size;
        if (condition) filter.condition = condition;
        if (minPrice || maxPrice) {
            filter["price.amount"] = {};
            if (minPrice) filter["price.amount"].$gte = Number(minPrice);
            if (maxPrice) filter["price.amount"].$lte = Number(maxPrice);
        }
        if (search) {
            const cleanSearch = search.trim().toLowerCase();
            if (cleanSearch === "tops" || cleanSearch === "top") {
                filter.category = "Tops";
            } else if (cleanSearch === "bottoms" || cleanSearch === "bottom") {
                filter.category = "Bottoms";
            } else if (cleanSearch === "footwear" || cleanSearch === "shoes" || cleanSearch === "shoe") {
                filter.category = "Footwear";
            } else if (cleanSearch === "accessories" || cleanSearch === "accessory") {
                filter.category = "Accessories";
            } else {
                // Split query into keywords to allow matching multiple terms in any order (e.g. "black shirt" matches "Black Boxy Linen Casual Shirt")
                const keywords = search.split(/\s+/).filter(w => w.trim().length > 0);
                if (keywords.length > 0) {
                    filter.$and = keywords.map(keyword => ({
                        $or: [
                            { title: { $regex: keyword, $options: "i" } },
                            { description: { $regex: keyword, $options: "i" } }
                        ]
                    }));
                }
            }
        }

        let sortOption = { createdAt: -1 }; // default: newest first
        if (sort === "price_asc") sortOption = { "price.amount": 1 };
        if (sort === "price_desc") sortOption = { "price.amount": -1 };

        const products = await Product.find(filter)
            .sort(sortOption)
            .populate("seller", "fullName sellerProfile.shopName sellerProfile.avatar")
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({ 
            products,
            page,
            totalPages,
            totalProducts
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};

// GET /api/products/:id — single product detail
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("seller", "fullName sellerProfile email");

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
};

// GET /api/products/my-listings — seller's own listings
const getMyListings = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { seller: req.user._id };
        if (status) filter.status = status;

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: "Error fetching listings", error: error.message });
    }
};

// PATCH /api/products/:id — update a product (seller only)
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Ensure seller owns this product
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this product" });
        }

        const { title, description, amount, currency, category, size, condition, stock, status } = req.body;

        if (title) product.title = title;
        if (description) product.description = description;
        if (amount) product.price.amount = Number(amount);
        if (currency) product.price.currency = currency;
        if (category) product.category = category;
        if (size) product.size = size;
        if (condition) product.condition = condition;
        if (stock !== undefined) product.stock = Number(stock);
        if (status) product.status = status;

        // If new images uploaded, replace old ones
        if (req.files && req.files.length > 0) {
            const images = await Promise.all(
                req.files.map(async (file) => {
                    const uploaded = await uploadFile({
                        buffer: file.buffer,
                        filename: file.originalname,
                    });
                    return { url: uploaded.url };
                })
            );
            product.images = images;
        }

        await product.save();
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
};

// DELETE /api/products/:id — delete a product (seller only)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this product" });
        }

        await product.deleteOne();
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    getMyListings,
    updateProduct,
    deleteProduct,
};