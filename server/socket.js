// server/socket.js
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // ✅ your Vite frontend
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // ✅ Each driver joins a personal room with their ID
    socket.on("registerDriver", (driverId) => {
      if (driverId) {
        socket.join(driverId);
        console.log(`👤 Driver ${driverId} joined personal room`);
      }
    });

    socket.on("joinRoom", (bookingId) => {
      socket.join(bookingId);
      console.log(`📌 Joined booking room: ${bookingId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  console.log("✅ Socket.io initialized successfully");
};

export const getIO = () => {
  if (!io) throw new Error("❌ Socket.io not initialized");
  return io;
};
