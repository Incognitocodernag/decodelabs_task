"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/student', dashboard_controller_1.getStudentDashboard);
router.get('/admin', auth_1.requireAdmin, dashboard_controller_1.getAdminDashboard);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map