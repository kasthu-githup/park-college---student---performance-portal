import { Router, Response } from 'express';
import { repo } from '../repository';
import { AttendanceRecord } from '../../src/types';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/attendance - Query attendance records with filters
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { date, regNo, subjectCode, section, year } = req.query;

  let records = [...repo.attendance];

  if (date) {
    records = records.filter((r) => r.date === String(date));
  }

  if (regNo) {
    records = records.filter((r) => r.regNo.toUpperCase() === String(regNo).toUpperCase());
  }

  if (subjectCode && subjectCode !== 'all') {
    records = records.filter((r) => r.subjectCode.toUpperCase() === String(subjectCode).toUpperCase());
  }

  if (section && section !== 'all') {
    records = records.filter((r) => r.section.toUpperCase() === String(section).toUpperCase());
  }

  if (year && year !== 'all') {
    records = records.filter((r) => r.year === Number(year));
  }

  res.json({
    success: true,
    data: records,
    total: records.length,
  });
});

// POST /api/attendance/batch - Mark/Update batch attendance with duplicate prevention
router.post('/batch', requireAuth, requireRole('admin', 'hod', 'faculty'), async (req: AuthenticatedRequest, res: Response) => {
  const { records } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: 'Array of attendance records is required' });
  }

  const savedRecords: AttendanceRecord[] = [];
  const affectedStudents = new Set<string>();

  for (const item of records) {
    // Validate required fields
    if (!item.date || !item.regNo || !item.subjectCode || !item.status) {
      continue;
    }

    // Validate student existence
    const student = repo.students.find((s) => s.regNo.toUpperCase() === item.regNo.toUpperCase());
    if (!student) {
      continue;
    }

    affectedStudents.add(student.regNo);

    // Check duplicate check for same date + student + subject
    const existingIndex = repo.attendance.findIndex(
      (a) =>
        a.date === item.date &&
        a.regNo.toUpperCase() === item.regNo.toUpperCase() &&
        a.subjectCode.toUpperCase() === item.subjectCode.toUpperCase()
    );

    const recordId = existingIndex >= 0 ? repo.attendance[existingIndex].id : `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullRecord: AttendanceRecord = {
      id: recordId,
      date: item.date,
      regNo: student.regNo,
      studentName: student.name,
      subjectCode: item.subjectCode,
      subjectName: item.subjectName || item.subjectCode,
      section: item.section || student.section,
      year: item.year || student.year,
      status: item.status,
      markedBy: req.user?.name || item.markedBy || 'Faculty',
      period: item.period || 1,
    };

    if (existingIndex >= 0) {
      // Overwrite/edit attendance
      repo.attendance[existingIndex] = fullRecord;
    } else {
      // New attendance log
      repo.attendance.unshift(fullRecord);
    }

    savedRecords.push(fullRecord);
  }

  // Recalculate attendance stats for all affected students and persist
  for (const regNo of affectedStudents) {
    repo.recalculateStudentAttendance(regNo);
    const stu = repo.students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());
    if (stu) {
      await repo.saveStudent(stu);
    }
  }

  await repo.saveAttendanceRecords(savedRecords);

  repo.logAudit(
    'ATTENDANCE_BATCH_SUBMITTED',
    req.user!.email,
    req.user!.role,
    `Marked attendance batch of ${savedRecords.length} records on date ${records[0]?.date || 'today'}`,
    req.ip
  );

  res.json({
    success: true,
    message: `Successfully processed ${savedRecords.length} attendance entries`,
    count: savedRecords.length,
    data: savedRecords,
  });
});

// GET /api/attendance/summary/:regNo - Comprehensive student attendance breakdown
router.get('/summary/:regNo', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { regNo } = req.params;
  const student = repo.students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const studentLogs = repo.attendance.filter((a) => a.regNo.toUpperCase() === regNo.toUpperCase());

  let present = 0;
  let absent = 0;
  let od = 0;

  // Group by subject
  const subjectMap: Record<string, { code: string; name: string; conducted: number; attended: number; od: number }> = {};

  studentLogs.forEach((log) => {
    if (log.status === 'Present') present++;
    else if (log.status === 'Absent') absent++;
    else if (log.status === 'OD') od++;

    if (!subjectMap[log.subjectCode]) {
      subjectMap[log.subjectCode] = {
        code: log.subjectCode,
        name: log.subjectName || log.subjectCode,
        conducted: 0,
        attended: 0,
        od: 0,
      };
    }

    subjectMap[log.subjectCode].conducted++;
    if (log.status === 'Present') subjectMap[log.subjectCode].attended++;
    else if (log.status === 'OD') subjectMap[log.subjectCode].od++;
  });

  const total = studentLogs.length;
  const percentage = total > 0 ? Math.round(((present + od) / total) * 1000) / 10 : 0;

  const subjectBreakdown = Object.values(subjectMap).map((sub) => ({
    ...sub,
    percentage: sub.conducted > 0 ? Math.round(((sub.attended + sub.od) / sub.conducted) * 1000) / 10 : 0,
  }));

  res.json({
    success: true,
    data: {
      regNo: student.regNo,
      name: student.name,
      overall: { present, absent, od, total, percentage, isLowAttendance: percentage < 75 },
      subjects: subjectBreakdown,
      recentLogs: studentLogs.slice(0, 15),
    },
  });
});

export default router;
