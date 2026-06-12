const Joi = require("joi");

const registerSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Full name is required",
      "string.min": "Full name must be at least 3 characters",
      "string.max": "Full name cannot exceed 50 characters",
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required",
    }),

  contactNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Contact number must be exactly 10 digits",
      "string.empty": "Contact number is required",
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain uppercase, lowercase and a number",
      "string.empty": "Password is required",
    }),

  isSeller: Joi.boolean().default(false),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required",
    }),

  password: Joi.string()
    .required()
    .messages({
      "string.empty": "Password is required",
    }),
});

function validateRegister(req, res, next) {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

function validateLogin(req, res, next) {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
};