import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon, MegaphoneIcon, ExclamationCircleIcon,
  CalendarDaysIcon, UserCircleIcon, UsersIcon,
  AcademicCapIcon, XMarkIcon, TrophyIcon,
  UserGroupIcon, EnvelopeIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid, MegaphoneIcon as MegaSolid,
  ExclamationCircleIcon as ExclSolid, CalendarDaysIcon as CalSolid,
  UserCircleIcon as UserSolid, UsersIcon as UsersSolid,
  TrophyIcon as TrophySolid, UserGroupIcon as UserGroupSolid,
  EnvelopeIcon as EnvelopeSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';
import api from '../../utils/api';

const roleConfig = {
  admin:   { grad: 'from-[#FF375F] to-[#FF9F0A]', dot: 'bg-[#FF375F]',  label: 'Administrator',  ring: 'ring-rose-300' },
  faculty: { grad: 'from-[#0A84FF] to-[#5AC8FA]', dot: 'bg-[#0A84FF]',  label: 'Faculty Member', ring: 'ring-blue-300' },
  student: { grad: 'from-[#30D158] to-[#0A84FF]', dot: 'bg-[#30D158]',  label: 'Student',        ring: 'ring-green-300' },
};

const NavItem = ({ to, icon: Icon, iconSolid: IconSolid, label, onClick, badge }) => {
  const location = useLocation();
  const isActive = to === '/profile'
    ? location.pathname === '/profile' || location.pathname === '/profile/edit'
    : location.pathname === to || location.pathname.startsWith(to + '/');
  const ActiveIcon = IconSolid || Icon;

  return (
    <NavLink to={to} onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 select-none ${
        isActive
          ? 'bg-[rgba(10,132,255,0.12)] text-[#0A84FF]'
          : 'text-[rgba(60,60,67,0.8)] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1c1c1e]'
      }`}
      style={ isActive ? { boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' } : {} }
    >
      {/* Icon container */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        isActive
          ? 'bg-[#0A84FF] shadow-blue'
          : 'bg-[rgba(0,0,0,0.05)] group-hover:bg-[rgba(0,0,0,0.08)]'
      }`}
        style={ isActive ? { boxShadow: '0 4px 12px rgba(10,132,255,0.35)' } : {} }
      >
        {isActive
          ? <ActiveIcon className="w-4 h-4 text-white" />
          : <Icon className="w-4 h-4 text-[rgba(60,60,67,0.6)] group-hover:text-[#1c1c1e] transition-colors" />
        }
      </div>

      <span className="flex-1 font-medium tracking-[-0.01em]">{label}</span>

      {badge && (
        <span className="text-[10px] font-bold bg-[#FF375F] text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center"
          style={{ boxShadow:'0 2px 8px rgba(255,55,95,0.4)' }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isStudent, isAdminOrFaculty } = useAuth();
  const rc = roleConfig[user?.role] || roleConfig.student;
  const [unreadMail, setUnreadMail] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetch = () => api.get('/mail/unread-count').then(r => setUnreadMail(r.data.count || 0)).catch(() => {});
    fetch();
    const t = setInterval(fetch, 30000);
    return () => clearInterval(t);
  }, [user]);

  const navigation = [
    { to: '/dashboard',     icon: HomeIcon,              iconSolid: HomeSolid,      label: 'Dashboard' },
    { to: '/announcements', icon: MegaphoneIcon,         iconSolid: MegaSolid,      label: 'Announcements' },
    { to: '/complaints',    icon: ExclamationCircleIcon, iconSolid: ExclSolid,      label: 'Complaints' },
    { to: '/events',        icon: CalendarDaysIcon,      iconSolid: CalSolid,       label: 'Events' },
    { to: '/clubs',         icon: UserGroupIcon,         iconSolid: UserGroupSolid, label: 'Clubs' },
    { to: '/mail',          icon: EnvelopeIcon,          iconSolid: EnvelopeSolid,  label: 'Campus Mail', badge: unreadMail || null },
    { to: '/profile',       icon: UserCircleIcon,        iconSolid: UserSolid,      label: 'My Profile' },
    ...(isStudent ? [{ to:'/profile/passport', icon:TrophyIcon, iconSolid:TrophySolid, label:'Achievement Passport' }] : []),
    ...(isAdminOrFaculty ? [{ to:'/admin/users', icon:UsersIcon, iconSolid:UsersSolid, label:'Manage Users' }] : []),
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 lg:hidden"
          style={{ background:'rgba(0,0,0,0.35)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 flex flex-col
          transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRight: '1px solid rgba(255,255,255,0.55)',
          boxShadow: isOpen ? '0 0 60px rgba(0,0,0,0.15)' : 'inset -1px 0 0 rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo bar */}
        <div className="flex items-center justify-between h-16 px-4 flex-shrink-0"
          style={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)',
                boxShadow: '0 4px 16px rgba(10,132,255,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
              }}>
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#1c1c1e] tracking-tight leading-none">CampusNexus</p>
              <p className="text-[10px] text-[rgba(60,60,67,0.5)] font-medium mt-0.5">ERP Platform</p>
            </div>
          </div>
          <button onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-xl flex items-center justify-center transition-colors hover:bg-black/6">
            <XMarkIcon className="w-4 h-4 text-[rgba(60,60,67,0.6)]" />
          </button>
        </div>

        {/* User identity card */}
        <div className="px-3 pt-4 pb-2 flex-shrink-0">
          <div className={`relative px-4 py-3.5 rounded-3xl overflow-hidden bg-gradient-to-br ${rc.grad}`}
            style={{ boxShadow:'0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
            {/* Decorative circles */}
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 bottom-0  w-16 h-16 rounded-full bg-white/10" />
            <div className="absolute  left-0  bottom-0  w-12 h-12 rounded-full bg-black/5" />

            <div className="relative flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl bg-white/25 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 border-2 border-white/40 overflow-hidden ring-2 ring-white/20`}>
                {user?.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <span className="text-base">{getInitials(user?.name)}</span>
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-white truncate leading-tight">{user?.name}</p>
                <p className="text-[11px] text-white/80 font-medium mt-0.5">{rc.label}</p>
                {user?.department && (
                  <p className="text-[10px] text-white/60 truncate mt-0.5">{user.department}</p>
                )}
              </div>
              <div className={`w-2 h-2 rounded-full ${rc.dot} flex-shrink-0`}
                style={{ boxShadow:`0 0 0 3px rgba(255,255,255,0.3)` }} />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="section-header px-3 mb-2 mt-1">Main Menu</p>
          {navigation.map((item, i) => (
            <div key={item.to} style={{ animation:`slideInLeft 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 35}ms both` }}>
              <NavItem {...item} onClick={onClose} />
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 flex-shrink-0" style={{ borderTop:'1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
            style={{ background:'rgba(0,0,0,0.03)' }}>
            <SparklesIcon className="w-3.5 h-3.5 text-[#0A84FF] flex-shrink-0" />
            <p className="text-[11px] text-[rgba(60,60,67,0.6)] font-medium truncate flex-1">
              {user?.department || 'CampusNexus'} · v2.0
            </p>
            <div className="w-1.5 h-1.5 rounded-full bg-[#30D158] flex-shrink-0 animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
