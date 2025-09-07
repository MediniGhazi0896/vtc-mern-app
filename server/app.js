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
import chatRoutes from './routes/chatRoutes.js'; // ✅ new
import notificationRoutes from './routes/notificationRoutes.js'; // optional future
import supportRoutes from './routes/supportRoutes.js'; // optional future

// Socket.io
import { initSocket } from './socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ use HTTP server instead of app.listen
initSocket(server); // ✅ initialize socket.io with our server

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Core middleware
app.use(cors());
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', chatRoutes); // ✅ enable chat REST API
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('✅ VTC-MERN API running with Socket.io');
});

// DB + server bootstrap
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
