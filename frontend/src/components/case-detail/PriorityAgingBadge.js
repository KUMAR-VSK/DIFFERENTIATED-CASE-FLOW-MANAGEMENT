import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../../config/api';

const PriorityAgingBadge = ({ caseId, currentPriority }) => {
    const [agingInfo, setAgingInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (showDetails && !agingInfo) {
            fetchAgingInfo();
        }
    }, [showDetails]);

    const fetchAgingInfo = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/cases/${caseId}/priority-aging`);
            setAgingInfo(response.data);
        } catch (error) {
            console.error('Error fetching priority aging info:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-2">
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-primary-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showDetails ? 'Hide' : 'Show'} Priority Aging Details
            </button>

            {showDetails && (
                <div className="mt-3 p-4 bg-primary-50 dark:bg-blue-900/20 rounded-lg border border-primary-200 dark:border-blue-800">
                    {loading ? (
                        <p className="text-sm text-primary-600 dark:text-blue-400">Loading aging info...</p>
                    ) : agingInfo ? (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Priority Aging Information
                            </h4>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white dark:bg-surface-800 p-2 rounded">
                                    <span className="text-surface-600 dark:text-surface-400">Case Age:</span>
                                    <div className="font-semibold text-blue-700 dark:text-blue-300">{agingInfo.caseAgeDays} days</div>
                                </div>
                                <div className="bg-white dark:bg-surface-800 p-2 rounded">
                                    <span className="text-surface-600 dark:text-surface-400">Base Priority:</span>
                                    <div className="font-semibold text-blue-700 dark:text-blue-300">{agingInfo.basePriority}/10</div>
                                </div>
                                <div className="bg-white dark:bg-surface-800 p-2 rounded">
                                    <span className="text-surface-600 dark:text-surface-400">Aging Boost:</span>
                                    <div className="font-semibold text-green-600 dark:text-green-400">+{agingInfo.agingBoost}</div>
                                </div>
                                <div className="bg-white dark:bg-surface-800 p-2 rounded">
                                    <span className="text-surface-600 dark:text-surface-400">Adjusted Priority:</span>
                                    <div className="font-semibold text-blue-700 dark:text-blue-300">{agingInfo.adjustedPriority}/10</div>
                                </div>
                            </div>

                            <div className="mt-3 p-2 bg-white dark:bg-surface-800 rounded text-xs">
                                <div className="text-surface-600 dark:text-surface-400 mb-1">Formula:</div>
                                <code className="text-primary-600 dark:text-blue-400">{agingInfo.agingFormula}</code>
                            </div>

                            {agingInfo.agingBoost > 0 && (
                                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <strong>✓ Priority Boosted:</strong> This case has gained <strong>+{agingInfo.agingBoost}</strong> priority points due to aging.
                                    </p>
                                </div>
                            )}

                            <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-800/30 rounded text-xs">
                                <p className="text-blue-800 dark:text-blue-200">
                                    Next boost in <strong>{agingInfo.nextAgingBoostIn}</strong> days
                                </p>
                            </div>

                            {agingInfo.caseAgeDays > 90 && (
                                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                        <strong>⚠️ Attention:</strong> This case is over 90 days old and should be prioritized for resolution.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-surface-600 dark:text-surface-400">Unable to load aging information</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PriorityAgingBadge;
