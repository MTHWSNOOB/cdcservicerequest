import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import departmentRoutes from './routes/department.routes';
import sectionRoutes from './routes/section.routes';
import userRoutes from './routes/user.routes';
import requestTypeRoutes from './routes/requestType.routes';
import serviceRequestRoutes from './routes/serviceRequest.routes';
import authRoutes from './routes/auth.routes';
import notificationRoutes from './routes/notification.routes';
import lookupRoutes from './routes/lookup.routes';
import { authenticateJWT, authorizeRoles } from './middleware/auth.middleware';

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors({
    origin: ['http://localhost', 'https://localhost', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/uploads', express.static('uploads'));

// ─── Public Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── User Routes (All authenticated users) ───────────────────────
app.use('/api/lookup', authenticateJWT, lookupRoutes);
app.use('/api/service-requests', authenticateJWT, serviceRequestRoutes);
app.use('/api/notifications', authenticateJWT, notificationRoutes);

// ─── Admin Routes (ADMIN role only) ──────────────────────────────
app.use('/api/departments', authenticateJWT, authorizeRoles('ADMIN'), departmentRoutes);
app.use('/api/sections', authenticateJWT, authorizeRoles('ADMIN'), sectionRoutes);
app.use('/api/users', authenticateJWT, authorizeRoles('ADMIN'), userRoutes);
app.use('/api/request-types', authenticateJWT, authorizeRoles('ADMIN'), requestTypeRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        system: 'CDH_BACKEND_CORE'
    });
});

// Simple Mock API for Telemetry
app.get('/api/telemetry', (req: Request, res: Response) => {
    res.json({
        power: { value: 98.4, unit: '%' },
        temperature: { value: 42, unit: '°C' },
        status: 'STABLE'
    });
});

// 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

export default app;
