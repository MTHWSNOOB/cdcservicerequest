import { Request, Response } from 'express';
import { RequestTypeService } from '../services/requestType.service';

const service = new RequestTypeService();

export class RequestTypeController {
    async getAll(req: Request, res: Response) {
        try {
            const types = await service.getAll();
            res.json(types);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ error: 'Name is required' });
            const newType = await service.create(name);
            res.status(201).json(newType);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const updated = await service.update(id as string, name);
            res.json(updated);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await service.delete(id as string);
            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes('Cannot delete')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });

        }
    }
}
