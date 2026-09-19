import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  FileText,
  Award,
  Calendar,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Receipt,
  User,
  GraduationCap,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { SubjectMarks, SubjectAttendance } from '../../types';
import { triggerPrintReport } from '../../utils/printHelper';

export type ReportKind =
  | 'studentGradeCard'
  | 'feeReceipt'
  | 'attendanceCertificate'
  | 'facultyRegister'
  | 'hodDepartmentReport'
  | 'adminAuditReport';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultReport?: ReportKind;
  targetStudentRegNo?: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  defaultReport,
  targetStudentRegNo,
}) => {
  const {
    currentUser,
    students = [],
    facultyList = [],
    faculty: rawFaculty,
    departments = [],
    attendanceRecords = [],
    attendanceLogs: rawAttendanceLogs,
    leaveRequests = [],
  } = usePortal();

  const faculty = rawFaculty || facultyList || [];
  const attendanceLogs = rawAttendanceLogs || attendanceRecords || [];

  // Determine initial report kind based on role
  const getInitialReport = (): ReportKind => {
    if (defaultReport) return defaultReport;
    if (!currentUser) return 'adminAuditReport';
    switch (currentUser.role) {
      case 'student':
        return 'studentGradeCard';
      case 'faculty':
        return 'facultyRegister';
      case 'hod':
        return 'hodDepartmentReport';
      case 'admin':
      default:
        return 'adminAuditReport';
    }
  };

  const [activeReport, setActiveReport] = useState<ReportKind>(getInitialReport());
  const [selectedStudentRegNo, setSelectedStudentRegNo] = useState<string>(
    targetStudentRegNo ||
      (currentUser?.role === 'student'
        ? currentUser.id
        : students?.[0]?.regNo || '712222104001')
  );
  const [hodReportType, setHodReportType] = useState<'attendance' | 'marks' | 'defaulters'>('attendance');

  useEffect(() => {
    if (defaultReport) {
      setActiveReport(defaultReport);
    }
    if (targetStudentRegNo) {
      setSelectedStudentRegNo(targetStudentRegNo);
    }
  }, [defaultReport, targetStudentRegNo]);

  // Keyboard shortcut listener to exit modal easily with ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStudent =
    (students || []).find((s) => s.regNo === selectedStudentRegNo) ||
    students?.[0] || {
      name: 'Praveen Kumar S',
      regNo: '712222104001',
      department: 'Computer Science & Engineering',
      year: 3,
      semester: 5,
      section: 'A',
      cgpa: 8.84,
      currentSemesterGpa: 8.91,
      facultyAdvisor: 'Dr. S. K. Ramesh',
      overallAttendance: { percentage: 91.2 },
      marks: {},
      subjectAttendance: {},
      fees: {
        totalAmount: 95000,
        paidAmount: 95000,
        dueAmount: 0,
        status: 'Paid',
        noDueApproved: true,
      },
    };

  const activeFaculty = faculty?.[0] || {
    name: 'Dr. S. K. Ramesh',
    designation: 'Associate Professor',
    department: 'Computer Science and Engineering',
    subjectsHandling: ['CS8591 - Computer Networks', 'CS8501 - Theory of Computation'],
  };

  const handlePrint = () => {
    triggerPrintReport('printable-official-document', `PCET_${activeReport}_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 print:p-0 print:static print:bg-white print:overflow-visible">
      {/* Floating Close button for quick exit */}
      <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xl border border-slate-700 cursor-pointer transition-all hover:scale-105"
          title="Close Report (or press ESC)"
        >
          <X className="w-4 h-4 text-rose-400" />
          <span>Close (ESC)</span>
        </button>
      </div>

      <div className="bg-white w-full max-w-5xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:m-0 print:p-0">
        {/* Sticky Action Toolbar */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Official Document & Print Center</span>
              </h3>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Certified Institutional Format • Autonomous Regulation 2022
              </p>
            </div>
          </div>

          {/* Report Type Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
            {currentUser?.role === 'student' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveReport('studentGradeCard')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeReport === 'studentGradeCard'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Grade Card
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReport('feeReceipt')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeReport === 'feeReceipt'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Fee Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReport('attendanceCertificate')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeReport === 'attendanceCertificate'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Attendance Cert
                </button>
              </>
            )}

            {currentUser?.role === 'faculty' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveReport('facultyRegister')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeReport === 'facultyRegister'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Class Register & Marks
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReport('studentGradeCard')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeReport === 'studentGradeCard'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Student Marksheet
                </button>
              </>
            )}

            {currentUser?.role === 'hod' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveReport('hodDepartmentReport')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeReport === 'hodDepartmentReport'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Department Report
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReport('facultyRegister')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeReport === 'facultyRegister'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Course Register
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReport('studentGradeCard')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeReport === 'studentGradeCard'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Student Grade Card
                </button>
              </>
            )}

            {currentUser?.role === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveReport('adminAuditReport')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeReport === 'adminAuditReport'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Institutional Audit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReport('hodDepartmentReport')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeReport === 'hodDepartmentReport'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Department Summary
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReport('studentGradeCard')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeReport === 'studentGradeCard'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Student Marksheet
                </button>
              </>
            )}
          </div>

          {/* Print Action Button */}
          <div className="flex items-center gap-2">
            <button
              id="report-print-action-btn"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all hover:shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document Now</span>
            </button>
          </div>
        </div>

        {/* Optional Student Filter (visible when inspecting student reports in Staff / HOD / Admin roles) */}
        {activeReport === 'studentGradeCard' && currentUser?.role !== 'student' && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-3 text-xs print:hidden">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-700">Select Student to View / Print:</span>
            </div>
            <select
              value={selectedStudentRegNo}
              onChange={(e) => setSelectedStudentRegNo(e.target.value)}
              className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
            >
              {students.map((s) => (
                <option key={s.regNo} value={s.regNo}>
                  {s.regNo} - {s.name} ({s.department}, Sec {s.section})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* HOD Sub-Report Selector */}
        {activeReport === 'hodDepartmentReport' && (
          <div className="bg-purple-50 border-b border-purple-100 px-6 py-2.5 flex items-center justify-between gap-3 text-xs print:hidden">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-700" />
              <span className="font-bold text-purple-900">Select Departmental Section:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHodReportType('attendance')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  hodReportType === 'attendance'
                    ? 'bg-purple-700 text-white'
                    : 'bg-white text-purple-800 border border-purple-200'
                }`}
              >
                Attendance Register
              </button>
              <button
                type="button"
                onClick={() => setHodReportType('marks')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  hodReportType === 'marks'
                    ? 'bg-purple-700 text-white'
                    : 'bg-white text-purple-800 border border-purple-200'
                }`}
              >
                Master Marksheet
              </button>
              <button
                type="button"
                onClick={() => setHodReportType('defaulters')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  hodReportType === 'defaulters'
                    ? 'bg-purple-700 text-white'
                    : 'bg-white text-purple-800 border border-purple-200'
                }`}
              >
                Defaulters List
              </button>
            </div>
          </div>
        )}

        {/* PRINTABLE DOCUMENT BODY */}
        <div id="printable-official-document" className="printable-document p-6 sm:p-10 font-sans text-slate-800 bg-white">
          {/* Institutional Letterhead Banner */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-black text-xl shadow-xs">
                PCET
              </div>
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase font-serif">
                  Park College of Engineering and Technology
                </h1>
                <p className="text-xs font-bold text-slate-700 tracking-wider">
                  Autonomous Institution • Affiliated to Anna University, Chennai
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Approved by AICTE, New Delhi • Accredited with 'A' Grade by NAAC • ISO 9001:2015 Certified
            </p>
            <p className="text-[10px] text-slate-400">
              NH-544, Avinashi Road, Kaniyur, Coimbatore - 641 659, Tamil Nadu, India
            </p>
          </div>

          {/* 1. STUDENT GRADE CARD / MARKSHEET */}
          {activeReport === 'studentGradeCard' && (
            <div className="space-y-4">
              <div className="text-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Office of the Controller of Examinations
                </h2>
                <p className="text-xs font-bold text-indigo-900 uppercase">
                  Continuous Internal Assessment & Grade Record (Semester V • Regulations 2022)
                </p>
              </div>

              {/* Student Particulars Table */}
              <table className="w-full text-xs border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50 text-slate-600 w-1/4">Register Number:</td>
                    <td className="p-2 font-black text-slate-900 w-1/4">{currentStudent.regNo}</td>
                    <td className="p-2 font-bold bg-slate-50 text-slate-600 w-1/4">Degree & Branch:</td>
                    <td className="p-2 font-bold text-slate-900 w-1/4">B.E. {currentStudent.department}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50 text-slate-600">Student Name:</td>
                    <td className="p-2 font-bold text-slate-900">{currentStudent.name}</td>
                    <td className="p-2 font-bold bg-slate-50 text-slate-600">Year / Semester:</td>
                    <td className="p-2 font-semibold text-slate-900">Year {currentStudent.year} / Sem {currentStudent.semester} (Sec {currentStudent.section})</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-slate-50 text-slate-600">Faculty Advisor:</td>
                    <td className="p-2 font-semibold text-slate-900">{currentStudent.facultyAdvisor}</td>
                    <td className="p-2 font-bold bg-slate-50 text-slate-600">Overall Attendance:</td>
                    <td className="p-2 font-bold text-emerald-800">{currentStudent.overallAttendance.percentage}% (Eligible)</td>
                  </tr>
                </tbody>
              </table>

              {/* Course Performance Table */}
              <table className="w-full text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 text-left">Code</th>
                    <th className="p-2 text-left">Course Title</th>
                    <th className="p-2 text-center">Credits</th>
                    <th className="p-2 text-center">CIA 1 (50)</th>
                    <th className="p-2 text-center">CIA 2 (50)</th>
                    <th className="p-2 text-center">Model (100)</th>
                    <th className="p-2 text-center">Assignment</th>
                    <th className="p-2 text-center">Aggregate %</th>
                    <th className="p-2 text-center">Grade</th>
                    <th className="p-2 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(Object.entries(currentStudent.marks) as [string, SubjectMarks][]).map(([code, m]) => (
                    <tr key={code} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-900">{code}</td>
                      <td className="p-2 font-medium text-slate-800">{m.subjectName}</td>
                      <td className="p-2 text-center font-semibold">3</td>
                      <td className="p-2 text-center font-semibold">{m.internal1}</td>
                      <td className="p-2 text-center font-semibold">{m.internal2}</td>
                      <td className="p-2 text-center font-semibold">{m.modelExam}</td>
                      <td className="p-2 text-center font-semibold">{m.assignment}</td>
                      <td className="p-2 text-center font-bold text-indigo-900">{m.totalPercentage}%</td>
                      <td className="p-2 text-center font-black text-slate-900">{m.grade}</td>
                      <td className="p-2 text-center font-bold text-emerald-700">PASS</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Academic Summary Box */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-center font-semibold">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Semester GPA</span>
                  <span className="text-base font-black text-slate-900">{currentStudent.currentSemesterGpa.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Cumulative CGPA</span>
                  <span className="text-base font-black text-slate-900">{currentStudent.cgpa.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Academic Standing</span>
                  <span className="text-base font-bold text-emerald-700">First Class with Distinction</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. OFFICIAL FEE PAYMENT RECEIPT */}
          {activeReport === 'feeReceipt' && (
            <div className="space-y-4">
              <div className="text-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Accounts & Finance Directorate
                </h2>
                <p className="text-xs font-bold text-emerald-900 uppercase">
                  Official Tuition & Academic Fee Payment Receipt (AY 2025-26)
                </p>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold text-slate-600">Receipt No: </span>
                  <span className="font-mono font-bold text-slate-900">PCET/FEE/2026/08942</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Date Issued: </span>
                  <span className="font-bold text-slate-900">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Student Details */}
              <table className="w-full text-xs border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50 text-slate-600 w-1/4">Student Name:</td>
                    <td className="p-2 font-bold text-slate-900 w-1/4">{currentStudent.name}</td>
                    <td className="p-2 font-bold bg-slate-50 text-slate-600 w-1/4">Registration No:</td>
                    <td className="p-2 font-bold text-slate-900 w-1/4">{currentStudent.regNo}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-slate-50 text-slate-600">Branch & Year:</td>
                    <td className="p-2 font-semibold text-slate-900">{currentStudent.department} (Year {currentStudent.year})</td>
                    <td className="p-2 font-bold bg-slate-50 text-slate-600">Admission Quota:</td>
                    <td className="p-2 font-semibold text-slate-900">Government (DOTE Merit)</td>
                  </tr>
                </tbody>
              </table>

              {/* Itemized Fee Breakdown */}
              <table className="w-full text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 text-left">Sl.No</th>
                    <th className="p-2 text-left">Particulars</th>
                    <th className="p-2 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2">1</td>
                    <td className="p-2 font-medium">Autonomous Tuition & Academic Fee (Odd Sem)</td>
                    <td className="p-2 text-right font-mono">₹55,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-2">2</td>
                    <td className="p-2 font-medium">Autonomous Examination & Continuous Assessment Fee</td>
                    <td className="p-2 text-right font-mono">₹12,500.00</td>
                  </tr>
                  <tr>
                    <td className="p-2">3</td>
                    <td className="p-2 font-medium">Specialized Computing Lab & High-Speed Network Fee</td>
                    <td className="p-2 text-right font-mono">₹18,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-2">4</td>
                    <td className="p-2 font-medium">Digital Library, Journals & Institutional Portal Maintenance</td>
                    <td className="p-2 text-right font-mono">₹9,500.00</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <td colSpan={2} className="p-2 text-right">Total Amount Paid:</td>
                    <td className="p-2 text-right font-mono font-black text-emerald-800">₹95,000.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Particulars */}
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block">Payment Mode: Online Campus ERP Payment Gateway</span>
                  <span className="text-[11px] text-emerald-800">Transaction Ref: TXN_PCET_8923481 • Status: SUCCESS</span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-emerald-700 text-white font-bold text-[11px] inline-block">
                    NO DUES CLEARED
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. ATTENDANCE ELIGIBILITY CERTIFICATE */}
          {activeReport === 'attendanceCertificate' && (
            <div className="space-y-4">
              <div className="text-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Department of Academic Affairs & Admissions
                </h2>
                <p className="text-xs font-bold text-indigo-900 uppercase">
                  Official Student Attendance Eligibility & Hall Ticket Endorsement
                </p>
              </div>

              <p className="text-xs leading-relaxed text-slate-700 text-justify">
                This is to officially certify that <span className="font-bold text-slate-950">{currentStudent.name}</span> (Reg. No:{' '}
                <span className="font-bold text-slate-950">{currentStudent.regNo}</span>), a bona fide student of{' '}
                <span className="font-bold text-slate-950">Year {currentStudent.year}, Semester {currentStudent.semester}</span> in the
                Department of <span className="font-bold text-slate-950">{currentStudent.department}</span>, has recorded an overall cumulative attendance of{' '}
                <span className="font-bold text-emerald-800">{currentStudent.overallAttendance.percentage}%</span> for the current academic session.
              </p>

              {/* Course-wise Attendance */}
              <table className="w-full text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 text-left">Code</th>
                    <th className="p-2 text-left">Course Name</th>
                    <th className="p-2 text-center">Conducted</th>
                    <th className="p-2 text-center">Attended</th>
                    <th className="p-2 text-center">OD</th>
                    <th className="p-2 text-center">Total %</th>
                    <th className="p-2 text-center">Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(Object.entries(currentStudent.subjectAttendance) as [string, SubjectAttendance][]).map(([code, att]) => (
                    <tr key={code}>
                      <td className="p-2 font-bold text-slate-900">{code}</td>
                      <td className="p-2 font-medium text-slate-800">{att.subjectName}</td>
                      <td className="p-2 text-center">{att.conducted}</td>
                      <td className="p-2 text-center">{att.attended}</td>
                      <td className="p-2 text-center">{att.od}</td>
                      <td className="p-2 text-center font-bold text-slate-900">{att.percentage}%</td>
                      <td className="p-2 text-center font-bold text-emerald-700">
                        {att.percentage >= 75 ? 'ELIGIBLE' : 'CONDONATION'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-xs">
                <p className="text-indigo-950 font-bold">
                  ✓ Certified for Anna University Autonomous End-Semester Examinations Hall Ticket Issuance.
                </p>
              </div>
            </div>
          )}

          {/* 4. FACULTY REGISTER & CONTINUOUS ASSESSMENT */}
          {activeReport === 'facultyRegister' && (
            <div className="space-y-4">
              <div className="text-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Department of Computer Science and Engineering
                </h2>
                <p className="text-xs font-bold text-blue-900 uppercase">
                  Faculty Official Attendance Register & CIA Mark Record Sheet (AY 2025-26)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                <div>
                  <span className="font-bold text-slate-600">Course: </span>
                  <span className="font-bold text-slate-900">CS8591 - Computer Networks (3 Credits)</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Faculty In-Charge: </span>
                  <span className="font-bold text-slate-900">{activeFaculty.name} ({activeFaculty.designation})</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Target Class: </span>
                  <span className="font-semibold text-slate-900">B.E. CSE - Year III, Semester V (Section A & B)</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Total Classes Held: </span>
                  <span className="font-bold text-slate-900">45 Periods Completed</span>
                </div>
              </div>

              {/* Roster Table */}
              <table className="w-full text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 text-left">Reg No</th>
                    <th className="p-2 text-left">Student Name</th>
                    <th className="p-2 text-center">Sec</th>
                    <th className="p-2 text-center">Attended / 45</th>
                    <th className="p-2 text-center">% Att</th>
                    <th className="p-2 text-center">CIA 1 (50)</th>
                    <th className="p-2 text-center">CIA 2 (50)</th>
                    <th className="p-2 text-center">Model (100)</th>
                    <th className="p-2 text-center">CAM (40)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.slice(0, 10).map((s) => {
                    const marks = s.marks['CS8591'] || { internal1: 42, internal2: 44, modelExam: 86, assignment: 9 };
                    const att = s.subjectAttendance['CS8591'] || { conducted: 45, attended: 41, od: 2, percentage: 91 };
                    const cam = Math.round(((marks.internal1 + marks.internal2) / 2) * 0.4 + (marks.modelExam * 0.4) + marks.assignment);
                    return (
                      <tr key={s.regNo}>
                        <td className="p-2 font-mono font-bold text-slate-900">{s.regNo}</td>
                        <td className="p-2 font-medium text-slate-800">{s.name}</td>
                        <td className="p-2 text-center">{s.section}</td>
                        <td className="p-2 text-center">{att.attended + att.od}</td>
                        <td className="p-2 text-center font-bold text-indigo-900">{att.percentage}%</td>
                        <td className="p-2 text-center">{marks.internal1}</td>
                        <td className="p-2 text-center">{marks.internal2}</td>
                        <td className="p-2 text-center">{marks.modelExam}</td>
                        <td className="p-2 text-center font-black text-slate-900">{cam}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. HOD DEPARTMENT EXECUTIVE REPORT */}
          {activeReport === 'hodDepartmentReport' && (
            <div className="space-y-4">
              <div className="text-center bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                <h2 className="text-base font-extrabold text-purple-950 uppercase tracking-wide">
                  Head of the Department Executive Review
                </h2>
                <p className="text-xs font-bold text-purple-900 uppercase">
                  {hodReportType === 'attendance' && 'Consolidated Department Attendance Register (Semester V)'}
                  {hodReportType === 'marks' && 'Consolidated Master Academic Marksheet (Semester V)'}
                  {hodReportType === 'defaulters' && 'Attendance Shortage Defaulters Formal Notice (Under 75%)'}
                </p>
              </div>

              {/* Department Overview Metrics */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Students</span>
                  <span className="text-base font-black text-slate-900">{students.length} Enrolled</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Faculty Cadre</span>
                  <span className="text-base font-black text-slate-900">{faculty.length} Staff</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Dept Average CGPA</span>
                  <span className="text-base font-black text-indigo-900">8.42</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Overall Pass Rate</span>
                  <span className="text-base font-black text-emerald-700">96.8%</span>
                </div>
              </div>

              {/* Tabular Section */}
              <table className="w-full text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 text-left">Reg No</th>
                    <th className="p-2 text-left">Student Name</th>
                    <th className="p-2 text-center">Sec</th>
                    <th className="p-2 text-center">Attendance %</th>
                    <th className="p-2 text-center">CGPA</th>
                    <th className="p-2 text-center">Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students
                    .filter((s) => (hodReportType === 'defaulters' ? s.overallAttendance.percentage < 75 : true))
                    .map((s) => (
                      <tr key={s.regNo}>
                        <td className="p-2 font-mono font-bold text-slate-900">{s.regNo}</td>
                        <td className="p-2 font-medium text-slate-800">{s.name}</td>
                        <td className="p-2 text-center">{s.section}</td>
                        <td className={`p-2 text-center font-bold ${s.overallAttendance.percentage >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {s.overallAttendance.percentage}%
                        </td>
                        <td className="p-2 text-center font-bold text-slate-900">{s.cgpa.toFixed(2)}</td>
                        <td className="p-2 text-center">
                          {s.overallAttendance.percentage >= 75 ? (
                            <span className="text-emerald-700 font-semibold">Eligible</span>
                          ) : (
                            <span className="text-rose-700 font-bold">Defaulter Warning</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. ADMIN EXECUTIVE AUDIT REPORT */}
          {activeReport === 'adminAuditReport' && (
            <div className="space-y-4">
              <div className="text-center bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <h2 className="text-base font-extrabold text-rose-950 uppercase tracking-wide">
                  Executive Academic & Administrative Audit Report (2025-2026)
                </h2>
                <p className="text-xs font-bold text-rose-900 uppercase">
                  Institutional Governance, Compliance & Database Health Record
                </p>
              </div>

              {/* Key Indicators */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Students</span>
                  <span className="text-base font-black text-slate-900">{students.length}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Faculty</span>
                  <span className="text-base font-black text-slate-900">{faculty.length}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Departments</span>
                  <span className="text-base font-black text-slate-900">{departments.length}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Attendance Logs</span>
                  <span className="text-base font-black text-slate-900">{attendanceLogs.length}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Leave Requests</span>
                  <span className="text-base font-black text-slate-900">{leaveRequests.length}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Server Engine</span>
                  <span className="text-base font-black text-emerald-700">Healthy</span>
                </div>
              </div>

              {/* Department Roster Table */}
              <table className="w-full text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 text-left">Code</th>
                    <th className="p-2 text-left">Department Name</th>
                    <th className="p-2 text-left">Head of Department</th>
                    <th className="p-2 text-center">Faculty Count</th>
                    <th className="p-2 text-center">Student Intake</th>
                    <th className="p-2 text-center">NBA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {departments.map((dept) => (
                    <tr key={dept.id}>
                      <td className="p-2 font-bold text-slate-900">{dept.code}</td>
                      <td className="p-2 font-medium text-slate-800">{dept.name}</td>
                      <td className="p-2 text-slate-700">{dept.hod}</td>
                      <td className="p-2 text-center font-semibold">{dept.facultyCount}</td>
                      <td className="p-2 text-center font-semibold">{dept.studentCount}</td>
                      <td className="p-2 text-center font-bold text-emerald-700">Accredited</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Institutional Signatures & Authentication Footer */}
          <div className="mt-10 pt-6 border-t border-slate-300">
            <div className="grid grid-cols-4 gap-4 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 pb-8 mb-1">
                  <span className="font-serif italic text-slate-600 text-xs">Digital Verified</span>
                </div>
                <span className="font-bold text-slate-900 block">Class Advisor</span>
                <span className="text-[10px] text-slate-500">Dept. of Computer Science</span>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-8 mb-1">
                  <span className="font-serif italic text-slate-600 text-xs">Digital Verified</span>
                </div>
                <span className="font-bold text-slate-900 block">Head of Department</span>
                <span className="text-[10px] text-slate-500">Academic Council Member</span>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-8 mb-1">
                  <span className="font-serif italic text-slate-600 text-xs">Seal Endorsed</span>
                </div>
                <span className="font-bold text-slate-900 block">Controller of Examinations</span>
                <span className="text-[10px] text-slate-500">Autonomous Examination Cell</span>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-8 mb-1">
                  <span className="font-serif italic text-slate-600 text-xs">Executive Sign</span>
                </div>
                <span className="font-bold text-slate-900 block">Principal</span>
                <span className="text-[10px] text-slate-500">Park College of Engg. & Tech.</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-400">
              <span>This document is digitally generated by Park College of Engineering & Technology Autonomous Academic Portal.</span>
              <span>Verification Barcode: PCET-{new Date().getFullYear()}-AUTH-{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close Report
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all hover:shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
