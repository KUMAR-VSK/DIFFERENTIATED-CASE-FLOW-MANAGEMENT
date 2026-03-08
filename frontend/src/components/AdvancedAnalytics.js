import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import BASE_URL from '../config/api';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const AdvancedAnalytics = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30'); // days

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            const credentials = btoa(`${user.username}:${localStorage.getItem('password')}`);
            const response = await axios.get(BASE_URL + '/api/analytics/advanced', {
                headers: { 'Authorization': `Basic ${credentials}` },
                params: { period }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
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

    // Status Distribution Doughnut Chart
    const statusChartData = {
        labels: Object.keys(analytics?.statusDistribution || {}),
        datasets: [{
            label: 'Cases by Status',
            data: Object.values(analytics?.statusDistribution || {}),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',   // Blue
                'rgba(234, 179, 8, 0.8)',    // Yellow
                'rgba(168, 85, 247, 0.8)',   // Purple
                'rgba(249, 115, 22, 0.8)',   // Orange
                'rgba(34, 197, 94, 0.8)',    // Green
                'rgba(107, 114, 128, 0.8)',  // Gray
                'rgba(239, 68, 68, 0.8)'     // Red
            ],
            borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(234, 179, 8, 1)',
                'rgba(168, 85, 247, 1)',
                'rgba(249, 115, 22, 1)',
                'rgba(34, 197, 94, 1)',
                'rgba(107, 114, 128, 1)',
                'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 2
        }]
    };

    // Case Type Bar Chart
    const caseTypeChartData = {
        labels: Object.keys(analytics?.caseTypeDistribution || {}),
        datasets: [{
            label: 'Number of Cases',
            data: Object.values(analytics?.caseTypeDistribution || {}),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2
        }]
    };

    // Priority Distribution Chart
    const priorityChartData = {
        labels: ['Priority 1-3', 'Priority 4-6', 'Priority 7-10'],
        datasets: [{
            label: 'Cases by Priority Range',
            data: [
                analytics?.priorityDistribution?.low || 0,
                analytics?.priorityDistribution?.medium || 0,
                analytics?.priorityDistribution?.high || 0
            ],
            backgroundColor: [
                'rgba(34, 197, 94, 0.6)',
                'rgba(234, 179, 8, 0.6)',
                'rgba(239, 68, 68, 0.6)'
            ],
            borderColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(234, 179, 8, 1)',
                'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 2
        }]
    };

    // Trend Line Chart (cases over time)
    const trendChartData = {
        labels: analytics?.trend?.labels || [],
        datasets: [
            {
                label: 'Filed Cases',
                data: analytics?.trend?.filed || [],
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Completed Cases',
                data: analytics?.trend?.completed || [],
                borderColor: 'rgba(34, 197, 94, 1)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 12,
                        family: 'Inter, sans-serif'
                    }
                }
            },
            title: {
                display: false
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
                    📊 Advanced Analytics
                </h1>
                <p className="text-surface-600 dark:text-surface-400">
                    Comprehensive insights and visualizations for case management
                </p>
            </div>

            {/* Period Selector */}
            <div className="mb-6 flex items-center gap-4">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Time Period:
                </label>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="365">Last Year</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Cases</p>
                            <p className="text-3xl font-bold mt-2">{analytics?.totalCases || 0}</p>
                        </div>
                        <div className="text-4xl opacity-20">📋</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Completed</p>
                            <p className="text-3xl font-bold mt-2">{analytics?.completedCases || 0}</p>
                        </div>
                        <div className="text-4xl opacity-20">✅</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">In Progress</p>
                            <p className="text-3xl font-bold mt-2">{analytics?.inProgressCases || 0}</p>
                        </div>
                        <div className="text-4xl opacity-20">🔄</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">High Priority</p>
                            <p className="text-3xl font-bold mt-2">{analytics?.highPriorityCases || 0}</p>
                        </div>
                        <div className="text-4xl opacity-20">⚠️</div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution */}
                <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4">
                        Status Distribution
                    </h3>
                    <div className="h-80 flex items-center justify-center">
                        <Doughnut data={statusChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Case Type Distribution */}
                <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4">
                        Cases by Type
                    </h3>
                    <div className="h-80">
                        <Bar data={caseTypeChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4">
                        Priority Distribution
                    </h3>
                    <div className="h-80 flex items-center justify-center">
                        <Doughnut data={priorityChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Case Trend */}
                <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4">
                        Case Trend Over Time
                    </h3>
                    <div className="h-80">
                        <Line data={trendChartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Court Level Comparison */}
            <div className="mt-8 bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4">
                    Court Level Distribution
                </h3>
                <div className="h-96">
                    <Bar
                        data={{
                            labels: Object.keys(analytics?.courtLevelDistribution || {}),
                            datasets: [{
                                label: 'Cases by Court Level',
                                data: Object.values(analytics?.courtLevelDistribution || {}),
                                backgroundColor: [
                                    'rgba(34, 197, 94, 0.6)',
                                    'rgba(249, 115, 22, 0.6)',
                                    'rgba(239, 68, 68, 0.6)'
                                ],
                                borderColor: [
                                    'rgba(34, 197, 94, 1)',
                                    'rgba(249, 115, 22, 1)',
                                    'rgba(239, 68, 68, 1)'
                                ],
                                borderWidth: 2
                            }]
                        }}
                        options={{
                            ...chartOptions,
                            indexAxis: 'y', // Horizontal bar chart
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdvancedAnalytics;
