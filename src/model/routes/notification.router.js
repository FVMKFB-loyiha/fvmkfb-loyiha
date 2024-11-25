// notificationRoutes.js
// const pool = require('../db'); // Assuming you have a db.js file for PostgreSQL connection pooling
import { Router } from "express";
import sequelize from "../../common/database/sequelize.js";
import notificationModel from "../core/notification/notification.model.js";
import { Server } from "socket.io"; // Assuming you have a Socket.io instance

// Assuming you've initialized Socket.io instance somewhere in your server file
let io;
const initializeSocket = (server) => {
  io = new Server(server);
};

const NotificationRouter = Router();

// Get all notifications for a user
NotificationRouter.get("/notifications/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const [notifications, metadata] = await sequelize.query(
      "SELECT * FROM notifications WHERE user_id = $1",
      {
        replacements: [user_id], // Safer way to pass parameters
        type: sequelize.QueryTypes.SELECT, // Get the result as array of objects
      }
    );

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new notification
NotificationRouter.post("/notifications", async (req, res) => {
  try {
    const { message, user_id } = req.body;

    // Validate input
    if (!message || !user_id) {
      return res
        .status(400)
        .json({ message: "Message and user_id are required" });
    }

    // Create notification using Sequelize model
    const notification = await notificationModel.create({ message, user_id });

    // Emit notification to clients using Socket.io
    if (io) {
      io.emit(`notification_${user_id}`, { message });
    } else {
      console.error("Socket.io not initialized");
    }

    console.log("Notification created:", notification);
    res
      .status(201)
      .json({ message: "Notification created successfully", notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default NotificationRouter;
export { initializeSocket }; // Export initializeSocket so it can be used in the server

// // Create a new notification
// NotificationRouter.post('/notifications', async (req, res) => {
//   try {
//     const { message, user_id } = req.body;
//     await sequelize.query('INSERT INTO notifications (message, user_id) VALUES ($1, $2)', [message, user_id]);

//     // Emit notification to clients using Socket.io
//     io.emit(`notification_${user_id}`, { message });
//     res.status(201).json({ message: 'Notification created successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });
