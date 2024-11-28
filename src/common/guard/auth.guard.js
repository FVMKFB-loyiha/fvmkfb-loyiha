import jwt from "jsonwebtoken";
import getDotEnv from "../config/dotenv.config.js";
import chalk from "chalk";

async function tokenChecker(req, res, next) {
  try {
    const token = req.headers["token"] || req.headers["authorization"]?.split(" ")[1];
    console.log(chalk.blue(token));
    if (!token) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "No authentication token provided",
        code: "NO_TOKEN"
      });
    }

    const result = await jwt.verify(token, getDotEnv("JwT_SECRET"));
    console.log(chalk.bgRed(result));
    
    if (!result) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid authentication token",
        code: "INVALID_TOKEN"
      });
    }

    next();
  } catch (err) {
    console.error(chalk.strikethrough.red("Authentication error:", {
      error: err.message,
      stack: err.stack,
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    }));

    return res.status(500).json({
      error: "Server error",
      message: "An internal error occurred during authentication",
      code: "AUTH_ERROR"
    });
  }
}

export default tokenChecker;
