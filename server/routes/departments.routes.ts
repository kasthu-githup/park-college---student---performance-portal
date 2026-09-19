import { Router, Response } from 'express';
import { repo } from '../repository';
import { Department } from '../../src/types';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/departments - List all departments
router.get('/', optionalAuth, (_req: AuthenticatedRequest, res: Response) => {
  // Compute up-to-date headcounts dynamically
  const list = repo.departments.map((d) => {
    const deptStudents = repo.students.filter(
      (s) => s.department.toLowerCase() === d.name.toLowerCase() || s.department.toLowerCase() === d.code.toLowerCase()
    );
    const deptFaculty = repo.faculty.filter(
      (f) => f.department.toLowerCase() === d.name.toLowerCase() || f.department.toLowerCase() === d.code.toLowerCase()
    );
    return {
      ...d,
      totalStudents: deptStudents.length > 0 ? deptStudents.length : d.totalStudents,
      totalFaculty: deptFaculty.length > 0 ? deptFaculty.length : d.totalFaculty,
    };
  });

  res.json({ success: true, data: list, total: list.length });
});

// POST /api/departments - Create department (Admin only)
router.post('/', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { code, name, hodName, hodEmail, establishedYear } = req.body;

  if (!code || !name) {
    return res.status(400).json({ success: false, message: 'Department Code and Name are required' });
  }

  const existing = repo.departments.find((d) => d.code.toUpperCase() === String(code).toUpperCase());
  if (existing) {
    return res.status(409).json({ success: false, message: 'Department code already exists' });
  }

  const newDept: Department = {
    id: `dept-${Date.now()}`,
    code: String(code).toUpperCase(),
    name,
    hodName: hodName || 'Pending Appointment',
    hodEmail: hodEmail || '',
    totalStudents: 0,
    totalFaculty: 0,
    establishedYear: Number(establishedYear) || 2026,
  };

  repo.departments.push(newDept);
  repo.logAudit(
    'DEPARTMENT_CREATED',
    req.user!.email,
    'admin',
    `Created department ${newDept.name} (${newDept.code})`,
    req.ip
  );

  res.status(201).json({ success: true, message: 'Department added successfully', data: newDept });
});

// PUT /api/departments/:id - Update department
router.put('/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const dept = repo.departments.find((d) => d.id === id);

  if (!dept) {
    return res.status(404).json({ success: false, message: 'Department not found' });
  }

  Object.assign(dept, req.body);
  repo.logAudit(
    'DEPARTMENT_UPDATED',
    req.user!.email,
    'admin',
    `Updated department ${dept.code}`,
    req.ip
  );

  res.json({ success: true, message: 'Department updated', data: dept });
});

// DELETE /api/departments/:id - Remove department
router.delete('/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const idx = repo.departments.findIndex((d) => d.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Department not found' });
  }

  const removed = repo.departments.splice(idx, 1)[0];
  repo.logAudit(
    'DEPARTMENT_DELETED',
    req.user!.email,
    'admin',
    `Removed department ${removed.name} (${removed.code})`,
    req.ip
  );

  res.json({ success: true, message: 'Department removed' });
});

export default router;
