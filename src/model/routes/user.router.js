import { Router } from "express";
import {
  deleteUser,
  getAllUser,
  getUser,
  loginUser,
  registerUser,
  searchUserController,
  updateUser,
} from "../core/user/user.service.js";
import { profilePicMiddleware } from "../../middlewares/rasmYuklash.js";

const userRouter = Router();

userRouter
  .get("/search", searchUserController)
  .get("/", getAllUser)
  .get("/:id", getUser)
  .post("/register", profilePicMiddleware, registerUser)
  .post("/login", loginUser)
  .patch("/:id", profilePicMiddleware, updateUser)
  .delete("/:id", deleteUser);

export default userRouter;
