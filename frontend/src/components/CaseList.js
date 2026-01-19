import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Checkbox,
  Card,
  CardContent,
  Alert,
  ThemeProvider,
  createTheme,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

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
      console.log('Fetching cases from API...');
      const response = await axios.get('http://localhost:8080/api/cases/management');
      console.log('Cases fetched successfully:', response.data.length, 'cases');
      setCases(response.data);
      setFilteredCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
      // Check if it's an authentication error
      if (error.response?.status === 403) {
        console.error('Authentication error - user may not be logged in');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Refresh data when navigating back to cases page
  useEffect(() => {
    let lastRefreshTime = 0;

    const handleFocus = () => {
      const now = Date.now();
      // Only refresh if it's been at least 1 second since last refresh
      if (now - lastRefreshTime > 1000) {
        console.log('Window focused, refreshing cases...');
        fetchCases();
        lastRefreshTime = now;
      }
    };

    // Refresh when component mounts (navigation) or when window gains focus
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Separate effect for location state changes
  useEffect(() => {
    if (location.state?.refresh || (location.state?.timestamp && Date.now() - location.state.timestamp < 5000)) {
      console.log('Location state refresh detected, fetching cases...', location.state);
      setLoading(true);
      fetchCases();
      // Clear the state to prevent repeated refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Force refresh when navigating from case form
  useEffect(() => {
    const handleNavigation = () => {
      console.log('Navigation detected, checking for refresh...');
      if (location.state?.refresh) {
        console.log('Force refreshing cases after navigation...');
        fetchCases();
      }
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleNavigation);

    // Also check on mount if we came from case form
    if (location.state?.refresh) {
      console.log('Component mounted with refresh state, fetching cases...');
      fetchCases();
    }

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [location.pathname, location.state]);

  // Add polling for real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing cases...');
      fetchCases();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen for localStorage refresh trigger
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'caseRefreshTrigger') {
        console.log('localStorage refresh trigger detected, fetching cases...');
        fetchCases();
        // Clear the trigger
        localStorage.removeItem('caseRefreshTrigger');
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    // Also check on mount if there's a pending refresh trigger
    const refreshTrigger = localStorage.getItem('caseRefreshTrigger');
    if (refreshTrigger) {
      console.log('Found pending refresh trigger on mount, fetching cases...');
      fetchCases();
      localStorage.removeItem('caseRefreshTrigger');
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    let filtered = cases;

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
      filtered = filtered.filter(caseItem =>
        caseItem.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        caseItem.caseNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        (caseItem.description && caseItem.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'filingDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredCases(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [cases, filters, sortConfig]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectCase = (caseId) => {
    setSelectedCases(prev =>
      prev.includes(caseId)
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCases.length === currentCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(currentCases.map(caseItem => caseItem.id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SCHEDULED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FILED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'DISMISSED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCaseTypeColor = (caseType) => {
    switch (caseType) {
      case 'CONSTITUTIONAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CRIMINAL':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CIVIL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FAMILY':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'ADMINISTRATIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 9) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (priority >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  // Pagination
  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Manual refresh function
  const handleManualRefresh = () => {
    setLoading(true);
    fetchCases();
  };

  // Calculate statistics
  const stats = {
    total: cases.length,
    filed: cases.filter(c => c.status === 'FILED').length,
    underReview: cases.filter(c => c.status === 'UNDER_REVIEW').length,
    scheduled: cases.filter(c => c.status === 'SCHEDULED').length,
    inProgress: cases.filter(c => c.status === 'IN_PROGRESS').length,
    completed: cases.filter(c => c.status === 'COMPLETED').length,
    highPriority: cases.filter(c => c.priority >= 8).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading cases...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Case Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and track all judicial cases in the system</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
            disabled={loading}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          {(user.role === 'CLERK' || user.role === 'ADMIN') && (
            <Link
              to="/cases/new"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              File New Case
            </Link>
          )}
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Filed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.filed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Under Review</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.underReview}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">High Priority</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highPriority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Filters & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="FILED">Filed</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Case Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.caseType}
              onChange={(e) => handleFilterChange('caseType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="CONSTITUTIONAL">Constitutional</option>
              <option value="CRIMINAL">Criminal</option>
              <option value="CIVIL">Civil</option>
              <option value="FAMILY">Family</option>
              <option value="ADMINISTRATIVE">Administrative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="1">1 (Lowest)</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5 (Medium)</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10 (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCases.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedCases.length} case{selectedCases.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                Export Selected
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors">
                Bulk Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentCases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
          >
            {/* Card Header with Checkbox */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-white text-white focus:ring-white bg-white/20"
                    checked={selectedCases.includes(caseItem.id)}
                    onChange={() => handleSelectCase(caseItem.id)}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono">
                      {caseItem.caseNumber}
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      Filed: {new Date(caseItem.filingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    getPriorityColor(caseItem.priority)
                  } bg-white/20 border-white/30 text-white`}>
                    Priority {caseItem.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors overflow-hidden">
                    {caseItem.title}
                  </h4>
                  {caseItem.description && (
                    <p className="text-gray-600 text-sm mt-2 overflow-hidden">
                      {caseItem.description}
                    </p>
                  )}
                </div>

                {/* Status and Type */}
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                    getStatusColor(caseItem.status)
                  }`}>
                    {caseItem.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                    getCaseTypeColor(caseItem.caseType)
                  }`}>
                    {caseItem.caseType}
                  </span>
                </div>

                {/* Filing Clerk Info */}
                {caseItem.filingClerk && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Filing Clerk: {caseItem.filingClerk.firstName} {caseItem.filingClerk.lastName}</span>
                  </div>
                )}

                {/* Judge Info */}
                {caseItem.assignedJudge && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Judge: {caseItem.assignedJudge.firstName} {caseItem.assignedJudge.lastName}</span>
                  </div>
                )}

                {/* Hearing Date */}
                {caseItem.hearingDate && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Hearing: {new Date(caseItem.hearingDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/cases/${caseItem.id}`}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </Link>

                  {(user.role === 'ADMIN' || user.role === 'JUDGE') && (
                    <Link
                      to={`/cases/${caseItem.id}/edit`}
                      className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstCase + 1}</span> to{' '}
              <span className="font-medium">{Math.min(indexOfLastCase, filteredCases.length)}</span> of{' '}
              <span className="font-medium">{filteredCases.length}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCases.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No cases found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {Object.values(filters).some(filter => filter !== '') ? 'Try adjusting your filters.' : 'Get started by filing a new case.'}
          </p>
          {(user.role === 'CLERK' || user.role === 'ADMIN') && (
            <div className="mt-6">
              <Link
                to="/cases/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                File New Case
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaseList;
