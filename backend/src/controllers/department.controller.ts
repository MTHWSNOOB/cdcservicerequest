import { Request, Response } from 'express';
import { DepartmentService } from '../services/department.service';

const departmentService = new DepartmentService();

export class DepartmentController {
    async getAll(req: Request, res: Response) {
        try {
            const departments = await departmentService.getAllDepartments();
            res.json(departments);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const department = await departmentService.getDepartmentById(id as string);
            if (!department) return res.status(404).json({ error: 'Department not found' });
            res.json(department);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { code, name } = req.body;
            if (!code || !name) return res.status(400).json({ error: 'Code and Name are required' });

            const newDept = await departmentService.createDepartment({ code, name });
            res.status(201).json(newDept);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updated = await departmentService.updateDepartment(id as string, req.body);
            res.json(updated);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await departmentService.deleteDepartment(id as string);
            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes('Cannot delete')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });

        }
    }
}
