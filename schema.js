const Joi = require("joi");
module.exports.consumerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  name: Joi.string().required(),
  homeName: Joi.string().required(),
  email: Joi.string().required(),
  age: Joi.number().required().min(0),
  town: Joi.string().required(),
  country: Joi.string().required(),
  permanantAddress: Joi.string().required(),
  Division: Joi.string().required(),
});
