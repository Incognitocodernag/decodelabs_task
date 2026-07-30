import { Router } from "express";
import { prisma } from "database";
import { requireAdmin } from "../middleware/auth";

const router = Router();


// Get all students
router.get("/students", requireAdmin, async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
