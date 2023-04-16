import joi from "joi";
export const userValidation = joi.object({
  name: joi.string().min(1).required(),
});
export const messageValidation = joi.object({
  to: joi.string().min(1).required(),
  text: joi.string().min(1).max(250).required(),
  type: joi.string().valid("message", "private_message").required(),
  from: joi.string().min(1).required(),
});
export const numberValidation = joi.object({
  limit: joi.number().integer().min(1).required(),
});
