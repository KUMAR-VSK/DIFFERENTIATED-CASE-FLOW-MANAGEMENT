import React from 'react';

const CaseAnalytics = ({
    caseData,
    documents,
    notes,
    handleExportReport,
    handleGeneratePDF,
    actionLoading
}) => {
    return (
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
    );
};

export default CaseAnalytics;
