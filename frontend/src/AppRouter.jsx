import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import CaseList from './pages/CaseList';
import Dashboard from './pages/Dashboard';
import HearingsCalendar from './pages/HearingsCalendar';
import ThemeToggle from './ui/ThemeToggle';
import ThemeProvider from './ui/ThemeContext.jsx';

const AppShell = ({ children }) => (
  <div>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
      <nav>
        <Link to="/dashboard" style={{ marginRight: 12 }}>Dashboard</Link>
        <Link to="/cases" style={{ marginRight: 12 }}>Cases</Link>
        <Link to="/hearings" style={{ marginRight: 12 }}>Hearings</Link>
      </nav>
      <ThemeToggle />
    </header>
    <main>{children}</main>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AppShell />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cases" element={<CaseList />} />
        <Route path="/hearings" element={<HearingsCalendar />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
