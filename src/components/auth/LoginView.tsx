import React, { useState, useMemo } from 'react';
import { usePortal } from '../../context/PortalContext';
import { UserRole } from '../../types';
import { DatabaseStatusModal } from '../common/DatabaseStatusModal';
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Shield,
  Mail,
  KeyRound,
  Maximize,
  Minimize,
  Award,
  BookOpen,
  Calendar,
  Check,
  RotateCcw,
  Database,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    loginStudent,
    loginFaculty,
    loginHOD,
    loginAdmin,
    forgotPassword,
    dbStatus,
    departments,
    hod,
    hodList,
    resetAllData,
  } = usePortal();

  const [activeTab, setActiveTab] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Build accurate allocated HOD list from hodList and departments
  const allocatedHODs = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      department: string;
      code: string;
      password: string;
      email: string;
    }> = [];

    if (hodList && hodList.length > 0) {
      hodList.forEach((h) => {
        const dept = departments.find(
          (d) =>
            d.name.toLowerCase() === (h.department || '').toLowerCase() ||
            d.hodId === h.id ||
            d.hodName?.toLowerCase() === h.name.toLowerCase()
        );
        list.push({
          id: h.id,
          name: h.name,
          department: h.department,
          code: dept?.code || 'HOD',
          password: h.password || dept?.hodPassword || 'hod123',
          email: h.email,
        });
      });
    }

    departments.forEach((dept) => {
      const alreadyInList = list.some(
        (h) =>
          h.name.toLowerCase() === (dept.hodName || '').toLowerCase() ||
          h.department.toLowerCase() === (dept.name || '').toLowerCase()
      );
      if (!alreadyInList && dept.hodName) {
        list.push({
          id: dept.hodId || `HOD-${dept.code}`,
          name: dept.hodName,
          department: dept.name,
          code: dept.code,
          password: dept.hodPassword || 'hod123',
          email: dept.hodEmail || `${dept.code.toLowerCase()}hod@park.ac.in`,
        });
      }
    });

    return list;
  }, [hodList, departments]);

  // Form states
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const [facultyName, setFacultyName] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');

  const [hodName, setHodName] = useState('');
  const [hodPassword, setHodPassword] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Forgot password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotMsg, setForgotMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!studentRegNo.trim()) {
      setErrorMessage('Please enter your student registration number.');
      return;
    }
    if (!studentPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }
    const res = loginStudent(studentRegNo, studentPassword);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
    }
  };

  const handleFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!facultyName.trim()) {
      setErrorMessage('Please enter your faculty name or ID.');
      return;
    }
    if (!facultyPassword) {
      setErrorMessage('Please enter your faculty password.');
      return;
    }
    const res = loginFaculty(facultyName, facultyPassword);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
    }
  };

  const handleHODSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!hodName.trim()) {
      setErrorMessage('Please enter your HOD name or ID.');
      return;
    }
    if (!hodPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }
    const res = loginHOD(hodName, hodPassword);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!adminEmail.trim()) {
      setErrorMessage('Please enter Administrator Name or Email.');
      return;
    }
    const res = loginAdmin(adminEmail);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    setIsSubmittingForgot(true);
    setForgotMsg(null);
    const res = await forgotPassword(forgotInput.trim());
    setIsSubmittingForgot(false);
    setForgotMsg({ text: res.message, success: res.success });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Controls: Fullscreen & Status */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDbModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer shadow-sm"
          title="Configure and connect TiDB Cloud Database"
        >
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50' : 'bg-amber-400 animate-pulse'}`} />
          <span>{dbStatus?.connected ? 'TiDB Connected' : 'Connect TiDB Database'}</span>
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900/90 hover:bg-slate-850 hover:text-white rounded-lg border border-slate-800 transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* Main Dual-Column Showcase Container */}
      <div className="w-full max-w-5xl bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: INSTITUTIONAL BRANDING & SHOWCASE (Unique & Distinctive)     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div>
            {/* College Crest & Badge */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Autonomous Institution
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Affiliated to Anna University
                </div>
              </div>
            </div>

            {/* Institution Title */}
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              Park College of Engineering and Technology
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Autonomous Academic Management & Examination ERP System (R2022 Curriculum)
            </p>

            {/* Feature Highlights with Icons */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Period Attendance Tracking</div>
                  <div className="text-[11px] text-slate-400">75% statutory Anna University eligibility calculator</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <Award className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Continuous Internal Assessment</div>
                  <div className="text-[11px] text-slate-400">CIA 1, CIA 2, Model Exam & weighted grading</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Role-Based Dashboard Portals</div>
                  <div className="text-[11px] text-slate-400">Tailored views for Student, Faculty, HOD & Admin</div>
                </div>
              </div>
            </div>

            {/* TiDB Cloud Database Quick Status & Connection Prompt */}
            <div className="mt-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <div className="text-[11px]">
                  <span className="text-slate-400">Database: </span>
                  <span className={dbStatus?.connected ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                    {dbStatus?.connected ? "TiDB Connected" : "Local Store"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDbModalOpen(true)}
                className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-colors cursor-pointer"
              >
                {dbStatus?.connected ? "Status" : "Connect TiDB"}
              </button>
            </div>
          </div>

          {/* Bottom Campus Accreditation Footer */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Coimbatore, Tamil Nadu</span>
            <span className="font-semibold text-slate-300">Estd. 1997 • NBA Accredited</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: AUTHENTICATION FORM & ROLE TABS                              */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Header Title inside Card */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Sign in to Portal
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your role to access your personalized academic dashboard
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Secure SSL
              </span>
            </div>

            {/* 4-Role Segmented Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-5 border border-slate-200">
              <button
                id="tab-student-login"
                type="button"
                onClick={() => {
                  setActiveTab('student');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'student'
                    ? 'bg-white text-emerald-800 shadow-sm border border-slate-200 ring-1 ring-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Student</span>
              </button>

              <button
                id="tab-faculty-login"
                type="button"
                onClick={() => {
                  setActiveTab('faculty');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'faculty'
                    ? 'bg-white text-blue-800 shadow-sm border border-slate-200 ring-1 ring-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Staff</span>
              </button>

              <button
                id="tab-hod-login"
                type="button"
                onClick={() => {
                  setActiveTab('hod');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'hod'
                    ? 'bg-white text-purple-800 shadow-sm border border-slate-200 ring-1 ring-purple-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>HOD</span>
              </button>

              <button
                id="tab-admin-login"
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white text-rose-800 shadow-sm border border-slate-200 ring-1 ring-rose-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Admin</span>
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* TAB 1: STUDENT LOGIN FORM */}
            {activeTab === 'student' && (
              <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Registration Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <input
                      id="student-regno-input"
                      type="text"
                      required
                      value={studentRegNo}
                      onChange={(e) => setStudentRegNo(e.target.value)}
                      placeholder="Enter Student Registration Number"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Student Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotInput(studentRegNo);
                        setIsForgotModalOpen(true);
                      }}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="student-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Enter Student Password"
                      className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    id="student-login-submit-btn"
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Sign In as Student</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: STAFF LOGIN FORM */}
            {activeTab === 'faculty' && (
              <form onSubmit={handleFacultySubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Staff Name / Staff ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <input
                      id="faculty-name-input"
                      type="text"
                      required
                      value={facultyName}
                      onChange={(e) => setFacultyName(e.target.value)}
                      placeholder="Enter Staff Name or Staff ID"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Staff Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotInput(facultyName);
                        setIsForgotModalOpen(true);
                      }}
                      className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="faculty-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={facultyPassword}
                      onChange={(e) => setFacultyPassword(e.target.value)}
                      placeholder="Enter Staff Password"
                      className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    id="faculty-login-submit-btn"
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Sign In as Staff</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: HOD LOGIN FORM */}
            {activeTab === 'hod' && (
              <form onSubmit={handleHODSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    HOD Name / ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <input
                      id="hod-name-input"
                      type="text"
                      required
                      value={hodName}
                      onChange={(e) => setHodName(e.target.value)}
                      placeholder="Enter HOD Name or ID"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      HOD Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotInput(hodName);
                        setIsForgotModalOpen(true);
                      }}
                      className="text-[11px] font-semibold text-purple-700 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="hod-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={hodPassword}
                      onChange={(e) => setHodPassword(e.target.value)}
                      placeholder="Enter HOD Password"
                      className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    id="hod-login-submit-btn"
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Sign In as HOD</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: ADMIN LOGIN FORM (Name or Email only) */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Administrator Name or Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-email-input"
                      type="text"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="Enter Administrator Name or Email"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-rose-600 font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Direct administrator authorization with Name or Email.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    id="admin-login-submit-btn"
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Sign In as Administrator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Clean Portal Reset Footer Link */}
          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Park College ERP • v3.0</span>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Reset all portal data back to factory defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Portal Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Portal to Default State?</h3>
                <p className="text-xs text-slate-500">Restore all initial students, staff, and departments</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will reset all modified local data, allocated HOD accounts, and passwords back to the clean official default state.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setIsResetConfirmOpen(false);
                  setSuccessMessage('Portal data has been reset to factory defaults.');
                  setTimeout(() => setSuccessMessage(''), 3000);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL                                                      */}
      {/* ========================================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <span>Reset Portal Password</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotMsg(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered Registration Number, Staff ID, or College Email address to receive secure reset credentials.
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Identifier / Email / Reg No
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    placeholder="Enter Registration Number, Staff ID, or College Email"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {forgotMsg && (
                <div
                  className={`p-2.5 rounded-lg text-xs ${
                    forgotMsg.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {forgotMsg.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotMsg(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForgot}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg disabled:opacity-50"
                >
                  {isSubmittingForgot ? 'Processing...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* TiDB Database Configuration Modal */}
      <DatabaseStatusModal isOpen={dbModalOpen} onClose={() => setDbModalOpen(false)} />
    </div>
  );
};
