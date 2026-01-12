import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/cases/${id}`);
        setCaseData(response.data);
      } catch (error) {
        setError('Failed to load case details');
        console.error('Error fetching case:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading case details...</div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error || 'Case not found'}</p>
            </div>
          </div>
        </div>
        <Link
          to="/cases"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Cases
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Case Details</h1>
          <p className="text-gray-600 mt-1">Case #{caseData.caseNumber}</p>
        </div>
        <div className="flex gap-3">
          {(user.role === 'ADMIN' || user.role === 'JUDGE') && (
            <Link
              to={`/cases/${id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg"
            >
              Edit Case
            </Link>
          )}
          <Link
            to="/cases"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-lg"
          >
            Back to Cases
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Case Number</label>
                <p className="text-lg font-semibold text-gray-900">{caseData.caseNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Case Type</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCaseTypeColor(caseData.caseType)}`}>
                  {caseData.caseType}
                </span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <p className="text-xl font-semibold text-gray-900">{caseData.title}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-700 leading-relaxed">
                  {caseData.description || 'No description provided for this case.'}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Personnel */}
          {(caseData.assignedJudge || caseData.filingClerk) && (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Assigned Personnel</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {caseData.filingClerk && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Filing Clerk</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {caseData.filingClerk.firstName} {caseData.filingClerk.lastName}
                    </p>
                    <p className="text-sm text-gray-600">@{caseData.filingClerk.username}</p>
                  </div>
                )}
                {caseData.assignedJudge && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Assigned Judge</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {caseData.assignedJudge.firstName} {caseData.assignedJudge.lastName}
                    </p>
                    <p className="text-sm text-gray-600">@{caseData.assignedJudge.username}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Status & Timeline */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Status & Priority</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(caseData.status)}`}>
                  {caseData.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(caseData.priority)}`}>
                  Priority {caseData.priority}/10
                </span>
              </div>
              {caseData.resourceRequirement && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resource Requirements</label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {caseData.resourceRequirement}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-gray-700">Filing Date</span>
                <span className="text-sm text-gray-900">
                  {new Date(caseData.filingDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {caseData.hearingDate && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <span className="text-sm font-medium text-blue-700">Hearing Date</span>
                  <span className="text-sm text-blue-900">
                    {new Date(caseData.hearingDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {caseData.estimatedDurationDays && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <span className="text-sm font-medium text-green-700">Estimated Duration</span>
                  <span className="text-sm text-green-900">
                    {caseData.estimatedDurationDays} days
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium">
                Update Status
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium">
                Schedule Hearing
              </button>
              <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium">
                Add Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
