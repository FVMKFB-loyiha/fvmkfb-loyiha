import jwt from "jsonwebtoken";
import { userModel } from "../../model/core/index.js";
import getDotEnv from "../config/dotenv.config.js";

async function authGuard(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Kalit berilmagan!"); // Javobni to‘xtatib yuborish
  }
  try {
    const result = await jwt.verify(token, getDotEnv("JwT_SECRET"));
    req.user = await userModel.findOne({ where: { email: result.email } });

    if (!req.user) {
      return res.status(401).send("Ushbu tokeendagi foydalanuvchi topilmadi!");
    }

    next(); // Javob yuborilganidan keyin next() chaqiriladi
  } catch (err) {
    console.log("auth error => ", err);
    return res.status(401).send("So'rovga huquqingiz yetarli emas auth!"); // Javobni yuborish va funktsiyani to‘xtatish
  }
}

export default authGuard;
