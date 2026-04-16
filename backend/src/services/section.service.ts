import prisma from './db.service';

export class SectionService {
    async getAllSections() {
        return await prisma.section.findMany({
            include: {
                department: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    async createSection(data: { name: string; departmentId: string }) {
        const existing = await prisma.section.findFirst({
            where: { name: { equals: data.name }, departmentId: data.departmentId }
        });
        if (existing) {
            throw new Error('A section with this name already exists in this department.');
        }
        return await prisma.section.create({
            data
        });
    }

    async updateSection(id: string, data: { name?: string; departmentId?: string }) {
        if (data.name) {
            const deptId = data.departmentId || (await prisma.section.findUnique({ where: { id } }))?.departmentId;
            if (deptId) {
                const existing = await prisma.section.findFirst({
                    where: { name: { equals: data.name }, departmentId: deptId, id: { not: id } }
                });
                if (existing) {
                    throw new Error('A section with this name already exists in this department.');
                }
            }
        }
        return await prisma.section.update({
            where: { id },
            data
        });
    }

    async deleteSection(id: string) {
        const requestsCount = await prisma.serviceRequest.count({ where: { sectionId: id } });
        if (requestsCount > 0) {
            throw new Error(`Cannot delete: Section has ${requestsCount} active requests.`);
        }

        const usersCount = await prisma.user.count({ where: { sectionId: id } });
        if (usersCount > 0) {
            throw new Error(`Cannot delete: Section has ${usersCount} active users.`);
        }

        return await prisma.section.delete({
            where: { id }
        });
    }
}
