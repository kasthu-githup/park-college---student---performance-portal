export type UserRole = 'student' | 'faculty' | 'hod' | 'admin';

export type AttendanceStatus = 'Present' | 'Absent' | 'OD';

export interface Subject {
  code: string;
  name: string;
  facultyName: string;
  credits: number;
  semester: number;
  department?: string;
  syllabusUrl?: string;
}

export interface SubjectMarks {
  subjectCode: string;
  subjectName: string;
  internal1: number; // Max 50
  internal2: number; // Max 50
  modelExam: number; // Max 100
  assignment: number; // Max 10
  totalPercentage: number;
  grade: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  dueDate: string;
  status: 'Submitted' | 'Pending' | 'Graded' | 'Late';
  score?: number;
  maxScore: number;
  submittedOn?: string;
  description?: string;
  instructions?: string;
  fileAttachment?: string;
}

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  conducted: number;
  attended: number;
  od: number;
  percentage: number;
}

export interface MentorMeetingNote {
  id: string;
  date: string;
  regNo: string;
  studentName?: string;
  facultyName?: string;
  mentorName?: string;
  facultyId?: string;
  category?: 'Academic Performance' | 'Attendance Defaulter' | 'Attendance Shortage' | 'Career Guidance' | 'Personal Counseling' | 'Personal Well-being' | 'OD / Symposium Approval' | 'Disciplinary' | string;
  topics?: string;
  discussionSummary: string;
  actionTaken?: string;
  actionPlan?: string;
  nextReviewDate?: string;
  followUpDate?: string;
}

export interface LeaveRequest {
  id: string;
  studentRegNo: string;
  studentName: string;
  department: string;
  year: number;
  section: 'A' | 'B';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  type: 'Medical' | 'On-Duty (OD)' | 'Personal' | 'Symposium / Conference';
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  reviewedBy?: string;
  reviewedOn?: string;
  reviewerComments?: string;
  documentUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: 'faculty' | 'hod' | 'admin';
  targetAudience: 'All' | 'Students' | 'Faculty' | 'Section A' | 'Section B' | 'Year 3';
  priority: 'Normal' | 'High' | 'Urgent';
  date: string;
  category: 'Academic' | 'Exam' | 'Placement' | 'Symposium' | 'General';
  expiresOn?: string;
}

export interface NotificationItem {
  id: string;
  targetRole?: UserRole | 'all';
  targetUserId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface FeeRecord {
  id: string;
  studentRegNo: string;
  studentName: string;
  academicYear: string;
  semester: number;
  tuitionFee: number;
  developmentFee: number;
  examFee: number;
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  status: 'Paid' | 'Partial' | 'Pending';
  noDueApproved: boolean;
  lastPaymentDate?: string;
  receiptNumber?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  userRole: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  hodName: string;
  hodEmail: string;
  hodPhone?: string;
  hodPassword?: string;
  hodId?: string;
  totalStudents: number;
  totalFaculty: number;
  establishedYear: number;
}

export interface ExamSchedule {
  id: string;
  subjectCode: string;
  subjectName: string;
  date: string;
  time: string;
  session: 'FN (09:30 AM - 12:30 PM)' | 'AN (01:30 PM - 04:30 PM)';
  hall: string;
  examType: 'Internal Assessment 1' | 'Internal Assessment 2' | 'Model Exam' | 'End Semester Autonomous';
}

export interface Student {
  id: string;
  regNo: string;
  name: string;
  department: string;
  year: number;
  semester: number;
  section: 'A' | 'B';
  email: string;
  phone: string;
  dob: string;
  bloodGroup: string;
  facultyAdvisor: string;
  mentor: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  cgpa: number;
  currentSemesterGpa: number;
  subjects: string[]; // Subject codes
  marks: Record<string, SubjectMarks>; // key: subjectCode
  assignments: AssignmentItem[];
  overallAttendance: {
    present: number;
    absent: number;
    od: number;
    total: number;
    percentage: number;
  };
  subjectAttendance: Record<string, SubjectAttendance>;
  performanceRating: 'Outstanding' | 'Good' | 'Average' | 'Needs Attention';
  facultyRemarks: string;
  mentorNotes?: MentorMeetingNote[];
  avatar?: string;
  accountStatus?: 'Active' | 'Inactive';
  password?: string;
}

export interface AssignedClass {
  subjectCode: string;
  subjectName: string;
  year: number;
  semester: number;
  section: 'A' | 'B';
  totalStudents: number;
}

export interface Faculty {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  cabin: string;
  qualification?: string;
  officeHours?: string;
  specialization?: string;
  bio?: string;
  assignedMenteeSection?: 'A' | 'B';
  assignedClasses: AssignedClass[];
  avatar?: string;
  password?: string;
  // Comprehensive Academic & Professional Dossier
  experienceYears?: number;
  doj?: string; // Date of Joining
  gender?: 'Male' | 'Female' | 'Other';
  ugDegree?: string;
  pgDegree?: string;
  phdDegree?: string;
  publicationsCount?: number;
  patentsCount?: number;
  conferencesCount?: number;
  areasOfInterest?: string;
  awards?: string;
  address?: string;
  emergencyContact?: string;
  linkedin?: string;
  accountStatus?: 'Active' | 'Inactive';
}

export interface HOD {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  cabin: string;
  qualification?: string;
  officeHours?: string;
  specialization?: string;
  message?: string;
  avatar?: string;
  accountStatus?: 'Active' | 'Inactive';
  password?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin';
  department: string;
  designation: string;
  avatar?: string;
  lastLogin?: string;
  password?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  regNo: string;
  studentName: string;
  subjectCode: string;
  subjectName: string;
  section: 'A' | 'B';
  year: number;
  status: AttendanceStatus;
  markedBy: string;
  period?: number;
}

export type CurrentUser = 
  | { role: 'student'; data: Student }
  | { role: 'faculty'; data: Faculty }
  | { role: 'hod'; data: HOD }
  | { role: 'admin'; data: Admin };
