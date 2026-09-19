import React, { useState, useEffect } from 'react';
import { HOD, Department } from '../../types';
import { usePortal } from '../../context/PortalContext';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  GraduationCap,
  Sparkles,
  Clock,
  MessageSquare,
  Lock,
  Save,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface EditHODModalProps {
  hod: HOD | null;
  isOpen?: boolean;
  onClose: () => void;
  onSave?: (updatedData: Partial<HOD>) => void;
}

export const EditHODModal: React.FC<EditHODModalProps> = ({
  hod,
  isOpen = true,
  onClose,
  onSave,
}) => {
  const { updateHOD, departments } = usePortal();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cabin, setCabin] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('hod123');
  const [accountStatus, setAccountStatus] = useState<'Active' | 'Inactive'>('Active');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (hod) {
      setName(hod.name || '');
      setDepartment(hod.department || '');
      setEmail(hod.email || '');
      setPhone(hod.phone || '');
      setCabin(hod.cabin || '');
      setQualification(hod.qualification || '');
      setSpecialization(hod.specialization || '');
      setOfficeHours(hod.officeHours || 'Mon - Fri, 09:30 AM - 04:30 PM');
      setMessage(hod.message || '');
      setPassword(hod.password || 'hod123');
      setAccountStatus(hod.accountStatus || 'Active');
      setSavedSuccess(false);
    }
  }, [hod]);

  if (!isOpen || !hod) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedData: Partial<HOD> = {
      name: name.trim(),
      department: department.trim(),
      email: email.trim(),
      phone: phone.trim(),
      cabin: cabin.trim(),
      qualification: qualification.trim(),
      specialization: specialization.trim(),
      officeHours: officeHours.trim(),
      message: message.trim(),
      password: password.trim() || 'hod123',
      accountStatus,
    };

    updateHOD(hod.id, updatedData);
    if (onSave) onSave(updatedData);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Edit HOD Details</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800">
                  {hod.id}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Update leadership profile, contact credentials, and department assignment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              HOD profile and credentials for {name} updated successfully!
            </span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Section 1: Core Identity */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <User className="w-3.5 h-3.5 text-purple-600" />
              <span>Identity & Department</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name (with Honorific) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. K. Shanmugam"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Department Assigned *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium text-slate-800 cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                  {/* If department is custom, keep it as option */}
                  {!departments.some((d) => d.name === department) && department && (
                    <option value={department}>{department}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account Status
                </label>
                <select
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium text-slate-800 cursor-pointer"
                >
                  <option value="Active">Active (Full Portal Access)</option>
                  <option value="Inactive">Inactive (Suspended)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Login Access Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter HOD login password"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono font-bold text-purple-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Office Location */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span>Contact & Cabin Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hod.mech@college.edu"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone / Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98400 55444"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  HOD Cabin / Office Room Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value)}
                    placeholder="Mechanical Block Ground Floor, Room 105"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Academic Qualifications & Profile */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>Academic Credentials & Hours</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Highest Degree & Qualifications
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="Ph.D, M.E (Thermal Engg)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Research Specialization
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Thermodynamics, Robotics, CAD/CAM"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Student & Faculty Consultation Hours
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={officeHours}
                    onChange={(e) => setOfficeHours(e.target.value)}
                    placeholder="Mon - Fri, 09:30 AM - 04:30 PM"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Department Welcome Message
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Welcome to Mechanical Engineering. Pioneering sustainable energy..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg font-bold text-white bg-purple-700 hover:bg-purple-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save HOD Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
