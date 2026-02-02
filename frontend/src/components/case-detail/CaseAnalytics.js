import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const CaseAnalytics = ({
    caseData,
    documents,
    notes,
    handleExportReport,
    handleGeneratePDF,
    actionLoading
}) => {

    // Calculate health score metrics
    const healthMetrics = useMemo(() => {
        let score = 0;
        const maxScore = 3;

        if (documents.length > 0) score++;
        if (caseData.assignedJudge) score++;
        if (caseData.hearingDate) score++;

        return {
            score,
            maxScore,
            percentage: Math.round((score / maxScore) * 100)
        };
    }, [caseData, documents]);

    // Data for Health Score Doughnut Chart
    const healthChartData = {
        labels: ['Completed', 'Pending'],
        datasets: [
            {
                data: [healthMetrics.score, healthMetrics.maxScore - healthMetrics.score],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)', // Green-500
                    'rgba(229, 231, 235, 0.5)', // Gray-200
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(229, 231, 235, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Data for Case Progress vs Estimated
    const daysElapsed = Math.floor((new Date() - new Date(caseData.filingDate)) / (1000 * 60 * 60 * 24));
    const estimatedDays = caseData.estimatedDurationDays || 180; // Default 180 if null

    const progressChartData = {
        labels: ['Days Elapsed', 'Remaining Estimate'],
        datasets: [
            {
                label: 'Case Duration (Days)',
                data: [
                    daysElapsed,
                    Math.max(0, estimatedDays - daysElapsed)
                ],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)', // Blue-500
                    'rgba(251, 146, 60, 0.8)', // Orange-400
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                }
            }
        }
    };

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
                {/* Priority Card */}
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

                {/* Documents Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 rounded-lg p-6 border border-green-200 dark:border-green-800 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-300">Documents</p>
                            <p className="text-3xl font-bold text-green-900 dark:text-green-100">{documents.length}</p>
                            <p className="text-xs text-green-500 mt-1">
                                Avg: {(documents.length / 1).toFixed(0)} per case
                            </p>
                        </div>
                        <div className="bg-green-500 rounded-full p-3">
                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Notes Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg p-6 border border-purple-200 dark:border-purple-800 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Case Notes</p>
                            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{notes.length}</p>
                            <p className="text-xs text-purple-500 mt-1">
                                Last note: {notes.length > 0 ? new Date(notes[0].createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div className="bg-purple-500 rounded-full p-3">
                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Age Card */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/40 rounded-lg p-6 border border-orange-200 dark:border-orange-800 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-300">Case Age</p>
                            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                                {daysElapsed}
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

            {/* Visual Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* Health Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Case Health Status
                    </h3>
                    <div className="h-64 flex items-center justify-center relative">
                        <Doughnut data={healthChartData} options={chartOptions} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center mt-8">
                                <span className="text-3xl font-bold text-gray-800 dark:text-white">{healthMetrics.percentage}%</span>
                                <p className="text-xs text-gray-500">Readiness</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-600 dark:text-gray-400">
                        <div className={`p-1 rounded ${documents.length > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Docs</div>
                        <div className={`p-1 rounded ${caseData.assignedJudge ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Judge</div>
                        <div className={`p-1 rounded ${caseData.hearingDate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Hearing</div>
                    </div>
                </div>

                {/* Timeline Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Duration Expectancy
                    </h3>
                    <div className="h-64">
                        <Bar data={progressChartData} options={{
                            ...chartOptions,
                            indexAxis: 'y', // Horizontal bar
                            plugins: {
                                ...chartOptions.plugins,
                                legend: { display: false }
                            }
                        }} />
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {daysElapsed >= estimatedDays
                                ? <span className="text-red-500 font-bold">Overdue by {daysElapsed - estimatedDays} days</span>
                                : <span className="text-green-600 font-medium">On track: {estimatedDays - daysElapsed} days remaining</span>
                            }
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CaseAnalytics;
