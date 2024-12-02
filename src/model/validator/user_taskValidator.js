import Joi from "joi";

export const addUser_taskValidator = Joi.object({
  user_id: Joi.number()
  .integer()
  .positive()
  .required(),
  task_id: Joi.number()
  .integer()
  .positive()
  .required(),
});

export const getUser_taskValidator = Joi.object({
    id: Joi.number()
  .integer()
  .positive()
  .required(),
});

export const updateUser_taskValidator = Joi.object({
  user_id: Joi.number()
  .integer()
  .positive()
  .required(),
  task_id: Joi.number()
  .integer()
  .positive()
  .required(),
});
