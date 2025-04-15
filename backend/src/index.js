import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import studentRoutes from './routes/studentRoutes.js';
import canteenRoutes from './routes/canteenRoutes.js';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach `io` to `req` in middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// socket logic
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  // When new order placed
  socket.on('new_order', () => {
    io.emit('refresh_orders'); // Tell all clients to refetch orders
  });

  // When order updated (status changed)
  socket.on('order_updated', () => {
    io.emit('refresh_orders'); // Broadcast update
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
