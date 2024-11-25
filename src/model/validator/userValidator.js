import Joi from "joi";

export const registerUserValidator = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  role: Joi.string().required(),
  password: Joi.string().required().min(9),
  tugilgan_sana: Joi.string().required(),
  bolim: Joi.string().required(),
  // file: Joi.string(),
  lavozim: Joi.string().required(),
  malumoti: Joi.string().required(),
  mutaxasisligi: Joi.string().required(),
  talim_muassasasi: Joi.string().required(),
  talim_davri: Joi.string().required(),
  phone: Joi.string().required(),
});

export const loginUserValidator = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(9).required(),
});

export const getUserValidator = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9]+$/)
    .required(),
});

export const updateUserValidator = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  role: Joi.string().required(),
  password: Joi.string().required().min(9),
  tugilgan_sana: Joi.string().required(),
  bolim: Joi.string().required(),
  // file: Joi.string(),
  lavozim: Joi.string().required(),
  malumoti: Joi.string().required(),
  mutaxasisligi: Joi.string().required(),
  talim_muassasasi: Joi.string().required(),
  talim_davri: Joi.string().required(),
  phone: Joi.string().required(),
});
