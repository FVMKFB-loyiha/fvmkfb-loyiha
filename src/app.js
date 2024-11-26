import express, { urlencoded } from "express";
import getDotEnv from "./common/config/dotenv.config.js";
import connectToDb from "./common/database/database.js";
import {
  userRouter,
  userTaskRouter,
  taskRouter,
} from "./model/routes/index.js";
import { initializeSocket } from "./model/routes/notification.router.js";
// import userTaskRouter from "./model/routes/userTask.router.js";
// import userRouter from "./model/routes/user.router.js";
// import taskRouter from "./model/routes/task.router.js";

import http from "http";
import pg from "pg";
import { Server } from "socket.io";
import NotificationRouter from "./model/routes/notification.router.js";
import { fileURLToPath } from "url";
import { client } from "./common/database/config.js";
const app = express();
const server = http.createServer(app);
initializeSocket(server);

const io = new Server(server, {
  cors: {
    origin: "*", // Zaruriy domenlarni belgilang
  },
});

const { Client } = pg;

const PORT = getDotEnv("EXPRESS_PORT") || 3000;

function initRoutes() {
  app.use("/user", userRouter);
  app.use("/task", taskRouter);
  app.use("/user_task", userTaskRouter);
  app.use("/api", NotificationRouter);
}

// Ma'lumotlar bazasi bilan ulanish
client.connect();

// Ishchi hodimlar sonini hisoblash uchun SQL so'rovi
client.query("SELECT COUNT(*) FROM users", (err, res) => {
  if (err) {
    console.error(err);
    return;
  }
  const count = res.rows[0].count;
  console.log(`Hodimlar soni: ${count}`);
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("send_notification", (data) => {
    console.log("Notification received:", data);
    io.emit("new_notification", data); // Hammani xabardor qilish
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

async function init() {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await connectToDb();
  initRoutes();

  server.listen(PORT, () => {
    console.log(`Server ${PORT} da ishlayapti`);
  });
}
init();

// import express from "express"
// import getDotEnv from "./common/config/config.service.js";
// import connectToDb from "./common/database/database.js"
// import userRouter from "./model/controller/userController.js";
// import userTaskRouter from "./model/controller/userTaskController.js";
// import taskRouter from "./model/controller/taskController.js";
// import http from "http"
// import pg from "pg";
// import notificationRouter from "./common/utils/notification.js";
// import notificationModel from "./model/core/notification/notification.model.js";
// import {Socket} from "socket.io";

// const app = express()
// const server = http.createServer(app);
// const io = Socket(server);

// const { Client } = pg;

// const PORT = process.env.PORT || 3000;
// // const PORT = getDotEnv("EXPRESS_PORT")

// function initRoutes(){
//     app.use("/user", userRouter)
//     app.use("/task", taskRouter)
//     app.use("/user_task", userTaskRouter)
//     app.use("/api", notificationRouter)
// }

// // Ma'lumotlar bazasi bilan ulanish
// const client = new Client({
//   user: getDotEnv("DATABASE_USER"),
//   host: getDotEnv("DATABASE_HOST"),
//   database: getDotEnv("DATABASE_NAME"),
//   password: getDotEnv("DATABASE_PASSWORD"),
//   port: parseInt(getDotEnv("DATABASE_PORT")),
// });

// client.connect();

// // Socket.io connection handling
// io.on('connection', (Socket) => {
//   console.log('A client connected');
// });

// // Ishchi hodimlar sonini hisoblash uchun SQL so'rovi
// client.query('SELECT COUNT(*) FROM users', (err, res) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   const count = res.rows[0].count;
//   console.log(`Hodimlar soni: ${count}`);

//   // Natijani frontendga uzatish (masalan, Express.js yordamida)
//   // ...
// });

// async function init() {
//     app.use(express.json());

//     await connectToDb();
//     initRoutes();
//     app.listen(PORT, () => {
//       console.log(`Server ${PORT} da ishlayapti`);
//     });
//   }
//   init();
