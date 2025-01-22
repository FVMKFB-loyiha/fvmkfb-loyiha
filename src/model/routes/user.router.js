import { Router } from "express";
import {
  deleteUser,
  getAllUser,
  getUser,
  loginUser,
  registerUser,
  searchUserController,
  updateUser,
  userFamilyInfo,
} from "../core/user/user.service.js";
import { profilePicMiddleware } from "../../middlewares/rasmYuklash.js";
import authGuard from "../../common/guard/auth.guard.js";
import {
  addAttendance,
  getAttendance,
} from "../core/attendance/attendance.service.js";

const userRouter = Router();

userRouter
  .get("/search", searchUserController)
  .get("/", getAllUser)
  .get("/:id", getUser)
  .post("/register", profilePicMiddleware, registerUser)
  .post("/login", loginUser)
  .patch("/:id", profilePicMiddleware, updateUser)
  .delete("/:id", deleteUser)
  .post("/family", userFamilyInfo);

// .get("/attendance", getAttendance)
// .post('/attendance', addAttendance)
// .patch('/attendance/:attendanceId')

export default userRouter;
