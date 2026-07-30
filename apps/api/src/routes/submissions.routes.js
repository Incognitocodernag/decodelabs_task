"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("database");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Ensure uploads dir exists
const uploadsDir = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
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
const storage = multer_1.default.diskStorage({
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
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type. Only PDF, ZIP, PNG, JPG, DOCX allowed."));
        }
    }
});
// Upload a submission
router.post("/", upload.single("file"), async (req, res) => {
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
        const submission = await database_1.prisma.submission.create({
            data: {
                assignmentId,
                studentId,
                fileUrl,
            },
        });
        res.json(submission);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Server error" });
    }
});
// Get all submissions (for Admins)
router.get("/", auth_1.requireAdmin, async (req, res) => {
    try {
        const submissions = await database_1.prisma.submission.findMany({
            include: {
                student: { select: { firstName: true, lastName: true, email: true } },
                assignment: { select: { title: true, dueDate: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(submissions);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
const zod_1 = require("zod");
const gradeSchema = zod_1.z.object({
    grade: zod_1.z.number().or(zod_1.z.string().regex(/^\d+$/).transform(Number)).refine(val => val >= 0 && val <= 100, "Grade must be between 0 and 100")
});
// Grade a submission (for Admins)
router.put("/:id/grade", auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const parsedData = gradeSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: 'Invalid input', details: parsedData.error.issues });
            return;
        }
        const submission = await database_1.prisma.submission.update({
            where: { id: id },
            data: {
                grade: parsedData.data.grade,
                status: "GRADED"
            }
        });
        res.json(submission);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=submissions.routes.js.map