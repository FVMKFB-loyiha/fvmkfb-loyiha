// notificationRoutes.js
// const pool = require('../db'); // Assuming you have a db.js file for PostgreSQL connection pooling
import { Router } from "express";
import sequelize from "../../common/database/sequelize.js";

const NotificationRouter = Router();

// Get all notifications for a user
NotificationRouter.get("/notifications/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const notifications = await sequelize.query(
      "SELECT * FROM notifications WHERE user_id = $1",
      [user_id]
    );
    res.json(notifications.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

NotificationRouter.post("/notifications", async (req, res) => {
  try {
    const { message, user_id } = req.body;

    await sequelize.query(
      "INSERT INTO notifications (message, user_id) VALUES (:message, :user_id)",
      {
        replacements: { message, user_id },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    // Emit notification to clients using Socket.io
    io.emit(`notification_${user_id}`, { message });
    console.log("notification body=> ", req.body);
    res.status(201).json({ message: "Notification created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default NotificationRouter;

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
