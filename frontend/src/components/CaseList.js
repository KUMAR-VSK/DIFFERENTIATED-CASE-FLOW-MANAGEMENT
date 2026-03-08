import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getStatusColor, getPriorityColor, getCaseTypeColor } from '../utils/caseHelpers';
import BASE_URL from '../config/api';

const CaseList = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCases, setSelectedCases] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'filingDate', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    caseType: '',
    search: '',
    priority: '',
  });
  const casesPerPage = 10;

  const fetchCases = async () => {
    try {
      let response;
      if (user.role === 'ADVOCATE') {
        response = await axios.get(`${BASE_URL}/api/cases/advocate/${user.id}`);
      } else {
        response = await axios.get(BASE_URL + '/api/cases/management');
      }
      setCases(response.data);
      setFilteredCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (location.state?.refresh || (location.state?.timestamp && Date.now() - location.state.timestamp < 5000)) {
      fetchCases();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let filtered = [...cases];

    if (filters.status) {
      filtered = filtered.filter(caseItem => caseItem.status === filters.status);
    }

    if (filters.caseType) {
      filtered = filtered.filter(caseItem => caseItem.caseType === filters.caseType);
    }

    if (filters.priority) {
      const priorityNum = parseInt(filters.priority);
      filtered = filtered.filter(caseItem => caseItem.priority === priorityNum);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(caseItem =>
        caseItem.title.toLowerCase().includes(searchLower) ||
        caseItem.caseNumber.toLowerCase().includes(searchLower) ||
        (caseItem.description && caseItem.description.toLowerCase().includes(searchLower))
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'filingDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCases(filtered);
    setCurrentPage(1);
  }, [cases, filters, sortConfig]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectCase = (caseId) => {
    setSelectedCases(prev =>
      prev.includes(caseId) ? prev.filter(id => id !== caseId) : [...prev, caseId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCases(currentCases.map(c => c.id));
    } else {
      setSelectedCases([]);
    }
  };

  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const stats = {
    total: cases.length,
    filed: cases.filter(c => c.status === 'FILED').length,
    scheduled: cases.filter(c => c.status === 'SCHEDULED' || c.status === 'IN_PROGRESS').length,
    completed: cases.filter(c => c.status === 'COMPLETED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-surface-600 dark:text-surface-400 font-medium">Synchronizing records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 pb-20 p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/20 rotate-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-surface-950 dark:text-white tracking-tight">Case Repository</h1>
            </div>
            <p className="text-surface-500 font-medium">Manage and track judicial proceedings across levels.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchCases()}
              className="p-3 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-50 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {(user.role === 'CLERK' || user.role === 'ADMIN') && (
              <Link
                to="/cases/new"
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/20 transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                <span>New Case</span>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Insights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Managed', value: stats.total, color: 'primary', icon: 'folder' },
            { label: 'Filed Today', value: stats.filed, color: 'blue', icon: 'file' },
            { label: 'Ongoing Hearings', value: stats.scheduled, color: 'amber', icon: 'calendar' },
            { label: 'Resolved Cases', value: stats.completed, color: 'emerald', icon: 'check' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-surface-900 p-6 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden relative group">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-surface-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-surface-950 dark:text-white tabular-nums">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                  {stat.icon === 'folder' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
                  {stat.icon === 'file' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  {stat.icon === 'calendar' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  {stat.icon === 'check' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary-500/5 rounded-full group-hover:scale-150 transition-transform"></div>
            </div>
          ))}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-surface-900 rounded-[32px] border border-surface-200 dark:border-surface-800 shadow-sm p-2">
          <div className="flex flex-col lg:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <svg className="w-5 h-5 text-surface-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title or case number..."
                className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-surface-900 dark:text-white placeholder-surface-400 font-medium"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="h-8 w-px bg-surface-100 dark:bg-surface-800 hidden lg:block"></div>

            <div className="flex items-center gap-2 p-2 w-full lg:w-auto">
              <select
                className="flex-1 lg:w-40 bg-surface-50 dark:bg-surface-800 border-none rounded-2xl py-2 px-4 text-sm font-bold text-surface-700 dark:text-surface-300 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none text-center"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Status: All</option>
                <option value="FILED">Filed</option>
                <option value="UNDER_REVIEW">Review</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">Ongoing</option>
                <option value="COMPLETED">Resolved</option>
              </select>

              <select
                className="flex-1 lg:w-40 bg-surface-50 dark:bg-surface-800 border-none rounded-2xl py-2 px-4 text-sm font-bold text-surface-700 dark:text-surface-300 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none text-center"
                value={filters.caseType}
                onChange={(e) => handleFilterChange('caseType', e.target.value)}
              >
                <option value="">Type: All</option>
                <option value="CIVIL">Civil</option>
                <option value="CRIMINAL">Criminal</option>
                <option value="FAMILY">Family</option>
                <option value="CONSTITUTIONAL">Constitutional</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-surface-900 rounded-[40px] border border-surface-200 dark:border-surface-800 shadow-2xl overflow-hidden shadow-primary-500/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800">
                  <th className="px-8 py-6">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-surface-300 text-primary-600 focus:ring-primary-500/20 cursor-pointer"
                      checked={selectedCases.length === currentCases.length && currentCases.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-6 text-xs font-black text-surface-400 uppercase tracking-widest">Identification</th>
                  <th className="px-6 py-6 text-xs font-black text-surface-400 uppercase tracking-widest text-center">Lifecycle</th>
                  <th className="px-6 py-6 text-xs font-black text-surface-400 uppercase tracking-widest text-center">Prioritization</th>
                  <th className="px-8 py-6 text-xs font-black text-surface-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50">
                {currentCases.length > 0 ? (
                  currentCases.map((caseItem) => (
                    <tr
                      key={caseItem.id}
                      className={`group hover:bg-slate-50/80 dark:hover:bg-surface-800/30 transition-all duration-300 ${selectedCases.includes(caseItem.id) ? 'bg-primary-50/30' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-lg border-surface-300 text-primary-600 focus:ring-primary-500/20 cursor-pointer"
                          checked={selectedCases.includes(caseItem.id)}
                          onChange={() => handleSelectCase(caseItem.id)}
                        />
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-sm group-hover:scale-110 transition-transform shadow-sm">
                            {caseItem.caseNumber.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-base font-bold text-surface-950 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">{caseItem.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-mono font-bold text-slate-400">{caseItem.caseNumber}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className={`text-[10px] font-black uppercase tracking-tight ${getCaseTypeColor(caseItem.caseType)} opacity-80`}>{caseItem.caseType}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col items-center">
                          <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 ${getStatusColor(caseItem.status)} shadow-sm`}>
                            {caseItem.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-surface-700 dark:text-surface-300">P{caseItem.priority}</span>
                            <div className="w-16 h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${caseItem.priority > 7 ? 'bg-red-500' : caseItem.priority > 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${caseItem.priority * 10}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link
                          to={`/cases/${caseItem.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-900 hover:bg-black dark:bg-surface-800 dark:hover:bg-surface-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 group/btn"
                        >
                          <span>Review</span>
                          <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="w-20 h-20 bg-surface-50 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-surface-950 dark:text-white mb-2">No matching cases found</h3>
                      <p className="text-surface-500 max-w-sm mx-auto font-medium">We couldn't find any records matching your search criteria. Try broadening your filters.</p>
                      <button
                        onClick={() => setFilters({ status: '', caseType: '', search: '', priority: '' })}
                        className="mt-6 px-6 py-2 bg-primary-100 text-primary-700 font-bold rounded-xl hover:bg-primary-200 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-surface-50/50 dark:bg-surface-900/50 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-surface-100 dark:border-surface-800">
              <p className="text-sm font-bold text-surface-500 uppercase tracking-tighter">
                Showing <span className="text-surface-950 dark:text-white">{indexOfFirstCase + 1} - {Math.min(indexOfLastCase, filteredCases.length)}</span> of <span className="text-surface-950 dark:text-white">{filteredCases.length}</span> results
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 disabled:opacity-30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex gap-1.5 mx-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`w-10 h-10 rounded-xl font-black transition-all ${currentPage === i + 1 ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white dark:bg-surface-800 text-surface-500 hover:bg-surface-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 disabled:opacity-30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseList;
