import { Router, Response } from 'express';
import { repo } from '../repository';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications - List notifications scoped to active role & user
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const role = req.user?.role || 'all';
  const userId = req.user?.id;

  const relevant = repo.notifications.filter((n) => {
    if (!n.targetRole || n.targetRole === 'all') return true;
    if (n.targetRole === role) return true;
    if (userId && n.targetUserId && n.targetUserId.toUpperCase() === userId.toUpperCase()) return true;
    return false;
  });

  res.json({ success: true, data: relevant, unreadCount: relevant.filter((n) => !n.read).length });
});

// PUT /api/notifications/:id/read - Mark notification read
router.put('/:id/read', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const item = repo.notifications.find((n) => n.id === id);

  if (item) {
    item.read = true;
    return res.json({ success: true, message: 'Notification marked as read' });
  }

  res.status(404).json({ success: false, message: 'Notification not found' });
});

// PUT /api/notifications/mark-all-read - Mark all read
router.put('/mark-all-read', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const role = req.user?.role || 'all';
  const userId = req.user?.id;

  repo.notifications.forEach((n) => {
    if (!n.targetRole || n.targetRole === 'all' || n.targetRole === role || (userId && n.targetUserId === userId)) {
      n.read = true;
    }
  });

  res.json({ success: true, message: 'All notifications marked as read' });
});

export default router;
