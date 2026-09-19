import { Router, Response } from 'express';
import { repo } from '../repository';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/audit-logs - Query audit trail with search and pagination (Admin only)
router.get('/', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { action, search, page = 1, limit = 50 } = req.query;

  let logs = [...repo.auditLogs];

  if (action && action !== 'all') {
    logs = logs.filter((l) => l.action.toLowerCase() === String(action).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    logs = logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.performedBy.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
    );
  }

  const total = logs.length;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = logs.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// POST /api/audit-logs - Append audit entry
router.post('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { action, details, performedBy, userRole } = req.body;

  if (!action || !details) {
    return res.status(400).json({ success: false, message: 'Action and details are required' });
  }

  const actor = performedBy || req.user?.email || 'System';
  const role = userRole || req.user?.role || 'system';

  const log = repo.logAudit(action, actor, role, details, req.ip);
  res.status(201).json({ success: true, log });
});

export default router;
