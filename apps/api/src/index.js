"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const assignments_routes_1 = __importDefault(require("./routes/assignments.routes"));
const submissions_routes_1 = __importDefault(require("./routes/submissions.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Security Middleware (OWASP)
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Secure CORS policy
const allowedOrigins = ['http://localhost:3000'];
app.use((0, cors_1.default)({ origin: allowedOrigins }));
app.use(express_1.default.json());
const auth_1 = require("./middleware/auth");
// Serve static uploads
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const database_1 = require("database");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
// ... other imports
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/dashboard', auth_1.requireAuth, dashboard_routes_1.default);
app.use('/api/assignments', auth_1.requireAuth, assignments_routes_1.default);
app.use('/api/submissions', auth_1.requireAuth, submissions_routes_1.default);
app.use('/api/attendance', auth_1.requireAuth, attendance_routes_1.default);
app.use('/api/users', auth_1.requireAuth, users_routes_1.default);
app.use('/api/chats', auth_1.requireAuth, chat_routes_1.default);
app.use('/api/notifications', auth_1.requireAuth, notifications_routes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        socket.userId = decoded.userId;
        next();
    }
    catch (err) {
        next(new Error('Authentication error'));
    }
});
io.on('connection', (socket) => {
    const userId = socket.userId;
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
            const message = await database_1.prisma.message.create({
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
            await database_1.prisma.chat.update({
                where: { id: data.chatId },
                data: { updatedAt: new Date() }
            });
            // Broadcast to room
            io.to(data.chatId).emit('receive_message', message);
        }
        catch (error) {
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
//# sourceMappingURL=index.js.map