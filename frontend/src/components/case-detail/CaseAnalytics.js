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
                    'rgba(74, 222, 128, 1)', // Light Emerald green
                    'rgba(243, 244, 246, 1)', // Gray-100 for pending
                ],
                hoverBackgroundColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(229, 231, 235, 1)',
                ],
                borderWidth: 0,
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
                    'rgba(251, 146, 60, 0.9)', // Orange
                    'rgba(251, 146, 60, 0.9)', // Orange
                ],
                borderWidth: 0,
                barThickness: 40,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                enabled: true
            }
        }
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Horizontal bar
        scales: {
            x: {
                grid: {
                    drawBorder: false,
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: { size: 10 }
                }
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: { size: 11 }
                }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                    <svg className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Case Analytics & Insights
                </h2>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportReport}
                        disabled={actionLoading}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {actionLoading ? 'Generating...' : 'Export Report'}
                    </button>
                    <button
                        onClick={handleGeneratePDF}
                        disabled={actionLoading}
                        className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {actionLoading ? 'Generating...' : 'Generate PDF'}
                    </button>
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Priority Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800 transition-colors">
                    <div className="flex items-start justify-between">
                        <div className="w-full mr-4">
                            <p className="text-sm font-semibold text-blue-500 dark:text-blue-300 mb-1">Priority Level</p>
                            <p className="text-3xl font-bold text-slate-800 dark:text-blue-100">{caseData.priority}/10</p>
                            <div className="mt-3 w-3/4">
                                <div className="w-full bg-blue-200/60 rounded-full h-1.5">
                                    <div
                                        className="bg-blue-500 h-1.5 rounded-full"
                                        style={{ width: `${(caseData.priority / 10) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-500 rounded-full p-2.5 shadow-sm mt-1">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Documents Card */}
                <div className="bg-emerald-50 dark:bg-green-900/20 rounded-xl p-5 border border-emerald-100 dark:border-green-800 transition-colors">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-emerald-500 dark:text-green-300 mb-1">Documents</p>
                            <p className="text-3xl font-bold text-slate-800 dark:text-green-100">{documents.length}</p>
                            <p className="text-xs font-medium text-emerald-600 mt-2">
                                Avg: {(documents.length / 1).toFixed(0)} per case
                            </p>
                        </div>
                        <div className="bg-emerald-500 rounded-full p-2.5 shadow-sm mt-1">
                            <svg className="h-5 w-5 text-white" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Notes Card */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800 transition-colors">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-purple-500 dark:text-purple-300 mb-1">Case Notes</p>
                            <p className="text-3xl font-bold text-slate-800 dark:text-purple-100">{notes.length}</p>
                            <p className="text-xs font-medium text-purple-600 mt-2">
                                Last note: {notes.length > 0 ? new Date(notes[0].createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div className="bg-purple-500 rounded-full p-2.5 shadow-sm mt-1">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Age Card */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5 border border-orange-100 dark:border-orange-800 transition-colors">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-orange-500 dark:text-orange-300 mb-1">Case Age</p>
                            <p className="text-3xl font-bold text-slate-800 dark:text-orange-100">
                                {daysElapsed}
                            </p>
                            <p className="text-xs font-medium text-orange-600 mt-2">days since filing</p>
                        </div>
                        <div className="bg-orange-500 rounded-full p-2.5 shadow-sm mt-1">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* Health Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                        <svg className="h-5 w-5 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Case Health Status
                    </h3>
                    <div className="h-56 flex items-center justify-center relative">
                        <Doughnut data={healthChartData} options={doughnutOptions} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-[-20px]">
                            <div className="text-center">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white block tracking-tight">{healthMetrics.percentage}%</span>
                                <span className="text-xs font-medium text-gray-500 mt-1">Readiness</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-between gap-3 text-center text-xs font-medium">
                        <div className={`flex-1 py-1.5 rounded-lg ${documents.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>Docs</div>
                        <div className={`flex-1 py-1.5 rounded-lg ${caseData.assignedJudge ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>Judge</div>
                        <div className={`flex-1 py-1.5 rounded-lg ${caseData.hearingDate ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>Hearing</div>
                    </div>
                </div>

                {/* Timeline Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                        <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Duration Expectancy
                    </h3>
                    <div className="h-56 flex-grow">
                        <Bar data={progressChartData} options={barOptions} />
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm">
                            {daysElapsed >= estimatedDays
                                ? <span className="text-red-500 font-semibold">Overdue by {daysElapsed - estimatedDays} days</span>
                                : <span className="text-emerald-500 font-semibold">On track: {estimatedDays - daysElapsed} days remaining</span>
                            }
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CaseAnalytics;

