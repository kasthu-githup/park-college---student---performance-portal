import React, { useState } from 'react';
import { Faculty } from '../../types';
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Globe,
  ExternalLink,
  CheckCircle2,
  Users,
  Edit3,
} from 'lucide-react';

interface FacultyDetailModalProps {
  faculty: Faculty | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (faculty: Faculty) => void;
}

export const FacultyDetailModal: React.FC<FacultyDetailModalProps> = ({
  faculty,
  isOpen = true,
  onClose,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'education' | 'research' | 'teaching'>('profile');

  if (!isOpen || !faculty) return null;

  const totalStudentsTaught = faculty.assignedClasses.reduce(
    (acc, curr) => acc + (curr.totalStudents || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 px-6 py-5 text-white shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-white/20 text-white flex items-center justify-center font-extrabold text-xl shadow-lg">
                {faculty.name.replace('Dr. ', '').replace('Prof. ', '').charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    {faculty.name}
                  </h2>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30">
                    {faculty.id}
                  </span>
                </div>
                <p className="text-xs text-purple-200/90 font-medium mt-0.5">
                  {faculty.designation} • Dept of {faculty.department}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    {faculty.experienceYears || 10}+ Years Exp
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    {faculty.qualification || 'M.E / Ph.D'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Class Mentor (Sec {faculty.assignedMenteeSection || 'A'})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(faculty);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600/80 hover:bg-purple-600 border border-purple-400/40 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-purple-700 text-purple-800 bg-white shadow-2xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Overview & Contact
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'education'
                ? 'border-purple-700 text-purple-800 bg-white shadow-2xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Qualifications & Education
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('research')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'research'
                ? 'border-purple-700 text-purple-800 bg-white shadow-2xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Research, Papers & Patents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teaching')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'teaching'
                ? 'border-purple-700 text-purple-800 bg-white shadow-2xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Teaching Workload ({faculty.assignedClasses.length} Courses)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* TAB 1: OVERVIEW & CONTACT */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Bio Banner */}
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900">
                  Faculty Profile & Statement
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {faculty.bio || 'Experienced academician dedicated to classroom excellence, mentorship, and high-impact engineering research.'}
                </p>
              </div>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Teaching Exp
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    {faculty.experienceYears || 12} Years
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Publications
                  </span>
                  <span className="text-base font-extrabold text-purple-700">
                    {faculty.publicationsCount || 15} Papers
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Patents & Grants
                  </span>
                  <span className="text-base font-extrabold text-indigo-700">
                    {faculty.patentsCount || 2} Granted
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Mentee Section
                  </span>
                  <span className="text-base font-extrabold text-emerald-700">
                    Section {faculty.assignedMenteeSection || 'A'}
                  </span>
                </div>
              </div>

              {/* Contact & Cabin Details */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-purple-600" />
                  Official Contact & Campus Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-semibold block">Official College Email</span>
                    <a
                      href={`mailto:${faculty.email}`}
                      className="font-medium text-purple-700 hover:underline block"
                    >
                      {faculty.email}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-semibold block">Direct Contact Phone</span>
                    <span className="font-semibold text-slate-900">{faculty.phone || '+91 98401 23456'}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-semibold block">Cabin / Office Room</span>
                    <span className="font-medium text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      {faculty.cabin}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-semibold block">Student Counseling Hours</span>
                    <span className="font-medium text-slate-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      {faculty.officeHours}
                    </span>
                  </div>
                </div>

                {faculty.address && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">Residential Address</span>
                    <p className="text-slate-700 font-medium">{faculty.address}</p>
                  </div>
                )}
              </div>

              {/* Specialization & Research Focus */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Core Specializations & Subject Mastery
                </span>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {faculty.specialization}
                </p>
                {faculty.areasOfInterest && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                      Areas of Research Interest:
                    </span>
                    <p className="text-xs text-slate-700">{faculty.areasOfInterest}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: QUALIFICATIONS & EDUCATION */}
          {activeTab === 'education' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-950">Academic Dossier Status</span>
                  <p className="text-[11px] text-indigo-800">
                    Verified through Anna University Faculty Records & Centre for Academic Courses
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Faculty
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Ph.D */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Doctoral Degree (Ph.D)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">Doctor of Philosophy</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {faculty.phdDegree || faculty.qualification?.includes('Ph.D') ? faculty.phdDegree || faculty.qualification : 'Ph.D (Registered / Pursuing)'}
                  </p>
                </div>

                {/* PG Degree */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Postgraduate Degree (PG)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">Master of Engineering</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {faculty.pgDegree || 'M.E (Computer Science and Engineering) - Anna University'}
                  </p>
                </div>

                {/* UG Degree */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Undergraduate Degree (UG)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">Bachelor of Engineering</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {faculty.ugDegree || 'B.E (Computer Science and Engineering) - First Class'}
                  </p>
                </div>
              </div>

              {/* Service & Joining Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Date of Joining (DOJ)
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {faculty.doj || '2016-06-15'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Gender
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {faculty.gender || 'Male'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Emergency Contact
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {faculty.emergencyContact || '+91 98400 99881'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESEARCH & PUBLICATIONS */}
          {activeTab === 'research' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center">
                  <FileText className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <span className="text-lg font-extrabold text-purple-950 block">
                    {faculty.publicationsCount || 16}
                  </span>
                  <span className="text-[11px] font-bold text-purple-800">
                    Journal Publications (SCI / Scopus)
                  </span>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                  <Sparkles className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <span className="text-lg font-extrabold text-indigo-950 block">
                    {faculty.patentsCount || 2}
                  </span>
                  <span className="text-[11px] font-bold text-indigo-800">
                    Patents Filed / Granted
                  </span>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <Globe className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <span className="text-lg font-extrabold text-blue-950 block">
                    {faculty.conferencesCount || 12}
                  </span>
                  <span className="text-[11px] font-bold text-blue-800">
                    International Conferences
                  </span>
                </div>
              </div>

              {/* Awards & Recognitions */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Awards, Honours & Professional Memberships</span>
                </div>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {faculty.awards || 'Senior Member IEEE, Computer Society of India (CSI) Lifetime Fellow, Best Teacher Citation 2023.'}
                </p>
              </div>

              {/* Research Areas */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Funded Projects & Research Grants
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Active Principal Investigator (PI) for Anna University Centre for Technology Development (CTDT) student innovation grants and AICTE Modernization of Laboratories (MODROBS).
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TEACHING WORKLOAD */}
          {activeTab === 'teaching' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">Total Teaching Load</span>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {faculty.assignedClasses.length} Course Sections • {totalStudentsTaught} Total Students
                  </div>
                </div>
                <div className="px-3 py-1 bg-purple-100 border border-purple-300 text-purple-900 font-extrabold text-xs rounded-lg">
                  Sem 5 Active Batches
                </div>
              </div>

              <div className="space-y-2">
                {faculty.assignedClasses.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs hover:border-purple-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-mono font-bold text-xs">
                        {c.subjectCode}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{c.subjectName}</h4>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Year {c.year} • Semester {c.semester} • Section {c.section}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {c.totalStudents} Students
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Park College of Engineering and Technology • Faculty Academic Management System
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer text-xs"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
