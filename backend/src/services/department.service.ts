import prisma from './db.service';

export class DepartmentService {
    async getAllDepartments() {
        return await prisma.department.findMany({
            include: {
                sections: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    async getDepartmentById(id: string) {
        return await prisma.department.findUnique({
            where: { id },
            include: {
                sections: true
            }
        });
    }

    async createDepartment(data: { code: string; name: string }) {
        return await prisma.department.create({
            data
        });
    }

    async updateDepartment(id: string, data: { code?: string; name?: string }) {
        return await prisma.department.update({
            where: { id },
            data
        });
    }

    async deleteDepartment(id: string) {
        const sectionsCount = await prisma.section.count({ where: { departmentId: id } });
        if (sectionsCount > 0) {
            throw new Error(`Cannot delete: Sector has ${sectionsCount} active sections.`);
        }
        return await prisma.department.delete({
            where: { id }
        });
    }
}
