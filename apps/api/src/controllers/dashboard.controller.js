"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboard = exports.getStudentDashboard = void 0;
const database_1 = require("database");
const getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // 1. Fetch total assignments for the student (assigned to null (everyone) or specifically to this user)
        const assignments = await database_1.prisma.assignment.findMany({
            where: {
                OR: [
                    { assignedToId: null },
                    { assignedToId: userId }
                ]
            },
            orderBy: { dueDate: 'asc' }
        });
        const assignmentIds = assignments.map(a => a.id);
        // 2. Fetch submissions for this user
        const submissions = await database_1.prisma.submission.findMany({
            where: {
                studentId: userId,
            },
            include: {
                assignment: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Calculate Progress
        const totalAssignments = assignments.length;
        const completedAssignments = submissions.length;
        const progress = totalAssignments > 0
            ? Math.round((completedAssignments / totalAssignments) * 100)
            : 0;
        // Calculate Performance Score (Average Grade of Graded Submissions)
        const gradedSubmissions = submissions.filter(s => s.status === 'GRADED' && s.grade !== null);
        const avgGrade = gradedSubmissions.length > 0
            ? (gradedSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedSubmissions.length).toFixed(1)
            : 'N/A';
        // Calculate Active Deliverables (Assignments without a submission)
        const submittedAssignmentIds = new Set(submissions.map(s => s.assignmentId));
        const upcomingAssignments = assignments
            .filter(a => !submittedAssignmentIds.has(a.id))
            .slice(0, 5); // Take up to 5 upcoming
        const activeDeliverables = totalAssignments - completedAssignments;
        // Attendance Rate (Mocking for now as we don't have a robust attendance system yet)
        // Could calculate based on Attendance model if we had daily records
        const attendanceCount = await database_1.prisma.attendance.count({
            where: { studentId: userId }
        });
        const attendanceRate = attendanceCount > 0 ? 100 : 0; // Simplified
        res.status(200).json({
            progress,
            performanceScore: avgGrade,
            attendanceRate,
            activeDeliverables,
            upcomingAssignments,
            recentSubmissions: submissions.slice(0, 5) // Top 5 recent
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getStudentDashboard = getStudentDashboard;
const getAdminDashboard = async (req, res) => {
    try {
        const totalStudents = await database_1.prisma.user.count({ where: { role: 'STUDENT' } });
        const totalAssignments = await database_1.prisma.assignment.count();
        const pendingGrading = await database_1.prisma.submission.count({ where: { status: 'PENDING' } });
        // Average attendance mock for now, until attendance system is utilized
        const avgAttendance = 98;
        // Fetch recent student registrations
        const recentStudents = await database_1.prisma.user.findMany({
            where: { role: 'STUDENT' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        res.status(200).json({
            stats: {
                totalStudents,
                totalAssignments,
                pendingGrading,
                avgAttendance
            },
            recentRegistrations: recentStudents
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAdminDashboard = getAdminDashboard;
//# sourceMappingURL=dashboard.controller.js.map