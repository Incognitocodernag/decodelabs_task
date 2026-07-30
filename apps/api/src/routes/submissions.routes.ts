import { Router } from "express";
import { prisma } from "database";
import multer from "multer";
import path from "path";
import fs from "fs";

import { requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();


// Ensure uploads dir exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security: Multer constraints
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "application/pdf", 
  "application/zip", 
  "image/png", 
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // docx
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Prevent directory traversal attacks in originalname
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + safeName);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, ZIP, PNG, JPG, DOCX allowed."));
    }
  }
});

// Upload a submission
router.post("/", upload.single("file"), async (req: AuthRequest, res) => {
  try {
    const { assignmentId } = req.body;
    const studentId = req.user?.userId;

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        fileUrl,
      },
    });

    res.json(submission);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Get all submissions (for Admins)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        assignment: { select: { title: true, dueDate: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

import { z } from 'zod';

const gradeSchema = z.object({
  grade: z.number().or(z.string().regex(/^\d+$/).transform(Number)).refine(val => val >= 0 && val <= 100, "Grade must be between 0 and 100")
});

// Grade a submission (for Admins)
router.put("/:id/grade", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const parsedData = gradeSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ error: 'Invalid input', details: parsedData.error.issues });
      return;
    }
    
    const submission = await prisma.submission.update({
      where: { id: id as string },
      data: {
        grade: parsedData.data.grade,
        status: "GRADED"
      }
    });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
