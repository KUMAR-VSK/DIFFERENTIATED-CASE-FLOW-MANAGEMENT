import React from 'react';
import { getStatusColor, getCaseTypeColor, getPriorityColor } from '../../utils/caseHelpers';
import PriorityAgingBadge from './PriorityAgingBadge';

const CaseOverview = ({
    caseData,
    documents,
    notes,
    user,
    actionLoading,
    setShowStatusModal,
    setShowHearingModal,
    setShowNoteModal,
    setShowEscalateModal,
    setShowDeescalateModal,
    setShowPriorityModal
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-6 transition-colors duration-300">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <svg className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clipRule="evenodd" />
                        </svg>
                        Case Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Number</label>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">{caseData.caseNumber}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Type</label>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCaseTypeColor(caseData.caseType)}`}>
                                        {caseData.caseType.replace('_', ' ')}
                                    </span>
                                    {caseData.caseType === 'CONSTITUTIONAL' && '⚖️'}
                                    {caseData.caseType === 'CRIMINAL' && '🚔'}
                                    {caseData.caseType === 'CIVIL' && '🏛️'}
                                    {caseData.caseType === 'FAMILY' && '👨‍👩‍👧‍👦'}
                                    {caseData.caseType === 'ADMINISTRATIVE' && '📋'}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Status</label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(caseData.status)}`}>
                                    {caseData.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(caseData.priority)}`}>
                                    Priority {caseData.priority}/10
                                </span>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Case Title</label>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">{caseData.title}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-slate-800 p-4 rounded-md border dark:border-slate-600 transition-colors duration-300">
                                {caseData.description || 'No description provided for this case.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center transition-colors duration-300">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{caseData.priority}/10</div>
                        <div className="text-sm text-blue-600 dark:text-blue-300">Priority Level</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center transition-colors duration-300">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{documents.length}</div>
                        <div className="text-sm text-green-600 dark:text-green-300">Documents</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center transition-colors duration-300">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{notes.length}</div>
                        <div className="text-sm text-purple-600 dark:text-purple-300">Case Notes</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center transition-colors duration-300">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {caseData.estimatedDurationDays || 'N/A'}
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-300">Est. Days</div>
                    </div>
                </div>

                {/* Assigned Personnel */}
                {(caseData.assignedJudge || caseData.filingClerk) && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-300">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Assigned Personnel
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {caseData.filingClerk && (
                                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 border-l-4 border-gray-400 dark:border-gray-500">
                                    <div className="flex items-center">
                                        <div className="bg-gray-400 dark:bg-gray-600 rounded-full p-2 mr-3">
                                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Filing Clerk</h4>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {caseData.filingClerk.firstName} {caseData.filingClerk.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">@{caseData.filingClerk.username}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {caseData.assignedJudge && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-400 dark:border-blue-500">
                                    <div className="flex items-center">
                                        <div className="bg-blue-500 dark:bg-blue-600 rounded-full p-2 mr-3">
                                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">Assigned Judge</h4>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {caseData.assignedJudge.firstName} {caseData.assignedJudge.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">@{caseData.assignedJudge.username}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column - Status & Timeline */}
            <div className="space-y-6">
                {/* Status & Priority */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-300">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Status & Priority</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(caseData.status)}`}>
                                {caseData.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority Level</label>
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(caseData.priority)}`}>
                                    Priority {caseData.priority}/10
                                </span>
                                {(user.role === 'ADMIN' || user.role === 'CLERK') && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowPriorityModal(true)}
                                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors duration-200"
                                            title="Set manual priority"
                                        >
                                            Set
                                        </button>
                                        <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors duration-200" title="Recalculate priority automatically">
                                            Auto
                                        </button>
                                    </div>
                                )}
                            </div>
                            {/* Priority Aging Badge */}
                            <PriorityAgingBadge
                                caseId={caseData.id}
                                currentPriority={caseData.priority}
                            />
                        </div>
                        {caseData.resourceRequirement && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Resource Requirements</label>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                    {caseData.resourceRequirement}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Timeline</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <span className="text-sm font-medium text-gray-700">Filing Date</span>
                            <span className="text-sm text-gray-900">
                                {new Date(caseData.filingDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                        {caseData.hearingDate && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                                <span className="text-sm font-medium text-blue-700">Hearing Date</span>
                                <span className="text-sm text-blue-900">
                                    {new Date(caseData.hearingDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}
                        {caseData.estimatedDurationDays && (
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                                <span className="text-sm font-medium text-green-700">Estimated Duration</span>
                                <span className="text-sm text-green-900">
                                    {caseData.estimatedDurationDays} days
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-lg p-6 border-2 border-indigo-200">
                    <h2 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                        <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Quick Actions
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Available Now
                        </span>
                    </h2>

                    {/* Debug Info */}
                    <div className="mb-4 p-3 bg-white rounded-md border border-indigo-200">
                        <p className="text-sm text-indigo-700">
                            <strong>Current User Role:</strong> {user?.role || 'Not logged in'}
                        </p>
                        <p className="text-xs text-indigo-600 mt-1">
                            Quick actions are available based on your role permissions.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Status Update - ADMIN/JUDGE only */}
                        {(user.role === 'ADMIN' || user.role === 'JUDGE') ? (
                            <button
                                onClick={() => setShowStatusModal(true)}
                                disabled={actionLoading}
                                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center justify-center shadow-md"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {actionLoading ? 'Updating...' : 'Update Status'}
                            </button>
                        ) : (
                            <div className="w-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Status Update (Admin/Judge Only)
                            </div>
                        )}

                        {/* Schedule Hearing - ADMIN/JUDGE only */}
                        {(user.role === 'ADMIN' || user.role === 'JUDGE') ? (
                            <button
                                onClick={() => setShowHearingModal(true)}
                                disabled={actionLoading}
                                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center justify-center shadow-md"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {actionLoading ? 'Scheduling...' : 'Schedule Hearing'}
                            </button>
                        ) : (
                            <div className="w-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Schedule Hearing (Admin/Judge Only)
                            </div>
                        )}

                        {/* Add Notes - ADMIN/JUDGE/CLERK */}
                        {(user.role === 'ADMIN' || user.role === 'JUDGE' || user.role === 'CLERK') ? (
                            <button
                                onClick={() => setShowNoteModal(true)}
                                disabled={actionLoading}
                                className="w-full bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center justify-center shadow-md"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {actionLoading ? 'Adding...' : 'Add Notes'}
                            </button>
                        ) : (
                            <div className="w-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Add Notes (Admin/Judge/Clerk)
                            </div>
                        )}

                        {/* Escalate Case - ADMIN/JUDGE only */}
                        {(user.role === 'ADMIN' || user.role === 'JUDGE') ? (
                            <button
                                onClick={() => setShowEscalateModal(true)}
                                disabled={actionLoading || caseData.courtLevel === 'SUPREME'}
                                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center justify-center shadow-md"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                {caseData.courtLevel === 'SUPREME' ? 'Already at Supreme Court' :
                                    caseData.courtLevel === 'HIGH' ? 'Escalate to Supreme Court' :
                                        'Escalate to Higher Court'}
                            </button>
                        ) : (
                            <div className="w-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                Escalate (Admin/Judge Only)
                            </div>
                        )}

                        {/* De-escalate Case - ADMIN/JUDGE only */}
                        {(user.role === 'ADMIN' || user.role === 'JUDGE') ? (
                            <button
                                onClick={() => setShowDeescalateModal(true)}
                                disabled={actionLoading || caseData.courtLevel === 'SUBORDINATE'}
                                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center justify-center shadow-md"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                                {caseData.courtLevel === 'SUBORDINATE' ? 'Already at Lowest Court' : 'De-escalate to Lower Court'}
                            </button>
                        ) : (
                            <div className="w-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                                De-escalate (Admin/Judge Only)
                            </div>
                        )}

                        {/* Help Text */}
                        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-200 dark:border-indigo-800">
                            <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-2">Available Actions:</h4>
                            <ul className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                                <li>• <strong>Admins/Judges/Clerks:</strong> Update status, schedule hearings, add notes</li>
                                <li>• <strong>Judges:</strong> Add case notes</li>
                                <li>• <strong>All Roles:</strong> View case details and history</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseOverview;
