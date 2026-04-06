import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import BASE_URL from '../../config/api';

const CaseTimeline = ({ caseData }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/cases/${caseData.id}/history`);
                setHistory(response.data);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        if (caseData && caseData.id) {
            fetchHistory();
        }
    }, [caseData]);

    const getIcon = (type) => {
        switch (type) {
            case 'CASE_CREATED':
                return (
                    <div className="bg-green-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'STATUS_CHANGED':
                return (
                    <div className="bg-blue-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'JUDGE_ASSIGNED':
                return (
                    <div className="bg-purple-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                    </div>
                );
            case 'HEARING_SCHEDULED':
                return (
                    <div className="bg-orange-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'COURT_ESCALATED':
                return (
                    <div className="bg-red-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="bg-gray-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
        }
    };

    if (loading) {
        return <div className="text-center py-10 text-gray-500">Loading timeline...</div>;
    }

    // Sort descending (newest first)
    const sortedHistory = [...history].reverse();

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Actual Case History
            </h2>

            <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700"></div>

                {sortedHistory.map((audit) => (
                    <div key={audit.id} className="relative flex items-start mb-8">
                        {getIcon(audit.actionType)}
                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 flex-1 transition-colors hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {audit.actionType.replace(/_/g, ' ')}
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                    {new Date(audit.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {audit.description}
                            </p>
                            <div className="flex items-center mt-3 pt-2 border-t border-gray-100 dark:border-slate-700">
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    By: {audit.performedBy ? `${audit.performedBy.firstName} ${audit.performedBy.lastName}` : 'System'}
                                </span>
                                {audit.performedBy && (
                                    <span className="ml-2 text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-500 px-1.5 py-0.5 rounded">
                                        {audit.performedBy.role}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {sortedHistory.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No activity recorded for this case.</div>
                )}
            </div>
        </div>
    );
};

export default CaseTimeline;
