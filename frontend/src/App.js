import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth, ThemeProvider } from './context/AuthContext';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CaseList from './components/CaseList';
import CaseForm from './components/CaseForm';
import CaseDetail from './components/CaseDetail';
import Navigation from './components/Navigation';
import UserManagement from './components/UserManagement';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
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
  // Create MUI theme
  const muiTheme = createTheme({
    palette: {
      primary: {
        main: '#2563eb', // Blue-600 to match Tailwind
      },
      secondary: {
        main: '#7c3aed', // Purple-600 for notes
      },
      background: {
        default: '#f8fafc', // Slate-50
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // Disable uppercase
            borderRadius: '8px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Navigation />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 transition-colors duration-300">
              <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
                    <ProtectedRoute>
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
                    <ProtectedRoute>
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
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
