import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      showToast('Logged in successfully!', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-6 px-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Sign in to your BlogSphere account
          </p>
        </div>

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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-805 dark:text-slate-205">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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
                placeholder="••••••••"
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
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center border-t border-slate-100 dark:border-slate-800/80 pt-5">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-500 hover:underline inline-flex items-center gap-0.5"
            >
              Sign up <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
