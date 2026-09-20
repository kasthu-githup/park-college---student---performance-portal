import { Router, Response } from 'express';
import { repo } from '../repository';
import { LeaveRequest, NotificationItem } from '../../src/types';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/leave-requests - List leave requests with role-based filtering
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { studentRegNo, status, department } = req.query;

  let list = [...repo.leaveRequests];

  // If student is logged in, restrict to own requests
  if (req.user && req.user.role === 'student') {
    list = list.filter((l) => l.studentRegNo.toUpperCase() === req.user!.id.toUpperCase());
  } else if (studentRegNo) {
    list = list.filter((l) => l.studentRegNo.toUpperCase() === String(studentRegNo).toUpperCase());
  }

  if (status && status !== 'all') {
    list = list.filter((l) => l.status.toLowerCase() === String(status).toLowerCase());
  }

  if (department && department !== 'all') {
    list = list.filter((l) => l.department.toLowerCase() === String(department).toLowerCase());
  }

  res.json({ success: true, data: list, total: list.length });
});

// POST /api/leave-requests - Submit leave request with date validation and duplicate check
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as Partial<LeaveRequest>;

  if (!data.startDate || !data.endDate || !data.reason) {
    return res.status(400).json({ success: false, message: 'Start Date, End Date, and Reason are mandatory' });
  }

  const regNo = req.user!.role === 'student' ? req.user!.id : data.studentRegNo;
  if (!regNo) {
    return res.status(400).json({ success: false, message: 'Student Registration Number required' });
  }

  const student = repo.students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found in institutional records' });
  }

  // Prevent overlapping pending requests
  const hasPending = repo.leaveRequests.some(
    (l) => l.studentRegNo.toUpperCase() === student.regNo.toUpperCase() && l.status === 'Pending' && l.startDate === data.startDate
  );
  if (hasPending) {
    return res.status(409).json({ success: false, message: 'A pending leave request already exists for this date.' });
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const calculatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const newRequest: LeaveRequest = {
    id: `lr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentRegNo: student.regNo,
    studentName: student.name,
    department: student.department,
    year: student.year,
    section: student.section,
    startDate: data.startDate,
    endDate: data.endDate,
    daysCount: data.daysCount || calculatedDays,
    reason: data.reason,
    type: data.type || 'Personal',
    status: 'Pending',
    appliedOn: new Date().toISOString().split('T')[0],
  };

  await repo.saveLeave(newRequest);

  // Push notification to mentor / faculty
  const notif: NotificationItem = {
    id: `notif-${Date.now()}`,
    targetRole: 'faculty',
    title: `New Leave Request: ${student.name}`,
    message: `${student.name} (${student.regNo}) applied for ${newRequest.type} (${newRequest.daysCount} days).`,
    type: 'info',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    link: 'leave',
  };
  repo.notifications.unshift(notif);

  repo.logAudit(
    'LEAVE_REQUESTED',
    req.user!.email,
    req.user!.role,
    `Submitted leave request for ${student.regNo} (${newRequest.startDate} to ${newRequest.endDate})`,
    req.ip
  );

  res.status(201).json({ success: true, message: 'Leave request submitted for mentor review', data: newRequest });
});

// PUT /api/leave-requests/:id/review - Review leave request (Approve/Reject)
router.put('/:id/review', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, reviewerName, comments } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
  }

  const request = repo.leaveRequests.find((l) => l.id === id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Leave request not found' });
  }

  request.status = status;
  request.reviewedBy = reviewerName || req.user?.name || 'Faculty Mentor';
  request.reviewedOn = new Date().toISOString().split('T')[0];
  request.reviewerComments = comments || '';
  await repo.saveLeave(request);

  // Notify student
  const studentNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    targetRole: 'student',
    targetUserId: request.studentRegNo,
    title: `Leave Application ${status}`,
    message: `Your ${request.type} leave request (${request.startDate} to ${request.endDate}) has been ${status.toLowerCase()} by ${request.reviewedBy}.`,
    type: status === 'Approved' ? 'success' : 'warning',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    link: 'leave',
  };
  repo.notifications.unshift(studentNotif);

  repo.logAudit(
    'LEAVE_REVIEWED',
    req.user!.email,
    req.user!.role,
    `Leave request ${request.id} for ${request.studentRegNo} was ${status}`,
    req.ip
  );

  res.json({ success: true, message: `Leave request ${status.toLowerCase()}`, data: request });
});

export default router;
