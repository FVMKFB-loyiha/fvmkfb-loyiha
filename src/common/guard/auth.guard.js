import jwt from "jsonwebtoken";
import { userModel } from "../../model/core/index.js";
import getDotEnv from "../config/dotenv.config.js";

async function authGuard(req, res, next) {
  try {
    const token = req.body.token;

    if (!token) {
      return res.status(401).json({
        message: "Token taqdim etilmagan",
        code: "NO_TOKEN",
      });
    }

    const result = await jwt.verify(token, getDotEnv("JwT_SECRET"));

    if (!result || !result.email) {
      return res.status(401).json({
        message: "Yaroqsiz token",
        code: "INVALID_TOKEN",
      });
    }

    const user = await userModel.findOne({ where: { email: result.email } });

    if (!user) {
      return res.status(401).json({
        message: "Foydalanuvchi topilmadi",
        code: "USER_NOT_FOUND",
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Autentifikatsiya xatosi",
      code: "AUTH_ERROR",
    });
  }
}

export default authGuard;
