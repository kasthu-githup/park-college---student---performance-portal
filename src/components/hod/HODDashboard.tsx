import React, { useState, useEffect, useMemo } from 'react';
import { usePortal } from '../../context/PortalContext';
import { HOD, Student, Faculty } from '../../types';
import { SUBJECT_CATALOG } from '../../data/initialData';
import { StudentDetailModal } from '../common/StudentDetailModal';
import { FacultyDetailModal } from '../common/FacultyDetailModal';
import { EditFacultyModal } from './EditFacultyModal';
import { LeaveODManagementView } from '../leave/LeaveODManagementView';
import { PrintReportModal } from '../reports/PrintReportModal';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Percent,
  Award,
  TrendingUp,
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  Printer,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Layers,
  ChevronRight,
  UserCheck,
  Edit3,
  Plus,
  Trash2,
  UserCog,
  XCircle,
  Save,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface HODDashboardProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const HODDashboard: React.FC<HODDashboardProps> = ({
  activeTab: controlledTab,
  onTabChange,
}) => {
  const {
    currentUser,
    students,
    facultyList,
    hod,
    subjects,
    attendanceRecords,
    deleteFaculty,
    allocateFacultyToSubject,
    allocateFacultyAdvisor,
    leaveRequests,
    updateHODProfile,
  } = usePortal();

  if (!currentUser || currentUser.role !== 'hod') return null;

  const [internalTab, setInternalTab] = useState<
    'overview' | 'students' | 'faculty' | 'leave' | 'subjectAttendance' | 'reports'
  >('overview');

  const currentHod: HOD = (currentUser?.data as HOD) || hod;

  // Edit HOD Profile & Credentials Modal
  const [isEditHodModalOpen, setIsEditHodModalOpen] = useState(false);
  const [hodProfileForm, setHodProfileForm] = useState({
    name: currentHod?.name || '',
    email: currentHod?.email || '',
    phone: currentHod?.phone || '',
    cabin: currentHod?.cabin || '',
    password: currentHod?.password || 'hod123',
  });
  const [hodProfileSuccess, setHodProfileSuccess] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);

  useEffect(() => {
    if (currentHod) {
      setHodProfileForm({
        name: currentHod.name || '',
        email: currentHod.email || '',
        phone: currentHod.phone || '',
        cabin: currentHod.cabin || '',
        password: currentHod.password || 'hod123',
      });
    }
  }, [currentHod]);

  const activeTab = (controlledTab as any) || internalTab;
  const setActiveTab = (tab: any) => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  // Search & Filters for Student Performance Explorer
  const [studentSearch, setStudentSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'A' | 'B'>('ALL');
  const [performanceFilter, setPerformanceFilter] = useState<string>('ALL');
  const [attendanceRiskFilter, setAttendanceRiskFilter] = useState<'ALL' | 'REGULAR' | 'RISK'>('ALL');

  // Reports state
  const [reportType, setReportType] = useState<'attendanceRegister' | 'masterMarksheet' | 'defaultersList'>(
    'attendanceRegister'
  );

  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  // Faculty edit state for HOD
  const [selectedFacultyForEdit, setSelectedFacultyForEdit] = useState<Faculty | null>(null);
  const [selectedFacultyForDossier, setSelectedFacultyForDossier] = useState<Faculty | null>(null);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isNewFaculty, setIsNewFaculty] = useState(false);

  // Department-specific Filtering for HOD Dashboard
  const deptStudents = useMemo(() => {
    const hodDept = (currentHod.department || '').toLowerCase().trim();
    if (!hodDept) return students;
    const filtered = students.filter((s) => {
      const sDept = (s.department || '').toLowerCase().trim();
      return (
        sDept === hodDept ||
        sDept.includes(hodDept) ||
        hodDept.includes(sDept) ||
        (hodDept.includes('computer') && sDept.includes('computer')) ||
        (hodDept.includes('electronics') && sDept.includes('electronics')) ||
        (hodDept.includes('mechanical') && sDept.includes('mechanical')) ||
        (hodDept.includes('information') && sDept.includes('information')) ||
        (hodDept.includes('artificial') && sDept.includes('artificial'))
      );
    });
    return filtered.length > 0 ? filtered : students;
  }, [students, currentHod.department]);

  const deptFaculty = useMemo(() => {
    const hodDept = (currentHod.department || '').toLowerCase().trim();
    if (!hodDept) return facultyList;
    const filtered = facultyList.filter((f) => {
      const fDept = (f.department || '').toLowerCase().trim();
      return (
        fDept === hodDept ||
        fDept.includes(hodDept) ||
        hodDept.includes(fDept) ||
        (hodDept.includes('computer') && fDept.includes('computer')) ||
        (hodDept.includes('electronics') && fDept.includes('electronics')) ||
        (hodDept.includes('mechanical') && fDept.includes('mechanical')) ||
        (hodDept.includes('information') && fDept.includes('information')) ||
        (hodDept.includes('artificial') && fDept.includes('artificial'))
      );
    });
    return filtered.length > 0 ? filtered : facultyList;
  }, [facultyList, currentHod.department]);

  // Staff Allocation Modal state (HOD Authority)
  const [isAllocateStaffModalOpen, setIsAllocateStaffModalOpen] = useState(false);
  const [allocStaffMode, setAllocStaffMode] = useState<'subject' | 'advisor'>('subject');
  const [allocSubjectCode, setAllocSubjectCode] = useState('CS3401');
  const [allocFacultyId, setAllocFacultyId] = useState(deptFaculty[0]?.id || facultyList[0]?.id || 'FAC001');
  const [allocAdvisorYear, setAllocAdvisorYear] = useState<number>(2);
  const [allocAdvisorSection, setAllocAdvisorSection] = useState<'A' | 'B'>('A');
  const [allocStaffSuccess, setAllocStaffSuccess] = useState<string | null>(null);

  // Department-wide Computations
  const totalStudents = deptStudents.length;
  const totalFaculty = deptFaculty.length;

  const totalAttended = deptStudents.reduce(
    (acc, s) => acc + s.overallAttendance.present + s.overallAttendance.od,
    0
  );
  const totalConducted = deptStudents.reduce((acc, s) => acc + s.overallAttendance.total, 0);
  const overallDeptAttendance =
    totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 1000) / 10 : 0;

  const avgDeptCgpa =
    deptStudents.length > 0
      ? Math.round((deptStudents.reduce((acc, s) => acc + s.cgpa, 0) / deptStudents.length) * 100) / 100
      : 0;

  const defaulters = deptStudents.filter((s) => s.overallAttendance.percentage < 75);

  // Filtered students for Explorer
  const filteredStudents = deptStudents.filter((s) => {
    if (
      studentSearch &&
      !s.name.toLowerCase().includes(studentSearch.toLowerCase()) &&
      !s.regNo.toLowerCase().includes(studentSearch.toLowerCase())
    ) {
      return false;
    }
    if (sectionFilter !== 'ALL' && s.section !== sectionFilter) return false;
    if (performanceFilter !== 'ALL' && s.performanceRating !== performanceFilter) return false;
    if (attendanceRiskFilter === 'REGULAR' && s.overallAttendance.percentage < 75) return false;
    if (attendanceRiskFilter === 'RISK' && s.overallAttendance.percentage >= 75) return false;
    return true;
  });

  // Chart Data: Performance Grade Breakdown
  const gradeCount: Record<string, number> = {
    Outstanding: 0,
    Good: 0,
    Average: 0,
    'Needs Attention': 0,
  };
  students.forEach((s) => {
    gradeCount[s.performanceRating] = (gradeCount[s.performanceRating] || 0) + 1;
  });

  const gradeChartData = [
    { name: 'Outstanding', count: gradeCount.Outstanding, color: '#8b5cf6' },
    { name: 'Good', count: gradeCount.Good, color: '#3b82f6' },
    { name: 'Average', count: gradeCount.Average, color: '#f59e0b' },
    { name: 'Needs Attention', count: gradeCount['Needs Attention'], color: '#ef4444' },
  ];

  // Chart Data: Subject-wise Pass & Average Attendance
  const subjectOverviewData = SUBJECT_CATALOG.map((subj) => {
    let totalScore = 0;
    let count = 0;
    let totalSubjAttd = 0;

    students.forEach((s) => {
      if (s.marks[subj.code]) {
        totalScore += s.marks[subj.code].totalPercentage;
        count++;
      }
      if (s.subjectAttendance[subj.code]) {
        totalSubjAttd += s.subjectAttendance[subj.code].percentage;
      }
    });

    const avgScore = count > 0 ? Math.round(totalScore / count) : 0;
    const avgAttd = count > 0 ? Math.round(totalSubjAttd / count) : 0;

    return {
      subject: subj.code,
      name: subj.name,
      avgMarks: avgScore,
      avgAttendance: avgAttd,
      faculty: subj.facultyName,
    };
  });

  // Export CSV Helper
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'attendanceRegister') {
      csvContent += 'Register No,Student Name,Section,Total Classes,Present,Absent,OD,Attendance Percentage,Eligibility\n';
      students.forEach((s) => {
        csvContent += `${s.regNo},"${s.name}",${s.section},${s.overallAttendance.total},${s.overallAttendance.present},${s.overallAttendance.absent},${s.overallAttendance.od},${s.overallAttendance.percentage}%,${s.overallAttendance.percentage >= 75 ? 'ELIGIBLE' : 'DEFAULTER'}\n`;
      });
    } else if (reportType === 'masterMarksheet') {
      csvContent += 'Register No,Student Name,Section,CS501 (DBMS),CS502 (DAA),CS503 (CN),CS504 (TOC),CGPA,SGPA,Rating\n';
      students.forEach((s) => {
        csvContent += `${s.regNo},"${s.name}",${s.section},${s.marks.CS501?.totalPercentage || '-'},${s.marks.CS502?.totalPercentage || '-'},${s.marks.CS503?.totalPercentage || '-'},${s.marks.CS504?.totalPercentage || '-'},${s.cgpa},${s.currentSemesterGpa},${s.performanceRating}\n`;
      });
    } else {
      csvContent += 'Register No,Student Name,Section,Email,Phone,Attendance Percentage,Advisor\n';
      defaulters.forEach((s) => {
        csvContent += `${s.regNo},"${s.name}",${s.section},${s.email},${s.phone},${s.overallAttendance.percentage}%,${s.facultyAdvisor}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentHod.department.replace(/\s+/g, '_')}_Department_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top HOD Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-purple-800 text-white flex items-center justify-center text-lg font-bold shadow-2xs shrink-0">
              {currentHod.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {currentHod.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                  Head of Department ({currentHod.department})
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {currentHod.department} • Park College of Engineering and Technology
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-1">
                <span>{currentHod.email}</span>
                <span>• {currentHod.phone}</span>
                <span>• {currentHod.cabin}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-center gap-1.5 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="hod-edit-profile-btn"
                type="button"
                onClick={() => {
                  setHodProfileForm({
                    name: currentHod.name,
                    email: currentHod.email,
                    phone: currentHod.phone,
                    cabin: currentHod.cabin,
                    password: currentHod.password || 'hod123',
                  });
                  setHodProfileSuccess(null);
                  setIsEditHodModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-800 transition-colors cursor-pointer shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Edit Profile & Password</span>
              </button>

              <button
                id="hod-print-btn"
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-800 transition-colors cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-purple-600" />
                <span>Print Department Report</span>
              </button>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-xs font-bold text-purple-800">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>HOD Executive Oversight</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">Full Department Academic Visibility</span>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* KPI 1: Total Students */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Students
            </span>
            <Users className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
            {totalStudents}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Sections A & B</p>
        </div>

        {/* KPI 2: Total Faculty */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              CSE Faculty
            </span>
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
            {totalFaculty}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">6 Core Courses</p>
        </div>

        {/* KPI 3: Dept Attendance % */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Overall Attendance
            </span>
            <Percent className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1.5">
            {overallDeptAttendance}%
          </div>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Dept Avg</p>
        </div>

        {/* KPI 4: Dept CGPA */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Dept Avg CGPA
            </span>
            <Award className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 mt-1.5">
            {avgDeptCgpa.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Scale of 10.0</p>
        </div>

        {/* KPI 5: Defaulters Count */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              Defaulter Alerts
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1.5">
            {defaulters.length}
          </div>
          <p className="text-[10px] text-rose-700 font-semibold mt-0.5">&lt; 75% Attendance</p>
        </div>
      </div>

      {/* HOD In-Page Tab Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Department Overview</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'students'
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Students Directory</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faculty')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'faculty'
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Faculty Directory</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('leave')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'leave'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Student Leave & OD Approvals</span>
          {leaveRequests.filter((l) => l.status === 'Pending').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
              {leaveRequests.filter((l) => l.status === 'Pending').length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('subjectAttendance')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'subjectAttendance'
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Attendance Analytics</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Official Reports</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE DEPARTMENT OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: Subject-wise Average Marks and Attendance */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  Subject Average Marks vs Attendance %
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Department correlation per core course</p>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectOverviewData} margin={{ top: 5, right: 10, left: -20, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length > 0 && payload[0]?.payload) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-md">
                              <div className="font-bold">{data.name} ({label})</div>
                              <div className="text-slate-300 text-[11px]">Faculty: {data.faculty}</div>
                              <div className="text-indigo-400 font-semibold mt-0.5 text-[11px]">
                                Avg Marks: {data.avgMarks}%
                              </div>
                              <div className="text-emerald-400 font-semibold text-[11px]">
                                Avg Attendance: {data.avgAttendance}%
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                    <Bar dataKey="avgMarks" fill="#6366f1" name="Avg Marks (%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="avgAttendance" fill="#10b981" name="Avg Attendance (%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Academic Performance Tier Distribution */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  Student Academic Standing Breakdown
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Distribution across performance tiers</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradeChartData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        innerRadius={38}
                      >
                        {gradeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-xs">
                  {gradeChartData.map((g) => (
                    <div key={g.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                        <span className="font-semibold text-slate-800 text-[11px]">{g.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 text-[11px]">{g.count} Students</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Low Attendance Defaulter Alerts Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-rose-50/70 border-b border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <div>
                  <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                    Immediate Action: Low Attendance Defaulter List (&lt; 75%)
                  </h3>
                  <p className="text-[10px] text-rose-700">
                    Parents to be notified; exam hall ticket verification required.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-200 text-rose-900">
                {defaulters.length} At-Risk
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Register No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-2.5">Section</th>
                    <th className="py-2.5 px-2.5">Attendance %</th>
                    <th className="py-2.5 px-2.5">Faculty Advisor</th>
                    <th className="py-2.5 px-2.5">Parent Contact</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {defaulters.map((stu) => (
                    <tr key={stu.regNo} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{stu.regNo}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{stu.name}</td>
                      <td className="py-2.5 px-2.5 font-semibold text-slate-700">Sec {stu.section}</td>
                      <td className="py-2.5 px-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                          {stu.overallAttendance.percentage}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-slate-700">{stu.facultyAdvisor}</td>
                      <td className="py-2.5 px-2.5 text-slate-600">{stu.phone}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForModal(stu)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold border border-indigo-200 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT PERFORMANCE EXPLORER */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="hod-student-search-input"
                  type="text"
                  placeholder="Search Name or Reg No..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-slate-900 font-medium"
                />
              </div>

              {/* Section Filter */}
              <div>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white"
                >
                  <option value="ALL">All Sections (A & B)</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>

              {/* Performance Tier */}
              <div>
                <select
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white"
                >
                  <option value="ALL">All Performance Tiers</option>
                  <option value="Outstanding">Outstanding</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>
              </div>

              {/* Attendance Filter */}
              <div>
                <select
                  value={attendanceRiskFilter}
                  onChange={(e) => setAttendanceRiskFilter(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white"
                >
                  <option value="ALL">All Attendance Levels</option>
                  <option value="REGULAR">Eligible (&gt;= 75%)</option>
                  <option value="RISK">Shortage Alert (&lt; 75%)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-0.5">
              <span>Showing <strong>{filteredStudents.length}</strong> students</span>
              <span className="text-purple-700 font-semibold">View-Only Access Enforced</span>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Register No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-2.5">Year / Sec</th>
                    <th className="py-2.5 px-2.5 text-center">Attendance %</th>
                    <th className="py-2.5 px-2.5 text-center">CGPA</th>
                    <th className="py-2.5 px-2.5 text-center">Sem 5 GPA</th>
                    <th className="py-2.5 px-2.5 text-center">Standing</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((stu) => (
                    <tr key={stu.regNo} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{stu.regNo}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{stu.name}</div>
                        <div className="text-[10px] text-slate-400">{stu.email}</div>
                      </td>
                      <td className="py-2.5 px-2.5 font-medium text-slate-700">
                        Yr {stu.year} • Sec {stu.section}
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            stu.overallAttendance.percentage >= 75
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800 animate-pulse'
                          }`}
                        >
                          {stu.overallAttendance.percentage}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-bold text-indigo-700">
                        {stu.cgpa.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-bold text-teal-700">
                        {stu.currentSemesterGpa.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            stu.performanceRating === 'Outstanding'
                              ? 'bg-purple-100 text-purple-800'
                              : stu.performanceRating === 'Good'
                              ? 'bg-blue-100 text-blue-800'
                              : stu.performanceRating === 'Average'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {stu.performanceRating}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForModal(stu)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FACULTY & WORKLOAD INFORMATION */}
      {/* ========================================================================= */}
      {activeTab === 'faculty' && (
        <div className="space-y-3">
          {/* Top Control Bar for Faculty Management */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Faculty Directory & Workload Management
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  {facultyList.length} Active Faculty
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                HOD Authority: Edit faculty profiles, assign course workloads, and configure mentor assignments.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="hod-allocate-staff-btn"
                type="button"
                onClick={() => {
                  setAllocStaffSuccess(null);
                  setIsAllocateStaffModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 shadow-xs transition-colors cursor-pointer"
                title="HOD Authority: Allocate faculty to courses or appoint as Class Advisor"
              >
                <UserCog className="w-4 h-4" />
                <span>Allocate Staff</span>
              </button>

              <button
                id="hod-add-faculty-btn"
                type="button"
                onClick={() => {
                  setSelectedFacultyForEdit(null);
                  setIsNewFaculty(true);
                  setIsFacultyModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New Faculty</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {facultyList.map((fac) => {
              const totalAssignedStudents = fac.assignedClasses.reduce(
                (acc, c) => acc + c.totalStudents,
                0
              );

              return (
                <div
                  key={fac.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-purple-200 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-sm shadow-2xs">
                          {fac.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 text-sm">{fac.name}</h4>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              {fac.id}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium">{fac.designation}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedFacultyForDossier(fac)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                          title="View complete 360° faculty dossier & publications"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-600" />
                          <span>360° Dossier</span>
                        </button>
                        <button
                          id={`edit-faculty-${fac.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedFacultyForEdit(fac);
                            setIsNewFaculty(false);
                            setIsFacultyModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                          title="Edit all faculty details and workload"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Details</span>
                        </button>
                        {facultyList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFacultyToDelete(fac)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete faculty record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Faculty Dossier Highlights */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                        {fac.qualification || 'M.E / Ph.D'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                        {fac.experienceYears || 10}+ Yrs Exp
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        {fac.publicationsCount || 12} Papers
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        Mentor (Sec {fac.assignedMenteeSection})
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span className="text-[11px]">Email:</span>
                        <span className="font-medium text-slate-900 text-[11px]">{fac.email}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="text-[11px]">Phone:</span>
                        <span className="font-medium text-slate-900 text-[11px]">{fac.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="text-[11px]">Cabin & Location:</span>
                        <span className="font-medium text-slate-900 text-[11px]">{fac.cabin}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="text-[11px]">Specialization:</span>
                        <span className="font-medium text-slate-800 text-[11px] truncate max-w-[200px]" title={fac.specialization}>
                          {fac.specialization || 'Computer Science'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Assigned Courses & Workload</span>
                        <span className="text-purple-700 font-semibold">{fac.assignedClasses.length} courses</span>
                      </div>
                      <div className="space-y-1.5">
                        {fac.assignedClasses.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-800 text-[11px]">
                                {c.subjectCode} - {c.subjectName}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Year {c.year} • Section {c.section} (Sem {c.semester})
                              </div>
                            </div>
                            <span className="font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {c.totalStudents} Students
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Active Teaching Load: {fac.assignedClasses.length} Batches</span>
                    <span className="font-bold text-purple-700">
                      {totalAssignedStudents} Total Students Enrolled
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAllocFacultyId(fac.id);
                      setAllocStaffSuccess(null);
                      setIsAllocateStaffModalOpen(true);
                    }}
                    className="w-full mt-2.5 py-1.5 px-2.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="HOD Authority: Allocate this staff to courses or appoint as Class Advisor"
                  >
                    <UserCog className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Allocate Staff Role</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SUBJECT-WISE ATTENDANCE */}
      {/* ========================================================================= */}
      {activeTab === 'subjectAttendance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Department Core Course Attendance Matrix
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Subject Code & Name</th>
                    <th className="py-2.5 px-2.5">Faculty In-Charge</th>
                    <th className="py-2.5 px-2.5 text-center">Enrolled</th>
                    <th className="py-2.5 px-2.5 text-center">Avg Attendance %</th>
                    <th className="py-2.5 px-2.5 text-center">Defaulters (&lt; 75%)</th>
                    <th className="py-2.5 px-3 text-center">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SUBJECT_CATALOG.map((subj) => {
                    const enrolled = students.filter((s) => s.subjects.includes(subj.code));
                    const subjDefaulters = enrolled.filter(
                      (s) => (s.subjectAttendance[subj.code]?.percentage ?? 100) < 75
                    );
                    const avgSubjAttd =
                      enrolled.length > 0
                        ? Math.round(
                            enrolled.reduce(
                              (acc, s) => acc + (s.subjectAttendance[subj.code]?.percentage ?? 100),
                              0
                            ) / enrolled.length
                          )
                        : 100;

                    return (
                      <tr key={subj.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{subj.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{subj.code} • {subj.credits} Credits</div>
                        </td>
                        <td className="py-2.5 px-2.5 font-semibold text-slate-700">{subj.facultyName}</td>
                        <td className="py-2.5 px-2.5 text-center text-slate-700">{enrolled.length}</td>
                        <td className="py-2.5 px-2.5 text-center font-bold text-slate-900">
                          {avgSubjAttd}%
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          {subjDefaulters.length > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                              {subjDefaulters.length} Students
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold text-[11px]">0 (100% Eligible)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              avgSubjAttd >= 85
                                ? 'bg-emerald-100 text-emerald-800'
                                : avgSubjAttd >= 75
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {avgSubjAttd >= 85 ? 'Excellent' : avgSubjAttd >= 75 ? 'Satisfactory' : 'Needs Review'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: OFFICIAL REPORTS & EXPORT */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Report Selector and Actions */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Official Report
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white"
                >
                  <option value="attendanceRegister">Department Attendance Register</option>
                  <option value="masterMarksheet">Consolidated Master Marksheet</option>
                  <option value="defaultersList">Low Attendance Defaulter Notice</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportToCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export to CSV</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* Printable Report Preview Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs print:p-0 print:border-none">
            <div className="text-center border-b border-slate-200 pb-3 mb-3">
              <h2 className="text-base font-extrabold text-slate-900">
                Park College of Engineering and Technology — Department of CSE
              </h2>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mt-0.5">
                {reportType === 'attendanceRegister' && 'Official Department Attendance Register'}
                {reportType === 'masterMarksheet' && 'Official Master Academic Marksheet (Semester 5)'}
                {reportType === 'defaultersList' && 'Attendance Shortage Defaulter Official Notice'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Generated by HOD Office • Date: 2026-08-27 • Academic Year: 2026-2027
              </p>
            </div>

            {/* Attendance Register Format */}
            {reportType === 'attendanceRegister' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-2.5 border-r border-slate-200">Reg No</th>
                      <th className="py-2 px-2.5 border-r border-slate-200">Student Name</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">Sec</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">Total Classes</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">Present</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">Absent</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">OD</th>
                      <th className="py-2 px-2 text-center border-r border-slate-200">Percentage</th>
                      <th className="py-2 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {students.map((s) => (
                      <tr key={s.regNo}>
                        <td className="py-1.5 px-2.5 font-mono font-bold border-r border-slate-200">{s.regNo}</td>
                        <td className="py-1.5 px-2.5 font-semibold border-r border-slate-200">{s.name}</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200">{s.section}</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200">{s.overallAttendance.total}</td>
                        <td className="py-1.5 px-1.5 text-center text-emerald-700 font-bold border-r border-slate-200">{s.overallAttendance.present}</td>
                        <td className="py-1.5 px-1.5 text-center text-rose-700 font-bold border-r border-slate-200">{s.overallAttendance.absent}</td>
                        <td className="py-1.5 px-1.5 text-center text-amber-700 font-bold border-r border-slate-200">{s.overallAttendance.od}</td>
                        <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200">{s.overallAttendance.percentage}%</td>
                        <td className="py-1.5 px-2 text-center">
                          {s.overallAttendance.percentage >= 75 ? (
                            <span className="text-emerald-700 font-bold">ELIGIBLE</span>
                          ) : (
                            <span className="text-rose-700 font-bold">DEFAULTER</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Master Marksheet Format */}
            {reportType === 'masterMarksheet' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-2.5 border-r border-slate-200">Reg No</th>
                      <th className="py-2 px-2.5 border-r border-slate-200">Student Name</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">Sec</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">CS501 (DBMS)</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">CS502 (DAA)</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">CS503 (CN)</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">CS504 (TOC)</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">CGPA</th>
                      <th className="py-2 px-1.5 text-center border-r border-slate-200">Sem 5 GPA</th>
                      <th className="py-2 px-2 text-center">Standing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {students.map((s) => (
                      <tr key={s.regNo}>
                        <td className="py-1.5 px-2.5 font-mono font-bold border-r border-slate-200">{s.regNo}</td>
                        <td className="py-1.5 px-2.5 font-semibold border-r border-slate-200">{s.name}</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200">{s.section}</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200">{s.marks.CS501?.totalPercentage || '-'}%</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200">{s.marks.CS502?.totalPercentage || '-'}%</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200">{s.marks.CS503?.totalPercentage || '-'}%</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200">{s.marks.CS504?.totalPercentage || '-'}%</td>
                        <td className="py-1.5 px-1.5 text-center font-bold text-indigo-700 border-r border-slate-200">{s.cgpa.toFixed(2)}</td>
                        <td className="py-1.5 px-1.5 text-center font-bold text-teal-700 border-r border-slate-200">{s.currentSemesterGpa.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-center font-semibold">{s.performanceRating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Defaulter Notice Format */}
            {reportType === 'defaultersList' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-rose-50 text-rose-900 font-bold border-b border-rose-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-2.5 border-r border-rose-200">Reg No</th>
                      <th className="py-2 px-2.5 border-r border-rose-200">Student Name</th>
                      <th className="py-2 px-1.5 text-center border-r border-rose-200">Sec</th>
                      <th className="py-2 px-2 border-r border-rose-200">Official Email</th>
                      <th className="py-2 px-2 border-r border-rose-200">Parent Contact</th>
                      <th className="py-2 px-2 text-center border-r border-rose-200">Attendance %</th>
                      <th className="py-2 px-2">Faculty Advisor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {defaulters.map((s) => (
                      <tr key={s.regNo}>
                        <td className="py-1.5 px-2.5 font-mono font-bold border-r border-slate-200">{s.regNo}</td>
                        <td className="py-1.5 px-2.5 font-semibold border-r border-slate-200">{s.name}</td>
                        <td className="py-1.5 px-1.5 text-center border-r border-slate-200">{s.section}</td>
                        <td className="py-1.5 px-2 border-r border-slate-200">{s.email}</td>
                        <td className="py-1.5 px-2 border-r border-slate-200">{s.phone}</td>
                        <td className="py-1.5 px-2 text-center font-bold text-rose-700 border-r border-slate-200">{s.overallAttendance.percentage}%</td>
                        <td className="py-1.5 px-2">{s.facultyAdvisor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
              <div>HOD Signature: _______________________</div>
              <div>Principal Seal & Verification: _______________________</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: STUDENT LEAVE & ON-DUTY (OD) APPROVALS (HOD OVERSIGHT)               */}
      {/* ========================================================================= */}
      {activeTab === 'leave' && (
        <LeaveODManagementView reviewerRole="hod" />
      )}

      {/* Student 360 Detail Modal */}
      {selectedStudentForModal && (
        <StudentDetailModal
          student={selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
          canEdit={false}
        />
      )}

      {/* Faculty 360 Dossier Modal */}
      {selectedFacultyForDossier && (
        <FacultyDetailModal
          faculty={selectedFacultyForDossier}
          onClose={() => setSelectedFacultyForDossier(null)}
          onEdit={() => {
            setSelectedFacultyForEdit(selectedFacultyForDossier);
            setIsNewFaculty(false);
            setIsFacultyModalOpen(true);
          }}
          canEdit={true}
        />
      )}

      {/* HOD Faculty Edit & Manage Modal */}
      {isFacultyModalOpen && (
        <EditFacultyModal
          faculty={selectedFacultyForEdit}
          isOpen={isFacultyModalOpen}
          onClose={() => {
            setIsFacultyModalOpen(false);
            setSelectedFacultyForEdit(null);
          }}
          isNew={isNewFaculty}
        />
      )}

      {/* HOD ALLOCATE STAFF MODAL (HOD Authority) */}
      {isAllocateStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <UserCog className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Allocate Staff (HOD Authority)</h3>
                  <p className="text-[11px] text-slate-500">Assign faculty to teaching curriculum or class advisor appointments</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAllocateStaffModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAllocStaffMode('subject');
                  setAllocStaffSuccess(null);
                }}
                className={`py-1.5 px-3 rounded-md transition-all cursor-pointer ${
                  allocStaffMode === 'subject'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Subject / Course Allocation
              </button>
              <button
                type="button"
                onClick={() => {
                  setAllocStaffMode('advisor');
                  setAllocStaffSuccess(null);
                }}
                className={`py-1.5 px-3 rounded-md transition-all cursor-pointer ${
                  allocStaffMode === 'advisor'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Class Advisor Allocation
              </button>
            </div>

            {allocStaffSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{allocStaffSuccess}</span>
              </div>
            )}

            {allocStaffMode === 'subject' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  allocateFacultyToSubject(allocSubjectCode, allocFacultyId);
                  const facName = facultyList.find((f) => f.id === allocFacultyId)?.name || allocFacultyId;
                  const subjTitle = subjects.find((s) => s.code === allocSubjectCode)?.name || allocSubjectCode;
                  setAllocStaffSuccess(`Successfully allocated ${facName} to teach ${subjTitle} (${allocSubjectCode}).`);
                  setTimeout(() => {
                    setIsAllocateStaffModalOpen(false);
                    setAllocStaffSuccess(null);
                  }, 1800);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Faculty Member *
                  </label>
                  <select
                    value={allocFacultyId || ''}
                    onChange={(e) => setAllocFacultyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-medium"
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.id}) — {f.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Subject / Autonomous Course *
                  </label>
                  <select
                    value={allocSubjectCode || ''}
                    onChange={(e) => setAllocSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name} (Sem {s.semester}, {s.credits} Credits) [Currently: {s.faculty}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAllocateStaffModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg font-bold text-white bg-indigo-700 hover:bg-indigo-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Course Allocation</span>
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const targetFaculty = facultyList.find((f) => f.id === allocFacultyId);
                  if (!targetFaculty) return;
                  allocateFacultyAdvisor(targetFaculty.name, allocAdvisorYear, allocAdvisorSection);
                  setAllocStaffSuccess(
                    `Successfully appointed ${targetFaculty.name} as Class Advisor for Year ${allocAdvisorYear}, Section ${allocAdvisorSection}. All section students updated.`
                  );
                  setTimeout(() => {
                    setIsAllocateStaffModalOpen(false);
                    setAllocStaffSuccess(null);
                  }, 1800);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Faculty for Class Advisor Appointment *
                  </label>
                  <select
                    value={allocFacultyId || ''}
                    onChange={(e) => setAllocFacultyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-medium"
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.id}) — {f.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Academic Year *
                    </label>
                    <select
                      value={allocAdvisorYear ?? 1}
                      onChange={(e) => setAllocAdvisorYear(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-medium"
                    >
                      <option value={1}>Year 1</option>
                      <option value={2}>Year 2</option>
                      <option value={3}>Year 3</option>
                      <option value={4}>Year 4</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Class Section *
                    </label>
                    <select
                      value={allocAdvisorSection || 'A'}
                      onChange={(e) => setAllocAdvisorSection(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-medium"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  Note: Appointing this faculty member will automatically update all students in Year {allocAdvisorYear} Section {allocAdvisorSection} to have this faculty as their registered Advisor.
                </p>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAllocateStaffModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg font-bold text-white bg-indigo-700 hover:bg-indigo-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Advisor Allocation</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EDIT HOD PROFILE & LOGIN CREDENTIALS MODAL */}
      {isEditHodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">HOD Profile & Login Credentials</h3>
                  <p className="text-[11px] text-slate-500">Configure credentials required to open the HOD portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditHodModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {hodProfileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{hodProfileSuccess}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!hodProfileForm.name.trim() || !hodProfileForm.email.trim()) return;
                updateHODProfile({
                  name: hodProfileForm.name.trim(),
                  email: hodProfileForm.email.trim(),
                  phone: hodProfileForm.phone.trim(),
                  cabin: hodProfileForm.cabin.trim(),
                  password: hodProfileForm.password.trim(),
                });
                setHodProfileSuccess('HOD credentials saved successfully! Use this Name/ID and Password for login.');
                setTimeout(() => {
                  setHodProfileSuccess(null);
                  setIsEditHodModalOpen(false);
                }, 1400);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  HOD Full Name
                </label>
                <input
                  type="text"
                  required
                  value={hodProfileForm.name || ''}
                  onChange={(e) => setHodProfileForm({ ...hodProfileForm, name: e.target.value })}
                  placeholder="e.g. Dr. K. Senthil Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  value={hodProfileForm.email || ''}
                  onChange={(e) => setHodProfileForm({ ...hodProfileForm, email: e.target.value })}
                  placeholder="e.g. csehod@park.ac.in"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={hodProfileForm.phone || ''}
                    onChange={(e) => setHodProfileForm({ ...hodProfileForm, phone: e.target.value })}
                    placeholder="+91 94432 00000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    HOD Cabin Location
                  </label>
                  <input
                    type="text"
                    value={hodProfileForm.cabin || ''}
                    onChange={(e) => setHodProfileForm({ ...hodProfileForm, cabin: e.target.value })}
                    placeholder="CSE Block, Room 101"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Login Password
                </label>
                <input
                  type="text"
                  required
                  value={hodProfileForm.password || ''}
                  onChange={(e) => setHodProfileForm({ ...hodProfileForm, password: e.target.value })}
                  placeholder="Enter login password (e.g. hod123)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-xs font-mono font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Whatever name and password is saved here will be required on the HOD login tab.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditHodModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold text-white bg-purple-700 hover:bg-purple-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save HOD Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Global Printable Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        defaultReport="departmentAudit"
      />

      {/* MODAL: DELETE FACULTY CONFIRMATION */}
      {facultyToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Remove Faculty Member</h3>
                <p className="text-xs text-slate-500">ID: {facultyToDelete.id}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{facultyToDelete.name}</strong> from the department faculty roster?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFacultyToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteFaculty(facultyToDelete.id);
                  setFacultyToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Faculty</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
