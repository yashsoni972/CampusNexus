import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bars3Icon, BellIcon, ChevronDownIcon,
  UserCircleIcon, ArrowRightOnRectangleIcon,
  Cog6ToothIcon, AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';

const roleConfig = {
  admin:   { grad: 'from-[#FF375F] to-[#FF9F0A]', color:'#FF375F', label:'Administrator' },
  faculty: { grad: 'from-[#0A84FF] to-[#5AC8FA]', color:'#0A84FF', label:'Faculty Member' },
  student: { grad: 'from-[#30D158] to-[#0A84FF]', color:'#30D158', label:'Student' },
};

const pageTitles = {
  '/dashboard':         'Dashboard',
  '/announcements':     'Announcements',
  '/complaints':        'Complaints',
  '/events':            'Events',
  '/clubs':             'Campus Clubs',
  '/mail':              'Campus Mail',
  '/profile':           'My Profile',
  '/profile/edit':      'Edit Profile',
  '/profile/passport':  'Achievement Passport',
  '/admin/users':       'User Management',
};

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const rc  = roleConfig[user?.role] || roleConfig.student;

  const pageTitle = Object.entries(pageTitles).find(([k]) =>
    location.pathname === k || location.pathname.startsWith(k + '/')
  )?.[1] || 'CampusNexus';

  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-5 flex-shrink-0 sticky top-0 z-10"
      style={{
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle}
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-black/5 active:bg-black/10">
          <Bars3Icon className="w-5 h-5 text-[rgba(60,60,67,0.8)]" />
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#0A84FF,#5E5CE6)', boxShadow:'0 3px 10px rgba(10,132,255,0.35)' }}>
            <AcademicCapIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-bold text-[#1c1c1e] tracking-tight">CampusNexus</span>
        </div>

        {/* Desktop page title */}
        <div className="hidden lg:block">
          <h1 className="text-[15px] font-bold text-[#1c1c1e] tracking-[-0.02em] leading-none">{pageTitle}</h1>
          <p className="text-[11px] text-[rgba(60,60,67,0.5)] font-medium mt-1">{today}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">

        {/* Live badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full mr-1"
          style={{ background:'rgba(48,209,88,0.1)', border:'1px solid rgba(48,209,88,0.2)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
          <span className="text-[10px] font-bold text-[#1a9e45] uppercase tracking-wide">Live</span>
        </div>

        {/* Bell */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-black/5 active:bg-black/10 group">
          <BellIcon className="w-5 h-5 text-[rgba(60,60,67,0.7)] group-hover:text-[#1c1c1e] transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF375F] ring-2 ring-white"
            style={{ boxShadow:'0 2px 6px rgba(255,55,95,0.5)' }} />
        </button>

        {/* User pill */}
        <div className="relative" ref={ref}>
          <button onClick={() => setOpen(v => !v)}
            className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-2xl transition-all duration-200 ${
              open ? 'bg-black/6' : 'hover:bg-black/5'
            }`}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 flex-shrink-0"
              style={{ ringColor: rc.color + '40' }}>
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : <div className={`w-full h-full bg-gradient-to-br ${rc.grad} flex items-center justify-center text-white text-xs font-bold`}>
                    {getInitials(user?.name)}
                  </div>
              }
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-semibold text-[#1c1c1e] leading-tight tracking-[-0.01em] max-w-[100px] truncate">{user?.name}</p>
              <p className="text-[10px] font-medium capitalize" style={{ color: rc.color }}>{user?.role}</p>
            </div>
            <ChevronDownIcon className={`w-3.5 h-3.5 text-[rgba(60,60,67,0.4)] hidden sm:block transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-64 rounded-3xl py-2 z-50 animate-scale-in origin-top-right overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
              }}>

              {/* User banner */}
              <div className={`mx-2 mb-2 px-4 py-3.5 rounded-2xl bg-gradient-to-br ${rc.grad} relative overflow-hidden`}
                style={{ boxShadow:'0 4px 16px rgba(0,0,0,0.15)' }}>
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="absolute right-2 bottom-0 w-12 h-12 rounded-full bg-white/10" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/25 border border-white/40 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white text-sm">
                    {user?.avatar
                      ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      : getInitials(user?.name)
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-white/80 capitalize">{user?.role}</p>
                    <p className="text-[10px] text-white/60 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="px-2 space-y-0.5">
                <Link to="/profile"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-[rgba(60,60,67,0.9)] hover:bg-[rgba(10,132,255,0.08)] hover:text-[#0A84FF] transition-colors">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:'rgba(10,132,255,0.1)' }}>
                    <UserCircleIcon className="w-4 h-4 text-[#0A84FF]" />
                  </div>
                  My Profile
                </Link>
                <Link to="/profile/edit"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-[rgba(60,60,67,0.9)] hover:bg-[rgba(94,92,230,0.08)] hover:text-[#5E5CE6] transition-colors">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:'rgba(94,92,230,0.1)' }}>
                    <Cog6ToothIcon className="w-4 h-4 text-[#5E5CE6]" />
                  </div>
                  Account Settings
                </Link>
              </div>

              <div className="mx-3 my-2 h-px" style={{ background:'rgba(0,0,0,0.06)' }} />

              <div className="px-2">
                <button onClick={() => { logout(); navigate('/login'); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl text-sm font-medium text-[#FF453A] hover:bg-[rgba(255,69,58,0.08)] transition-colors">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:'rgba(255,69,58,0.1)' }}>
                    <ArrowRightOnRectangleIcon className="w-4 h-4 text-[#FF453A]" />
                  </div>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
