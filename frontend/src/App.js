import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ThemeProvider } from './context/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CaseList from './components/CaseList';
import CaseForm from './components/CaseForm';
import CaseDetail from './components/CaseDetail';
import Reports from './components/Reports';
import Navigation from './components/Navigation';
import UserManagement from './components/UserManagement';
import HearingCalendar from './components/HearingCalendar';
import CaseFlowVisualization from './components/CaseFlowVisualization';
import CaseTemplatesChecklists from './components/CaseTemplatesChecklists';
import AdvancedDocumentManager from './components/AdvancedDocumentManager';

// Layout Component
const AppLayout = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navigation />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 scroll-smooth">
          <div className="max-w-[1600px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-surface-500 font-medium">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JUDGE', 'CLERK', 'ADVOCATE']}>
                    <CaseList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases/new"
                element={
                  <ProtectedRoute allowedRoles={['CLERK', 'ADMIN']}>
                    <CaseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JUDGE', 'CLERK', 'ADVOCATE']}>
                    <CaseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JUDGE']}>
                    <CaseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JUDGE', 'CLERK']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JUDGE', 'CLERK']}>
                    <HearingCalendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flow-visualization"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JUDGE']}>
                    <CaseFlowVisualization />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/templates"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JUDGE', 'CLERK']}>
                    <CaseTemplatesChecklists />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents/:caseId?"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JUDGE', 'CLERK']}>
                    <AdvancedDocumentManager />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
