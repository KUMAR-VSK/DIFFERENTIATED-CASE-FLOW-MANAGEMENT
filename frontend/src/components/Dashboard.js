import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../config/api';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title
);

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
  const [recentEvents, setRecentEvents] = useState([]);
  const [distribution, setDistribution] = useState({ status: {}, type: {} });

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
        axios.get(BASE_URL + '/api/cases/history/recent'),
      ];

      if (user.role === 'ADMIN' || user.role === 'JUDGE') {
        requests.push(axios.get(BASE_URL + '/api/cases/escalated'));
      }

      const responses = await Promise.allSettled(requests);

      if (responses[0].status === 'fulfilled') {
        const statsData = responses[0].value.data;
        setStats(prev => ({ ...prev, ...statsData }));
        setDistribution({
          status: statsData.statusDistribution || {},
          type: statsData.typeDistribution || {}
        });
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
      }

      if (responses[3].status === 'fulfilled') {
        setRecentEvents(responses[3].value.data);
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

  // WebSocket for real-time updates
  useEffect(() => {
    if (!user) return;

    let socket = null;
    let stompClient = null;

    try {
      socket = new SockJS(BASE_URL + '/ws-audit');
      stompClient = Stomp.over(socket);
      
      stompClient.connect({}, (frame) => {
        stompClient.subscribe('/topic/audits', (message) => {
          if (message.body) {
            const newEvent = JSON.parse(message.body);
            setRecentEvents(prev => [newEvent, ...prev].slice(0, 15));
            fetchDashboardData(true);
          }
        });
      }, (error) => {
        console.error('STOMP connection error:', error);
      });
    } catch (err) {
      console.error('Socket initialization failed:', err);
    }

    return () => {
      if (stompClient) stompClient.disconnect();
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user || authLoading) return;
    const interval = setInterval(() => fetchDashboardData(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, authLoading, fetchDashboardData]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
      case 'SCHEDULED': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700';
      case 'UNDER_REVIEW': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700';
      case 'FILED': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
      case 'DISMISSED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      case 'ESCALATED': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 8) return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
    if (priority >= 6) return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700';
    if (priority >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
    return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'CASE_CREATED': return '✨';
      case 'STATUS_CHANGED': return '🔄';
      case 'JUDGE_ASSIGNED': return '⚖️';
      case 'HEARING_SCHEDULED': return '📅';
      case 'NOTE_ADDED': return '📝';
      case 'COURT_ESCALATED': return '🚀';
      default: return '📍';
    }
  };

  const statusChartData = {
    labels: Object.keys(distribution.status).map(s => s.replace(/_/g, ' ')),
    datasets: [{
      label: 'Cases',
      data: Object.values(distribution.status),
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280', '#ef4444', '#f97316'],
      borderWidth: 0,
      hoverOffset: 15
    }]
  };

  const typeChartData = {
    labels: Object.keys(distribution.type).map(t => t.replace(/_/g, ' ')),
    datasets: [{
      label: 'Count',
      data: Object.values(distribution.type),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 font-medium">Loading dashboard...</p>
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
              bg-white dark:bg-slate-800 
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
                {/* Icon */}
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

                {/* Content */}
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
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                {/* Close Button */}
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

            {/* Progress bar */}
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


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-300 font-medium">
                  Differentiated Case Flow Management System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Welcome back, {user.firstName || user.username}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    {/* Live indicator */}
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className={`inline-block w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}></span>
                      {isRefreshing ? 'Refreshing...' : 'Live'}
                    </span>
                    {lastUpdated && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                    <button
                      onClick={() => fetchDashboardData(false)}
                      disabled={isRefreshing || loading}
                      title="Refresh now"
                      className="ml-1 p-1.5 rounded-lg bg-gray-100 hover:bg-indigo-100 dark:bg-slate-700 dark:hover:bg-indigo-800 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300 transition-colors disabled:opacity-40"
                    >
                      <svg className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-sm">
                    {(user.firstName || user.username).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Cases</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {stats.totalCases}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">All registered cases</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Filed Cases</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {stats.filedCases}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">Under processing</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Scheduled</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {stats.scheduledCases}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">With hearings</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {stats.completedCases}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">Successfully resolved</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Insights and Recent Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Analytics Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Distribution Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
                  <div className="h-[250px] flex items-center justify-center">
                    {Object.keys(distribution.status).length > 0 ? (
                      <Doughnut 
                        data={statusChartData} 
                        options={{ 
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } }
                        }} 
                      />
                    ) : (
                      <p className="text-sm text-gray-500">No status data available</p>
                    )}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Case Type Distribution</h3>
                  <div className="h-[250px]">
                    {Object.keys(distribution.type).length > 0 ? (
                      <Bar 
                        data={typeChartData} 
                        options={{ 
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
                        }} 
                      />
                    ) : (
                      <p className="text-sm text-gray-500">No type data available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Court Level Distribution (Refined) */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white">Court Level Distribution</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-xl border border-blue-100 dark:border-slate-600">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">District Court</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.districtCourtCases || 0}</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-slate-700 rounded-xl border border-amber-100 dark:border-slate-600">
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">High Court</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.highCourtCases || 0}</p>
                    </div>
                    <div className="p-4 bg-rose-50 dark:bg-slate-700 rounded-xl border border-rose-100 dark:border-slate-600">
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Supreme Court</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.supremeCourtCases || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Activity Feed Column */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden flex flex-col relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 dark:to-slate-900/50 pointer-events-none"></div>
              <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">System Activity</h3>
                  <p className="text-slate-400 text-xs">Real-time audit updates</p>
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[600px] p-4">
                {recentEvents.length > 0 ? (
                  <div className="space-y-4">
                    {recentEvents.map((event, idx) => (
                      <div key={event.id || idx} className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                        <div className="flex-shrink-0 text-xl">{getEventIcon(event.actionType)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {event.description}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                              {event.performedBy ? event.performedBy.username : 'System'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 py-16">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Waiting for activity...</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Real-time feed active</p>
                  </div>
                )}
              </div>
              <Link to="/reports" className="block text-center py-3 bg-slate-50 dark:bg-slate-700/50 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors border-t border-slate-100 dark:border-slate-600">
                VIEW FULL AUDIT LOG
              </Link>
            </div>
          </div>

          {/* Escalation Status */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Escalation Overview</h3>
                  <p className="text-orange-200 text-xs">Cases pending review</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700 hover:shadow-md transition-all duration-300 group hover:scale-[1.02]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Eligible for Escalation</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Meet criteria</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.escalationEligible || 0}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700 hover:shadow-md transition-all duration-300 group hover:scale-[1.02]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Currently Escalated</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">In appellate court</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.escalatedCases || 0}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-300 group hover:scale-[1.02]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Avg. Priority</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">All cases</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.averagePriority?.toFixed(1) || '0.0'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Cases */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden mb-8">
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
                    <p className="text-indigo-200 text-xs">Latest activities and updates</p>
                  </div>
                </div>
                <Link to="/cases" className="text-white/80 hover:text-white text-sm font-medium flex items-center space-x-1">
                  <span>View all</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentCases.length > 0 ? (
                <div className="space-y-3">
                  {recentCases.map((caseItem) => (
                    <Link
                      key={caseItem.id}
                      to={`/cases/${caseItem.id}`}
                      className="block p-4 rounded-xl border border-gray-100 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-400 hover:shadow-md hover:bg-indigo-50/50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {caseItem.caseNumber.slice(-2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors truncate">
                                {caseItem.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{caseItem.caseNumber}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(caseItem.status)}`}>
                              {caseItem.status.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(caseItem.priority)}`}>
                              P{caseItem.priority}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {caseItem.courtLevel || 'DISTRICT'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">No Cases Yet</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">File a new case to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Quick Actions</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(user.role === 'CLERK' || user.role === 'ADMIN') && (
                  <Link
                    to="/cases/new"
                    className="flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">New Case</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">File case</p>
                    </div>
                  </Link>
                )}

                <Link
                  to="/cases"
                  className="flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed border-emerald-200 dark:border-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Browse</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">All cases</p>
                  </div>
                </Link>

                <Link
                  to="/reports"
                  className="flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-600 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Reports</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Analytics</p>
                  </div>
                </Link>

                {user.role === 'ADMIN' && (
                  <Link
                    to="/users"
                    className="flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Users</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Management</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

