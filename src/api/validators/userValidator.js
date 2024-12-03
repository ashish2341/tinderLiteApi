const Joi = require("joi");

const addUserSchema = Joi.object({
  full_name: Joi.string().required().error(new Error("Full Name is required")),
  user_name: Joi.string().required().error(new Error("User Name is required")),
  email: Joi.string().email().optional().allow(""),
  phone: Joi.string()
    .required()
    .pattern(/^[0-9]{10}$/)
    .length(10)
    .error(new Error("Phone Number is required")),
  gender: Joi.string().allow(""),
  dob: Joi.string().allow(""),
});

const loginSchema = Joi.object().keys({
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .error(new Error("Phone number is required and should be 10 digits")),
});

module.exports = { addUserSchema, loginSchema };
