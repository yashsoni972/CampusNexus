import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AcademicCapIcon, EnvelopeIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function VerifyOTP() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { verifyOtp } = useAuth();

  // email + purpose passed via navigation state
  const email   = location.state?.email   || '';
  const purpose = location.state?.purpose || 'verification'; // 'verification' | 'login'

  const [digits, setDigits]     = useState(['', '', '', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60); // seconds before resend allowed
  const [error, setError]       = useState('');
  const inputRefs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/login', { replace: true });
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const otp = digits.join('');

  // Handle digit input
  const handleDigit = (index, value) => {
    const v = value.replace(/\D/, '').slice(-1); // only last digit
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    setError('');
    if (v && index < 5) inputRefs.current[index + 1]?.focus();
    // Auto-submit when all 6 filled
    if (v && index === 5) {
      const full = next.join('');
      if (full.length === 6) handleSubmit(full);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0)  inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  // Handle paste (e.g. from email app)
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((d, i) => { if (i < 6) next[i] = d; });
    setDigits(next);
    setError('');
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
    if (pasted.length === 6) handleSubmit(pasted);
  };

  const handleSubmit = async (code = otp) => {
    if (code.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await verifyOtp(email, code);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(msg);
      toast.error(msg);
      // Clear digits on error
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email, purpose });
      toast.success('New OTP sent to your email!');
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c)
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 -z-10"
        style={{ background: 'linear-gradient(160deg,#f0f4ff 0%,#faf5ff 40%,#f0fdf4 70%,#fffbeb 100%)' }} />
      <div className="fixed -top-32 -left-32 w-[500px] h-[500px] rounded-full -z-10 opacity-40"
        style={{ background: 'radial-gradient(circle,rgba(94,92,230,0.25),transparent 70%)', filter: 'blur(60px)' }} />
      <div className="fixed bottom-0 -right-20 w-[400px] h-[400px] rounded-full -z-10 opacity-30"
        style={{ background: 'radial-gradient(circle,rgba(48,209,88,0.2),transparent 70%)', filter: 'blur(60px)' }} />

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#0A84FF,#5E5CE6)', boxShadow: '0 6px 20px rgba(10,132,255,0.4)' }}>
            <AcademicCapIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1c1c1e] tracking-tight">CampusNexus</span>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        >
          {/* Back */}
          <button onClick={() => navigate(purpose === 'login' ? '/login' : '/register')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors group">
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
            <EnvelopeIcon className="w-7 h-7 text-indigo-600" />
          </div>

          <h2 className="text-2xl font-bold text-[#1c1c1e] tracking-tight mb-1">
            {purpose === 'login' ? 'Confirm Login' : 'Verify Your Email'}
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            We sent a 6-digit OTP to{' '}
            <span className="font-semibold text-indigo-600">{maskedEmail}</span>.
            {' '}Enter it below to {purpose === 'login' ? 'complete your login' : 'activate your account'}.
          </p>

          {/* OTP Input boxes */}
          <div className="flex gap-2.5 justify-center mb-5" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                autoFocus={i === 0}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
                  ${d
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : error
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                  focus:border-indigo-500 focus:bg-indigo-50 focus:ring-2 focus:ring-indigo-200`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-sm text-red-500 font-medium mb-4">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={() => handleSubmit()}
            disabled={loading || otp.length < 6}
            className="w-full py-3 text-sm font-bold rounded-2xl text-white transition-all duration-200
              bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Verifying...
              </>
            ) : (
              purpose === 'login' ? 'Confirm Login' : 'Verify & Activate Account'
            )}
          </button>

          {/* Resend */}
          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Didn't receive it?{' '}
              {countdown > 0 ? (
                <span className="font-semibold text-gray-400">
                  Resend in {countdown}s
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowPathIcon className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </p>
          </div>

          {/* Help text */}
          <p className="mt-4 text-xs text-center text-gray-400">
            OTP expires in 10 minutes · Check spam folder if not received
          </p>
        </div>
      </div>
    </div>
  );
}
