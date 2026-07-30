"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// Strict Rate Limiting for Auth to prevent brute-force credential stuffing
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again after 15 minutes' }
});
router.post('/register', authLimiter, auth_controller_1.register);
router.post('/login', authLimiter, auth_controller_1.login);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map