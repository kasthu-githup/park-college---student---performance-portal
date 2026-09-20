import { Router, Response } from 'express';
import { repo } from '../repository';
import { Faculty } from '../../src/types';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/faculty - List all faculty with department filter & search
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { department, search } = req.query;

  let list = [...repo.faculty];

  if (department && department !== 'all') {
    list = list.filter((f) => f.department.toLowerCase() === String(department).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (f) =>
        f.id.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, data: list, total: list.length });
});

// GET /api/faculty/:id - Single faculty profile
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const faculty = repo.faculty.find((f) => f.id.toLowerCase() === id.toLowerCase());

  if (!faculty) {
    return res.status(404).json({ success: false, message: `Faculty ${id} not found` });
  }

  res.json({ success: true, data: faculty });
});

// POST /api/faculty - Create new faculty record (Admin & HOD)
router.post('/', requireAuth, requireRole('admin', 'hod'), async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as Partial<Faculty>;

  if (!data.name || !data.email || !data.department) {
    return res.status(400).json({ success: false, message: 'Name, Email, and Department are required' });
  }

  const facultyId = data.id || `FAC${String(repo.faculty.length + 1).padStart(3, '0')}`;

  const existing = repo.faculty.find(
    (f) => f.id.toLowerCase() === facultyId.toLowerCase() || f.email.toLowerCase() === data.email!.toLowerCase()
  );

  if (existing) {
    return res.status(409).json({ success: false, message: 'Faculty with this ID or Email already exists' });
  }

  const newFaculty: Faculty = {
    id: facultyId,
    name: data.name,
    designation: data.designation || 'Assistant Professor',
    department: data.department,
    email: data.email,
    phone: data.phone || '',
    cabin: data.cabin || 'Tech Block 3',
    qualification: data.qualification || 'M.E., Ph.D.',
    officeHours: data.officeHours || 'Mon-Fri 03:00 PM - 04:30 PM',
    specialization: data.specialization || 'Distributed Computing',
    bio: data.bio || 'Dedicated academician contributing to undergraduate curriculum delivery.',
    assignedMenteeSection: data.assignedMenteeSection || 'A',
    assignedClasses: data.assignedClasses || [],
    accountStatus: 'Active',
  };

  await repo.saveFaculty(newFaculty);

  // Add user account
  repo.users.push({
    id: newFaculty.id,
    name: newFaculty.name,
    email: newFaculty.email,
    role: 'faculty',
    status: 'Active',
    passwordHash: 'faculty123',
    createdAt: new Date().toISOString(),
  });
  repo.saveToDisk();

  repo.logAudit(
    'FACULTY_CREATED',
    req.user!.email,
    req.user!.role,
    `Appointed faculty ${newFaculty.name} (${newFaculty.id}) in ${newFaculty.department}`,
    req.ip
  );

  res.status(201).json({ success: true, message: 'Faculty appointed successfully', data: newFaculty });
});

// PUT /api/faculty/:id - Update faculty dossier
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const faculty = repo.faculty.find((f) => f.id.toLowerCase() === id.toLowerCase());

  if (!faculty) {
    return res.status(404).json({ success: false, message: 'Faculty not found' });
  }

  const caller = req.user!;
  const isSelf = caller.role === 'faculty' && caller.id.toLowerCase() === id.toLowerCase();
  const isAuthorizedAdmin = ['admin', 'hod'].includes(caller.role);

  if (!isSelf && !isAuthorizedAdmin) {
    return res.status(403).json({ success: false, message: 'Unauthorized to modify faculty record' });
  }

  Object.assign(faculty, req.body);
  await repo.saveFaculty(faculty);

  repo.logAudit(
    'FACULTY_UPDATED',
    caller.email,
    caller.role,
    `Updated faculty profile for ${faculty.name} (${faculty.id})`,
    req.ip
  );

  res.json({ success: true, message: 'Faculty profile updated', data: faculty });
});

// DELETE /api/faculty/:id - Remove faculty record (Admin only)
router.delete('/:id', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const idx = repo.faculty.findIndex((f) => f.id.toLowerCase() === id.toLowerCase());

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Faculty not found' });
  }

  const removed = repo.faculty.find((f) => f.id.toLowerCase() === id.toLowerCase());
  await repo.deleteFaculty(id);

  repo.logAudit(
    'FACULTY_DELETED',
    req.user!.email,
    'admin',
    `De-registered faculty ${removed?.name || id} (${id})`,
    req.ip
  );

  res.json({ success: true, message: 'Faculty member removed from institution roll' });
});

export default router;
