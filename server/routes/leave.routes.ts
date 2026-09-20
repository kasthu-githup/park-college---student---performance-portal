import { Router, Response } from 'express';
import { repo } from '../repository';
import { LeaveRequest, NotificationItem, AttendanceRecord } from '../../src/types';
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

  const regNo = data.studentRegNo;
  let student = regNo
    ? repo.students.find(
        (s) =>
          s.regNo.toUpperCase() === regNo.toUpperCase() ||
          s.id.toUpperCase() === regNo.toUpperCase()
      )
    : undefined;

  if (!student && req.user?.role === 'student') {
    student = repo.students.find(
      (s) =>
        s.regNo.toUpperCase() === req.user!.id.toUpperCase() ||
        s.id.toUpperCase() === req.user!.id.toUpperCase() ||
        s.email.toLowerCase() === req.user!.email.toLowerCase()
    );
  }

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found in institutional records' });
  }

  const isDirectApproved = data.status === 'Approved';

  // Prevent overlapping pending requests for regular students
  if (!isDirectApproved) {
    const hasPending = repo.leaveRequests.some(
      (l) => l.studentRegNo.toUpperCase() === student.regNo.toUpperCase() && l.status === 'Pending' && l.startDate === data.startDate
    );
    if (hasPending) {
      return res.status(409).json({ success: false, message: 'A pending leave request already exists for this date.' });
    }
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const calculatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  const today = new Date().toISOString().split('T')[0];
  const reviewer = data.reviewedBy || req.user?.name || 'Faculty Advisor';

  const newRequest: LeaveRequest = {
    id: data.id || `lr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
    status: isDirectApproved ? 'Approved' : 'Pending',
    appliedOn: data.appliedOn || today,
    reviewedBy: isDirectApproved ? reviewer : undefined,
    reviewedOn: isDirectApproved ? today : undefined,
    reviewerComments: isDirectApproved ? (data.reviewerComments || 'Direct On-Duty authorized and approved by Faculty.') : undefined,
  };

  await repo.saveLeave(newRequest);

  // If directly granted and approved, credit student attendance and create OD record
  const isOD = newRequest.type.includes('OD') || newRequest.type.includes('On-Duty') || newRequest.type.includes('Symposium');
  if (isDirectApproved && isOD) {
    const days = newRequest.daysCount || 1;
    student.overallAttendance.od = (student.overallAttendance.od || 0) + days;
    const present = student.overallAttendance.present || 0;
    const absent = student.overallAttendance.absent || 0;
    const total = student.overallAttendance.total || (present + absent + student.overallAttendance.od);
    const effectiveAttended = present + student.overallAttendance.od;
    student.overallAttendance.percentage = total > 0 ? Math.min(100, Math.round((effectiveAttended / total) * 1000) / 10) : 100;
    await repo.saveStudent(student);

    const odRecord: AttendanceRecord = {
      id: `att-od-${newRequest.id}`,
      date: newRequest.startDate,
      regNo: student.regNo,
      studentName: student.name,
      subjectCode: 'OD-DUTY',
      subjectName: newRequest.reason || 'Authorized On-Duty Event',
      section: student.section,
      year: student.year,
      status: 'OD',
      markedBy: reviewer,
      period: 1,
    };
    await repo.saveAttendanceRecords([odRecord]);
  }

  // Push notification
  const notif: NotificationItem = {
    id: `notif-${Date.now()}`,
    targetRole: isDirectApproved ? 'student' : 'faculty',
    targetUserId: isDirectApproved ? student.regNo : undefined,
    title: isDirectApproved ? `On-Duty Granted: ${newRequest.type}` : `New Leave Request: ${student.name}`,
    message: isDirectApproved
      ? `On-Duty for ${newRequest.daysCount} day(s) (${newRequest.startDate} to ${newRequest.endDate}) granted by ${reviewer}. Attendance credited.`
      : `${student.name} (${student.regNo}) applied for ${newRequest.type} (${newRequest.daysCount} days).`,
    type: isDirectApproved ? 'success' : 'info',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    link: 'leave',
  };
  repo.notifications.unshift(notif);

  repo.logAudit(
    isDirectApproved ? 'OD_DIRECT_GRANTED' : 'LEAVE_REQUESTED',
    req.user!.email,
    req.user!.role,
    `${isDirectApproved ? 'Direct OD granted' : 'Leave requested'} for ${student.regNo} (${newRequest.startDate} to ${newRequest.endDate})`,
    req.ip
  );

  res.status(201).json({
    success: true,
    message: isDirectApproved ? 'On-Duty granted and attendance credited' : 'Leave request submitted for mentor review',
    data: newRequest,
  });
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

  const prevStatus = request.status;
  request.status = status;
  request.reviewedBy = reviewerName || req.user?.name || 'Faculty Mentor';
  request.reviewedOn = new Date().toISOString().split('T')[0];
  request.reviewerComments = comments || (status === 'Approved' ? 'Recommended and approved. OD attendance credited.' : 'Request declined.');
  await repo.saveLeave(request);

  // If approved/rejected and it is OD / Symposium, update student attendance and create/remove OD attendance records!
  const isOD = request.type.includes('OD') || request.type.includes('On-Duty') || request.type.includes('Symposium');
  if (isOD) {
    const student = repo.students.find((s) => s.regNo.toUpperCase() === request.studentRegNo.toUpperCase());
    if (student) {
      const days = request.daysCount || 1;
      if (status === 'Approved' && prevStatus !== 'Approved') {
        student.overallAttendance.od = (student.overallAttendance.od || 0) + days;
        const present = student.overallAttendance.present || 0;
        const absent = student.overallAttendance.absent || 0;
        const total = student.overallAttendance.total || (present + absent + student.overallAttendance.od);
        const effectiveAttended = present + student.overallAttendance.od;
        student.overallAttendance.percentage = total > 0 ? Math.min(100, Math.round((effectiveAttended / total) * 1000) / 10) : 100;
        await repo.saveStudent(student);

        const odRecord: AttendanceRecord = {
          id: `att-od-${request.id}`,
          date: request.startDate,
          regNo: student.regNo,
          studentName: student.name,
          subjectCode: 'OD-DUTY',
          subjectName: request.reason || 'Authorized On-Duty Event',
          section: student.section,
          year: student.year,
          status: 'OD',
          markedBy: request.reviewedBy,
          period: 1,
        };
        await repo.saveAttendanceRecords([odRecord]);
      } else if (status === 'Rejected' && prevStatus === 'Approved') {
        student.overallAttendance.od = Math.max(0, (student.overallAttendance.od || 0) - days);
        const present = student.overallAttendance.present || 0;
        const absent = student.overallAttendance.absent || 0;
        const total = student.overallAttendance.total || (present + absent + student.overallAttendance.od);
        const effectiveAttended = present + student.overallAttendance.od;
        student.overallAttendance.percentage = total > 0 ? Math.min(100, Math.round((effectiveAttended / total) * 1000) / 10) : 100;
        await repo.saveStudent(student);

        await repo.deleteAttendanceRecord(`att-od-${request.id}`);
      }
    }
  }

  // Notify student
  const studentNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    targetRole: 'student',
    targetUserId: request.studentRegNo,
    title: `Leave Application ${status}`,
    message: `Your ${request.type} request (${request.startDate} to ${request.endDate}) has been ${status.toLowerCase()} by ${request.reviewedBy}.${status === 'Approved' && isOD ? ' OD attendance credited.' : ''}`,
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
