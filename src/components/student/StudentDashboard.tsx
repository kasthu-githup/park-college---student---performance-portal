import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Student, LeaveRequest, AttendanceRecord } from '../../types';
import { PrintReportModal, ReportKind } from '../reports/PrintReportModal';
import {
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  CreditCard,
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Plus,
  ChevronRight,
  TrendingUp,
  Download,
  Printer,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  HeartHandshake,
  Layers,
  X,
} from 'lucide-react';

interface StudentDashboardProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  activeTab: controlledTab,
  onTabChange,
}) => {
  const {
    currentUser,
    students,
    fees,
    announcements,
    leaveRequests,
    submitLeaveRequest,
    examSchedules,
    attendanceRecords,
  } = usePortal();

  const [localTab, setLocalTab] = useState('overview');
  const activeTab = controlledTab || localTab;
  const setTab = (t: string) => {
    if (onTabChange) onTabChange(t);
    else setLocalTab(t);
  };

  const currentStudentData = currentUser?.data as Student | undefined;
  const student: Student | undefined =
    students.find((s) => s.regNo === currentStudentData?.regNo) || currentStudentData;

  // Print Report State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printReportKind, setPrintReportKind] = useState<ReportKind>('studentGradeCard');

  // Leave Form State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<'Medical' | 'On-Duty (OD)' | 'Personal' | 'Symposium / Conference'>('Personal');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600">No student session active. Please log in.</p>
      </div>
    );
  }

  const studentFees = fees.filter((f) => f.studentRegNo === student.regNo);
  const studentLeaves = leaveRequests.filter((l) => l.studentRegNo === student.regNo);
  const studentAttendanceRecords = attendanceRecords.filter((a) => a.regNo === student.regNo);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    submitLeaveRequest({
      studentRegNo: student.regNo,
      studentName: student.name,
      department: student.department,
      year: student.year,
      section: student.section,
      startDate,
      endDate,
      daysCount,
      reason,
      type: leaveType,
    });

    setLeaveSuccess(true);
    setTimeout(() => {
      setLeaveSuccess(false);
      setIsLeaveModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
    }, 1200);
  };

  return (
    <div className="space-y-5">
      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-extrabold text-xl sm:text-2xl shadow-inner">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">{student.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {student.regNo}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-200">
                  Sec {student.section}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-1">
                {student.department} • Year {student.year} • Semester {student.semester}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-300 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" /> {student.email}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" /> Advisor: {student.facultyAdvisor}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <button
              id="student-print-gradecard-btn"
              type="button"
              onClick={() => {
                setPrintReportKind('studentGradeCard');
                setIsPrintModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer shadow-2xs backdrop-blur-xs"
              title="Open and Print Certified Semester Grade Card"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>Print Grade Card</span>
            </button>

            <div className="flex items-center gap-3 bg-black/25 p-3 rounded-xl border border-white/10">
              <div className="text-center px-2">
                <div className="text-[10px] uppercase font-bold text-emerald-300">CGPA</div>
                <div className="text-lg font-black text-white">{student.cgpa.toFixed(2)}</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-2">
                <div className="text-[10px] uppercase font-bold text-emerald-300">Attendance</div>
                <div
                  className={`text-lg font-black ${
                    student.overallAttendance.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {student.overallAttendance.percentage.toFixed(1)}%
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-2">
                <div className="text-[10px] uppercase font-bold text-emerald-300">Eligibility</div>
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1 justify-center mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {student.overallAttendance.percentage >= 75 ? 'Eligible' : 'Shortage'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Left (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-[11px] font-bold uppercase">Current GPA</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-black text-slate-900">{student.currentSemesterGpa.toFixed(2)}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Semester {student.semester}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-[11px] font-bold uppercase">Total Credits</span>
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-black text-slate-900">22</div>
                <div className="text-[11px] text-slate-400 mt-0.5">7 Registered Subjects</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-[11px] font-bold uppercase">Leave / OD</span>
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-black text-slate-900">{studentLeaves.length}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {studentLeaves.filter((l) => l.status === 'Approved').length} Approved
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-[11px] font-bold uppercase">Fee Status</span>
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-black text-emerald-700">
                  {studentFees[0]?.status || 'Paid'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">No Due Clear</div>
              </div>
            </div>

            {/* Subject Marks Summary */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-800">Academic Progress & CIA Scores</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('academics')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Subject Code & Name</th>
                      <th className="p-3 text-center">CIA 1 (50)</th>
                      <th className="p-3 text-center">CIA 2 (50)</th>
                      <th className="p-3 text-center">Model (100)</th>
                      <th className="p-3 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {Object.entries(student.marks).map(([code, m]) => (
                      <tr key={code} className="hover:bg-slate-50">
                        <td className="p-3 font-medium">
                          <div className="font-bold text-slate-900">{code}</div>
                          <div className="text-slate-500 text-[11px]">{m.subjectName}</div>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-800">{m.internal1}</td>
                        <td className="p-3 text-center font-bold text-slate-800">{m.internal2}</td>
                        <td className="p-3 text-center font-bold text-slate-800">{m.modelExam}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded font-black text-xs bg-emerald-100 text-emerald-800">
                            {m.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Attendance Progress Bars */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-800">Subject-wise Attendance (75% Minimum Required)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('attendance')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Detailed Logs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {Object.entries(student.subjectAttendance).map(([code, att]) => (
                  <div key={code} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">
                        {code} • {att.subjectName}
                      </span>
                      <span
                        className={`font-black ${
                          att.percentage >= 75 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {att.percentage}% ({att.attended + att.od} / {att.conducted} classes)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          att.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, att.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Announcements & Mentorship */}
          <div className="space-y-5">
            {/* Action Card: Apply Leave */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 rounded-xl border border-indigo-800/50 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Quick Request</span>
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <h4 className="font-bold text-sm text-white">Need Leave or On-Duty Approval?</h4>
              <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
                Submit medical, symposium OD, or personal leave requests directly to your Class Advisor for institutional sign-off.
              </p>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(true)}
                className="mt-3.5 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-indigo-950 bg-white hover:bg-indigo-50 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply for Leave / OD</span>
              </button>
            </div>

            {/* Campus Announcements */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Campus Circulars & Notices</h3>
              </div>
              <div className="space-y-3">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          ann.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : ann.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ann.priority}
                      </span>
                      <span className="text-[10px] text-slate-400">{ann.date}</span>
                    </div>
                    <div className="font-bold text-slate-900">{ann.title}</div>
                    <p className="text-slate-600 mt-1 text-[11px] line-clamp-2">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentor & Advisor Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-xs space-y-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-800">Assigned Faculty Mentor</h3>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">{student.mentor}</div>
                <div className="text-slate-500 text-[11px]">Class Advisor & Student Counselor (Sec {student.section})</div>
                <div className="mt-2 text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Tech Block Room 305
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Office Hours: 03:30 PM - 04:30 PM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACADEMICS TAB */}
      {activeTab === 'academics' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Semester 5 - Course Performance & Marks</h2>
                <p className="text-xs text-slate-500">Autonomous Regulation 2022 • Continuous Internal Assessments</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPrintReportKind('studentGradeCard');
                  setIsPrintModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer self-start sm:self-auto"
                title="Open and Print Official Grade Card"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                <span>Print Grade Card</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Course</th>
                    <th className="p-3 text-center">CIA 1 (Max 50)</th>
                    <th className="p-3 text-center">CIA 2 (Max 50)</th>
                    <th className="p-3 text-center">Model Exam (Max 100)</th>
                    <th className="p-3 text-center">Assignment (Max 10)</th>
                    <th className="p-3 text-center">Aggregate %</th>
                    <th className="p-3 text-center">Estimated Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(student.marks).map(([code, m]) => (
                    <tr key={code} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{code}</div>
                        <div className="text-slate-500 text-[11px]">{m.subjectName}</div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">{m.internal1}</td>
                      <td className="p-3 text-center font-bold text-slate-800">{m.internal2}</td>
                      <td className="p-3 text-center font-bold text-slate-800">{m.modelExam}</td>
                      <td className="p-3 text-center font-bold text-slate-800">{m.assignment}</td>
                      <td className="p-3 text-center font-black text-indigo-700">{m.totalPercentage}%</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-md font-black text-xs bg-emerald-100 text-emerald-800">
                          {m.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exam Timetable */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Upcoming Autonomous Examination Schedule</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {examSchedules.map((exam) => (
                <div key={exam.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div className="font-bold text-slate-900">{exam.subjectCode}</div>
                  <div className="text-slate-600 text-[11px] font-medium">{exam.subjectName}</div>
                  <div className="mt-2 space-y-1 text-slate-500">
                    <div>📅 Date: {exam.date}</div>
                    <div>⏰ Time: {exam.time}</div>
                    <div>🏛️ Hall: {exam.hall}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Statutory Attendance Registry</h2>
                <p className="text-xs text-slate-500">
                  Anna University requires 75% minimum aggregate attendance for End-Semester Exam eligibility
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrintReportKind('attendanceCertificate');
                    setIsPrintModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 cursor-pointer shadow-2xs"
                  title="Print Official Attendance Eligibility Certificate"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Print Attendance Cert</span>
                </button>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Aggregate: {student.overallAttendance.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Course</th>
                    <th className="p-3">Instructor</th>
                    <th className="p-3 text-center">Conducted</th>
                    <th className="p-3 text-center">Attended</th>
                    <th className="p-3 text-center">OD Approved</th>
                    <th className="p-3 text-center">Attendance %</th>
                    <th className="p-3 text-center">Exam Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(student.subjectAttendance).map(([code, att]) => (
                    <tr key={code} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{code} - {att.subjectName}</td>
                      <td className="p-3 text-slate-600">{att.facultyName}</td>
                      <td className="p-3 text-center font-semibold text-slate-800">{att.conducted}</td>
                      <td className="p-3 text-center font-semibold text-slate-800">{att.attended}</td>
                      <td className="p-3 text-center font-semibold text-slate-800">{att.od}</td>
                      <td className="p-3 text-center font-black">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            att.percentage >= 75
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`text-[11px] font-bold ${
                            att.percentage >= 75 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {att.percentage >= 75 ? '✓ Eligible' : '⚠️ Defaulter'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Period Logs */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Daily Period Attendance History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Course</th>
                    <th className="p-2.5 text-center">Period</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAttendanceRecords.slice(-15).reverse().map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-800">{rec.date}</td>
                      <td className="p-2.5 font-bold text-slate-900">{rec.subjectCode} - {rec.subjectName}</td>
                      <td className="p-2.5 text-center font-semibold text-slate-700">P{rec.period || 1}</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            rec.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'OD'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500">{rec.markedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADVISOR TAB */}
      {activeTab === 'advisor' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-start sm:items-center gap-4 mb-5 pb-5 border-b border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl border border-indigo-200">
                {student.facultyAdvisor.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{student.facultyAdvisor}</h2>
                <p className="text-xs text-slate-500">
                  Official Class Advisor & Mentor • Department of Computer Science & Engineering
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" /> r.sharma@college.edu
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" /> +91 98401 11222
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Room 305, Tech Block
                  </span>
                </div>
              </div>
            </div>

            {/* Mentor Meeting Notes History */}
            <h3 className="text-sm font-bold text-slate-900 mb-3">One-on-One Mentoring & Counseling Records</h3>
            {student.mentorNotes && student.mentorNotes.length > 0 ? (
              <div className="space-y-3">
                {student.mentorNotes.map((note) => (
                  <div key={note.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {note.category || 'General Counseling'}
                      </span>
                      <span>{note.date}</span>
                    </div>
                    {note.topics && (
                      <div className="font-bold text-slate-800 text-xs">Agenda: {note.topics}</div>
                    )}
                    <p className="text-slate-600 leading-relaxed">{note.discussionSummary}</p>
                    {note.actionPlan && (
                      <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50/70 p-2 rounded border border-emerald-200 mt-2">
                        Action Plan: {note.actionPlan}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
                No formal mentorship notes recorded yet for current semester.
              </div>
            )}
          </div>
        </div>
      )}

      {/* FEES TAB */}
      {activeTab === 'fees' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Institutional Fee Ledger & Receipts</h2>
                <p className="text-xs text-slate-500">Autonomous Examination & Semester Tuition Fee</p>
              </div>
            </div>

            <div className="space-y-4">
              {studentFees.map((fee) => (
                <div key={fee.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-sm text-slate-900">
                        Academic Year {fee.academicYear} (Semester {fee.semester})
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">Receipt: {fee.receiptNumber || 'N/A'}</div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold self-start sm:self-auto ${
                        fee.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fee.status === 'Partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Status: {fee.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-slate-500 text-[10px] uppercase">Tuition Fee</div>
                      <div className="font-bold text-slate-800">₹{(fee.tuitionFee ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-slate-500 text-[10px] uppercase">Development</div>
                      <div className="font-bold text-slate-800">₹{(fee.developmentFee ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-slate-500 text-[10px] uppercase">Exam Fee</div>
                      <div className="font-bold text-slate-800">₹{(fee.examFee ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="text-slate-500 text-[10px] uppercase font-bold text-emerald-700">Paid Amount</div>
                      <div className="font-extrabold text-emerald-800">₹{(fee.paidAmount ?? 0).toLocaleString()}</div>
                    </div>
                  </div>

                  {(fee.dueAmount ?? 0) > 0 && (
                    <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold flex items-center justify-between">
                      <span>Outstanding Balance Due:</span>
                      <span>₹{((fee.dueAmount ?? (fee.totalFee - fee.paidAmount)) ?? 0).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500 text-[11px]">
                      No-Due Certificate: {fee.noDueApproved ? '✓ Cleared' : 'Pending Approval'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPrintReportKind('feeReceipt');
                          setIsPrintModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 cursor-pointer shadow-2xs"
                        title="View and Print Official Fee Payment Receipt"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Print Receipt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPrintReportKind('feeReceipt');
                          setIsPrintModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 cursor-pointer shadow-2xs"
                        title="Download Official Fee Payment Receipt"
                      >
                        <Download className="w-3 h-3 text-indigo-600" />
                        <span>Download Receipt</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LEAVE / OD TAB */}
      {activeTab === 'leave' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">My Leave & On-Duty (OD) Applications</h2>
                <p className="text-xs text-slate-500">Track approvals from Class Advisor and HOD</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Apply for Leave / OD</span>
              </button>
            </div>

            <div className="space-y-3">
              {studentLeaves.length > 0 ? (
                studentLeaves.map((leave) => (
                  <div key={leave.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{leave.type}</span>
                        <span className="text-[11px] text-slate-500">({leave.daysCount} days)</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          leave.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : leave.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>

                    <div className="text-slate-600 text-[11px]">
                      📅 Duration: {leave.startDate} to {leave.endDate} • Applied on: {leave.appliedOn}
                    </div>

                    <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                      Reason: {leave.reason}
                    </p>

                    {leave.reviewedBy && (
                      <div className="text-[11px] text-emerald-900 bg-emerald-50 p-2 rounded border border-emerald-200">
                        Reviewed by {leave.reviewedBy} on {leave.reviewedOn || 'Verified'}: {leave.reviewerComments}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No leave or OD applications submitted. Click "Apply for Leave / OD" above.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* APPLY LEAVE MODAL */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base">Submit Leave / OD Request</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-5 space-y-3.5 text-xs">
              {leaveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg font-bold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Request submitted successfully to Class Advisor!</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Leave / Duty Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Personal">Personal Leave</option>
                  <option value="Medical">Medical Leave (Doctor Certificate)</option>
                  <option value="On-Duty (OD)">On-Duty (OD) - Sports / Cultural</option>
                  <option value="Symposium / Conference">Symposium / Paper Presentation OD</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Reason / Event Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the reason, event name, or medical condition clearly..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-bold bg-emerald-700 hover:bg-emerald-800 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
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
        defaultReport={printReportKind}
        targetStudentRegNo={student.regNo}
      />
    </div>
  );
};
