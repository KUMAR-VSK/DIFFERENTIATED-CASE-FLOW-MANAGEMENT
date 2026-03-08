import React, { useMemo } from 'react';
import BASE_URL from '../../config/api';

const CaseTimeline = ({ caseData, notes, documents }) => {
    // Combine all events into a single timeline
    const timelineEvents = useMemo(() => {
        const events = [];

        // 1. Filing Event
        if (caseData.filingDate) {
            events.push({
                type: 'FILING',
                date: new Date(caseData.filingDate),
                title: 'Case Filed',
                description: 'Case was filed in the system',
                icon: (
                    <div className="bg-primary-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                )
            });
        }

        // 2. Status Updates (using updatedAt if recent, otherwise generic) 
        // Note: Ideally we'd have a status history endpoint, but we'll use current status as "latest update"
        if (caseData.status !== 'FILED' && caseData.updatedAt) {
            events.push({
                type: 'STATUS',
                date: new Date(caseData.updatedAt),
                title: 'Status Updated',
                description: `Current Status: ${caseData.status.replace('_', ' ')}`,
                icon: (
                    <div className="bg-yellow-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                )
            });
        }            // Escalation event
        if (caseData.escalationDate && caseData.escalationReason && !caseData.escalationReason.toLowerCase().includes('de-escalated')) {
            events.push({
                type: 'ESCALATION',
                date: new Date(caseData.escalationDate),
                title: 'Case Escalated',
                description: caseData.escalationReason,
                icon: (
                    <div className="bg-red-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9V7a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
                        </svg>
                    </div>
                )
            });
        }
        // De-escalation event
        if (caseData.escalationDate && caseData.escalationReason && caseData.escalationReason.toLowerCase().includes('de-escalated')) {
            events.push({
                type: 'DEESCALATION',
                date: new Date(caseData.escalationDate),
                title: 'Case De-escalated',
                description: caseData.escalationReason,
                icon: (
                    <div className="bg-primary-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V7a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
                        </svg>
                    </div>
                )
            });
        }

        // 3. Hearing Scheduled
        if (caseData.hearingDate) {
            events.push({
                type: 'HEARING',
                date: new Date(caseData.hearingDate),
                title: 'Hearing Scheduled',
                description: 'Hearing date has been set',
                icon: (
                    <div className="bg-green-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                    </div>
                )
            });
        }

        // 4. Notes
        notes.forEach(note => {
            events.push({
                type: 'NOTE',
                date: new Date(note.createdAt),
                title: 'Note Added',
                description: note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content,
                icon: (
                    <div className="bg-purple-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                )
            });
        });

        // 5. Documents
        documents.forEach(doc => {
            events.push({
                type: 'DOCUMENT',
                date: new Date(doc.uploadDate),
                title: 'Document Uploaded',
                description: `${doc.originalFileName} (${(doc.fileSize / 1024).toFixed(1)} KB)`,
                icon: (
                    <div className="bg-indigo-500 rounded-full p-2 mr-4 ring-4 ring-white dark:ring-slate-900">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clipRule="evenodd" />
                        </svg>
                    </div>
                )
            });
        });

        // Sort by date descending (newest first)
        return events.sort((a, b) => b.date - a.date);
    }, [caseData, notes, documents]);

    return (
        <div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6 flex items-center">
                <svg className="h-6 w-6 text-surface-600 dark:text-surface-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Case Activity Timeline
            </h2>

            <div className="space-y-6">
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-200 dark:bg-surface-700"></div>

                    {timelineEvents.map((event, index) => (
                        <div key={index} className="relative flex items-start mb-6">
                            {event.icon}
                            <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-4 flex-1 transition-colors hover:shadow-md">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-bold text-surface-900 dark:text-white">{event.title}</h3>
                                    <span className="text-xs text-surface-500 dark:text-surface-400 whitespace-nowrap ml-2">
                                        {event.date.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-surface-600 dark:text-surface-300 mt-1">
                                    {event.description}
                                </p>
                                {event.type === 'HEARING' && new Date() < event.date && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-2">
                                        Upcoming
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {timelineEvents.length === 0 && (
                        <div className="text-center py-4 text-surface-500 dark:text-surface-400">
                            No timeline events found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CaseTimeline;
