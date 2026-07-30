import { Router } from "express";
import { prisma } from "database";
import { AuthRequest } from "../middleware/auth";

const router = Router();


// Get today's attendance for a student
router.get("/today", async (req: AuthRequest, res) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ error: "Unauthorized" });

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    const record = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId,
          date: today,
        }
      }
    });

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Clock In
router.post("/clock-in", async (req: AuthRequest, res) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ error: "Unauthorized" });

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const record = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: today,
        }
      },
      update: {}, // Don't override if already exists
      create: {
        studentId,
        date: today,
        checkInTime: now,
      }
    });

    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Clock Out
router.post("/clock-out", async (req: AuthRequest, res) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ error: "Unauthorized" });

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const record = await prisma.attendance.update({
      where: {
        studentId_date: {
          studentId,
          date: today,
        }
      },
      data: {
        checkOutTime: now,
      }
    });

    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
