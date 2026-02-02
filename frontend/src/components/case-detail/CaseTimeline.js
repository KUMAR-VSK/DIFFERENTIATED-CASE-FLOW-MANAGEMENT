import React from 'react';

const CaseTimeline = ({ caseData }) => {
    return (
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
    );
};

export default CaseTimeline;
