"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all notifications for the authenticated user
router.get("/", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await database_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50, // limit to recent 50
        });
        res.json(notifications);
    }
    catch (error) {
        console.error("Fetch notifications error:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});
// Mark all as read
router.post("/mark-read", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        await database_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error("Mark notifications read error:", error);
        res.status(500).json({ error: "Failed to update notifications" });
    }
});
// Mark a single notification as read
router.post("/:id/read", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const notificationId = req.params.id;
        await database_1.prisma.notification.update({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error("Mark single notification read error:", error);
        res.status(500).json({ error: "Failed to update notification" });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map