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
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Parse notes from case data
  const parseNotes = (notesString) => {
    if (!notesString) return [];
    return notesString.split('\n\n').filter(note => note.trim()).map((note, index) => {
      const lines = note.split('\n');
      const firstLine = lines[0] || '';
      const timestampMatch = firstLine.match(/^\[([^\]]+)\]/);
      const timestamp = timestampMatch ? timestampMatch[1] : '';
      const content = timestampMatch ? lines.slice(1).join('\n') || firstLine.replace(/^\[[^\]]+\]\s*/, '') : firstLine;

      return {
        id: index,
        content: content.trim(),
        timestamp: timestamp,
        createdAt: timestamp ? new Date(timestamp) : new Date()
      };
    });
  };
  const [newNote, setNewNote] = useState('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [manualPriority, setManualPriority] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/cases/${id}`);
        setCaseData(response.data);
        // Parse and set notes from case data
        const parsedNotes = parseNotes(response.data.notes);
        setNotes(parsedNotes);

        // Parse documents from case data if available
        if (response.data.documents) {
          try {
            const parsedDocuments = JSON.parse(response.data.documents);
            setDocuments(parsedDocuments);
          } catch (error) {
            console.error('Error parsing documents:', error);
            setDocuments([]);
          }
        } else {
          setDocuments([]);
        }
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      showToast('Please select a status', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/cases/${id}/status`, null, {
        params: { status: selectedStatus }
      });

      // Refresh case data
      const response = await axios.get(`http://localhost:8080/api/cases/${id}`);
      setCaseData(response.data);
      setShowStatusModal(false);
      setSelectedStatus('');
      showToast('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update case status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleHearing = async () => {
    if (!hearingDate) {
      showToast('Please select a hearing date', 'error');
      return;
    }

    const selectedDate = new Date(hearingDate);
    const today = new Date();

    if (selectedDate <= today) {
      showToast('Hearing date must be in the future', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/cases/${id}/schedule`, {
        hearingDate: selectedDate.toISOString()
      });

      // Refresh case data
      const response = await axios.get(`http://localhost:8080/api/cases/${id}`);
      setCaseData(response.data);
      setShowHearingModal(false);
      setHearingDate('');
      showToast('Hearing scheduled successfully');
    } catch (error) {
      console.error('Error scheduling hearing:', error);
      showToast('Failed to schedule hearing', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      showToast('Please enter a note', 'error');
      return;
    }

    setActionLoading(true);
    try {
      // Get current notes and append new note with timestamp
      const currentNotes = caseData.notes || '';
      const timestamp = new Date().toLocaleString();
      const updatedNotes = currentNotes
        ? `${currentNotes}\n\n[${timestamp}] ${newNote}`
        : `[${timestamp}] ${newNote}`;

      await axios.put(`http://localhost:8080/api/cases/${id}/notes`, { notes: updatedNotes });

      // Refresh case data to show updated notes
      const response = await axios.get(`http://localhost:8080/api/cases/${id}`);
      setCaseData(response.data);
      setNewNote('');
      setShowNoteModal(false);

      showToast('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      showToast('Failed to add note', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPriority = async () => {
    if (!manualPriority || manualPriority < 1 || manualPriority > 10) {
      showToast('Please select a valid priority (1-10)', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/cases/${id}/set-priority`, null, {
        params: { priority: manualPriority }
      });

      // Refresh case data
      const response = await axios.get(`http://localhost:8080/api/cases/${id}`);
      setCaseData(response.data);
      setShowPriorityModal(false);
      setManualPriority('');
      showToast('Priority updated successfully');
    } catch (error) {
      console.error('Error setting priority:', error);
      showToast('Failed to update case priority', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportReport = async () => {
    setActionLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/cases/${id}/report`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `case-report-${id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      showToast('Failed to export report', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setActionLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/cases/${id}/pdf`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `case-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const statusOptions = [
    { value: 'FILED', label: 'Filed', description: 'Case has been filed and is awaiting review' },
    { value: 'UNDER_REVIEW', label: 'Under Review', description: 'Case is being reviewed by court staff' },
    { value: 'SCHEDULED', label: 'Scheduled', description: 'Hearing or trial date has been set' },
    { value: 'IN_PROGRESS', label: 'In Progress', description: 'Case proceedings are currently active' },
    { value: 'COMPLETED', label: 'Completed', description: 'Case has been resolved' },
    { value: 'DISMISSED', label: 'Dismissed', description: 'Case has been dismissed' }
  ];

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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error || 'Case not found'}</p>
            </div>
          </div>
        </div>
        <Link
          to="/cases"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600"
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Case Details</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Case #{caseData.caseNumber}</p>
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

      {/* Tabbed Navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 transition-colors duration-300">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'documents', label: 'Documents', icon: '📄', count: documents.length },
              { id: 'notes', label: 'Notes', icon: '📝', count: notes.length },
              { id: 'timeline', label: 'Timeline', icon: '⏰' },
              { id: 'analytics', label: 'Analytics', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-6 transition-colors duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <svg className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clipRule="evenodd" />
                    </svg>
                    Case Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Number</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">{caseData.caseNumber}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Type</label>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCaseTypeColor(caseData.caseType)}`}>
                            {caseData.caseType.replace('_', ' ')}
                          </span>
                          {caseData.caseType === 'CONSTITUTIONAL' && '⚖️'}
                          {caseData.caseType === 'CRIMINAL' && '🚔'}
                          {caseData.caseType === 'CIVIL' && '🏛️'}
                          {caseData.caseType === 'FAMILY' && '👨‍👩‍👧‍👦'}
                          {caseData.caseType === 'ADMINISTRATIVE' && '📋'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(caseData.status)}`}>
                          {caseData.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(caseData.priority)}`}>
                          Priority {caseData.priority}/10
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Case Title</label>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{caseData.title}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-slate-800 p-4 rounded-md border dark:border-slate-600 transition-colors duration-300">
                        {caseData.description || 'No description provided for this case.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center transition-colors duration-300">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{caseData.priority}/10</div>
                    <div className="text-sm text-blue-600 dark:text-blue-300">Priority Level</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center transition-colors duration-300">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{documents.length}</div>
                    <div className="text-sm text-green-600 dark:text-green-300">Documents</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center transition-colors duration-300">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{notes.length}</div>
                    <div className="text-sm text-purple-600 dark:text-purple-300">Case Notes</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center transition-colors duration-300">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {caseData.estimatedDurationDays || 'N/A'}
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-300">Est. Days</div>
                  </div>
                </div>

                {/* Assigned Personnel */}
                {(caseData.assignedJudge || caseData.filingClerk) && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <svg className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Assigned Personnel
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {caseData.filingClerk && (
                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 border-l-4 border-gray-400 dark:border-gray-500">
                          <div className="flex items-center">
                            <div className="bg-gray-400 dark:bg-gray-600 rounded-full p-2 mr-3">
                              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Filing Clerk</h4>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {caseData.filingClerk.firstName} {caseData.filingClerk.lastName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">@{caseData.filingClerk.username}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {caseData.assignedJudge && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-400 dark:border-blue-500">
                          <div className="flex items-center">
                            <div className="bg-blue-500 dark:bg-blue-600 rounded-full p-2 mr-3">
                              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">Assigned Judge</h4>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {caseData.assignedJudge.firstName} {caseData.assignedJudge.lastName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">@{caseData.assignedJudge.username}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Status & Timeline */}
              <div className="space-y-6">
                {/* Status & Priority */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Status & Priority</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(caseData.status)}`}>
                        {caseData.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(caseData.priority)}`}>
                          Priority {caseData.priority}/10
                        </span>
                        {(user.role === 'ADMIN' || user.role === 'CLERK') && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowPriorityModal(true)}
                              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors duration-200"
                              title="Set manual priority"
                            >
                              Set
                            </button>
                            <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors duration-200" title="Recalculate priority automatically">
                              Auto
                            </button>
                          </div>
                        )}
                      </div>
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
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-lg p-6 border-2 border-indigo-200">
                  <h2 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                    <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Actions
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Available Now
                    </span>
                  </h2>

                  {/* Debug Info */}
                  <div className="mb-4 p-3 bg-white rounded-md border border-indigo-200">
                    <p className="text-sm text-indigo-700">
                      <strong>Current User Role:</strong> {user?.role || 'Not logged in'}
                    </p>
                    <p className="text-xs text-indigo-600 mt-1">
                      Quick actions are available based on your role permissions.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Status Update - ADMIN/JUDGE only */}
                    {(user.role === 'ADMIN' || user.role === 'JUDGE') ? (
                      <button
                        onClick={() => setShowStatusModal(true)}
                        disabled={actionLoading}
                        className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center justify-center shadow-md"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {actionLoading ? 'Updating...' : 'Update Status'}
                      </button>
                    ) : (
                      <div className="w-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Status Update (Admin/Judge Only)
                      </div>
                    )}

                    {/* Schedule Hearing - ADMIN/JUDGE only */}
                    {(user.role === 'ADMIN' || user.role === 'JUDGE') ? (
                      <button
                        onClick={() => setShowHearingModal(true)}
                        disabled={actionLoading}
                        className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center justify-center shadow-md"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {actionLoading ? 'Scheduling...' : 'Schedule Hearing'}
                      </button>
                    ) : (
                      <div className="w-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Schedule Hearing (Admin/Judge Only)
                      </div>
                    )}

                    {/* Add Notes - JUDGE only */}
                    {user.role === 'JUDGE' ? (
                      <button
                        onClick={() => setShowNoteModal(true)}
                        disabled={actionLoading}
                        className="w-full bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center justify-center shadow-md"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {actionLoading ? 'Adding...' : 'Add Notes'}
                      </button>
                    ) : (
                      <div className="w-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Add Notes (Judge Only)
                      </div>
                    )}

                    {/* Help Text */}
                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-200 dark:border-indigo-800">
                      <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-2">Available Actions:</h4>
                      <ul className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                        <li>• <strong>Admins/Judges:</strong> Update status, schedule hearings</li>
                        <li>• <strong>Judges:</strong> Add case notes</li>
                        <li>• <strong>All Roles:</strong> View case details and history</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clipRule="evenodd" />
                  </svg>
                  Case Documents ({documents.length})
                </h2>
                {(user.role === 'CLERK' || user.role === 'ADMIN') && (
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                    Upload Document
                  </button>
                )}
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                  <p className="mt-1 text-sm text-gray-500">No documents have been uploaded for this case yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((doc, index) => (
                    <div key={doc.id || index} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow duration-200 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 mr-3 transition-colors">
                            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.originalFileName}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {doc.fileType} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {new Date(doc.uploadDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end gap-3">
                        <button
                          onClick={() => window.open(doc.url, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Case Notes ({notes.length})
                </h2>
                {user.role === 'JUDGE' && (
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    Add Note
                  </button>
                )}
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
                  <p className="mt-1 text-sm text-gray-500">No notes have been added to this case yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {notes.map((note, index) => (
                    <div key={note.id || index} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2 mr-3 transition-colors">
                            <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Note #{notes.length - index}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(note.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Case Timeline
              </h2>

              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700"></div>

                  {/* Filing Event */}
                  <div className="relative flex items-start">
                    <div className="bg-blue-500 rounded-full p-2 mr-4">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 flex-1 transition-colors">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Case Filed</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Case was filed in the system
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(caseData.filingDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Status Events */}
                  {caseData.status !== 'FILED' && (
                    <div className="relative flex items-start mt-6">
                      <div className="bg-yellow-500 rounded-full p-2 mr-4">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 flex-1 transition-colors">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Status Changed</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Status updated to {caseData.status.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(caseData.updatedAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hearing Scheduled */}
                  {caseData.hearingDate && (
                    <div className="relative flex items-start mt-6">
                      <div className="bg-green-500 rounded-full p-2 mr-4">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 flex-1 transition-colors">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Hearing Scheduled</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Hearing date has been set
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(caseData.hearingDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Case Analytics & Insights
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportReport}
                    disabled={actionLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {actionLoading ? 'Generating...' : 'Export Report'}
                  </button>
                  <button
                    onClick={handleGeneratePDF}
                    disabled={actionLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {actionLoading ? 'Generating...' : 'Generate PDF'}
                  </button>
                </div>
              </div>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg p-6 border border-blue-200 dark:border-blue-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Priority Level</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{caseData.priority}/10</p>
                      <div className="mt-2">
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(caseData.priority / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-500 rounded-full p-3">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 rounded-lg p-6 border border-green-200 dark:border-green-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-300">Documents</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">{documents.length}</p>
                      <p className="text-xs text-green-500 mt-1">
                        {documents.length > 0 ? 'Documents available' : 'No documents uploaded'}
                      </p>
                    </div>
                    <div className="bg-green-500 rounded-full p-3">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg p-6 border border-purple-200 dark:border-purple-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Case Notes</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{notes.length}</p>
                      <p className="text-xs text-purple-500 mt-1">
                        {notes.length > 0 ? 'Notes available' : 'No notes added yet'}
                      </p>
                    </div>
                    <div className="bg-purple-500 rounded-full p-3">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/40 rounded-lg p-6 border border-orange-200 dark:border-orange-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-300">Case Age</p>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                        {Math.floor((new Date() - new Date(caseData.filingDate)) / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-xs text-orange-500 mt-1">days since filing</p>
                    </div>
                    <div className="bg-orange-500 rounded-full p-3">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 transition-colors">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Case Health Score
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Documentation</span>
                      <span className="text-sm font-medium text-green-600">
                        {documents.length > 0 ? 'Complete' : 'Missing'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Judge Assignment</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {caseData.assignedJudge ? 'Assigned' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Hearing Scheduled</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {caseData.hearingDate ? 'Scheduled' : 'Pending'}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Score</span>
                        <span className="text-lg font-bold text-green-600">
                          {Math.round(((documents.length > 0 ? 1 : 0) +
                            (caseData.assignedJudge ? 1 : 0) +
                            (caseData.hearingDate ? 1 : 0)) / 3 * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 transition-colors">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Processing Efficiency
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span>Status Progress</span>
                        <span>{caseData.status.replace('_', ' ')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${caseData.status === 'COMPLETED' ? 'bg-green-600' :
                            caseData.status === 'IN_PROGRESS' ? 'bg-blue-600' :
                              caseData.status === 'SCHEDULED' ? 'bg-yellow-600' :
                                'bg-gray-600'
                            }`}
                          style={{
                            width:
                              caseData.status === 'COMPLETED' ? '100%' :
                                caseData.status === 'IN_PROGRESS' ? '75%' :
                                  caseData.status === 'SCHEDULED' ? '50%' :
                                    caseData.status === 'UNDER_REVIEW' ? '25%' : '10%'
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p><strong>Estimated Duration:</strong> {caseData.estimatedDurationDays || 'N/A'} days</p>
                        <p><strong>Days Elapsed:</strong> {Math.floor((new Date() - new Date(caseData.filingDate)) / (1000 * 60 * 60 * 24))} days</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 transition-colors">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="h-5 w-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                    Case Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Case Type</span>
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{caseData.caseType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Priority</span>
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Level {caseData.priority}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Status Updates</span>
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">1 update</span>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Case created on {new Date(caseData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 transition-colors">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
                  <div className="space-y-2">
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((level) => (
                      <div key={level} className="flex items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300 w-8">{level}</span>
                        <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2 mx-2">
                          <div
                            className={`h-2 rounded-full ${caseData.priority >= level ? 'bg-indigo-600' : 'bg-gray-300'}`}
                            style={{ width: caseData.priority >= level ? '100%' : '0%' }}
                          ></div>
                        </div>
                        {caseData.priority === level && (
                          <span className="text-xs text-indigo-600 font-medium">Current</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 transition-colors">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Case Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span>Case Status</span>
                        <span>{caseData.status.replace('_', ' ')}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${caseData.status === 'COMPLETED' ? 'bg-green-600' :
                            caseData.status === 'IN_PROGRESS' ? 'bg-blue-600' :
                              caseData.status === 'SCHEDULED' ? 'bg-yellow-600' :
                                'bg-gray-600'
                            }`}
                          style={{
                            width:
                              caseData.status === 'COMPLETED' ? '100%' :
                                caseData.status === 'IN_PROGRESS' ? '75%' :
                                  caseData.status === 'SCHEDULED' ? '50%' :
                                    caseData.status === 'UNDER_REVIEW' ? '25%' : '10%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Update Case Status</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a status...</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {selectedStatus && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {statusOptions.find(opt => opt.value === selectedStatus)?.description}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedStatus('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={!selectedStatus || actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Hearing Modal */}
      {showHearingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Schedule Hearing</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Hearing Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Select a date and time for the hearing (must be in the future)
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowHearingModal(false);
                    setHearingDate('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleHearing}
                  disabled={!hearingDate || actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Scheduling...' : 'Schedule Hearing'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Priority Modal */}
      {showPriorityModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Set Case Priority</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Priority Level (1-10)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setManualPriority(priority)}
                      className={`p-2 text-sm font-medium rounded-md border transition-colors duration-200 ${manualPriority === priority
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600'
                        }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Current priority: {caseData.priority}/10 • Higher numbers = higher priority
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPriorityModal(false);
                    setManualPriority('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetPriority}
                  disabled={!manualPriority || actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Setting...' : 'Set Priority'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Case Note</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Note Content
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter your case note..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Add observations, decisions, or important information about this case
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setNewNote('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 ${toast.type === 'error' ? 'border-red-200' : 'border-green-200'
            }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'error' ? (
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${toast.type === 'error' ? 'text-red-800' : 'text-green-800'
                    }`}>
                    {toast.type === 'error' ? 'Error' : 'Success'}
                  </p>
                  <p className={`mt-1 text-sm ${toast.type === 'error' ? 'text-red-700' : 'text-green-700'
                    }`}>
                    {toast.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => setToast(null)}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${toast.type === 'error'
                      ? 'text-red-500 hover:bg-red-50 focus:ring-red-600'
                      : 'text-green-500 hover:bg-green-50 focus:ring-green-600'
                      }`}
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetail;
