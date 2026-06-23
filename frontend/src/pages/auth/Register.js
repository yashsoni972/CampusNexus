import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, AcademicCapIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { DEPARTMENTS } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep]         = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [form, setForm] = useState({
    name:'', email:'', password:'', confirmPassword:'',
    role:'student', rollNumber:'', department:'',
    semester:'', batch:'', program:'B.Tech'
  });

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim())     e.name = 'Full name is required';
    if (!form.email)           e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)        e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = form;
      const result = await register(userData);
      navigate(`/verify-email?token=${encodeURIComponent(result?.verificationToken || '')}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const em = {};
        err.response.data.errors.forEach(e => { em[e.field] = e.message; });
        setErrors(em);
      }
    } finally { setLoading(false); }
  };

  const inputCls = (field) =>
    `input-field ${errors[field] ? 'border-[#FF453A]' : ''}`;

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">

      {/* Mesh BG */}
      <div className="fixed inset-0 -z-10"
        style={{ background:'linear-gradient(160deg, #f0f4ff 0%, #faf5ff 40%, #f0fdf4 70%, #fffbeb 100%)' }} />
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full -z-10 opacity-50"
        style={{ background:'radial-gradient(circle,rgba(94,92,230,0.22),transparent 70%)', filter:'blur(60px)', animation:'float 8s ease-in-out infinite' }} />
      <div className="fixed -bottom-20 -right-20 w-[500px] h-[500px] rounded-full -z-10 opacity-40"
        style={{ background:'radial-gradient(circle,rgba(48,209,88,0.18),transparent 70%)', filter:'blur(60px)', animation:'float 10s ease-in-out infinite', animationDelay:'4s' }} />

      <div className="w-full max-w-md page-enter">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl"
            style={{ background:'linear-gradient(135deg,#0A84FF,#5E5CE6)', boxShadow:'0 6px 20px rgba(10,132,255,0.4)' }}>
            <AcademicCapIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1c1c1e] tracking-tight">CampusNexus</span>
        </div>

        {/* Glass card */}
        <div className="overflow-hidden rounded-3xl"
          style={{
            background:'rgba(255,255,255,0.82)',
            backdropFilter:'blur(40px)',
            WebkitBackdropFilter:'blur(40px)',
            border:'1px solid rgba(255,255,255,0.8)',
            boxShadow:'0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
          }}>

          {/* Header */}
          <div className="px-8 pt-8 pb-6"
            style={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
            <h2 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Create account</h2>
            <p className="text-[rgba(60,60,67,0.55)] text-sm mt-1">Join the campus community</p>

            {/* Step indicator */}
            <div className="flex items-center gap-3 mt-5">
              {[1,2].map(s => (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center text-xs font-bold transition-all duration-300 rounded-full w-7 h-7"
                      style={
                        s < step  ? { background:'#30D158', color:'white', boxShadow:'0 3px 10px rgba(48,209,88,0.4)' }
                        : s === step ? { background:'rgba(10,132,255,0.12)', color:'#0A84FF', border:'2px solid #0A84FF' }
                        : { background:'rgba(0,0,0,0.06)', color:'rgba(60,60,67,0.4)' }
                      }>
                      {s < step ? <CheckIcon className="w-3.5 h-3.5" /> : s}
                    </div>
                    <span className="hidden text-xs font-semibold sm:block"
                      style={{ color: s <= step ? '#1c1c1e' : 'rgba(60,60,67,0.4)' }}>
                      {s === 1 ? 'Account Info' : 'Academic Details'}
                    </span>
                  </div>
                  {s < 2 && (
                    <div className="flex-1 h-0.5 rounded-full transition-all duration-500"
                      style={{ background: s < step ? 'linear-gradient(90deg,#30D158,#0A84FF)' : 'rgba(0,0,0,0.08)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={step === 1 ? (e) => { e.preventDefault(); if (validateStep1()) setStep(2); } : handleSubmit}
            className="px-8 py-6 space-y-4"
          >
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.6)] mb-1.5">Full Name</label>
                  <input type="text" className={inputCls('name')} placeholder="John Doe"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                  {errors.name && <p className="text-[#FF453A] text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.6)] mb-1.5">Email Address</label>
                  <input type="email" className={inputCls('email')} placeholder="john@college.edu"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                  {errors.email && <p className="text-[#FF453A] text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.6)] mb-1.5">Role</label>
                  <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.6)] mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} className={`${inputCls('password')} pr-11`}
                      placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                    <button type="button" onClick={() => setShowPass(v=>!v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(60,60,67,0.4)] hover:text-[rgba(60,60,67,0.7)] transition-colors">
                      {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[#FF453A] text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.6)] mb-1.5">Confirm Password</label>
                  <input type="password" className={inputCls('confirmPassword')} placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                  {errors.confirmPassword && <p className="text-[#FF453A] text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
                <button type="submit" className="btn-primary w-full py-3 text-[15px]">Continue →</button>
              </>
            )}

            {step === 2 && (
              <>
                {form.role === 'student' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.6)] mb-1.5">Roll Number</label>
                    <input type="text" className="input-field" placeholder="e.g. CS20B001"
                      value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.6)] mb-1.5">Department</label>
                  <select className="input-field" value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {form.role === 'student' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.6)] mb-1.5">Semester</label>
                        <select className="input-field" value={form.semester} onChange={e => set('semester', e.target.value)}>
                          <option value="">Select</option>
                          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.6)] mb-1.5">Batch</label>
                        <input type="text" className="input-field" placeholder="e.g. 2021-25"
                          value={form.batch} onChange={e => set('batch', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.6)] mb-1.5">Program</label>
                      <select className="input-field" value={form.program} onChange={e => set('program', e.target.value)}>
                        {['B.Tech','M.Tech','BCA','MCA','B.Sc','M.Sc','Other'].map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 btn-secondary">← Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-[15px]">
                    {loading
                      ? <><div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" /> Creating...</>
                      : 'Create Account'
                    }
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-[rgba(60,60,67,0.5)] pb-7 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#0A84FF] hover:text-[#0870d8] transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
