import express from "express";
import getDotEnv from "./common/config/dotenv.config.js";
import connectToDb from "./common/database/database.js";
import chalk from "chalk";
import {
  userRouter,
  userTaskRouter,
  taskRouter,
} from "./model/routes/index.js";
// <<<<<<< HEAD

// mongoose config ulash
import { client } from "./common/database/config.js";

// swagger configni'ni chaqirish

// socket.io config chaqirish
// import { initSocket } from "./common/config/socket.io.config.js";
// import http from "http";

import cookieParser from "cookie-parser";
import { swaggerDoc, swaggerUi } from "./common/config/swagger.config.js";

// // ------------------ APP --------------------- //

const app = express();

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
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(cors());

// Swagger API documentationni ulash
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

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
const server = app.listen(PORT, () => {
  console.log(chalk.blueBright(`Server ${PORT} da ishlayapti`));
});

// Serverdagi xatoliklarni boshqarish
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} band qilingan. Eski jarayonni to'xtating yoki boshqa portni tanlang.`
    );
  } else {
    console.error("Serverda xatolik yuz berdi:", err.message);
  }
});
