import { Router, Response } from 'express';
import { repo } from '../repository';
import { SubjectMarks } from '../../src/types';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Helper to compute grade from percentage
function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'O';
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B+';
  if (percentage >= 50) return 'B';
  return 'RA';
}

// PUT /api/marks/:regNo/:subjectCode - Update subject marks with strict range validation
router.put('/:regNo/:subjectCode', requireAuth, requireRole('admin', 'hod', 'faculty'), async (req: AuthenticatedRequest, res: Response) => {
  const { regNo, subjectCode } = req.params;
  const { internal1, internal2, modelExam, assignment } = req.body;

  const student = repo.students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Strict marks range validations
  if (internal1 !== undefined && (internal1 < 0 || internal1 > 50)) {
    return res.status(400).json({ success: false, message: 'Internal Assessment 1 marks must be between 0 and 50' });
  }

  if (internal2 !== undefined && (internal2 < 0 || internal2 > 50)) {
    return res.status(400).json({ success: false, message: 'Internal Assessment 2 marks must be between 0 and 50' });
  }

  if (modelExam !== undefined && (modelExam < 0 || modelExam > 100)) {
    return res.status(400).json({ success: false, message: 'Model Examination marks must be between 0 and 100' });
  }

  if (assignment !== undefined && (assignment < 0 || assignment > 10)) {
    return res.status(400).json({ success: false, message: 'Assignment marks must be between 0 and 10' });
  }

  if (!student.marks) {
    student.marks = {};
  }

  const existingMarks: SubjectMarks = student.marks[subjectCode] || {
    subjectCode,
    subjectName: subjectCode,
    internal1: 0,
    internal2: 0,
    modelExam: 0,
    assignment: 0,
    totalPercentage: 0,
    grade: 'RA',
  };

  const updatedInternal1 = internal1 !== undefined ? Number(internal1) : existingMarks.internal1;
  const updatedInternal2 = internal2 !== undefined ? Number(internal2) : existingMarks.internal2;
  const updatedModel = modelExam !== undefined ? Number(modelExam) : existingMarks.modelExam;
  const updatedAssignment = assignment !== undefined ? Number(assignment) : existingMarks.assignment;

  // Formula: internal1 (50) + internal2 (50) + model (100) + assignment (10) = 210 total
  // Or scaled standard: internal average (20) + model scaled (70) + assignment (10) = 100%
  const internalAvg = (updatedInternal1 + updatedInternal2) / 2; // out of 50
  const scaledInternal = (internalAvg / 50) * 20; // 20%
  const scaledModel = (updatedModel / 100) * 70; // 70%
  const scaledAssignment = (updatedAssignment / 10) * 10; // 10%
  const totalPercentage = Math.round((scaledInternal + scaledModel + scaledAssignment) * 10) / 10;
  const grade = calculateGrade(totalPercentage);

  student.marks[subjectCode] = {
    ...existingMarks,
    internal1: updatedInternal1,
    internal2: updatedInternal2,
    modelExam: updatedModel,
    assignment: updatedAssignment,
    totalPercentage,
    grade,
  };

  // Recalculate Semester GPA & CGPA
  const allMarks = Object.values(student.marks);
  if (allMarks.length > 0) {
    const sumGpa = allMarks.reduce((acc, m) => {
      let pt = 0;
      if (m.grade === 'O') pt = 10;
      else if (m.grade === 'A+') pt = 9;
      else if (m.grade === 'A') pt = 8;
      else if (m.grade === 'B+') pt = 7;
      else if (m.grade === 'B') pt = 6;
      return acc + pt;
    }, 0);
    student.currentSemesterGpa = Math.round((sumGpa / allMarks.length) * 100) / 100;
  }

  await repo.saveStudent(student);

  repo.logAudit(
    'MARKS_UPDATED',
    req.user!.email,
    req.user!.role,
    `Updated marks for ${student.regNo} in ${subjectCode}: Internal1=${updatedInternal1}, Internal2=${updatedInternal2}, Grade=${grade}`,
    req.ip
  );

  res.json({
    success: true,
    message: 'Academic marks updated successfully',
    data: student.marks[subjectCode],
    student: {
      regNo: student.regNo,
      currentSemesterGpa: student.currentSemesterGpa,
      cgpa: student.cgpa,
    },
  });
});

// PUT /api/assignments/:regNo/:assignmentId - Update assignment status and grading
router.put('/assignment/:regNo/:assignmentId', requireAuth, requireRole('admin', 'hod', 'faculty'), async (req: AuthenticatedRequest, res: Response) => {
  const { regNo, assignmentId } = req.params;
  const { status, score } = req.body;

  const student = repo.students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const assignment = student.assignments.find((a) => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ success: false, message: 'Assignment not found' });
  }

  if (status) assignment.status = status;
  if (score !== undefined) {
    if (score < 0 || score > assignment.maxScore) {
      return res.status(400).json({ success: false, message: `Score must be between 0 and ${assignment.maxScore}` });
    }
    assignment.score = Number(score);
  }

  await repo.saveStudent(student);

  repo.logAudit(
    'ASSIGNMENT_EVALUATED',
    req.user!.email,
    req.user!.role,
    `Evaluated assignment ${assignment.title} for ${student.regNo}: Status=${status}, Score=${score}`,
    req.ip
  );

  res.json({ success: true, message: 'Assignment evaluated', data: assignment });
});

export default router;
