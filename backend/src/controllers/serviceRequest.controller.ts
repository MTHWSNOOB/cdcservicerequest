import { Request, Response } from 'express';
import { ServiceRequestService } from '../services/serviceRequest.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { getIO } from '../socket';
import prisma from '../services/db.service';

const service = new ServiceRequestService();

export class ServiceRequestController {
    async getAll(req: AuthRequest, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = req.query.search as string || '';
            const status = req.query.status as string || 'ALL';

            const result = await service.getAll(req.user, { page, limit, search, status });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'User ID missing in token' });

            // Auto-assign sectionId from user's profile if not provided
            let sectionId = req.body.sectionId;
            if (!sectionId) {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { sectionId: true, name: true }
                });
                sectionId = user?.sectionId;
            }

            if (!sectionId) {
                return res.status(400).json({ error: 'No section assigned to your profile. Contact admin.' });
            }

            const attachmentFiles = req.files as Express.Multer.File[];
            const attachments = attachmentFiles ? JSON.stringify(attachmentFiles.map(f => f.filename)) : null;

            const newRequest = await service.create({
                ...req.body,
                userId,
                sectionId,
                attachments
            });

            // Notify all admin users about the new request
            const admins = await prisma.user.findMany({
                where: { 
                    role: { in: ['ADMIN', 'TECHNICAL'] }, 
                    status: 'ACTIVE' 
                },
                select: { id: true }
            });

            const requesterName = req.user?.name || 'A user';
            const subject = newRequest.subject || req.body.subject || 'Untitled';

            for (const admin of admins) {
                const notification = await prisma.notification.create({
                    data: {
                        message: `New request from ${requesterName}: "${subject}"`,
                        userId: admin.id,
                        serviceRequestId: newRequest.id
                    }
                });
                getIO().to(`user:${admin.id}`).emit('notification:new', notification);
            }

            // Broadcast new request event to all
            getIO().emit('request:created', newRequest);

            res.status(201).json(newRequest);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const updateData: any = { ...req.body };

            const attachmentFiles = req.files as Express.Multer.File[];
            if (attachmentFiles && attachmentFiles.length > 0) {
                updateData.attachments = JSON.stringify(attachmentFiles.map(f => f.filename));
            }

            const updated = await service.update(id as string, updateData);

            // Broadcast update event
            getIO().emit('request:updated', updated);

            res.json(updated);
        } catch (error: any) {
            if (error.message?.includes('EDIT_DENIED')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    async updateStatus(req: AuthRequest, res: Response) {
        try {
            const id = String(req.params.id);
            const status = String(req.body.status) as any;
            const receivedById = req.user?.id;
            const { disapprovalReason, actionsTaken, remarks, assignedAdmins, deadline } = req.body;

            const updated = await service.updateStatus(id, {
                status,
                receivedById,
                disapprovalReason,
                actionsTaken,
                remarks,
                assignedAdmins,
                deadline
            });

            // Auto-create notification for the request owner
            if (updated) {
                const sr: any = await prisma.serviceRequest.findUnique({
                    where: { id },
                    select: { userId: true, subject: true }
                });
                if (sr) {
                    const notification = await prisma.notification.create({
                        data: {
                            message: `Your request "${sr.subject}" has been updated to ${status.replace('_', ' ')}.`,
                            userId: String(sr.userId),
                            serviceRequestId: id
                        }
                    });

                    // Emit notification to specific user
                    getIO().to(`user:${sr.userId}`).emit('notification:new', notification);
                }

                // Broadcast general update
                getIO().emit('request:updated', updated);
            }

            res.json(updated);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async requestDeletion(req: AuthRequest, res: Response) {
        try {
            const id = String(req.params.id);
            const userId = req.user?.id;

            const updated = await service.requestDeletion(id, userId);

            // Notify everyone that the request is requested for deletion
            if (updated) {
                getIO().emit('request:updated', updated);
            }

            res.json(updated);
        } catch (error: any) {
            if (error.message?.includes('DELETE_DENIED')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response) {
        try {
            const id = String(req.params.id);
            const userRole = req.user?.role;
            await service.delete(id, userRole);

            // Broadcast delete event
            getIO().emit('request:deleted', { id });

            return res.status(204).send();
        } catch (error: any) {
            if (error.message?.includes('DELETE_DENIED')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    async submitRating(req: AuthRequest, res: Response) {
        try {
            const id = String(req.params.id);
            const userId = req.user?.id;
            const { rating, feedback } = req.body;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const updated = await service.submitRating(id, userId, Number(rating), String(feedback));

            getIO().emit('request:updated', updated);

            res.json(updated);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
