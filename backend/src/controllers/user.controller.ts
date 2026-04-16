import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
    async getAll(req: Request, res: Response) {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { name, email, role, sectionId } = req.body;
            if (!name || !email) return res.status(400).json({ error: 'Name and Email are required' });

            const avatar = req.file ? req.file.path : undefined;
            const cleanSectionId = sectionId === '' ? null : sectionId;
            const newUser = await userService.create({ name, email, role, avatar, sectionId: cleanSectionId });
            res.status(201).json(newUser);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, email, role, status, sectionId } = req.body;
            const cleanSectionId = sectionId === '' ? null : sectionId;
            const data: any = {};
            if (name !== undefined) data.name = name;
            if (email !== undefined) data.email = email;
            if (role !== undefined) data.role = role;
            if (status !== undefined) data.status = status;

            if (req.file) {
                data.avatar = req.file.path;
            } else if (req.body.avatar !== undefined) {
                data.avatar = req.body.avatar;
            }

            data.sectionId = cleanSectionId !== undefined ? cleanSectionId : undefined;

            const updated = await userService.updateUser(id as string, data);
            res.json(updated);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await userService.deleteUser(id as string);
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { password } = req.body;
            if (!password) return res.status(400).json({ error: 'Password is required' });

            await userService.resetPassword(id as string, password);
            res.json({ message: 'Password reset successful' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
