import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Lock, ArrowLeft, Check } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      showToast('Password reset successful!', 'success');
      setCompleted(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Token is invalid or has expired', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-6 px-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Choose Password</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Enter your new password below
          </p>
        </div>

        {!completed ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-805 dark:text-slate-205 mb-1">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-805 dark:text-slate-205 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-400 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-brand-500/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Password
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
            <div className="w-12 h-12 bg-emerald-500 text-white flex items-center justify-center rounded-full mx-auto shadow-md">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Password Changed!</h3>
            <p className="text-sm text-slate-705 dark:text-slate-300">
              Your password has been updated successfully. Redirecting you to the login page...
            </p>
          </div>
        )}

        <div className="text-center border-t border-slate-100 dark:border-slate-800/80 pt-5">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-750 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
