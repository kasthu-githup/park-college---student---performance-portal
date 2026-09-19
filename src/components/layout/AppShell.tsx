import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { UserRole } from '../../types';
import { EditProfileModal } from '../common/EditProfileModal';
import { DatabaseStatusModal } from '../common/DatabaseStatusModal';
import { PrintReportModal } from '../reports/PrintReportModal';
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Building2,
  LogOut,
  Menu,
  X,
  Database,
  Maximize,
  Minimize,
  UserCog,
  LayoutDashboard,
  BookOpen,
  Calendar,
  User,
  CreditCard,
  Bell,
  FileText,
  Award,
  Users,
  FileCheck,
  HeartHandshake,
  TrendingUp,
  Settings,
  Shield,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  Printer,
} from 'lucide-react';

interface AppShellProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ currentTab, onSelectTab, children }) => {
  const { currentUser, logout, dbStatus, announcements, leaveRequests, fees, students } = usePortal();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!currentUser) return null;

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

  // Build navigation items for each role
  const getNavItems = (): NavItem[] => {
    switch (currentUser.role) {
      case 'student':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'academics', label: 'Marks & CIA', icon: Award },
          { id: 'attendance', label: 'Attendance', icon: Calendar },
          { id: 'advisor', label: 'Advisor', icon: User },
          { id: 'fees', label: 'Fees', icon: CreditCard },
          { id: 'leave', label: 'Leave / OD', icon: FileText },
        ];
      case 'faculty': {
        const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending').length;
        return [
          { id: 'attendance', label: 'Daily Attendance Entry', icon: Calendar },
          { id: 'marks', label: 'Internal Marks & Grades', icon: Award },
          { id: 'students', label: 'Class Students Directory', icon: Users },
          { id: 'assignments', label: 'Assignments & Labs', icon: FileCheck },
          { id: 'mentor', label: 'Mentorship & Counseling', icon: HeartHandshake },
          {
            id: 'leave',
            label: 'Student Leave & OD',
            icon: FileText,
            badge: pendingLeaves > 0 ? pendingLeaves : undefined,
            badgeColor: 'bg-amber-500',
          },
        ];
      }
      case 'hod': {
        const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending').length;
        return [
          { id: 'overview', label: 'Department Overview', icon: LayoutDashboard },
          { id: 'students', label: 'Students Directory', icon: GraduationCap },
          { id: 'faculty', label: 'Staff Directory & Workload', icon: Users },
          {
            id: 'leave',
            label: 'Student Leave & OD Approvals',
            icon: FileText,
            badge: pendingLeaves > 0 ? pendingLeaves : undefined,
            badgeColor: 'bg-amber-500',
          },
          { id: 'subjectAttendance', label: 'Subject Attendance Analytics', icon: TrendingUp },
          { id: 'reports', label: 'Official Register & Reports', icon: FileText },
        ];
      }
      case 'admin': {
        const pendingFees = fees.filter((f) => f.status === 'Pending').length;
        return [
          { id: 'overview', label: 'Institution Overview', icon: LayoutDashboard },
          { id: 'users', label: 'User Accounts & Access', icon: Users },
          { id: 'departments', label: 'Academic Departments', icon: Building2 },
          { id: 'subjects', label: 'Course Catalog & Syllabus', icon: BookOpen },
          {
            id: 'fees',
            label: 'College Fee Ledger',
            icon: CreditCard,
            badge: pendingFees > 0 ? pendingFees : undefined,
            badgeColor: 'bg-rose-500',
          },
          { id: 'audit', label: 'Security Audit Trail', icon: Shield },
          { id: 'settings', label: 'Database & Settings', icon: Settings },
        ];
      }
    }
  };

  const navItems = getNavItems();

  // Role visual colors
  const getRoleTheme = () => {
    switch (currentUser.role) {
      case 'student':
        return {
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30',
          roleName: 'Student Portal',
          accentColor: 'text-emerald-400',
          avatarBg: 'bg-emerald-600 text-white',
        };
      case 'faculty':
        return {
          badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-950/30',
          roleName: 'Staff Portal',
          accentColor: 'text-blue-400',
          avatarBg: 'bg-blue-600 text-white',
        };
      case 'hod':
        return {
          badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-950/30',
          roleName: 'HOD Portal',
          accentColor: 'text-purple-400',
          avatarBg: 'bg-purple-600 text-white',
        };
      case 'admin':
        return {
          badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-950/30',
          roleName: 'Admin Portal',
          accentColor: 'text-rose-400',
          avatarBg: 'bg-rose-600 text-white',
        };
    }
  };

  const theme = getRoleTheme();

  const getUserSubtext = () => {
    if (currentUser.role === 'student') {
      return `Reg: ${currentUser.data.regNo}`;
    }
    if (currentUser.role === 'faculty') {
      return `${currentUser.data.designation}`;
    }
    if (currentUser.role === 'admin') {
      return 'System Administrator';
    }
    return `HOD • ${currentUser.data.department || 'Department'}`;
  };

  const currentTabLabel = navItems.find((item) => item.id === currentTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Permanent, Sleek Dark-Navy Surface)                   */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-slate-950 border-r border-slate-800/80 text-slate-300 min-h-screen sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/90 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-950/50 shrink-0 ring-1 ring-white/10">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white tracking-tight truncate block">
                Park College
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Autonomous
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Engineering & Technology • Anna Univ
            </p>
          </div>
        </div>

        {/* User Profile Mini-Badge */}
        <div className="px-3 py-3 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${theme.avatarBg} flex items-center justify-center text-sm font-bold shadow-xs shrink-0`}>
            {(currentUser?.data?.name || 'U').charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">
              {currentUser?.data?.name || 'User'}
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              {getUserSubtext()}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            title="Edit My Profile & Details"
          >
            <UserCog className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Category Label */}
        <div className="px-5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>{theme.roleName} Navigation</span>
          <span className="text-[9px] font-mono font-medium text-slate-400">R2022</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer group ${
                  isActive
                    ? `${theme.activeBg} font-bold`
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${
                      item.badgeColor || 'bg-indigo-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Info & Quick Controls */}
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/80 space-y-2">
          {/* Print Official Report Button */}
          <button
            id="sidebar-print-btn"
            type="button"
            onClick={() => setPrintModalOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer group"
            title="Open and Print Official Report"
          >
            <div className="flex items-center gap-2">
              <Printer className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
              <span className="font-medium group-hover:text-white">Print Official Report</span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-slate-200">A4</span>
          </button>

          {/* Database Live Connectivity Badge */}
          <button
            id="sidebar-db-status-btn"
            type="button"
            onClick={() => setDbModalOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  dbStatus?.connected ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="font-medium truncate group-hover:text-white">
                {dbStatus?.connected ? 'TiDB Cloud Connected' : 'Connect TiDB Database'}
              </span>
            </div>
            <Database className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
          </button>

          {/* Quick Utility Row: Fullscreen & Log Out */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
              <span>{isFullscreen ? 'Normal' : 'Full'}</span>
            </button>

            <button
              id="sidebar-logout-btn"
              type="button"
              onClick={logout}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] font-bold text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
              title="Sign Out of Portal"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE DRAWER NAVIGATION                                              */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative w-72 max-w-[80vw] bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col h-full z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white leading-tight">Park College</div>
                  <div className="text-[10px] text-slate-400">Autonomous Portal</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Card */}
            <div className="p-3 mx-3 my-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg ${theme.avatarBg} flex items-center justify-center text-xs font-bold shrink-0`}>
                {(currentUser?.data?.name || 'U').charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{currentUser?.data?.name || 'User'}</div>
                <div className="text-[10px] text-slate-400 truncate">{getUserSubtext()}</div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                      isActive ? `${theme.activeBg} font-bold` : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-indigo-600'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Footer */}
            <div className="p-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setDbModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Database className="w-4 h-4 text-indigo-400" />
                <span>{dbStatus?.connected ? 'TiDB Database Connected' : 'Connect TiDB Database'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-indigo-400" />
                <span>Print Official Report</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 flex items-center justify-center gap-2"
              >
                <UserCog className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="w-full py-2 px-3 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT WRAPPER (SIDEBAR-ONLY LAYOUT)                             */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative">
        {/* Mobile menu trigger for small screens (floating, unobtrusive) */}
        <div className="lg:hidden fixed top-3 left-3 z-30">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-slate-900/90 text-white shadow-md border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </div>

        {/* Content Area */}
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-3 sm:p-5 lg:p-6 pt-14 lg:pt-6">
          {children}
        </main>

        {/* Institutional Footer */}
        <footer className="bg-white border-t border-slate-200 py-3 mt-auto">
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-700 shrink-0" />
              <span className="font-bold text-slate-800">
                Park College of Engineering and Technology
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Autonomous
              </span>
              <span className="hidden md:inline text-slate-400">• Affiliated to Anna University, Chennai</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Department of Computer Science & Engineering • Academic Portal v4.2
            </div>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      <EditProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <DatabaseStatusModal isOpen={dbModalOpen} onClose={() => setDbModalOpen(false)} />
      <PrintReportModal isOpen={printModalOpen} onClose={() => setPrintModalOpen(false)} />
    </div>
  );
};
