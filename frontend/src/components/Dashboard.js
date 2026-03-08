import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../config/api';

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-700 bg-primary-50 dark:bg-primary-900/10 text-primary-600',
    blue: 'from-blue-500 to-blue-700 bg-primary-50 dark:bg-blue-900/10 text-primary-600',
    amber: 'from-amber-500 to-amber-700 bg-amber-50 dark:bg-amber-900/10 text-amber-600',
    emerald: 'from-emerald-500 to-emerald-700 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600',
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 group relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-3xl font-black text-surface-950 dark:text-white tabular-nums">{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${colors[color].split(' ').slice(0, 2).join(' ')} shadow-lg shadow-current/20 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.05] transition-opacity bg-current`}></div>
    </div>
  );
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [statsError, setStatsError] = useState(false);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const REFRESH_INTERVAL_MS = 30000; // 30 seconds

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDashboardData = React.useCallback(async (silent = false) => {
    if (!user || authLoading) {
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const requests = [
        axios.get(BASE_URL + '/api/cases/statistics'),
        axios.get(BASE_URL + '/api/cases/court-stats'),
        axios.get(BASE_URL + '/api/cases/recent'),
      ];

      if (user.role === 'ADMIN' || user.role === 'JUDGE') {
        requests.push(axios.get(BASE_URL + '/api/cases/escalated'));
      }

      const responses = await Promise.allSettled(requests);

      if (responses[0].status === 'fulfilled') {
        setStats(prev => ({ ...prev, ...responses[0].value.data }));
        setStatsError(false);
      } else {
        setStatsError(true);
        if (!silent) showToast('Unable to load statistics', 'error');
      }

      if (responses[1].status === 'fulfilled') {
        setStats(prev => ({ ...prev, ...responses[1].value.data }));
      }

      if (responses[2].status === 'fulfilled') {
        setRecentCases(responses[2].value.data.slice(0, 5));
      } else {
        if (!silent) showToast('Unable to load recent cases', 'error');
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 403) {
        setStatsError(true);
        if (!silent) showToast('Access denied to some resources', 'error');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => fetchDashboardData(false), 100);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user || authLoading) return;
    const interval = setInterval(() => fetchDashboardData(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, authLoading, fetchDashboardData]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-primary-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
      case 'SCHEDULED': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700';
      case 'UNDER_REVIEW': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700';
      case 'FILED': return 'bg-surface-100 text-surface-800 border-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:border-surface-600';
      case 'DISMISSED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      case 'ESCALATED': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700';
      default: return 'bg-surface-100 text-surface-800 border-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:border-surface-600';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 8) return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
    if (priority >= 6) return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700';
    if (priority >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
    return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-lg text-surface-600 dark:text-surface-300 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] animate-slide-in-right">
          <div
            className={`
              min-w-[320px] max-w-md 
              bg-white dark:bg-surface-800 
              rounded-xl shadow-2xl 
              border-l-4
              ${toast.type === 'error'
                ? 'border-l-red-500'
                : 'border-l-green-500'
              }
              transform transition-all duration-300 ease-out
              hover:scale-105
            `}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`
                  flex-shrink-0 mt-0.5
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${toast.type === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-green-100 dark:bg-green-900/30'
                  }
                `}>
                  {toast.type === 'error' ? (
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`
                    text-sm font-semibold mb-0.5
                    ${toast.type === 'error'
                      ? 'text-red-900 dark:text-red-100'
                      : 'text-green-900 dark:text-green-100'
                    }
                  `}>
                    {toast.type === 'error' ? 'Error' : 'Success'}
                  </p>
                  <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => setToast(null)}
                  className={`
                    flex-shrink-0 
                    w-7 h-7 rounded-lg
                    flex items-center justify-center
                    transition-colors duration-200
                    ${toast.type === 'error'
                      ? 'text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                      : 'text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                    }
                    focus:outline-none focus:ring-2 
                    ${toast.type === 'error' ? 'focus:ring-red-500' : 'focus:ring-green-500'}
                  `}
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={`
              h-1 rounded-b-xl
              ${toast.type === 'error' ? 'bg-red-500/20' : 'bg-green-500/20'}
            `}>
              <div
                className={`
                  h-full rounded-b-xl
                  ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}
                  animate-progress
                `}
                style={{ animationDuration: '4000ms' }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8 p-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-surface-950 dark:text-white">
              Good Morning, {user.firstName || user.username}
            </h1>
            <p className="text-surface-500 font-medium">
              Here is what's happening in your court today.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white dark:bg-surface-900 p-1.5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <div className="px-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-surface-500">
                <span className={`inline-block w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></span>
                {isRefreshing ? 'Syncing...' : 'Real-time'}
              </span>
            </div>
            <button
              onClick={() => fetchDashboardData(false)}
              disabled={isRefreshing || loading}
              className="p-2 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 transition-all disabled:opacity-40 active:scale-95"
            >
              <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              label="Active Cases"
              value={stats.activeCases}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
              color="primary"
            />
            <StatCard
              label="Pending Hearings"
              value={stats.pendingHearings}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="blue"
            />
            <StatCard
              label="High Priority"
              value={stats.highPriorityCount}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              color="amber"
            />
            <StatCard
              label="Efficiency Index"
              value={`${stats.completionRate}%`}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              color="emerald"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Court Level Distribution */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-lg border border-surface-100 dark:border-surface-700 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Court Level Distribution</h3>
                    <p className="text-violet-200 text-xs">Active cases by court level</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-xl p-5 border border-primary-200 dark:border-blue-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Entry Level</span>
                    </div>
                    <h4 className="text-base font-semibold text-surface-900 dark:text-white mb-1">District Court</h4>
                    <p className="text-sm text-surface-600 dark:text-surface-300 mb-3">All new cases filed here</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-blue-400">{stats?.districtCourtCases || 0}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">Active cases</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-700 dark:to-slate-600 rounded-xl p-5 border border-amber-200 dark:border-amber-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Appellate Level</span>
                    </div>
                    <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-1">High Court</h3>
                    <p className="text-sm text-surface-600 dark:text-surface-300 mb-3">Escalated from District</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.highCourtCases || 0}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">Active cases</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-slate-700 dark:to-slate-600 rounded-xl p-5 border border-red-200 dark:border-red-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Final Level</span>
                    </div>
                    <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-1">Supreme Court</h3>
                    <p className="text-sm text-surface-600 dark:text-surface-300 mb-3">Highest appellate authority</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.supremeCourtCases || 0}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">Active cases</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Cases */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-lg border border-surface-100 dark:border-surface-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Recent Cases</h3>
                      <p className="text-indigo-200 text-xs">Latest activity in your court</p>
                    </div>
                  </div>
                  <Link to="/cases" className="text-white hover:underline text-sm font-medium">View All</Link>
                </div>
              </div>
              <div className="p-6">
                {recentCases.length > 0 ? (
                  <div className="divide-y divide-surface-100 dark:divide-surface-700">
                    {recentCases.map((caseItem) => (
                      <Link
                        key={caseItem.id}
                        to={`/cases/${caseItem.id}`}
                        className="flex items-center justify-between py-4 hover:bg-surface-50 dark:hover:bg-surface-700/50 px-4 -mx-4 rounded-xl transition-all group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                            {caseItem.caseNumber.split('-')[0].charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-surface-950 dark:text-white group-hover:text-primary-600 transition-colors">{caseItem.title}</h4>
                            <p className="text-sm text-surface-500">{caseItem.caseNumber} • {caseItem.courtLevel}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(caseItem.status)}`}>
                            {caseItem.status}
                          </span>
                          <svg className="w-5 h-5 text-surface-300 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-surface-500">No recent cases found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-lg border border-surface-100 dark:border-surface-700 p-6">
              <h3 className="text-xl font-bold text-surface-950 dark:text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                {(user.role === 'CLERK' || user.role === 'ADMIN') && (
                  <Link to="/cases/new" className="flex items-center space-x-3 p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all shadow-md shadow-primary-600/20 active:scale-95">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    <span className="font-bold">File New Case</span>
                  </Link>
                )}
                <Link to="/calendar" className="flex items-center space-x-3 p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-all active:scale-95">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="font-bold">Hearing Calendar</span>
                </Link>
                <Link to="/reports" className="flex items-center space-x-3 p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-all active:scale-95">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  <span className="font-bold">View Reports</span>
                </Link>
              </div>
            </div>

            {/* Escalation Overview Snippet */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-lg border border-surface-100 dark:border-surface-700 p-6">
              <h3 className="text-xl font-bold text-surface-950 dark:text-white mb-4">Priority Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl">
                  <span className="text-red-700 dark:text-red-400 font-bold">High Priority</span>
                  <span className="text-2xl font-black text-red-600">{stats?.highPriorityCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                  <span className="text-orange-700 dark:text-orange-400 font-bold">Escalated</span>
                  <span className="text-2xl font-black text-orange-600">{stats?.escalatedCases || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
