import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import CaseList from './pages/CaseList';
import Dashboard from './pages/Dashboard';
import HearingsCalendar from './pages/HearingsCalendar';
import ThemeToggle from './ui/ThemeToggle';
import ThemeProvider from './ui/ThemeContext.jsx';
import NavBar from './ui/layout/NavBar.jsx';
import CaseDetail from './pages/CaseDetail.jsx';
// Card component available for potential future usage

const AppShell = ({ children }) => (
  <div>
    <header style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <NavBar />
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
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/hearings" element={<HearingsCalendar />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
