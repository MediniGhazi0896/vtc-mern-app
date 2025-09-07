// client/src/services/socket.js
import { io } from "socket.io-client";

// API / Socket server base URL
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Lazy init socket — we’ll attach token dynamically
let socket;

export const getSocket = () => {
  if (!socket) {
    // Read token from localStorage
    const token = localStorage.getItem("token");

    socket = io(SOCKET_URL, {
      autoConnect: false, // manually connect
      withCredentials: true,
      auth: {
        token, // ✅ pass JWT here
      },
    });

    // Debug logs (remove in production)
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
