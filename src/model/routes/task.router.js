import { Router } from "express";

import {
  addTask,
  deleteTask,
  getAllTask,
  getTask,
  updateTask,
} from "../core/task/task.service.js";
import { fileDownloadMiddleware } from "../../common/utils/multer.config.js";

const taskRouter = Router();

taskRouter
  .get("/", getAllTask)
  .get("/:id", getTask)
  .post("/", fileDownloadMiddleware, addTask)
  .put("/:id", updateTask)
  .delete("/:id", deleteTask);

export default taskRouter;
