import prisma from './db.service';

export class RequestTypeService {
    async getAll() {
        return await prisma.requestType.findMany({
            orderBy: { name: 'asc' }
        });
    }

    async create(name: string) {
        return await prisma.requestType.create({
            data: { name }
        });
    }

    async update(id: string, name: string) {
        return await prisma.requestType.update({
            where: { id },
            data: { name }
        });
    }

    async delete(id: string) {
        const requestsCount = await prisma.serviceRequest.count({ where: { requestTypeId: id } });
        if (requestsCount > 0) {
            throw new Error(`Cannot delete: This category has ${requestsCount} active service requests.`);
        }
        return await prisma.requestType.delete({
            where: { id }
        });
    }
}
