import joi from "joi";
export const userValidation = joi.object({
  name: joi.string().min(2).max(30).required(),
});
export const messageValidation = joi.object({
  to: joi.string().min(2).max(30).required(),
  text: joi.string().min(2).max(250).required(),
  type: joi.string().valid("message", "private_message").required(),
  from: joi.string().min(2).max(30).required(),
});
