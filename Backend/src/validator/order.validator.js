const Joi = require("joi");

const placeOrderSchema = Joi.object({
    productId: Joi.string().required().messages({
        "any.required": "Product ID is required",
        "string.empty": "Product ID is required",
    }),
    quantity: Joi.number().integer().min(1).default(1).messages({
        "number.base": "Quantity must be a number",
        "number.min": "Quantity must be at least 1",
    }),
    shippingAddress: Joi.object({
        street: Joi.string().trim().required().messages({
            "any.required": "Street address is required",
            "string.empty": "Street address is required",
        }),
        city: Joi.string().trim().required().messages({
            "any.required": "City is required",
            "string.empty": "City is required",
        }),
        state: Joi.string().trim().required().messages({
            "any.required": "State is required",
            "string.empty": "State is required",
        }),
        pincode: Joi.string().trim().required().messages({
            "any.required": "Pincode is required",
            "string.empty": "Pincode is required",
        }),
    }).required().messages({
        "any.required": "Shipping address is required",
    }),
});

const updateStatusSchema = Joi.object({
    status: Joi.string()
        .valid("confirmed", "shipped", "delivered", "cancelled")
        .required()
        .messages({
            "any.only": "Status must be confirmed, shipped, delivered, or cancelled",
            "any.required": "Status is required",
        }),
});

function validatePlaceOrder(req, res, next) {
    const { error } = placeOrderSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

function validateUpdateStatus(req, res, next) {
    const { error } = updateStatusSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

module.exports = { validatePlaceOrder, validateUpdateStatus };
