import { Router } from "express";
import { prisma } from "database";

import { requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();


// Get assignments (filtered by student if studentId is provided)
router.get("/", async (req: AuthRequest, res) => {
  try {
    let whereClause = {};
    
    // If student, they can only see their own assignments
    if (req.user?.role === 'STUDENT') {
      whereClause = { OR: [{ assignedToId: req.user.userId }, { assignedToId: null }] };
    } else {
      // Admin requested a specific student's assignments
      const { studentId } = req.query;
      if (studentId) {
        whereClause = { OR: [{ assignedToId: studentId as string }, { assignedToId: null }] };
      }
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      orderBy: { dueDate: "asc" },
      include: {
        submissions: req.user?.role === 'STUDENT' ? {
          where: { studentId: req.user.userId }
        } : true,
        assignedTo: { select: { firstName: true, lastName: true } }
      }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

import { z } from 'zod';

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Invalid date")),
  assignedToId: z.string().optional().nullable()
});

// Admin create assignment
router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsedData = createAssignmentSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ error: 'Invalid input', details: parsedData.error.issues });
      return;
    }
    const { title, description, dueDate, assignedToId } = parsedData.data;
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        assignedToId: assignedToId || null,
      },
    });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
