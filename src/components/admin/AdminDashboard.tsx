import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Department, Subject, UserRole, FeeRecord } from '../../types';
import { triggerPrintReport } from '../../utils/printHelper';
import {
  Users,
  GraduationCap,
  Briefcase,
  Building,
  CreditCard,
  ShieldCheck,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Database,
  RefreshCw,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  Receipt,
  FileText,
  Sliders,
  ChevronRight,
  Shield,
  Activity,
  Layers,
  BookOpen,
  Printer,
  Key,
  Save,
  ArrowLeft,
  X,
  RotateCcw,
} from 'lucide-react';
import { StudentDetailModal } from '../common/StudentDetailModal';
import { FacultyDetailModal } from '../common/FacultyDetailModal';
import { EditStudentModal } from '../faculty/EditStudentModal';
import { EditFacultyModal } from '../hod/EditFacultyModal';
import { EditHODModal } from './EditHODModal';

interface AdminDashboardProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab: controlledTab,
  onTabChange,
}) => {
  const {
    admin,
    students,
    facultyList,
    hod,
    hodList,
    departments,
    subjects,
    fees,
    auditLogs,
    leaveRequests,
    attendanceRecords,
    dbStatus,
    refreshDbStatus,
    syncDataToDb,
    isDbSyncing,
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
    addStudent,
    updateStudent,
    deleteStudent,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    allocateHOD,
    addUser,
    updateAdminProfile,
    addAuditLogEntry,
    resetAllData,
  } = usePortal();

  const [internalTab, setInternalTab] = useState<
    'overview' | 'users' | 'departments' | 'subjects' | 'fees' | 'audit' | 'settings'
  >('overview');

  const activeTab = (controlledTab as any) || internalTab;
  const setActiveTab = (tab: any) => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  // User tab states
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'faculty' | 'hod'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modal states
  const [selectedStudentForView, setSelectedStudentForView] = useState<string | null>(null);
  const [selectedFacultyForView, setSelectedFacultyForView] = useState<string | null>(null);
  const [selectedHODForView, setSelectedHODForView] = useState<any | null>(null);
  const [isPrintReportModalOpen, setIsPrintReportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<any | null>(null);
  const [editingHOD, setEditingHOD] = useState<any | null>(null);

  // Allocate HOD modal
  const [isAllocateHODModalOpen, setIsAllocateHODModalOpen] = useState(false);
  const [selectedDeptForHOD, setSelectedDeptForHOD] = useState<Department | null>(null);
  const [hodAllocForm, setHodAllocForm] = useState({ name: '', email: '', phone: '', password: 'hod123' });
  const [hodAllocSuccess, setHodAllocSuccess] = useState<string | null>(null);

  // Create User Modal (Admin full management)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    role: 'student' as UserRole,
    name: '',
    idOrRegNo: '',
    email: '',
    phone: '',
    department: 'Computer Science and Engineering',
    password: 'student123',
  });
  const [createUserMsg, setCreateUserMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Edit Admin Profile & Password Modal
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    phone: admin?.phone || '+91 94432 99999',
    password: admin?.password || 'admin123',
  });

  React.useEffect(() => {
    if (admin) {
      setAdminProfileForm({
        name: admin.name || '',
        email: admin.email || '',
        phone: admin.phone || '+91 94432 99999',
        password: admin.password || 'admin123',
      });
    }
  }, [admin]);
  const [adminProfileSuccess, setAdminProfileSuccess] = useState<string | null>(null);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [resetDoneMsg, setResetDoneMsg] = useState(false);

  // New Department modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ id: '', name: '', code: '', hodName: '', totalStudents: 120, totalFaculty: 8 });

  // New Subject modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ code: '', name: '', credits: 3, semester: 4, type: 'Theory' as const, faculty: '' });

  // Fee management states
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(10000);
  const [isAddFeeModalOpen, setIsAddFeeModalOpen] = useState(false);
  const [feeSemesterFilter, setFeeSemesterFilter] = useState<string>('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('all');
  const [newFeeForm, setNewFeeForm] = useState({
    studentRegNo: '',
    studentName: '',
    semester: 5,
    academicYear: '2026-2027',
    tuitionFee: 45000,
    developmentFee: 10000,
    examFee: 3500,
    paidAmount: 0,
  });

  // Search & filters
  const [deptSearch, setDeptSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [feeSearch, setFeeSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // In-app deletion confirmation states (works 100% inside sandboxed preview iframes)
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [feeToDelete, setFeeToDelete] = useState<FeeRecord | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; type: 'student' | 'faculty' } | null>(null);

  // Export handlers
  const exportDataJSON = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      institution: 'Park College of Engineering and Technology',
      students,
      facultyList,
      departments,
      subjects,
      fees,
      auditLogs,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `park_college_portal_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addAuditLogEntry('SYSTEM_BACKUP_EXPORTED', 'Full JSON database export created by Administrator');
  };

  const exportStudentsCSV = () => {
    const headers = 'RegNo,Name,Year,Section,Department,Email,Phone,CGPA,Attendance,Status\n';
    const rows = students
      .map(
        (s) =>
          `"${s.regNo}","${s.name}",${s.year},"${s.section}","${s.department}","${s.email}","${s.phone}",${s.cgpa},${s.attendancePercentage}%,"${s.accountStatus}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `students_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLogEntry('STUDENTS_CSV_EXPORTED', 'Student roster CSV exported by Administrator');
  };

  // Keyboard shortcut listener to exit Print Report or any modal easily with ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPrintReportModalOpen) {
          setIsPrintReportModalOpen(false);
        }
      }
    };
    if (isPrintReportModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isPrintReportModalOpen]);

  // Calculations
  const totalStudents = students.length;
  const totalFaculty = facultyList.length;
  const activeStudents = students.filter((s) => s.accountStatus === 'Active').length;
  const activeFaculty = facultyList.filter((f) => f.accountStatus === 'Active').length;
  const totalFeesExpected = fees.reduce((acc, f) => acc + f.totalFee, 0);
  const totalFeesCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalFeesPending = fees.reduce((acc, f) => acc + f.dueAmount, 0);
  const feeCollectionRate = totalFeesExpected > 0 ? Math.round((totalFeesCollected / totalFeesExpected) * 100) : 0;
  const avgAttendance = students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.attendancePercentage, 0) / students.length) : 0;

  // Filtered users
  const allHODs = React.useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      department: string;
      email: string;
      phone: string;
      cabin: string;
      accountStatus: string;
      code: string;
      password?: string;
    }> = [];

    // Populate from hodList first
    if (hodList && hodList.length > 0) {
      hodList.forEach((h) => {
        const dept = departments.find(
          (d) => d.name.toLowerCase() === h.department.toLowerCase() || d.hodId === h.id
        );
        list.push({
          id: h.id || (dept ? `HOD-${dept.code}` : 'HOD-DEPT'),
          name: h.name,
          department: h.department,
          email: h.email,
          phone: h.phone,
          cabin: h.cabin,
          accountStatus: h.accountStatus || 'Active',
          code: dept?.code || 'DEPT',
          password: h.password || dept?.hodPassword || 'hod123',
        });
      });
    } else {
      // Master HOD fallback
      list.push({
        id: hod.id || 'HOD-MAIN',
        name: hod.name,
        department: hod.department,
        email: hod.email,
        phone: hod.phone,
        cabin: hod.cabin,
        accountStatus: hod.accountStatus,
        code: 'CSE',
        password: hod.password,
      });
    }

    // Departments allocated HODs that might not yet be in hodList
    departments.forEach((d) => {
      const exists = list.some(
        (h) =>
          h.name.toLowerCase() === (d.hodName || '').toLowerCase() ||
          h.department.toLowerCase() === (d.name || '').toLowerCase() ||
          h.id === d.hodId
      );
      if (!exists && d.hodName) {
        list.push({
          id: d.hodId || `HOD-${d.code}`,
          name: d.hodName,
          department: d.name,
          email: d.hodEmail || `${d.code.toLowerCase()}hod@park.ac.in`,
          phone: d.hodPhone || '+91 94432 00000',
          cabin: `${d.code} Block, HOD Cabin`,
          accountStatus: 'Active',
          code: d.code,
          password: d.hodPassword || 'hod123',
        });
      }
    });

    return list;
  }, [hod, hodList, departments]);

  const filteredHODs = allHODs.filter((h) => {
    if (statusFilter !== 'all' && h.accountStatus !== statusFilter) return false;
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.id.toLowerCase().includes(q) ||
      h.email.toLowerCase().includes(q) ||
      h.department.toLowerCase().includes(q)
    );
  });

  const filteredStudents = students.filter((s) => {
    if (statusFilter !== 'all' && s.accountStatus !== statusFilter) return false;
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.regNo.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  const filteredFaculty = facultyList.filter((f) => {
    if (statusFilter !== 'all' && f.accountStatus !== statusFilter) return false;
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.department.toLowerCase().includes(q)
    );
  });

  const filteredFees = fees.filter((f) => {
    if (feeSemesterFilter !== 'all' && f.semester.toString() !== feeSemesterFilter) return false;
    if (feeStatusFilter !== 'all' && f.status !== feeStatusFilter) return false;
    if (feeSearch.trim()) {
      const q = feeSearch.toLowerCase();
      return (
        f.studentName.toLowerCase().includes(q) ||
        f.studentRegNo.toLowerCase().includes(q) ||
        (f.receiptNumber || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Institutional Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              System Administration
            </span>
            <span className="text-xs font-medium text-slate-500">
              Logged in as {admin.name} ({admin.email})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Central Administrative Control Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full oversight of institutional academic master data, departments, fee compliance, and security logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="admin-edit-profile-btn"
            type="button"
            onClick={() => {
              setAdminProfileForm({
                name: admin.name,
                email: admin.email,
                phone: admin.phone || '+91 94432 99999',
                password: admin.password || 'admin123',
              });
              setAdminProfileSuccess(null);
              setIsEditAdminModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            <span>Admin Profile & Password</span>
          </button>

          <button
            id="admin-sync-db-btn"
            type="button"
            onClick={() => syncDataToDb()}
            disabled={isDbSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDbSyncing ? 'animate-spin' : ''}`} />
            <span>{isDbSyncing ? 'Syncing...' : 'Sync Database'}</span>
          </button>

          <button
            id="admin-export-backup-btn"
            type="button"
            onClick={exportDataJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            id="admin-print-btn"
            type="button"
            onClick={() => setIsPrintReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-rose-600" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INSTITUTIONAL OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Students</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{activeStudents} Active accounts</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Faculty & Staff</span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalFaculty + 1}</div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>{activeFaculty} Faculty • 1 HOD</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Fee Collection Rate</span>
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{feeCollectionRate}%</div>
              <div className="text-[11px] text-slate-500 mt-1">
                ₹{(totalFeesCollected / 100000).toFixed(2)}L / ₹{(totalFeesExpected / 100000).toFixed(2)}L
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Avg Attendance Rate</span>
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{avgAttendance}%</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {students.filter((s) => s.attendancePercentage < 75).length} students &lt;75% threshold
              </div>
            </div>
          </div>

          {/* Department Breakdown & Fast Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Academic Departments Status</h3>
                  <p className="text-xs text-slate-500">Autonomous curriculum branches & staffing</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('departments')}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {departments.map((d) => (
                  <div key={d.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                        {d.code}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{d.name}</div>
                        <div className="text-[11px] text-slate-500">HOD: {d.hodName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-800">{d.totalStudents} Students</div>
                      <div className="text-[11px] text-slate-500">{d.totalFaculty} Teaching Faculty</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Administrative Shortcuts */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Administrative Actions</h3>
                <p className="text-xs text-slate-500 mb-4">Immediate system modifications</p>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={exportStudentsCSV}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Download Students CSV</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeptForm({
                        id: `DEPT-${Date.now()}`,
                        name: '',
                        code: '',
                        hodName: '',
                        totalStudents: 60,
                        totalFaculty: 4,
                      });
                      setIsDeptModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-600" />
                      <span>Register New Department</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubjectForm({
                        code: `CS3${Math.floor(100 + Math.random() * 900)}`,
                        name: '',
                        credits: 3,
                        semester: 4,
                        type: 'Theory',
                        faculty: 'Dr. R. Sharma',
                      });
                      setIsSubjectModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span>Add Course to Curriculum</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Database status card snippet */}
              <div className="mt-5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>Engine: {dbStatus?.type || 'Cloud Storage Engine'}</span>
                </div>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Institutional User Directory</h2>
              <p className="text-xs text-slate-500">Manage login privileges, roles, and account statuses</p>
            </div>

            {/* Role Filter Pills & Create User Button */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {(['all', 'student', 'faculty', 'hod'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1 rounded text-xs font-bold capitalize transition-colors cursor-pointer ${
                      userRoleFilter === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'all' ? 'All Roles' : r}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreateUserForm({
                    role: 'student',
                    name: '',
                    idOrRegNo: '',
                    email: '',
                    phone: '',
                    department: 'Computer Science and Engineering',
                    password: 'student123',
                  });
                  setCreateUserMsg(null);
                  setIsCreateUserModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create / Add User</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Status Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search user by name, ID/RegNo, email, or department..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          {/* User List Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Identity / Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Department / Class</th>
                  <th className="py-2.5 px-3">Email & Contact</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* HOD rows */}
                {(userRoleFilter === 'all' || userRoleFilter === 'hod') &&
                  filteredHODs.map((h) => (
                    <tr key={h.id + h.department} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{h.name}</div>
                        <div className="text-[11px] text-slate-500">ID: {h.id}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          HOD
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{h.department}</td>
                      <td className="py-2.5 px-3 text-slate-600">{h.email}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            h.accountStatus === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {h.accountStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedHODForView(h)}
                            className="px-2 py-1 text-[11px] font-semibold text-purple-700 hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingHOD(h)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                            title={`Edit ${h.name} Details`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(h.id, 'hod')}
                            className="px-2 py-1 text-[11px] font-bold rounded border border-slate-300 hover:bg-slate-100 cursor-pointer"
                          >
                            {h.accountStatus === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {/* Faculty rows */}
                {(userRoleFilter === 'all' || userRoleFilter === 'faculty') &&
                  filteredFaculty.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{f.name}</div>
                        <div className="text-[11px] text-slate-500">ID: {f.id} • {f.designation}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Faculty
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {f.department}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{f.email}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            f.accountStatus === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {f.accountStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedFacultyForView(f.id)}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFaculty(f)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                            title="Edit Faculty"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(f.id, 'faculty')}
                            className="px-2 py-1 text-[11px] font-bold rounded border border-slate-300 hover:bg-slate-100 cursor-pointer"
                          >
                            {f.accountStatus === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setUserToDelete({ id: f.id, name: f.name, type: 'faculty' })}
                            className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            title="Delete Faculty"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {/* Student rows */}
                {(userRoleFilter === 'all' || userRoleFilter === 'student') &&
                  filteredStudents.map((s) => (
                    <tr key={s.regNo} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500">Reg: {s.regNo}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Student
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {s.department} • Yr {s.year}-{s.section}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{s.email}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.accountStatus === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {s.accountStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForView(s.regNo)}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStudent(s)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(s.regNo, 'student')}
                            className="px-2 py-1 text-[11px] font-bold rounded border border-slate-300 hover:bg-slate-100 cursor-pointer"
                          >
                            {s.accountStatus === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setUserToDelete({ id: s.regNo, name: s.name, type: 'student' })}
                            className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Autonomous Department Management</h2>
              <p className="text-xs text-slate-500">Configure academic faculties, HOD assignments, and student strengths</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDeptForm({
                  id: `DEPT-${Date.now()}`,
                  name: '',
                  code: '',
                  hodName: '',
                  totalStudents: 120,
                  totalFaculty: 8,
                });
                setIsDeptModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                    {d.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDeptForm(d as any);
                        setIsDeptModalOpen(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeptToDelete(d)}
                      className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                      title={`Delete ${d.name} (${d.code})`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{d.name}</h3>
                <div className="text-xs text-slate-600 mb-3">Head of Department: <span className="font-semibold">{d.hodName}</span></div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Enrolled Students</span>
                    <span className="font-bold text-slate-800">{d.totalStudents}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Faculty Members</span>
                    <span className="font-bold text-slate-800">{d.totalFaculty}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeptForHOD(d);
                    setHodAllocForm({ name: d.hodName, email: `${d.code.toLowerCase()}.hod@college.edu`, phone: '+91 98421 11223' });
                    setHodAllocSuccess(null);
                    setIsAllocateHODModalOpen(true);
                  }}
                  className="w-full mt-2.5 py-1.5 px-2.5 rounded-lg text-xs font-bold text-rose-750 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Central Admin Authority: Allocate or reassign Head of Department"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                  <span>Allocate HOD</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUBJECTS / CURRICULUM */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Curriculum & Course Master</h2>
              <p className="text-xs text-slate-500">Autonomous course syllabus catalog, credits, and faculty allocations</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubjectForm({
                  code: `CS3${Math.floor(100 + Math.random() * 900)}`,
                  name: '',
                  credits: 3,
                  semester: 4,
                  type: 'Theory',
                  faculty: 'Dr. R. Sharma',
                });
                setIsSubjectModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Subject</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Subject Code</th>
                  <th className="py-2.5 px-3">Course Title</th>
                  <th className="py-2.5 px-3">Semester</th>
                  <th className="py-2.5 px-3">Credits</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Assigned Faculty</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.code} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{sub.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{sub.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">Sem {sub.semester}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {sub.credits} Credits
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.type === 'Practical'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {sub.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{sub.faculty}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteSubject(sub.code)}
                        className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FEES & ACCOUNTS */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Tuition & Fee Accounts</h2>
              <p className="text-xs text-slate-500">Autonomous college fee tracking, receipt issuance, student account creation, and clearance</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-slate-500 font-medium">Total Realized Collection:</div>
                <div className="text-sm font-bold text-emerald-700">₹{totalFeesCollected.toLocaleString()} / ₹{totalFeesExpected.toLocaleString()}</div>
              </div>
              <button
                id="add-fee-account-btn"
                type="button"
                onClick={() => {
                  const defaultStudent = students[0];
                  setNewFeeForm({
                    studentRegNo: defaultStudent?.regNo || '',
                    studentName: defaultStudent?.name || '',
                    semester: defaultStudent?.semester || 5,
                    academicYear: '2026-2027',
                    tuitionFee: 45000,
                    developmentFee: 10000,
                    examFee: 3500,
                    paidAmount: 0,
                  });
                  setIsAddFeeModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Fee Account</span>
              </button>
            </div>
          </div>

          {/* Fee Search, Quick Student Chooser & Filters Bar */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Search Student / Receipt</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={feeSearch}
                  onChange={(e) => setFeeSearch(e.target.value)}
                  placeholder="Student name, Reg No, or Receipt #..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Choose Student (Quick Select)</label>
              <select
                value={feeSearch}
                onChange={(e) => setFeeSearch(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="">All Students ({students.length})</option>
                {students.map((s) => (
                  <option key={s.regNo} value={s.regNo}>
                    {s.name} ({s.regNo}) - {(s.department || 'CSE').split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Filter by Semester</label>
              <select
                value={feeSemesterFilter}
                onChange={(e) => setFeeSemesterFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem.toString()}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment Status</label>
              <select
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="all">All Statuses ({fees.length})</option>
                <option value="Paid">Paid / Clear</option>
                <option value="Partial">Partial Payment</option>
                <option value="Pending">Pending / Unpaid</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Student & Reg No</th>
                  <th className="py-2.5 px-3">Semester</th>
                  <th className="py-2.5 px-3">Total Fee</th>
                  <th className="py-2.5 px-3">Paid Amount</th>
                  <th className="py-2.5 px-3">Pending Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">No Due</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No tuition and fee accounts match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{fee.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{fee.studentRegNo}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">Sem {fee.semester}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">₹{(fee.totalFee ?? 0).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">₹{(fee.paidAmount ?? 0).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-semibold text-rose-600">₹{((fee.dueAmount ?? (fee.totalFee - fee.paidAmount)) ?? 0).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            fee.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : fee.status === 'Partial'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {fee.noDueApproved ? (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-600 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Hold</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {fee.dueAmount > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFeeRecord(fee);
                                setPaymentAmount(fee.dueAmount);
                                setIsFeeModalOpen(true);
                              }}
                              className="px-2 py-1 text-[11px] font-bold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium font-mono">
                              #{fee.receiptNumber}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setFeeToDelete(fee)}
                            className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            title="Delete Fee Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Portal Security & Activity Audit Trail</h2>
              <p className="text-xs text-slate-500">Immutable ledger of administrative changes, logins, and attendance writes</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Filter logs by action or user..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor / Role</th>
                  <th className="py-2.5 px-3">Action Event</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs
                  .filter((log) => {
                    if (!auditSearch) return true;
                    const q = auditSearch.toLowerCase();
                    return (
                      log.action.toLowerCase().includes(q) ||
                      log.performedBy.toLowerCase().includes(q) ||
                      log.details.toLowerCase().includes(q)
                    );
                  })
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{log.performedBy}</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{log.action}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans">{log.details}</td>
                      <td className="py-2.5 px-3 text-right text-slate-400">{log.ipAddress}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS & BACKUP */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">System Configuration & Data Integrity</h2>
            <p className="text-xs text-slate-500">Autonomous portal database persistence, administrator profile, reset options, and diagnostics</p>
          </div>

          {/* Active Administrator Identity Card */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {admin.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{admin.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Admin</span>
                </div>
                <p className="text-xs text-slate-500">{admin.designation} • ID: {admin.id}</p>
                <p className="text-xs text-slate-600 font-mono mt-0.5">{admin.email} • {admin.phone}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Primary Administrator Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Database Synchronization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The college management portal communicates with PostgreSQL/TiDB backends to synchronize attendance, student portfolios, and audit trails.
              </p>
              <div className="text-xs text-slate-700 space-y-1">
                <div>Engine: <span className="font-semibold">{dbStatus?.type || 'PostgreSQL'}</span></div>
                <div>Status: <span className="font-semibold text-emerald-600">Connected & Verified</span></div>
                <div>Students Record Count: <span className="font-semibold">{students.length}</span></div>
                <div>Attendance Log Count: <span className="font-semibold">{attendanceRecords.length}</span></div>
              </div>
              <button
                type="button"
                onClick={() => syncDataToDb()}
                disabled={isDbSyncing}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDbSyncing ? 'animate-spin' : ''}`} />
                <span>{isDbSyncing ? 'Synchronizing...' : 'Force Sync All Master Records'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-3">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Autonomous Regulation & Standards</span>
              </h3>
              <p className="text-xs text-indigo-800 leading-relaxed">
                Autonomous academic framework operating under Regulation R-2025 with Anna University and AICTE statutory compliance.
              </p>
              <div className="text-xs text-slate-700 space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Academic Year:</span>
                  <span className="font-bold text-slate-900">2026-2027</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CIA : ESE Assessment Weightage:</span>
                  <span className="font-bold text-slate-900">40 : 60 Ratio</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Accreditation:</span>
                  <span className="font-bold text-indigo-700">NAAC 'A' Grade & NBA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data Preservation:</span>
                  <span className="font-bold text-emerald-700">Protected / Live Audit Log</span>
                </div>
              </div>
            </div>

            {/* Factory Data Reset Card */}
            <div className="md:col-span-2 p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>Portal Data Reset & Factory Restoration</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Restore all student portfolios, allocated department HOD credentials, staff profiles, and system databases back to pristine initial defaults.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-xs shrink-0 self-start sm:self-center"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Data</span>
                </button>
              </div>
              {resetDoneMsg && (
                <div className="p-2.5 rounded-lg text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium animate-in fade-in">
                  Portal data has been successfully reset to initial defaults. All accounts and departments are restored.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Department */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {departments.some((d) => d.id === deptForm.id) ? 'Edit Department' : 'Create Department'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (departments.some((d) => d.id === deptForm.id)) {
                  updateDepartment(deptForm.id, deptForm);
                } else {
                  addDepartment(deptForm);
                }
                setIsDeptModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  value={deptForm.code || ''}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CSE, ECE, MECH"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptForm.name || ''}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Dept of Computer Science & Engineering"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Head of Department (HOD)</label>
                <input
                  type="text"
                  required
                  value={deptForm.hodName || ''}
                  onChange={(e) => setDeptForm({ ...deptForm, hodName: e.target.value })}
                  placeholder="e.g. Dr. S. K. Ramanathan"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Students</label>
                  <input
                    type="number"
                    value={deptForm.totalStudents ?? 0}
                    onChange={(e) => setDeptForm({ ...deptForm, totalStudents: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Faculty</label>
                  <input
                    type="number"
                    value={deptForm.totalFaculty ?? 0}
                    onChange={(e) => setDeptForm({ ...deptForm, totalFaculty: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Subject */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Course to Autonomous Syllabus</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addSubject(subjectForm);
                setIsSubjectModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={subjectForm.code || ''}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CS3401"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  value={subjectForm.name || ''}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Algorithms & Complexity"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={subjectForm.semester ?? 1}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={subjectForm.credits ?? 3}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={subjectForm.type || 'Theory'}
                    onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Faculty</label>
                <input
                  type="text"
                  required
                  value={subjectForm.faculty || ''}
                  onChange={(e) => setSubjectForm({ ...subjectForm, faculty: e.target.value })}
                  placeholder="e.g. Dr. R. Sharma"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fee Payment */}
      {isFeeModalOpen && selectedFeeRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Record Fee Collection</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <div>Student: <span className="font-semibold text-slate-900">{selectedFeeRecord.studentName}</span> ({selectedFeeRecord.studentRegNo})</div>
              <div>Total Tuition Fee: ₹{(selectedFeeRecord.totalFee ?? 0).toLocaleString()}</div>
              <div>Current Pending Due: <span className="font-bold text-rose-600">₹{((selectedFeeRecord.dueAmount ?? (selectedFeeRecord.totalFee - selectedFeeRecord.paidAmount)) ?? 0).toLocaleString()}</span></div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Received (₹)</label>
              <input
                type="number"
                min="500"
                max={selectedFeeRecord.dueAmount}
                value={paymentAmount ?? 0}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFeeModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateFeePayment(selectedFeeRecord.id, paymentAmount);
                  setIsFeeModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
              >
                Confirm Payment & Generate Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Modals for viewing and editing users */}
      {selectedStudentForView && (
        <StudentDetailModal
          student={students.find((s) => s.regNo.toUpperCase() === selectedStudentForView.toUpperCase()) || null}
          onClose={() => setSelectedStudentForView(null)}
        />
      )}

      {selectedFacultyForView && (
        <FacultyDetailModal
          faculty={facultyList.find((f) => f.id === selectedFacultyForView || f.name === selectedFacultyForView) || null}
          isOpen={true}
          onClose={() => setSelectedFacultyForView(null)}
        />
      )}

      {/* HOD Full Profile / Dossier Modal */}
      {selectedHODForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedHODForView.name}</h3>
                  <p className="text-xs text-purple-700 font-semibold">{selectedHODForView.department} • Head of Department</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHODForView(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Employee / HOD ID</span>
                <span className="font-mono font-bold text-slate-800">{selectedHODForView.id}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedHODForView.accountStatus || 'Active'}</span>
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Official Email</span>
                <span className="font-medium text-slate-800 break-all">{selectedHODForView.email}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Phone Number</span>
                <span className="font-medium text-slate-800">{selectedHODForView.phone || '+91 94432 00000'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Cabin Location</span>
                <span className="font-medium text-slate-800">{selectedHODForView.cabin || `${selectedHODForView.department} Block, HOD Cabin`}</span>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 col-span-2">
                <span className="text-purple-700 block text-[10px] uppercase font-bold">Login Access Password</span>
                <span className="font-mono font-bold text-purple-900">{selectedHODForView.password || 'hod123'}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                <span>Autonomous Department Authority</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Empowered to allocate courses, verify faculty lesson plans, endorse Continuous Internal Assessment (CIA) marks, and approve student attendance registers for {selectedHODForView.department}.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const hodToEdit = selectedHODForView;
                  setSelectedHODForView(null);
                  setEditingHOD(hodToEdit);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit HOD Details</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedHODForView(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT TUITION & FEE ACCOUNT MODAL */}
      {isAddFeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Student Tuition & Fee Account</h3>
                  <p className="text-[11px] text-slate-500">Autonomous semester fees structure, dues, and payment record</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFeeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newFeeForm.studentRegNo) return;
                const total = Number(newFeeForm.tuitionFee || 0) + Number(newFeeForm.developmentFee || 0) + Number(newFeeForm.examFee || 0);
                const paid = Number(newFeeForm.paidAmount || 0);
                const due = Math.max(0, total - paid);
                const status = due === 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending');

                addFeeRecord({
                  studentRegNo: newFeeForm.studentRegNo,
                  studentName: newFeeForm.studentName,
                  semester: Number(newFeeForm.semester),
                  academicYear: newFeeForm.academicYear,
                  totalFee: total,
                  paidAmount: paid,
                  dueAmount: due,
                  status,
                  noDueApproved: due === 0,
                  receiptNumber: due === 0 ? `REC-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
                });
                setIsAddFeeModalOpen(false);
              }}
              className="space-y-3.5 text-xs"
            >
              {/* Select Student */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Choose Student</label>
                <select
                  value={newFeeForm.studentRegNo || ''}
                  onChange={(e) => {
                    const sel = students.find((s) => s.regNo === e.target.value);
                    if (sel) {
                      setNewFeeForm({
                        ...newFeeForm,
                        studentRegNo: sel.regNo,
                        studentName: sel.name,
                        semester: sel.semester || 5,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:bg-white"
                  required
                >
                  <option value="">Select a student...</option>
                  {students.map((s) => (
                    <option key={s.regNo} value={s.regNo}>
                      {s.name} ({s.regNo}) - {s.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={newFeeForm.semester ?? 1}
                    onChange={(e) => setNewFeeForm({ ...newFeeForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={newFeeForm.academicYear || ''}
                    onChange={(e) => setNewFeeForm({ ...newFeeForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tuition Fee (₹)</label>
                  <input
                    type="number"
                    value={newFeeForm.tuitionFee ?? 0}
                    onChange={(e) => setNewFeeForm({ ...newFeeForm, tuitionFee: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Development (₹)</label>
                  <input
                    type="number"
                    value={newFeeForm.developmentFee ?? 0}
                    onChange={(e) => setNewFeeForm({ ...newFeeForm, developmentFee: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Fee (₹)</label>
                  <input
                    type="number"
                    value={newFeeForm.examFee ?? 0}
                    onChange={(e) => setNewFeeForm({ ...newFeeForm, examFee: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Paid Amount (₹)</label>
                <input
                  type="number"
                  value={newFeeForm.paidAmount ?? 0}
                  onChange={(e) => setNewFeeForm({ ...newFeeForm, paidAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:bg-white"
                  min={0}
                />
              </div>

              {/* Calculated Summary Callout */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Total Semester Fee</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{(Number(newFeeForm.tuitionFee || 0) + Number(newFeeForm.developmentFee || 0) + Number(newFeeForm.examFee || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Remaining Due</span>
                  <span className="font-bold text-rose-700 text-sm">
                    ₹{Math.max(
                      0,
                      Number(newFeeForm.tuitionFee || 0) +
                        Number(newFeeForm.developmentFee || 0) +
                        Number(newFeeForm.examFee || 0) -
                        Number(newFeeForm.paidAmount || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddFeeModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Fee Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT EXECUTIVE AUDIT REPORT MODAL */}
      {isPrintReportModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs print:p-0 print:static print:bg-white print:overflow-visible"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsPrintReportModalOpen(false);
            }
          }}
        >
          {/* FLOATING TOP-RIGHT CLOSE BUTTON - ALWAYS VISIBLE ON SCREEN */}
          <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 print:hidden">
            <button
              id="floating-close-report-btn"
              type="button"
              onClick={() => setIsPrintReportModalOpen(false)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-rose-700 text-white font-bold text-xs shadow-2xl border-2 border-white/25 transition-all cursor-pointer"
              title="Close Report (or press ESC)"
            >
              <X className="w-4 h-4 text-white" />
              <span>Close Report (ESC)</span>
            </button>
          </div>

          <div className="min-h-screen w-full flex flex-col items-center justify-start py-6 sm:py-10 px-3 sm:px-6">
            <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0">
              {/* STICKY TOP ACTION / NAVIGATION BAR */}
              <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs print:hidden">
                <div className="flex items-center gap-3">
                  <button
                    id="back-to-admin-btn"
                    type="button"
                    onClick={() => setIsPrintReportModalOpen(false)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-800" />
                    <span>← Back to Admin Dashboard</span>
                  </button>
                  <span className="hidden sm:inline-block text-xs font-bold text-slate-500 border-l border-slate-300 pl-3">
                    Institutional Audit Report
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerPrintReport('admin-printable-audit-doc', `PCET_Admin_Audit_${new Date().toISOString().split('T')[0]}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-sm cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Document Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrintReportModalOpen(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Exit</span>
                  </button>
                </div>
              </div>

            {/* Formal Institutional Printable Document Layout */}
            <div id="admin-printable-audit-doc" className="space-y-6 text-slate-800">
              {/* Institutional Crest & Letterhead */}
              <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
                <div className="flex justify-center mb-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
                    <GraduationCap className="w-7 h-7 text-amber-400" />
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  Park College of Engineering and Technology
                </h1>
                <p className="text-xs font-bold text-rose-800 tracking-wider uppercase">
                  (Autonomous Institution • Affiliated to Anna University, Chennai)
                </p>
                <p className="text-[11px] text-slate-600">
                  Approved by AICTE, New Delhi • Accredited by NAAC 'A' Grade & NBA Accredited Programs
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  NH-47, Avinashi Road, Kaniyur, Coimbatore, Tamil Nadu 641659
                </p>
              </div>

              {/* Report Subject & Meta Table */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs gap-2">
                <div>
                  <span className="font-bold text-slate-900 uppercase block tracking-wider">
                    Executive Academic Governance & Institutional Audit
                  </span>
                  <span className="text-slate-600">Audit Ref ID: <span className="font-mono font-bold text-slate-800">PCET/AUTONOMOUS/2026-Q1</span></span>
                </div>
                <div className="text-right sm:text-right">
                  <div>Academic Session: <span className="font-bold text-slate-900">2026-2027</span></div>
                  <div>Report Generated: <span className="font-bold text-slate-900">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                </div>
              </div>

              {/* Master Metrics Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <span>1. Institutional Vital Performance Summary</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Students</span>
                    <span className="text-xl font-black text-slate-900">{students.length}</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5 font-semibold">{students.filter(s => s.accountStatus === 'Active').length} Active Portfolios</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Faculty Roster</span>
                    <span className="text-xl font-black text-slate-900">{facultyList.length}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">{departments.length} Dept Allocated</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Course Syllabi</span>
                    <span className="text-xl font-black text-slate-900">{subjects.length}</span>
                    <span className="text-[10px] text-indigo-600 block mt-0.5 font-semibold">Reg R-2025 Standard</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Fee Realization</span>
                    <span className="text-xl font-black text-emerald-700">{feeCollectionRate}%</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">₹{totalFeesCollected.toLocaleString()} Total</span>
                  </div>
                </div>
              </div>

              {/* Department Governance Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-purple-600" />
                  <span>2. Autonomous Academic Departments & Leadership Roster</span>
                </h3>
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                      <tr>
                        <th className="py-2 px-3">Dept Code</th>
                        <th className="py-2 px-3">Department Name</th>
                        <th className="py-2 px-3">Allocated HOD</th>
                        <th className="py-2 px-3 text-center">Students</th>
                        <th className="py-2 px-3 text-center">Faculty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {departments.map((dept) => (
                        <tr key={dept.id}>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{dept.code}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{dept.name}</td>
                          <td className="py-2 px-3 text-purple-800 font-bold">{dept.hodName}</td>
                          <td className="py-2 px-3 text-center text-slate-700">{dept.totalStudents}</td>
                          <td className="py-2 px-3 text-center text-slate-700">{dept.totalFaculty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tuition & Account Audit Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>3. Tuition & Examination Accounts Audit</span>
                </h3>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Expected Billings</span>
                    <span className="font-bold text-slate-900">₹{totalFeesExpected.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Realized Collection</span>
                    <span className="font-bold text-emerald-700">₹{totalFeesCollected.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Outstanding / Arrears</span>
                    <span className="font-bold text-rose-700">₹{totalFeesPending.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Official Attestation & Signatures */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-slate-400 mx-6"></div>
                  <div className="font-bold text-slate-900">Dr. K. Senthil Kumar</div>
                  <div className="text-[10px] text-slate-500">Representative, HOD Council</div>
                </div>
                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-slate-400 mx-6"></div>
                  <div className="font-bold text-slate-900">Dr. R. Sharma</div>
                  <div className="text-[10px] text-slate-500">Controller of Examinations</div>
                </div>
                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-slate-400 mx-6"></div>
                  <div className="font-bold text-slate-900">{admin.name}</div>
                  <div className="text-[10px] text-slate-500">Chief System Administrator & Registrar</div>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400">
                This document is a certified administrative report issued by the Park College of Technology Autonomous Portal.
              </div>

              {/* BOTTOM NAVIGATION EXIT BAR */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <button
                  id="bottom-back-to-admin-btn"
                  type="button"
                  onClick={() => setIsPrintReportModalOpen(false)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-800" />
                  <span>← Back to Admin Dashboard</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerPrintReport('admin-printable-audit-doc')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-sm cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Document Now</span>
                  </button>
                  <button
                    id="bottom-close-report-btn"
                    type="button"
                    onClick={() => setIsPrintReportModalOpen(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Close Report (Exit)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={(updatedData) => {
            updateStudent(editingStudent.regNo, updatedData);
            setEditingStudent(null);
          }}
        />
      )}

      {editingFaculty && (
        <EditFacultyModal
          faculty={editingFaculty}
          onClose={() => setEditingFaculty(null)}
          onSave={(updatedData) => {
            updateFaculty(editingFaculty.id, updatedData);
            setEditingFaculty(null);
          }}
        />
      )}

      {/* EDIT HOD DETAILS MODAL */}
      {editingHOD && (
        <EditHODModal
          hod={editingHOD}
          isOpen={true}
          onClose={() => setEditingHOD(null)}
          onSave={() => {
            setEditingHOD(null);
          }}
        />
      )}

      {/* ALLOCATE HOD MODAL (Admin Only Authority) */}
      {isAllocateHODModalOpen && selectedDeptForHOD && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Allocate Department HOD</h3>
                  <p className="text-[11px] text-slate-500">{selectedDeptForHOD.name} ({selectedDeptForHOD.code})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAllocateHODModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {hodAllocSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{hodAllocSuccess}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!hodAllocForm.name.trim()) return;
                allocateHOD(
                  selectedDeptForHOD.id,
                  hodAllocForm.name.trim(),
                  hodAllocForm.email.trim(),
                  hodAllocForm.phone.trim(),
                  hodAllocForm.password.trim()
                );
                setHodAllocSuccess(`Successfully appointed ${hodAllocForm.name} as Head of Department for ${selectedDeptForHOD.name}.`);
                setTimeout(() => {
                  setIsAllocateHODModalOpen(false);
                  setHodAllocSuccess(null);
                }, 1500);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  disabled
                  value={`${selectedDeptForHOD.name} (${selectedDeptForHOD.code})`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  HOD Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. M. Senthil Kumar"
                  value={hodAllocForm.name || ''}
                  onChange={(e) => setHodAllocForm({ ...hodAllocForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  placeholder="hod.cse@college.edu"
                  value={hodAllocForm.email || ''}
                  onChange={(e) => setHodAllocForm({ ...hodAllocForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98421 11223"
                  value={hodAllocForm.phone || ''}
                  onChange={(e) => setHodAllocForm({ ...hodAllocForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  HOD Login Password *
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter password (default: hod123)"
                    value={hodAllocForm.password || ''}
                    onChange={(e) => setHodAllocForm({ ...hodAllocForm, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-mono font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  HOD can immediately log in using this name/email and password.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAllocateHODModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / ADD USER MODAL (Admin Power) */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create New User Account</h3>
                  <p className="text-[11px] text-slate-500">Allocate credentials for Student, Staff, HOD, or Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {createUserMsg && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  createUserMsg.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {createUserMsg.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{createUserMsg.text}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!createUserForm.name.trim()) {
                  setCreateUserMsg({ success: false, text: 'Name is required' });
                  return;
                }
                const result = addUser({
                  role: createUserForm.role,
                  name: createUserForm.name.trim(),
                  idOrRegNo: createUserForm.idOrRegNo.trim() || undefined,
                  email: createUserForm.email.trim() || undefined,
                  phone: createUserForm.phone.trim() || undefined,
                  department: createUserForm.department,
                  password: createUserForm.password.trim(),
                });

                if (result.success) {
                  setCreateUserMsg({
                    success: true,
                    text: `Account created successfully! ${createUserForm.name} can now log in immediately.`,
                  });
                  setTimeout(() => {
                    setIsCreateUserModalOpen(false);
                    setCreateUserMsg(null);
                  }, 1500);
                } else {
                  setCreateUserMsg({ success: false, text: result.message || 'Failed to create user' });
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Role *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['student', 'faculty', 'hod', 'admin'] as const).map((r) => {
                    const isSel = createUserForm.role === r;
                    const defaultPw =
                      r === 'student' ? 'student123' : r === 'faculty' ? 'staff123' : r === 'hod' ? 'hod123' : 'admin123';
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setCreateUserForm({
                            ...createUserForm,
                            role: r,
                            password: defaultPw,
                          });
                        }}
                        className={`py-2 text-center rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                          isSel
                            ? 'bg-rose-700 border-rose-700 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {r === 'faculty' ? 'Staff' : r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={createUserForm.name || ''}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {createUserForm.role === 'student' ? 'Register Number *' : 'Staff / Employee ID *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={createUserForm.role === 'student' ? '2023CSE015' : 'FAC010'}
                    value={createUserForm.idOrRegNo || ''}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, idOrRegNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={createUserForm.department || 'Computer Science and Engineering'}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  >
                    <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics and Communication">Electronics and Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="user@college.edu"
                    value={createUserForm.email || ''}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98400 12345"
                    value={createUserForm.phone || ''}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Login Password *
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter login password"
                    value={createUserForm.password || ''}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-mono font-bold"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  The user can immediately log in on the login page using this ID/Name and password.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CENTRAL ADMINISTRATOR PROFILE & CREDENTIALS MODAL */}
      {isEditAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Administrator Profile & Login Credentials</h3>
                  <p className="text-[11px] text-slate-500">Configure credentials required to open the Admin portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditAdminModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {adminProfileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{adminProfileSuccess}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!adminProfileForm.name.trim() || !adminProfileForm.email.trim()) return;
                updateAdminProfile({
                  name: adminProfileForm.name.trim(),
                  email: adminProfileForm.email.trim(),
                  phone: adminProfileForm.phone.trim(),
                  password: adminProfileForm.password.trim(),
                });
                setAdminProfileSuccess('Admin credentials saved successfully! Use this Name/Email and Password for login.');
                setTimeout(() => {
                  setAdminProfileSuccess(null);
                  setIsEditAdminModalOpen(false);
                }, 1400);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Administrator Full Name
                </label>
                <input
                  type="text"
                  required
                  value={adminProfileForm.name || ''}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
                  placeholder="e.g. Kasthuri (Central Administrator)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Administrator Official Email
                </label>
                <input
                  type="email"
                  required
                  value={adminProfileForm.email || ''}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })}
                  placeholder="e.g. kasthuricse23@sasurie.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={adminProfileForm.phone || ''}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })}
                  placeholder="+91 94432 00000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Login Password
                </label>
                <input
                  type="text"
                  required
                  value={adminProfileForm.password || ''}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, password: e.target.value })}
                  placeholder="Enter login password (e.g. admin123)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-xs font-mono font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Whatever name or email and password is saved here will be required on the Admin login tab.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditAdminModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Admin Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET CONFIRMATION */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Portal to Factory Default?</h3>
                <p className="text-xs text-slate-500">Restore all student portfolios, staff, and departments</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will reset all modified local data, newly allocated HODs, credentials, marks, and attendance back to original college defaults.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setIsResetConfirmModalOpen(false);
                  setResetDoneMsg(true);
                  setTimeout(() => setResetDoneMsg(false), 4000);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-xs"
              >
                Confirm Factory Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE DEPARTMENT CONFIRMATION */}
      {deptToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Department</h3>
                <p className="text-xs text-slate-500">Confirm department removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete the department <strong>{deptToDelete.name} ({deptToDelete.code})</strong>?
              This will remove this department from the active institutional directory.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeptToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDepartment(deptToDelete.id);
                  setDeptToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Department</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE FEE RECORD CONFIRMATION */}
      {feeToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Fee Record</h3>
                <p className="text-xs text-slate-500">Invoice #{feeToDelete.receiptNumber}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-2">
              <p>
                Are you sure you want to delete the fee record for <strong>{feeToDelete.studentName}</strong> (Reg: {feeToDelete.studentRegNo}, Semester {feeToDelete.semester})?
              </p>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
                <div>Total Invoice: <strong>₹{(feeToDelete.totalFee ?? 0).toLocaleString()}</strong></div>
                <div>Paid Amount: <span className="text-emerald-700 font-semibold">₹{(feeToDelete.paidAmount ?? 0).toLocaleString()}</span></div>
                <div>Balance Due: <span className="text-rose-700 font-semibold">₹{((feeToDelete.dueAmount ?? (feeToDelete.totalFee - feeToDelete.paidAmount)) ?? 0).toLocaleString()}</span></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFeeToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteFeeRecord(feeToDelete.id);
                  setFeeToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Fee Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE USER CONFIRMATION */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete {userToDelete.type === 'student' ? 'Student' : 'Faculty Member'}
                </h3>
                <p className="text-xs text-slate-500">ID: {userToDelete.id}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{userToDelete.name}</strong> from the college portal?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (userToDelete.type === 'student') {
                    deleteStudent(userToDelete.id);
                  } else {
                    deleteFaculty(userToDelete.id);
                  }
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
