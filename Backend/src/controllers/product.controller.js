const Product = require('../models/product.model');
const uploadFile = require("../services/storage.service");

const createProduct = async (req, res) => {
    try {
        const { title, description, amount, currency } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        const images = await Promise.all(
            req.files.map(async (file) => {
                const uploaded = await uploadFile({
                    buffer: file.buffer,
                    filename: file.originalname
                });
                return { url: uploaded.url };
            })
        );

        const product = await Product.create({
            title,
            description,
            price: {
                amount,
                currency: currency || "INR",
            },
            images,
            seller: req.user.id
        });

        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error: error.message || error });
    }
}

module.exports = {
    createProduct
}