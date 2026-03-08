import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useTheme } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'System Dashboard';
    if (path.startsWith('/cases')) return 'Case Registry';
    if (path === '/calendar') return 'Hearing Matrix';
    if (path === '/users') return 'IAM Controls';
    if (path === '/reports') return 'Intelligence Engine';
    if (path === '/templates') return 'Workflow Assets';
    if (path.startsWith('/documents')) return 'Secure Vault';
    return 'LCN Workplace';
  };

  if (!user) return null;

  return (
    <header className="h-20 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800 sticky top-0 z-30 flex items-center justify-between px-8">
      {/* Contextual Title */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-3">
          <div className="w-1 h-8 bg-primary-600 rounded-full"></div>
          <div>
            <h2 className="text-xl font-black text-surface-950 dark:text-white tracking-tight">
              {getPageTitle()}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Workspace</span>
              <svg className="w-3 h-3 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Utilities & Profile */}
      <div className="flex items-center gap-6">
        {/* Search Mockup */}
        <div className="hidden md:flex relative group">
          <svg className="w-4 h-4 text-surface-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search Registry..."
            className="w-64 bg-surface-100 dark:bg-surface-900 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold placeholder-surface-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div className="h-8 w-px bg-surface-200 dark:bg-surface-800"></div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-3 text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-all bg-surface-100 dark:bg-surface-900 rounded-2xl hover:scale-110 active:scale-95 shadow-sm"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 11H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 7.757l.707-.707M12 7a5 5 0 110 10 5 5 0 010-10z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-black text-surface-950 dark:text-white leading-none">
                {user.firstName || user.username}
              </span>
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-1">
                {user.role}
              </span>
            </div>

            <button className="relative group">
              <div className="w-11 h-11 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform active:scale-95">
                {(user.firstName || user.username).charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-surface-950 rounded-full animate-pulse"></div>
            </button>
          </div>

          <div className="h-8 w-px bg-surface-200 dark:border-surface-800"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-2xl group hover:scale-110 active:scale-95"
            title="Secure Logout"
          >
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
