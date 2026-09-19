import { Router, Response } from 'express';
import { repo } from '../repository';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/hod - HOD profile
router.get('/', optionalAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: repo.hod });
});

// PUT /api/hod - Update HOD profile
router.put('/', requireAuth, requireRole('hod', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  Object.assign(repo.hod, req.body);
  repo.logAudit(
    'HOD_PROFILE_UPDATED',
    req.user!.email,
    req.user!.role,
    `Updated HOD profile for ${repo.hod.name}`,
    req.ip
  );
  res.json({ success: true, message: 'HOD profile updated', data: repo.hod });
});

// GET /api/hod/overview - Dynamic department performance analytics
router.get('/overview', optionalAuth, (_req: AuthenticatedRequest, res: Response) => {
  const deptStudents = repo.students.filter(
    (s) => s.department.toLowerCase().includes('computer science') || s.department === 'CSE'
  );
  const deptFaculty = repo.faculty.filter(
    (f) => f.department.toLowerCase().includes('computer science') || f.department === 'CSE'
  );

  const totalStudents = deptStudents.length;
  const totalFaculty = deptFaculty.length;

  // Real attendance calculation
  const totalAttendanceSum = deptStudents.reduce((acc, s) => acc + (s.overallAttendance?.percentage || 0), 0);
  const averageAttendance = totalStudents > 0 ? Math.round((totalAttendanceSum / totalStudents) * 10) / 10 : 0;

  // Low attendance students (< 75%)
  const lowAttendanceStudents = deptStudents.filter((s) => (s.overallAttendance?.percentage || 0) < 75);

  // Pending leaves
  const pendingLeaves = repo.leaveRequests.filter(
    (l) => l.status === 'Pending' && (l.department.toLowerCase().includes('computer science') || l.department === 'CSE')
  );

  // Performance distribution
  const highPerformers = deptStudents.filter((s) => (s.cgpa || 0) >= 8.5);
  const needsAttention = deptStudents.filter((s) => s.performanceRating === 'Needs Attention' || (s.cgpa || 0) < 6.5);

  res.json({
    success: true,
    data: {
      department: repo.hod.department,
      hodName: repo.hod.name,
      totalStudents,
      totalFaculty,
      averageAttendance,
      lowAttendanceCount: lowAttendanceStudents.length,
      lowAttendanceStudents: lowAttendanceStudents.map((s) => ({
        regNo: s.regNo,
        name: s.name,
        percentage: s.overallAttendance?.percentage || 0,
        section: s.section,
        year: s.year,
      })),
      pendingLeavesCount: pendingLeaves.length,
      highPerformersCount: highPerformers.length,
      needsAttentionCount: needsAttention.length,
    },
  });
});

export default router;
