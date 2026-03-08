import React from 'react';
import BASE_URL from '../../config/api';

const CaseNotes = ({ notes, user, setShowNoteModal }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-surface-900 dark:text-white flex items-center">
                    <svg className="h-6 w-6 text-surface-600 dark:text-surface-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Case Notes ({notes.length})
                </h2>
                {user.role?.toUpperCase() === 'JUDGE' ? (
                    <button
                        onClick={() => setShowNoteModal(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    >
                        Add Note
                    </button>
                ) : null}
            </div>

            {notes.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-surface-900">No notes</h3>
                    <p className="mt-1 text-sm text-surface-500">No notes have been added to this case yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {notes.map((note, index) => (
                        <div key={note.id || index} className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2 mr-3 transition-colors">
                                        <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-surface-600 dark:text-surface-300">Note #{notes.length - index}</span>
                                        <p className="text-xs text-surface-500 dark:text-surface-400">
                                            {new Date(note.createdAt).toLocaleDateString('en-US', {
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
                            <p className="text-surface-800 dark:text-surface-200 leading-relaxed">{note.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CaseNotes;
