import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../config/api';

const CaseFlowVisualization = () => {
    // eslint-disable-next-line no-unused-vars
    const { user } = useAuth();
    const [flowData, setFlowData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState('overview');

    useEffect(() => {
        fetchFlowData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchFlowData = async () => {
        try {
            // AuthContext sets axios.defaults.headers.common['Authorization'] automatically.
            // We read credentials directly from localStorage as a reliable fallback
            // in case the axios defaults haven't been applied yet (effect ordering).
            const storedCreds = JSON.parse(localStorage.getItem('credentials') || '{}');
            const authHeader = storedCreds.username
                ? `Basic ${btoa(`${storedCreds.username}:${storedCreds.password}`)}`
                : axios.defaults.headers.common['Authorization'];

            const response = await axios.get(BASE_URL + '/api/analytics/case-flow', {
                headers: { 'Authorization': authHeader }
            });
            setFlowData(response.data);
        } catch (error) {
            console.error('Error fetching flow data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!flowData) {
        return <div className="text-center py-12 text-red-500">Failed to load flow data</div>;
    }

    const getStatusColor = (status) => {
        const colors = {
            FILED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            UNDER_REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            SCHEDULED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            IN_PROGRESS: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            DISMISSED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            ESCALATED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getCourtLevelColor = (level) => {
        const colors = {
            DISTRICT: 'bg-green-500',
            HIGH: 'bg-orange-500',
            SUPREME: 'bg-red-500'
        };
        return colors[level] || 'bg-gray-500';
    };

    const getSeverityColor = (severity) => {
        const colors = {
            HIGH: 'bg-red-500 text-white',
            MEDIUM: 'bg-orange-500 text-white',
            LOW: 'bg-yellow-500 text-white'
        };
        return colors[severity] || 'bg-gray-500 text-white';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    📊 Case Flow Visualization
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Interactive flowcharts showing case progression, bottlenecks, and escalation paths
                </p>
            </div>

            {/* Metric Selector */}
            <div className="mb-6 flex space-x-4 overflow-x-auto pb-2">
                {['overview', 'courtLevels', 'status', 'escalations', 'bottlenecks'].map((metric) => (
                    <button
                        key={metric}
                        onClick={() => setSelectedMetric(metric)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedMetric === metric
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        {metric.charAt(0).toUpperCase() + metric.slice(1).replace(/([A-Z])/g, ' $1')}
                    </button>
                ))}
            </div>

            {/* Overview Section */}
            {selectedMetric === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Cases</p>
                                <p className="text-3xl font-bold mt-2">{flowData.totalCases}</p>
                            </div>
                            <div className="text-4xl opacity-20">📋</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">District Court</p>
                                <p className="text-3xl font-bold mt-2">
                                    {flowData.courtLevelDistribution?.DISTRICT || 0}
                                </p>
                            </div>
                            <div className="text-4xl opacity-20">🏛️</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">High Court</p>
                                <p className="text-3xl font-bold mt-2">
                                    {flowData.courtLevelDistribution?.HIGH || 0}
                                </p>
                            </div>
                            <div className="text-4xl opacity-20">⚖️</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Supreme Court</p>
                                <p className="text-3xl font-bold mt-2">
                                    {flowData.courtLevelDistribution?.SUPREME || 0}
                                </p>
                            </div>
                            <div className="text-4xl opacity-20">🏛️</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Court Level Flow - Visual Representation */}
            {selectedMetric === 'courtLevels' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Court Level Distribution
                    </h2>

                    <div className="space-y-6">
                        {Object.entries(flowData.courtLevelDistribution || {}).map(([level, count]) => {
                            const percentage = (count / flowData.totalCases * 100).toFixed(1);
                            return (
                                <div key={level}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {level === 'DISTRICT' ? '🏛️ District Court' :
                                                level === 'HIGH' ? '⚖️ High Court' :
                                                    '🏛️ Supreme Court'}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {count} cases ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                        <div
                                            className={`${getCourtLevelColor(level)} h-4 rounded-full transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Flow Diagram */}
                    <div className="mt-12">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                            Case Flow Progression
                        </h3>
                        <div className="flex items-center justify-center space-x-8">
                            <div className="text-center">
                                <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                    <div className="text-center text-white">
                                        <div className="text-3xl font-bold">
                                            {flowData.courtLevelDistribution?.DISTRICT || 0}
                                        </div>
                                        <div className="text-xs">District</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="text-3xl">→</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Escalate</div>
                            </div>

                            <div className="text-center">
                                <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                    <div className="text-center text-white">
                                        <div className="text-3xl font-bold">
                                            {flowData.courtLevelDistribution?.HIGH || 0}
                                        </div>
                                        <div className="text-xs">High</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="text-3xl">→</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Escalate</div>
                            </div>

                            <div className="text-center">
                                <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                    <div className="text-center text-white">
                                        <div className="text-3xl font-bold">
                                            {flowData.courtLevelDistribution?.SUPREME || 0}
                                        </div>
                                        <div className="text-xs">Supreme</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Distribution */}
            {selectedMetric === 'status' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Status Distribution & Average Time
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Status Count */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                Cases by Status
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(flowData.statusDistribution || {}).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                                            {status.replace(/_/g, ' ')}
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Average Time by Status */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                Average Days per Status
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(flowData.averageTimeByStatus || {}).map(([status, days]) => (
                                    <div key={status} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {status.replace(/_/g, ' ')}
                                        </span>
                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {days.toFixed(1)} days
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Escalation Paths */}
            {selectedMetric === 'escalations' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Common Escalation Paths
                    </h2>

                    <div className="space-y-4">
                        {flowData.escalationPaths?.slice(0, 10).map((path, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white font-mono">
                                                {path.path}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Escalation pathway
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {path.count}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">cases</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottlenecks */}
            {selectedMetric === 'bottlenecks' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        ⚠️ Identified Bottlenecks
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Cases stuck in certain statuses exceeding threshold (60+ days)
                    </p>

                    {flowData.bottlenecks && flowData.bottlenecks.length > 0 ? (
                        <div className="space-y-4">
                            {flowData.bottlenecks.map((bottleneck, index) => (
                                <div
                                    key={index}
                                    className="border-l-4 bg-gray-50 dark:bg-gray-700 rounded-r-lg p-6 hover:shadow-lg transition-shadow"
                                    style={{
                                        borderLeftColor:
                                            bottleneck.severity === 'HIGH'
                                                ? '#ef4444'
                                                : bottleneck.severity === 'MEDIUM'
                                                    ? '#f97316'
                                                    : '#eab308',
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {bottleneck.status.replace(/_/g, ' ')}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(bottleneck.severity)}`}>
                                                    {bottleneck.severity} SEVERITY
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Cases</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {bottleneck.totalCases}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Stuck Cases</p>
                                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                        {bottleneck.stuckCases}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Age</p>
                                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                        {bottleneck.averageAge.toFixed(0)}d
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">✅</div>
                            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                                No bottlenecks detected!
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                All cases are progressing within acceptable timeframes
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CaseFlowVisualization;
