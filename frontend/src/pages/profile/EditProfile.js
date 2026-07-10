import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCircleIcon, PhoneIcon, AcademicCapIcon, BuildingOfficeIcon,
  LockClosedIcon, CheckCircleIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon,
  PencilSquareIcon, ShieldCheckIcon, CameraIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { DEPARTMENTS, getInitials } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const roleGradient = {
  admin:   'from-rose-500 to-pink-600',
  faculty: 'from-blue-500 to-indigo-600',
  student: 'from-emerald-500 to-teal-600',
};

/* ── Reusable Input ── */
const Field = ({ label, id, error, icon: Icon, rightEl, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <input
        id={id}
        className={`w-full rounded-xl border text-sm py-2.5 pr-10 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${Icon ? 'pl-10' : 'pl-3.5'}
          ${error
            ? 'border-red-300 bg-red-50 focus:ring-red-400'
            : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        {...props}
      />
      {rightEl && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {rightEl}
        </div>
      )}
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
        {error}
      </p>
    )}
  </div>
);

/* ── Reusable Select ── */
const SelectField = ({ label, id, options, icon: Icon, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <select
        id={id}
        className={`w-full rounded-xl border border-gray-200 bg-white text-sm py-2.5 pr-8 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          hover:border-gray-300 appearance-none cursor-pointer ${Icon ? 'pl-10' : 'pl-3.5'}`}
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

/* ── Section header ── */
const SectionHeader = ({ icon: Icon, title, subtitle, color = 'bg-indigo-50 text-indigo-600' }) => (
  <div className="flex items-center gap-3 pb-4 mb-1">
    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

/* ── Password strength indicator ── */
const PasswordStrength = ({ password }) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-yellow-600' : score === 3 ? 'text-blue-600' : 'text-green-600'}`}>
        {labels[score]}
      </p>
    </div>
  );
};

/* ── Sticky Save Bar — always visible at the bottom ── */
const SaveBar = ({ saving, onCancel, label = 'Save Changes' }) => (
  <div className="sticky bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg px-4 py-3 flex items-center justify-between gap-3 rounded-b-2xl">
    <p className="text-xs text-gray-500 hidden sm:block">Unsaved changes will be lost if you leave</p>
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Saving...
          </>
        ) : (
          <>
            <CheckCircleIcon className="w-4 h-4" />
            {label}
          </>
        )}
      </button>
    </div>
  </div>
);

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors]               = useState({});
  const [activeTab, setActiveTab]         = useState('profile');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const [form, setForm] = useState({
    name: '', phone: '', bio: '', department: '',
    year: '', semester: '', section: '', designation: '',
  });

  const [pwForm, setPwForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [changingPw, setChangingPw] = useState(false);
  const [pwSuccess, setPwSuccess]   = useState(false);

  useEffect(() => {
    api.get('/users/profile/me').then(res => {
      const p = res.data.user || res.data;
      setForm({
        name:        p.name        || '',
        phone:       p.phone       || '',
        bio:         p.bio         || '',
        department:  p.department  || '',
        year:        p.year        ? String(p.year) : '',
        semester:    p.semester    ? String(p.semester) : '',
        section:     p.section     || '',
        designation: p.designation || '',
      });
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    // Upload
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await api.post('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ avatar: res.data.url });
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                e.name  = 'Name is required';
    else if (form.name.trim().length < 2) e.name  = 'At least 2 characters';
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit number';
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
      const res = await api.put('/users/profile', payload);
      updateUser(res.data.user || res.data);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const validatePw = () => {
    const e = {};
    if (!pwForm.currentPassword)                            e.currentPassword = 'Current password required';
    if (!pwForm.newPassword)                                e.newPassword = 'New password required';
    else if (pwForm.newPassword.length < 8)                 e.newPassword = 'Minimum 8 characters';
    if (!pwForm.confirmPassword)                            e.confirmPassword = 'Please confirm password';
    else if (pwForm.newPassword !== pwForm.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setChangingPw(true);
    try {
      await api.put('/users/profile/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess(true);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
      toast.success('Password changed successfully!');
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const toggleShow = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

  if (loading) return <LoadingSpinner fullPage />;

  const grad = roleGradient[user?.role] || roleGradient.student;
  const tabs = [
    { id: 'profile',  label: 'Edit Profile',    icon: PencilSquareIcon },
    { id: 'password', label: 'Change Password', icon: ShieldCheckIcon },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

      {/* ── Top header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors group"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-500 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-xs text-gray-500">Manage your profile and security</p>
        </div>
      </div>

      {/* ── Avatar card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={`h-16 bg-gradient-to-r ${grad} relative overflow-hidden`}>
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
        </div>
        <div className="px-5 pb-5 -mt-8 flex items-end gap-4">
          <div className="relative flex-shrink-0">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${grad} shadow-md border-4 border-white flex items-center justify-center overflow-hidden`}>
              {avatarPreview || user?.avatar ? (
                <img src={avatarPreview || `http://localhost:5000${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-extrabold text-white">{getInitials(form.name || user?.name)}</span>
              )}
            </div>
            {/* Camera button overlay */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-60"
              title="Change photo"
            >
              {avatarUploading
                ? <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                : <CameraIcon className="w-3 h-3" />
              }
            </button>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="pb-1">
            <p className="font-bold text-gray-900">{form.name || user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role} · {user?.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">Click the camera icon to update your photo</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${activeTab === id
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Edit Profile Tab ── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 space-y-5">

            <SectionHeader
              icon={UserCircleIcon}
              title="Personal Information"
              subtitle="Update your basic details"
              color="bg-indigo-50 text-indigo-600"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Full Name *"
                id="name" name="name" type="text"
                value={form.name} onChange={handleChange}
                error={errors.name} icon={UserCircleIcon}
                placeholder="Your full name"
              />
              <Field
                label="Phone Number"
                id="phone" name="phone" type="tel"
                value={form.phone} onChange={handleChange}
                error={errors.phone} icon={PhoneIcon}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Bio / About
              </label>
              <textarea
                id="bio" name="bio" rows={3}
                value={form.bio} onChange={handleChange}
                placeholder="Write something about yourself..."
                className="w-full rounded-xl border border-gray-200 bg-white text-sm px-3.5 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 resize-none"
                maxLength={500}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">Optional short introduction</span>
                <span className={`text-xs font-medium ${form.bio.length > 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {form.bio.length}/500
                </span>
              </div>
            </div>

            {/* Academic section */}
            <div className="border-t border-gray-100 pt-5">
              <SectionHeader
                icon={AcademicCapIcon}
                title="Academic Information"
                subtitle="Your department and study details"
                color="bg-purple-50 text-purple-600"
              />
            </div>

            <SelectField
              label="Department"
              id="department" name="department"
              value={form.department} onChange={handleChange}
              icon={BuildingOfficeIcon}
              options={DEPARTMENTS}
            />

            {/* Student-specific fields */}
            {user?.role === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField
                  label="Year" id="year" name="year"
                  value={form.year} onChange={handleChange}
                  icon={AcademicCapIcon}
                  options={[
                    { value: '1', label: 'Year 1' },
                    { value: '2', label: 'Year 2' },
                    { value: '3', label: 'Year 3' },
                    { value: '4', label: 'Year 4' },
                  ]}
                />
                <SelectField
                  label="Semester" id="semester" name="semester"
                  value={form.semester} onChange={handleChange}
                  icon={AcademicCapIcon}
                  options={[1,2,3,4,5,6,7,8].map(s => ({ value: String(s), label: `Sem ${s}` }))}
                />
                <Field
                  label="Section" id="section" name="section" type="text"
                  value={form.section} onChange={handleChange}
                  placeholder="e.g. A / B / CE3"
                  maxLength={10}
                />
              </div>
            )}

            {/* Faculty-specific fields */}
            {user?.role === 'faculty' && (
              <Field
                label="Designation" id="designation" name="designation" type="text"
                value={form.designation} onChange={handleChange}
                placeholder="e.g. Assistant Professor"
                icon={AcademicCapIcon}
              />
            )}

            {/* Admin sees department only — already rendered above */}

          </div>

          {/* ── STICKY SAVE BAR — always visible ── */}
          <SaveBar saving={saving} onCancel={() => navigate('/profile')} label="Save Changes" />
        </form>
      )}

      {/* ── Change Password Tab ── */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 space-y-5">

            <SectionHeader
              icon={ShieldCheckIcon}
              title="Change Password"
              subtitle="Keep your account secure"
              color="bg-rose-50 text-rose-600"
            />

            {pwSuccess && (
              <div className="flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                Password changed successfully!
              </div>
            )}

            <Field
              label="Current Password"
              id="currentPassword" name="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={pwForm.currentPassword}
              onChange={(e) => { setPwForm(p => ({ ...p, currentPassword: e.target.value })); setPwErrors(p => ({ ...p, currentPassword: '' })); }}
              error={pwErrors.currentPassword}
              icon={LockClosedIcon}
              placeholder="Enter your current password"
              rightEl={
                <button type="button" onClick={() => toggleShow('current')} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showPasswords.current ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Field
                  label="New Password"
                  id="newPassword" name="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={pwForm.newPassword}
                  onChange={(e) => { setPwForm(p => ({ ...p, newPassword: e.target.value })); setPwErrors(p => ({ ...p, newPassword: '' })); }}
                  error={pwErrors.newPassword}
                  icon={LockClosedIcon}
                  placeholder="Min. 8 characters"
                  rightEl={
                    <button type="button" onClick={() => toggleShow('new')} className="text-gray-400 hover:text-gray-600 transition-colors">
                      {showPasswords.new ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  }
                />
                <PasswordStrength password={pwForm.newPassword} />
              </div>
              <Field
                label="Confirm New Password"
                id="confirmPassword" name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={pwForm.confirmPassword}
                onChange={(e) => { setPwForm(p => ({ ...p, confirmPassword: e.target.value })); setPwErrors(p => ({ ...p, confirmPassword: '' })); }}
                error={pwErrors.confirmPassword}
                icon={LockClosedIcon}
                placeholder="Re-enter new password"
                rightEl={
                  <button type="button" onClick={() => toggleShow('confirm')} className="text-gray-400 hover:text-gray-600 transition-colors">
                    {showPasswords.confirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            {/* Tips */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Password tips:</p>
              <ul className="space-y-1">
                {['At least 8 characters', 'Include uppercase letters', 'Include numbers', 'Include special characters'].map((tip, i) => (
                  <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* ── STICKY UPDATE PASSWORD BAR ── */}
          <SaveBar saving={changingPw} onCancel={() => { setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPwErrors({}); }} label="Update Password" />
        </form>
      )}

    </div>
  );
}
