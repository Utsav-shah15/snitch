const Joi = require("joi");

const validateProduct = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 3 characters",
      "string.max": "Title cannot exceed 100 characters",
      "any.required": "Title is required",
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      "string.empty": "Description is required",
      "string.min": "Description must be at least 10 characters",
      "string.max": "Description cannot exceed 2000 characters",
      "any.required": "Description is required",
    }),

  amount: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Price amount must be a number",
      "number.positive": "Price amount must be greater than 0",
      "any.required": "Price amount is required",
    }),

  currency: Joi.string()
    .valid("USD", "EUR", "GBP", "INR")
    .default("INR")
    .messages({
      "any.only": "Currency must be USD, EUR, GBP, or INR",
    }),
});

function validateProductFunction(req, res, next) {
  const { error } = validateProduct.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      error: "At least one image is required",
    });
  }

  if (req.files.length > 7) {
    return res.status(400).json({
      error: "You can upload a maximum of 7 images",
    });
  }

  next();
}

module.exports = {
  validateProductFunction,
};