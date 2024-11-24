import { Router } from "express";
import {
  addUserTask,
  deleteUserTask,
  getAllUserTask,
  getUserTask,
  updateUserTask,
} from "../core/user_task/user_task.service.js";

const userTaskRouter = Router();

userTaskRouter
  .get("/", getAllUserTask)
  .get("/:id", getUserTask)
  .post("/", addUserTask)
  .put("/:id", updateUserTask)
  .delete("/:id", deleteUserTask);

export default userTaskRouter;
