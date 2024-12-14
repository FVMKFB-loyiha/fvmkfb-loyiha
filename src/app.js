import express from "express";
import getDotEnv from "./common/config/dotenv.config.js";
import connectToDb from "./common/database/database.js";
import chalk from "chalk";
import {
  userRouter,
  userTaskRouter,
  taskRouter,
} from "./model/routes/index.js";

import { addTask } from "./model/core/task/task.service.js";
// import { tasksModel } from "./model/core/index.js";

// mongoose config ulash
// import { client } from "./common/database/config.js";

// socket.io config chaqirish
import * as socketConfig from "./common/config/socket.io.config.js";
import http from "http";

// cookie parser
import cookieParser from "cookie-parser";

// swagger configni'ni chaqirish
import { swaggerDoc, swaggerUi } from "./common/config/swagger.config.js";

// socket.io-client ni import qilish
import { io as socketIOClient } from "socket.io-client";

// // ------------------ APP --------------------- //

const app = express();
const server = http.createServer(app);
const io = socketConfig.init(server);
const socket = socketIOClient("http://localhost:3000");

socket.on("connect", () => {
  console.log("Foydalanuvchi ulandi, socket id:", socket.id);
  socket.emit("user_connected", "user1"); // yoki foydalanuvchi IDni yuboring
});

// Notificationni qabul qilish:
socket.on("task_assigned", (data) => {
  console.log("Task notification:", data);
  // Popupni ko'rsatish yoki boshqa ishlov berish
});

// Socket.io konfiguratsiyasini ishga tushirish

// Middleware'larni ulash
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routerlarni endpointga ulash
app.use("/user", userRouter);
app.use("/task", taskRouter);
app.use("/user_task", userTaskRouter);

// CORS sozlamalarini qo'shish
import cors from "cors";
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(cors());

// Swagger API documentationni ulash
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    swaggerOptions: {
      validatorUrl: null,
      supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
      defaultModelsExpandDepth: -1,
      persistAuthorization: true,
      authAction: {
        bearerAuth: {
          name: "bearerAuth",
          schema: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: "JWT token kiriting"
          }
        }
      }
    }
  })
);
// app.post("/send-task", authenticateToken, upload.single('file'), async (req, res) => {
//   try {
//     const result = await addTask(req);

//     // user_id ni massivga o'tkazish
//     let user_id = req.body.user_id;
//     if (typeof user_id === 'string') {
//       try {
//         user_id = JSON.parse(user_id);
//       } catch (error) {
//         throw new Error("user_id noto'g'ri formatda");
//       }
//     }

//     // Har bir foydalanuvchiga bildirishnoma yuborish
//     if (Array.isArray(user_id)) {
//       user_id.forEach((userId) => {
//         const userSocketId = socketConfig.getConnectedUsers()[userId];
//         if (userSocketId) {
//           socketConfig.getIO().to(userSocketId).emit("task_notification", {
//             task: {
//               id: result.task_id,
//               title: req.body.title,
//               status: req.body.status
//             },
//           });
//           console.log(`Task notification sent to user ${userId}`);
//         } else {
//           console.log(`User ${userId} is not connected`);
//         }
//       });
//     }

//     res.status(200).send("Task assigned and notifications sent successfully!");
//   } catch (err) {
//     console.error("Error assigning task:", err);
//     res.status(500).send("Internal server error: " + err.message);
//   }
// });

// Ma'lumotlar bazasi bilan ulanish
(async () => {
  try {
    await connectToDb();
    console.log(chalk.greenBright.italic("Database connection successful"));
  } catch (err) {
    console.error(
      chalk.red("Ma'lumotlar bazasiga ulanishda xatolik:", err.message)
    );
    process.exit(1);
  }
})();

// server PORT
const PORT = getDotEnv("EXPRESS_PORT") || 3000;
const serverApp = app.listen(PORT, () => {
  console.log(chalk.blueBright(`Server ${PORT} da ishlayapti`));
});


// Serverdagi xatoliklarni boshqarish
serverApp.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} band qilingan. Eski jarayonni to'xtating yoki boshqa portni tanlang.`
    );
  } else {
    console.error("Serverda xatolik yuz berdi:", err.message);
  }
});

// Socket ulanishlarini tekshirish
// setInterval(() => {
//   console.log("Connected users:", socketConfig.getConnectedUsers());
// }, 5000);
