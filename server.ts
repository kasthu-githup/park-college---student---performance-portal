import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { config } from './server/config';
import { securityHeaders, rateLimiter, errorHandler, requestLogger } from './server/middleware/security';

// Route handlers
import authRoutes from './server/routes/auth.routes';
import studentsRoutes from './server/routes/students.routes';
import facultyRoutes from './server/routes/faculty.routes';
import hodRoutes from './server/routes/hod.routes';
import departmentsRoutes from './server/routes/departments.routes';
import subjectsRoutes from './server/routes/subjects.routes';
import attendanceRoutes from './server/routes/attendance.routes';
import marksRoutes from './server/routes/marks.routes';
import leaveRoutes from './server/routes/leave.routes';
import feesRoutes from './server/routes/fees.routes';
import announcementsRoutes from './server/routes/announcements.routes';
import notificationsRoutes from './server/routes/notifications.routes';
import auditRoutes from './server/routes/audit.routes';
import systemRoutes from './server/routes/system.routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Core middlewares
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(securityHeaders);
  app.use(requestLogger);

  // Apply rate limiter to API routes
  app.use('/api', rateLimiter(config.rateLimit.maxRequests, config.rateLimit.windowMs));

  // 2. Institutional API Routes (Mounted FIRST before SPA fallback)
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentsRoutes);
  app.use('/api/faculty', facultyRoutes);
  app.use('/api/hod', hodRoutes);
  app.use('/api/departments', departmentsRoutes);
  app.use('/api/subjects', subjectsRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/marks', marksRoutes);
  app.use('/api/leave-requests', leaveRoutes);
  app.use('/api/leave', leaveRoutes);
  app.use('/api/fees', feesRoutes);
  app.use('/api/announcements', announcementsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api', systemRoutes);

  // 3. Centralized API Error Handling
  app.use('/api', errorHandler);

  // 4. Vite middleware for development / Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Global Error Handler
  app.use(errorHandler);

  // 6. Bind to 0.0.0.0:3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
