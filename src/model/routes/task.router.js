import { Router } from "express";

import {
  addTask,
  deleteTask,
  getAllTask,
  getTask,
  handleTaskCompletion,
  handleXodimDecision,
  updateTask,
} from "../core/task/task.service.js";
import { fileDownloadMiddleware } from "../../middlewares/userTask.multer.js";
import authGuard from "../../common/guard/auth.guard.js";

const taskRouter = Router();

taskRouter
  .get("/", authGuard, getAllTask)
  .get("/:id", getTask)
  .post("/", authGuard, fileDownloadMiddleware, addTask)
  .post("/status", authGuard, handleXodimDecision)
  .post("/complete", authGuard, fileDownloadMiddleware, handleTaskCompletion)
  .put("/:id", authGuard, fileDownloadMiddleware, updateTask)
  .delete("/:id", authGuard, deleteTask);

export default taskRouter;
