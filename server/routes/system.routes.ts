import { Router, Response, Request } from 'express';
import { repo } from '../repository';
import { checkDbConnection, initDbSchema, testTiDbConnection, initTiDbSchema, resetTiDbPool } from '../db';
import { config, saveTiDbConfig } from '../config';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const startTime = Date.now();

// GET /api/health - Production health inspection endpoint
router.get('/health', async (_req: AuthenticatedRequest, res: Response) => {
  const dbStatus = await checkDbConnection();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  res.json({
    status: 'healthy',
    version: '2.6.0-enterprise',
    institution: config.institution.name,
    autonomousAffiliation: config.institution.affiliation,
    environment: config.nodeEnv,
    uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
    timestamp: new Date().toISOString(),
    metrics: {
      totalStudents: repo.students.length,
      totalFaculty: repo.faculty.length,
      totalDepartments: repo.departments.length,
      totalAttendanceLogs: repo.attendance.length,
      totalLeaveRequests: repo.leaveRequests.length,
      totalAuditLogs: repo.auditLogs.length,
      registeredUsers: repo.users.length,
    },
    database: dbStatus,
    security: {
      jwtEnabled: true,
      rbacEnforced: true,
      rateLimiting: true,
      securityHeaders: true,
      passwordsHashed: true,
    },
  });
});

// GET /api/db/status - Dedicated Database Diagnostic Route
router.get('/db/status', async (_req: AuthenticatedRequest, res: Response) => {
  const status = await checkDbConnection();
  res.json({
    success: true,
    ...status,
    database: typeof status.database === 'string' ? status.database : 'anna_autonomous_portal',
  });
});

// POST /api/db/init - Trigger Database Schema & Table Index Creation
router.post('/db/init', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await initDbSchema();
    repo.logAudit('DATABASE_SCHEMA_INITIALIZED', req.user!.email, 'admin', 'Triggered institutional schema initialization', req.ip);
    res.json({ success, message: 'Database schema and performance indexes verified/created successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: `Database init failed: ${err.message}` });
  }
});

// Helper to parse MySQL / TiDB URI strings
function parseTiDbUri(rawUri: string) {
  try {
    const cleaned = rawUri.trim().replace(/^mysql:\/\//i, 'http://');
    const u = new URL(cleaned);
    return {
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      host: u.hostname,
      port: u.port ? Number(u.port) : 4000,
      database: u.pathname.replace(/^\//, '') || 'college_nodue',
    };
  } catch {
    const match = rawUri.match(/mysql:\/\/(?:([^:@]+)(?::([^@]*))?@)?([^:\/]+)(?::(\d+))?(?:\/(.*))?/i);
    if (match) {
      return {
        user: match[1] || '',
        password: match[2] || '',
        host: match[3] || '',
        port: match[4] ? Number(match[4]) : 4000,
        database: match[5] || 'college_nodue',
      };
    }
    return null;
  }
}

// POST /api/db/test - Test TiDB connection
router.post('/db/test', async (req: Request, res: Response) => {
  try {
    let { host, port, user, password, database, enableSsl, uri, connectionString } = req.body;

    if (uri || connectionString) {
      const parsed = parseTiDbUri(uri || connectionString);
      if (parsed) {
        host = host || parsed.host;
        port = port || parsed.port;
        user = user || parsed.user;
        password = password || parsed.password;
        database = database || parsed.database;
      }
    }

    if (password === '<PASSWORD>' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your actual TiDB database password (replace <PASSWORD> with your cluster password).',
      });
    }

    const testResult = await testTiDbConnection({
      host,
      port: port ? Number(port) : undefined,
      user,
      password,
      database,
      enableSsl: enableSsl !== undefined ? Boolean(enableSsl) : undefined,
    });
    res.json(testResult);
  } catch (err: any) {
    res.status(500).json({ success: false, message: `Test failed: ${err.message}` });
  }
});

// POST /api/db/configure - Configure TiDB credentials and persist
router.post('/db/configure', async (req: Request, res: Response) => {
  try {
    let { host, port, user, password, database, enableSsl, uri, connectionString } = req.body;

    if (uri || connectionString) {
      const parsed = parseTiDbUri(uri || connectionString);
      if (parsed) {
        host = host || parsed.host;
        port = port || parsed.port;
        user = user || parsed.user;
        password = password || parsed.password;
        database = database || parsed.database;
      }
    }

    if (!password || password === '<PASSWORD>') {
      return res.status(400).json({
        success: false,
        message: 'Your TiDB database password is required to connect. Please replace <PASSWORD> with your secret cluster password.',
      });
    }

    const testResult = await testTiDbConnection({
      host,
      port: port ? Number(port) : undefined,
      user,
      password,
      database,
      enableSsl: enableSsl !== undefined ? Boolean(enableSsl) : true,
    });

    if (!testResult.success) {
      return res.status(400).json({
        success: false,
        message: `Could not connect to TiDB with provided credentials: ${testResult.message}`,
      });
    }

    // Save and reset pool
    saveTiDbConfig({
      host: host || config.tidb.host,
      port: Number(port || config.tidb.port) || 4000,
      user: user || config.tidb.user,
      password,
      database: database || config.tidb.database,
      enableSsl: enableSsl !== undefined ? Boolean(enableSsl) : true,
    });

    await resetTiDbPool();
    await initTiDbSchema();

    // Trigger full state synchronization
    const syncRes = await repo.syncAllToTiDb();

    res.json({
      success: true,
      message: `Successfully connected to TiDB Cloud and initialized database tables! Synced ${syncRes.count} existing records.`,
      testResult,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: `Configuration failed: ${err.message}` });
  }
});

// POST /api/db/seed - Synchronize state to database / repository
router.post('/db/seed', async (req: Request, res: Response) => {
  try {
    const { students, faculty, hod, attendanceRecords } = req.body;
    if (Array.isArray(students) && students.length > 0) {
      repo.students = students;
    }
    if (Array.isArray(faculty) && faculty.length > 0) {
      repo.faculty = faculty;
    }
    if (hod) {
      repo.hod = hod;
    }
    if (Array.isArray(attendanceRecords) && attendanceRecords.length > 0) {
      repo.attendance = attendanceRecords;
    }
    repo.saveToDisk();

    const tidbRes = await repo.syncAllToTiDb();

    res.json({
      success: true,
      message: tidbRes.success
        ? `Successfully synced ${tidbRes.count} records directly to TiDB database!`
        : `Saved ${repo.students.length} students to persistent storage. (TiDB notice: ${tidbRes.message})`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: `Sync failed: ${err.message}` });
  }
});

// GET /api/settings - Read institutional parameters
router.get('/settings', optionalAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, settings: repo.settings });
});

// PUT /api/settings - Update institutional parameters (Admin only)
router.put('/settings', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  Object.assign(repo.settings, req.body);
  repo.logAudit(
    'SETTINGS_UPDATED',
    req.user!.email,
    'admin',
    `Updated institutional portal settings: ${JSON.stringify(req.body)}`,
    req.ip
  );
  res.json({ success: true, message: 'Institutional portal settings saved', settings: repo.settings });
});

export default router;
