import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CaseOverview from './case-detail/CaseOverview';
import CaseDocuments from './case-detail/CaseDocuments';
import CaseNotes from './case-detail/CaseNotes';
import CaseTimeline from './case-detail/CaseTimeline';
import CaseAnalytics from './case-detail/CaseAnalytics';
import {
  StatusModal,
  HearingModal,
  PriorityModal,
  NoteModal,
  UploadModal,
  EscalateModal,
  DeescalateModal
} from './case-detail/CaseModals';

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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationLoading, setEscalationLoading] = useState(false);
  const [showDeescalateModal, setShowDeescalateModal] = useState(false);
  const [deescalationReason, setDeescalationReason] = useState('');
  const [deescalationLoading, setDeescalationLoading] = useState(false);
  const [advocates, setAdvocates] = useState([]);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/cases/${id}`);
        setCaseData(response.data);
        // Parse and set notes from case data
        const parsedNotes = parseNotes(response.data.notes);
        setNotes(parsedNotes);

        // Fetch documents from the new API endpoint
        await fetchDocuments(id);
      } catch (error) {
        setError('Failed to load case details');
        console.error('Error fetching case:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  // Fetch list of advocates for admin use
  useEffect(() => {
    if (user.role === 'ADMIN') {
      axios.get('http://localhost:8080/api/auth/advocates')
        .then(res => setAdvocates(res.data))
        .catch(() => setAdvocates([]));
    }
  }, [user.role]);

  const fetchDocuments = async (caseId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/documents/case/${caseId}`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
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

    // datetime-local gives us a string like "2026-02-13T14:30"
    // This is EXACTLY what the backend LocalDateTime expects!
    // DO NOT convert to Date object or use toISOString() - it causes timezone shifts

    // Validate the date is in the future
    const selectedDate = new Date(hearingDate);
    const today = new Date();

    if (selectedDate <= today) {
      showToast('Hearing date must be in the future', 'error');
      return;
    }

    setActionLoading(true);
    try {
      // Send the datetime-local string directly - no conversion needed!
      // Format is already "YYYY-MM-DDTHH:MM" which matches LocalDateTime
      await axios.put(`http://localhost:8080/api/cases/${id}/schedule`, {
        hearingDate: hearingDate  // Send the string directly!
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

      // Update notes state with newly parsed notes
      const parsedNotes = parseNotes(response.data.notes);
      setNotes(parsedNotes);

      // Update documents state with newly parsed documents
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
      const response = await axios.get(`http://localhost:8080/api/export/case/${id}/pdf`, {
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
      const response = await axios.get(`http://localhost:8080/api/export/case/${id}/pdf`, {
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

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('caseId', id);

      await axios.post('http://localhost:8080/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh documents using the new API endpoint
      await fetchDocuments(id);

      setShowUploadModal(false);
      setSelectedFile(null);
      showToast('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      showToast('Failed to upload document', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEscalateCase = async () => {
    if (!escalationReason.trim()) {
      showToast('Please enter a reason for escalation', 'error');
      return;
    }

    setEscalationLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/cases/${id}/escalate`, {
        reason: escalationReason
      });

      // Refresh case data to show updated case
      const response = await axios.get(`http://localhost:8080/api/cases/${id}`);
      setCaseData(response.data);

      // Update notes state with newly parsed notes
      const parsedNotes = parseNotes(response.data.notes);
      setNotes(parsedNotes);

      // Update documents state with newly parsed documents
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

      setShowEscalateModal(false);
      setEscalationReason('');
      showToast('Case escalated successfully');
    } catch (error) {
      console.error('Error escalating case:', error);
      const errorMessage = error.response?.data?.message || 'Failed to escalate case';
      showToast(errorMessage, 'error');
    } finally {
      setEscalationLoading(false);
    }
  };

  const handleDeescalateCase = async () => {
    if (!deescalationReason.trim()) {
      showToast('Please enter a reason for de-escalation', 'error');
      return;
    }

    setDeescalationLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/cases/${id}/deescalate`, {
        reason: deescalationReason
      });

      // Refresh case data to show updated case
      const response = await axios.get(`http://localhost:8080/api/cases/${id}`);
      setCaseData(response.data);

      // Update notes state with newly parsed notes
      const parsedNotes = parseNotes(response.data.notes);
      setNotes(parsedNotes);

      // Update documents state with newly parsed documents
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

      setShowDeescalateModal(false);
      setDeescalationReason('');
      showToast('Case de-escalated successfully');
    } catch (error) {
      console.error('Error de-escalating case:', error);
      const errorMessage = error.response?.data?.message || 'Failed to de-escalate case';
      showToast(errorMessage, 'error');
    } finally {
      setDeescalationLoading(false);
    }
  };

  const handleAssignAdvocate = async (advocateId) => {
    if (!advocateId) return;
    try {
      await axios.put(`http://localhost:8080/api/cases/${id}/assign-advocate`, null, {
        params: { advocateId }
      });
      const response = await axios.get(`http://localhost:8080/api/cases/${id}`);
      setCaseData(response.data);
      showToast('Advocate assigned successfully');
    } catch (error) {
      console.error('Error assigning advocate:', error);
      showToast('Failed to assign advocate', 'error');
    }
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
          {activeTab === 'overview' && (
            <CaseOverview
              caseData={caseData}
              documents={documents}
              notes={notes}
              user={user}
              actionLoading={actionLoading}
              advocates={advocates}
              onAssignAdvocate={handleAssignAdvocate}
              setShowStatusModal={setShowStatusModal}
              setShowHearingModal={setShowHearingModal}
              setShowNoteModal={setShowNoteModal}
              setShowEscalateModal={setShowEscalateModal}
              setShowDeescalateModal={setShowDeescalateModal}
              setShowPriorityModal={setShowPriorityModal}
            />
          )}

          {activeTab === 'documents' && (
            <CaseDocuments
              documents={documents}
              user={user}
              setShowUploadModal={setShowUploadModal}
            />
          )}

          {activeTab === 'notes' && (
            <CaseNotes
              notes={notes}
              user={user}
              setShowNoteModal={setShowNoteModal}
            />
          )}

          {activeTab === 'timeline' && (
            <CaseTimeline caseData={caseData} />
          )}

          {activeTab === 'analytics' && (
            <CaseAnalytics
              caseData={caseData}
              documents={documents}
              notes={notes}
              handleExportReport={handleExportReport}
              handleGeneratePDF={handleGeneratePDF}
              actionLoading={actionLoading}
            />
          )}
        </div>
      </div>

      <StatusModal
        show={showStatusModal}
        onClose={() => { setShowStatusModal(false); setSelectedStatus(''); }}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        onUpdate={handleUpdateStatus}
        loading={actionLoading}
      />

      <HearingModal
        show={showHearingModal}
        onClose={() => { setShowHearingModal(false); setHearingDate(''); }}
        hearingDate={hearingDate}
        setHearingDate={setHearingDate}
        onSchedule={handleScheduleHearing}
        loading={actionLoading}
      />

      <PriorityModal
        show={showPriorityModal}
        onClose={() => { setShowPriorityModal(false); setManualPriority(''); }}
        manualPriority={manualPriority}
        setManualPriority={setManualPriority}
        onSet={handleSetPriority}
        loading={actionLoading}
        currentPriority={caseData.priority}
      />

      <NoteModal
        show={showNoteModal}
        onClose={() => { setShowNoteModal(false); setNewNote(''); }}
        newNote={newNote}
        setNewNote={setNewNote}
        onAdd={handleAddNote}
        loading={actionLoading}
      />

      <UploadModal
        show={showUploadModal}
        onClose={() => { setShowUploadModal(false); setSelectedFile(null); }}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        onUpload={handleUploadDocument}
        loading={uploadLoading}
      />

      <EscalateModal
        show={showEscalateModal}
        onClose={() => { setShowEscalateModal(false); setEscalationReason(''); }}
        reason={escalationReason}
        setReason={setEscalationReason}
        onEscalate={handleEscalateCase}
        loading={escalationLoading}
        currentCourtLevel={caseData.courtLevel}
      />

      <DeescalateModal
        show={showDeescalateModal}
        onClose={() => { setShowDeescalateModal(false); setDeescalationReason(''); }}
        reason={deescalationReason}
        setReason={setDeescalationReason}
        onDeescalate={handleDeescalateCase}
        loading={deescalationLoading}
        currentCourtLevel={caseData.courtLevel}
      />

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
    </div>
  );
};

export default CaseDetail;
