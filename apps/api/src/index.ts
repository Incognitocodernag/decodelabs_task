import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import assignmentsRoutes from './routes/assignments.routes';
import submissionsRoutes from './routes/submissions.routes';
import attendanceRoutes from './routes/attendance.routes';
import usersRoutes from './routes/users.routes';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middleware (OWASP)
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Secure CORS policy
app.use(cors());
app.use(express.json());

import { requireAuth } from './middleware/auth';

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

import chatRoutes from './routes/chat.routes';
import { prisma } from 'database';
import jwt from 'jsonwebtoken';
import notificationsRoutes from "./routes/notifications.routes";

// ... other imports

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/assignments', requireAuth, assignmentsRoutes);
app.use('/api/submissions', requireAuth, submissionsRoutes);
app.use('/api/attendance', requireAuth, attendanceRoutes);
app.use('/api/users', requireAuth, usersRoutes);
app.use('/api/chats', requireAuth, chatRoutes);
app.use('/api/notifications', requireAuth, notificationsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
  },
});

// Socket.io Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-development';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (socket as any).userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = (socket as any).userId;
  console.log(`User connected to socket: ${userId}`);

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${userId} joined chat ${chatId}`);
  });

  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${userId} left chat ${chatId}`);
  });
  
  socket.on('send_message', async (data) => {
    try {
      // Save message to DB
      const message = await prisma.message.create({
        data: {
          content: data.content,
          chatId: data.chatId,
          senderId: userId,
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, role: true }
          }
        }
      });
      
      // Update chat's updatedAt
      await prisma.chat.update({
        where: { id: data.chatId },
        data: { updatedAt: new Date() }
      });

      // Broadcast to room
      io.to(data.chatId).emit('receive_message', message);
    } catch (error) {
      console.error("Socket error saving message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected from socket: ${userId}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server & Socket.IO running on port ${PORT}`);
});
