import { PrismaClient } from '@prisma/client';

class DbService {
    private static instance: PrismaClient;

    private constructor() { }

    public static getInstance(): PrismaClient {
        if (!DbService.instance) {
            DbService.instance = new PrismaClient();
        }
        return DbService.instance;
    }
}

export const prisma = DbService.getInstance();
export default prisma;
