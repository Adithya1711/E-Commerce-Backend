const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const itemSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow(""),
  price: Joi.number().positive().required(),
  category_id: Joi.number().integer().positive().required(),
  image_url: Joi.string().uri().allow(""),
  stock: Joi.number().integer().min(0).default(0),
});

const cartItemSchema = Joi.object({
  item_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  itemSchema,
  cartItemSchema,
};
