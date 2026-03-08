import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../config/api';

const CaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    description: '',
    caseType: 'CIVIL',
    courtLevel: 'DISTRICT',
    resourceRequirement: '',
    estimatedDurationDays: '',
  });
  const [selectedAdvocateId, setSelectedAdvocateId] = useState('');
  const [advocates, setAdvocates] = useState([]);
  const [advocatesLoading, setAdvocatesLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [createdCaseNumber, setCreatedCaseNumber] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewCaseNumber, setPreviewCaseNumber] = useState('Loading...');

  // Fetch registered advocates for the clerk to assign
  React.useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        const response = await axios.get(BASE_URL + '/api/auth/advocates');
        const advocateList = response.data;
        setAdvocates(advocateList);
      } catch (err) {
        console.error('Could not load advocates', err);
      } finally {
        setAdvocatesLoading(false);
      }
    };
    fetchAdvocates();
  }, []);

  // Fetch next case number for preview (only for new cases)
  React.useEffect(() => {
    const fetchNextCaseNumber = async () => {
      if (isEditing) return; // Don't fetch for editing mode

      try {
        const response = await axios.get(BASE_URL + '/api/cases/next-case-number');
        setPreviewCaseNumber(response.data.nextCaseNumber);
      } catch (error) {
        console.error('Error fetching next case number:', error);
        const year = new Date().getFullYear();
        setPreviewCaseNumber(`CASE-${year}-####`); // Fallback to placeholder
      }
    };

    fetchNextCaseNumber();
  }, [isEditing]);

  // Fetch existing case data if editing
  React.useEffect(() => {
    const fetchCase = async () => {
      if (!isEditing) return;

      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/cases/${id}`);
        const data = response.data;

        setFormData({
          caseNumber: data.caseNumber || '',
          title: data.title || '',
          description: data.description || '',
          caseType: data.caseType || 'CIVIL',
          courtLevel: data.courtLevel || 'DISTRICT',
          resourceRequirement: data.resourceRequirement || '',
          estimatedDurationDays: data.estimatedDurationDays || '',
        });

        // Restore pre-assigned advocate if any
        if (data.assignedAdvocate) {
          setSelectedAdvocateId(String(data.assignedAdvocate.id));
        }

        // Parse documents if they exist
        if (data.documents) {
          try {
            // Check if documents is a string (JSON) or already an object
            const docs = typeof data.documents === 'string' ? JSON.parse(data.documents) : data.documents;
            setDocuments(docs);
          } catch (e) {
            console.error("Failed to parse documents", e);
          }
        }
      } catch (error) {
        console.error('Error fetching case:', error);
        setError('Failed to load case details');
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id, isEditing]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        fileObj: file // Store the actual file object for upload
      }));
      setDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        fileObj: file
      }));
      setDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const uploadFiles = async (caseId, files) => {
    // Filter for files that have a fileObj (newly added files)
    const filesToUpload = files.filter(f => f.fileObj);
    if (filesToUpload.length === 0) return;

    const uploadPromises = filesToUpload.map(doc => {
      const formData = new FormData();
      formData.append('file', doc.fileObj);
      formData.append('caseId', caseId);

      return axios.post(BASE_URL + '/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    });

    await Promise.all(uploadPromises);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (isEditing && !formData.caseNumber.trim()) {
        throw new Error('Case number is required');
      }
      if (!formData.title.trim()) {
        throw new Error('Case title is required');
      }

      // clean documents for payload (remove file objects)
      const cleanDocuments = documents.map(({ fileObj, ...rest }) => rest);

      // Clean up the data - only include caseNumber for editing
      const payload = {
        ...(isEditing && { caseNumber: formData.caseNumber.trim() }),
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        caseType: formData.caseType,
        courtLevel: formData.courtLevel,
        resourceRequirement: formData.resourceRequirement.trim() || null,
        estimatedDurationDays: formData.estimatedDurationDays ? parseInt(formData.estimatedDurationDays) : null,
        documents: cleanDocuments.length > 0 ? JSON.stringify(cleanDocuments) : null,
      };

      console.log('Submitting case:', payload); // Debug log

      if (isEditing) {
        // Update existing case
        await axios.put(`${BASE_URL}/api/cases/${id}`, payload);

        // Upload new files
        await uploadFiles(id, documents);

        navigate('/cases', { state: { refresh: true } });
      } else {
        // Create new case — pass advocateId as a query param if selected
        const createUrl = selectedAdvocateId
          ? `${BASE_URL}/api/cases?advocateId=${selectedAdvocateId}`
          : BASE_URL + '/api/cases';
        const response = await axios.post(createUrl, payload);
        const createdCase = response.data;

        // Upload files
        if (documents.length > 0) {
          await uploadFiles(createdCase.id, documents);
        }

        // Show success message with generated case number
        setCreatedCaseNumber(createdCase.caseNumber);
        setShowSuccess(true);

        // Store refresh signal in localStorage for immediate refresh
        localStorage.setItem('caseRefreshTrigger', Date.now().toString());

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/cases', { state: { refresh: true, timestamp: Date.now() } });
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating case:', error);
      setError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'An error occurred while creating the case'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Case' : 'File New Case'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {isEditing ? 'Update case information' : 'Create a new case in the system'}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && createdCaseNumber && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-green-800">Case Filed Successfully!</h3>
              <div className="mt-2">
                <p className="text-sm text-green-700">
                  Your case has been created with the following details:
                </p>
                <div className="mt-3 bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Case Number:</p>
                      <p className="text-xl font-bold text-gray-900 font-mono">{createdCaseNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Auto-generated</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(createdCaseNumber)}
                        className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Copy to clipboard
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Redirecting to cases list in a few seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Case Details Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!isEditing && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-sm font-semibold text-indigo-800">Case Number Preview</span>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Auto-generated
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-indigo-300">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Your case will be assigned:</p>
                        <p className="text-2xl font-bold font-mono text-indigo-600">{previewCaseNumber}</p>
                        <p className="text-xs text-gray-400 mt-2">Format: CASE-YYYY-NNNN</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-1 text-xs text-indigo-700">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>This number will be confirmed upon successful case filing</span>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div>
                    <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Case Number *
                    </label>
                    <input
                      type="text"
                      id="caseNumber"
                      name="caseNumber"
                      required
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      value={formData.caseNumber}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">Case number cannot be modified</p>
                  </div>
                )}

                <div>
                  <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 mb-2">
                    Case Type *
                  </label>
                  <select
                    id="caseType"
                    name="caseType"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.caseType}
                    onChange={handleChange}
                  >
                    <option value="CONSTITUTIONAL">Constitutional</option>
                    <option value="CRIMINAL">Criminal</option>
                    <option value="CIVIL">Civil</option>
                    <option value="FAMILY">Family</option>
                    <option value="ADMINISTRATIVE">Administrative</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="courtLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    Court Level *
                  </label>
                  <select
                    id="courtLevel"
                    name="courtLevel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.courtLevel}
                    onChange={handleChange}
                  >
                    <option value="DISTRICT">District Court</option>
                    <option value="HIGH">High Court</option>
                    <option value="SUPREME">Supreme Court</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Case Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter case title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Brief title describing the case</p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Detailed description of the case"
                    value={formData.description}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional detailed description</p>
                </div>
              </div>
            </div>

            {/* Advocate Assignment Section */}
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Assign Advocate</h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">Select the advocate who will represent this case</p>
                </div>
              </div>

              {advocatesLoading ? (
                <div className="flex items-center space-x-2 text-purple-600 text-sm">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Loading registered advocates...</span>
                </div>
              ) : advocates.length === 0 ? (
                <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">No advocates registered yet</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Ask advocates to register using the sign-up page, then you can assign them to cases. You can still file the case now and assign an advocate later.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <select
                    id="advocate-select"
                    value={selectedAdvocateId}
                    onChange={(e) => setSelectedAdvocateId(e.target.value)}
                    className="w-full px-4 py-3 border border-purple-300 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">— No advocate assigned (assign later) —</option>
                    {advocates.map(adv => (
                      <option key={adv.id} value={String(adv.id)}>
                        {adv.firstName} {adv.lastName}  ·  @{adv.username}  ·  {adv.email}
                      </option>
                    ))}
                  </select>

                  {selectedAdvocateId && (() => {
                    const adv = advocates.find(a => String(a.id) === selectedAdvocateId);
                    return adv ? (
                      <div className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {adv.firstName.charAt(0)}{adv.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{adv.firstName} {adv.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{adv.username} · {adv.email}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mt-1">
                            ⚖️ Advocate
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedAdvocateId('')}
                          className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove advocate selection"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Additional Details Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="estimatedDurationDays" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (Days)
                  </label>
                  <input
                    type="number"
                    id="estimatedDurationDays"
                    name="estimatedDurationDays"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="30"
                    value={formData.estimatedDurationDays}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Expected duration in days</p>
                </div>

                <div>
                  <label htmlFor="resourceRequirement" className="block text-sm font-medium text-gray-700 mb-2">
                    Resource Requirements
                  </label>
                  <input
                    type="text"
                    id="resourceRequirement"
                    name="resourceRequirement"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Special resources needed"
                    value={formData.resourceRequirement}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Any special resources needed (optional)</p>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-dashed border-blue-300">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Supporting Documents</h3>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Case Documents
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-white'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                          onChange={handleFileSelect}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG, TXT up to 10MB each
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              {documents.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Uploaded Documents ({documents.length})</h4>
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 p-1"
                          onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Document Guidelines</h4>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>• Upload relevant case documents, evidence, or supporting materials</p>
                      <p>• Supported formats: PDF, Word documents, images, and text files</p>
                      <p>• Maximum file size: 10MB per document</p>
                      <p>• Documents will be securely stored and accessible to authorized personnel</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Update Case' : 'File Case'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/cases')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• Case numbers should be unique and follow your organization's naming convention</p>
              <p>• Select the appropriate case type from the dropdown</p>
              <p>• Provide a clear, concise title and detailed description</p>
              <p>• Estimated duration helps with scheduling and resource planning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseForm;
