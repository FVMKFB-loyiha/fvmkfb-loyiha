import express from "express";
import getDotEnv from "./common/config/dotenv.config.js";
import connectToDb from "./common/database/database.js";
import chalk from "chalk";
import {
  userRouter,
  userTaskRouter,
  taskRouter,
} from "./model/routes/index.js";
import cookieParser from "cookie-parser";
import { swaggerDoc, swaggerUi } from "./common/config/swagger.config.js";

// ------------------ APP --------------------- //

const app = express();

// Middleware'larni ulash
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routerlarni endpointga ulash
app.use("/user", userRouter);
app.use("/task", taskRouter);
app.use("/user_task", userTaskRouter);

// Swagger API documentationni ulash
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Ma'lumotlar bazasi bilan ulanish
(async () => {
  try {
    await connectToDb();
    console.log(chalk.greenBright.italic("Database connection successful"));
  } catch (err) {
    console.error(chalk.red("Ma'lumotlar bazasiga ulanishda xatolik:", err.message));
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
