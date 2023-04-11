import joi from "joi";
export const userValidation = joi.object({
  name: joi.string().min(2).max(15).required(),
});
