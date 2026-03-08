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
import BASE_URL from '../config/api';

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
  const [judges, setJudges] = useState([]);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/cases/${id}`);
        setCaseData(response.data);
        const parsedNotes = parseNotes(response.data.notes);
        setNotes(parsedNotes);
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

  useEffect(() => {
    if (user.role === 'ADMIN') {
      axios.get(BASE_URL + '/api/auth/advocates')
        .then(res => setAdvocates(res.data))
        .catch(() => setAdvocates([]));
      axios.get(BASE_URL + '/api/auth/users')
        .then(res => setJudges(res.data.filter(u => u.role === 'JUDGE')))
        .catch(() => setJudges([]));
    }
  }, [user.role]);

  const fetchDocuments = async (caseId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/documents/case/${caseId}`);
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
    if (caseData.status === 'COMPLETED') {
      showToast('Case is completed and cannot be updated', 'error');
      return;
    }
    if (!selectedStatus) {
      showToast('Please select a status', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/cases/${id}/status`, null, {
        params: { status: selectedStatus }
      });
      const response = await axios.get(`${BASE_URL}/api/cases/${id}`);
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
      await axios.put(`${BASE_URL}/api/cases/${id}/schedule`, {
        hearingDate: hearingDate
      });
      const response = await axios.get(`${BASE_URL}/api/cases/${id}`);
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
      const currentNotes = caseData.notes || '';
      const timestamp = new Date().toLocaleString();
      const updatedNotes = currentNotes
        ? `${currentNotes}\n\n[${timestamp}] ${newNote}`
        : `[${timestamp}] ${newNote}`;
      await axios.put(`${BASE_URL}/api/cases/${id}/notes`, { notes: updatedNotes });
      const response = await axios.get(`${BASE_URL}/api/cases/${id}`);
      setCaseData(response.data);
      const parsedNotes = parseNotes(response.data.notes);
      setNotes(parsedNotes);
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
      await axios.put(`${BASE_URL}/api/cases/${id}/set-priority`, null, {
        params: { priority: manualPriority }
      });
      const response = await axios.get(`${BASE_URL}/api/cases/${id}`);
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
      const response = await axios.get(`${BASE_URL}/api/export/case/${id}/pdf`, {
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
      const response = await axios.get(`${BASE_URL}/api/export/case/${id}/pdf`, {
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
      await axios.post(BASE_URL + '/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
      await axios.post(`${BASE_URL}/api/cases/${id}/escalate`, { reason: escalationReason });
      const response = await axios.get(`${BASE_URL}/api/cases/${id}`);
      setCaseData(response.data);
      const parsedNotes = parseNotes(response.data.notes);
      setNotes(parsedNotes);
      setShowEscalateModal(false);
      setEscalationReason('');
      showToast('Case escalated successfully');
    } catch (error) {
      console.error('Error escalating case:', error);
      showToast(error.response?.data?.message || 'Failed to escalate case', 'error');
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
      await axios.post(`${BASE_URL}/api/cases/${id}/deescalate`, { reason: deescalationReason });
      const response = await axios.get(`${BASE_URL}/api/cases/${id}`);
      setCaseData(response.data);
      const parsedNotes = parseNotes(response.data.notes);
      setNotes(parsedNotes);
      setShowDeescalateModal(false);
      setDeescalationReason('');
      showToast('Case de-escalated successfully');
    } catch (error) {
      console.error('Error de-escalating case:', error);
      showToast(error.response?.data?.message || 'Failed to de-escalate case', 'error');
    } finally {
      setDeescalationLoading(false);
    }
  };

  const handleAssignAdvocate = async (advocateId) => {
    if (!advocateId) return;
    try {
      await axios.put(`${BASE_URL}/api/cases/${id}/assign-advocate`, null, {
        params: { advocateId }
      });
      const response = await axios.get(`${BASE_URL}/api/cases/${id}`);
      setCaseData(response.data);
      showToast('Advocate assigned successfully');
    } catch (error) {
      console.error('Error assigning advocate:', error);
      showToast('Failed to assign advocate', 'error');
    }
  };

  const handleAssignJudge = async (judgeId) => {
    if (!judgeId) return;
    try {
      await axios.put(`${BASE_URL}/api/cases/${id}/assign-judge`, null, {
        params: { judgeId }
      });
      const response = await axios.get(`${BASE_URL}/api/cases/${id}`);
      setCaseData(response.data);
      showToast('Judge assigned successfully');
    } catch (error) {
      console.error('Error assigning judge:', error);
      showToast('Failed to assign judge', 'error');
    }
  };

  const handleTakeOverCase = async () => {
    try {
      await axios.put(`${BASE_URL}/api/cases/${id}/take-over`);
      const response = await axios.get(`${BASE_URL}/api/cases/${id}`);
      setCaseData(response.data);
      showToast('You have successfully taken over this case');
    } catch (error) {
      console.error('Error taking over case:', error);
      showToast('Failed to take over case', 'error');
    }
  };

  const handleDownloadHistoryPDF = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cases/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `case-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Case History PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading case history PDF:', error);
      showToast('Failed to download case history PDF', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-950">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-surface-500 font-black uppercase tracking-widest text-[10px]">Accessing Vault Records...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-10 bg-white dark:bg-surface-900 rounded-[40px] border border-red-100 dark:border-red-900/30 shadow-2xl text-center animate-fade-in">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-surface-950 dark:text-white mb-2">{error || 'Case Record Corrupted or Missing'}</h2>
        <p className="text-surface-500 mb-8 font-medium">The requested case file is currently inaccessible. Contact a district administrator for record auditing.</p>
        <Link to="/cases" className="inline-flex items-center gap-2 px-8 py-3 bg-surface-950 dark:bg-white text-white dark:text-surface-950 rounded-2xl font-black shadow-xl transition-all active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span>Return to Registry</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 p-4 lg:p-0">
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">

        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-5">
            <Link to="/cases" className="w-12 h-12 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Record View</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">{caseData.courtLevel}</span>
              </div>
              <h1 className="text-3xl font-black text-surface-950 dark:text-white tracking-tighter leading-tight flex items-center gap-3">
                {caseData.title}
              </h1>
              <p className="text-surface-500 font-mono text-sm mt-1 font-bold">{caseData.caseNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleDownloadHistoryPDF}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl text-surface-700 dark:text-surface-300 font-bold text-sm shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
              <span>Export Dossier</span>
            </button>
            {(user.role === 'ADMIN' || user.role === 'JUDGE') && (
              <Link
                to={`/cases/${id}/edit`}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-primary-500/20 transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                <span>Edit Record</span>
              </Link>
            )}
          </div>
        </div>

        {/* Multi-Matrix Navigation */}
        <div className="bg-white dark:bg-surface-900 rounded-[40px] border border-surface-200 dark:border-surface-800 shadow-2xl shadow-primary-500/5 overflow-hidden">
          <div className="flex p-2 bg-surface-50/50 dark:bg-surface-950/20 border-b border-surface-100 dark:border-surface-800 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { id: 'documents', label: 'Documents', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', count: documents.length },
              { id: 'notes', label: 'Field Notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', count: notes.length },
              { id: 'timeline', label: 'History Matrix', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'analytics', label: 'Analytics Engine', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 bg-white dark:bg-surface-900 shadow-[inset_0_-2px_0_rgba(37,99,235,1)]'
                  : 'border-transparent text-surface-400 hover:text-surface-900 dark:hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`w-5 h-5 flex items-center justify-center rounded-lg text-[10px] ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 font-bold'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-8 lg:p-12 animate-slide-up">
            {activeTab === 'overview' && (
              <CaseOverview
                caseData={caseData}
                documents={documents}
                notes={notes}
                user={user}
                actionLoading={actionLoading}
                advocates={advocates}
                judges={judges}
                onAssignAdvocate={handleAssignAdvocate}
                onAssignJudge={handleAssignJudge}
                onTakeOverCase={handleTakeOverCase}
                onDownloadHistoryPDF={handleDownloadHistoryPDF}
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
              <CaseTimeline caseData={caseData} notes={notes} documents={documents} />
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
      </div>

      {/* Modern Modals Container */}
      <div className="z-[9999] relative">
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
      </div>

      {/* Intelligent Toast Notifications */}
      {toast && (
        <div className="fixed top-8 right-8 z-[10000] animate-slide-in-right">
          <div className={`p-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-[28px] shadow-2xl overflow-hidden min-w-[340px]`}>
            <div className="flex items-center gap-4 p-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${toast.type === 'error' ? 'bg-red-500/10 text-red-500 shadow-lg shadow-red-500/20' : 'bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/20'}`}>
                {toast.type === 'error' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-surface-900 dark:text-white leading-tight">{toast.type === 'error' ? 'Audit Fail' : 'Record Change'}</p>
                <p className="text-xs text-surface-500 mt-0.5">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="w-8 h-8 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center justify-center text-surface-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetail;
