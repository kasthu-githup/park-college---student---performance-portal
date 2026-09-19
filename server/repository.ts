import fs from 'fs';
import path from 'path';
import {
  Student,
  Faculty,
  HOD,
  Admin,
  Department,
  Subject,
  AttendanceRecord,
  LeaveRequest,
  Announcement,
  NotificationItem,
  FeeRecord,
  AuditLog,
} from '../src/types';
import {
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_HOD,
  INITIAL_ADMIN,
  INITIAL_DEPARTMENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_FEES,
  INITIAL_AUDIT_LOGS,
  SUBJECT_CATALOG,
  generateInitialAttendanceLogs,
} from '../src/data/initialData';
import {
  getMySqlPool,
  initTiDbSchema,
  syncStudentToTiDb,
  deleteStudentFromTiDb,
  syncAttendanceToTiDb,
  syncFacultyToTiDb,
  syncHodToTiDb,
  syncFeeToTiDb,
  syncAnnouncementToTiDb,
} from './db';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'faculty' | 'hod' | 'admin';
  name: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  createdAt: string;
}

const STORE_PATH = path.join(process.cwd(), 'server', 'data', 'store.json');

class InstitutionalRepository {
  public users: UserAccount[] = [
    {
      id: 'ADM001',
      email: 'kasthuricse23@sasurie.com',
      passwordHash: '$2a$10$w099B0LgqM81b1.6k2vRre9R85YxZ2eN.81M7r2kPq9cM9Gz7R8e6', // kasthu123
      role: 'admin',
      name: 'Kasthuri',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'admin',
      email: 'admin@college.edu',
      passwordHash: '$2a$10$w099B0LgqM81b1.6k2vRre9R85YxZ2eN.81M7r2kPq9cM9Gz7R8e6',
      role: 'admin',
      name: 'Kasthuri',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'FAC001',
      email: 'r.sharma@college.edu',
      passwordHash: 'faculty123',
      role: 'faculty',
      name: 'Dr. R. Sharma',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'HOD001',
      email: 'hod.cse@college.edu',
      passwordHash: 'hod123',
      role: 'hod',
      name: 'Dr. M. Sundararajan',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2023CSE001',
      email: 'aakash.varma@student.college.edu',
      passwordHash: 'student123',
      role: 'student',
      name: 'Aakash Varma',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2023CSE710022104011',
      email: 'vetri@gmail.com',
      passwordHash: 'student123',
      role: 'student',
      name: 'vetri',
      status: 'Active',
      createdAt: '2026-08-27T00:00:00.000Z',
    },
    {
      id: '2023CSE710022104014',
      email: '2023cse710022104014@college.edu',
      passwordHash: 'student123',
      role: 'student',
      name: 'sri',
      status: 'Active',
      createdAt: '2026-08-27T00:00:00.000Z',
    },
    {
      id: '2023CSE710022104015',
      email: '2023cse710022104015@college.edu',
      passwordHash: 'student123',
      role: 'student',
      name: 'keerthi',
      status: 'Active',
      createdAt: '2026-08-27T00:00:00.000Z',
    },
  ];

  public students: Student[] = [...INITIAL_STUDENTS];
  public faculty: Faculty[] = [...INITIAL_FACULTY];
  public hod: HOD = { ...INITIAL_HOD };
  public admin: Admin = { ...INITIAL_ADMIN };
  public departments: Department[] = [...INITIAL_DEPARTMENTS];
  public subjects: Subject[] = [...SUBJECT_CATALOG];
  public attendance: AttendanceRecord[] = generateInitialAttendanceLogs();
  public leaveRequests: LeaveRequest[] = [...INITIAL_LEAVE_REQUESTS];
  public announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];
  public notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  public fees: FeeRecord[] = [...INITIAL_FEES];
  public auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  public settings: Record<string, any> = {
    institutionName: 'Park College of Engineering and Technology',
    autonomousAffiliation: 'Autonomous Institution Affiliated to Anna University, Chennai',
    academicYear: '2026-2027',
    currentSemester: 5,
    attendanceThreshold: 75,
    allowStudentProfileEdit: true,
    allowLeaveSubmission: true,
  };

  constructor() {
    this.loadFromDisk();
    // Automatically attempt to synchronize with TiDB Cloud on startup
    this.loadAllFromTiDb().catch((err) => {
      console.error('[Repository] TiDB initial sync notice:', err.message);
    });
  }

  // Load state from local disk store
  public loadFromDisk(): boolean {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.students && Array.isArray(parsed.students) && parsed.students.length > 0) {
          this.students = parsed.students;
        }
        if (parsed.faculty && Array.isArray(parsed.faculty)) this.faculty = parsed.faculty;
        if (parsed.hod) this.hod = parsed.hod;
        if (parsed.admin) this.admin = parsed.admin;
        if (parsed.departments && Array.isArray(parsed.departments)) this.departments = parsed.departments;
        if (parsed.subjects && Array.isArray(parsed.subjects)) this.subjects = parsed.subjects;
        if (parsed.attendance && Array.isArray(parsed.attendance)) this.attendance = parsed.attendance;
        if (parsed.leaveRequests && Array.isArray(parsed.leaveRequests)) this.leaveRequests = parsed.leaveRequests;
        if (parsed.announcements && Array.isArray(parsed.announcements)) this.announcements = parsed.announcements;
        if (parsed.notifications && Array.isArray(parsed.notifications)) this.notifications = parsed.notifications;
        if (parsed.fees && Array.isArray(parsed.fees)) this.fees = parsed.fees;
        if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) this.auditLogs = parsed.auditLogs;
        if (parsed.settings) this.settings = { ...this.settings, ...parsed.settings };
        if (parsed.users && Array.isArray(parsed.users)) this.users = parsed.users;
        console.log(`[Repository] Successfully loaded persistent store from ${STORE_PATH}`);
        return true;
      }
    } catch (err: any) {
      console.error('[Repository] Failed to load store from disk:', err.message);
    }
    return false;
  }

  // Save current repository state to local disk store
  public saveToDisk(): void {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        users: this.users,
        students: this.students,
        faculty: this.faculty,
        hod: this.hod,
        admin: this.admin,
        departments: this.departments,
        subjects: this.subjects,
        attendance: this.attendance,
        leaveRequests: this.leaveRequests,
        announcements: this.announcements,
        notifications: this.notifications,
        fees: this.fees,
        auditLogs: this.auditLogs,
        settings: this.settings,
        lastSaved: new Date().toISOString(),
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[Repository] Error saving store to disk:', err.message);
    }
  }

  // Synchronize all repository items to TiDB database
  public async syncAllToTiDb(): Promise<{ success: boolean; count: number; message: string }> {
    const pool = getMySqlPool();
    if (!pool) {
      return { success: false, count: 0, message: 'TiDB is not connected. Please provide TIDB_PASSWORD.' };
    }

    try {
      await initTiDbSchema();

      // Sync students
      for (const s of this.students) {
        await syncStudentToTiDb(s);
      }

      // Sync faculty
      for (const f of this.faculty) {
        await syncFacultyToTiDb(f);
      }

      // Sync HOD
      if (this.hod) {
        await syncHodToTiDb(this.hod);
      }

      // Sync Attendance
      if (this.attendance && this.attendance.length > 0) {
        await syncAttendanceToTiDb(this.attendance);
      }

      // Sync Fees
      for (const fee of this.fees) {
        await syncFeeToTiDb(fee);
      }

      // Sync Announcements
      for (const a of this.announcements) {
        await syncAnnouncementToTiDb(a);
      }

      const totalCount = this.students.length + this.faculty.length + this.fees.length + this.announcements.length;
      return {
        success: true,
        count: totalCount,
        message: `Successfully synchronized ${totalCount} records to TiDB Cloud`,
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        message: `TiDB sync failed: ${err.message}`,
      };
    }
  }

  // Load records from TiDB into repository
  public async loadAllFromTiDb(): Promise<boolean> {
    const pool = getMySqlPool();
    if (!pool) return false;

    try {
      const [rows]: any = await pool.query('SELECT * FROM students');
      if (Array.isArray(rows) && rows.length > 0) {
        this.students = rows.map((r: any) => ({
          regNo: r.reg_no,
          id: r.id,
          name: r.name,
          department: r.department,
          year: r.year,
          semester: r.semester,
          section: r.section,
          email: r.email,
          phone: r.phone || '',
          dob: r.dob || '',
          bloodGroup: r.blood_group || 'O+',
          facultyAdvisor: r.faculty_advisor || '',
          mentor: r.mentor || '',
          parentName: r.parent_name || '',
          parentPhone: r.parent_phone || '',
          address: r.address || '',
          cgpa: Number(r.cgpa) || 0,
          currentSemesterGpa: Number(r.current_semester_gpa) || 0,
          subjects: typeof r.subjects === 'string' ? JSON.parse(r.subjects) : r.subjects || [],
          marks: typeof r.marks === 'string' ? JSON.parse(r.marks) : r.marks || {},
          assignments: typeof r.assignments === 'string' ? JSON.parse(r.assignments) : r.assignments || [],
          overallAttendance: typeof r.overall_attendance === 'string' ? JSON.parse(r.overall_attendance) : r.overall_attendance || {},
          subjectAttendance: typeof r.subject_attendance === 'string' ? JSON.parse(r.subject_attendance) : r.subject_attendance || [],
          performanceRating: r.performance_rating || 'Good',
          facultyRemarks: r.faculty_remarks || '',
          mentorNotes: typeof r.mentor_notes === 'string' ? JSON.parse(r.mentor_notes) : r.mentor_notes || [],
          avatar: r.avatar || '',
          accountStatus: r.account_status || 'Active',
        }));
        this.saveToDisk();
        console.log(`[Repository] Loaded ${this.students.length} students from TiDB Cloud`);
        return true;
      }
    } catch (err: any) {
      console.error('[Repository] Error loading from TiDB:', err.message);
    }
    return false;
  }

  // Mutator: Student
  public async saveStudent(student: Student): Promise<void> {
    const idx = this.students.findIndex((s) => s.regNo.toUpperCase() === student.regNo.toUpperCase());
    if (idx >= 0) {
      this.students[idx] = { ...this.students[idx], ...student };
    } else {
      this.students.push(student);
    }
    this.saveToDisk();
    await syncStudentToTiDb(student);
  }

  public async deleteStudent(regNo: string): Promise<void> {
    this.students = this.students.filter((s) => s.regNo.toUpperCase() !== regNo.toUpperCase());
    this.saveToDisk();
    await deleteStudentFromTiDb(regNo);
  }

  // Mutator: Attendance
  public async saveAttendanceRecords(records: AttendanceRecord[]): Promise<void> {
    for (const rec of records) {
      const existingIdx = this.attendance.findIndex((a) => a.id === rec.id || (a.regNo === rec.regNo && a.date === rec.date && a.subjectCode === rec.subjectCode));
      if (existingIdx >= 0) {
        this.attendance[existingIdx] = rec;
      } else {
        this.attendance.push(rec);
      }
      this.recalculateStudentAttendance(rec.regNo);
    }
    this.saveToDisk();
    await syncAttendanceToTiDb(records);
  }

  // Mutator: Faculty
  public async saveFaculty(faculty: Faculty): Promise<void> {
    const idx = this.faculty.findIndex((f) => f.id === faculty.id);
    if (idx >= 0) {
      this.faculty[idx] = { ...this.faculty[idx], ...faculty };
    } else {
      this.faculty.push(faculty);
    }
    this.saveToDisk();
    await syncFacultyToTiDb(faculty);
  }

  // Mutator: HOD
  public async saveHod(hod: HOD): Promise<void> {
    this.hod = { ...this.hod, ...hod };
    this.saveToDisk();
    await syncHodToTiDb(this.hod);
  }

  // Mutator: Fees
  public async saveFee(fee: FeeRecord): Promise<void> {
    const idx = this.fees.findIndex((f) => f.id === fee.id);
    if (idx >= 0) {
      this.fees[idx] = { ...this.fees[idx], ...fee };
    } else {
      this.fees.push(fee);
    }
    this.saveToDisk();
    await syncFeeToTiDb(fee);
  }

  // Mutator: Announcement
  public async saveAnnouncement(a: Announcement): Promise<void> {
    const idx = this.announcements.findIndex((item) => item.id === a.id);
    if (idx >= 0) {
      this.announcements[idx] = a;
    } else {
      this.announcements.unshift(a);
    }
    this.saveToDisk();
    await syncAnnouncementToTiDb(a);
  }

  public async deleteAnnouncement(id: string): Promise<void> {
    this.announcements = this.announcements.filter((a) => a.id !== id);
    this.saveToDisk();
  }

  // Add structured audit log
  public logAudit(action: string, performedBy: string, role: string, details: string, ip = '127.0.0.1') {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      performedBy,
      userRole: role,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: ip,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    this.saveToDisk();
    return log;
  }

  // Recalculate student attendance percentage from attendance records
  public recalculateStudentAttendance(regNo: string) {
    const student = this.students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());
    if (!student) return;

    const studentLogs = this.attendance.filter((a) => a.regNo.toUpperCase() === regNo.toUpperCase());
    if (studentLogs.length === 0) return;

    let present = 0;
    let absent = 0;
    let od = 0;

    studentLogs.forEach((rec) => {
      if (rec.status === 'Present') present++;
      else if (rec.status === 'Absent') absent++;
      else if (rec.status === 'OD') od++;
    });

    const total = studentLogs.length;
    const effectiveAttended = present + od;
    const percentage = total > 0 ? Math.round((effectiveAttended / total) * 1000) / 10 : 0;

    student.overallAttendance = {
      present,
      absent,
      od,
      total,
      percentage,
    };
  }
}

export const repo = new InstitutionalRepository();
