import app from './app';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './socket';

dotenv.config();

const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`
  🚀 CDH_BACKEND CORE LOADED
  📡 Port: ${PORT}
  🌌 Environment: ${process.env.NODE_ENV}
  🚦 Real-time Engine: ONLINE
    `);
});
