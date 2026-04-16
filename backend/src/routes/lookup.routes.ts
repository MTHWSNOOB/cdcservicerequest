import { Router, Request, Response } from 'express';
import prisma from '../services/db.service';

const router = Router();

// GET /lookup/sections - All authenticated users can read sections
router.get('/sections', async (req: Request, res: Response) => {
    try {
        const sections = await prisma.section.findMany({
            include: { department: true },
            orderBy: { name: 'asc' }
        });
        res.json(sections);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /lookup/request-types - All authenticated users can read request types
router.get('/request-types', async (req: Request, res: Response) => {
    try {
        const requestTypes = await prisma.requestType.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(requestTypes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /lookup/departments - All authenticated users can read departments
router.get('/departments', async (req: Request, res: Response) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(departments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
