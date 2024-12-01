import { Server } from "socket.io";

let io;
const connectedUsers = {}; // Foydalanuvchilarni kuzatish

export const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Frontend URL
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  io.on("connection", (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    // Foydalanuvchi ulanganida
    socket.on("user_connected", (userId) => {
      console.log(`User ${userId} connected with socket ${socket.id}`);
      connectedUsers[userId] = socket.id;
      // Boshqa clientlarga xabar berish
      io.emit("user_status", { userId, status: "online" });
    });

    // Foydalanuvchi uzilganida
    socket.on("disconnect", () => {
      const userId = Object.keys(connectedUsers).find(
        key => connectedUsers[key] === socket.id
      );
      
      if (userId) {
        console.log(`User ${userId} disconnected`);
        delete connectedUsers[userId];
        // Boshqa clientlarga xabar berish
        io.emit("user_status", { userId, status: "offline" });
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

export const getConnectedUsers = () => connectedUsers;

const socketConfig = {
  init,
  getIO,
  getConnectedUsers
};

export default socketConfig;
