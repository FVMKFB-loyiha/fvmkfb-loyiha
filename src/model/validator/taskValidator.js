import Joi from "joi";

export const addTaskValidator = Joi.object({
  title: Joi.string(),
  status: Joi.string(),
});

export const getTaskValidator = Joi.object({
    tasks_id: Joi.number()
  .integer()
  .positive()
  .required(),
});

export const updateTaskValidator = Joi.object({
    title: Joi.string(),
    status: Joi.string(),
});

