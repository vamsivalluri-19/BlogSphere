import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import {
  Sun,
  Moon,
  Menu,
  X,
  Feather,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Bookmark,
  ChevronDown
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                <div className="bg-brand-500 text-white p-1.5 rounded-lg shadow-md flex items-center justify-center">
                  <Feather className="w-5 h-5" />
                </div>
                <span>Blog<span className="text-brand-500">Sphere</span></span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-brand-500 ${
                  isActive('/') ? 'text-brand-500' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                Home
              </Link>
              {user && (
                <Link
                  to="/create-post"
                  className={`text-sm font-medium transition-colors hover:text-brand-500 ${
                    isActive('/create-post') ? 'text-brand-500' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  Write Post
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Auth Buttons or Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none"
                  >
                    <img
                      src={getImageUrl(user.avatar, 'avatar')}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-brand-500"
                      onError={(e) => handleImageError(e, 'avatar')}
                    />
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-56 rounded-xl glass border border-white/20 dark:border-slate-800 shadow-xl py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{user.email}</p>
                        </div>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                        >
                          <UserIcon className="w-4 h-4" />
                          My Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-brand-500 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md shadow-brand-500/20 transition-all hover:scale-105"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-b border-white/20 dark:border-slate-800/40 py-4 px-4 space-y-3 animate-in slide-in-from-top duration-300">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </Link>
            {user && (
              <Link
                to="/create-post"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Write Post
              </Link>
            )}

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              {user ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-3">
                    <img
                      src={getImageUrl(user.avatar, 'avatar')}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-brand-500"
                      onError={(e) => handleImageError(e, 'avatar')}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 px-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center items-center px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center items-center px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-base font-medium text-white shadow-md shadow-brand-500/20"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                <div className="bg-brand-500 text-white p-1.5 rounded-lg flex items-center justify-center">
                  <Feather className="w-5 h-5" />
                </div>
                <span>Blog<span className="text-brand-500">Sphere</span></span>
              </Link>
              <p className="text-sm text-slate-700 dark:text-slate-300 max-w-sm">
                A modern platform to share ideas, build community, and publish high-quality markdown blogs. Empowering creators since 2026.
              </p>
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">Categories</h3>
              <ul className="space-y-2">
                {['Technology', 'Design', 'Development', 'Business', 'Lifestyle'].map((cat) => (
                  <li key={cat}>
                    <Link
                      to={`/?category=${cat}`}
                      className="text-sm text-slate-700 dark:text-slate-300 hover:text-brand-500 transition-colors"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">Newsletter</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                Subscribe to receive our latest updates.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full text-slate-800 dark:text-slate-200 placeholder-slate-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 text-sm rounded-lg transition-colors font-medium"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
          
          <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600 dark:text-slate-405">
              &copy; {new Date().getFullYear()} BlogSphere. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-xs text-slate-600 hover:text-brand-500">Privacy Policy</a>
              <a href="#" className="text-xs text-slate-600 hover:text-brand-500">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
