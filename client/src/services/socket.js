import { io } from "socket.io-client";

// Create socket client (don’t auto-connect)
const socket = io("http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket"], // force WebSocket
  path: "/socket.io", // must match server
});
socket.on("notification", (notif) => {
  console.log("🔔 Notification received:", notif);
  // Later: push into global state / context
});
export default socket;
