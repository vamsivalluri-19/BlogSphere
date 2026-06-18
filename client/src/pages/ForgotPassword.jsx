import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Mail, Key, ArrowLeft, ExternalLink } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      showToast('Reset link generated!', 'success');
      
      // Capture the mock reset token returned by our development controller
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error requesting reset link', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-6 px-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Reset Password</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Enter your email to receive a password reset link
          </p>
        </div>

        {!resetToken ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-805 dark:text-slate-205 mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
                  placeholder="you@example.com"
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
                  <Key className="w-5 h-5" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4 p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl text-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Development Mode Activation</h3>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              The reset token was generated. Since this is a test sandbox environment, you can use the direct link below:
            </p>
            <Link
              to={`/reset-password/${resetToken}`}
              className="mt-2 inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-md shadow-brand-500/10"
            >
              Go to Reset Form <ExternalLink className="w-4 h-4" />
            </Link>
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

export default ForgotPassword;
