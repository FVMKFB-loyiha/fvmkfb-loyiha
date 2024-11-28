import express from "express";
import getDotEnv from "./common/config/dotenv.config.js";
import connectToDb from "./common/database/database.js";

// rangli console.log'lar
import chalk from "chalk";

// user task user-task routerlarni chaqrish
import {
  userRouter,
  userTaskRouter,
  taskRouter,
} from "./model/routes/index.js";

// mongoose config ulash
import { client } from "./common/database/config.js";

// swagger configni'ni chaqirish
import { swaggerDoc, swaggerUi } from "./common/config/swagger.config.js";

// socket.io config chaqirish
import { initSocket } from "./common/config/socket.io.config.js";
import http from "http";
import cookieParser from "cookie-parser";

// ------------------ APP --------------------- //

// server PORT
const PORT = getDotEnv("EXPRESS_PORT") || 3000;

// app'ni ishlatish
const app = express();

// socket.io ulash
const server = http.createServer(app);

// boshlang'ich routerler endpointi
app.use("/user", userRouter);
app.use("/task", taskRouter);
app.use("/user_task", userTaskRouter);

// Ma'lumotlar bazasi bilan ulanish
client.connect();

// request data'ni json formatda olish
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parse qivolish
app.use(cookieParser());

// swagger endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
await connectToDb();

// Socket.IO ni ishga tushirish
initSocket(server);

// server portga ulash
server
  .listen(PORT, () => {
    console.log(chalk.dim(`Server ${PORT} da ishlayapti`));
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(
        chalk.red.bold(`Port ${PORT} band, boshqa port tanlanmoqda...`)
      );
      server.listen(0, () => {
        console.log(
          chalk.bgCyan.inverse(
            `Server yangi portda ishlayapti: ${server.address().port}`
          )
        );
      });
    }
  });
