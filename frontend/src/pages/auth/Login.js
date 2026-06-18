import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const DEMOS = {
  student: { email: 'student@college.edu', password: 'student1234' },
  faculty: { email: 'faculty@college.edu', password: 'faculty1234' },
  admin:   { email: 'admin@college.edu',   password: 'admin1234' },
};

const FEATURES = [
  { icon: '📢', label: 'Announcements',  desc: 'Real-time campus updates' },
  { icon: '🎯', label: 'Events',         desc: 'Stay connected on campus' },
  { icon: '💬', label: 'Campus Clubs',   desc: 'Chat with your community' },
  { icon: '✉️', label: 'Campus Mail',    desc: 'Your own college inbox' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">

      {/* ── Mesh background ───────────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(160deg, #f0f4ff 0%, #faf5ff 40%, #f0fdf4 70%, #fffbeb 100%)',
        }}
      />
      <div className="fixed -top-32 -left-32 w-[600px] h-[600px] rounded-full -z-10 opacity-50"
        style={{ background:'radial-gradient(circle, rgba(94,92,230,0.25), transparent 70%)', filter:'blur(60px)', animation:'float 8s ease-in-out infinite' }} />
      <div className="fixed top-1/3 -right-32 w-[500px] h-[500px] rounded-full -z-10 opacity-40"
        style={{ background:'radial-gradient(circle, rgba(10,132,255,0.2), transparent 70%)', filter:'blur(60px)', animation:'float 10s ease-in-out infinite', animationDelay:'3s' }} />
      <div className="fixed bottom-0 left-1/3 w-[400px] h-[400px] rounded-full -z-10 opacity-30"
        style={{ background:'radial-gradient(circle, rgba(48,209,88,0.2), transparent 70%)', filter:'blur(60px)', animation:'float 12s ease-in-out infinite', animationDelay:'6s' }} />

      {/* ── Left branding panel ────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative"
        style={{
          background: 'linear-gradient(135deg, rgba(10,10,30,0.92) 0%, rgba(30,20,60,0.88) 50%, rgba(10,30,20,0.88) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
        }}
      >
        {/* Orbs inside panel */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-30"
          style={{ background:'radial-gradient(circle, #5E5CE6, transparent)', filter:'blur(60px)', transform:'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-20"
          style={{ background:'radial-gradient(circle, #0A84FF, transparent)', filter:'blur(60px)', transform:'translate(-30%,30%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#0A84FF,#5E5CE6)', boxShadow:'0 8px 24px rgba(10,132,255,0.5), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">CampusNexus</h1>
            <p className="text-white/50 text-xs font-medium">College ERP Platform</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-5xl font-bold text-white leading-tight tracking-tight">
              Your campus,<br />
              <span style={{
                background:'linear-gradient(135deg, #5AC8FA, #5E5CE6, #BF5AF2)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'
              }}>fully connected.</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mt-4 max-w-sm">
              A unified platform for students, faculty, and administrators — beautifully designed for modern campus life.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f.label}
                className="px-4 py-3.5 rounded-2xl transition-colors"
                style={{
                  background:'rgba(255,255,255,0.07)',
                  border:'1px solid rgba(255,255,255,0.1)',
                  backdropFilter:'blur(12px)',
                }}>
                <span className="text-2xl">{f.icon}</span>
                <p className="text-white font-semibold text-sm mt-2 tracking-tight">{f.label}</p>
                <p className="text-white/50 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/40 text-xs font-medium">
          © 2025 CampusNexus · Built for modern education
        </p>
      </div>

      {/* ── Right form panel ───────────────────────────────────────────────── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm animate-page-enter">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#0A84FF,#5E5CE6)', boxShadow:'0 4px 16px rgba(10,132,255,0.4)' }}>
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1c1c1e] tracking-tight">CampusNexus</span>
          </div>

          {/* Glass card */}
          <div className="rounded-3xl p-8 space-y-6"
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
            }}
          >
            <div>
              <h2 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Welcome back</h2>
              <p className="text-[rgba(60,60,67,0.6)] text-sm mt-1 font-medium">Sign in to your portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[rgba(60,60,67,0.7)] mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" autoComplete="email" placeholder="you@college.edu"
                  value={form.email}
                  onChange={e => { setForm(p=>({...p, email:e.target.value})); setErrors(p=>({...p,email:''})); }}
                  className={`input-field ${errors.email ? 'border-[#FF453A]!' : ''}`}
                />
                {errors.email && <p className="text-[#FF453A] text-xs mt-1 font-medium">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[rgba(60,60,67,0.7)] mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                    value={form.password}
                    onChange={e => { setForm(p=>({...p, password:e.target.value})); setErrors(p=>({...p,password:''})); }}
                    className={`input-field pr-11 ${errors.password ? 'border-[#FF453A]!' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPass(v=>!v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(60,60,67,0.4)] hover:text-[rgba(60,60,67,0.7)] transition-colors">
                    {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[#FF453A] text-xs mt-1 font-medium">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-[15px] font-semibold">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                  : 'Sign In'
                }
              </button>
            </form>

            {/* Quick demo */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px" style={{ background:'rgba(0,0,0,0.08)' }} />
                <span className="text-[11px] text-[rgba(60,60,67,0.5)] font-semibold uppercase tracking-wide">Quick demo</span>
                <div className="flex-1 h-px" style={{ background:'rgba(0,0,0,0.08)' }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role:'student', label:'🎓 Student', color:'rgba(48,209,88,0.12)',  border:'rgba(48,209,88,0.25)',  text:'#1a9e45' },
                  { role:'faculty', label:'👨‍🏫 Faculty', color:'rgba(10,132,255,0.1)',  border:'rgba(10,132,255,0.2)',  text:'#0A84FF' },
                  { role:'admin',   label:'🛡️ Admin',   color:'rgba(255,69,58,0.1)',   border:'rgba(255,69,58,0.2)',   text:'#FF453A' },
                ].map(({ role, label, color, border, text }) => (
                  <button key={role} type="button" onClick={() => setForm(DEMOS[role])}
                    className="text-xs font-semibold py-2.5 px-2 rounded-2xl transition-all hover:scale-105 active:scale-95"
                    style={{ background:color, border:`1px solid ${border}`, color:text }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-[rgba(60,60,67,0.6)] mt-5 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#0A84FF] hover:text-[#0870d8] transition-colors">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
