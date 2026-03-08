import React from 'react';
import BASE_URL from '../../config/api';

const CaseDocuments = ({ documents, user, setShowUploadModal }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <svg className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clipRule="evenodd" />
                    </svg>
                    Case Documents ({documents.length})
                </h2>
                {(user.role === 'CLERK' || user.role === 'ADMIN') && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
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
                                    onClick={() => {
                                        const url = doc.url.startsWith('http') ? doc.url : `${BASE_URL}${doc.url}`;
                                        window.open(url, '_blank');
                                    }}
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
    );
};

export default CaseDocuments;
