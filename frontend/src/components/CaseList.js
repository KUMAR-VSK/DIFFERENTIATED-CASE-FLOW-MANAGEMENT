import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
      const response = await axios.get('http://localhost:8081/api/cases');
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
    if (location.state?.refresh) {
      console.log('Location state refresh detected, fetching cases...');
      fetchCases();
      // Clear the state to prevent repeated refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading cases...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-4xl font-bold text-gray-900">Case Management</h1>
        <div className="flex gap-3">
          {(user.role === 'CLERK' || user.role === 'ADMIN') && (
            <Link
              to="/cases/new"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg"
            >
              File New Case
            </Link>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Filters & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search cases..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

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

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedCases.length === currentCases.length && currentCases.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('caseNumber')}
                >
                  Case Number
                  {sortConfig.key === 'caseNumber' && (
                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  Title
                  {sortConfig.key === 'title' && (
                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('priority')}
                >
                  Priority
                  {sortConfig.key === 'priority' && (
                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('filingDate')}
                >
                  Filing Date
                  {sortConfig.key === 'filingDate' && (
                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedCases.includes(caseItem.id)}
                      onChange={() => handleSelectCase(caseItem.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {caseItem.caseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {caseItem.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCaseTypeColor(caseItem.caseType)}`}>
                      {caseItem.caseType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(caseItem.priority)}`}>
                      {caseItem.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(caseItem.filingDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/cases/${caseItem.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View
                    </Link>
                    {(user.role === 'ADMIN' || user.role === 'JUDGE') && (
                      <Link
                        to={`/cases/${caseItem.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cases found</h3>
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
