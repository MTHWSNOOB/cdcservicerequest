import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/login', (req, res) => controller.login(req, res));
router.post('/register', (req, res) => controller.register(req, res));
router.patch('/change-password', authenticateJWT, (req, res) => controller.changePassword(req, res));
router.get('/me', authenticateJWT, (req, res) => controller.me(req, res));

export default router;
