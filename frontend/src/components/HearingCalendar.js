import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HearingCalendar = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('dayGridMonth');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchHearings();

        // Set up auto-refresh every 30 seconds to pick up new hearings
        const refreshInterval = setInterval(() => {
            fetchHearings();
        }, 30000);

        // Cleanup interval on unmount
        return () => clearInterval(refreshInterval);
    }, []);

    const fetchHearings = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/cases/hearings');
            const calendarEvents = response.data.map(caseData => ({
                id: caseData.id,
                title: `${caseData.caseNumber}: ${caseData.title}`,
                start: caseData.hearingDate,
                backgroundColor: getPriorityColor(caseData.priority),
                borderColor: getCourtLevelColor(caseData.courtLevel),
                extendedProps: {
                    caseNumber: caseData.caseNumber,
                    priority: caseData.priority,
                    status: caseData.status,
                    courtLevel: caseData.courtLevel,
                    assignedJudge: caseData.assignedJudge,
                    caseType: caseData.caseType
                }
            }));
            setEvents(calendarEvents);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching hearings:', error);
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        if (priority >= 8) return '#DC2626'; // Red - High priority
        if (priority >= 5) return '#F59E0B'; // Orange - Medium priority
        return '#10B981'; // Green - Low priority
    };

    const getCourtLevelColor = (courtLevel) => {
        switch (courtLevel) {
            case 'DISTRICT':
                return '#3B82F6'; // Blue
            case 'HIGH':
                return '#8B5CF6'; // Purple
            case 'SUPREME':
                return '#EC4899'; // Pink
            default:
                return '#6B7280'; // Gray
        }
    };

    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
        setShowModal(true);
    };

    const handleDateClick = (arg) => {
        // Could add functionality to schedule a hearing on this date
        console.log('Date clicked:', arg.dateStr);
    };

    const handleViewCase = () => {
        if (selectedEvent) {
            navigate(`/cases/${selectedEvent.id}`);
            setShowModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600 dark:text-gray-300">Loading calendar...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hearing Calendar</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        View all scheduled hearings across all cases
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchHearings}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        title="Refresh calendar data"
                    >
                        <svg
                            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                    <select
                        value={view}
                        onChange={(e) => setView(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="dayGridMonth">Month View</option>
                        <option value="timeGridWeek">Week View</option>
                        <option value="timeGridDay">Day View</option>
                        <option value="listWeek">List View</option>
                    </select>
                </div>
            </div>

            {/* Legend */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legend</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority Levels:</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">High Priority (8-10)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Medium Priority (5-7)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Low Priority (1-4)</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Court Levels (Border Color):</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border-2" style={{ borderColor: '#3B82F6' }}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">District Court</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border-2" style={{ borderColor: '#8B5CF6' }}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">High Court</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border-2" style={{ borderColor: '#EC4899' }}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Supreme Court</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView={view}
                    events={events}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                    }}
                    height="auto"
                    eventDisplay="block"
                    displayEventTime={true}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: true
                    }}
                    slotMinTime="08:00:00"
                    slotMaxTime="18:00:00"
                    allDaySlot={false}
                    nowIndicator={true}
                    // Dark mode styling
                    dayCellClassNames="dark:bg-slate-800 dark:text-white"
                    viewClassNames="dark:bg-slate-800"
                />
            </div>

            {/* Event Detail Modal */}
            {showModal && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hearing Details</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Case Number</label>
                                    <p className="text-gray-900 dark:text-white font-semibold">{selectedEvent.extendedProps.caseNumber}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</label>
                                    <p className="text-gray-900 dark:text-white">{selectedEvent.title.split(': ')[1]}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Hearing Date & Time</label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(selectedEvent.start).toLocaleString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</label>
                                        <p className="text-gray-900 dark:text-white font-semibold">
                                            <span
                                                className="inline-block px-2 py-1 rounded text-white text-sm"
                                                style={{ backgroundColor: getPriorityColor(selectedEvent.extendedProps.priority) }}
                                            >
                                                {selectedEvent.extendedProps.priority}/10
                                            </span>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Court Level</label>
                                        <p className="text-gray-900 dark:text-white font-semibold">
                                            <span
                                                className="inline-block px-2 py-1 rounded text-white text-sm"
                                                style={{ backgroundColor: getCourtLevelColor(selectedEvent.extendedProps.courtLevel) }}
                                            >
                                                {selectedEvent.extendedProps.courtLevel}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Case Type</label>
                                    <p className="text-gray-900 dark:text-white">{selectedEvent.extendedProps.caseType}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                                    <p className="text-gray-900 dark:text-white">{selectedEvent.extendedProps.status}</p>
                                </div>

                                {selectedEvent.extendedProps.assignedJudge && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Judge</label>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedEvent.extendedProps.assignedJudge.firstName} {selectedEvent.extendedProps.assignedJudge.lastName}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleViewCase}
                                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    View Case Details
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Hearings</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{events.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">High Priority</h3>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                        {events.filter(e => e.extendedProps.priority >= 8).length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">This Week</h3>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                        {events.filter(e => {
                            const eventDate = new Date(e.start);
                            const now = new Date();
                            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                            return eventDate >= now && eventDate <= weekFromNow;
                        }).length}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HearingCalendar;
