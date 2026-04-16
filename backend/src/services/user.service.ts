import prisma from './db.service';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export class UserService {
    async getAllUsers() {
        return await prisma.user.findMany({
            include: { section: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(data: { name: string, email: string, role?: UserRole, avatar?: string, sectionId?: string }) {
        const defaultPassword = await bcrypt.hash('password123', 10);
        return await prisma.user.create({
            data: {
                ...data,
                password: defaultPassword
            }
        });
    }

    async updateUser(id: string, data: { name?: string; email?: string; role?: UserRole; status?: UserStatus; avatar?: string; sectionId?: string }) {
        return await prisma.user.update({
            where: { id },
            data
        });
    }

    async deleteUser(id: string) {
        return await prisma.user.update({
            where: { id },
            data: { status: 'INACTIVE' }
        });
    }

    async resetPassword(id: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });
    }
}
