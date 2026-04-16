import prisma from './db.service';
import { Urgency, RequestStatus } from '@prisma/client';

export interface CreateRequestData {
    subject: string;
    urgency?: Urgency;
    description?: string;
    userId: string;
    sectionId: string;
    requestTypeId: string;
    attachments?: string | null;
    deadline?: Date | string;
}

export interface UpdateStatusData {
    status: RequestStatus;
    receivedById?: string;
    disapprovalReason?: string;
    actionsTaken?: string;
    remarks?: string;
    assignedAdmins?: string;
    deadline?: Date | string;
}

export class ServiceRequestService {
    async getAll(user?: any, options?: { page?: number; limit?: number; search?: string; status?: string }) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = user && !['ADMIN', 'TECHNICAL'].includes(user.role) ? { userId: user.id } : {};

        // Search filter
        if (options?.search) {
            where.subject = { contains: options.search };
        }

        // Status filter
        if (options?.status && options.status !== 'ALL') {
            where.status = options.status;
        }

        const [data, total] = await Promise.all([
            prisma.serviceRequest.findMany({
                where,
                include: {
                    user: { select: { name: true, email: true, role: true, avatar: true, sectionId: true } },
                    section: { include: { department: true } },
                    requestType: true,
                    receivedBy: { select: { name: true, email: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.serviceRequest.count({ where })
        ]);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getById(id: string) {
        return await prisma.serviceRequest.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true, role: true, avatar: true } },
                section: { include: { department: true } },
                requestType: true,
                receivedBy: { select: { name: true, email: true } }
            }
        });
    }

    async create(data: CreateRequestData) {
        return await prisma.serviceRequest.create({
            data: {
                ...data,
                status: 'NEW'
            },
            include: {
                user: { select: { name: true, email: true, role: true, avatar: true, sectionId: true } },
                section: { include: { department: true } },
                requestType: true,
                receivedBy: { select: { name: true, email: true } }
            }
        });
    }

    async updateStatus(id: string, statusData: UpdateStatusData) {
        const updateData: any = { status: statusData.status };

        // Track who received and when
        if (statusData.status === 'RECEIVED' && statusData.receivedById) {
            updateData.receivedAt = new Date();
            updateData.receivedById = statusData.receivedById;
        }

        if (statusData.disapprovalReason !== undefined) updateData.disapprovalReason = statusData.disapprovalReason;
        if (statusData.actionsTaken !== undefined) updateData.actionsTaken = statusData.actionsTaken;
        if (statusData.remarks !== undefined) updateData.remarks = statusData.remarks;
        if (statusData.assignedAdmins !== undefined) updateData.assignedAdmins = statusData.assignedAdmins;
        if (statusData.deadline !== undefined) updateData.deadline = statusData.deadline ? new Date(statusData.deadline) : null;

        return await prisma.serviceRequest.update({
            where: { id },
            data: updateData,
            include: {
                user: { select: { name: true, email: true, role: true, avatar: true } },
                section: { include: { department: true } },
                requestType: true,
                receivedBy: { select: { name: true, email: true } }
            }
        });
    }

    async update(id: string, data: any) {
        // Only allow updates when status is NEW
        const existing = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!existing || existing.status !== 'NEW') {
            throw new Error('EDIT_DENIED: Only requests with NEW status can be edited.');
        }

        return await prisma.serviceRequest.update({
            where: { id },
            data
        });
    }

    async requestDeletion(id: string, userId?: string) {
        const existing = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!existing) throw new Error('Request not found');

        if (existing.status === 'IN_PROGRESS' || existing.status === 'COMPLETED') {
            throw new Error('DELETE_DENIED: Cannot request deletion for ongoing or completed requests.');
        }

        return await prisma.serviceRequest.update({
            where: { id },
            data: { deletionRequested: true },
            include: {
                user: { select: { name: true, email: true, role: true, avatar: true } },
                section: { include: { department: true } },
                requestType: true,
                receivedBy: { select: { name: true, email: true } }
            }
        });
    }

    async delete(id: string, userRole?: string) {
        const existing = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!existing) throw new Error('Request not found');

        if (userRole === 'ADMIN' || userRole === 'TECHNICAL') {
            if (!existing.deletionRequested) {
                throw new Error('DELETE_DENIED: Admin cannot delete unless user has requested deletion.');
            }
        } else {
            throw new Error('DELETE_DENIED: Regular users can only request deletion, not delete directly.');
        }

        return await prisma.serviceRequest.delete({
            where: { id }
        });
    }

    async submitRating(id: string, userId: string, rating: number, feedback: string) {
        const existing = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!existing) throw new Error('Request not found');
        if (existing.userId !== userId) throw new Error('Unauthorzied: Cannot rate another user\'s request.');
        if (existing.status !== 'COMPLETED') throw new Error('Only COMPLETED requests can be rated.');
        if (existing.rating) throw new Error('Request has already been rated.');

        return await prisma.serviceRequest.update({
            where: { id },
            data: { rating, feedback },
            include: {
                user: { select: { name: true, email: true, role: true, avatar: true } },
                section: { include: { department: true } },
                requestType: true,
                receivedBy: { select: { name: true, email: true } }
            }
        });
    }
}
