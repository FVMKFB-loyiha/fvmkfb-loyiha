import Joi from "joi";

export const registerUserValidator = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  role: Joi.string(),
  phone: Joi.string().required().min(9),
  birth_date: Joi.string().required(),
  department: Joi.string().required(),
  position: Joi.string().required(),
});

export const loginUserValidator = Joi.object({
  email: Joi.string().required(),
  phone: Joi.string().min(12).required(),
});

export const getUserValidator = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9]+$/)
    .required(),
});

export const updateUserValidator = Joi.object({
  fullname: Joi.string(),
  email: Joi.string(),
  role: Joi.string(),
  tugilgan_sana: Joi.string(),
  bolim: Joi.string(),
  // file: Joi.string(),
  lavozim: Joi.string(),
  malumoti: Joi.string(),
  mutaxasisligi: Joi.string(),
  talim_muassasasi: Joi.string(),
  talim_davri: Joi.string(),
  phone: Joi.string(),
});
