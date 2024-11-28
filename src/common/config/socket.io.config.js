import { Server } from "socket.io";
import chalk from "chalk";

let io;

// export const initSocket = (server) => {
//   io = new Server(server, {
//     cors: { origin: "*" },
//   });

//   io.on("connection", (socket) => {
//     console.log(chalk.blueBright(`User connected: " + ${socket.io}`));

//     socket.on("disconnected", () => {
//       console.log(
//         chalk.redBright.italic(`User disconnected: " + ${socket.io}`)
//       );
//     });
//   });
//   return io;
// };


// export const getIo = () => {
//   if (!io) {
//     throw new Error("Socket.io hali ishga tushirilmagan");
//   }
// };
