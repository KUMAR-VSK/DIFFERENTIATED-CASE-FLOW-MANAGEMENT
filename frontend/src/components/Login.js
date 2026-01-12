import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Chip
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Gavel,
  AdminPanelSettings,
  AssignmentInd
} from '@mui/icons-material';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(credentials.username, credentials.password);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Judge', username: 'judge1', password: 'judge123' },
    { role: 'Clerk', username: 'clerk1', password: 'clerk123' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="mt-8 text-center text-4xl font-bold text-gray-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-3 text-center text-lg text-gray-600 font-medium">
            Differentiated Case Flow Management System
          </p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto"></div>
        </div>

        <Card sx={{ mt: 4, backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)' }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  autoComplete="username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(8px)',
                    }
                  }}
                />

                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(8px)',
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? null : <LoginIcon />}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                    boxShadow: '0 3px 5px 2px rgba(99, 102, 241, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                    }
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Demo Accounts</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {demoCredentials.map((cred, index) => (
              <div
                key={cred.role}
                className="group bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-5 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-3 group-hover:scale-110 transition-transform duration-200">
                  {cred.role === 'Admin' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                  {cred.role === 'Judge' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  )}
                  {cred.role === 'Clerk' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <div className="font-semibold text-gray-900 mb-2 text-sm">
                  {cred.role}
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">User:</span> {cred.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Pass:</span> {cred.password}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCredentials({ username: cred.username, password: cred.password });
                  }}
                  className="mt-3 w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 text-xs font-medium py-1.5 px-3 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  Use These
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">
            Click "Use These" to auto-fill the form
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
