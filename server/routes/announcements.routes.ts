import { Router, Response } from 'express';
import { repo } from '../repository';
import { Announcement, NotificationItem } from '../../src/types';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/announcements - List announcements
router.get('/', optionalAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: repo.announcements, total: repo.announcements.length });
});

// POST /api/announcements - Publish circular/announcement
router.post('/', requireAuth, requireRole('admin', 'hod', 'faculty'), async (req: AuthenticatedRequest, res: Response) => {
  const { title, content, targetAudience = 'All', priority = 'Normal', category = 'Academic' } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  const newAnn: Announcement = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    content,
    author: `${req.user!.name} (${req.user!.role.toUpperCase()})`,
    authorRole: req.user!.role as 'faculty' | 'hod' | 'admin',
    targetAudience,
    priority,
    category,
    date: new Date().toISOString().split('T')[0],
  };

  await repo.saveAnnouncement(newAnn);

  // Broadcast in-app notification
  const broadcastNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    targetRole: 'all',
    title: `Notice: ${newAnn.title}`,
    message: newAnn.content.length > 100 ? `${newAnn.content.substring(0, 97)}...` : newAnn.content,
    type: newAnn.priority === 'Urgent' ? 'alert' : 'info',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    link: 'announcements',
  };
  repo.notifications.unshift(broadcastNotif);
  repo.saveToDisk();

  repo.logAudit(
    'ANNOUNCEMENT_PUBLISHED',
    req.user!.email,
    req.user!.role,
    `Published circular: "${newAnn.title}" for ${targetAudience}`,
    req.ip
  );

  res.status(201).json({ success: true, message: 'Announcement published successfully', data: newAnn });
});

// DELETE /api/announcements/:id - Remove announcement
router.delete('/:id', requireAuth, requireRole('admin', 'hod', 'faculty'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const removed = repo.announcements.find((a) => a.id === id);

  if (!removed) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  await repo.deleteAnnouncement(id);
  repo.logAudit(
    'ANNOUNCEMENT_DELETED',
    req.user!.email,
    req.user!.role,
    `Removed circular: "${removed.title}"`,
    req.ip
  );

  res.json({ success: true, message: 'Announcement deleted' });
});

export default router;
