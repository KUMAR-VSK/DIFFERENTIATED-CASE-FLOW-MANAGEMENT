import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Priority calculation logic (matches backend PriorityEngine)
const calculatePriorityPreview = (caseType, resourceRequirement, estimatedDurationDays) => {
  let basePriority = 5; // Default medium priority

  // Case type weights
  switch (caseType) {
    case 'CONSTITUTIONAL':
      basePriority += 3;
      break;
    case 'CRIMINAL':
      basePriority += 2;
      break;
    case 'FAMILY':
      basePriority += 1;
      break;
    case 'CIVIL':
      basePriority += 0;
      break;
    case 'ADMINISTRATIVE':
      basePriority -= 1;
      break;
  }

  // Resource requirements
  if (resourceRequirement) {
    const req = resourceRequirement.toLowerCase();
    if (req.includes('urgent') || req.includes('emergency')) {
      basePriority += 2;
    }
    if (req.includes('special expertise') || req.includes('complex')) {
      basePriority += 1;
    }
  }

  // Estimated duration impact
  if (estimatedDurationDays) {
    if (estimatedDurationDays <= 7) {
      basePriority += 1;
    } else if (estimatedDurationDays > 90) {
      basePriority -= 1;
    }
  }

  return Math.max(1, Math.min(10, basePriority));
};

const getPriorityColor = (priority) => {
  if (priority >= 9) return 'bg-red-100 text-red-800 border-red-200';
  if (priority >= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (priority >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
};

const getPriorityLabel = (priority) => {
  if (priority >= 9) return 'Critical Priority';
  if (priority >= 7) return 'High Priority';
  if (priority >= 5) return 'Medium Priority';
  return 'Low Priority';
};

const CaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    description: '',
    caseType: 'CIVIL',
    resourceRequirement: '',
    estimatedDurationDays: '',
    plaintiffName: '',
    defendantName: '',
    courtType: '',
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-generate case number
  useEffect(() => {
    if (!isEditing && !formData.caseNumber) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const generatedNumber = `CASE-${year}${month}-${random}`;
      setFormData(prev => ({ ...prev, caseNumber: generatedNumber }));
    }
  }, [isEditing, formData.caseNumber]);

  // Calculate priority preview
  const priorityPreview = calculatePriorityPreview(
    formData.caseType,
    formData.resourceRequirement,
    formData.estimatedDurationDays ? parseInt(formData.estimatedDurationDays) : null
  );

  const caseTypeOptions = [
    {
      value: 'CONSTITUTIONAL',
      label: 'Constitutional',
      description: 'Cases involving constitutional rights and fundamental law',
      icon: '⚖️',
      color: 'text-red-600'
    },
    {
      value: 'CRIMINAL',
      label: 'Criminal',
      description: 'Criminal law matters, prosecutions, and legal violations',
      icon: '🚔',
      color: 'text-orange-600'
    },
    {
      value: 'CIVIL',
      label: 'Civil',
      description: 'Civil disputes between parties, contracts, and property',
      icon: '🏛️',
      color: 'text-blue-600'
    },
    {
      value: 'FAMILY',
      label: 'Family',
      description: 'Divorce, custody, adoption, and family-related matters',
      icon: '👨‍👩‍👧‍👦',
      color: 'text-pink-600'
    },
    {
      value: 'ADMINISTRATIVE',
      label: 'Administrative',
      description: 'Government regulations, licensing, and administrative appeals',
      icon: '📋',
      color: 'text-gray-600'
    }
  ];

  const resourceOptions = [
    'Standard court resources',
    'Special expertise needed',
    'Complex legal research required',
    'Urgent processing required',
    'Emergency hearing needed',
    'High court resources',
    'Multiple expert witnesses',
    'International law expertise',
    'Technical equipment needed'
  ];

  const durationOptions = [
    { value: '7', label: '1 week (Urgent)' },
    { value: '14', label: '2 weeks' },
    { value: '30', label: '1 month' },
    { value: '60', label: '2 months' },
    { value: '90', label: '3 months' },
    { value: '120', label: '4 months' },
    { value: '180', label: '6 months' },
    { value: '365', label: '1 year' }
  ];

  // Load existing case data for editing
  useEffect(() => {
    if (isEditing) {
      const loadCaseData = async () => {
        setFetchLoading(true);
        try {
          const response = await axios.get(`http://localhost:8081/api/cases/${id}`);
          const caseData = response.data;

          setFormData({
            caseNumber: caseData.caseNumber || '',
            title: caseData.title || '',
            description: caseData.description || '',
            caseType: caseData.caseType || 'CIVIL',
            resourceRequirement: caseData.resourceRequirement || '',
            estimatedDurationDays: caseData.estimatedDurationDays || '',
          });
        } catch (error) {
          console.error('Error loading case data:', error);
          setError('Failed to load case data');
        } finally {
          setFetchLoading(false);
        }
      };

      loadCaseData();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async (caseId) => {
    if (documents.length === 0) return;

    setUploadingDocuments(true);
    const uploadPromises = documents.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `Document uploaded with case ${formData.caseNumber}`);

      try {
        await axios.post(`http://localhost:8081/api/cases/${caseId}/documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(`Document ${file.name} uploaded successfully`);
      } catch (error) {
        console.error(`Error uploading document ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}`);
      }
    });

    try {
      await Promise.all(uploadPromises);
      console.log('All documents uploaded successfully');
    } catch (error) {
      throw error;
    } finally {
      setUploadingDocuments(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.caseNumber.trim()) {
        throw new Error('Case number is required');
      }
      if (!formData.title.trim()) {
        throw new Error('Case title is required');
      }

      // Clean up the data
      const payload = {
        caseNumber: formData.caseNumber.trim(),
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        caseType: formData.caseType,
        resourceRequirement: formData.resourceRequirement.trim() || null,
        estimatedDurationDays: formData.estimatedDurationDays ? parseInt(formData.estimatedDurationDays) : null,
      };

      console.log('Submitting case:', payload); // Debug log

      let caseId = id;

      if (isEditing) {
        // Update existing case
        await axios.put(`http://localhost:8081/api/cases/${id}`, payload);
      } else {
        // Create new case
        const response = await axios.post('http://localhost:8081/api/cases', payload);
        caseId = response.data.id;
        console.log('Case created with ID:', caseId);
      }

      // Upload documents if any
      if (!isEditing && documents.length > 0) {
        try {
          await uploadDocuments(caseId);
        } catch (uploadError) {
          console.error('Document upload error:', uploadError);
          // Don't fail the entire submission if document upload fails
          setError(`Case created successfully, but some documents failed to upload: ${uploadError.message}`);
          // Still navigate to cases list
          setTimeout(() => navigate('/cases', { state: { refresh: true } }), 3000);
          return;
        }
      }

      navigate('/cases', { state: { refresh: true } });
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
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Case' : 'File New Case'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update case information' : 'Create a new case in the system'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Progress Indicator */}
        {!isEditing && (
          <div className="px-8 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Filing Progress</span>
              <span className="text-sm text-gray-500">
                {Math.round(((formData.caseNumber ? 20 : 0) +
                           (formData.caseType ? 20 : 0) +
                           (formData.title ? 20 : 0) +
                           (formData.description ? 15 : 0) +
                           (formData.estimatedDurationDays ? 15 : 0) +
                           (documents.length > 0 ? 10 : 0)))}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((formData.caseNumber ? 20 : 0) +
                          (formData.caseType ? 20 : 0) +
                          (formData.title ? 20 : 0) +
                          (formData.description ? 15 : 0) +
                          (formData.estimatedDurationDays ? 15 : 0) +
                          (documents.length > 0 ? 10 : 0))}%`
                }}
              ></div>
            </div>
          </div>
        )}

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
                <div>
                  <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Case Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="caseNumber"
                      name="caseNumber"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Auto-generated case number"
                      value={formData.caseNumber}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        const year = today.getFullYear();
                        const month = String(today.getMonth() + 1).padStart(2, '0');
                        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                        const generatedNumber = `CASE-${year}${month}-${random}`;
                        setFormData(prev => ({ ...prev, caseNumber: generatedNumber }));
                      }}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                      title="Generate new case number"
                    >
                      🔄
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Unique identifier (auto-generated)</p>
                </div>

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
                    {caseTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {caseTypeOptions.find(opt => opt.value === formData.caseType)?.description}
                  </p>
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

            {/* Priority Preview Section */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Priority Preview
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Calculated Priority Level:</p>
                  <div className="flex items-center mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(priorityPreview)}`}>
                      Priority {priorityPreview}/10 - {getPriorityLabel(priorityPreview)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Updates automatically</p>
                  <p className="text-xs text-gray-500">based on your selections</p>
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="estimatedDurationDays" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration
                  </label>
                  <select
                    id="estimatedDurationDays"
                    name="estimatedDurationDays"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.estimatedDurationDays}
                    onChange={handleChange}
                  >
                    <option value="">Select duration</option>
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Expected case duration (affects priority)</p>
                </div>

                <div>
                  <label htmlFor="resourceRequirement" className="block text-sm font-medium text-gray-700 mb-2">
                    Resource Requirements
                  </label>
                  <select
                    id="resourceRequirement"
                    name="resourceRequirement"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.resourceRequirement}
                    onChange={handleChange}
                  >
                    <option value="">Select resource requirements</option>
                    {resourceOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Special resources needed (affects priority)</p>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <svg className={`h-4 w-4 mr-2 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>

                {showAdvanced && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="plaintiffName" className="block text-sm font-medium text-gray-700 mb-2">
                        Plaintiff Name
                      </label>
                      <input
                        type="text"
                        id="plaintiffName"
                        name="plaintiffName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Plaintiff name"
                        value={formData.plaintiffName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="defendantName" className="block text-sm font-medium text-gray-700 mb-2">
                        Defendant Name
                      </label>
                      <input
                        type="text"
                        id="defendantName"
                        name="defendantName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Defendant name"
                        value={formData.defendantName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="courtType" className="block text-sm font-medium text-gray-700 mb-2">
                        Court Type
                      </label>
                      <select
                        id="courtType"
                        name="courtType"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.courtType}
                        onChange={handleChange}
                      >
                        <option value="">Select court type</option>
                        <option value="SUPREME">Supreme Court</option>
                        <option value="HIGH">High Court</option>
                        <option value="DISTRICT">District Court</option>
                        <option value="SESSION">Session Court</option>
                        <option value="MAGISTRATE">Magistrate Court</option>
                        <option value="TRIBUNAL">Tribunal</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Document Upload Section */}
            {!isEditing && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Upload</h3>

                {/* File Input */}
                <div className="mb-4">
                  <label htmlFor="documents" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Documents
                  </label>
                  <input
                    type="file"
                    id="documents"
                    name="documents"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (multiple files allowed)</p>
                </div>

                {/* Selected Documents List */}
                {documents.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Documents ({documents.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {documents.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove document"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Status */}
                {uploadingDocuments && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-sm text-blue-800">Uploading documents...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

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
              {!isEditing && <p>• Upload relevant documents (PDF, DOC, DOCX, TXT, JPG, PNG) during case filing</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseForm;
