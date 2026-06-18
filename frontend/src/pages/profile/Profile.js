import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  UserCircleIcon, EnvelopeIcon, PhoneIcon, AcademicCapIcon,
  BuildingOfficeIcon, IdentificationIcon, CalendarIcon,
  PencilSquareIcon, ArrowLeftIcon, ShieldCheckIcon,
  TrophyIcon, ArrowRightIcon, SparklesIcon, ChartBarIcon,
  LinkIcon, CodeBracketIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { formatDate, getInitials } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const roleConfig = {
  admin:   { gradient: 'from-rose-500 to-pink-600',     badge: 'bg-rose-100 text-rose-700 border-rose-200',      ring: 'ring-rose-200',    accent: 'text-rose-600',  accentBg: 'bg-rose-50',  label: 'System Administrator' },
  faculty: { gradient: 'from-cyan-500 to-blue-600',     badge: 'bg-cyan-100 text-cyan-700 border-cyan-200',       ring: 'ring-cyan-200',    accent: 'text-cyan-600',  accentBg: 'bg-cyan-50',  label: 'Faculty Member' },
  student: { gradient: 'from-emerald-500 to-teal-600',  badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', ring: 'ring-emerald-200', accent: 'text-emerald-600', accentBg: 'bg-emerald-50', label: 'Student' },
};

const InfoRow = ({ icon: Icon, label, value, accentBg = 'bg-indigo-50', accentText = 'text-indigo-600' }) => (
  value ? (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 group hover:bg-gray-50/70 rounded-xl px-2 -mx-2 transition-colors duration-150">
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${accentBg} flex items-center justify-center mt-0.5`}>
        <Icon className={`w-4 h-4 ${accentText}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-800 break-words">{value}</p>
      </div>
    </div>
  ) : null
);

const StatCard = ({ label, value, color, icon, delay = 0 }) => (
  <div
    className={`rounded-2xl p-4 ${color} hover-lift cursor-default`}
    style={{ animation: `slideUpFade 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }}
  >
    <div className="text-2xl mb-1.5">{icon}</div>
    <p className="text-2xl font-extrabold">{value ?? '—'}</p>
    <p className="text-xs font-semibold mt-0.5 opacity-70">{label}</p>
  </div>
);

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !id || id === currentUser?._id;
  const rc = roleConfig[profile?.role] || roleConfig.student;

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const endpoint = id ? `/users/${id}` : '/users/profile/me';
        const res = await api.get(endpoint);
        setProfile(res.data.user || res.data);
        if (isOwnProfile) {
          try { const s = await api.get('/dashboard/stats'); setStats(s.data); } catch {}
        }
      } catch {
        toast.error('Failed to load profile');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, isOwnProfile, navigate]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 page-enter">

      {id && (
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors group">
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      )}

      {/* ── Hero Card ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 overflow-hidden hover-lift"
        style={{ animation: 'slideUpFade 0.45s cubic-bezier(0.22,1,0.36,1) 0.05s both' }}>
        {/* Cover */}
        <div className={`relative h-40 bg-gradient-to-br ${rc.gradient} overflow-hidden`}>
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 animate-float" />
          <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full bg-white/10 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-6 left-1/5 w-14 h-14 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0.5s' }} />
          {/* Role label top right */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/30 uppercase tracking-wide">
              {rc.label}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-14 mb-5">
            <div className={`w-24 h-24 rounded-2xl bg-white shadow-xl border-4 border-white flex items-center justify-center overflow-hidden ring-4 ${rc.ring} animate-bounce-in`}>
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className={`text-3xl font-extrabold bg-gradient-to-br ${rc.gradient} bg-clip-text text-transparent`}>
                  {getInitials(profile.name)}
                </span>
              )}
            </div>
            {isOwnProfile && (
              <Link to="/profile/edit"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <PencilSquareIcon className="w-4 h-4" />
                Edit Profile
              </Link>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-gray-900">{profile.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${rc.badge}`}>
              {profile.role}
            </span>
            {profile.isVerified && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold border border-emerald-100">
                <ShieldCheckIcon className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
            <BuildingOfficeIcon className="w-3.5 h-3.5" />
            {profile.department || 'Department not set'}
          </p>
          {profile.bio && (
            <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-xl bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              {profile.bio}
            </p>
          )}

          {/* Social links */}
          {(profile.linkedIn || profile.github) && (
            <div className="flex items-center gap-3 mt-3">
              {profile.linkedIn && (
                <a href={profile.linkedIn} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  <LinkIcon className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                  <CodeBracketIcon className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats (own profile) ── */}
      {isOwnProfile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
          <StatCard label="Complaints Filed"  value={stats?.userStats?.totalComplaints}   color="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 border border-blue-100"   icon="📋" delay={100} />
          <StatCard label="Resolved"          value={stats?.userStats?.resolvedComplaints} color="bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-100" icon="✅" delay={150} />
          <StatCard label="Events Joined"     value={stats?.userStats?.eventsRegistered}  color="bg-gradient-to-br from-violet-50 to-purple-50 text-violet-700 border border-violet-100" icon="🎯" delay={200} />
          <StatCard label="Announcements"     value={stats?.userStats?.announcementsRead} color="bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 border border-amber-100"  icon="📢" delay={250} />
        </div>
      )}

      {/* ── Student CGPA + Attendance ── */}
      {isOwnProfile && profile.role === 'student' && (profile.cgpa !== undefined || profile.attendance !== undefined) && (
        <div className="grid grid-cols-2 gap-3" style={{ animation: 'slideUpFade 0.5s cubic-bezier(0.22,1,0.36,1) 0.28s both' }}>
          {profile.cgpa !== undefined && (
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-white/80" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wide">CGPA</span>
              </div>
              <p className="text-4xl font-extrabold">{profile.cgpa}</p>
              <p className="text-xs text-white/60 mt-1">out of 10.0</p>
            </div>
          )}
          {profile.attendance !== undefined && (
            <div className={`rounded-2xl p-5 text-white hover-lift ${profile.attendance >= 75 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : profile.attendance >= 60 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
              <div className="flex items-center gap-2 mb-2">
                <AcademicCapIcon className="w-5 h-5 text-white/80" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wide">Attendance</span>
              </div>
              <p className="text-4xl font-extrabold">{profile.attendance}%</p>
              <div className="mt-2 bg-white/20 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-white/80 transition-all" style={{ width: `${Math.min(profile.attendance, 100)}%` }} />
              </div>
              <p className="text-xs text-white/60 mt-1">{profile.attendance >= 75 ? 'Good standing' : 'Needs improvement'}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Achievement Passport (students only) ── */}
      {isOwnProfile && profile.role === 'student' && (
        <Link to="/profile/passport"
          className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl text-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
          style={{ animation: 'slideUpFade 0.5s cubic-bezier(0.22,1,0.36,1) 0.3s both' }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors animate-float">
              <TrophyIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold flex items-center gap-1">
                Achievement Passport
                <SparklesIcon className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              </p>
              <p className="text-xs text-white/70 mt-0.5">
                {profile.achievements?.length || 0} achievements · {profile.skills?.length || 0} skills · {profile.projects?.length || 0} projects
              </p>
            </div>
          </div>
          <ArrowRightIcon className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* ── Info Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 hover-lift"
          style={{ animation: 'slideUpFade 0.5s cubic-bezier(0.22,1,0.36,1) 0.2s both' }}>
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <UserCircleIcon className="w-4 h-4 text-indigo-600" />
            </span>
            Personal Information
          </h2>
          <InfoRow icon={EnvelopeIcon} label="Email Address" value={profile.email} accentBg="bg-indigo-50" accentText="text-indigo-600" />
          <InfoRow icon={PhoneIcon} label="Phone Number" value={profile.phone} accentBg="bg-cyan-50" accentText="text-cyan-600" />
          <InfoRow
            icon={IdentificationIcon}
            label={profile.role === 'student' ? 'Roll Number' : 'Employee ID'}
            value={profile.rollNumber || profile.employeeId}
            accentBg="bg-violet-50" accentText="text-violet-600"
          />
          <InfoRow icon={CalendarIcon} label="Member Since" value={formatDate(profile.createdAt)} accentBg="bg-amber-50" accentText="text-amber-600" />
        </div>

        {/* Academic */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 hover-lift"
          style={{ animation: 'slideUpFade 0.5s cubic-bezier(0.22,1,0.36,1) 0.25s both' }}>
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <AcademicCapIcon className="w-4 h-4 text-violet-600" />
            </span>
            Academic Information
          </h2>
          <InfoRow icon={BuildingOfficeIcon} label="Department" value={profile.department} accentBg="bg-indigo-50" accentText="text-indigo-600" />
          {profile.role === 'student' && (<>
            <InfoRow icon={AcademicCapIcon} label="Year of Study" value={profile.year ? `Year ${profile.year}` : null} accentBg="bg-emerald-50" accentText="text-emerald-600" />
            <InfoRow icon={AcademicCapIcon} label="Semester" value={profile.semester ? `Semester ${profile.semester}` : null} accentBg="bg-cyan-50" accentText="text-cyan-600" />
            <InfoRow icon={AcademicCapIcon} label="Section" value={profile.section} accentBg="bg-amber-50" accentText="text-amber-600" />
            <InfoRow icon={AcademicCapIcon} label="Program" value={profile.program} accentBg="bg-violet-50" accentText="text-violet-600" />
          </>)}
          {profile.role === 'faculty' && (
            <InfoRow icon={AcademicCapIcon} label="Designation" value={profile.designation} accentBg="bg-cyan-50" accentText="text-cyan-600" />
          )}
          {profile.role === 'admin' && (
            <InfoRow icon={ShieldCheckIcon} label="Access Level" value="Full System Access" accentBg="bg-rose-50" accentText="text-rose-600" />
          )}
        </div>
      </div>
    </div>
  );
}
