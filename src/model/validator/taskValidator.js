import Joi from "joi";

export const addTaskValidator = Joi.object({
  title: Joi.string().required(),
  status: Joi.string().required(),
});

export const getTaskValidator = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9]+$/)
    .required(),
});

export const updateTaskValidator = Joi.object({
    title: Joi.string(),
    status: Joi.string(),
});

