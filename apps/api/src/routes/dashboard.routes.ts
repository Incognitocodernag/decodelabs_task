import { Router } from 'express';
import { getStudentDashboard, getAdminDashboard } from '../controllers/dashboard.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/student', getStudentDashboard);
router.get('/admin', requireAdmin, getAdminDashboard);

export default router;
