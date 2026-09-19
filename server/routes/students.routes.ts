import { Router, Response } from 'express';
import { repo } from '../repository';
import { Student, MentorMeetingNote } from '../../src/types';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/students - Search, filter, and paginate students
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { department, year, section, semester, search, page = 1, limit = 50 } = req.query;

  let list = [...repo.students];

  if (department && department !== 'all') {
    list = list.filter((s) => s.department.toLowerCase() === String(department).toLowerCase());
  }

  if (year && year !== 'all') {
    list = list.filter((s) => s.year === Number(year));
  }

  if (section && section !== 'all') {
    list = list.filter((s) => s.section.toUpperCase() === String(section).toUpperCase());
  }

  if (semester && semester !== 'all') {
    list = list.filter((s) => s.semester === Number(semester));
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (s) =>
        s.regNo.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = list.slice(startIndex, startIndex + limitNum);

  // Return list with pagination meta
  res.json({
    success: true,
    data: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// GET /api/students/:regNo - Single student details
router.get('/:regNo', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { regNo } = req.params;
  const student = repo.students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, message: `Student ${regNo} not found` });
  }

  res.json({ success: true, data: student });
});

// POST /api/students - Add new student (Admin & HOD)
router.post('/', requireAuth, requireRole('admin', 'hod'), async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as Partial<Student>;

  if (!data.regNo || !data.name || !data.department || !data.email) {
    return res.status(400).json({
      success: false,
      message: 'Registration Number, Name, Department, and Email are required fields',
    });
  }

  const existing = repo.students.find((s) => s.regNo.toUpperCase() === data.regNo!.toUpperCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      message: `Student with Register Number ${data.regNo} already exists`,
    });
  }

  const newStudent: Student = {
    id: data.id || `STU-${data.regNo}`,
    regNo: data.regNo.toUpperCase(),
    name: data.name,
    department: data.department,
    year: Number(data.year) || 3,
    semester: Number(data.semester) || 5,
    section: (data.section as 'A' | 'B') || 'A',
    email: data.email,
    phone: data.phone || '',
    dob: data.dob || '2004-01-01',
    bloodGroup: data.bloodGroup || 'O+',
    facultyAdvisor: data.facultyAdvisor || 'Dr. R. Sharma',
    mentor: data.mentor || 'Dr. R. Sharma',
    parentName: data.parentName || '',
    parentPhone: data.parentPhone || '',
    address: data.address || '',
    cgpa: Number(data.cgpa) || 0.0,
    currentSemesterGpa: Number(data.currentSemesterGpa) || 0.0,
    subjects: data.subjects || ['CS8501', 'CS8591', 'CS8592', 'EC8691'],
    marks: data.marks || {},
    assignments: data.assignments || [],
    overallAttendance: data.overallAttendance || {
      present: 0,
      absent: 0,
      od: 0,
      total: 0,
      percentage: 0,
    },
    subjectAttendance: data.subjectAttendance || {},
    performanceRating: data.performanceRating || 'Good',
    facultyRemarks: data.facultyRemarks || 'Newly enrolled autonomous student record.',
    mentorNotes: data.mentorNotes || [],
    accountStatus: 'Active',
  };

  await repo.saveStudent(newStudent);

  // Also create user login entry
  repo.users.push({
    id: newStudent.regNo,
    name: newStudent.name,
    email: newStudent.email,
    role: 'student',
    status: 'Active',
    passwordHash: 'student123',
    createdAt: new Date().toISOString(),
  });
  repo.saveToDisk();

  repo.logAudit(
    'STUDENT_CREATED',
    req.user?.email || 'Admin',
    req.user?.role || 'admin',
    `Enrolled student ${newStudent.name} (${newStudent.regNo}) in ${newStudent.department}`,
    req.ip
  );

  res.status(201).json({ success: true, message: 'Student registered successfully', data: newStudent });
});

// PUT /api/students/:regNo - Update student profile
router.put('/:regNo', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { regNo } = req.params;
  const student = repo.students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Authorization check: student can update their own phone, address; faculty/hod/admin can update full
  const caller = req.user!;
  const isSelf = caller.role === 'student' && caller.id.toUpperCase() === regNo.toUpperCase();
  const isStaff = ['admin', 'hod', 'faculty'].includes(caller.role);

  if (!isSelf && !isStaff) {
    return res.status(403).json({ success: false, message: 'Unauthorized to modify this student profile' });
  }

  const updates = req.body;
  if (isSelf && !isStaff) {
    // Restrict student self-edit to allowed contact fields
    if (updates.phone !== undefined) student.phone = updates.phone;
    if (updates.address !== undefined) student.address = updates.address;
    if (updates.bloodGroup !== undefined) student.bloodGroup = updates.bloodGroup;
    if (updates.parentPhone !== undefined) student.parentPhone = updates.parentPhone;
  } else {
    // Staff can update academic and full profile fields
    Object.assign(student, updates);
  }

  await repo.saveStudent(student);

  repo.logAudit(
    'STUDENT_UPDATED',
    caller.email,
    caller.role,
    `Updated student record ${student.regNo} (${student.name})`,
    req.ip
  );

  res.json({ success: true, message: 'Student profile updated successfully', data: student });
});

// DELETE /api/students/:regNo - Delete student record (Admin only)
router.delete('/:regNo', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { regNo } = req.params;
  const student = repo.students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  await repo.deleteStudent(regNo);

  // Remove corresponding user login
  const uIdx = repo.users.findIndex((u) => u.id.toUpperCase() === regNo.toUpperCase());
  if (uIdx !== -1) {
    repo.users.splice(uIdx, 1);
    repo.saveToDisk();
  }

  repo.logAudit(
    'STUDENT_DELETED',
    req.user!.email,
    'admin',
    `De-registered student ${student.name} (${student.regNo})`,
    req.ip
  );

  res.json({ success: true, message: 'Student removed from institutional register' });
});

// POST /api/students/:regNo/mentor-notes - Add mentoring counseling note
router.post('/:regNo/mentor-notes', requireAuth, requireRole('admin', 'hod', 'faculty'), async (req: AuthenticatedRequest, res: Response) => {
  const { regNo } = req.params;
  const student = repo.students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const noteData = req.body;
  if (!noteData.discussionSummary) {
    return res.status(400).json({ success: false, message: 'Discussion summary is mandatory' });
  }

  const newNote: MentorMeetingNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: noteData.date || new Date().toISOString().split('T')[0],
    regNo: student.regNo,
    studentName: student.name,
    mentorName: req.user!.name,
    category: noteData.category || 'Academic Performance',
    topics: noteData.topics || '',
    discussionSummary: noteData.discussionSummary,
    actionPlan: noteData.actionPlan || '',
    followUpDate: noteData.followUpDate || '',
  };

  if (!student.mentorNotes) student.mentorNotes = [];
  student.mentorNotes.unshift(newNote);
  await repo.saveStudent(student);

  repo.logAudit(
    'MENTOR_NOTE_ADDED',
    req.user!.email,
    req.user!.role,
    `Added counseling note for student ${student.regNo}`,
    req.ip
  );

  res.status(201).json({ success: true, message: 'Mentoring note logged', data: newNote });
});

// PUT /api/students/:regNo/performance - Update performance rating and remarks
router.put('/:regNo/performance', requireAuth, requireRole('admin', 'hod', 'faculty'), async (req: AuthenticatedRequest, res: Response) => {
  const { regNo } = req.params;
  const { rating, remarks } = req.body;

  const student = repo.students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  if (rating) student.performanceRating = rating;
  if (remarks !== undefined) student.facultyRemarks = remarks;
  await repo.saveStudent(student);

  repo.logAudit(
    'PERFORMANCE_UPDATED',
    req.user!.email,
    req.user!.role,
    `Updated performance appraisal for ${student.regNo}: Rating=${rating}`,
    req.ip
  );

  res.json({ success: true, message: 'Performance appraisal updated', data: student });
});

export default router;
