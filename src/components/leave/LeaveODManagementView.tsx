import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { LeaveRequest, Student } from '../../types';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  UserCheck,
  Calendar,
  Award,
  AlertCircle,
  PlusCircle,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Building,
  RotateCcw,
} from 'lucide-react';

interface LeaveODManagementViewProps {
  reviewerRole: 'faculty' | 'hod';
}

export const LeaveODManagementView: React.FC<LeaveODManagementViewProps> = ({ reviewerRole }) => {
  const {
    leaveRequests,
    reviewLeaveRequest,
    submitLeaveRequest,
    students,
    currentUser,
  } = usePortal();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected' | 'OD_ONLY'>('ALL');
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'A' | 'B'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Direct Grant OD Modal State
  const [isGrantODModalOpen, setIsGrantODModalOpen] = useState(false);
  const [grantStudentRegNo, setGrantStudentRegNo] = useState(students[0]?.regNo || '');
  const [grantType, setGrantType] = useState<'On-Duty (OD)' | 'Symposium / Conference'>('On-Duty (OD)');
  const [grantStartDate, setGrantStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [grantEndDate, setGrantEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [grantDays, setGrantDays] = useState(1);
  const [grantReason, setGrantReason] = useState('Authorized College Event Participation / Symposium');

  const reviewerName = currentUser ? (currentUser.data as any).name : 'Faculty Advisor';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter requests
  const filteredRequests = leaveRequests.filter((req) => {
    // Status filter
    if (statusFilter === 'OD_ONLY') {
      if (!req.type.includes('OD') && !req.type.includes('On-Duty') && !req.type.includes('Symposium')) {
        return false;
      }
    } else if (statusFilter !== 'ALL' && req.status !== statusFilter) {
      return false;
    }

    // Section filter
    if (sectionFilter !== 'ALL' && req.section !== sectionFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        req.studentName.toLowerCase().includes(q) ||
        req.studentRegNo.toLowerCase().includes(q) ||
        req.reason.toLowerCase().includes(q) ||
        req.type.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const pendingCount = leaveRequests.filter((r) => r.status === 'Pending').length;
  const approvedCount = leaveRequests.filter((r) => r.status === 'Approved').length;
  const rejectedCount = leaveRequests.filter((r) => r.status === 'Rejected').length;
  const odCount = leaveRequests.filter(
    (r) => r.type.includes('OD') || r.type.includes('On-Duty') || r.type.includes('Symposium')
  ).length;

  // Approve single request
  const handleApprove = (req: LeaveRequest, customComment?: string) => {
    const comment =
      customComment ||
      actionComment.trim() ||
      `On-Duty / Leave approved by ${reviewerRole.toUpperCase()} (${reviewerName}). OD attendance credited.`;
    reviewLeaveRequest(req.id, 'Approved', comment);
    showToast(`Approved ${req.type} for ${req.studentName} (${req.studentRegNo}). Attendance credit applied.`);
    setSelectedRequest(null);
    setActionComment('');
  };

  // Reject single request
  const handleReject = (req: LeaveRequest, customComment?: string) => {
    const comment =
      customComment ||
      actionComment.trim() ||
      `Application declined by ${reviewerRole.toUpperCase()} (${reviewerName}).`;
    reviewLeaveRequest(req.id, 'Rejected', comment);
    showToast(`Application for ${req.studentName} marked as Rejected.`);
    setSelectedRequest(null);
    setActionComment('');
  };

  // Batch approve all pending in current view
  const handleBatchApprovePending = () => {
    const pendingList = filteredRequests.filter((r) => r.status === 'Pending');
    if (pendingList.length === 0) return;

    pendingList.forEach((req) => {
      reviewLeaveRequest(
        req.id,
        'Approved',
        `Batch verified and approved by ${reviewerRole.toUpperCase()} (${reviewerName}).`
      );
    });

    showToast(`Successfully batch-approved ${pendingList.length} application(s).`);
  };

  // Handle direct grant of OD
  const handleGrantDirectOD = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.regNo === grantStudentRegNo);
    if (!student) return;

    submitLeaveRequest({
      studentRegNo: student.regNo,
      studentName: student.name,
      department: student.department,
      year: student.year,
      section: student.section,
      startDate: grantStartDate,
      endDate: grantEndDate,
      daysCount: Number(grantDays),
      reason: grantReason,
      type: grantType,
      status: 'Approved',
      reviewedBy: reviewerName,
      reviewerComments: `Direct ${grantType} authorized and granted by ${reviewerRole.toUpperCase()} (${reviewerName}).`,
    });

    showToast(`Direct ${grantType} approved and attendance credited for ${student.name}.`);
    setIsGrantODModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200 border border-slate-700 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                {reviewerRole === 'hod' ? 'HOD Department Approvals' : 'Class Advisor & Staff Portal'}
              </span>
              <span className="text-xs text-slate-500">• Academic Year 2025-2026</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Student On-Duty (OD) & Leave Management
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Students submit On-Duty (OD) applications for symposiums, sports, workshops, and medical leave. Review, accept, or reject each application below. Accepting an OD automatically credits the student's overall attendance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={handleBatchApprovePending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve All Pending ({pendingCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsGrantODModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Grant Direct OD</span>
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div
            onClick={() => setStatusFilter('ALL')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-100 border-slate-400 shadow-2xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="text-[10px] font-bold uppercase text-slate-500">Total Applications</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{leaveRequests.length}</div>
          </div>

          <div
            onClick={() => setStatusFilter('Pending')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              statusFilter === 'Pending'
                ? 'bg-amber-100/80 border-amber-400 shadow-2xs'
                : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/50'
            }`}
          >
            <div className="text-[10px] font-bold uppercase text-amber-700 flex items-center justify-between">
              <span>Pending Action</span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <div className="text-xl font-extrabold text-amber-800 mt-0.5">{pendingCount}</div>
          </div>

          <div
            onClick={() => setStatusFilter('Approved')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              statusFilter === 'Approved'
                ? 'bg-emerald-100/80 border-emerald-400 shadow-2xs'
                : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/50'
            }`}
          >
            <div className="text-[10px] font-bold uppercase text-emerald-700">Approved OD / Leave</div>
            <div className="text-xl font-extrabold text-emerald-800 mt-0.5">{approvedCount}</div>
          </div>

          <div
            onClick={() => setStatusFilter('Rejected')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              statusFilter === 'Rejected'
                ? 'bg-rose-100/80 border-rose-400 shadow-2xs'
                : 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/50'
            }`}
          >
            <div className="text-[10px] font-bold uppercase text-rose-700">Declined Requests</div>
            <div className="text-xl font-extrabold text-rose-800 mt-0.5">{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({leaveRequests.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              statusFilter === 'Pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>Pending</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {pendingCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('OD_ONLY')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              statusFilter === 'OD_ONLY'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>OD Only ({odCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Approved')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'Approved'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Rejected')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'Rejected'
                ? 'bg-rose-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Section Filter */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800"
          >
            <option value="ALL">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or reason..."
              className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main Content List / Cards */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No applications match your filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {statusFilter === 'Pending'
                ? 'All pending student OD and leave requests have been reviewed!'
                : 'No student OD or leave applications found in this category.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setSectionFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isOD =
              req.type.includes('OD') ||
              req.type.includes('On-Duty') ||
              req.type.includes('Symposium');
            const studentInfo = students.find((s) => s.regNo === req.studentRegNo);

            return (
              <div
                key={req.id}
                className={`bg-white rounded-xl border p-4 shadow-2xs transition-all ${
                  req.status === 'Pending'
                    ? 'border-amber-300 ring-1 ring-amber-100 bg-amber-50/20'
                    : req.status === 'Approved'
                    ? 'border-emerald-200'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  {/* Left Column: Student Details & Badges */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        isOD
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {req.studentName.charAt(0)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900">
                          {req.studentName}
                        </span>
                        <span className="font-mono text-xs font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {req.studentRegNo}
                        </span>
                        <span className="text-[11px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          Sec {req.section} • Year {req.year}
                        </span>

                        {/* Request Type Badge */}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            req.type === 'On-Duty (OD)'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : req.type === 'Symposium / Conference'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : req.type === 'Medical'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {isOD && <Award className="w-3 h-3 text-emerald-700" />}
                          {req.type}
                        </span>
                      </div>

                      {/* Reason text */}
                      <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                        "{req.reason}"
                      </p>

                      {/* Date & Duration Info */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          {req.startDate} to {req.endDate}
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold text-xs bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {req.daysCount} Day{req.daysCount > 1 ? 's' : ''} Duration
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          Applied On: {req.appliedOn}
                        </span>
                        {studentInfo && (
                          <span className="text-[11px] text-slate-500">
                            Current Attendance:{' '}
                            <strong
                              className={
                                studentInfo.overallAttendance.percentage >= 75
                                  ? 'text-emerald-700'
                                  : 'text-rose-700'
                              }
                            >
                              {studentInfo.overallAttendance.percentage}%
                            </strong>{' '}
                            (OD: {studentInfo.overallAttendance.od || 0} days)
                          </span>
                        )}
                      </div>

                      {/* Review remarks if already reviewed */}
                      {req.reviewedBy && (
                        <div className="text-[11px] text-slate-600 bg-slate-100/80 px-2.5 py-1.5 rounded-md border border-slate-200 flex items-center gap-2 mt-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {req.status === 'Approved' ? 'Approved' : 'Declined'} by{' '}
                            <strong>{req.reviewedBy}</strong> on {req.reviewedOn || 'Today'}
                            {req.reviewerComments && ` — "${req.reviewerComments}"`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Status & Direct Action Buttons */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 shrink-0 pt-2 md:pt-0">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : req.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                      }`}
                    >
                      {req.status === 'Approved' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      ) : req.status === 'Rejected' ? (
                        <XCircle className="w-3.5 h-3.5 text-rose-700" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                      )}
                      <span>{req.status.toUpperCase()}</span>
                    </span>

                    {/* Direct Accept / Reject Buttons for Pending */}
                    {req.status === 'Pending' ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => handleApprove(req)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                          title="Accept and credit student attendance"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept / Approve OD</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(req)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                          title="Decline this application"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      /* Option to re-open / change decision */
                      <div className="flex items-center gap-1 mt-1">
                        {req.status === 'Approved' ? (
                          <button
                            type="button"
                            onClick={() => handleReject(req, 'Decision revoked upon re-assessment.')}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                          >
                            Revoke Approval
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApprove(req, 'Re-evaluated and approved.')}
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                          >
                            Re-approve Application
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Grant Direct OD Modal */}
      {isGrantODModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Grant Direct Student On-Duty (OD)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGrantODModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGrantDirectOD} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Select Student *
                </label>
                <select
                  value={grantStudentRegNo}
                  onChange={(e) => setGrantStudentRegNo(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2"
                >
                  {students.map((s) => (
                    <option key={s.regNo} value={s.regNo}>
                      {s.name} ({s.regNo}) - Sec {s.section}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  OD Category *
                </label>
                <select
                  value={grantType}
                  onChange={(e) => setGrantType(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2"
                >
                  <option value="On-Duty (OD)">On-Duty (OD) - Inter-College Event / Sports</option>
                  <option value="Symposium / Conference">Technical Symposium / Hackathon</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={grantStartDate}
                    onChange={(e) => setGrantStartDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={grantEndDate}
                    onChange={(e) => setGrantEndDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Number of Days (OD Attendance Benefit)
                </label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={grantDays}
                  onChange={(e) => setGrantDays(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Purpose / Institution / Event Remarks *
                </label>
                <textarea
                  rows={2}
                  required
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="e.g. Representing Park College at National Level Technical Symposium, PSG Tech"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                ⚡ Note: Direct On-Duty granted by faculty automatically registers on the student's record and provides immediate attendance credit.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGrantODModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  Grant & Approve OD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
