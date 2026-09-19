import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Faculty, AttendanceStatus, AttendanceRecord, Student } from '../../types';
import { StudentDetailModal } from '../common/StudentDetailModal';
import { FacultyDetailModal } from '../common/FacultyDetailModal';
import { EditStudentModal } from './EditStudentModal';
import { EditFacultyModal } from '../hod/EditFacultyModal';
import { PrintReportModal } from '../reports/PrintReportModal';
import {
  UserCheck,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Users,
  Search,
  Filter,
  Eye,
  Edit3,
  Layers,
  Award,
  FileCheck,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
  HeartHandshake,
  MessageSquarePlus,
  History,
  Phone,
  Mail,
  User,
  CheckCircle,
  GraduationCap,
  UserPlus,
  ShieldAlert,
  XCircle,
  Printer,
  FileText,
} from 'lucide-react';
import { LeaveODManagementView } from '../leave/LeaveODManagementView';

interface FacultyDashboardProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  activeTab: controlledTab,
  onTabChange,
}) => {
  const {
    currentUser,
    students,
    saveAttendanceBatch,
    updateStudentMarks,
    updateAssignmentStatus,
    updateStudentPerformance,
    addMentorMeetingNote,
    attendanceRecords,
    allocateStudentToAdvisor,
    leaveRequests,
  } = usePortal();

  // Safety check: ensure role is faculty
  if (!currentUser || currentUser.role !== 'faculty') return null;

  const faculty = currentUser.data as Faculty;

  // Active navigation tab within Faculty Dashboard
  const [internalTab, setInternalTab] = useState<
    'attendance' | 'marks' | 'assignments' | 'mentor' | 'students' | 'leave'
  >('attendance');

  const activeTab = (controlledTab as any) || internalTab;
  const setActiveTab = (tab: any) => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  // Student Edit Modal State for Faculty
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [isNewStudentModal, setIsNewStudentModal] = useState(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [isEditFacultyModalOpen, setIsEditFacultyModalOpen] = useState(false);
  const [selectedFacultyForEdit, setSelectedFacultyForEdit] = useState<Faculty | null>(null);

  // Allocate Students Modal State (Staff Authority)
  const [isAllocateStudentModalOpen, setIsAllocateStudentModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedRegNosToAllocate, setSelectedRegNosToAllocate] = useState<string[]>([]);
  const [allocStudentFilter, setAllocStudentFilter] = useState<'all' | 'unallocated' | 'sameSection'>('all');
  const [allocStudentSearch, setAllocStudentSearch] = useState('');
  const [allocStudentSuccess, setAllocStudentSuccess] = useState<string | null>(null);

  // Fallback assigned class in case faculty profile is missing assignedClasses
  const defaultClass = {
    subjectCode: 'CS501',
    subjectName: 'Database Management Systems',
    year: 3,
    semester: 5,
    section: 'A' as const,
    totalStudents: 32,
  };
  const assignedClasses =
    faculty?.assignedClasses && faculty.assignedClasses.length > 0
      ? faculty.assignedClasses
      : [defaultClass];

  // --- ATTENDANCE TAB STATE ---
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const currentAssignedClass =
    assignedClasses[selectedClassIndex] || assignedClasses[0] || defaultClass;

  const [attendanceDate, setAttendanceDate] = useState<string>('2026-08-27');
  const [attendancePeriod, setAttendancePeriod] = useState<number>(1);

  // Filter students belonging to the selected section
  const sectionStudents = students.filter(
    (s) =>
      s.year === currentAssignedClass.year &&
      s.section === currentAssignedClass.section
  );

  // Local attendance state for the current editing batch: studentRegNo -> Status
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    const initialMap: Record<string, AttendanceStatus> = {};
    // Check if there are already existing logs for this date, subject, section
    sectionStudents.forEach((stu) => {
      const existing = attendanceRecords.find(
        (rec) =>
          rec.date === '2026-08-27' &&
          rec.subjectCode === currentAssignedClass.subjectCode &&
          rec.regNo === stu.regNo
      );
      initialMap[stu.regNo] = existing ? existing.status : 'Present';
    });
    return initialMap;
  });

  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);

  // Synchronize attendanceMap when changing class or date
  const handleClassChange = (index: number) => {
    setSelectedClassIndex(index);
    const targetClass = assignedClasses[index] || currentAssignedClass;
    const targetStudents = students.filter(
      (s) => s.year === targetClass.year && s.section === targetClass.section
    );

    const newMap: Record<string, AttendanceStatus> = {};
    targetStudents.forEach((stu) => {
      const existing = attendanceRecords.find(
        (rec) =>
          rec.date === attendanceDate &&
          rec.subjectCode === targetClass.subjectCode &&
          rec.regNo === stu.regNo
      );
      newMap[stu.regNo] = existing ? existing.status : 'Present';
    });
    setAttendanceMap(newMap);
  };

  const handleDateChange = (date: string) => {
    setAttendanceDate(date);
    const newMap: Record<string, AttendanceStatus> = {};
    sectionStudents.forEach((stu) => {
      const existing = attendanceRecords.find(
        (rec) =>
          rec.date === date &&
          rec.subjectCode === currentAssignedClass.subjectCode &&
          rec.regNo === stu.regNo
      );
      newMap[stu.regNo] = existing ? existing.status : 'Present';
    });
    setAttendanceMap(newMap);
  };

  const setStudentStatus = (regNo: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [regNo]: status,
    }));
  };

  const markAllStatus = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    sectionStudents.forEach((s) => {
      updated[s.regNo] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = () => {
    const recordsToSave: AttendanceRecord[] = sectionStudents.map((stu) => ({
      id: `att-${currentAssignedClass.subjectCode}-${attendanceDate}-${stu.regNo}`,
      date: attendanceDate,
      regNo: stu.regNo,
      studentName: stu.name,
      subjectCode: currentAssignedClass.subjectCode,
      subjectName: currentAssignedClass.subjectName,
      section: currentAssignedClass.section,
      year: currentAssignedClass.year,
      status: attendanceMap[stu.regNo] || 'Present',
      markedBy: faculty.name,
      period: attendancePeriod,
    }));

    saveAttendanceBatch(recordsToSave);
    setAttendanceSavedToast(true);
    setTimeout(() => setAttendanceSavedToast(false), 3000);
  };

  // Attendance live counters for the form
  const currentPresentCount = sectionStudents.filter(
    (s) => (attendanceMap[s.regNo] || 'Present') === 'Present'
  ).length;
  const currentAbsentCount = sectionStudents.filter(
    (s) => (attendanceMap[s.regNo] || 'Present') === 'Absent'
  ).length;
  const currentOdCount = sectionStudents.filter(
    (s) => (attendanceMap[s.regNo] || 'Present') === 'OD'
  ).length;
  const currentAttendancePct =
    sectionStudents.length > 0
      ? Math.round(((currentPresentCount + currentOdCount) / sectionStudents.length) * 100)
      : 100;

  // --- MARKS TAB STATE ---
  const [marksClassIndex, setMarksClassIndex] = useState(0);
  const marksAssignedClass =
    assignedClasses[marksClassIndex] || assignedClasses[0] || defaultClass;
  const [selectedAssessment, setSelectedAssessment] = useState<
    'all' | 'internal1' | 'internal2' | 'modelExam' | 'assignment'
  >('all');

  const marksStudents = students.filter(
    (s) => s.year === marksAssignedClass.year && s.section === marksAssignedClass.section
  );

  const [marksToast, setMarksToast] = useState(false);

  // --- ASSIGNMENT TAB STATE ---
  const [assignmentClassIndex, setAssignmentClassIndex] = useState(0);
  const assignmentAssignedClass =
    assignedClasses[assignmentClassIndex] || assignedClasses[0] || defaultClass;
  const assignmentStudents = students.filter(
    (s) => s.year === assignmentAssignedClass.year && s.section === assignmentAssignedClass.section
  );

  // --- MENTOR HUB STATE ---
  const [menteeSectionFilter, setMenteeSectionFilter] = useState<'MY_SECTION' | 'A' | 'B'>('MY_SECTION');
  const [selectedMenteeForNote, setSelectedMenteeForNote] = useState<Student | null>(null);
  const [noteCategory, setNoteCategory] = useState<
    'Academic Performance' | 'Attendance Shortage' | 'Career Guidance' | 'Personal Well-being' | 'Disciplinary'
  >('Academic Performance');
  const [noteDate, setNoteDate] = useState('2026-08-27');
  const [noteDiscussion, setNoteDiscussion] = useState('');
  const [noteActionPlan, setNoteActionPlan] = useState('');
  const [noteFollowUp, setNoteFollowUp] = useState('2026-09-10');
  const [mentorToast, setMentorToast] = useState(false);

  // Determine mentees for current faculty
  const facultyMentees = students.filter((stu) => {
    if (menteeSectionFilter === 'MY_SECTION') {
      return faculty.assignedMenteeSection ? stu.section === faculty.assignedMenteeSection : stu.section === 'A';
    }
    return stu.section === menteeSectionFilter;
  });

  const handleSaveMentorNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenteeForNote || !noteDiscussion.trim()) return;

    addMentorMeetingNote({
      regNo: selectedMenteeForNote.regNo,
      date: noteDate,
      mentorName: faculty.name,
      topics: `${noteCategory}: ${noteDiscussion.substring(0, 40)}...`,
      discussionSummary: noteDiscussion,
      actionPlan: noteActionPlan || 'Continue regular study hours and monitor class attendance weekly.',
      followUpDate: noteFollowUp,
    });

    setMentorToast(true);
    setNoteDiscussion('');
    setNoteActionPlan('');
    setTimeout(() => {
      setMentorToast(false);
      setSelectedMenteeForNote(null);
    }, 1200);
  };

  // --- STUDENT DIRECTORY SEARCH & MODAL ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'A' | 'B'>('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'REGULAR' | 'DEFAULTER'>('ALL');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  const facultyManagedStudents = students.filter((stu) => {
    // Check if in faculty's assigned sections
    const inAssignedSection = faculty.assignedClasses.some(
      (c) => c.year === stu.year && c.section === stu.section
    );
    if (!inAssignedSection) return false;

    // Search query match
    if (
      searchQuery &&
      !stu.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !stu.regNo.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Section filter
    if (sectionFilter !== 'ALL' && stu.section !== sectionFilter) {
      return false;
    }

    // Attendance filter
    if (attendanceFilter === 'REGULAR' && stu.overallAttendance.percentage < 75) {
      return false;
    }
    if (attendanceFilter === 'DEFAULTER' && stu.overallAttendance.percentage >= 75) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner with Faculty Profile */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-700 text-white flex items-center justify-center text-lg font-bold shadow-2xs shrink-0">
              {(faculty.name || 'F').charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {faculty.name || 'Faculty Member'}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  {faculty.designation || 'Faculty'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {faculty.department} • Cabin: {faculty.cabin || 'Main Block'}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="text-[11px] font-bold text-slate-500">Assigned:</span>
                {assignedClasses.map((c, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {c.subjectCode} ({((c.subjectName || '').split(' ')[0])}) - Sec {c.section}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-center gap-1.5 shrink-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedFacultyForEdit(faculty);
                  setIsEditFacultyModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 transition-colors cursor-pointer shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Edit Profile & Password</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMyProfileOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-900 transition-colors cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Academic Dossier</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                id="faculty-print-btn"
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-800 transition-colors cursor-pointer shadow-2xs"
                title="Open and Print Class Attendance Register & CIA Sheet"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>Print Register / Sheet</span>
              </button>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Staff Portal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty In-Page Tab Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Attendance Entry</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('marks')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'marks'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Internal Marks</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'students'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Student Directory</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Assignments</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mentor')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'mentor'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Mentorship</span>
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
          <span>Student Leave & OD</span>
          {leaveRequests.filter((l) => l.status === 'Pending').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
              {leaveRequests.filter((l) => l.status === 'Pending').length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY ATTENDANCE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Controls Bar: Class Selector, Date Picker, Period */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Select Assigned Subject / Class */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Subject & Class
                </label>
                <select
                  value={selectedClassIndex}
                  onChange={(e) => handleClassChange(Number(e.target.value))}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white"
                >
                  {faculty.assignedClasses.map((c, idx) => (
                    <option key={idx} value={idx}>
                      {c.subjectCode} - {c.subjectName} (Sec {c.section})
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendance Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white"
                />
              </div>

              {/* Class Period */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Class Period
                </label>
                <select
                  value={attendancePeriod}
                  onChange={(e) => setAttendancePeriod(Number(e.target.value))}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white"
                >
                  <option value={1}>Period 1 (09:00 - 09:50 AM)</option>
                  <option value={2}>Period 2 (09:50 - 10:40 AM)</option>
                  <option value={3}>Period 3 (11:00 - 11:50 AM)</option>
                  <option value={4}>Period 4 (11:50 - 12:40 PM)</option>
                  <option value={5}>Period 5 (01:40 - 02:30 PM)</option>
                  <option value={6}>Period 6 (02:30 - 03:20 PM)</option>
                </select>
              </div>

              {/* Quick Batch Actions */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quick Batch Actions
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => markAllStatus('Present')}
                    className="flex-1 py-1.5 px-2 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => markAllStatus('Absent')}
                    className="flex-1 py-1.5 px-2 text-[11px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    All Absent
                  </button>
                </div>
              </div>
            </div>

            {/* Live Attendance Counters & Status calculation */}
            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium">
                  Total: <strong className="text-slate-900">{sectionStudents.length}</strong>
                </span>
                <span className="text-emerald-700 font-semibold">
                  Present: <strong>{currentPresentCount}</strong>
                </span>
                <span className="text-amber-700 font-semibold">
                  OD: <strong>{currentOdCount}</strong>
                </span>
                <span className="text-rose-700 font-semibold">
                  Absent: <strong>{currentAbsentCount}</strong>
                </span>
                <span className="text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 text-[11px]">
                  Today: {currentAttendancePct}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  title="Print Current Section Attendance Register"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-700" />
                  <span>Print Register</span>
                </button>
                <button
                  id="save-attendance-btn"
                  type="button"
                  onClick={handleSaveAttendance}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Attendance Register</span>
                </button>
              </div>
            </div>
          </div>

          {attendanceSavedToast && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Attendance for {currentAssignedClass.subjectCode} on {attendanceDate} saved successfully! Cumulative percentages updated.
                </span>
              </div>
            </div>
          )}

          {/* Attendance Table Format matching requested prompt table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Attendance Register: {currentAssignedClass.subjectName} ({currentAssignedClass.subjectCode})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Section {currentAssignedClass.section} • Date: {attendanceDate} • Period {attendancePeriod}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Register No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-2.5">Date</th>
                    <th className="py-2.5 px-2.5">Subject</th>
                    <th className="py-2.5 px-3 text-center">Mark Status (Present / Absent / OD)</th>
                    <th className="py-2.5 px-3 text-center">Cumulative Attd %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sectionStudents.map((stu) => {
                    const currentStatus = attendanceMap[stu.regNo] || 'Present';
                    return (
                      <tr key={stu.regNo} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {stu.regNo}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{stu.name}</div>
                          <div className="text-[10px] text-slate-500">{stu.email}</div>
                        </td>
                        <td className="py-2.5 px-2.5 font-medium text-slate-600">{attendanceDate}</td>
                        <td className="py-2.5 px-2.5 font-medium text-slate-700">
                          {currentAssignedClass.subjectCode}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setStudentStatus(stu.regNo, 'Present')}
                              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-emerald-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudentStatus(stu.regNo, 'Absent')}
                              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                currentStatus === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-rose-700'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudentStatus(stu.regNo, 'OD')}
                              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                currentStatus === 'OD'
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-amber-700'
                              }`}
                            >
                              OD
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`font-bold ${
                              stu.overallAttendance.percentage >= 75
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {stu.overallAttendance.percentage}%
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
      {/* TAB 2: MARKS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'marks' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Class
                </label>
                <select
                  value={marksClassIndex}
                  onChange={(e) => setMarksClassIndex(Number(e.target.value))}
                  className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white"
                >
                  {faculty.assignedClasses.map((c, idx) => (
                    <option key={idx} value={idx}>
                      {c.subjectCode} - {c.subjectName} (Sec {c.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assessment Focus
                </label>
                <select
                  value={selectedAssessment}
                  onChange={(e) => setSelectedAssessment(e.target.value as any)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white"
                >
                  <option value="all">All Assessments (Comprehensive)</option>
                  <option value="internal1">Internal 1 (Max 50)</option>
                  <option value="internal2">Internal 2 (Max 50)</option>
                  <option value="modelExam">Model Exam (Max 100)</option>
                  <option value="assignment">Assignment (Max 10)</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Editing marks for <strong>{marksAssignedClass.subjectCode}</strong> • Section {marksAssignedClass.section}
            </div>
          </div>

          {marksToast && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Student marks updated and weighted SGPA recalculated successfully!</span>
            </div>
          )}

          {/* Marks Entry Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Internal Marks Sheet • {marksAssignedClass.subjectName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Direct inline editing. Updates weighted totals and GPA automatically.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Register No & Name</th>
                    <th className="py-2.5 px-2.5 text-center">Internal 1 (50)</th>
                    <th className="py-2.5 px-2.5 text-center">Internal 2 (50)</th>
                    <th className="py-2.5 px-2.5 text-center">Model Exam (100)</th>
                    <th className="py-2.5 px-2.5 text-center">Assignment (10)</th>
                    <th className="py-2.5 px-2.5 text-center font-bold">Total (%)</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marksStudents.map((stu) => {
                    const currentMarks = stu.marks[marksAssignedClass.subjectCode] || {
                      subjectCode: marksAssignedClass.subjectCode,
                      subjectName: marksAssignedClass.subjectName,
                      internal1: 0,
                      internal2: 0,
                      modelExam: 0,
                      assignment: 0,
                      totalPercentage: 0,
                      grade: 'RA',
                    };

                    return (
                      <tr key={stu.regNo} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-slate-900">{stu.regNo}</div>
                          <div className="text-slate-700 font-semibold">{stu.name}</div>
                        </td>

                        {/* Internal 1 Input */}
                        <td className="py-2.5 px-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={currentMarks?.internal1 ?? 0}
                            onChange={(e) => {
                              const val = Math.min(50, Math.max(0, Number(e.target.value)));
                              updateStudentMarks(stu.regNo, marksAssignedClass.subjectCode, {
                                internal1: val,
                              });
                            }}
                            className="w-14 text-center py-1 px-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-slate-900 focus:bg-white"
                          />
                        </td>

                        {/* Internal 2 Input */}
                        <td className="py-2.5 px-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={currentMarks?.internal2 ?? 0}
                            onChange={(e) => {
                              const val = Math.min(50, Math.max(0, Number(e.target.value)));
                              updateStudentMarks(stu.regNo, marksAssignedClass.subjectCode, {
                                internal2: val,
                              });
                            }}
                            className="w-14 text-center py-1 px-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-slate-900 focus:bg-white"
                          />
                        </td>

                        {/* Model Exam Input */}
                        <td className="py-2.5 px-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={currentMarks?.modelExam ?? 0}
                            onChange={(e) => {
                              const val = Math.min(100, Math.max(0, Number(e.target.value)));
                              updateStudentMarks(stu.regNo, marksAssignedClass.subjectCode, {
                                modelExam: val,
                              });
                            }}
                            className="w-14 text-center py-1 px-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-slate-900 focus:bg-white"
                          />
                        </td>

                        {/* Assignment Input */}
                        <td className="py-2.5 px-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            max={10}
                            step={0.5}
                            value={currentMarks?.assignment ?? 0}
                            onChange={(e) => {
                              const val = Math.min(10, Math.max(0, Number(e.target.value)));
                              updateStudentMarks(stu.regNo, marksAssignedClass.subjectCode, {
                                assignment: val,
                              });
                            }}
                            className="w-14 text-center py-1 px-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-slate-900 focus:bg-white"
                          />
                        </td>

                        {/* Weighted Total */}
                        <td className="py-2.5 px-2.5 text-center font-bold text-indigo-700 bg-indigo-50/40">
                          {currentMarks.totalPercentage}%
                        </td>

                        {/* Grade */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              currentMarks.grade.startsWith('O') || currentMarks.grade.startsWith('A')
                                ? 'bg-emerald-100 text-emerald-800'
                                : currentMarks.grade.startsWith('B')
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {currentMarks.grade}
                          </span>
                        </td>

                        {/* View student detail modal */}
                        <td className="py-2.5 px-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForModal(stu)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                            title="View / Edit Performance Remarks"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
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
      {/* TAB 3: ASSIGNMENT STATUS */}
      {/* ========================================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Class
              </label>
              <select
                value={assignmentClassIndex}
                onChange={(e) => setAssignmentClassIndex(Number(e.target.value))}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white"
              >
                {faculty.assignedClasses.map((c, idx) => (
                  <option key={idx} value={idx}>
                    {c.subjectCode} - {c.subjectName} (Sec {c.section})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Managing assignments for <strong>{assignmentAssignedClass.subjectCode}</strong>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Student Coursework & Assignment Submissions
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {assignmentStudents.map((stu) => {
                const relevantAssignments = stu.assignments.filter(
                  (a) => a.subjectCode === assignmentAssignedClass.subjectCode
                );

                return (
                  <div key={stu.regNo} className="p-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                          {stu.regNo}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{stu.name}</span>
                        <span className="text-[11px] text-slate-500">(Sec {stu.section})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {relevantAssignments.map((asg) => (
                        <div
                          key={asg.id}
                          className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between gap-1.5"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-800">{asg.title}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Due: {asg.dueDate} {asg.submittedOn && `• Submitted: ${asg.submittedOn}`}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                            {/* Status selector */}
                            <select
                              value={asg.status || 'Pending'}
                              onChange={(e) =>
                                updateAssignmentStatus(
                                  stu.regNo,
                                  asg.id,
                                  e.target.value as any,
                                  asg.score
                                )
                              }
                              className={`text-[11px] font-semibold rounded-md px-2 py-0.5 border ${
                                asg.status === 'Graded'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : asg.status === 'Submitted'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : asg.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              <option value="Submitted">Submitted</option>
                              <option value="Graded">Graded</option>
                              <option value="Pending">Pending</option>
                              <option value="Late">Late</option>
                            </select>

                            {/* Score input */}
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-slate-500 font-medium">Score:</span>
                              <input
                                type="number"
                                min={0}
                                max={asg.maxScore}
                                step={0.5}
                                value={asg.score ?? ''}
                                placeholder="0-10"
                                onChange={(e) =>
                                  updateAssignmentStatus(
                                    stu.regNo,
                                    asg.id,
                                    asg.status,
                                    e.target.value === '' ? undefined : Number(e.target.value)
                                  )
                                }
                                className="w-12 py-0.5 px-1.5 text-xs font-bold text-center bg-slate-50 border border-slate-300 rounded text-slate-900"
                              />
                              <span className="text-[11px] text-slate-400">/ {asg.maxScore}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CLASS MENTOR & MENTEE HUB */}
      {/* ========================================================================= */}
      {activeTab === 'mentor' && (
        <div className="space-y-4">
          {/* Mentorship Overview Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Class Mentorship & Counseling Desk
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Faculty Advisor for {faculty.assignedMenteeSection ? `Section ${faculty.assignedMenteeSection}` : 'Assigned Students'} • Student Growth & Academic Counseling
                  </p>
                </div>
              </div>

              {/* Filter & Advisor Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {faculty.assignedMenteeSection && (
                  <button
                    id="advisor-onboard-mentee-btn"
                    type="button"
                    onClick={() => {
                      setSelectedStudentForEdit(null);
                      setIsNewStudentModal(true);
                      setIsEditStudentModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-2xs transition-all cursor-pointer"
                    title={`Class Advisor Desk: Add student to Section ${faculty.assignedMenteeSection}`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Onboard Student (Sec {faculty.assignedMenteeSection})</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
                  <span className="text-[11px] font-bold text-slate-500">View:</span>
                  <select
                    value={menteeSectionFilter}
                    onChange={(e) => setMenteeSectionFilter(e.target.value as any)}
                    className="text-xs font-semibold bg-transparent text-slate-900 focus:outline-hidden"
                  >
                    <option value="MY_SECTION">My Section ({faculty.assignedMenteeSection || 'A'})</option>
                    <option value="A">All Section A</option>
                    <option value="B">All Section B</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Total Mentees</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{facultyMentees.length}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200">
                <span className="text-[11px] text-rose-700 font-medium">Attendance &lt; 75% Risk</span>
                <div className="text-lg font-bold text-rose-700 mt-0.5">
                  {facultyMentees.filter((s) => s.overallAttendance.percentage < 75).length}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                <span className="text-[11px] text-amber-700 font-medium">Academic CGPA &lt; 7.5</span>
                <div className="text-lg font-bold text-amber-700 mt-0.5">
                  {facultyMentees.filter((s) => s.cgpa < 7.5).length}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200">
                <span className="text-[11px] text-indigo-700 font-medium">Counseling Notes Logged</span>
                <div className="text-lg font-bold text-indigo-700 mt-0.5">
                  {facultyMentees.reduce((acc, s) => acc + (s.mentorNotes?.length || 0), 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Mentee List Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Assigned Student Mentees ({facultyMentees.length})
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Class Advisor / Mentor cohort for {faculty.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRegNosToAllocate([]);
                  setAllocStudentSuccess(null);
                  setIsAllocateStudentModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                title="Staff Authority: Allocate/Assign students to your advisory cohort"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Allocate Students to My Cohort</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Reg No & Name</th>
                    <th className="py-2.5 px-2.5 text-center">Attd %</th>
                    <th className="py-2.5 px-2.5 text-center">CGPA</th>
                    <th className="py-2.5 px-2.5">Parent / Contact</th>
                    <th className="py-2.5 px-2.5">Performance Rating & Remarks</th>
                    <th className="py-2.5 px-2.5 text-center">Mentor History</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facultyMentees.map((stu) => {
                    const notesCount = stu.mentorNotes?.length || 0;
                    return (
                      <tr key={stu.regNo} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{stu.name}</div>
                          <div className="font-mono text-[11px] font-bold text-slate-500">
                            {stu.regNo} • Sec {stu.section}
                          </div>
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
                        <td className="py-2.5 px-2.5 text-slate-600">
                          <div className="font-medium text-slate-800">{stu.parentName || 'Parent / Guardian'}</div>
                          <div className="text-[10px] text-slate-500">{stu.parentPhone || stu.phone}</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
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
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                            {stu.facultyRemarks || 'No mentor notes logged yet'}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <History className="w-3 h-3 text-slate-400" />
                            <span>{notesCount} session{notesCount === 1 ? '' : 's'}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              id={`edit-student-mentee-${stu.regNo}`}
                              type="button"
                              onClick={() => {
                                setSelectedStudentForEdit(stu);
                                setIsEditStudentModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-bold transition-colors cursor-pointer"
                              title="Edit all student details (Marks, Attendance, Profile)"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedMenteeForNote(stu)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-bold transition-colors cursor-pointer"
                              title="Log counseling session for this mentee"
                            >
                              <MessageSquarePlus className="w-3 h-3" />
                              <span>Counseling</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForModal(stu)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                              title="View full 360 profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal / Dialog to Log Counseling Session */}
          {selectedMenteeForNote && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
              <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                      <MessageSquarePlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Record Mentoring / Counseling Note
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Mentee: <strong>{selectedMenteeForNote.name}</strong> ({selectedMenteeForNote.regNo})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMenteeForNote(null)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md"
                  >
                    ✕
                  </button>
                </div>

                {mentorToast && (
                  <div className="mx-4 mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Counseling note recorded successfully in student mentor ledger!</span>
                  </div>
                )}

                {/* Form Body */}
                <form onSubmit={handleSaveMentorNote} className="p-4 overflow-y-auto space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Meeting Date
                      </label>
                      <input
                        type="date"
                        required
                        value={noteDate || ''}
                        onChange={(e) => setNoteDate(e.target.value)}
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Counseling Category
                      </label>
                      <select
                        value={noteCategory || 'Academic Performance'}
                        onChange={(e) => setNoteCategory(e.target.value as any)}
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                      >
                        <option value="Academic Performance">Academic Performance</option>
                        <option value="Attendance Shortage">Attendance Shortage</option>
                        <option value="Career Guidance">Career & Placement Guidance</option>
                        <option value="Personal Well-being">Personal Well-being</option>
                        <option value="Disciplinary">Disciplinary / Conduct</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Discussion Summary & Guidance Provided
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={noteDiscussion || ''}
                      onChange={(e) => setNoteDiscussion(e.target.value)}
                      placeholder="Discussed internal exam performance, unit test backlogs, daily attendance regularisation..."
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Action Plan & Student Targets
                    </label>
                    <input
                      type="text"
                      value={noteActionPlan || ''}
                      onChange={(e) => setNoteActionPlan(e.target.value)}
                      placeholder="e.g. Complete remedial assignments, submit attendance proof, meet mentor weekly"
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Next Follow-Up Date
                    </label>
                    <input
                      type="date"
                      value={noteFollowUp || ''}
                      onChange={(e) => setNoteFollowUp(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                    />
                  </div>

                  {/* Past Notes for this student */}
                  {selectedMenteeForNote.mentorNotes && selectedMenteeForNote.mentorNotes.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                        Previous Mentoring Sessions ({selectedMenteeForNote.mentorNotes.length}):
                      </span>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {selectedMenteeForNote.mentorNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px]"
                          >
                            <div className="flex items-center justify-between text-slate-500 font-semibold mb-0.5">
                              <span>{note.date} • {note.mentorName}</span>
                              {note.followUpDate && <span className="text-indigo-600">Follow-up: {note.followUpDate}</span>}
                            </div>
                            <p className="text-slate-800 font-medium">{note.discussionSummary}</p>
                            {note.actionPlan && (
                              <p className="text-emerald-700 mt-0.5 text-[10px]">
                                Action: {note.actionPlan}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMenteeForNote(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Counseling Note</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: STUDENT DIRECTORY & SEARCH */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="faculty-student-search-input"
                  type="text"
                  placeholder="Search by Reg No or Name..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              {/* Attendance Filter */}
              <div>
                <select
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white"
                >
                  <option value="ALL">All Attendance Tiers</option>
                  <option value="REGULAR">Regular (&gt;= 75%)</option>
                  <option value="DEFAULTER">Low Attendance Alert (&lt; 75%)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="text-xs text-slate-500 font-medium">
                Showing <strong>{facultyManagedStudents.length}</strong> matching students in your assigned classes.
              </div>
              {faculty.assignedMenteeSection ? (
                <button
                  id="directory-add-student-btn"
                  type="button"
                  onClick={() => {
                    setSelectedStudentForEdit(null);
                    setIsNewStudentModal(true);
                    setIsEditStudentModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
                  title={`Class Advisor Privilege: Enroll new student into Section ${faculty.assignedMenteeSection}`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add New Student (Sec {faculty.assignedMenteeSection})</span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-500 italic flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Student onboarding is restricted to appointed Class Advisors</span>
                </div>
              )}
            </div>
          </div>

          {/* Student Records Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Register No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-2.5">Dept / Sec</th>
                    <th className="py-2.5 px-2.5">Contact</th>
                    <th className="py-2.5 px-2.5 text-center">Attendance</th>
                    <th className="py-2.5 px-2.5 text-center">CGPA</th>
                    <th className="py-2.5 px-2.5 text-center">Performance</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facultyManagedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        No students match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    facultyManagedStudents.map((stu) => (
                      <tr key={stu.regNo} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {stu.regNo}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{stu.name}</td>
                        <td className="py-2.5 px-2.5 text-slate-600 font-medium">
                          CSE • Sec {stu.section} (Yr {stu.year})
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-600">
                          <div>{stu.phone}</div>
                          <div className="text-[10px] text-slate-400">{stu.email}</div>
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
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              id={`edit-student-dir-${stu.regNo}`}
                              type="button"
                              onClick={() => {
                                setSelectedStudentForEdit(stu);
                                setIsEditStudentModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-bold transition-colors cursor-pointer"
                              title="Edit all student details (Marks, Attendance, Profile)"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForModal(stu)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              title="View student 360 overview"
                            >
                              <Eye className="w-3 h-3" />
                              <span>360 View</span>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: STUDENT LEAVE & ON-DUTY (OD) REVIEW & APPROVALS                    */}
      {/* ========================================================================= */}
      {activeTab === 'leave' && (
        <LeaveODManagementView reviewerRole="faculty" />
      )}

      {/* Student 360 Detail Modal */}
      {selectedStudentForModal && (
        <StudentDetailModal
          student={selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
          canEdit={true}
        />
      )}

      {/* Faculty 360 Academic Dossier Modal */}
      {isMyProfileOpen && (
        <FacultyDetailModal
          faculty={faculty}
          onClose={() => setIsMyProfileOpen(false)}
          canEdit={false}
        />
      )}

      {/* Faculty Student Edit / Add Modal */}
      {isEditStudentModalOpen && (
        <EditStudentModal
          student={selectedStudentForEdit}
          isOpen={isEditStudentModalOpen}
          isNew={isNewStudentModal}
          defaultSection={faculty.assignedMenteeSection || 'A'}
          defaultFacultyAdvisor={faculty.name}
          onClose={() => {
            setIsEditStudentModalOpen(false);
            setSelectedStudentForEdit(null);
            setIsNewStudentModal(false);
          }}
        />
      )}

      {/* Edit Faculty Profile Modal */}
      {isEditFacultyModalOpen && selectedFacultyForEdit && (
        <EditFacultyModal
          faculty={selectedFacultyForEdit}
          isOpen={isEditFacultyModalOpen}
          onClose={() => {
            setIsEditFacultyModalOpen(false);
            setSelectedFacultyForEdit(null);
          }}
        />
      )}

      {/* ALLOCATE STUDENTS TO ADVISORY COHORT (Staff Authority) */}
      {isAllocateStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Allocate Students to Your Advisory Cohort</h3>
                  <p className="text-[11px] text-slate-500">
                    Assign student mentees to <span className="font-semibold text-slate-700">{faculty.name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAllocateStudentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {allocStudentSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{allocStudentSuccess}</span>
              </div>
            )}

            {/* Filter and Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Search student by name or Reg No..."
                value={allocStudentSearch || ''}
                onChange={(e) => setAllocStudentSearch(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAllocStudentFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    allocStudentFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Students
                </button>
                <button
                  type="button"
                  onClick={() => setAllocStudentFilter('unallocated')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    allocStudentFilter === 'unallocated'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Not in My Cohort
                </button>
                {faculty.assignedMenteeSection && (
                  <button
                    type="button"
                    onClick={() => setAllocStudentFilter('sameSection')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      allocStudentFilter === 'sameSection'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Sec {faculty.assignedMenteeSection}
                  </button>
                )}
              </div>
            </div>

            {/* Student selection list */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-72">
              {students
                .filter((s) => {
                  const matchesSearch =
                    s.name.toLowerCase().includes(allocStudentSearch.toLowerCase()) ||
                    s.regNo.toLowerCase().includes(allocStudentSearch.toLowerCase());
                  if (!matchesSearch) return false;
                  if (allocStudentFilter === 'unallocated') {
                    return s.facultyAdvisor !== faculty.name;
                  }
                  if (allocStudentFilter === 'sameSection') {
                    return s.section === faculty.assignedMenteeSection;
                  }
                  return true;
                })
                .map((s) => {
                  const isChecked = selectedRegNosToAllocate.includes(s.regNo);
                  const isCurrent = s.facultyAdvisor === faculty.name;
                  return (
                    <label
                      key={s.regNo}
                      className={`flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        isChecked ? 'bg-indigo-50/60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRegNosToAllocate([...selectedRegNosToAllocate, s.regNo]);
                            } else {
                              setSelectedRegNosToAllocate(
                                selectedRegNosToAllocate.filter((r) => r !== s.regNo)
                              );
                            }
                          }}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{s.name}</span>
                            <span className="font-mono text-[10px] text-slate-500 font-semibold">
                              {s.regNo}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Year {s.year} • Sec {s.section} • CGPA: {s.cgpa.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isCurrent
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isCurrent ? 'Your Mentee' : `Advisor: ${s.facultyAdvisor}`}
                        </span>
                      </div>
                    </label>
                  );
                })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="text-slate-600">
                <span className="font-bold text-indigo-700">{selectedRegNosToAllocate.length}</span> students selected
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAllocateStudentModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedRegNosToAllocate.length === 0}
                  onClick={() => {
                    allocateStudentToAdvisor(selectedRegNosToAllocate, faculty.name);
                    setAllocStudentSuccess(
                      `Successfully allocated ${selectedRegNosToAllocate.length} student(s) to ${faculty.name}'s advisory cohort.`
                    );
                    setTimeout(() => {
                      setIsAllocateStudentModalOpen(false);
                      setSelectedRegNosToAllocate([]);
                      setAllocStudentSuccess(null);
                    }, 1600);
                  }}
                  className="px-4 py-1.5 rounded-lg font-bold text-white bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Confirm Allocation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Global Printable Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        defaultReport="facultyRegister"
      />
    </div>
  );
};
