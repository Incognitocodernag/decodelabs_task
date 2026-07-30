"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get assignments (filtered by student if studentId is provided)
router.get("/", async (req, res) => {
    try {
        let whereClause = {};
        // If student, they can only see their own assignments
        if (req.user?.role === 'STUDENT') {
            whereClause = { OR: [{ assignedToId: req.user.userId }, { assignedToId: null }] };
        }
        else {
            // Admin requested a specific student's assignments
            const { studentId } = req.query;
            if (studentId) {
                whereClause = { OR: [{ assignedToId: studentId }, { assignedToId: null }] };
            }
        }
        const assignments = await database_1.prisma.assignment.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
const zod_1 = require("zod");
const createAssignmentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    dueDate: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Invalid date")),
    assignedToId: zod_1.z.string().optional().nullable()
});
// Admin create assignment
router.post("/", auth_1.requireAdmin, async (req, res) => {
    try {
        const parsedData = createAssignmentSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: 'Invalid input', details: parsedData.error.issues });
            return;
        }
        const { title, description, dueDate, assignedToId } = parsedData.data;
        const assignment = await database_1.prisma.assignment.create({
            data: {
                title,
                description,
                dueDate: new Date(dueDate),
                assignedToId: assignedToId || null,
            },
        });
        res.json(assignment);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=assignments.routes.js.map