import { Router } from "express";
import { prisma } from "database";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Get all notifications for the authenticated user
router.get("/", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50, // limit to recent 50
    });
    res.json(notifications);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark all as read
router.post("/mark-read", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// Mark a single notification as read
router.post("/:id/read", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;
    await prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Mark single notification read error:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

export default router;
