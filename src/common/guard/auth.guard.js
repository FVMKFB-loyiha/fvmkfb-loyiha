import jwt from "jsonwebtoken";
import getConfig from "../common/config/config.service.js";
import userModel from "../../model/core/users/user.model.js";

async function authGuard(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).send("Kalit berilmagan!");
  }
  try {
    const result = await jwt.verify(token, getConfig("JWT_SECRET"));
    req.user = await userModel.findOne({ where: { email: result.email } });

    if (!req.user) {
      return res.status(401).send("Ushbu tokeendagi foydalanuvchi topilmadi!"); 
    }
    // console.log("auth error => ", result)

    next();
  } catch (err) {
    console.log("auth error => ", err)
    res.status(401).send("So'rovga huquqingiz yetarli emas auth!");
  }
}

export default authGuard;
