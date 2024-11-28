import jwt from "jsonwebtoken";
import { userModel } from "../../model/core/index.js";
import getDotEnv from "../config/dotenv.config.js";

async function authGuard(req, res, next) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    
    if (!token) {
      console.warn("Authentication failed: No token provided", {
        ip: req.ip,
        path: req.path,
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({
        error: "Authentication failed",
        message: "No authentication token provided",
        code: "NO_TOKEN"
      });
    }

    const result = await jwt.verify(token, getDotEnv("JwT_SECRET"));
    
    if (!result || !result.email) {
      console.warn("Authentication failed: Invalid token", {
        ip: req.ip,
        path: req.path,
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid authentication token",
        code: "INVALID_TOKEN"
      });
    }

    const user = await userModel.findOne({ where: { email: result.email } });

    if (!user) {
      console.warn("Authentication failed: User not found", {
        ip: req.ip,
        path: req.path,
        email: result.email,
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({
        error: "Authentication failed",
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Add user info to request
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    console.error("Authentication error:", {
      error: err.message,
      stack: err.stack,
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    });

    // Handle different types of JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid token format",
        code: "INVALID_TOKEN_FORMAT"
      });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Token has expired",
        code: "TOKEN_EXPIRED"
      });
    }

    return res.status(500).json({
      error: "Server error",
      message: "An internal error occurred during authentication",
      code: "AUTH_ERROR"
    });
  }
}

export default authGuard;
