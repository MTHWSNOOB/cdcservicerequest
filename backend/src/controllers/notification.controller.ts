import { Response } from 'express';
import prisma from '../services/db.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class NotificationController {
    async getMyNotifications(req: AuthRequest, res: Response) {
        try {
            const notifications = await prisma.notification.findMany({
                where: { userId: req.user!.id },
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    serviceRequest: { select: { id: true, subject: true, status: true } }
                }
            });
            res.json(notifications);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getUnreadCount(req: AuthRequest, res: Response) {
        try {
            const count = await prisma.notification.count({
                where: { userId: req.user!.id, isRead: false }
            });
            res.json({ count });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAsRead(req: AuthRequest, res: Response) {
        try {
            const id = String(req.params.id);
            await prisma.notification.update({
                where: { id },
                data: { isRead: true }
            });
            res.json({ message: 'Notification marked as read' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAllAsRead(req: AuthRequest, res: Response) {
        try {
            await prisma.notification.deleteMany({
                where: { userId: req.user!.id }
            });
            res.json({ message: 'All notifications cleared' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
