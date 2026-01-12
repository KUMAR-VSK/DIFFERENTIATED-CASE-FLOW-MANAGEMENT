import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200';
      case 'JUDGE':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200';
      case 'CLERK':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 ring-1 ring-gray-200';
    }
  };

  return (
    <nav className="bg-slate-900 shadow-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand Section */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg tracking-tight">DCM</span>
                <span className="text-slate-400 text-xs font-medium">Legal Management</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links & User Section */}
          {user ? (
            <div className="flex items-center space-x-6">
              {/* Welcome Message */}
              <div className="hidden md:block text-right">
                <p className="text-slate-300 text-sm">Welcome back</p>
                <p className="text-white font-medium text-sm">{user.firstName || user.username}</p>
              </div>

              {/* Role Badge */}
              <span className={`hidden sm:inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                {user.role}
              </span>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  to="/dashboard"
                  className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  to="/cases"
                  className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Cases
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    to="/users"
                    className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                  >
                    Users
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/analytics"
                    className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                  >
                    Analytics
                  </Link>
                )}
              </div>

              {/* Action Button */}
              {(user.role === 'CLERK' || user.role === 'ADMIN') && (
                <Link
                  to="/cases/new"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  New Case
                </Link>
              )}

              {/* Enhanced Theme Toggle Button */}
              <div className="relative">
                <button
                  onClick={toggleDarkMode}
                  className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-slate-900/50 active:scale-95"
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {/* Background glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Icon container with rotation animation */}
                  <div className={`relative z-10 transform transition-all duration-500 ease-in-out ${darkMode ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                    {darkMode ? (
                      <svg
                        className="w-5 h-5 drop-shadow-sm animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 drop-shadow-sm animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.5))'
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </div>

                  {/* Ripple effect on click */}
                  <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-active:opacity-100 group-active:animate-ping transition-opacity duration-150"></div>
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-slate-700 shadow-lg">
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded-md transition-all duration-200"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu (if needed) */}
      {user && (
        <div className="md:hidden border-t border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="text-slate-300 hover:text-white hover:bg-slate-800 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
            >
              Dashboard
            </Link>
            <Link
              to="/cases"
              className="text-slate-300 hover:text-white hover:bg-slate-800 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
            >
              Cases
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;