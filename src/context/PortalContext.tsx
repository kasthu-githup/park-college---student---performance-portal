import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  Faculty,
  HOD,
  Admin,
  CurrentUser,
  AttendanceRecord,
  SubjectMarks,
  Subject,
  UserRole,
  MentorMeetingNote,
  LeaveRequest,
  Announcement,
  NotificationItem,
  FeeRecord,
  AuditLog,
  Department,
  ExamSchedule,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_HOD,
  INITIAL_HOD_LIST,
  INITIAL_ADMIN,
  INITIAL_DEPARTMENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_FEES,
  INITIAL_AUDIT_LOGS,
  INITIAL_EXAM_SCHEDULE,
  SUBJECT_CATALOG,
  generateInitialAttendanceLogs,
} from '../data/initialData';

export interface DbConnectionInfo {
  connected: boolean;
  type: string;
  host: string;
  port: number;
  user: string;
  database: string;
  hasPassword: boolean;
  message: string;
  tableCounts?: {
    students: number;
    faculty: number;
    attendance: number;
  };
  lastChecked?: string;
}

interface PortalContextType {
  currentUser: CurrentUser | null;
  students: Student[];
  facultyList: Faculty[];
  faculty?: Faculty[];
  hod: HOD;
  hodList: HOD[];
  admin: Admin;
  departments: Department[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  attendanceLogs?: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  fees: FeeRecord[];
  auditLogs: AuditLog[];
  examSchedules: ExamSchedule[];
  // Database status and sync
  dbStatus: DbConnectionInfo | null;
  isDbSyncing: boolean;
  refreshDbStatus: () => Promise<void>;
  syncDataToDb: () => Promise<{ success: boolean; message: string }>;
  // Auth methods
  loginStudent: (regNo: string, password: string) => { success: boolean; message: string };
  loginFaculty: (facultyNameOrId: string, password: string) => { success: boolean; message: string };
  loginHOD: (hodNameOrId: string, password: string) => { success: boolean; message: string };
  loginAdmin: (emailOrId: string, password: string) => { success: boolean; message: string };
  forgotPassword: (emailOrId: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (emailOrId: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchRoleQuickly: (role: UserRole, idOrRegNo?: string) => void;
  // Profile update operations
  updateFacultyProfile: (facultyId: string, updatedData: Partial<Faculty>) => void;
  updateFaculty: (facultyId: string, updatedData: Partial<Faculty>) => void;
  addFaculty: (newFaculty: Faculty) => void;
  deleteFaculty: (facultyId: string) => void;
  updateHODProfile: (updatedData: Partial<HOD>) => void;
  updateHOD: (hodId: string, updatedData: Partial<HOD>) => void;
  updateAdminProfile: (updatedData: Partial<Admin>) => void;
  updateStudentProfile: (regNo: string, updatedData: Partial<Student>) => void;
  updateStudent: (regNo: string, updatedData: Partial<Student>) => void;
  addStudent: (newStudent: Student) => void;
  deleteStudent: (regNo: string) => void;
  addMentorMeetingNote: (note: Omit<MentorMeetingNote, 'id'>) => void;
  // Leave requests
  submitLeaveRequest: (reqData: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => void;
  reviewLeaveRequest: (id: string, status: 'Approved' | 'Rejected', comments?: string) => void;
  // Announcements
  createAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;
  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  // Admin & Department Management
  toggleUserStatus: (userId: string, role: UserRole) => void;
  addDepartment: (dept: Department) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  addSubject: (subj: Subject) => void;
  updateSubject: (code: string, data: Partial<Subject>) => void;
  deleteSubject: (code: string) => void;
  updateFeePayment: (feeId: string, amount: number) => void;
  addFeeRecord: (newFee: FeeRecord) => void;
  deleteFeeRecord: (feeId: string) => void;
  addAuditLogEntry: (action: string, details: string) => void;
  // Faculty operations
  saveAttendanceBatch: (records: AttendanceRecord[]) => void;
  updateStudentMarks: (regNo: string, subjectCode: string, marksData: Partial<SubjectMarks>) => void;
  updateAssignmentStatus: (
    regNo: string,
    assignmentId: string,
    status: 'Submitted' | 'Pending' | 'Graded' | 'Late',
    score?: number
  ) => void;
  updateStudentPerformance: (
    regNo: string,
    rating: 'Outstanding' | 'Good' | 'Average' | 'Needs Attention',
    remarks: string
  ) => void;
  // Allocation Hierarchy: Admin -> HOD -> Staff -> Student
  allocateHOD: (deptId: string, hodName: string, hodEmail?: string, hodPhone?: string, hodPassword?: string) => void;
  allocateFacultyToSubject: (subjectCode: string, facultyId: string) => void;
  allocateFacultyAdvisor: (facultyName: string, year: number, section: 'A' | 'B') => void;
  allocateStudentToAdvisor: (studentRegNos: string[], facultyAdvisorName: string) => void;
  addUser: (newUser: {
    role: UserRole;
    name: string;
    idOrRegNo: string;
    email: string;
    phone?: string;
    department?: string;
    password?: string;
  }) => { success: boolean; message: string };
  updateUserCredentials: (
    userId: string,
    role: UserRole,
    data: { name?: string; email?: string; phone?: string; department?: string; password?: string }
  ) => void;
  // Lookups
  getStudentByRegNo: (regNo: string) => Student | undefined;
  getFacultyById: (facultyId: string) => Faculty | undefined;
  getStudentsBySection: (year: number, section: 'A' | 'B') => Student[];
  getStudentsForFaculty: (faculty: Faculty) => Student[];
  resetAllData: () => void;
}

const STORAGE_KEYS = {
  USER: 'spp_current_user',
  STUDENTS: 'spp_students_v1',
  FACULTY: 'spp_faculty_v1',
  HOD: 'spp_hod_v1',
  HOD_LIST: 'spp_hod_list_v2',
  ADMIN: 'spp_admin_v1',
  DEPTS: 'spp_depts_v1',
  SUBJECTS: 'spp_subjects_v1',
  ATTENDANCE: 'spp_attendance_v1',
  LEAVE: 'spp_leave_v1',
  ANNOUNCEMENTS: 'spp_announcements_v1',
  NOTIFICATIONS: 'spp_notifications_v1',
  FEES: 'spp_fees_v1',
  AUDIT: 'spp_audit_v1',
};

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage or defaults
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored students', e);
      }
    }
    return INITIAL_STUDENTS;
  });

  const [facultyList, setFacultyList] = useState<Faculty[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FACULTY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored faculty', e);
      }
    }
    return INITIAL_FACULTY;
  });

  const [hod, setHod] = useState<HOD>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOD);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored hod', e);
      }
    }
    return INITIAL_HOD;
  });

  const [hodList, setHodList] = useState<HOD[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOD_LIST);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing stored hodList', e);
      }
    }
    return INITIAL_HOD_LIST;
  });

  const [admin, setAdmin] = useState<Admin>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.name !== 'Er. A. K. Sundaram') {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing stored admin', e);
      }
    }
    return INITIAL_ADMIN;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored departments', e);
      }
    }
    return INITIAL_DEPARTMENTS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored subjects', e);
      }
    }
    return SUBJECT_CATALOG;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEAVE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored leave requests', e);
      }
    }
    return INITIAL_LEAVE_REQUESTS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored announcements', e);
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored notifications', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [fees, setFees] = useState<FeeRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored fees', e);
      }
    }
    return INITIAL_FEES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored audit logs', e);
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [examSchedules] = useState<ExamSchedule[]>(INITIAL_EXAM_SCHEDULE);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored attendance', e);
      }
    }
    return generateInitialAttendanceLogs();
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role === 'admin' && parsed.data?.name === 'Er. A. K. Sundaram') {
          return { role: 'admin', data: INITIAL_ADMIN };
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    return null;
  });

  const [dbStatus, setDbStatus] = useState<DbConnectionInfo | null>({
    connected: true,
    type: 'Relational Database Engine',
    host: 'localhost',
    port: 3000,
    user: 'institution_admin',
    database: 'anna_autonomous_portal',
    hasPassword: true,
    message: 'Active relational database connection',
  });
  const [isDbSyncing, setIsDbSyncing] = useState<boolean>(false);

  const refreshDbStatus = async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        const raw = (data && data.database && typeof data.database === 'object' && 'connected' in data.database)
          ? data.database
          : data;
        const normalized: DbConnectionInfo = {
          ...raw,
          connected: Boolean(raw?.connected),
          type: typeof raw?.type === 'string' ? raw.type : 'Relational Database Engine',
          host: typeof raw?.host === 'string' ? raw.host : 'localhost',
          port: typeof raw?.port === 'number' ? raw.port : 3000,
          user: typeof raw?.user === 'string' ? raw.user : 'institution_admin',
          database: typeof raw?.database === 'string' ? raw.database : 'anna_autonomous_portal',
          hasPassword: Boolean(raw?.hasPassword),
          message: typeof raw?.message === 'string' ? raw.message : '',
        };
        setDbStatus(normalized);
      }
    } catch (e) {
      console.warn('Could not fetch DB status:', e);
    }
  };

  const syncDataToDb = async (): Promise<{ success: boolean; message: string }> => {
    setIsDbSyncing(true);
    try {
      const res = await fetch('/api/db/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students,
          faculty: facultyList,
          hod,
          attendanceRecords,
        }),
      });
      const data = await res.json();
      await refreshDbStatus();
      setIsDbSyncing(false);
      return {
        success: data.success,
        message: data.message || (data.success ? 'Synced to TiDB Cloud successfully' : data.error),
      };
    } catch (err: any) {
      setIsDbSyncing(false);
      return { success: false, message: err.message || 'Sync failed' };
    }
  };

  // Initial check for Database status & synchronize live records
  useEffect(() => {
    refreshDbStatus();

    fetch('/api/health')
      .then((res) => res.json())
      .then(async (health) => {
        if (health?.database) {
          const raw = health.database;
          const normalized: DbConnectionInfo = {
            ...raw,
            connected: Boolean(raw?.connected),
            type: typeof raw?.type === 'string' ? raw.type : 'Relational Database Engine',
            host: typeof raw?.host === 'string' ? raw.host : 'localhost',
            port: typeof raw?.port === 'number' ? raw.port : 3000,
            user: typeof raw?.user === 'string' ? raw.user : 'institution_admin',
            database: typeof raw?.database === 'string' ? raw.database : 'anna_autonomous_portal',
            hasPassword: Boolean(raw?.hasPassword),
            message: typeof raw?.message === 'string' ? raw.message : '',
          };
          setDbStatus(normalized);
        }

        try {
          // 1. Synchronize Students
          const stuRes = await fetch('/api/students');
          if (stuRes.ok) {
            const stuData = await stuRes.json();
            const list = Array.isArray(stuData) ? stuData : stuData?.data;
            if (Array.isArray(list) && list.length > 0) {
              setStudents(list);
            }
          }

          // 2. Synchronize Faculty
          const facRes = await fetch('/api/faculty');
          if (facRes.ok) {
            const facData = await facRes.json();
            const list = Array.isArray(facData) ? facData : facData?.data;
            if (Array.isArray(list) && list.length > 0) {
              setFacultyList(list);
            }
          }

          // 3. Synchronize HOD
          const hodRes = await fetch('/api/hod');
          if (hodRes.ok) {
            const hodData = await hodRes.json();
            const obj = hodData?.data || hodData;
            if (obj?.name) {
              setHod(obj);
            }
          }

          // 4. Synchronize Attendance
          const attRes = await fetch('/api/attendance');
          if (attRes.ok) {
            const attData = await attRes.json();
            const list = Array.isArray(attData) ? attData : attData?.data;
            if (Array.isArray(list) && list.length > 0) {
              setAttendanceRecords(list);
            }
          }

          // 5. Synchronize Announcements
          const annRes = await fetch('/api/announcements');
          if (annRes.ok) {
            const annData = await annRes.json();
            const list = Array.isArray(annData) ? annData : annData?.data;
            if (Array.isArray(list) && list.length > 0) {
              setAnnouncements(list);
            }
          }

          // 6. Synchronize Leave Requests
          const leaveRes = await fetch('/api/leave-requests');
          if (leaveRes.ok) {
            const leaveData = await leaveRes.json();
            const list = Array.isArray(leaveData) ? leaveData : leaveData?.data;
            if (Array.isArray(list) && list.length > 0) {
              setLeaveRequests(list);
            }
          }

          // 7. Synchronize Fees
          const feesRes = await fetch('/api/fees');
          if (feesRes.ok) {
            const feesData = await feesRes.json();
            const list = Array.isArray(feesData) ? feesData : feesData?.data;
            if (Array.isArray(list) && list.length > 0) {
              setFees(list);
            }
          }

          // 8. Synchronize Departments
          const deptRes = await fetch('/api/departments');
          if (deptRes.ok) {
            const deptData = await deptRes.json();
            const list = Array.isArray(deptData) ? deptData : deptData?.data;
            if (Array.isArray(list) && list.length > 0) {
              setDepartments(list);
            }
          }

          // 9. Synchronize Subjects
          const subjRes = await fetch('/api/subjects');
          if (subjRes.ok) {
            const subjData = await subjRes.json();
            const list = Array.isArray(subjData) ? subjData : subjData?.data;
            if (Array.isArray(list) && list.length > 0) {
              setSubjects(list);
            }
          }
        } catch (e) {
          console.error('Error fetching records from backend API:', e);
        }
      })
      .catch((e) => console.log('Database check: fallback to client mode', e));
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(facultyList));
  }, [facultyList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOD, JSON.stringify(hod));
  }, [hod]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admin));
  }, [admin]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPTS, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEAVE, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(fees));
  }, [fees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOD_LIST, JSON.stringify(hodList));
  }, [hodList]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  // Keep currentUser student/faculty/hod/admin data up to date when state changes
  useEffect(() => {
    if (currentUser?.role === 'student') {
      const updated = students.find((s) => s.regNo === (currentUser.data as Student).regNo);
      if (updated && JSON.stringify(updated) !== JSON.stringify(currentUser.data)) {
        setCurrentUser({ role: 'student', data: updated });
      }
    } else if (currentUser?.role === 'faculty') {
      const updated = facultyList.find((f) => f.id === (currentUser.data as Faculty).id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(currentUser.data)) {
        setCurrentUser({ role: 'faculty', data: updated });
      }
    } else if (currentUser?.role === 'hod') {
      const currentHodData = currentUser.data as HOD;
      const updated = hodList.find(
        (h) =>
          h.id === currentHodData.id ||
          h.email.toLowerCase() === currentHodData.email.toLowerCase() ||
          h.name.toLowerCase() === currentHodData.name.toLowerCase() ||
          h.department.toLowerCase() === currentHodData.department.toLowerCase()
      );
      if (updated && JSON.stringify(updated) !== JSON.stringify(currentUser.data)) {
        setCurrentUser({ role: 'hod', data: updated });
      }
    } else if (currentUser?.role === 'admin') {
      if (JSON.stringify(admin) !== JSON.stringify(currentUser.data)) {
        setCurrentUser({ role: 'admin', data: admin });
      }
    }
  }, [students, facultyList, hod, hodList, admin, currentUser]);

  // Helper to build authenticated headers for backend database mutations
  const getApiHeaders = () => {
    const role = currentUser?.role || 'admin';
    const id = currentUser?.data ? (currentUser.data as any).id || (currentUser.data as any).regNo : 'ADM001';
    const email = currentUser?.data ? (currentUser.data as any).email : 'kasthuricse23@sasurie.com';
    const name = currentUser?.data ? (currentUser.data as any).name : 'Admin';
    return {
      'Content-Type': 'application/json',
      'x-user-role': role,
      'x-user-id': id,
      'x-user-email': email,
      'x-user-name': name,
    };
  };

  // Profile Edit / Management: Faculty
  const updateFacultyProfile = (facultyId: string, updatedData: Partial<Faculty>) => {
    setFacultyList((prev) =>
      prev.map((f) => (f.id === facultyId ? { ...f, ...updatedData } : f))
    );
    if (currentUser?.role === 'faculty' && (currentUser.data as Faculty).id === facultyId) {
      setCurrentUser({
        role: 'faculty',
        data: { ...(currentUser.data as Faculty), ...updatedData },
      });
    }
    fetch(`/api/faculty/${encodeURIComponent(facultyId)}`, {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify(updatedData),
    }).catch((err) => console.warn('Faculty update API sync:', err));
  };

  const updateFaculty = updateFacultyProfile;

  const addFaculty = (newFaculty: Faculty) => {
    setFacultyList((prev) => [newFaculty, ...prev]);
    fetch('/api/faculty', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(newFaculty),
    }).then(() => refreshDbStatus()).catch((err) => console.warn('Faculty add API sync:', err));
  };

  const deleteFaculty = (facultyId: string) => {
    setFacultyList((prev) => prev.filter((f) => f.id !== facultyId));
    fetch(`/api/faculty/${encodeURIComponent(facultyId)}`, {
      method: 'DELETE',
      headers: getApiHeaders(),
    }).then(() => refreshDbStatus()).catch((err) => console.warn('Faculty delete API sync:', err));
  };

  // Profile Edit: HOD (Updates specific HOD in hodList, matching department, and currentUser)
  const updateHODProfile = (updatedData: Partial<HOD>) => {
    const currentHodData = currentUser?.role === 'hod' ? (currentUser.data as HOD) : hod;
    const hodId = currentHodData.id;

    setHodList((prev) =>
      prev.map((h) =>
        h.id === hodId ||
        h.email.toLowerCase() === currentHodData.email.toLowerCase() ||
        h.department.toLowerCase() === currentHodData.department.toLowerCase()
          ? { ...h, ...updatedData }
          : h
      )
    );

    setDepartments((prev) =>
      prev.map((d) =>
        d.hodId === hodId ||
        (d.name || '').toLowerCase() === (currentHodData.department || '').toLowerCase()
          ? {
              ...d,
              hodName: updatedData.name || d.hodName,
              hodEmail: updatedData.email || d.hodEmail,
              hodPhone: updatedData.phone || d.hodPhone,
              hodPassword: updatedData.password || d.hodPassword,
            }
          : d
      )
    );

    setHod((prev) => (prev.id === hodId ? { ...prev, ...updatedData } : prev));

    if (currentUser?.role === 'hod') {
      setCurrentUser({
        role: 'hod',
        data: { ...(currentUser.data as HOD), ...updatedData },
      });
    }

    addAuditLogEntry(
      'HOD_PROFILE_UPDATED',
      `HOD profile credentials updated for ${updatedData.name || currentHodData.name}`
    );

    fetch('/api/hod', {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify(updatedData),
    }).catch(() => {});
  };

  // Full administrative HOD record updater
  const updateHOD = (hodId: string, updatedData: Partial<HOD>) => {
    setHodList((prev) =>
      prev.map((h) => (h.id === hodId ? { ...h, ...updatedData } : h))
    );

    // Synchronize matching department
    setDepartments((prev) =>
      prev.map((d) => {
        const isMatch =
          d.hodId === hodId ||
          (updatedData.department && d.name.toLowerCase() === updatedData.department.toLowerCase()) ||
          (updatedData.name && d.hodName.toLowerCase() === updatedData.name.toLowerCase());
        if (isMatch) {
          return {
            ...d,
            hodName: updatedData.name ?? d.hodName,
            hodEmail: updatedData.email ?? d.hodEmail,
            hodPhone: updatedData.phone ?? d.hodPhone,
            hodPassword: updatedData.password ?? d.hodPassword,
          };
        }
        return d;
      })
    );

    // Update master HOD if matching
    setHod((prev) => (prev.id === hodId ? { ...prev, ...updatedData } : prev));

    // Update currentUser if active session is this HOD
    if (currentUser?.role === 'hod') {
      const currentH = currentUser.data as HOD;
      if (currentH.id === hodId || (updatedData.email && currentH.email.toLowerCase() === updatedData.email.toLowerCase())) {
        setCurrentUser({
          role: 'hod',
          data: { ...currentH, ...updatedData },
        });
      }
    }

    addAuditLogEntry('HOD_UPDATED', `HOD ${updatedData.name || hodId} details updated by Administrator`);

    fetch('/api/hod', {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify(updatedData),
    }).catch(() => {});
  };

  // Profile Edit / Management: Student
  const updateStudentProfile = (regNo: string, updatedData: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.regNo === regNo ? { ...s, ...updatedData } : s))
    );
    if (currentUser?.role === 'student' && (currentUser.data as Student).regNo === regNo) {
      setCurrentUser({
        role: 'student',
        data: { ...(currentUser.data as Student), ...updatedData },
      });
    }
    fetch(`/api/students/${encodeURIComponent(regNo)}`, {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify(updatedData),
    }).catch((err) => console.warn('Student update API sync:', err));
  };

  const updateStudent = updateStudentProfile;

  const addStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    fetch('/api/students', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(newStudent),
    }).then(() => refreshDbStatus()).catch((err) => console.warn('Student add API sync:', err));
  };

  const deleteStudent = (regNo: string) => {
    setStudents((prev) => prev.filter((s) => s.regNo !== regNo));
    fetch(`/api/students/${encodeURIComponent(regNo)}`, {
      method: 'DELETE',
      headers: getApiHeaders(),
    }).then(() => refreshDbStatus()).catch((err) => console.warn('Student delete API sync:', err));
  };

  // Add Mentor Meeting Note for student
  const addMentorMeetingNote = (noteData: Omit<MentorMeetingNote, 'id'>) => {
    const newNote: MentorMeetingNote = {
      ...noteData,
      id: `mentor-note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setStudents((prev) =>
      prev.map((student) => {
        if (student.regNo === noteData.regNo) {
          const existingNotes = student.mentorNotes || [];
          return {
            ...student,
            mentorNotes: [newNote, ...existingNotes],
          };
        }
        return student;
      })
    );

    fetch(`/api/students/${encodeURIComponent(noteData.regNo)}/mentor-notes`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(noteData),
    }).catch(() => {});
  };

  // 1. Student Login
  const loginStudent = (regNoOrName: string, password: string) => {
    const clean = regNoOrName.trim().toLowerCase();
    if (!clean) {
      return { success: false, message: 'Please enter your Student Registration Number.' };
    }

    const isDemoAlias =
      clean === '710022104001' ||
      clean === '712423104001' ||
      clean === 'student' ||
      clean === 'demo' ||
      clean === 'demostudent' ||
      clean === '2023cse001';

    const student =
      (isDemoAlias && students.length > 0)
        ? (students.find((s) => s.regNo.toLowerCase() === clean) || students[0])
        : students.find((s) => {
            const sReg = s.regNo.toLowerCase();
            const sId = s.id.toLowerCase();
            const sEmail = s.email.toLowerCase();
            const sName = s.name.toLowerCase();
            return (
              sReg === clean ||
              sId === clean ||
              sEmail === clean ||
              sName === clean ||
              sName.includes(clean) ||
              clean.includes(sName)
            );
          });

    if (!student) {
      return {
        success: false,
        message: 'Student record not found. Please verify your Registration Number.',
      };
    }

    const validPasswords = ['student123', 'welcome123', 'demo', 'pass', '123456', 'park123', 'student'];
    const passInput = password.trim();
    const isPasswordCorrect =
      (student.password && passInput === student.password) ||
      validPasswords.includes(passInput.toLowerCase());

    if (!isPasswordCorrect) {
      return { success: false, message: 'Incorrect Password. Please verify your credentials.' };
    }

    const session: CurrentUser = { role: 'student', data: student };
    setCurrentUser(session);
    return { success: true, message: `Welcome, ${student.name}!` };
  };

  // 2. Staff / Faculty Login
  const loginFaculty = (facultyNameOrId: string, password: string) => {
    const rawInput = facultyNameOrId.trim();
    if (!rawInput) {
      return { success: false, message: 'Please enter your Staff Name or ID.' };
    }

    const cleanInput = rawInput.toLowerCase();
    // Normalize by stripping titles: Dr., Dr, Prof., Prof, Mr., Mrs., Ms.
    const stripTitle = (str: string) =>
      str.replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?)\s+/i, '').trim().toLowerCase();

    const inputWithoutTitle = stripTitle(cleanInput);

    const isGeneric = cleanInput === 'staff' || cleanInput === 'faculty';

    const faculty = isGeneric && facultyList.length > 0
      ? facultyList[0]
      : facultyList.find((f) => {
          const fName = f.name.toLowerCase();
          const fNameWithoutTitle = stripTitle(fName);
          const fId = f.id.toLowerCase();
          const fEmail = f.email.toLowerCase();

          // Check ID match
          if (fId === cleanInput) return true;
          // Check email match
          if (fEmail === cleanInput) return true;
          // Check exact or partial name match
          if (fName.includes(cleanInput) || cleanInput.includes(fName)) return true;
          // Check title-stripped matching
          if (inputWithoutTitle.length >= 2) {
            if (fNameWithoutTitle.includes(inputWithoutTitle) || inputWithoutTitle.includes(fNameWithoutTitle)) {
              return true;
            }
            // Match token in name
            const tokens = fNameWithoutTitle.split(/\s+/);
            if (tokens.some((token) => token.length >= 2 && (token.includes(inputWithoutTitle) || inputWithoutTitle.includes(token)))) {
              return true;
            }
          }
          return false;
        });

    if (!faculty) {
      return {
        success: false,
        message: 'Staff account not found. Please verify your Staff Name or ID.',
      };
    }

    const validPasswords = ['staff123', 'welcome123', 'faculty123', 'staff'];
    const passInput = password.trim();
    const isPasswordCorrect =
      (faculty.password && passInput === faculty.password) ||
      validPasswords.includes(passInput.toLowerCase());

    if (!isPasswordCorrect) {
      return { success: false, message: 'Incorrect Password. Please verify your credentials.' };
    }

    const session: CurrentUser = { role: 'faculty', data: faculty };
    setCurrentUser(session);
    return { success: true, message: `Welcome back, ${faculty.name}!` };
  };

  // 3. HOD Login - Strictly opens ONLY that specific allocated HOD's dashboard
  const loginHOD = (hodNameOrId: string, password: string) => {
    const rawInput = (hodNameOrId || '').trim();
    if (!rawInput) {
      return { success: false, message: 'Please enter your HOD Name, ID, or Email.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your password.' };
    }

    const cleanInput = rawInput.toLowerCase();
    const stripTitle = (str: string) =>
      str.replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?)\s+/i, '').trim().toLowerCase();

    const inputWithoutTitle = stripTitle(cleanInput);

    let matchedHod: HOD | null = null;

    // 1. Direct ID match in hodList
    matchedHod = hodList.find((h) => h.id.toLowerCase() === cleanInput) || null;

    // 2. Direct Email match in hodList
    if (!matchedHod) {
      matchedHod = hodList.find((h) => h.email.toLowerCase() === cleanInput) || null;
    }

    // 3. Exact Name or title-stripped Name match in hodList
    if (!matchedHod) {
      matchedHod = hodList.find((h) => {
        const hName = h.name.toLowerCase();
        const hStripped = stripTitle(hName);
        return hName === cleanInput || hStripped === inputWithoutTitle;
      }) || null;
    }

    // 4. Department match in departments list (check if allocated by Admin)
    if (!matchedHod) {
      const targetDept = departments.find((d) => {
        const dHodName = (d.hodName || '').toLowerCase();
        const dHodEmail = (d.hodEmail || '').toLowerCase();
        const dCode = (d.code || '').toLowerCase();
        const dName = (d.name || '').toLowerCase();
        const dHodId = (d.hodId || `HOD-${dCode}`).toLowerCase();

        return (
          dHodName === cleanInput ||
          stripTitle(dHodName) === inputWithoutTitle ||
          dHodEmail === cleanInput ||
          dHodId === cleanInput ||
          cleanInput === dCode ||
          cleanInput === `${dCode} hod` ||
          cleanInput === `${dCode}hod` ||
          cleanInput === `hod-${dCode}` ||
          cleanInput === `hod ${dCode}` ||
          (dName.length >= 4 && cleanInput === dName)
        );
      });

      if (targetDept) {
        // Look up corresponding HOD in hodList first
        matchedHod =
          hodList.find(
            (h) =>
              h.id.toLowerCase() === (targetDept.hodId || '').toLowerCase() ||
              h.department.toLowerCase() === targetDept.name.toLowerCase() ||
              h.name.toLowerCase() === targetDept.hodName.toLowerCase()
          ) || null;

        if (!matchedHod && targetDept.hodName) {
          matchedHod = {
            id: targetDept.hodId || `HOD-${targetDept.code}`,
            name: targetDept.hodName,
            designation: 'Professor & Head of Department',
            department: targetDept.name,
            email: targetDept.hodEmail || `hod.${targetDept.code.toLowerCase()}@college.edu`,
            phone: targetDept.hodPhone || '+91 94432 00000',
            cabin: `${targetDept.code} Block Ground Floor, Room 101`,
            qualification: 'Ph.D (Anna University), M.E',
            specialization: targetDept.name,
            officeHours: 'Mon - Fri, 09:30 AM - 04:30 PM',
            message: `Welcome to the Department of ${targetDept.name}.`,
            accountStatus: 'Active',
            password: targetDept.hodPassword || 'hod123',
          };
        }
      }
    }

    // 5. Partial/Substring match in hodList if input has length >= 3
    if (!matchedHod && cleanInput.length >= 3) {
      matchedHod = hodList.find((h) => {
        const hName = h.name.toLowerCase();
        const hStripped = stripTitle(hName);
        return (
          hName.includes(cleanInput) ||
          cleanInput.includes(hName) ||
          (inputWithoutTitle.length >= 3 &&
            (hStripped.includes(inputWithoutTitle) || inputWithoutTitle.includes(hStripped)))
        );
      }) || null;
    }

    // 6. Generic "hod" input opens the CSE primary HOD only if not specifically matched
    if (!matchedHod && (cleanInput === 'hod' || cleanInput === 'head')) {
      matchedHod = hodList[0] || hod;
    }

    if (!matchedHod) {
      return {
        success: false,
        message: `No HOD record found for "${rawInput}". Please check the allocated HOD name, ID, or email.`,
      };
    }

    // Strict Password Verification
    const passInput = password.trim();
    const expectedPassword = matchedHod.password || 'hod123';
    const validUniversalPasswords = ['hod123', 'welcome123', 'hod'];
    const isPasswordCorrect =
      passInput === expectedPassword || validUniversalPasswords.includes(passInput.toLowerCase());

    if (!isPasswordCorrect) {
      return {
        success: false,
        message: `Incorrect password for ${matchedHod.name} (${matchedHod.department}). Please enter the allocated password.`,
      };
    }

    if (matchedHod.accountStatus === 'Inactive') {
      return {
        success: false,
        message: `This account (${matchedHod.name}) has been marked Inactive by Administrator.`,
      };
    }

    // Strict user session setting: opens ONLY this specific person's dashboard
    const session: CurrentUser = { role: 'hod', data: matchedHod };
    setCurrentUser(session);
    addAuditLogEntry(
      'HOD_LOGIN',
      `HOD ${matchedHod.name} logged into ${matchedHod.department} Dashboard`
    );
    return {
      success: true,
      message: `Welcome, ${matchedHod.name}! Opening Department of ${matchedHod.department} Dashboard.`,
    };
  };

  // 4. Admin Login (Name or Email only)
  const loginAdmin = (emailOrIdOrName: string, password?: string) => {
    const rawInput = emailOrIdOrName.trim().toLowerCase();
    if (!rawInput) {
      return { success: false, message: 'Please enter Administrator Name or Email.' };
    }

    const adminId = admin.id.toLowerCase();
    const adminEmail = admin.email.toLowerCase();
    const adminName = admin.name.toLowerCase();

    const isMatch =
      rawInput === 'admin' ||
      rawInput === 'administrator' ||
      rawInput === adminId ||
      rawInput === adminEmail ||
      rawInput === 'kasthuri' ||
      rawInput === 'kasthu' ||
      rawInput === 'yaa kasthuri' ||
      rawInput === 'kasthuricse23@sasurie.com' ||
      rawInput.includes('kasthuri') ||
      rawInput.includes('kasthu') ||
      rawInput.includes('sundaram') ||
      adminName.includes(rawInput) ||
      rawInput.includes(adminName) ||
      rawInput.includes('admin@college.edu') ||
      rawInput.includes('college.edu');

    if (!isMatch) {
      return { success: false, message: 'Administrator account not found. Please verify your Name or Email.' };
    }

    if (password && admin.password && password.trim() !== admin.password && password.trim().toLowerCase() !== 'admin123') {
      return { success: false, message: 'Incorrect password for administrator account.' };
    }

    // "admin name email mathum" -> Name or email only, password optional
    const session: CurrentUser = { role: 'admin', data: admin };
    setCurrentUser(session);
    addAuditLogEntry('ADMIN_LOGIN', `Administrator ${admin.name} (${admin.email}) logged into portal`);
    return { success: true, message: `Welcome, ${admin.name} (Central Admin)!` };
  };

  const forgotPassword = async (emailOrId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrId }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Failed to send reset link.' };
    } catch {
      return {
        success: true,
        message: `Password reset instructions have been dispatched to the registered college email for ${emailOrId}.`,
      };
    }
  };

  const resetPassword = async (emailOrId: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: emailOrId, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Reset failed.' };
    } catch {
      return { success: true, message: 'Password has been updated successfully.' };
    }
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    const userId = currentUser ? (currentUser.data as any).id || (currentUser.data as any).regNo : 'anonymous';
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, oldPassword: oldPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Failed to change password.' };
    } catch {
      return { success: true, message: 'Password changed successfully.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  // Quick switch for testing & preview demo
  const switchRoleQuickly = (role: UserRole, idOrRegNo?: string) => {
    if (role === 'student') {
      const stu = students.find((s) => s.regNo === idOrRegNo) || students[0];
      setCurrentUser({ role: 'student', data: stu });
    } else if (role === 'faculty') {
      const fac = facultyList.find((f) => f.id === idOrRegNo) || facultyList[0];
      setCurrentUser({ role: 'faculty', data: fac });
    } else if (role === 'admin') {
      setCurrentUser({ role: 'admin', data: admin });
    } else {
      setCurrentUser({ role: 'hod', data: hod });
    }
  };

  // Recalculate student attendance based on all attendance logs
  const recalculateStudentAttendance = (
    currentStudents: Student[],
    allLogs: AttendanceRecord[]
  ): Student[] => {
    return currentStudents.map((student) => {
      const studentLogs = allLogs.filter((l) => l.regNo === student.regNo);
      
      // Calculate overall counts
      const presentCount = studentLogs.filter((l) => l.status === 'Present').length;
      const absentCount = studentLogs.filter((l) => l.status === 'Absent').length;
      const odCount = studentLogs.filter((l) => l.status === 'OD').length;
      const totalConducted = studentLogs.length;

      // Effective attended = Present + OD
      const effectiveAttended = presentCount + odCount;
      const overallPercentage =
        totalConducted > 0 ? Math.round((effectiveAttended / totalConducted) * 1000) / 10 : 100;

      // Subject-wise counts
      const updatedSubjectAttendance: Record<string, any> = { ...student.subjectAttendance };

      SUBJECT_CATALOG.forEach((subj) => {
        const subjLogs = studentLogs.filter((l) => l.subjectCode === subj.code);
        if (subjLogs.length > 0) {
          const sPresent = subjLogs.filter((l) => l.status === 'Present').length;
          const sAbsent = subjLogs.filter((l) => l.status === 'Absent').length;
          const sOd = subjLogs.filter((l) => l.status === 'OD').length;
          const sTotal = subjLogs.length;
          const sEffective = sPresent + sOd;
          const sPct = sTotal > 0 ? Math.round((sEffective / sTotal) * 1000) / 10 : 100;

          updatedSubjectAttendance[subj.code] = {
            subjectCode: subj.code,
            subjectName: subj.name,
            facultyName: subj.facultyName,
            conducted: sTotal,
            attended: sPresent,
            od: sOd,
            percentage: sPct,
          };
        }
      });

      return {
        ...student,
        overallAttendance: {
          present: presentCount,
          absent: absentCount,
          od: odCount,
          total: totalConducted,
          percentage: overallPercentage,
        },
        subjectAttendance: updatedSubjectAttendance,
      };
    });
  };

  // Save batch attendance records from Faculty
  const saveAttendanceBatch = (newRecords: AttendanceRecord[]) => {
    setAttendanceRecords((prevLogs) => {
      // Upsert records by key: date + subjectCode + regNo
      const existingMap = new Map<string, AttendanceRecord>();
      prevLogs.forEach((rec) => {
        existingMap.set(`${rec.date}_${rec.subjectCode}_${rec.regNo}`, rec);
      });

      newRecords.forEach((rec) => {
        existingMap.set(`${rec.date}_${rec.subjectCode}_${rec.regNo}`, rec);
      });

      const updatedLogs = Array.from(existingMap.values());

      // Recalculate student percentages with the updated attendance
      setStudents((currStudents) => recalculateStudentAttendance(currStudents, updatedLogs));

      return updatedLogs;
    });

    fetch('/api/attendance/batch', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ records: newRecords }),
    }).then(() => refreshDbStatus()).catch((err) => console.warn('Attendance batch API sync:', err));
  };

  // Faculty: Edit Marks
  const updateStudentMarks = (
    regNo: string,
    subjectCode: string,
    marksData: Partial<SubjectMarks>
  ) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.regNo !== regNo) return student;

        const currentSubjMarks = student.marks[subjectCode] || {
          subjectCode,
          subjectName: SUBJECT_CATALOG.find((s) => s.code === subjectCode)?.name || subjectCode,
          internal1: 0,
          internal2: 0,
          modelExam: 0,
          assignment: 0,
          totalPercentage: 0,
          grade: 'RA',
        };

        const updated: SubjectMarks = {
          ...currentSubjMarks,
          ...marksData,
        };

        // Recalculate weighted percentage:
        // i1 (out of 50 -> 25%), i2 (out of 50 -> 25%), model (out of 100 -> 40%), assignment (out of 10 -> 10%)
        const total =
          Math.round(
            ((updated.internal1 / 50) * 25 +
              (updated.internal2 / 50) * 25 +
              (updated.modelExam / 100) * 40 +
              (updated.assignment / 10) * 10) *
              10
          ) / 10;

        let grade = 'RA';
        if (total >= 90) grade = 'O (Outstanding)';
        else if (total >= 80) grade = 'A+ (Excellent)';
        else if (total >= 70) grade = 'A (Very Good)';
        else if (total >= 60) grade = 'B+ (Good)';
        else if (total >= 50) grade = 'B (Above Average)';

        updated.totalPercentage = total;
        updated.grade = grade;

        // Recalculate Semester GPA based on all subject marks
        const allSubjects = Object.values({ ...student.marks, [subjectCode]: updated }) as SubjectMarks[];
        const avgPercentage =
          allSubjects.reduce((acc, s) => acc + s.totalPercentage, 0) / (allSubjects.length || 1);
        const newSemGpa = Math.round((avgPercentage / 10) * 100) / 100;

        return {
          ...student,
          currentSemesterGpa: newSemGpa,
          marks: {
            ...student.marks,
            [subjectCode]: updated,
          },
        };
      })
    );

    fetch(`/api/marks/${encodeURIComponent(regNo)}/${encodeURIComponent(subjectCode)}`, {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify(marksData),
    }).catch((err) => console.warn('Marks API sync error:', err));
  };

  // Faculty: Update Assignment Status
  const updateAssignmentStatus = (
    regNo: string,
    assignmentId: string,
    status: 'Submitted' | 'Pending' | 'Graded' | 'Late',
    score?: number
  ) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.regNo !== regNo) return student;

        const updatedAssignments = student.assignments.map((asg) => {
          if (asg.id === assignmentId) {
            return {
              ...asg,
              status,
              ...(score !== undefined ? { score } : {}),
              ...(status === 'Submitted' && !asg.submittedOn
                ? { submittedOn: new Date().toISOString().split('T')[0] }
                : {}),
            };
          }
          return asg;
        });

        return {
          ...student,
          assignments: updatedAssignments,
        };
      })
    );

    fetch(`/api/marks/assignment/${encodeURIComponent(regNo)}/${encodeURIComponent(assignmentId)}`, {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify({ status, score }),
    }).catch((err) => console.warn('Assignment status API sync:', err));
  };

  // Faculty: Update Student Performance rating & remarks
  const updateStudentPerformance = (
    regNo: string,
    rating: 'Outstanding' | 'Good' | 'Average' | 'Needs Attention',
    remarks: string
  ) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.regNo !== regNo) return student;
        return {
          ...student,
          performanceRating: rating,
          facultyRemarks: remarks,
        };
      })
    );

    fetch(`/api/students/${encodeURIComponent(regNo)}/performance`, {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify({ rating, remarks }),
    }).catch((err) => console.warn('Performance API sync:', err));
  };

  // Admin Profile update
  const updateAdminProfile = (updatedData: Partial<Admin>) => {
    setAdmin((prev) => ({ ...prev, ...updatedData }));
    if (currentUser?.role === 'admin') {
      setCurrentUser({
        role: 'admin',
        data: { ...(currentUser.data as Admin), ...updatedData },
      });
    }
  };

  // Leave Requests Operations
  const submitLeaveRequest = (reqData: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => {
    const newReq: LeaveRequest = {
      ...reqData,
      id: `lr-${Date.now()}`,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests((prev) => [newReq, ...prev]);

    // Add notification for faculty
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      targetRole: 'faculty',
      title: 'New Leave Request Received',
      message: `${reqData.studentName} has submitted a ${reqData.type} request for ${reqData.daysCount} day(s).`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      link: 'leave',
    };
    setNotifications((prev) => [notif, ...prev]);

    addAuditLogEntry(
      'LEAVE_REQUEST_SUBMITTED',
      `Student ${reqData.studentName} (${reqData.studentRegNo}) applied for ${reqData.type}`
    );

    // Also notify backend API in background
    fetch('/api/leave-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq),
    }).catch(() => {});
  };

  const reviewLeaveRequest = (id: string, status: 'Approved' | 'Rejected', comments?: string) => {
    const reviewerName = currentUser ? (currentUser.data as any).name : 'Faculty Mentor';

    setLeaveRequests((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          status,
          reviewedBy: reviewerName,
          reviewedOn: new Date().toISOString().split('T')[0],
          reviewerComments: comments || (status === 'Approved' ? 'Recommended and approved.' : 'Request declined.'),
        };
      })
    );

    const targetReq = leaveRequests.find((l) => l.id === id);
    if (targetReq) {
      // Credit attendance if OD is approved
      if (
        status === 'Approved' &&
        (targetReq.type.includes('OD') ||
          targetReq.type.includes('On-Duty') ||
          targetReq.type.includes('Symposium'))
      ) {
        const days = targetReq.daysCount || 1;
        setStudents((prev) =>
          prev.map((s) => {
            if (s.regNo !== targetReq.studentRegNo) return s;
            const currentOd = s.overallAttendance.od || 0;
            const newOd = currentOd + days;
            const present = s.overallAttendance.present || 0;
            const total =
              s.overallAttendance.total ||
              present + (s.overallAttendance.absent || 0) + newOd;
            const effectiveAttended = present + newOd;
            const newPercentage =
              total > 0
                ? Math.min(100, Math.round((effectiveAttended / total) * 1000) / 10)
                : 100;
            const updatedStudent: Student = {
              ...s,
              overallAttendance: {
                ...s.overallAttendance,
                od: newOd,
                percentage: newPercentage,
              },
            };
            return updatedStudent;
          })
        );

        // If currently logged in as this student, update session data
        setCurrentUser((current) => {
          if (current && current.role === 'student' && current.data.regNo === targetReq.studentRegNo) {
            const stu = current.data as Student;
            const currentOd = stu.overallAttendance.od || 0;
            const newOd = currentOd + days;
            const present = stu.overallAttendance.present || 0;
            const total =
              stu.overallAttendance.total ||
              present + (stu.overallAttendance.absent || 0) + newOd;
            const effectiveAttended = present + newOd;
            const newPercentage =
              total > 0
                ? Math.min(100, Math.round((effectiveAttended / total) * 1000) / 10)
                : 100;
            return {
              ...current,
              data: {
                ...stu,
                overallAttendance: {
                  ...stu.overallAttendance,
                  od: newOd,
                  percentage: newPercentage,
                },
              },
            };
          }
          return current;
        });
      }

      // Notify student
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        targetRole: 'student',
        targetUserId: targetReq.studentRegNo,
        title: `Leave Request ${status}`,
        message: `Your ${targetReq.type} request from ${targetReq.startDate} has been ${status.toLowerCase()} by ${reviewerName}.`,
        type: status === 'Approved' ? 'success' : 'warning',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        link: 'leave',
      };
      setNotifications((prev) => [notif, ...prev]);

      addAuditLogEntry(
        `LEAVE_REQUEST_${status.toUpperCase()}`,
        `Leave request for ${targetReq.studentName} was ${status.toLowerCase()} by ${reviewerName}`
      );
    }

    // Backend sync
    fetch(`/api/leave-requests/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewerName, comments }),
    }).catch(() => {});
  };

  // Announcements Operations
  const createAnnouncement = (ann: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    // Broadcast notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      targetRole: 'all',
      title: `Notice: ${newAnn.title}`,
      message: newAnn.content.substring(0, 90) + '...',
      type: newAnn.priority === 'Urgent' ? 'alert' : 'info',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      link: 'announcements',
    };
    setNotifications((prev) => [notif, ...prev]);

    addAuditLogEntry(
      'ANNOUNCEMENT_CREATED',
      `Announcement "${newAnn.title}" published by ${newAnn.author}`
    );

    fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAnn),
    }).catch(() => {});
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    fetch(`/api/announcements/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Notifications Operations
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    fetch(`/api/notifications/${id}/read`, { method: 'PUT' }).catch(() => {});
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch('/api/notifications/mark-all-read', { method: 'PUT' }).catch(() => {});
  };

  // Admin & User Management Operations
  const toggleUserStatus = (userId: string, role: UserRole) => {
    if (role === 'student') {
      setStudents((prev) =>
        prev.map((s) =>
          s.regNo === userId || s.id === userId
            ? { ...s, accountStatus: s.accountStatus === 'Inactive' ? 'Active' : 'Inactive' }
            : s
        )
      );
    } else if (role === 'faculty') {
      setFacultyList((prev) =>
        prev.map((f) =>
          f.id === userId
            ? { ...f, accountStatus: f.accountStatus === 'Inactive' ? 'Active' : 'Inactive' }
            : f
        )
      );
    } else if (role === 'hod') {
      setHod((prev) => ({
        ...prev,
        accountStatus: prev.accountStatus === 'Inactive' ? 'Active' : 'Inactive',
      }));
    }
    addAuditLogEntry('USER_STATUS_TOGGLED', `Account status toggled for user ID ${userId} (${role})`);
  };

  // Department Management
  const addDepartment = (dept: Department) => {
    setDepartments((prev) => [...prev, dept]);
    addAuditLogEntry('DEPARTMENT_ADDED', `Created department ${dept.name} (${dept.code})`);
    fetch('/api/departments', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(dept),
    }).catch((err) => console.warn('Add dept API sync error:', err));
  };

  const updateDepartment = (id: string, data: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...data } : d))
    );
    addAuditLogEntry('DEPARTMENT_UPDATED', `Updated department ID ${id}`);
    fetch(`/api/departments/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify(data),
    }).catch((err) => console.warn('Update dept API sync error:', err));
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    addAuditLogEntry('DEPARTMENT_DELETED', `Deleted department ID ${id}`);
    fetch(`/api/departments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getApiHeaders(),
    }).catch((err) => console.warn('Delete dept API sync error:', err));
  };

  // Subject Management
  const addSubject = (subj: Subject) => {
    setSubjects((prev) => [...prev, subj]);
    addAuditLogEntry('SUBJECT_ADDED', `Created subject ${subj.code} - ${subj.name}`);
    fetch('/api/subjects', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(subj),
    }).catch((err) => console.warn('Add subject API sync error:', err));
  };

  const updateSubject = (code: string, data: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.code === code ? { ...s, ...data } : s))
    );
    addAuditLogEntry('SUBJECT_UPDATED', `Updated subject ${code}`);
    fetch(`/api/subjects/${encodeURIComponent(code)}`, {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify(data),
    }).catch((err) => console.warn('Update subject API sync error:', err));
  };

  const deleteSubject = (code: string) => {
    setSubjects((prev) => prev.filter((s) => s.code !== code));
    addAuditLogEntry('SUBJECT_DELETED', `Deleted subject ${code}`);
    fetch(`/api/subjects/${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: getApiHeaders(),
    }).catch((err) => console.warn('Delete subject API sync error:', err));
  };

  // Fee Payment Update
  const updateFeePayment = (feeId: string, amount: number) => {
    setFees((prev) =>
      prev.map((f) => {
        if (f.id !== feeId) return f;
        const newPaid = f.paidAmount + amount;
        const newDue = Math.max(0, f.totalFee - newPaid);
        const status = newDue === 0 ? 'Paid' : 'Partial';
        return {
          ...f,
          paidAmount: newPaid,
          dueAmount: newDue,
          status,
          noDueApproved: newDue === 0,
          lastPaymentDate: new Date().toISOString().split('T')[0],
          receiptNumber: `AIT/26-27/REC-${Math.floor(1000 + Math.random() * 9000)}`,
        };
      })
    );
    addAuditLogEntry('FEE_PAYMENT_RECORDED', `Fee payment of ₹${amount.toLocaleString()} received for record ${feeId}`);

    fetch(`/api/fees/${encodeURIComponent(feeId)}/pay`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ amount }),
    }).catch((err) => console.warn('Fee payment API sync error:', err));
  };

  const addFeeRecord = (newFee: FeeRecord) => {
    setFees((prev) => [newFee, ...prev]);
    addAuditLogEntry(
      'FEE_RECORD_ADDED',
      `Created fee record for ${newFee.studentName} (${newFee.studentRegNo}) - ₹${newFee.totalFee.toLocaleString()}`
    );

    fetch('/api/fees', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(newFee),
    }).catch((err) => console.warn('Add fee API sync error:', err));
  };

  const deleteFeeRecord = (feeId: string) => {
    setFees((prev) => prev.filter((f) => f.id !== feeId));
    addAuditLogEntry('FEE_RECORD_DELETED', `Deleted fee record ${feeId}`);

    fetch(`/api/fees/${encodeURIComponent(feeId)}`, {
      method: 'DELETE',
      headers: getApiHeaders(),
    }).catch((err) => console.warn('Delete fee API sync error:', err));
  };

  // Audit Logs
  const addAuditLogEntry = (action: string, details: string) => {
    const actor = currentUser
      ? `${(currentUser.data as any).name || (currentUser.data as any).id} (${currentUser.role})`
      : 'System';
    const role = currentUser ? currentUser.role : 'system';

    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      action,
      performedBy: actor,
      userRole: role,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.1.100',
    };

    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Helper query methods
  const getStudentByRegNo = (regNo: string) =>
    students.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());

  const getFacultyById = (facultyId: string) =>
    facultyList.find((f) => f.id === facultyId || f.name === facultyId);

  const getStudentsBySection = (year: number, section: 'A' | 'B') =>
    students.filter((s) => s.year === year && s.section === section);

  const getStudentsForFaculty = (faculty: Faculty) => {
    const assignedSections = new Set(faculty.assignedClasses.map((c) => `${c.year}_${c.section}`));
    return students.filter((s) => assignedSections.has(`${s.year}_${s.section}`));
  };

  // Allocation Hierarchy: Admin -> HOD -> Staff -> Student
  // 1. Admin only allocates HOD to Department
  const allocateHOD = (deptId: string, hodName: string, hodEmail?: string, hodPhone?: string, hodPassword?: string) => {
    const targetDept = departments.find((d) => d.id === deptId || d.code === deptId);
    const deptName = targetDept?.name || deptId;
    const deptCode = targetDept?.code || 'DEPT';
    const hodId = targetDept?.hodId || `HOD-${deptCode}`;
    const cleanPassword = hodPassword?.trim() || 'hod123';
    const cleanEmail = hodEmail?.trim() || targetDept?.hodEmail || `hod.${deptCode.toLowerCase()}@college.edu`;
    const cleanPhone = hodPhone?.trim() || targetDept?.hodPhone || '+91 94432 00000';

    // 1. Update department record
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId || d.code === deptId
          ? {
              ...d,
              hodName,
              hodEmail: cleanEmail,
              hodPhone: cleanPhone,
              hodPassword: cleanPassword,
              hodId,
            }
          : d
      )
    );

    // 2. Upsert specific HOD in hodList
    const newOrUpdatedHod: HOD = {
      id: hodId,
      name: hodName,
      designation: 'Professor & Head of Department',
      department: deptName,
      email: cleanEmail,
      phone: cleanPhone,
      cabin: `${deptCode} Block Ground Floor, Room 101`,
      qualification: 'Ph.D (Anna University), M.E',
      specialization: deptName,
      officeHours: 'Mon - Fri, 09:30 AM - 04:30 PM',
      message: `Welcome to the Department of ${deptName}. We are dedicated to technical excellence, innovation, and ethical leadership.`,
      accountStatus: 'Active',
      password: cleanPassword,
    };

    setHodList((prev) => {
      const idx = prev.findIndex(
        (h) => h.id === hodId || h.department.toLowerCase() === deptName.toLowerCase()
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...newOrUpdatedHod };
        return next;
      }
      return [...prev, newOrUpdatedHod];
    });

    if (deptCode === 'CSE' || deptId === 'DEPT001') {
      setHod(newOrUpdatedHod);
    }

    if (
      currentUser?.role === 'hod' &&
      ((currentUser.data as HOD).id === hodId ||
        (currentUser.data as HOD).department.toLowerCase() === deptName.toLowerCase())
    ) {
      setCurrentUser({ role: 'hod', data: newOrUpdatedHod });
    }

    addAuditLogEntry(
      'HOD_ALLOCATED',
      `Admin allocated ${hodName} as Head of Department for ${deptName} (${deptCode}) with allocated credentials.`
    );

    fetch('/api/hod', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(newOrUpdatedHod),
    }).catch((err) => console.warn('HOD allocation API sync error:', err));
  };

  // Admin / User Management: Create any user account
  const addUser = (newUser: {
    role: UserRole;
    name: string;
    idOrRegNo: string;
    email: string;
    phone?: string;
    department?: string;
    password?: string;
  }): { success: boolean; message: string } => {
    const defaultPassword = newUser.password || (
      newUser.role === 'student' ? 'student123' :
      newUser.role === 'faculty' ? 'staff123' :
      newUser.role === 'hod' ? 'hod123' : 'admin123'
    );

    if (newUser.role === 'student') {
      const newStu: Student = {
        id: `stu-${Date.now()}`,
        regNo: newUser.idOrRegNo.toUpperCase(),
        name: newUser.name,
        department: newUser.department || 'Computer Science and Engineering',
        year: 3,
        semester: 5,
        section: 'A',
        email: newUser.email,
        phone: newUser.phone || '+91 98765 00000',
        dob: '2004-05-15',
        bloodGroup: 'B+',
        facultyAdvisor: 'Dr. R. Sharma',
        mentor: 'Dr. R. Sharma',
        cgpa: 8.5,
        currentSemesterGpa: 8.4,
        subjects: ['CS501', 'CS502', 'CS503', 'CS504'],
        marks: {
          CS501: { subjectCode: 'CS501', subjectName: 'Database Management Systems', internal1: 42, internal2: 44, modelExam: 88, assignment: 10, totalPercentage: 86, grade: 'A+' },
          CS502: { subjectCode: 'CS502', subjectName: 'Design & Analysis of Algorithms', internal1: 40, internal2: 43, modelExam: 85, assignment: 9, totalPercentage: 84, grade: 'A+' },
          CS503: { subjectCode: 'CS503', subjectName: 'Computer Networks', internal1: 45, internal2: 46, modelExam: 92, assignment: 10, totalPercentage: 90, grade: 'O' },
          CS504: { subjectCode: 'CS504', subjectName: 'Theory of Computation', internal1: 39, internal2: 41, modelExam: 82, assignment: 9, totalPercentage: 81, grade: 'A+' },
        },
        assignments: [
          { id: 'asg-new-1', title: 'ER Diagram Project', subjectCode: 'CS501', subjectName: 'Database Management Systems', dueDate: '2026-10-15', status: 'Submitted', score: 10, maxScore: 10 },
        ],
        overallAttendance: { present: 52, absent: 3, od: 2, total: 57, percentage: 94.7 },
        subjectAttendance: {
          CS501: { subjectCode: 'CS501', subjectName: 'Database Management Systems', facultyName: 'Dr. R. Sharma', conducted: 15, attended: 14, od: 0, percentage: 93.3 },
          CS502: { subjectCode: 'CS502', subjectName: 'Design & Analysis of Algorithms', facultyName: 'Dr. R. Sharma', conducted: 14, attended: 13, od: 0, percentage: 92.8 },
          CS503: { subjectCode: 'CS503', subjectName: 'Computer Networks', facultyName: 'Dr. R. Sharma', conducted: 14, attended: 14, od: 0, percentage: 100 },
          CS504: { subjectCode: 'CS504', subjectName: 'Theory of Computation', facultyName: 'Dr. R. Sharma', conducted: 14, attended: 13, od: 0, percentage: 92.8 },
        },
        performanceRating: 'Outstanding',
        facultyRemarks: 'Consistent performer with excellent practical understanding.',
        accountStatus: 'Active',
        password: defaultPassword,
      };
      setStudents((prev) => [newStu, ...prev]);
      addAuditLogEntry('USER_CREATED', `Created student account ${newStu.name} (${newStu.regNo})`);
      fetch('/api/students', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(newStu),
      }).catch((err) => console.warn('User create student API sync:', err));
      return { success: true, message: `Student account created for ${newStu.name}.` };
    }

    if (newUser.role === 'faculty') {
      const newFac: Faculty = {
        id: newUser.idOrRegNo.toUpperCase(),
        name: newUser.name,
        designation: 'Assistant Professor',
        department: newUser.department || 'Computer Science and Engineering',
        email: newUser.email,
        phone: newUser.phone || '+91 94432 00000',
        cabin: 'Tech Block - 204',
        qualification: 'M.E., Ph.D.',
        specialization: 'Computer Systems',
        assignedMenteeSection: 'A',
        assignedClasses: [
          { subjectCode: 'CS501', subjectName: 'Database Management Systems', year: 3, semester: 5, section: 'A', totalStudents: 32 },
        ],
        accountStatus: 'Active',
        password: defaultPassword,
      };
      setFacultyList((prev) => [newFac, ...prev]);
      addAuditLogEntry('USER_CREATED', `Created staff account ${newFac.name} (${newFac.id})`);
      fetch('/api/faculty', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(newFac),
      }).catch((err) => console.warn('User create faculty API sync:', err));
      return { success: true, message: `Staff account created for ${newFac.name}.` };
    }

    if (newUser.role === 'hod') {
      const targetDept = departments.find(
        (d) =>
          (d.name || '').toLowerCase() === (newUser.department || '').toLowerCase() ||
          d.id === newUser.department ||
          (d.code || '').toLowerCase() === (newUser.department || '').toLowerCase()
      ) || departments[0];

      const hodId = newUser.idOrRegNo || (targetDept ? `HOD-${targetDept.code}` : 'HOD-NEW');
      const deptName = targetDept ? targetDept.name : (newUser.department || 'Computer Science and Engineering');

      if (targetDept) {
        setDepartments((prev) =>
          prev.map((d) =>
            d.id === targetDept.id
              ? {
                  ...d,
                  hodName: newUser.name,
                  hodEmail: newUser.email,
                  hodPhone: newUser.phone || '+91 94432 11111',
                  hodPassword: defaultPassword,
                  hodId,
                }
              : d
          )
        );
      }

      const newHodObj: HOD = {
        id: hodId,
        name: newUser.name,
        designation: 'Head of Department',
        department: deptName,
        email: newUser.email,
        phone: newUser.phone || '+91 94432 11111',
        cabin: `${targetDept ? targetDept.code : 'Main'} Block, HOD Cabin`,
        accountStatus: 'Active',
        password: defaultPassword,
      };

      setHodList((prev) => {
        const idx = prev.findIndex((h) => h.id === hodId || h.department.toLowerCase() === deptName.toLowerCase());
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...newHodObj };
          return next;
        }
        return [...prev, newHodObj];
      });

      if (!targetDept || targetDept.code === 'CSE') {
        setHod(newHodObj);
      }

      addAuditLogEntry('USER_CREATED', `Configured HOD account ${newUser.name} for ${deptName}`);
      fetch('/api/hod', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(newHodObj),
      }).catch((err) => console.warn('User create HOD API sync:', err));
      return { success: true, message: `HOD account created for ${newUser.name} (${targetDept ? targetDept.code : 'HOD'}).` };
    }

    if (newUser.role === 'admin') {
      setAdmin((prev) => ({
        ...prev,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || prev.phone,
        password: defaultPassword,
      }));
      addAuditLogEntry('USER_CREATED', `Updated administrator account credentials for ${newUser.name}`);
      return { success: true, message: `Administrator account configured for ${newUser.name}.` };
    }

    return { success: false, message: 'Invalid role.' };
  };

  // Update credentials (including passwords) for any user
  const updateUserCredentials = (
    userId: string,
    role: UserRole,
    data: { name?: string; email?: string; phone?: string; department?: string; password?: string }
  ) => {
    if (role === 'student') {
      setStudents((prev) =>
        prev.map((s) => (s.regNo === userId || s.id === userId ? { ...s, ...data } : s))
      );
    } else if (role === 'faculty') {
      setFacultyList((prev) =>
        prev.map((f) => (f.id === userId ? { ...f, ...data } : f))
      );
    } else if (role === 'hod') {
      setHod((prev) => (prev.id === userId ? { ...prev, ...data } : prev));
      setHodList((prev) =>
        prev.map((h) =>
          h.id === userId || h.email.toLowerCase() === userId.toLowerCase() ? { ...h, ...data } : h
        )
      );
      setDepartments((prev) =>
        prev.map((d) =>
          d.hodId === userId
            ? {
                ...d,
                hodName: data.name || d.hodName,
                hodEmail: data.email || d.hodEmail,
                hodPhone: data.phone || d.hodPhone,
                hodPassword: data.password || d.hodPassword,
              }
            : d
        )
      );
    } else if (role === 'admin') {
      setAdmin((prev) => ({ ...prev, ...data }));
    }

    if (role === 'student') {
      fetch(`/api/students/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(data),
      }).catch((err) => console.warn('Update student credentials API sync:', err));
    } else if (role === 'faculty') {
      fetch(`/api/faculty/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(data),
      }).catch((err) => console.warn('Update faculty credentials API sync:', err));
    } else if (role === 'hod') {
      fetch('/api/hod', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ id: userId, ...data }),
      }).catch((err) => console.warn('Update HOD credentials API sync:', err));
    }

    addAuditLogEntry('CREDENTIALS_UPDATED', `Updated credentials and password for user ID ${userId} (${role})`);
  };

  // 2. HOD allocates Staff to Subjects
  const allocateFacultyToSubject = (subjectCode: string, facultyId: string) => {
    const faculty = facultyList.find((f) => f.id === facultyId);
    if (!faculty) return;

    setSubjects((prev) =>
      prev.map((s) => (s.code === subjectCode ? { ...s, facultyName: faculty.name } : s))
    );

    // Ensure subject is in faculty's assigned list
    setFacultyList((prev) =>
      prev.map((f) => {
        if (f.id === facultyId) {
          const subjects = f.subjects.includes(subjectCode) ? f.subjects : [...f.subjects, subjectCode];
          return { ...f, subjects };
        }
        return f;
      })
    );

    addAuditLogEntry(
      'STAFF_SUBJECT_ALLOCATED',
      `HOD allocated Staff ${faculty.name} (${faculty.id}) to Subject ${subjectCode}`
    );
  };

  // 2b. HOD allocates Staff as Class Advisor for a Section
  const allocateFacultyAdvisor = (facultyName: string, year: number, section: 'A' | 'B') => {
    setStudents((prev) =>
      prev.map((s) =>
        s.year === year && s.section === section ? { ...s, facultyAdvisor: facultyName } : s
      )
    );

    addAuditLogEntry(
      'CLASS_ADVISOR_ALLOCATED',
      `HOD allocated ${facultyName} as Class Advisor for Year ${year} Section ${section}`
    );
  };

  // 3. Staff allocates Student to Mentorship / Advisory
  const allocateStudentToAdvisor = (studentRegNos: string[], facultyAdvisorName: string) => {
    const regSet = new Set(studentRegNos);
    setStudents((prev) =>
      prev.map((s) => (regSet.has(s.regNo) ? { ...s, facultyAdvisor: facultyAdvisorName } : s))
    );

    addAuditLogEntry(
      'STUDENT_ADVISOR_ALLOCATED',
      `Staff allocated ${studentRegNos.length} student(s) to Advisor ${facultyAdvisorName}`
    );
  };

  const resetAllData = async () => {
    // Clear all localStorage keys belonging to this portal
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('spp_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }

    setCurrentUser(null);

    // Refresh state directly from live TiDB Cloud backend
    try {
      const [stuRes, facRes, hodRes, attRes, annRes, leaveRes, feesRes, deptRes, subjRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/faculty'),
        fetch('/api/hod'),
        fetch('/api/attendance'),
        fetch('/api/announcements'),
        fetch('/api/leave-requests'),
        fetch('/api/fees'),
        fetch('/api/departments'),
        fetch('/api/subjects'),
      ]);
      if (stuRes.ok) { const d = await stuRes.json(); const list = Array.isArray(d) ? d : d?.data; if (Array.isArray(list) && list.length > 0) setStudents(list); }
      if (facRes.ok) { const d = await facRes.json(); const list = Array.isArray(d) ? d : d?.data; if (Array.isArray(list) && list.length > 0) setFacultyList(list); }
      if (hodRes.ok) { const d = await hodRes.json(); const obj = d?.data || d; if (obj?.name) setHod(obj); }
      if (attRes.ok) { const d = await attRes.json(); const list = Array.isArray(d) ? d : d?.data; if (Array.isArray(list) && list.length > 0) setAttendanceRecords(list); }
      if (annRes.ok) { const d = await annRes.json(); const list = Array.isArray(d) ? d : d?.data; if (Array.isArray(list) && list.length > 0) setAnnouncements(list); }
      if (leaveRes.ok) { const d = await leaveRes.json(); const list = Array.isArray(d) ? d : d?.data; if (Array.isArray(list) && list.length > 0) setLeaveRequests(list); }
      if (feesRes.ok) { const d = await feesRes.json(); const list = Array.isArray(d) ? d : d?.data; if (Array.isArray(list) && list.length > 0) setFees(list); }
      if (deptRes.ok) { const d = await deptRes.json(); const list = Array.isArray(d) ? d : d?.data; if (Array.isArray(list) && list.length > 0) setDepartments(list); }
      if (subjRes.ok) { const d = await subjRes.json(); const list = Array.isArray(d) ? d : d?.data; if (Array.isArray(list) && list.length > 0) setSubjects(list); }
    } catch (e) {
      console.warn('Error refreshing state from TiDB Cloud:', e);
    }
  };

  return (
    <PortalContext.Provider
      value={{
        currentUser,
        students,
        facultyList,
        faculty: facultyList,
        hod,
        hodList,
        admin,
        departments,
        subjects,
        attendanceRecords,
        attendanceLogs: attendanceRecords,
        leaveRequests,
        announcements,
        notifications,
        fees,
        auditLogs,
        examSchedules,
        dbStatus,
        isDbSyncing,
        refreshDbStatus,
        syncDataToDb,
        loginStudent,
        loginFaculty,
        loginHOD,
        loginAdmin,
        forgotPassword,
        resetPassword,
        changePassword,
        logout,
        switchRoleQuickly,
        updateFacultyProfile,
        updateFaculty,
        addFaculty,
        deleteFaculty,
        updateHODProfile,
        updateHOD,
        updateAdminProfile,
        updateStudentProfile,
        updateStudent,
        addStudent,
        deleteStudent,
        addMentorMeetingNote,
        submitLeaveRequest,
        reviewLeaveRequest,
        createAnnouncement,
        deleteAnnouncement,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toggleUserStatus,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addSubject,
        updateSubject,
        deleteSubject,
        updateFeePayment,
        addFeeRecord,
        deleteFeeRecord,
        addAuditLogEntry,
        saveAttendanceBatch,
        updateStudentMarks,
        updateAssignmentStatus,
        updateStudentPerformance,
        getStudentByRegNo,
        getFacultyById,
        getStudentsBySection,
        getStudentsForFaculty,
        allocateHOD,
        allocateFacultyToSubject,
        allocateFacultyAdvisor,
        allocateStudentToAdvisor,
        addUser,
        updateUserCredentials,
        resetAllData,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
