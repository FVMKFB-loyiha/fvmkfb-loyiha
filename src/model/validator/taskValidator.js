import Joi from "joi";

export const addTaskValidator = Joi.object({
  name: Joi.string().required(),
  status: Joi.string(),
});

export const getTaskValidator = Joi.object({
    tasks_id: Joi.number()
  .integer()
  .positive()
  .required(),
});

export const updateTaskValidator = Joi.object({
    name: Joi.string().required(),
    status: Joi.string(),
});

