import React, { useState, useEffect } from 'react';
import { Student, SubjectMarks, SubjectAttendance, AssignmentItem } from '../../types';
import { usePortal } from '../../context/PortalContext';
import { SUBJECT_CATALOG } from '../../data/initialData';
import {
  X,
  User,
  Save,
  CheckCircle2,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  Heart,
  Award,
  AlertCircle,
  Percent,
  Layers,
  GraduationCap,
  UserPlus,
  ShieldCheck,
  Building,
  Lock,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react';

interface EditStudentModalProps {
  student: Student | null;
  isOpen?: boolean;
  onClose: () => void;
  onSave?: (data: Partial<Student>) => void;
  isNew?: boolean;
  defaultSection?: 'A' | 'B';
  defaultFacultyAdvisor?: string;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  isOpen = true,
  onClose,
  onSave,
  isNew = false,
  defaultSection = 'A',
  defaultFacultyAdvisor = 'Dr. R. Sharma',
}) => {
  const { updateStudent, addStudent, students } = usePortal();

  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'academic' | 'marks' | 'attendance'>('basic');
  const [successToast, setSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Determine auto-suggested Register Number if creating new student
  const suggestNextRegNo = () => {
    const numbers = students
      .map((s) => {
        const match = s.regNo.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !Number.isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 12;
    const nextNum = maxNum + 1;
    return `2023CSE${nextNum.toString().padStart(3, '0')}`;
  };

  // Basic Info Form State
  const [name, setName] = useState(student ? student.name : '');
  const [regNo, setRegNo] = useState(student ? student.regNo : suggestNextRegNo());
  const [section, setSection] = useState<'A' | 'B'>(student ? student.section : defaultSection);
  const [year, setYear] = useState(student ? student.year : 3);
  const [semester, setSemester] = useState(student ? student.semester : 5);
  const [email, setEmail] = useState(student ? student.email : '');
  const [phone, setPhone] = useState(student ? student.phone : '+91 98400 ');
  const [dob, setDob] = useState(student?.dob || '2004-05-15');
  const [bloodGroup, setBloodGroup] = useState(student?.bloodGroup || 'O+');
  const [parentName, setParentName] = useState(student?.parentName || '');
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || '+91 94440 ');
  const [address, setAddress] = useState(student?.address || 'Chennai, Tamil Nadu');
  const [password, setPassword] = useState(student?.password || 'student123');
  const [showPassword, setShowPassword] = useState(false);

  // Performance Rating & Remarks State
  const [performanceRating, setPerformanceRating] = useState<'Outstanding' | 'Good' | 'Average' | 'Needs Attention'>(
    student ? student.performanceRating : 'Good'
  );
  const [facultyRemarks, setFacultyRemarks] = useState(
    student ? student.facultyRemarks : `Enrolled under Class Advisor ${defaultFacultyAdvisor} for Anna University Autonomous Program.`
  );
  const [cgpa, setCgpa] = useState(student ? student.cgpa : 8.15);
  const [currentSemesterGpa, setCurrentSemesterGpa] = useState(student ? student.currentSemesterGpa : 8.20);
  const [facultyAdvisor, setFacultyAdvisor] = useState(
    student?.facultyAdvisor || defaultFacultyAdvisor
  );
  const [mentor, setMentor] = useState(student?.mentor || defaultFacultyAdvisor);

  // Attendance Numbers
  const [presentDays, setPresentDays] = useState(student ? student.overallAttendance.present : 48);
  const [absentDays, setAbsentDays] = useState(student ? student.overallAttendance.absent : 2);
  const [odDays, setOdDays] = useState(student ? student.overallAttendance.od : 2);
  const [totalClasses, setTotalClasses] = useState(student ? student.overallAttendance.total : 52);

  // Subject Marks State
  const [marksMap, setMarksMap] = useState<Record<string, SubjectMarks>>(() => {
    const copy: Record<string, SubjectMarks> = {};
    SUBJECT_CATALOG.forEach((subj, idx) => {
      if (student && student.marks[subj.code]) {
        copy[subj.code] = { ...student.marks[subj.code] };
      } else {
        // Realistic defaults for newly added students
        const defaultI1 = 38 + (idx % 8);
        const defaultI2 = 40 + (idx % 7);
        const defaultModel = 78 + (idx % 12);
        const defaultAssgn = 9;
        const total = Math.round(((defaultI1 / 50) * 25 + (defaultI2 / 50) * 25 + (defaultModel / 100) * 40 + (defaultAssgn / 10) * 10) * 10) / 10;
        let grade = 'A+ (Excellent)';
        if (total >= 90) grade = 'O (Outstanding)';
        else if (total >= 80) grade = 'A+ (Excellent)';
        else if (total >= 70) grade = 'A (Very Good)';
        else if (total >= 60) grade = 'B+ (Good)';
        else grade = 'B (Above Average)';

        copy[subj.code] = {
          subjectCode: subj.code,
          subjectName: subj.name,
          internal1: defaultI1,
          internal2: defaultI2,
          modelExam: defaultModel,
          assignment: defaultAssgn,
          totalPercentage: total,
          grade,
        };
      }
    });
    return copy;
  });

  // Calculate live overall attendance percentage
  const calculatedAttdPercentage =
    totalClasses > 0 ? Math.round(((presentDays + odDays) / totalClasses) * 1000) / 10 : 0;

  // Handle live mark update for a subject
  const handleMarkChange = (
    subjCode: string,
    field: 'internal1' | 'internal2' | 'modelExam' | 'assignment',
    val: number
  ) => {
    setMarksMap((prev) => {
      const current = prev[subjCode];
      if (!current) return prev;

      const updated = {
        ...current,
        [field]: Number.isNaN(val) ? 0 : Math.max(0, val),
      };

      // Recalculate percentage
      const total =
        Math.round(
          ((updated.internal1 / 50) * 25 +
            (updated.internal2 / 50) * 25 +
            (updated.modelExam / 100) * 40 +
            (updated.assignment / 10) * 10) *
            10
        ) / 10;

      let grade = 'RA (Re-appear)';
      if (total >= 90) grade = 'O (Outstanding)';
      else if (total >= 80) grade = 'A+ (Excellent)';
      else if (total >= 70) grade = 'A (Very Good)';
      else if (total >= 60) grade = 'B+ (Good)';
      else if (total >= 50) grade = 'B (Above Average)';

      updated.totalPercentage = total;
      updated.grade = grade;

      return {
        ...prev,
        [subjCode]: updated,
      };
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    if (isNew) {
      setName('');
      setRegNo(suggestNextRegNo());
      setSection(defaultSection);
      setYear(3);
      setSemester(5);
      setEmail('');
      setPhone('+91 98400 ');
      setDob('2004-05-15');
      setBloodGroup('O+');
      setParentName('');
      setParentPhone('+91 94440 ');
      setAddress('Chennai, Tamil Nadu');
      setPassword('student123');
      setPerformanceRating('Good');
      setFacultyRemarks(`Enrolled under Class Advisor ${defaultFacultyAdvisor} for Anna University Autonomous Program.`);
      setCgpa(8.15);
      setCurrentSemesterGpa(8.20);
      setFacultyAdvisor(defaultFacultyAdvisor);
      setMentor(defaultFacultyAdvisor);
      setPresentDays(48);
      setAbsentDays(2);
      setOdDays(2);
      setTotalClasses(52);
    } else if (student) {
      setName(student.name);
      setRegNo(student.regNo);
      setSection(student.section);
      setYear(student.year);
      setSemester(student.semester);
      setEmail(student.email);
      setPhone(student.phone);
      setDob(student.dob || '2004-05-15');
      setBloodGroup(student.bloodGroup || 'O+');
      setParentName(student.parentName || '');
      setParentPhone(student.parentPhone || '+91 94440 ');
      setAddress(student.address || 'Chennai, Tamil Nadu');
      setPassword(student.password || 'student123');
      setPerformanceRating(student.performanceRating);
      setFacultyRemarks(student.facultyRemarks);
      setCgpa(student.cgpa);
      setCurrentSemesterGpa(student.currentSemesterGpa);
      setFacultyAdvisor(student.facultyAdvisor || defaultFacultyAdvisor);
      setMentor(student.mentor || defaultFacultyAdvisor);
      setPresentDays(student.overallAttendance.present);
      setAbsentDays(student.overallAttendance.absent);
      setOdDays(student.overallAttendance.od);
      setTotalClasses(student.overallAttendance.total);

      const copy: Record<string, SubjectMarks> = {};
      SUBJECT_CATALOG.forEach((subj) => {
        if (student.marks[subj.code]) {
          copy[subj.code] = { ...student.marks[subj.code] };
        }
      });
      setMarksMap(copy);
    }
  }, [isOpen, isNew, student, defaultSection, defaultFacultyAdvisor]);

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter the Student Full Name.');
      return;
    }

    const cleanRegNo = regNo.trim().toUpperCase();
    if (!cleanRegNo) {
      setErrorMessage('Please enter a valid Registration Number.');
      return;
    }

    // Uniqueness check for new student
    if (isNew) {
      const exists = students.some((s) => s.regNo.toUpperCase() === cleanRegNo);
      if (exists) {
        setErrorMessage(`Registration Number "${cleanRegNo}" is already allocated to another student. Please enter a unique number.`);
        return;
      }
    }

    // Recalculate semester GPA based on all subject marks
    const allMarks: SubjectMarks[] = Object.values(marksMap);
    const avgScore = allMarks.reduce((acc: number, m: SubjectMarks) => acc + m.totalPercentage, 0) / (allMarks.length || 1);
    const calculatedSemGpa = Math.round((avgScore / 10) * 100) / 100;

    if (isNew) {
      // Build default subject attendance mapping
      const defaultSubjectAttendance: Record<string, SubjectAttendance> = {};
      SUBJECT_CATALOG.forEach((subj) => {
        defaultSubjectAttendance[subj.code] = {
          subjectCode: subj.code,
          subjectName: subj.name,
          facultyName: subj.facultyName,
          conducted: 18,
          attended: 17,
          od: 1,
          percentage: 100,
        };
      });

      // Default initial assignments
      const defaultAssignments: AssignmentItem[] = [
        {
          id: `asg-${cleanRegNo}-1`,
          title: 'Normalization & BCNF Case Study',
          subjectCode: 'CS501',
          subjectName: 'Database Management Systems',
          dueDate: '2026-08-15',
          status: 'Graded',
          score: 9.0,
          maxScore: 10,
          submittedOn: '2026-08-14',
        },
        {
          id: `asg-${cleanRegNo}-2`,
          title: 'Dynamic Programming - Traveling Salesperson',
          subjectCode: 'CS502',
          subjectName: 'Design & Analysis of Algorithms',
          dueDate: '2026-08-20',
          status: 'Graded',
          score: 8.5,
          maxScore: 10,
          submittedOn: '2026-08-19',
        },
        {
          id: `asg-${cleanRegNo}-3`,
          title: 'TCP Flow & Congestion Control Simulator',
          subjectCode: 'CS503',
          subjectName: 'Computer Networks',
          dueDate: '2026-08-28',
          status: 'Submitted',
          maxScore: 10,
        },
      ];

      const newStudentObj: Student = {
        id: `stu-${cleanRegNo}-${Date.now()}`,
        regNo: cleanRegNo,
        name: name.trim(),
        department: 'Computer Science and Engineering',
        year: Number(year),
        semester: Number(semester),
        section,
        email: email.trim() || `${cleanRegNo.toLowerCase()}@college.edu`,
        phone: phone.trim() || '+91 98400 00000',
        dob,
        bloodGroup,
        facultyAdvisor,
        mentor,
        parentName: parentName.trim() || 'Parent / Guardian',
        parentPhone: parentPhone.trim() || phone.trim(),
        address: address.trim() || 'Chennai, Tamil Nadu',
        cgpa: Number(cgpa),
        currentSemesterGpa: calculatedSemGpa,
        subjects: SUBJECT_CATALOG.map((s) => s.code),
        marks: marksMap,
        assignments: defaultAssignments,
        overallAttendance: {
          present: Number(presentDays),
          absent: Number(absentDays),
          od: Number(odDays),
          total: Number(totalClasses),
          percentage: calculatedAttdPercentage,
        },
        subjectAttendance: defaultSubjectAttendance,
        performanceRating,
        facultyRemarks: facultyRemarks.trim() || `New mentee admitted to Section ${section} under Class Advisor ${facultyAdvisor}.`,
        password: password.trim() || 'student123',
        mentorNotes: [
          {
            id: `note-init-${Date.now()}`,
            date: '2026-08-27',
            regNo: cleanRegNo,
            mentorName: facultyAdvisor,
            category: 'Academic Performance',
            discussionSummary: `Student formally enrolled into Section ${section} by Class Advisor ${facultyAdvisor}. Orientation and syllabus overview completed.`,
            actionPlan: 'Maintain >75% attendance and submit continuous assessment assignments on schedule.',
          },
        ],
      };

      addStudent(newStudentObj);
      setSuccessToast(true);

      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 1200);
    } else if (student) {
      const updatedData: Partial<Student> = {
        name: name.trim(),
        regNo: cleanRegNo,
        section,
        year: Number(year),
        semester: Number(semester),
        email: email.trim(),
        phone: phone.trim(),
        dob,
        bloodGroup,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        address: address.trim(),
        performanceRating,
        facultyRemarks: facultyRemarks.trim(),
        facultyAdvisor,
        mentor,
        cgpa: Number(cgpa),
        currentSemesterGpa: calculatedSemGpa,
        marks: marksMap,
        overallAttendance: {
          present: Number(presentDays),
          absent: Number(absentDays),
          od: Number(odDays),
          total: Number(totalClasses),
          percentage: calculatedAttdPercentage,
        },
        password: password.trim() || 'student123',
      };

      updateStudent(student.regNo, updatedData);
      if (onSave) {
        onSave(updatedData);
      }
      setSuccessToast(true);

      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 1200);
    }
  };

  if (!isOpen) return null;
  if (!isNew && !student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${isNew ? 'bg-rose-600' : 'bg-blue-700'} text-white flex items-center justify-center text-sm font-bold shadow-2xs`}>
              {isNew ? <UserPlus className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {isNew ? 'Class Advisor Desk: Onboard New Student' : 'Edit & Manage Student Record'}
                </h2>
                <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded border ${
                  isNew
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {isNew ? `Class Advisor: Sec ${defaultSection}` : student?.regNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Park College of Engineering and Technology • Dept of CSE • Class Advisor: <strong>{facultyAdvisor}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="mx-5 mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isNew
                ? `New Student ${name} (${regNo}) successfully enrolled in Section ${section} and added to Daily Attendance Ledger!`
                : `Student record for ${name} updated and saved successfully!`}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Class Advisor Authorization Banner */}
        {isNew && (
          <div className="mx-5 mt-3 px-3 py-2 bg-indigo-50/70 border border-indigo-200 rounded-lg flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
              <span className="font-medium">
                Authorized as Class Advisor (<strong>{defaultFacultyAdvisor}</strong>) for <strong>Section {defaultSection}</strong>.
              </span>
            </div>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
              Daily Attendance Ready
            </span>
          </div>
        )}

        {/* Tab Navigation inside Modal */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-5 gap-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('basic')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'basic'
                ? 'border-blue-700 text-blue-800 bg-white shadow-2xs rounded-t-md'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Profile & Personal Info
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('academic')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'academic'
                ? 'border-blue-700 text-blue-800 bg-white shadow-2xs rounded-t-md'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Performance & Remarks
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('marks')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'marks'
                ? 'border-blue-700 text-blue-800 bg-white shadow-2xs rounded-t-md'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Subject Marks ({SUBJECT_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('attendance')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'attendance'
                ? 'border-blue-700 text-blue-800 bg-white shadow-2xs rounded-t-md'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Attendance Ledger
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSaveStudent} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* TAB 1: BASIC & PERSONAL INFO */}
          {activeSubTab === 'basic' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S. Harish Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Registration Number (Reg No) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2023CSE013"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white uppercase text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Section {isNew && `(Advised: ${defaultSection})`}
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value as 'A' | 'B')}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Year of Study
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    placeholder="e.g. O+, B+, A+"
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    placeholder="e.g. student@college.edu"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    placeholder="e.g. +91 98401 22334"
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Birth (DOB)
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>
              </div>

              {/* Portal Login Password Configuration */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-700" />
                    Student Login Password *
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                    Direct Student Login
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-emerald-600">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set student login password"
                    className="w-full pl-8 pr-8 py-2 text-xs font-mono font-bold bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-emerald-950"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-emerald-500 hover:text-emerald-800 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-emerald-800 font-medium">
                  Authentication Note: Whatever Name (e.g. <strong>{name || 'Student Name'}</strong>) or Registration Number (e.g. <strong>{regNo || 'RegNo'}</strong>) is saved here, entering that exact Name/RegNo and this password will immediately log in to the Student portal.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block mb-2">
                  Parent / Guardian Details:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. S. Ramanathan"
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Parent Contact Phone
                    </label>
                    <input
                      type="text"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="e.g. +91 94441 23456"
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="mt-2.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 14/2, West Mada Street, Anna Nagar, Chennai"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC PERFORMANCE & REMARKS */}
          {activeSubTab === 'academic' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Performance Standing
                  </label>
                  <select
                    value={performanceRating}
                    onChange={(e) => setPerformanceRating(e.target.value as any)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  >
                    <option value="Outstanding">Outstanding (9.0+ CGPA)</option>
                    <option value="Good">Good (8.0 - 8.9 CGPA)</option>
                    <option value="Average">Average (6.5 - 7.9 CGPA)</option>
                    <option value="Needs Attention">Needs Attention (&lt; 6.5 CGPA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cumulative CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold text-indigo-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Semester GPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={currentSemesterGpa}
                    onChange={(e) => setCurrentSemesterGpa(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold text-teal-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Faculty Advisor (Class Advisor)
                  </label>
                  <input
                    type="text"
                    value={facultyAdvisor}
                    onChange={(e) => setFacultyAdvisor(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Class Mentor
                  </label>
                  <input
                    type="text"
                    value={mentor}
                    onChange={(e) => setMentor(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty Mentor Official Remarks & Observations
                </label>
                <textarea
                  rows={3}
                  value={facultyRemarks}
                  onChange={(e) => setFacultyRemarks(e.target.value)}
                  placeholder="Record academic progress, behavioral remarks, counseling updates, seminar participation..."
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: SUBJECT MARKS ENTRY */}
          {activeSubTab === 'marks' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 font-medium flex items-center justify-between">
                <span>
                  Anna University Evaluation Weights: <strong>Internal 1 (25%)</strong> + <strong>Internal 2 (25%)</strong> + <strong>Model Exam (40%)</strong> + <strong>Assignment (10%)</strong>
                </span>
                <span className="font-bold text-blue-800">Auto-Grade Enabled</span>
              </div>

              <div className="space-y-2">
                {SUBJECT_CATALOG.map((subj) => {
                  const m = marksMap[subj.code] || {
                    subjectCode: subj.code,
                    subjectName: subj.name,
                    internal1: 0,
                    internal2: 0,
                    modelExam: 0,
                    assignment: 0,
                    totalPercentage: 0,
                    grade: 'RA',
                  };

                  return (
                    <div
                      key={subj.code}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900">
                          <span className="font-mono text-blue-700 mr-1.5">{subj.code}</span>
                          <span>{subj.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-indigo-700">
                            Total: {m.totalPercentage}%
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-300 text-slate-800">
                            {m.grade}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                            Internal 1 (Max 50)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={m.internal1}
                            onChange={(e) =>
                              handleMarkChange(subj.code, 'internal1', parseFloat(e.target.value))
                            }
                            className="w-full font-bold text-center bg-white border border-slate-300 rounded px-1.5 py-1"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                            Internal 2 (Max 50)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={m.internal2}
                            onChange={(e) =>
                              handleMarkChange(subj.code, 'internal2', parseFloat(e.target.value))
                            }
                            className="w-full font-bold text-center bg-white border border-slate-300 rounded px-1.5 py-1"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                            Model Exam (Max 100)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={m.modelExam}
                            onChange={(e) =>
                              handleMarkChange(subj.code, 'modelExam', parseFloat(e.target.value))
                            }
                            className="w-full font-bold text-center bg-white border border-slate-300 rounded px-1.5 py-1"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                            Assignment (Max 10)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={m.assignment}
                            onChange={(e) =>
                              handleMarkChange(subj.code, 'assignment', parseFloat(e.target.value))
                            }
                            className="w-full font-bold text-center bg-white border border-slate-300 rounded px-1.5 py-1"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE LEDGER */}
          {activeSubTab === 'attendance' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Overall Attendance Ratio</span>
                  <div className="text-[11px] text-slate-500">
                    {presentDays + odDays} / {totalClasses} classes attended
                  </div>
                </div>
                <div
                  className={`text-lg font-bold px-3 py-1 rounded-lg border ${
                    calculatedAttdPercentage >= 75
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                  }`}
                >
                  {calculatedAttdPercentage}%
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    Present Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={presentDays}
                    onChange={(e) => setPresentDays(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1">
                    Absent Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={absentDays}
                    onChange={(e) => setAbsentDays(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white text-rose-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                    On-Duty (OD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={odDays}
                    onChange={(e) => setOdDays(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white text-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Conducted
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalClasses}
                    onChange={(e) => setTotalClasses(parseInt(e.target.value) || 1)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                Note: Updating the attendance counts will immediately update the student's eligibility status for Anna University end-semester examinations and daily roster.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 font-medium">
              {isNew ? 'New student will be enrolled and added to daily attendance instantly.' : 'Changes will take effect instantly across all portals.'}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="save-student-modal-btn"
                type="submit"
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                  isNew ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isNew ? 'Enrol & Save Student' : 'Save Student Record'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
