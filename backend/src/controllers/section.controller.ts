import { Request, Response } from 'express';
import { SectionService } from '../services/section.service';

const sectionService = new SectionService();

export class SectionController {
    async getAll(req: Request, res: Response) {
        try {
            const sections = await sectionService.getAllSections();
            res.json(sections);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { name, departmentId } = req.body;
            if (!name || !departmentId) return res.status(400).json({ error: 'Name and DepartmentId are required' });

            const newSection = await sectionService.createSection({ name, departmentId });
            res.status(201).json(newSection);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updated = await sectionService.updateSection(id as string, req.body);
            res.json(updated);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await sectionService.deleteSection(id as string);
            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes('Cannot delete')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });

        }
    }
}
