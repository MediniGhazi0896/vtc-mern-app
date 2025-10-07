// server/app.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Import ONLY ONCE
import { initSocket } from "./socket.js";

// ✅ Routes
import authRoutes from "./routes/authRoutes.js";
import bookingsRoutes from "./routes/bookingsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

dotenv.config();

// --------------------------------------------------------------------------
// EXPRESS + HTTP SERVER
// --------------------------------------------------------------------------
const app = express();
const server = http.createServer(app);

// ✅ Important: Initialize socket.io once
initSocket(server);

// --------------------------------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------------------------------------------------------
// ROUTES
// --------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/public", publicRoutes);

app.get("/", (_, res) =>
  res.send("✅ VTC-MERN API running with single Socket.io instance")
);

// --------------------------------------------------------------------------
// MONGO + SERVER STARTUP
// --------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err.message));
