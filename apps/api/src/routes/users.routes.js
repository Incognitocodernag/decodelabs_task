"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all students
router.get("/students", auth_1.requireAdmin, async (req, res) => {
    try {
        const students = await database_1.prisma.user.findMany({
            where: { role: "STUDENT" },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            }
        });
        res.json(students);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=users.routes.js.map