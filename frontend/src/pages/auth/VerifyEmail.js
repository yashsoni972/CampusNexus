import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const getTokenFromQuery = () => {
    const sp = new URLSearchParams(location.search);
    return sp.get('token');
  };

  useEffect(() => {
    const token = getTokenFromQuery();

    const run = async () => {
      if (!token) {
        setLoading(false);
        setMessage('Missing verification token.');
        return;
      }

      try {
        setMessage('Verifying your email...');
        await api.get('/auth/verify-email', { params: { token } });
        toast.success('Email verified successfully.');
        navigate('/login');
      } catch (err) {
        const msg = err.response?.data?.message || 'Verification failed.';
        toast.error(msg);
        setMessage(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 rounded-3xl"
        style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
      >
        <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Verify Email</h1>
        <p className="text-sm text-[rgba(60,60,67,0.6)] mt-2 font-medium">
          {loading ? 'Please wait...' : message}
        </p>
        <div className="mt-6">
          <button
            className="w-full py-3 text-sm font-semibold btn-secondary"
            onClick={() => navigate('/login')}
            type="button"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

