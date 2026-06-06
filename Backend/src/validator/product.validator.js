const Joi = require("joi");

// Validator for creating a product
const createProductSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100).required().messages({
        "string.empty": "Title is required",
        "string.min": "Title must be at least 3 characters",
        "string.max": "Title cannot exceed 100 characters",
        "any.required": "Title is required",
    }),
    description: Joi.string().trim().min(10).max(2000).required().messages({
        "string.empty": "Description is required",
        "string.min": "Description must be at least 10 characters",
        "string.max": "Description cannot exceed 2000 characters",
        "any.required": "Description is required",
    }),
    amount: Joi.number().positive().required().messages({
        "number.base": "Price must be a number",
        "number.positive": "Price must be greater than 0",
        "any.required": "Price is required",
    }),
    currency: Joi.string().valid("USD", "EUR", "GBP", "INR").default("INR"),
    category: Joi.string().valid("Tops", "Bottoms", "Footwear", "Accessories").required().messages({
        "any.only": "Category must be Tops, Bottoms, Footwear, or Accessories",
        "any.required": "Category is required",
    }),
    size: Joi.string().valid("XS", "S", "M", "L", "XL", "XXL", "Free Size").required().messages({
        "any.only": "Invalid size",
        "any.required": "Size is required",
    }),
    condition: Joi.string().valid("New", "Like New", "Good", "Fair").required().messages({
        "any.only": "Condition must be New, Like New, Good, or Fair",
        "any.required": "Condition is required",
    }),
    stock: Joi.number().integer().min(1).default(1),
});

// Validator for updating a product (all fields optional)
const updateProductSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100),
    description: Joi.string().trim().min(10).max(2000),
    amount: Joi.number().positive(),
    currency: Joi.string().valid("USD", "EUR", "GBP", "INR"),
    category: Joi.string().valid("Tops", "Bottoms", "Footwear", "Accessories"),
    size: Joi.string().valid("XS", "S", "M", "L", "XL", "XXL", "Free Size"),
    condition: Joi.string().valid("New", "Like New", "Good", "Fair"),
    stock: Joi.number().integer().min(0),
    status: Joi.string().valid("active", "draft", "sold"),
});

function validateProductFunction(req, res, next) {
    const { error } = createProductSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "At least one image is required" });
    }
    next();
}

function validateProductUpdateFunction(req, res, next) {
    const { error } = updateProductSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

module.exports = { validateProductFunction, validateProductUpdateFunction };