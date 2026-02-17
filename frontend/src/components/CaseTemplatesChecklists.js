import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const CaseTemplatesChecklists = ({ caseId }) => {
    const { user } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        stepNumber: 1,
        isMandatory: false,
        dueDate: ''
    });

    useEffect(() => {
        if (caseId) {
            fetchChecklist();
            fetchProgress();
        }
        fetchTemplates();
    }, [caseId]);

    const getAuthHeaders = () => {
        const credentials = btoa(`${user.username}:${localStorage.getItem('password')}`);
        return {
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        };
    };

    const fetchTemplates = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/templates', getAuthHeaders());
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const fetchChecklist = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/templates/checklist/${caseId}`,
                getAuthHeaders()
            );
            setChecklist(response.data);
        } catch (error) {
            console.error('Error fetching checklist:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/templates/checklist/${caseId}/progress`,
                getAuthHeaders()
            );
            setProgress(response.data);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const updateChecklistItem = async (itemId, updates) => {
        try {
            const item = checklist.find(i => i.id === itemId);
            const updatedItem = { ...item, ...updates };

            await axios.put(
                `http://localhost:8080/api/templates/checklist/${itemId}`,
                updatedItem,
                getAuthHeaders()
            );

            fetchChecklist();
            fetchProgress();
        } catch (error) {
            console.error('Error updating checklist item:', error);
        }
    };

    const addChecklistItem = async () => {
        try {
            const item = {
                ...newItem,
                caseEntity: { id: caseId },
                status: 'PENDING'
            };

            await axios.post(
                'http://localhost:8080/api/templates/checklist',
                item,
                getAuthHeaders()
            );

            setShowAddItemModal(false);
            setNewItem({
                title: '',
                description: '',
                stepNumber: 1,
                isMandatory: false,
                dueDate: ''
            });
            fetchChecklist();
            fetchProgress();
        } catch (error) {
            console.error('Error adding checklist item:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            SKIPPED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            PENDING: '⏳',
            IN_PROGRESS: '🔄',
            COMPLETED: '✅',
            SKIPPED: '⏭️',
            OVERDUE: '⚠️'
        };
        return icons[status] || '📋';
    };

    if (loading && caseId) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Progress */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">Case Workflow Checklist</h2>
                        <p className="text-blue-100 mt-1">Track progress through standardized case workflow</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{progress.toFixed(0)}%</div>
                        <div className="text-blue-100 text-sm">Complete</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-blue-400 rounded-full h-3">
                    <div
                        className="bg-white h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                    <span>{checklist.filter(i => i.status === 'COMPLETED').length} of {checklist.length} completed</span>
                    <span>{checklist.filter(i => i.isMandatory && i.status !== 'COMPLETED').length} mandatory items remaining</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
                <button
                    onClick={() => setShowTemplateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all hover:shadow-xl"
                >
                    📋 Browse Templates
                </button>
                <button
                    onClick={() => setShowAddItemModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all hover:shadow-xl"
                >
                    ➕ Add Custom Item
                </button>
            </div>

            {/* Checklist Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Workflow Steps</h3>
                </div>

                {checklist.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">No checklist items yet</p>
                        <p className="text-gray-500 dark:text-gray-500 mt-2">
                            Apply a template or add custom items to get started
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {checklist.map((item) => (
                            <div
                                key={item.id}
                                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Step Number */}
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-800 dark:text-blue-200">
                                            {item.stepNumber}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {item.title}
                                            </h4>
                                            {item.isMandatory && (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-bold rounded">
                                                    MANDATORY
                                                </span>
                                            )}
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {getStatusIcon(item.status)} {item.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        {item.description && (
                                            <p className="text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                                        )}

                                        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                                            {item.dueDate && (
                                                <div className="flex items-center space-x-1">
                                                    <span>📅</span>
                                                    <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {item.completedAt && (
                                                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                                    <span>✓</span>
                                                    <span>Completed: {new Date(item.completedAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {item.completedBy && (
                                                <div className="flex items-center space-x-1">
                                                    <span>👤</span>
                                                    <span>by {item.completedBy.username}</span>
                                                </div>
                                            )}
                                        </div>

                                        {item.notes && (
                                            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{item.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Update Buttons */}
                                    <div className="flex flex-col space-y-2">
                                        {item.status !== 'COMPLETED' && (
                                            <>
                                                {item.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => updateChecklistItem(item.id, { status: 'IN_PROGRESS' })}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                {item.status === 'IN_PROGRESS' && (
                                                    <button
                                                        onClick={() => updateChecklistItem(item.id, {
                                                            status: 'COMPLETED',
                                                            completedBy: { id: user.id }
                                                        })}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                {!item.isMandatory && (
                                                    <button
                                                        onClick={() => updateChecklistItem(item.id, { status: 'SKIPPED' })}
                                                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                                    >
                                                        Skip
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        {item.status === 'COMPLETED' && (
                                            <button
                                                onClick={() => updateChecklistItem(item.id, { status: 'IN_PROGRESS' })}
                                                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                                            >
                                                Reopen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Case Templates</h3>
                                <button
                                    onClick={() => setShowTemplateModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => setSelectedTemplate(template)}
                                >
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        {template.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {template.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                            {template.caseType}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {template.estimatedDurationDays} days
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Apply template logic here
                                            alert(`Applying template: ${template.name}`);
                                        }}
                                        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Apply Template
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Item Modal */}
            {showAddItemModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add Checklist Item</h3>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="e.g., File initial petition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    rows="3"
                                    placeholder="Detailed instructions for this step..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Step Number
                                    </label>
                                    <input
                                        type="number"
                                        value={newItem.stepNumber}
                                        onChange={(e) => setNewItem({ ...newItem, stepNumber: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newItem.dueDate}
                                        onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={newItem.isMandatory}
                                    onChange={(e) => setNewItem({ ...newItem, isMandatory: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Mark as mandatory
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowAddItemModal(false)}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addChecklistItem}
                                disabled={!newItem.title}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseTemplatesChecklists;
