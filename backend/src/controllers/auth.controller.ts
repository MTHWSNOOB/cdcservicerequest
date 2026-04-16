import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import prisma from '../services/db.service';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-cdc';

export class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const user: any = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Email not registered' });
            }

            // Check password for existing user
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, sectionId: user.sectionId }
            });
        } catch (error: any) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
        }
    }

    async register(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Name, email and password are required' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters' });
            }

            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: { name, email, password: hashedPassword, role: 'USER' } as any
            });

            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            // Create welcome notification
            await prisma.notification.create({
                data: {
                    message: `Welcome to CDH System, ${name}! Your account has been activated.`,
                    userId: user.id
                }
            });

            res.status(201).json({
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
            });
        } catch (error: any) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async changePassword(req: any, res: Response) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current and new passwords are required' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters' });
            }

            const user: any = await prisma.user.findUnique({ where: { id: req.user.id } });
            if (!user) return res.status(404).json({ error: 'User not found' });

            const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentValid) return res.status(401).json({ error: 'Current password is incorrect' });

            const hashedNew = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({
                where: { id: req.user.id },
                data: { password: hashedNew } as any
            });

            res.json({ message: 'Password updated successfully' });
        } catch (error: any) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async me(req: any, res: Response) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: { id: true, name: true, email: true, role: true, status: true, avatar: true, sectionId: true }
            });
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (error: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
