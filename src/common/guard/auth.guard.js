import jwt from "jsonwebtoken";
import { userModel } from "../../model/core/index.js";
import getDotEnv from "../config/dotenv.config.js";

async function authGuard(req, res, next) {
  try {
    // Tokenni har xil manbalardan qidiramiz
    const token = 
      req.headers.authorization?.split(" ")[1] || // Authorization header (Bearer token)
      req.query.token ||                          // Query string (e.g., ?token=...)
      req.body.token;                             // Bodyda yuborilgan token


    if (!token) {
      return res.status(401).json({
        message: "Token taqdim etilmagan",
        code: "NO_TOKEN",
      });
    }

    // Tokenni tekshirish
    const result = await jwt.verify(token, getDotEnv("JwT_SECRET"));

    if (!result || !result.email) {
      return res.status(401).json({
        message: "Yaroqsiz token",
        code: "INVALID_TOKEN",
      });
    }

    // Foydalanuvchini bazadan qidirish
    const user = await userModel.findOne({ where: { email: result.email } });

    if (!user) {
      return res.status(401).json({
        message: "Foydalanuvchi topilmadi",
        code: "USER_NOT_FOUND",
      });
    }

    // Foydalanuvchini request obyektiga qo'shish
    req.user = user;
    req.token = token;
    console.log("jsonwebtoken: ", req.user)
    console.log("jsonwebtoken: ", req.body)
    next(); // Keyingi middleware yoki handlerga o'tish
  } catch (err) {
    console.log("Autentifikatsiya xatosi: ", err.message);
    return res.status(401).json({
      message: "Autentifikatsiya xatosi",
      code: "AUTH_ERROR",
    });
  }
}

export default authGuard;





// import jwt from "jsonwebtoken";
// import { userModel } from "../../model/core/index.js";
// import getDotEnv from "../config/dotenv.config.js";

// async function authGuard(req, res, next) {
//   try {
//     const token = req.body.token;

//     console.log("token=> ", token)

//     if (!token) {
//       return res.status(401).json({
//         message: "Token taqdim etilmagan",
//         code: "NO_TOKEN",
//       });
//     }

//     const result = await jwt.verify(token, getDotEnv("JwT_SECRET"));

//     if (!result || !result.email) {
//       return res.status(401).json({
//         message: "Yaroqsiz token",
//         code: "INVALID_TOKEN",
//       });
//     }

//     const user = await userModel.findOne({ where: { email: result.email } });

//     if (!user) {
//       return res.status(401).json({
//         message: "Foydalanuvchi topilmadi",
//         code: "USER_NOT_FOUND",
//       });
//     }

//     req.user = user;
//     req.token = token;
//     next();
//   } catch (err) {
//     return res.status(401).json({
//       message: "Autentifikatsiya xatosi",
//       code: "AUTH_ERROR",
//     });
//   }
// }

// export default authGuard;
