import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../config/api';

const AdvancedDocumentManager = ({ caseId }) => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [versions, setVersions] = useState([]);
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        file: null,
        fileName: '',
        description: '',
        documentType: 'OTHER',
        expiryDate: '',
        tags: '',
        changeDescription: ''
    });

    useEffect(() => {
        if (caseId) {
            fetchDocuments();
        }
    }, [caseId]);

    const getAuthHeaders = () => {
        const credentials = btoa(`${user.username}:${localStorage.getItem('password')}`);
        return {
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        };
    };

    const fetchDocuments = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}/api/documents/case/${caseId}`,
                getAuthHeaders()
            );
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVersions = async (documentId) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/api/documents/${documentId}/versions`,
                getAuthHeaders()
            );
            setVersions(response.data);
        } catch (error) {
            console.error('Error fetching versions:', error);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (files) => {
        const file = files[0];
        setUploadForm({
            ...uploadForm,
            file: file,
            fileName: file.name
        });
    };

    const uploadDocument = async (e) => {
        e.preventDefault();

        if (!uploadForm.file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadForm.file);
        formData.append('caseId', caseId);
        formData.append('description', uploadForm.description);
        formData.append('documentType', uploadForm.documentType);

        try {
            const credentials = btoa(`${user.username}:${localStorage.getItem('password')}`);
            await axios.post(BASE_URL + '/api/documents/upload', formData, {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            setShowUploadModal(false);
            setUploadForm({
                file: null,
                fileName: '',
                description: '',
                documentType: 'OTHER',
                expiryDate: '',
                tags: '',
                changeDescription: ''
            });
            setUploadProgress(0);
            fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Failed to upload document');
        }
    };

    const getDocumentIcon = (fileType) => {
        if (fileType?.includes('pdf')) return '📄';
        if (fileType?.includes('image')) return '🖼️';
        if (fileType?.includes('word') || fileType?.includes('doc')) return '📝';
        if (fileType?.includes('excel') || fileType?.includes('sheet')) return '📊';
        return '📎';
    };

    const getDocumentTypeColor = (type) => {
        const colors = {
            EVIDENCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            WITNESS_STATEMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            COURT_ORDER: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            PLEADING: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            JUDGMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            APPEAL: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            OTHER: 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-200'
        };
        return colors[type] || colors.OTHER;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">📁 Advanced Document Management</h2>
                        <p className="text-indigo-100 mt-1">
                            Versioning, approval workflows, and comprehensive document tracking
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{documents.length}</div>
                        <div className="text-indigo-100 text-sm">Documents</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all hover:shadow-xl flex items-center space-x-2"
                >
                    <span>📤</span>
                    <span>Upload Document</span>
                </button>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all hover:shadow-xl flex items-center space-x-2"
                >
                    <span>📦</span>
                    <span>Bulk Upload</span>
                </button>
                <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all hover:shadow-xl flex items-center space-x-2"
                >
                    <span>📋</span>
                    <span>Use Template</span>
                </button>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="bg-white dark:bg-surface-800 rounded-xl shadow-lg hover:shadow-xl transition-all border border-surface-200 dark:border-surface-700 overflow-hidden"
                    >
                        {/* Document Header */}
                        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-surface-200 dark:border-surface-600">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="text-4xl">{getDocumentIcon(doc.fileType)}</div>
                                    <div>
                                        <h3 className="font-bold text-surface-900 dark:text-white line-clamp-1">
                                            {doc.originalFileName}
                                        </h3>
                                        <p className="text-xs text-surface-500 dark:text-surface-400">
                                            {formatFileSize(doc.fileSize)}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getDocumentTypeColor(doc.documentType)}`}>
                                    {doc.documentType}
                                </span>
                            </div>
                        </div>

                        {/* Document Body */}
                        <div className="p-6">
                            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 line-clamp-2">
                                {doc.description || 'No description provided'}
                            </p>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-surface-600 dark:text-surface-400">
                                    <span className="font-medium mr-2">📅 Uploaded:</span>
                                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                </div>
                                {doc.uploadedBy && (
                                    <div className="flex items-center text-surface-600 dark:text-surface-400">
                                        <span className="font-medium mr-2">👤 By:</span>
                                        <span>{doc.uploadedBy.username}</span>
                                    </div>
                                )}
                            </div>

                            {/* Version Badge */}
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full font-medium">
                                    📦 v1.0
                                </span>
                                <span className="text-xs text-surface-500 dark:text-surface-400">
                                    ✅ Current
                                </span>
                            </div>
                        </div>

                        {/* Document Actions */}
                        <div className="p-4 bg-surface-50 dark:bg-surface-700 border-t border-surface-200 dark:border-surface-600 grid grid-cols-2 gap-2">
                            <button
                                onClick={() => window.open(`${BASE_URL}/api/documents/view/${doc.url.split('/').pop()}`, '_blank')}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-1"
                            >
                                <span>👁️</span>
                                <span>View</span>
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedDoc(doc);
                                    fetchVersions(doc.id);
                                    setShowVersionModal(true);
                                }}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
                            >
                                <span>📜</span>
                                <span>Versions</span>
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedDoc(doc);
                                    setShowApprovalModal(true);
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                            >
                                <span>✓</span>
                                <span>Approve</span>
                            </button>
                            <button
                                onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = `${BASE_URL}/api/documents/download/${doc.url.split('/').pop()}`;
                                    a.download = doc.originalFileName;
                                    a.click();
                                }}
                                className="px-4 py-2 bg-surface-600 text-white rounded-lg text-sm font-medium hover:bg-surface-700 transition-colors flex items-center justify-center space-x-1"
                            >
                                <span>⬇️</span>
                                <span>Download</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {documents.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-surface-800 rounded-xl shadow-lg">
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-xl font-semibold text-surface-600 dark:text-surface-400">No documents yet</p>
                    <p className="text-surface-500 dark:text-surface-500 mt-2">Upload your first document to get started</p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-6 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all"
                    >
                        Upload Document
                    </button>
                </div>
            )}

            {/* Upload Modal with Drag & Drop */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-surface-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-surface-200 dark:border-surface-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-surface-900 dark:text-white">Upload Document</h3>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <form onSubmit={uploadDocument} className="p-6 space-y-6">
                            {/* Drag & Drop Zone */}
                            <div
                                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive
                                        ? 'border-blue-500 bg-primary-50 dark:bg-blue-900/20'
                                        : 'border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-700'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="text-6xl mb-4">📤</div>
                                <p className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">
                                    {uploadForm.file ? uploadForm.fileName : 'Drag & drop files here'}
                                </p>
                                <p className="text-sm text-surface-500 dark:text-surface-400">or</p>
                                <label className="mt-2 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition-colors">
                                    Browse Files
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileSelect(e.target.files)}
                                        className="hidden"
                                    />
                                </label>
                                <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
                                    Maximum file size: 50MB
                                </p>
                            </div>

                            {/* Upload Progress */}
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-surface-600 dark:text-surface-400">Uploading...</span>
                                        <span className="text-sm font-medium text-primary-600">{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Form Fields */}
                            <div>
                                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-surface-700 dark:text-white"
                                    rows="3"
                                    placeholder="Describe the document..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                        Document Type
                                    </label>
                                    <select
                                        value={uploadForm.documentType}
                                        onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                                        className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-surface-700 dark:text-white"
                                    >
                                        <option value="EVIDENCE">Evidence</option>
                                        <option value="WITNESS_STATEMENT">Witness Statement</option>
                                        <option value="COURT_ORDER">Court Order</option>
                                        <option value="PLEADING">Pleading</option>
                                        <option value="JUDGMENT">Judgment</option>
                                        <option value="APPEAL">Appeal</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                        Expiry Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={uploadForm.expiryDate}
                                        onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-surface-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={uploadForm.tags}
                                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                                    className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-surface-700 dark:text-white"
                                    placeholder="e.g., confidential, urgent, evidence"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-surface-200 dark:border-surface-700">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-6 py-2 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-lg font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!uploadForm.file}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Upload Document
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Version History Modal */}
            {showVersionModal && selectedDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-surface-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-surface-200 dark:border-surface-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-surface-900 dark:text-white">Version History</h3>
                                    <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">{selectedDoc.originalFileName}</p>
                                </div>
                                <button
                                    onClick={() => setShowVersionModal(false)}
                                    className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {/* Current Version */}
                                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="text-2xl font-bold text-surface-900 dark:text-white">v1.0</span>
                                                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                                                    CURRENT
                                                </span>
                                            </div>
                                            <p className="text-sm text-surface-600 dark:text-surface-400">
                                                Uploaded on {new Date(selectedDoc.uploadDate).toLocaleString()}
                                            </p>
                                            {selectedDoc.uploadedBy && (
                                                <p className="text-sm text-surface-600 dark:text-surface-400">
                                                    by {selectedDoc.uploadedBy.username}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                                                View
                                            </button>
                                            <button className="px-4 py-2 bg-surface-600 text-white rounded-lg text-sm font-medium hover:bg-surface-700">
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Previous Versions */}
                                {versions.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-lg font-semibold text-surface-900 dark:text-white mb-3">Previous Versions</h4>
                                        {versions.map((version, index) => (
                                            <div key={index} className="bg-surface-50 dark:bg-surface-700 rounded-lg p-4 mb-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-bold text-surface-900 dark:text-white">v{version.versionNumber}</span>
                                                        <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                                                            {new Date(version.uploadDate).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                                                        Restore
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {versions.length === 0 && (
                                    <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                                        No previous versions
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedDocumentManager;
