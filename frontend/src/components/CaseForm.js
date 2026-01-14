import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

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
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

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

      if (isEditing) {
        // Update existing case
        await axios.put(`http://localhost:8081/api/cases/${id}`, payload);
      } else {
        // Create new case
        await axios.post('http://localhost:8081/api/cases', payload);
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
                  <input
                    type="text"
                    id="caseNumber"
                    name="caseNumber"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter case number"
                    value={formData.caseNumber}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for the case</p>
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
                    <option value="CONSTITUTIONAL">Constitutional</option>
                    <option value="CRIMINAL">Criminal</option>
                    <option value="CIVIL">Civil</option>
                    <option value="FAMILY">Family</option>
                    <option value="ADMINISTRATIVE">Administrative</option>
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
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors cursor-pointer bg-white">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload files</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" />
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
