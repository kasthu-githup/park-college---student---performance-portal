import { Router, Response } from 'express';
import { repo } from '../repository';
import { Subject } from '../../src/types';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/subjects - List all courses/subjects
router.get('/', optionalAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: repo.subjects, total: repo.subjects.length });
});

// POST /api/subjects - Create new subject (Admin & HOD)
router.post('/', requireAuth, requireRole('admin', 'hod'), async (req: AuthenticatedRequest, res: Response) => {
  const { code, name, facultyName, credits, semester, department } = req.body;

  if (!code || !name) {
    return res.status(400).json({ success: false, message: 'Subject Code and Name are required' });
  }

  const cleanCode = String(code).toUpperCase();
  const existing = repo.subjects.find((s) => s.code.toUpperCase() === cleanCode);

  if (existing) {
    return res.status(409).json({ success: false, message: 'Subject with this code already exists' });
  }

  const newSubj: Subject = {
    code: cleanCode,
    name,
    facultyName: facultyName || 'Faculty Assigned',
    credits: Number(credits) || 3,
    semester: Number(semester) || 5,
    department: department || 'Computer Science and Engineering',
  };

  await repo.saveSubject(newSubj);
  repo.logAudit(
    'SUBJECT_CREATED',
    req.user!.email,
    req.user!.role,
    `Added subject ${newSubj.code} (${newSubj.name})`,
    req.ip
  );

  res.status(201).json({ success: true, message: 'Subject added successfully', data: newSubj });
});

// PUT /api/subjects/:code - Update subject
router.put('/:code', requireAuth, requireRole('admin', 'hod'), async (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.params;
  const subj = repo.subjects.find((s) => s.code.toUpperCase() === code.toUpperCase());

  if (!subj) {
    return res.status(404).json({ success: false, message: 'Subject not found' });
  }

  Object.assign(subj, req.body);
  await repo.saveSubject(subj);
  repo.logAudit(
    'SUBJECT_UPDATED',
    req.user!.email,
    req.user!.role,
    `Updated subject syllabus/faculty for ${subj.code}`,
    req.ip
  );

  res.json({ success: true, message: 'Subject updated', data: subj });
});

// DELETE /api/subjects/:code - Remove subject
router.delete('/:code', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.params;
  const subj = repo.subjects.find((s) => s.code.toUpperCase() === code.toUpperCase());

  if (!subj) {
    return res.status(404).json({ success: false, message: 'Subject not found' });
  }

  await repo.deleteSubject(code);
  repo.logAudit(
    'SUBJECT_DELETED',
    req.user!.email,
    'admin',
    `Removed subject ${subj.code} (${subj.name})`,
    req.ip
  );

  res.json({ success: true, message: 'Subject removed from curriculum catalog' });
});

export default router;
