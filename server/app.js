import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

// Routes
import authRoutes from './routes/authRoutes.js';
import bookingsRoutes from './routes/bookingsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; 
import notificationRoutes from './routes/notificationRoutes.js'; 
import supportRoutes from './routes/supportRoutes.js'; 
import publicRoutes from "./routes/publicRoutes.js";
// Socket.io
import { initSocket } from './socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ HTTP server for socket.io
initSocket(server); // ✅ init socket

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', chatRoutes); // ✅ Chat REST
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use("/api/public", publicRoutes);
// Health check
app.get('/', (req, res) => res.send('✅ VTC-MERN API running with Socket.io'));

// DB + Server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
})
.catch((err) => console.error('❌ MongoDB connection failed:', err.message));
