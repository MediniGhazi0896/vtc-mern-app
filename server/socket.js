import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // your Vite client
      methods: ["GET", "POST"],
    },
    path: "/socket.io", // default socket path
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    socket.on("joinRoom", (bookingId) => {
      socket.join(bookingId);
      console.log(`📌 User joined room ${bookingId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("❌ Socket.io not initialized");
  return io;
};
