import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarLink = ({ to, icon, label, badge, active }) => (
    <Link
        to={to}
        className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${active
            ? 'bg-primary-600/10 text-primary-600 dark:text-primary-400 font-bold'
            : 'text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-50 dark:hover:bg-surface-800'
            }`}
    >
        {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary-600 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"></div>
        )}
        <div className="flex items-center space-x-3.5">
            <div className={`transition-transform group-hover:scale-110 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-200'}`}>
                {icon}
            </div>
            <span className="text-sm tracking-tight">{label}</span>
        </div>
        {badge && (
            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg ${active ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
                }`}>
                {badge}
            </span>
        )}
    </Link>
);

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return null;

    return (
        <aside className="w-72 flex-shrink-0 flex flex-col h-screen border-r border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 z-20">
            {/* Brand Header */}
            <div className="p-8 pb-10">
                <Link to="/dashboard" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/20 group-hover:rotate-6 transition-all duration-500">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-surface-950 dark:text-white leading-none">DCM</h1>
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-600 dark:text-primary-500 mt-1.5">Intelligence</p>
                    </div>
                </Link>
            </div>

            {/* Navigation Flow */}
            <div className="flex-1 px-4 space-y-8 overflow-y-auto modern-scrollbar pb-10">
                <div>
                    <h3 className="px-5 mb-4 text-[10px] uppercase font-black tracking-[0.15em] text-surface-400">Core Directory</h3>
                    <div className="space-y-1.5">
                        <SidebarLink
                            to="/dashboard"
                            active={location.pathname === '/dashboard'}
                            label="System Overview"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>}
                        />
                        <SidebarLink
                            to="/cases"
                            active={location.pathname.startsWith('/cases')}
                            label="Case Repository"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                        />
                        <SidebarLink
                            to="/calendar"
                            active={location.pathname === '/calendar'}
                            label="Hearing Matrix"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        />
                    </div>
                </div>

                {(user.role === 'ADMIN' || user.role === 'JUDGE') && (
                    <div>
                        <h3 className="px-5 mb-4 text-[10px] uppercase font-black tracking-[0.15em] text-surface-400">Legal Assets</h3>
                        <div className="space-y-1.5">
                            <SidebarLink
                                to="/documents"
                                active={location.pathname.startsWith('/documents')}
                                label="Secure Vault"
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                            />
                            <SidebarLink
                                to="/templates"
                                active={location.pathname === '/templates'}
                                label="Workflow Templates"
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                            />
                        </div>
                    </div>
                )}

                {user.role === 'ADMIN' && (
                    <div>
                        <h3 className="px-5 mb-4 text-[10px] uppercase font-black tracking-[0.15em] text-surface-400">Governance</h3>
                        <div className="space-y-1.5">
                            <SidebarLink
                                to="/users"
                                active={location.pathname === '/users'}
                                label="Access Control"
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                            />
                            <SidebarLink
                                to="/reports"
                                active={location.pathname === '/reports'}
                                label="Analytics Engine"
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-6 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-800">
                {(user.role === 'CLERK' || user.role === 'ADMIN') ? (
                    <Link
                        to="/cases/new"
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[20px] font-black text-sm transition-all shadow-xl shadow-primary-500/20 active:scale-95 group"
                    >
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>NEW FILING</span>
                    </Link>
                ) : (
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 font-black">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-surface-900 dark:text-white truncate">{user.username}</p>
                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{user.role}</p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
