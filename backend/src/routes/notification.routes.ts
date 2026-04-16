import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();
const controller = new NotificationController();

router.get('/', (req, res) => controller.getMyNotifications(req as any, res));
router.get('/unread-count', (req, res) => controller.getUnreadCount(req as any, res));
router.patch('/read-all', (req, res) => controller.markAllAsRead(req as any, res));
router.patch('/:id/read', (req, res) => controller.markAsRead(req as any, res));

export default router;
