import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import prisma from './services/db.service';

let io: SocketIOServer;

export const initSocket = (httpServer: HTTPServer) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
        }
    });

    console.log('🔌 Socket.io engine initialized');

    io.on('connection', async (socket) => {
        console.log(`🔌 New connection established: ${socket.id}`);

        // Join user-specific room based on auth token
        const token = socket.handshake.auth?.token;
        if (token) {
            try {
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-cdc');
                const userId = decoded.userId || decoded.id;
                if (userId) {
                    socket.join(`user:${userId}`);
                    console.log(`🔌 User ${userId} joined room user:${userId}`);

                    // Check if admin and join admins room
                    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
                    if (user?.role === 'ADMIN') {
                        socket.join('admins');
                        console.log(`🔌 Admin ${userId} joined admins room`);
                    }
                }
            } catch (err) {
                console.log('🔌 Socket auth failed, continuing without room');
            }
        }

        socket.on('disconnect', () => {
            console.log(`🔌 Connection closed: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = (): SocketIOServer => {
    if (!io) {
        throw new Error('Socket.io has not been initialized. Please call initSocket first.');
    }
    return io;
};
