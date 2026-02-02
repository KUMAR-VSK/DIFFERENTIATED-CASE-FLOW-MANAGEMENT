import React from 'react';

const statusOptions = [
    { value: 'FILED', label: 'Filed', description: 'Case has been filed and is awaiting review' },
    { value: 'UNDER_REVIEW', label: 'Under Review', description: 'Case is being reviewed by court staff' },
    { value: 'SCHEDULED', label: 'Scheduled', description: 'Hearing or trial date has been set' },
    { value: 'IN_PROGRESS', label: 'In Progress', description: 'Case proceedings are currently active' },
    { value: 'COMPLETED', label: 'Completed', description: 'Case has been resolved' },
    { value: 'DISMISSED', label: 'Dismissed', description: 'Case has been dismissed' }
];

export const StatusModal = ({ show, onClose, selectedStatus, setSelectedStatus, onUpdate, loading }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Update Case Status</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Select New Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Choose a status...</option>
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {selectedStatus && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {statusOptions.find(opt => opt.value === selectedStatus)?.description}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onUpdate}
                            disabled={!selectedStatus || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const HearingModal = ({ show, onClose, hearingDate, setHearingDate, onSchedule, loading }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Schedule Hearing</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Hearing Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={hearingDate}
                            onChange={(e) => setHearingDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Select a date and time for the hearing (must be in the future)
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSchedule}
                            disabled={!hearingDate || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Scheduling...' : 'Schedule Hearing'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PriorityModal = ({ show, onClose, manualPriority, setManualPriority, onSet, loading, currentPriority }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Set Case Priority</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Priority Level (1-10)
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((priority) => (
                                <button
                                    key={priority}
                                    type="button"
                                    onClick={() => setManualPriority(priority)}
                                    className={`p-2 text-sm font-medium rounded-md border transition-colors duration-200 ${manualPriority === priority
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {priority}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Current priority: {currentPriority}/10 • Higher numbers = higher priority
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSet}
                            disabled={!manualPriority || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Setting...' : 'Set Priority'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NoteModal = ({ show, onClose, newNote, setNewNote, onAdd, loading }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Case Note</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Note Content
                        </label>
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Enter your case note..."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Add observations, decisions, or important information about this case
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onAdd}
                            disabled={!newNote.trim() || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Adding...' : 'Add Note'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const UploadModal = ({ show, onClose, selectedFile, setSelectedFile, onUpload, loading }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Document</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Select File
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Upload a document for this case (PDF, DOC, DOCX, TXT)
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onUpload}
                            disabled={!selectedFile || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const EscalateModal = ({ show, onClose, reason, setReason, onEscalate, loading, currentCourtLevel }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Escalate Case to High Court</h3>
                    <div className="mb-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>Current Court Level:</strong> {currentCourtLevel}
                            </p>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                                <strong>New Court Level:</strong> HIGH
                            </p>
                        </div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Reason for Escalation
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Enter the reason for escalating this case to High Court..."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Provide a detailed explanation for why this case needs to be escalated to a higher court.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onEscalate}
                            disabled={!reason.trim() || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Escalating...' : 'Confirm Escalation'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DeescalateModal = ({ show, onClose, reason, setReason, onDeescalate, loading, currentCourtLevel }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">De-escalate Case to Lower Court</h3>
                    <div className="mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Current Court Level:</strong> {currentCourtLevel}
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                <strong>New Court Level:</strong> {currentCourtLevel === 'HIGH' ? 'DISTRICT' : 'SUBORDINATE'}
                            </p>
                        </div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Reason for De-escalation
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Enter the reason for de-escalating this case to a lower court..."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Provide a detailed explanation for why this case should be de-escalated to a lower court.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onDeescalate}
                            disabled={!reason.trim() || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'De-escalating...' : 'Confirm De-escalation'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
