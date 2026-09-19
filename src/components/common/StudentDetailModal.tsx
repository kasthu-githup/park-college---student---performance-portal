import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { usePortal } from '../../context/PortalContext';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  Clock,
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  canEdit?: boolean;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  canEdit = false,
}) => {
  const { updateStudentPerformance } = usePortal();

  const [activeTab, setActiveTab] = useState<'overview' | 'marks' | 'attendance' | 'assignments'>(
    'overview'
  );
  const [rating, setRating] = useState(student?.performanceRating || 'Good');
  const [remarks, setRemarks] = useState(student?.facultyRemarks || '');
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (student) {
      setRating(student.performanceRating);
      setRemarks(student.facultyRemarks);
    }
  }, [student]);

  if (!student) return null;

  const handleSavePerformance = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentPerformance(student.regNo, rating, remarks);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const getAttendanceStatusBadge = (percentage: number) => {
    if (percentage >= 75) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Regular ({percentage}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5" /> Defaulter Alert ({percentage}%)
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-lg font-bold text-white">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{student.name}</h3>
                <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {student.regNo}
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                {student.department} • Year {student.year} (Sem {student.semester}) • Section {student.section}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Profile & Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('marks')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'marks'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Internal & Semester Marks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'attendance'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Subject Attendance Breakdown
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'assignments'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Assignment Submissions
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {saveToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Student performance remarks updated successfully!</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick stats banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Attendance %</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {student.overallAttendance.percentage}%
                  </div>
                  <div className="mt-1">{getAttendanceStatusBadge(student.overallAttendance.percentage)}</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Cumulative CGPA</div>
                  <div className="text-xl font-bold text-indigo-600 mt-1">{student.cgpa.toFixed(2)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Scale of 10.0</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Current Sem GPA</div>
                  <div className="text-xl font-bold text-emerald-600 mt-1">
                    {student.currentSemesterGpa.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Projected SGPA</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Performance Grade</div>
                  <div className="text-sm font-bold text-slate-800 mt-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        student.performanceRating === 'Outstanding'
                          ? 'bg-purple-100 text-purple-800'
                          : student.performanceRating === 'Good'
                          ? 'bg-blue-100 text-blue-800'
                          : student.performanceRating === 'Average'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {student.performanceRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal & Academic Details */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  Personal & Institutional Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500 font-medium">Official Email</div>
                      <div className="font-semibold text-slate-800 break-all">{student.email}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500 font-medium">Contact Phone</div>
                      <div className="font-semibold text-slate-800">{student.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500 font-medium">Date of Birth</div>
                      <div className="font-semibold text-slate-800">{student.dob}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Heart className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500 font-medium">Blood Group</div>
                      <div className="font-semibold text-slate-800">{student.bloodGroup}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500 font-medium">Faculty Advisor</div>
                      <div className="font-semibold text-slate-800">{student.facultyAdvisor}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500 font-medium">Academic Mentor</div>
                      <div className="font-semibold text-slate-800">{student.mentor}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Faculty Remarks & Performance Evaluation */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Faculty Performance Assessment & Remarks
                </h4>

                {canEdit ? (
                  <form onSubmit={handleSavePerformance} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Performance Tier
                      </label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value as any)}
                        className="w-full sm:w-64 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-medium"
                      >
                        <option value="Outstanding">Outstanding</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                        <option value="Needs Attention">Needs Attention</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Faculty Advisor / Subject Remarks
                      </label>
                      <textarea
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-slate-800 font-medium"
                        placeholder="Enter constructive remarks regarding academic progress, lab participation, and discipline..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Remarks & Rating
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-700 italic">"{student.facultyRemarks}"</p>
                  </div>
                )}
              </div>

              {/* Mentorship History & Counseling Notes */}
              {student.mentorNotes && student.mentorNotes.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-600" />
                    Class Mentoring & Counseling Ledger ({student.mentorNotes.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {student.mentorNotes.map((note) => (
                      <div key={note.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between text-slate-500 font-semibold mb-1 text-[11px]">
                          <span>{note.date} • Mentor: <strong>{note.mentorName}</strong></span>
                          {note.followUpDate && <span className="text-indigo-600 font-bold">Follow-up: {note.followUpDate}</span>}
                        </div>
                        <p className="text-slate-800 font-medium">{note.discussionSummary}</p>
                        {note.actionPlan && (
                          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
                            Action Plan: {note.actionPlan}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MARKS */}
          {activeTab === 'marks' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-3 text-center">Internal 1 (50)</th>
                        <th className="py-3 px-3 text-center">Internal 2 (50)</th>
                        <th className="py-3 px-3 text-center">Model Exam (100)</th>
                        <th className="py-3 px-3 text-center">Assignment (10)</th>
                        <th className="py-3 px-3 text-center font-bold">Total (%)</th>
                        <th className="py-3 px-4 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Object.values(student.marks) as Array<{
                        subjectCode: string;
                        subjectName: string;
                        internal1: number;
                        internal2: number;
                        modelExam: number;
                        assignment: number;
                        totalPercentage: number;
                        grade: string;
                      }>).map((m) => (
                        <tr key={m.subjectCode} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{m.subjectName}</div>
                            <div className="text-[10px] font-mono text-slate-400">{m.subjectCode}</div>
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-800">
                            {m.internal1} / 50
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-800">
                            {m.internal2} / 50
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-800">
                            {m.modelExam} / 100
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-800">
                            {m.assignment} / 10
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-indigo-700 bg-indigo-50/50">
                            {m.totalPercentage}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                m.grade.startsWith('O') || m.grade.startsWith('A')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.grade.startsWith('B')
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {m.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-3 text-center">Conducted</th>
                        <th className="py-3 px-3 text-center">Present</th>
                        <th className="py-3 px-3 text-center">On Duty (OD)</th>
                        <th className="py-3 px-3 text-center">Percentage</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Object.values(student.subjectAttendance) as Array<{
                        subjectCode: string;
                        subjectName: string;
                        facultyName: string;
                        conducted: number;
                        attended: number;
                        od: number;
                        percentage: number;
                      }>).map((sa) => (
                        <tr key={sa.subjectCode} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{sa.subjectName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {sa.subjectCode} • {sa.facultyName}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-700 font-medium">
                            {sa.conducted}
                          </td>
                          <td className="py-3 px-3 text-center text-emerald-700 font-semibold">
                            {sa.attended}
                          </td>
                          <td className="py-3 px-3 text-center text-amber-700 font-semibold">
                            {sa.od}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-900">
                            {sa.percentage}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getAttendanceStatusBadge(sa.percentage)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-3">
              {student.assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{asg.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {asg.subjectName} ({asg.subjectCode}) • Due: {asg.dueDate}
                      {asg.submittedOn && ` • Submitted: ${asg.submittedOn}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {asg.score !== undefined && (
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                        Score: {asg.score} / {asg.maxScore}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        asg.status === 'Graded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : asg.status === 'Submitted'
                          ? 'bg-blue-100 text-blue-800'
                          : asg.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {asg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
