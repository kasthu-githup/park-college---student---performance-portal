import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';
import { UserRole } from '../../types';
import {
  UserCog,
  X,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Lock,
  Briefcase,
  BookOpen,
  Award,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    updateStudentProfile,
    updateFacultyProfile,
    updateHODProfile,
    updateAdminProfile,
  } = usePortal();

  // Form states initialized unconditionally
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [password, setPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const user = currentUser.data;
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setPassword(user.password || '');

    if ('address' in user && user.address) {
      setAddress(user.address);
    } else {
      setAddress('');
    }

    if ('specialization' in user && user.specialization) {
      setSpecialization(user.specialization);
    } else {
      setSpecialization('');
    }

    setSaveSuccess(false);
  }, [currentUser, isOpen]);

  // Early return placed AFTER all hooks
  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    switch (currentUser.role) {
      case 'student':
        updateStudentProfile(currentUser.data.regNo, {
          email,
          phone,
          address,
          ...(password ? { password } : {}),
        });
        break;
      case 'faculty':
        updateFacultyProfile(currentUser.data.id, {
          name,
          email,
          phone,
          specialization,
          ...(password ? { password } : {}),
        });
        break;
      case 'hod':
        updateHODProfile({
          name,
          email,
          phone,
          specialization,
          ...(password ? { password } : {}),
        });
        break;
      case 'admin':
        updateAdminProfile({
          name,
          email,
          phone,
          ...(password ? { password } : {}),
        });
        break;
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Edit User Profile</h3>
              <p className="text-xs text-slate-400 capitalize">
                Role: {currentUser.role} • {currentUser.data.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Profile updated successfully!</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={currentUser.role === 'student'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-slate-100 disabled:text-slate-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {currentUser.role === 'student' && (
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Residential Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          )}

          {(currentUser.role === 'faculty' || currentUser.role === 'hod') && (
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Specialization / Research Areas
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Distributed Databases, Machine Learning"
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Portal Access Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password to update"
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
