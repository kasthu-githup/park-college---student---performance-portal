import React, { useState, useEffect } from 'react';
import { Faculty, AssignedClass } from '../../types';
import { usePortal } from '../../context/PortalContext';
import { SUBJECT_CATALOG } from '../../data/initialData';
import {
  X,
  User,
  Save,
  CheckCircle2,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  ShieldCheck,
  Award,
  FileText,
  Sparkles,
  Globe,
  Calendar,
  Layers,
  Lock,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react';

interface EditFacultyModalProps {
  faculty: Faculty | null;
  isOpen?: boolean;
  onClose: () => void;
  onSave?: (data: Partial<Faculty>) => void;
  isNew?: boolean;
}

export const EditFacultyModal: React.FC<EditFacultyModalProps> = ({
  faculty,
  isOpen = true,
  onClose,
  onSave,
  isNew = false,
}) => {
  const { updateFaculty, addFaculty } = usePortal();

  // Basic Details State
  const [name, setName] = useState(faculty?.name || '');
  const [id, setId] = useState(faculty?.id || `FAC00${Math.floor(Math.random() * 90) + 10}`);
  const [designation, setDesignation] = useState(
    faculty?.designation || 'Assistant Professor & Class Mentor'
  );
  const [department, setDepartment] = useState(
    faculty?.department || 'Computer Science and Engineering'
  );
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(
    faculty?.gender || 'Male'
  );
  const [doj, setDoj] = useState(faculty?.doj || '2018-06-15');
  const [email, setEmail] = useState(faculty?.email || '');
  const [phone, setPhone] = useState(faculty?.phone || '');
  const [cabin, setCabin] = useState(faculty?.cabin || 'Tech Block - Room 305');
  const [officeHours, setOfficeHours] = useState(
    faculty?.officeHours || 'Mon - Fri, 03:30 PM - 04:30 PM'
  );
  const [address, setAddress] = useState(
    faculty?.address || 'Staff Quarters, Park College Campus, Coimbatore'
  );
  const [emergencyContact, setEmergencyContact] = useState(
    faculty?.emergencyContact || '+91 94440 12345'
  );
  const [linkedin, setLinkedin] = useState(faculty?.linkedin || '');
  const [password, setPassword] = useState(faculty?.password || 'staff123');
  const [showPassword, setShowPassword] = useState(false);

  // Academic & Qualifications State
  const [qualification, setQualification] = useState(
    faculty?.qualification || 'Ph.D (Anna University), M.E (CSE), B.E (CSE)'
  );
  const [experienceYears, setExperienceYears] = useState(faculty?.experienceYears || 10);
  const [ugDegree, setUgDegree] = useState(
    faculty?.ugDegree || 'B.E (Computer Science & Engineering) - Anna University'
  );
  const [pgDegree, setPgDegree] = useState(
    faculty?.pgDegree || 'M.E (Computer Science & Engineering) - Anna University'
  );
  const [phdDegree, setPhdDegree] = useState(
    faculty?.phdDegree || 'Ph.D (Distributed Computing) - Anna University'
  );
  const [specialization, setSpecialization] = useState(
    faculty?.specialization || 'Distributed Systems, Machine Learning, Cloud Computing'
  );
  const [areasOfInterest, setAreasOfInterest] = useState(
    faculty?.areasOfInterest || 'Cloud Infrastructure, Database Query Processing, Artificial Intelligence'
  );

  // Research & Achievements State
  const [publicationsCount, setPublicationsCount] = useState(faculty?.publicationsCount || 12);
  const [patentsCount, setPatentsCount] = useState(faculty?.patentsCount || 1);
  const [conferencesCount, setConferencesCount] = useState(faculty?.conferencesCount || 8);
  const [awards, setAwards] = useState(
    faculty?.awards || 'Best Faculty Award (2023), Senior IEEE Member'
  );
  const [bio, setBio] = useState(
    faculty?.bio || 'Dedicated academician committed to excellence in student mentorship, autonomous curriculum, and research.'
  );

  // Mentorship & Workload State
  const [assignedMenteeSection, setAssignedMenteeSection] = useState<'A' | 'B'>(
    faculty?.assignedMenteeSection || 'A'
  );
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>(
    faculty?.assignedClasses || [
      {
        subjectCode: 'CS501',
        subjectName: 'Database Management Systems',
        year: 3,
        semester: 5,
        section: 'A',
        totalStudents: 6,
      },
    ]
  );

  const [activeTab, setActiveTab] = useState<'personal' | 'qualifications' | 'research' | 'workload'>('personal');
  const [successToast, setSuccessToast] = useState(false);

  // Workload class helper
  const handleAddClass = () => {
    setAssignedClasses((prev) => [
      ...prev,
      {
        subjectCode: 'CS502',
        subjectName: 'Design & Analysis of Algorithms',
        year: 3,
        semester: 5,
        section: 'A',
        totalStudents: 6,
      },
    ]);
  };

  const handleRemoveClass = (index: number) => {
    setAssignedClasses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClassChange = (
    index: number,
    field: keyof AssignedClass,
    value: string | number
  ) => {
    setAssignedClasses((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        if (field === 'subjectCode') {
          const matched = SUBJECT_CATALOG.find((s) => s.code === value);
          return {
            ...c,
            subjectCode: String(value),
            subjectName: matched ? matched.name : c.subjectName,
          };
        }
        return {
          ...c,
          [field]: value,
        };
      })
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    if (isNew) {
      setName('');
      setId(`FAC00${Math.floor(Math.random() * 90) + 10}`);
      setDesignation('Assistant Professor & Class Mentor');
      setDepartment('Computer Science and Engineering');
      setGender('Male');
      setDoj('2024-06-15');
      setEmail('');
      setPhone('');
      setCabin('Tech Block - Room 305');
      setOfficeHours('Mon - Fri, 03:30 PM - 04:30 PM');
      setAddress('Staff Quarters, Park College Campus, Coimbatore');
      setEmergencyContact('+91 94440 12345');
      setLinkedin('');
      setPassword('staff123');
      setQualification('Ph.D (Anna University), M.E (CSE), B.E (CSE)');
      setExperienceYears(10);
      setUgDegree('B.E (Computer Science & Engineering) - Anna University');
      setPgDegree('M.E (Computer Science & Engineering) - Anna University');
      setPhdDegree('Ph.D (Distributed Computing) - Anna University');
      setSpecialization('Distributed Systems, Machine Learning, Cloud Computing');
      setAreasOfInterest('Cloud Infrastructure, Database Query Processing, Artificial Intelligence');
      setPublicationsCount(12);
      setPatentsCount(1);
      setConferencesCount(8);
      setAwards('Best Faculty Award (2023), Senior IEEE Member');
      setBio('Dedicated academician committed to excellence in student mentorship, autonomous curriculum, and research.');
      setAssignedMenteeSection('A');
      setAssignedClasses([
        {
          subjectCode: 'CS501',
          subjectName: 'Database Management Systems',
          year: 3,
          semester: 5,
          section: 'A',
          totalStudents: 6,
        },
      ]);
      setActiveTab('personal');
    } else if (faculty) {
      setName(faculty.name);
      setId(faculty.id);
      setDesignation(faculty.designation);
      setDepartment(faculty.department);
      setGender(faculty.gender);
      setDoj(faculty.doj || '2018-06-15');
      setEmail(faculty.email);
      setPhone(faculty.phone);
      setCabin(faculty.cabin);
      setOfficeHours(faculty.officeHours);
      setAddress(faculty.address);
      setEmergencyContact(faculty.emergencyContact);
      setLinkedin(faculty.linkedin || '');
      setPassword(faculty.password || 'staff123');
      setQualification(faculty.qualification);
      setExperienceYears(faculty.experienceYears);
      setUgDegree(faculty.ugDegree || '');
      setPgDegree(faculty.pgDegree || '');
      setPhdDegree(faculty.phdDegree || '');
      setSpecialization(faculty.specialization);
      setAreasOfInterest(faculty.areasOfInterest);
      setPublicationsCount(faculty.publicationsCount);
      setPatentsCount(faculty.patentsCount);
      setConferencesCount(faculty.conferencesCount);
      setAwards(faculty.awards);
      setBio(faculty.bio);
      setAssignedMenteeSection(faculty.assignedMenteeSection);
      setAssignedClasses(faculty.assignedClasses || []);
      setActiveTab('personal');
    }
  }, [isOpen, isNew, faculty]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const facultyData: Faculty = {
      id: id.trim().toUpperCase(),
      name: name.trim(),
      designation: designation.trim(),
      department: department.trim(),
      gender,
      doj,
      email: email.trim(),
      phone: phone.trim(),
      cabin: cabin.trim(),
      officeHours: officeHours.trim(),
      address: address.trim(),
      emergencyContact: emergencyContact.trim(),
      linkedin: linkedin.trim(),
      qualification: qualification.trim(),
      experienceYears: Number(experienceYears),
      ugDegree: ugDegree.trim(),
      pgDegree: pgDegree.trim(),
      phdDegree: phdDegree.trim(),
      specialization: specialization.trim(),
      areasOfInterest: areasOfInterest.trim(),
      publicationsCount: Number(publicationsCount),
      patentsCount: Number(patentsCount),
      conferencesCount: Number(conferencesCount),
      awards: awards.trim(),
      bio: bio.trim(),
      assignedMenteeSection,
      assignedClasses,
      password: password.trim() || 'staff123',
    };

    if (isNew) {
      addFaculty(facultyData);
    } else if (faculty) {
      updateFaculty(faculty.id, facultyData);
    }

    if (onSave) {
      onSave(facultyData);
    }

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;
  if (!isNew && !faculty) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-purple-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center text-base font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {isNew ? 'Enter & Onboard New Faculty Member' : `Edit Faculty Profile: ${name || faculty?.name}`}
                </h2>
                {id && (
                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                    {id}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Park College of Engineering and Technology • Department of Computer Science & Engineering
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
          <div className="mx-6 mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Faculty details for <strong>{name}</strong> have been successfully updated and saved!
            </span>
          </div>
        )}

        {/* Navigation Subtabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 gap-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'personal'
                ? 'border-purple-700 text-purple-800 bg-white shadow-2xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Personal & Contact Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qualifications')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'qualifications'
                ? 'border-purple-700 text-purple-800 bg-white shadow-2xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Degrees & Qualifications
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
            3. Research, Publications & Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workload')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'workload'
                ? 'border-purple-700 text-purple-800 bg-white shadow-2xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Courses & Workload ({assignedClasses.length})
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* TAB 1: PERSONAL & CONTACT */}
          {activeTab === 'personal' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Faculty Full Name (with Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. R. Sharma or Prof. S. Priya"
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Faculty ID (Unique Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={id}
                    onChange={(e) => setId(e.target.value.toUpperCase())}
                    placeholder="e.g. FAC001"
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Professor, Associate Professor, Assistant Professor"
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Joining (DOJ)
                  </label>
                  <input
                    type="date"
                    value={doj}
                    onChange={(e) => setDoj(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official College Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="faculty.name@college.edu"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98401 23456"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>
              </div>

              {/* Portal Login Password Configuration */}
              <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-700" />
                    Portal Login Password *
                  </label>
                  <span className="text-[10px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded">
                    Direct Staff Login
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-purple-600">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter login password for staff member"
                    className="w-full pl-8 pr-8 py-2 text-xs font-mono font-bold bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-purple-950"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-purple-500 hover:text-purple-800 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-purple-800 font-medium">
                  Authentication Note: Whatever Name or Staff ID is saved above, entering that Name/ID and this exact password will immediately log in to the Staff portal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cabin & Room Location
                  </label>
                  <input
                    type="text"
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value)}
                    placeholder="e.g. Tech Block - Room 302"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Office / Counseling Hours
                  </label>
                  <input
                    type="text"
                    value={officeHours}
                    onChange={(e) => setOfficeHours(e.target.value)}
                    placeholder="e.g. Mon - Fri, 03:30 PM - 04:45 PM"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Emergency Contact Number
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+91 94441 88776 (Spouse)"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    LinkedIn / Academic Profile URL
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/dr-faculty"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Plot No 42, Staff Quarters, Park College Campus, Coimbatore"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* TAB 2: DEGREES & QUALIFICATIONS */}
          {activeTab === 'qualifications' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Teaching & Industry Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-bold text-purple-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Qualification Summary
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="Ph.D (IIT Madras), M.E (Anna University)"
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-800 uppercase tracking-wider mb-1">
                  Doctoral Degree (Ph.D) Details
                </label>
                <input
                  type="text"
                  value={phdDegree}
                  onChange={(e) => setPhdDegree(e.target.value)}
                  placeholder="Ph.D (Distributed Database Query Optimization) - IIT Madras (2012)"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-1">
                  Postgraduate (PG / Master's) Degree Details
                </label>
                <input
                  type="text"
                  value={pgDegree}
                  onChange={(e) => setPgDegree(e.target.value)}
                  placeholder="M.E (Software Engineering) - College of Engineering Guindy (2006)"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-1">
                  Undergraduate (UG / Bachelor's) Degree Details
                </label>
                <input
                  type="text"
                  value={ugDegree}
                  onChange={(e) => setUgDegree(e.target.value)}
                  placeholder="B.E (Computer Science & Engineering) - Anna University (2004)"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Subject Specializations
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Database Systems, Distributed Computing, High-Performance Query Engines"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Research Areas of Interest
                </label>
                <input
                  type="text"
                  value={areasOfInterest}
                  onChange={(e) => setAreasOfInterest(e.target.value)}
                  placeholder="Database Management Systems, Big Data Analytics, Cloud Query Processing"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: RESEARCH & PUBLICATIONS */}
          {activeTab === 'research' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Journal Publications (SCI/Scopus)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={publicationsCount}
                    onChange={(e) => setPublicationsCount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-bold text-purple-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Patents Filed / Granted
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={patentsCount}
                    onChange={(e) => setPatentsCount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-bold text-indigo-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Conference Proceedings
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={conferencesCount}
                    onChange={(e) => setConferencesCount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-bold text-blue-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Awards, Honors & Memberships (IEEE, CSI, ACM)
                </label>
                <textarea
                  rows={2}
                  value={awards}
                  onChange={(e) => setAwards(e.target.value)}
                  placeholder="e.g. Best Faculty Award (2022, 2024), Outstanding Researcher Citation by CSI, Senior IEEE Member"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty Bio / Profile Statement
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief summary of teaching philosophy, research achievements, student mentoring, and industry collaborations..."
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* TAB 4: COURSES & WORKLOAD */}
          {activeTab === 'workload' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                  Assigned Class Mentorship Responsibility *
                </label>
                <select
                  value={assignedMenteeSection}
                  onChange={(e) => setAssignedMenteeSection(e.target.value as 'A' | 'B')}
                  className="w-full text-xs font-bold bg-purple-50 border border-purple-300 rounded-lg px-2.5 py-2 text-purple-950 focus:bg-white"
                >
                  <option value="A">Official Class Mentor - Section A (3rd Year CSE)</option>
                  <option value="B">Official Class Mentor - Section B (3rd Year CSE)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Assigned Courses & Batches ({assignedClasses.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddClass}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Another Course</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {assignedClasses.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 relative"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                            Subject Code
                          </label>
                          <select
                            value={item.subjectCode}
                            onChange={(e) => handleClassChange(idx, 'subjectCode', e.target.value)}
                            className="w-full font-mono text-xs font-bold bg-white border border-slate-300 rounded px-2 py-1"
                          >
                            {SUBJECT_CATALOG.map((s) => (
                              <option key={s.code} value={s.code}>
                                {s.code} - {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                            Course Title
                          </label>
                          <input
                            type="text"
                            value={item.subjectName}
                            onChange={(e) => handleClassChange(idx, 'subjectName', e.target.value)}
                            className="w-full text-xs font-medium bg-white border border-slate-300 rounded px-2 py-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                            Year
                          </label>
                          <select
                            value={item.year}
                            onChange={(e) => handleClassChange(idx, 'year', Number(e.target.value))}
                            className="w-full font-semibold bg-white border border-slate-300 rounded px-2 py-1"
                          >
                            <option value={1}>1st Yr</option>
                            <option value={2}>2nd Yr</option>
                            <option value={3}>3rd Yr</option>
                            <option value={4}>4th Yr</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                            Semester
                          </label>
                          <select
                            value={item.semester}
                            onChange={(e) => handleClassChange(idx, 'semester', Number(e.target.value))}
                            className="w-full font-semibold bg-white border border-slate-300 rounded px-2 py-1"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                              <option key={s} value={s}>
                                Sem {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                            Section
                          </label>
                          <select
                            value={item.section}
                            onChange={(e) => handleClassChange(idx, 'section', e.target.value)}
                            className="w-full font-bold bg-white border border-slate-300 rounded px-2 py-1"
                          >
                            <option value="A">Sec A</option>
                            <option value="B">Sec B</option>
                          </select>
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                              Students
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.totalStudents}
                              onChange={(e) =>
                                handleClassChange(idx, 'totalStudents', parseInt(e.target.value) || 1)
                              }
                              className="w-16 font-bold text-center bg-white border border-slate-300 rounded px-1.5 py-1"
                            />
                          </div>

                          {assignedClasses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveClass(idx)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition-colors"
                              title="Remove Course Assignment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 font-medium">
              Changes will update live across student dashboards & HOD logs.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                id="save-faculty-modal-btn"
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isNew ? 'Save & Onboard Faculty' : 'Save Faculty Details'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
