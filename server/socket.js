// server/socket.js
import { Server } from "socket.io";
import ChatMessage from "./models/ChatMessage.js";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"], // adjust if frontend hosted elsewhere
      methods: ["GET", "POST"],
    },
  });

  // 🔐 Middleware for JWT auth
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name role");
      if (!user) return next(new Error("User not found"));

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
      };

      next();
    } catch (err) {
      console.error("❌ Socket auth failed:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`⚡ ${socket.user.name} (${socket.user.role}) connected via socket`);

    socket.on("joinRoom", (bookingId) => {
      socket.join(bookingId);
      console.log(`📌 ${socket.user.name} joined room ${bookingId}`);
    });

    socket.on("chatMessage", async ({ bookingId, message }) => {
      if (!bookingId || !message) return;

      // Save message to DB
      const chatMsg = await ChatMessage.create({
        bookingId,
        sender: socket.user.id,
        message,
      });

      const populated = await chatMsg.populate("sender", "name role");

      // Broadcast to everyone in room
      io.to(bookingId).emit("chatMessage", populated);
    });

    socket.on("disconnect", () => {
      console.log(`❌ ${socket.user.name} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
