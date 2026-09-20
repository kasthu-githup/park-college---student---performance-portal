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
  deleteAttendanceFromTiDb,
  syncFacultyToTiDb,
  deleteFacultyFromTiDb,
  syncHodToTiDb,
  syncFeeToTiDb,
  deleteFeeFromTiDb,
  syncAnnouncementToTiDb,
  deleteAnnouncementFromTiDb,
  syncUserToTiDb,
  deleteUserFromTiDb,
  syncLeaveToTiDb,
  deleteLeaveFromTiDb,
  syncDepartmentToTiDb,
  deleteDepartmentFromTiDb,
  syncSubjectToTiDb,
  deleteSubjectFromTiDb,
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

  // Load persistent store: disabled (direct TiDB Cloud mode active)
  public loadFromDisk(): boolean {
    return false;
  }

  // Save current repository state to local disk store: disabled (direct TiDB Cloud persistence active)
  public saveToDisk(): void {
    // No-op: All operations are executed directly against TiDB Cloud database
  }

  // Synchronize all repository items to TiDB database
  public async syncAllToTiDb(): Promise<{ success: boolean; count: number; message: string }> {
    const pool = getMySqlPool();
    if (!pool) {
      return { success: false, count: 0, message: 'TiDB is not connected. Please provide TIDB_PASSWORD.' };
    }

    try {
      await initTiDbSchema();

      // Sync users
      for (const u of this.users) {
        await syncUserToTiDb(u);
      }

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
      // 1. Students
      try {
        const [rows]: any = await pool.query('SELECT * FROM students');
        if (Array.isArray(rows) && rows.length > 0) {
          this.students = rows.map((r: any) => ({
            regNo: r.reg_no,
            id: r.id || r.reg_no,
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
          console.log(`[Repository] Loaded ${this.students.length} students from TiDB Cloud`);
        }
      } catch (e: any) {
        console.warn('[Repository] Students load error:', e.message);
      }

      // 2. Faculty
      try {
        const [fRows]: any = await pool.query('SELECT * FROM faculty');
        if (Array.isArray(fRows) && fRows.length > 0) {
          this.faculty = fRows.map((r: any) => ({
            id: r.id,
            name: r.name,
            designation: r.designation,
            department: r.department,
            email: r.email,
            phone: r.phone || '',
            cabin: r.cabin || '',
            qualification: r.qualification || '',
            officeHours: r.office_hours || '',
            specialization: r.specialization || '',
            bio: r.bio || '',
            assignedMenteeSection: r.assigned_mentee_section || 'A',
            assignedClasses: typeof r.assigned_classes === 'string' ? JSON.parse(r.assigned_classes) : r.assigned_classes || [],
            accountStatus: r.account_status || 'Active',
          }));
          console.log(`[Repository] Loaded ${this.faculty.length} faculty from TiDB Cloud`);
        }
      } catch (e: any) {
        console.warn('[Repository] Faculty load error:', e.message);
      }

      // 3. HOD
      try {
        const [hRows]: any = await pool.query('SELECT * FROM hod LIMIT 1');
        if (Array.isArray(hRows) && hRows.length > 0) {
          const r = hRows[0];
          this.hod = {
            id: r.id,
            name: r.name,
            designation: r.designation,
            department: r.department,
            email: r.email,
            phone: r.phone || '',
            cabin: r.cabin || '',
            qualification: r.qualification || '',
            officeHours: r.office_hours || '',
            specialization: r.specialization || r.department || '',
            message: r.bio || r.message || '',
            accountStatus: r.account_status || 'Active',
          };
          console.log(`[Repository] Loaded HOD ${this.hod.name} from TiDB Cloud`);
        }
      } catch (e: any) {
        console.warn('[Repository] HOD load error:', e.message);
      }

      // 4. Attendance
      try {
        const [attRows]: any = await pool.query('SELECT * FROM attendance_records ORDER BY date DESC, id DESC LIMIT 500');
        if (Array.isArray(attRows) && attRows.length > 0) {
          this.attendance = attRows.map((r: any) => ({
            id: r.id,
            regNo: r.reg_no,
            studentName: r.student_name || '',
            subjectCode: r.subject_code,
            subjectName: r.subject_name || '',
            section: r.section || 'A',
            year: r.year || 3,
            date: r.date,
            period: r.period || 1,
            status: r.status,
            markedBy: r.marked_by || 'Faculty',
          }));
          console.log(`[Repository] Loaded ${this.attendance.length} attendance records from TiDB Cloud`);
        }
      } catch (e: any) {
        console.warn('[Repository] Attendance load error:', e.message);
      }

      // 5. Fees
      try {
        const [feeRows]: any = await pool.query('SELECT * FROM fees');
        if (Array.isArray(feeRows) && feeRows.length > 0) {
          this.fees = feeRows.map((r: any) => {
            const total = Number(r.total_fee) || 0;
            const paid = Number(r.paid_amount) || 0;
            const due = Number(r.due_amount) || Math.max(0, total - paid);
            return {
              id: r.id,
              studentRegNo: r.student_reg_no,
              studentName: r.student_name,
              academicYear: r.academic_year || '2025-2026',
              semester: Number(r.semester) || 5,
              tuitionFee: Number(r.tuition_fee) || Math.round(total * 0.7),
              developmentFee: Number(r.development_fee) || Math.round(total * 0.2),
              examFee: Number(r.exam_fee) || Math.round(total * 0.1),
              totalFee: total,
              paidAmount: paid,
              dueAmount: due,
              status: (r.status as 'Paid' | 'Partial' | 'Pending') || (due === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending'),
              noDueApproved: Boolean(r.no_due_approved),
              receiptNumber: r.receipt_number || '',
              lastPaymentDate: r.last_payment_date || '',
            };
          });
          console.log(`[Repository] Loaded ${this.fees.length} fee records from TiDB Cloud`);
        }
      } catch (e: any) {
        console.warn('[Repository] Fees load error:', e.message);
      }

      // 6. Announcements
      try {
        const [annRows]: any = await pool.query('SELECT * FROM announcements ORDER BY date DESC, id DESC');
        if (Array.isArray(annRows) && annRows.length > 0) {
          this.announcements = annRows.map((r: any) => ({
            id: r.id,
            title: r.title,
            content: r.content,
            author: r.author || 'Dean Academic',
            authorRole: r.author_role || 'admin',
            targetAudience: r.target_audience || 'All',
            priority: r.priority || 'Normal',
            date: r.date,
            category: r.category || 'Academic',
          }));
          console.log(`[Repository] Loaded ${this.announcements.length} announcements from TiDB Cloud`);
        }
      } catch (e: any) {
        console.warn('[Repository] Announcements load error:', e.message);
      }

      // 7. Leave Requests
      try {
        const [lrRows]: any = await pool.query('SELECT * FROM leave_requests ORDER BY applied_on DESC');
        if (Array.isArray(lrRows) && lrRows.length > 0) {
          this.leaveRequests = lrRows.map((r: any) => ({
            id: r.id,
            studentRegNo: r.student_reg_no,
            studentName: r.student_name,
            department: r.department,
            year: r.year,
            section: r.section,
            startDate: r.start_date,
            endDate: r.end_date,
            daysCount: r.days_count,
            reason: r.reason,
            type: r.type,
            status: r.status,
            appliedOn: r.applied_on,
            reviewedBy: r.reviewed_by,
            reviewedOn: r.reviewed_on,
            reviewerComments: r.reviewer_comments,
          }));
          console.log(`[Repository] Loaded ${this.leaveRequests.length} leave requests from TiDB Cloud`);
        }
      } catch (e: any) {
        console.warn('[Repository] Leave requests load error:', e.message);
      }

      // 8. Departments
      try {
        const [dRows]: any = await pool.query('SELECT * FROM departments');
        if (Array.isArray(dRows) && dRows.length > 0) {
          this.departments = dRows.map((r: any) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            hodName: r.hod_name || '',
            hodEmail: r.hod_email || '',
            totalStudents: r.total_students || 0,
            totalFaculty: r.total_faculty || 0,
            establishedYear: r.established_year || 2000,
          }));
          console.log(`[Repository] Loaded ${this.departments.length} departments from TiDB Cloud`);
        }
      } catch (e: any) {
        console.warn('[Repository] Departments load error:', e.message);
      }

      // 9. Subjects
      try {
        const [subRows]: any = await pool.query('SELECT * FROM subjects');
        if (Array.isArray(subRows) && subRows.length > 0) {
          this.subjects = subRows.map((r: any) => ({
            code: r.code,
            name: r.name,
            facultyName: r.faculty_name || '',
            credits: r.credits || 3,
            semester: r.semester || 5,
            department: r.department || '',
          }));
          console.log(`[Repository] Loaded ${this.subjects.length} subjects from TiDB Cloud`);
        }
      } catch (e: any) {
        console.warn('[Repository] Subjects load error:', e.message);
      }

      // 10. Users
      try {
        const [uRows]: any = await pool.query('SELECT * FROM users');
        if (Array.isArray(uRows) && uRows.length > 0) {
          for (const u of uRows) {
            const existingIdx = this.users.findIndex((usr) => usr.id.toLowerCase() === u.id.toLowerCase());
            const userObj = {
              id: u.id,
              email: u.email,
              passwordHash: u.password_hash,
              role: u.role,
              name: u.name,
              status: u.status || 'Active',
              createdAt: u.created_at || new Date().toISOString(),
            };
            if (existingIdx >= 0) {
              this.users[existingIdx] = userObj;
            } else {
              this.users.push(userObj);
            }
          }
          console.log(`[Repository] Loaded ${uRows.length} users from TiDB Cloud`);
        }
      } catch (e: any) {
        console.warn('[Repository] Users load error:', e.message);
      }

      this.saveToDisk();
      return true;
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
    await syncUserToTiDb({
      id: student.regNo,
      email: student.email,
      passwordHash: 'student123',
      role: 'student',
      name: student.name,
      status: student.accountStatus || 'Active',
    });
  }

  public async deleteStudent(regNo: string): Promise<void> {
    this.students = this.students.filter((s) => s.regNo.toUpperCase() !== regNo.toUpperCase());
    this.users = this.users.filter((u) => u.id.toUpperCase() !== regNo.toUpperCase());
    this.saveToDisk();
    await deleteStudentFromTiDb(regNo);
    await deleteUserFromTiDb(regNo);
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

  public async deleteAttendanceRecord(id: string): Promise<void> {
    const rec = this.attendance.find((a) => a.id === id);
    this.attendance = this.attendance.filter((a) => a.id !== id);
    if (rec) {
      this.recalculateStudentAttendance(rec.regNo);
    }
    this.saveToDisk();
    await deleteAttendanceFromTiDb(id);
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
    await syncUserToTiDb({
      id: faculty.id,
      email: faculty.email,
      passwordHash: 'faculty123',
      role: 'faculty',
      name: faculty.name,
      status: faculty.accountStatus || 'Active',
    });
  }

  public async deleteFaculty(id: string): Promise<void> {
    this.faculty = this.faculty.filter((f) => f.id !== id);
    this.users = this.users.filter((u) => u.id !== id);
    this.saveToDisk();
    await deleteFacultyFromTiDb(id);
    await deleteUserFromTiDb(id);
  }

  // Mutator: HOD
  public async saveHod(hod: HOD): Promise<void> {
    this.hod = { ...this.hod, ...hod };
    this.saveToDisk();
    await syncHodToTiDb(this.hod);
    await syncUserToTiDb({
      id: hod.id,
      email: hod.email,
      passwordHash: 'hod123',
      role: 'hod',
      name: hod.name,
      status: hod.accountStatus || 'Active',
    });
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

  public async deleteFee(id: string): Promise<void> {
    this.fees = this.fees.filter((f) => f.id !== id);
    this.saveToDisk();
    await deleteFeeFromTiDb(id);
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
    await deleteAnnouncementFromTiDb(id);
  }

  // Mutator: Leave Requests
  public async saveLeave(leave: LeaveRequest): Promise<void> {
    const idx = this.leaveRequests.findIndex((l) => l.id === leave.id);
    if (idx >= 0) {
      this.leaveRequests[idx] = leave;
    } else {
      this.leaveRequests.unshift(leave);
    }
    this.saveToDisk();
    await syncLeaveToTiDb(leave);
  }

  public async deleteLeave(id: string): Promise<void> {
    this.leaveRequests = this.leaveRequests.filter((l) => l.id !== id);
    this.saveToDisk();
    await deleteLeaveFromTiDb(id);
  }

  // Mutator: Departments
  public async saveDepartment(dept: Department): Promise<void> {
    const idx = this.departments.findIndex((d) => d.id === dept.id || d.code === dept.code);
    if (idx >= 0) {
      this.departments[idx] = dept;
    } else {
      this.departments.push(dept);
    }
    this.saveToDisk();
    await syncDepartmentToTiDb(dept);
  }

  public async deleteDepartment(id: string): Promise<void> {
    this.departments = this.departments.filter((d) => d.id !== id && d.code !== id);
    this.saveToDisk();
    await deleteDepartmentFromTiDb(id);
  }

  // Mutator: Subjects
  public async saveSubject(subject: Subject): Promise<void> {
    const idx = this.subjects.findIndex((s) => s.code === subject.code);
    if (idx >= 0) {
      this.subjects[idx] = subject;
    } else {
      this.subjects.push(subject);
    }
    this.saveToDisk();
    await syncSubjectToTiDb(subject);
  }

  public async deleteSubject(code: string): Promise<void> {
    this.subjects = this.subjects.filter((s) => s.code !== code);
    this.saveToDisk();
    await deleteSubjectFromTiDb(code);
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
